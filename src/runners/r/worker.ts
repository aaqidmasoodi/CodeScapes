/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/no-explicit-any */

// WebR types imported from CDN dynamically

// console.log("!!! R WORKER SCRIPT LOADED !!!")

// let webr: WebR | null = null
// let loadPromise: Promise<WebR> | null = null

// const loadWebR = async (): Promise<WebR> => {
//     console.log("[R Worker] loadWebR called")
//     if (webr) return webr
//     if (loadPromise) return loadPromise
// import type { WebR as WebRType } from "@r-wasm/webr"

console.log("!!! R WORKER SCRIPT LOADED !!!")

let webr: any | null = null
let loadPromise: Promise<any> | null = null

const loadWebR = async (): Promise<any> => {
  console.log("[R Worker] loadWebR called")
  if (webr) return webr
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    console.log("[R Worker] Starting init...")
    postMessage({ type: "STATUS", payload: "Loading WebR..." })

    try {
      console.log("[R Worker] Importing WebR from CDN...")
      // @ts-expect-error - CDN import
      const { WebR } = await import("https://webr.r-wasm.org/latest/webr.mjs")

      // 1. Try default (Automatic: SAB -> SW)
      console.log("[R Worker] Attempting default init...")
      webr = new WebR({
        // Default CDN URL is handled by the module itself usually
      })
      await webr!.init()

      postMessage({ type: "STATUS", payload: "Ready (Automatic)" })
      return webr!
    } catch (e) {
      console.warn("[R Worker] WebR init failed (Automatic), retrying with PostMessage...", e)
      // 2. Fallback to PostMessage (No SAB/SW needed)
      try {
        // Re-import to be safe or reuse? Reuse is fine.
        // @ts-expect-error - CDN import
        const { WebR, ChannelType } = await import("https://webr.r-wasm.org/latest/webr.mjs")

        webr = new WebR({
          channelType: ChannelType.PostMessage,
        })
        await webr!.init()
        postMessage({ type: "STATUS", payload: "Ready (PostMessage)" })
        return webr!
      } catch (error: any) {
        console.error("[R Worker] Fatal Error", error)
        postMessage({ type: "ERROR", payload: `Failed to load WebR: ${error.message}` })
        throw error
      }
    }
  })()

  return loadPromise
}

let readyPromise: Promise<void> = Promise.resolve()

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data
  console.log("[R Worker] Received message:", type)

  if (type === "INIT") {
    const runInit = async () => {
      try {
        await loadWebR()
        postMessage({ type: "DidRun" })
      } catch {
        // Error already reported via postMessage
      }
    }
    readyPromise = readyPromise.then(runInit)
    await readyPromise
  }

  if (type === "RUN") {
    try {
      console.log("[R Worker] Processing RUN...")
      await readyPromise
      const { files, entryPoint } = payload
      const r = await loadWebR()

      if (!files || !Array.isArray(files)) {
        throw new Error("No files provided")
      }

      // Mount or write files
      for (const file of files) {
        if (file.language === "folder") {
          try {
            await r.FS.mkdir(file.name)
          } catch {
            /* ignore if exists */
          }
          continue
        }

        // Ensure parent dirs
        const parts = file.name.split("/")
        if (parts.length > 1) {
          let currentPath = ""
          for (let i = 0; i < parts.length - 1; i++) {
            currentPath += (i === 0 ? "" : "/") + parts[i]
            try {
              await r.FS.mkdir(currentPath)
            } catch {
              /* ignore if exists */
            }
          }
        }

        console.log(`[R Worker] Writing file: ${file.name} (Length: ${file.content.length})`)
        const encoder = new TextEncoder()
        const data = encoder.encode(file.content)
        await r.FS.writeFile(file.name, data)
      }

      // Verify Filesystem state
      try {
        // Check if data.csv exists and has content
        if (files.find((f: any) => f.name === "data.csv")) {
          const check = await r.evalR(`
                        if (file.exists("data.csv")) {
                            lines <- readLines("data.csv", n=5)
                            paste(lines, collapse="\\n")
                        } else {
                            "FILE_NOT_FOUND"
                        }
                    `)
          console.log("[R Worker] data.csv content check:\n", await check.toJs().values)
        }
      } catch (e) {
        console.error("[R Worker] FS check failed", e)
      }

      // 3. Run Entry Point
      postMessage({ type: "STATUS", payload: `Running ${entryPoint}...` })
      const mainFile = files.find((f: any) => f.name === entryPoint)
      if (!mainFile) throw new Error(`Entry point ${entryPoint} not found`)

      // Simple eval with SVG plot capture wrapper
      const shelter = await new r.Shelter()
      try {
        // Wrap execution with SVG device setup (more portable than PNG in WebR)
        const wrappedCode = `
                    # Setup SVG device to capture plots
                    svg("__plot_%d.svg", width = 8, height = 6)
                    tryCatch({
                        ${mainFile.content}
                    }, finally = {
                        # Close all graphics devices
                        graphics.off()
                    })
                `

        const result = await shelter.captureR(wrappedCode, {
          withAutoprint: true,
          captureStreams: true,
          captureConditions: true,
        })

        // Output stdout/stderr
        result.output.forEach((line: any) => {
          if (line.type === "stdout") postMessage({ type: "OUTPUT", payload: line.data + "\n" })
          if (line.type === "stderr") postMessage({ type: "ERROR", payload: line.data + "\n" })
        })
      } finally {
        await shelter.purge()

        // 4. Capture plots (SVG files)
        try {
          // List ALL files to debug - toJs() returns {type, names, values}
          const allFilesProxy = await r.evalR(`list.files()`)
          const allFilesResult = (await allFilesProxy.toJs()) as any
          const allFiles = allFilesResult?.values || []
          console.log("[R Worker] All files after execution:", allFiles)

          const plotFilesProxy = await r.evalR(`list.files(pattern = "^__plot_.*\\\\.svg$")`)
          const plotFilesResult = (await plotFilesProxy.toJs()) as any
          const plotList = plotFilesResult?.values || []

          console.log("[R Worker] Found SVG plot files:", plotList)

          for (const plotFile of plotList) {
            // Read SVG content directly (it's text!)
            const svgProxy = await r.evalR(`paste(readLines("${plotFile}"), collapse = "\\n")`)
            const svgResult = (await svgProxy.toJs()) as any
            const svgContent = svgResult?.values?.[0] || ""

            if (svgContent && svgContent.length > 100) {
              // Check if SVG has actual plot content (not just empty background)
              // An empty SVG from R will only have <defs>, <rect> for background, <g> groups
              // Real plots have <line>, <polyline>, <path>, <polygon>, <circle>, <text> drawing elements
              const hasPlotContent = /<(line|polyline|path|polygon|circle|text)\b/i.test(svgContent)

              if (!hasPlotContent) {
                console.log("[R Worker] Skipping empty plot file (no drawing elements)")
                await r.evalR(`file.remove("${plotFile}")`)
                continue
              }

              // Make SVG responsive and remove background border
              let responsiveSvg = svgContent.replace(
                /<svg /,
                '<svg style="width: 100%; height: auto; display: block; border: none;" '
              )
              // Remove the stroke from any background rect (R adds a border by default)
              responsiveSvg = responsiveSvg.replace(
                /(<rect[^>]*style="[^"]*)(stroke:\s*#[0-9A-Fa-f]+;?)/g,
                "$1stroke: none;"
              )
              // Also try removing stroke attribute directly
              responsiveSvg = responsiveSvg.replace(
                /(<rect[^>]*width="100%"[^>]*height="100%"[^>]*)(stroke="[^"]*")/g,
                '$1stroke="none"'
              )
              postMessage({
                type: "PREVIEW_HTML",
                payload: `<div style="width: 100%; max-width: 600px; margin: 0 auto;">${responsiveSvg}</div>`,
              })
            }

            // cleanup
            await r.evalR(`file.remove("${plotFile}")`)
          }
        } catch (e) {
          console.warn("[R Worker] Plot capture failed", e)
        }
      }
    } catch (error: any) {
      console.error("[R Worker] Run Error:", error)
      postMessage({ type: "ERROR", payload: error.message || String(error) })
    } finally {
      postMessage({ type: "DidRun" })
    }
  }
}

export {}
