/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/no-explicit-any */

// Pyodide Worker

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<any>
  loadPackage: (packages: string[]) => Promise<void>
  FS: {
    writeFile: (path: string, content: string | Uint8Array, options?: any) => void
    mkdir: (path: string) => void
    readdir: (path: string) => string[]
  }
  setStdout: (options: { batched: (msg: string) => void }) => void
  setStderr: (options: { batched: (msg: string) => void }) => void
  globals: any
}

let pyodide: PyodideInterface | null = null
let loadPromise: Promise<PyodideInterface> | null = null

const loadPyodide = async (): Promise<PyodideInterface> => {
  if (pyodide) return pyodide
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    postMessage({ type: "STATUS", payload: "Loading Pyodide..." })

    try {
      const { loadPyodide: pyodideLoader } =
        await import("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.mjs")

      pyodide = await pyodideLoader({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
      })

      if (!pyodide) throw new Error("Failed to initialize Pyodide")

      pyodide.setStdout({
        batched: (msg: string) => {
          postMessage({ type: "OUTPUT", payload: msg })
        },
      })
      pyodide.setStderr({
        batched: (msg: string) => {
          postMessage({ type: "ERROR", payload: msg })
        },
      })

      postMessage({ type: "STATUS", payload: "Loading libraries..." })
      try {
        await pyodide.loadPackage(["micropip"])
      } catch {
        await pyodide.loadPackage(["micropip"])
      }

      // Verify micropip loading
      await pyodide.runPythonAsync(`
        import sys
        import importlib
        import time
        for i in range(5):
            try:
                importlib.invalidate_caches()
                import micropip
                break
            except ImportError:
                if i == 4: raise
                time.sleep(0.2)
      `)

      postMessage({ type: "STATUS", payload: "Ready" })
      return pyodide
    } catch (error: any) {
      postMessage({ type: "ERROR", payload: `Failed to load Pyodide: ${error.message}` })
      throw error
    }
  })()

  return loadPromise
}

let readyPromise: Promise<void> = Promise.resolve()
let sharedBuffer: SharedArrayBuffer | null = null
let sharedArray: Int32Array | null = null

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data

  if (type === "INIT") {
    if (payload.sharedBuffer) {
      sharedBuffer = payload.sharedBuffer
      sharedArray = new Int32Array(payload.sharedBuffer)
    }

    const runInit = async () => {
      const py = await loadPyodide()

      // Define blocking input function in JS
      // Using self explicitly to attach to global scope for Pyodide access
      ;(self as any).wait_for_input = () => {
        if (!sharedArray || !sharedBuffer) return ""

        // 0 = Initial/Waiting, 1 = Ready
        Atomics.store(sharedArray, 0, 0)

        // Wait until index 0 becomes non-zero (triggered by main thread)
        Atomics.wait(sharedArray, 0, 0)

        // Read text length from index 1
        const len = sharedArray[1]

        // Read bytes
        const bytes = new Uint8Array(sharedBuffer, 8, len)
        // Create a copy of the slice to avoid SharedArrayBuffer issues with TextDecoder
        const bytesCopy = new Uint8Array(bytes)
        const decoder = new TextDecoder()
        return decoder.decode(bytesCopy)
      }

      // Install initial dependencies
      if (
        payload.dependencies &&
        Array.isArray(payload.dependencies) &&
        payload.dependencies.length > 0
      ) {
        postMessage({
          type: "STATUS",
          payload: `Installing ${payload.dependencies.length} packages...`,
        })
        try {
          await py.runPythonAsync(`
            import micropip
            await micropip.install(${JSON.stringify(payload.dependencies)})
          `)
          postMessage({ type: "STATUS", payload: "Packages installed" })
        } catch (err: any) {
          postMessage({
            type: "ERROR",
            payload: `Failed to install dependencies: ${err.message}`,
          })
        }
      }
      postMessage({ type: "DidRun" })
    }

    readyPromise = readyPromise.then(runInit)
    await readyPromise
  }

  if (type === "INSTALL") {
    const runInstall = async () => {
      const py = await loadPyodide()
      const packageName = payload
      try {
        postMessage({ type: "STATUS", payload: `Installing ${packageName}...` })
        await py.runPythonAsync(`
            import micropip
            await micropip.install("${packageName}")
            `)
        postMessage({ type: "INSTALL_SUCCESS", payload: packageName })
      } catch (err: any) {
        postMessage({ type: "ERROR", payload: `Failed to install ${packageName}: ${err.message}` })
        postMessage({
          type: "INSTALL_ERROR",
          payload: { pkg: packageName, error: err.message },
        })
      }
    }
    readyPromise = readyPromise.then(runInstall)
    await readyPromise
  }

  if (type === "RUN") {
    try {
      await readyPromise
      const { files, entryPoint } = payload
      const py = await loadPyodide()

      if (!files || !Array.isArray(files)) {
        throw new Error("No files provided")
      }

      // 0. Reset Environment
      await py.runPythonAsync(`
        for name in list(globals().keys()):
          if name not in ['__name__', '__doc__', '__package__', '__loader__', '__spec__', '__annotations__', '__builtins__', 'micropip']:
            del globals()[name]
      `)

      // 0.5 Patch Input
      await py.runPythonAsync(`
        import builtins
        import js
        
        def _input(prompt=""):
            # Do NOT print prompt here to avoid buffering issues.
            # We send it to JS, which handles display and echoing.
            js.postMessage(js.Object.fromEntries([["type", "INPUT_REQUEST"], ["payload", prompt]]))
            return js.wait_for_input()
            
        builtins.input = _input
      `)

      // 1. Write files to Virtual FS
      postMessage({ type: "STATUS", payload: "Writing files..." })
      for (const file of files) {
        const parts = file.name.split("/")
        if (parts.length > 1) {
          let currentPath = ""
          for (let i = 0; i < parts.length - 1; i++) {
            currentPath += (i === 0 ? "" : "/") + parts[i]
            try {
              py.FS.mkdir(currentPath)
            } catch {
              // Ignore
            }
          }
        }
        py.FS.writeFile(file.name, file.content)
      }

      // 2. Run Entry Point
      postMessage({ type: "STATUS", payload: `Running ${entryPoint}...` })
      const mainFile = files.find((f: any) => f.name === entryPoint)
      if (!mainFile) throw new Error(`Entry point ${entryPoint} not found`)

      // Preamble for Matplotlib
      const preamble = `
import os
import base64
import io

try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt

    def show_hook(*args, **kwargs):
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        import js
        js.postMessage(js.Object.fromEntries([['type', 'IMAGE'], ['payload', img_str]]))
        plt.close()

    plt.show = show_hook
except ImportError:
    pass

try:
    import urllib3
    from urllib3.exceptions import InsecureRequestWarning
    urllib3.disable_warnings(InsecureRequestWarning)
except ImportError:
    pass
`
      await py.runPythonAsync(preamble)

      // Execute User Code
      const result = await py.runPythonAsync(mainFile.content)

      // Rich Output Check
      if (result && typeof result === "object") {
        try {
          if (result._repr_html_) {
            const html = result._repr_html_()
            postMessage({ type: "PREVIEW_HTML", payload: html })
          }
        } catch (e) {
          console.warn("Failed to extract rich repr", e)
        } finally {
          result.destroy?.()
        }
      }
    } catch (error: any) {
      postMessage({ type: "ERROR", payload: error.message || String(error) })
    } finally {
      postMessage({ type: "DidRun" })
    }
  }
}

export {}
