import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  memo,
  useState,
  useCallback,
} from "react"
import type { ScapeRunnerHandle, ScapeRunnerProps } from "../types"
import { Loader2, Box, MonitorPlay } from "lucide-react"

import Worker from "./worker.ts?worker"

export const RRunner = memo(
  forwardRef<ScapeRunnerHandle, ScapeRunnerProps>(({ files, onOutput }, ref) => {
    const workerRef = useRef<Worker | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isBusy, setIsBusy] = useState(false)
    const [previewItems, setPreviewItems] = useState<{ type: "image" | "html"; content: string }[]>(
      []
    )

    // Stable Log Helper - use ref to avoid re-creating worker on every render
    const onOutputRef = useRef(onOutput)
    useEffect(() => {
      onOutputRef.current = onOutput
    }, [onOutput])

    const log = useCallback(
      (type: "stdout" | "stderr" | "system", content: string) => {
        onOutputRef.current?.({
          id: crypto.randomUUID(),
          type,
          content,
          timestamp: Date.now(),
        })
      },
      [] // Empty deps - uses ref
    )

    // Init Worker - dependencies are now stable
    useEffect(() => {
      const worker = new Worker()
      workerRef.current = worker

      worker.onmessage = (e) => {
        const { type, payload } = e.data

        if (type === "STATUS") {
          log("system", payload)
          console.log("[R Worker]", payload)
        } else if (type === "OUTPUT") {
          log("stdout", payload)
        } else if (type === "ERROR") {
          log("stderr", payload)
          console.error("[R Worker Error]", payload)
        } else if (type === "PREVIEW_HTML") {
          setPreviewItems((prev) => [...prev, { type: "html", content: payload }])
        } else if (type === "DidRun") {
          setIsBusy(false)
        }
      }

      worker.onerror = (error) => {
        console.error("[R Worker Catch]", error)
        log("stderr", `Worker Error: ${error.message || "Failed to load worker"}`)
        setIsBusy(false)
      }

      worker.postMessage({ type: "INIT", payload: {} })

      return () => {
        worker.terminate()
      }
    }, [log]) // log is now stable

    // Run Logic
    const runR = useCallback(async () => {
      if (!workerRef.current) return

      setIsBusy(true)
      setPreviewItems([])

      // Find entry point
      const entryPoint = files.find((f) => f.name === "main.R")?.name || "main.R"

      workerRef.current.postMessage({
        type: "RUN",
        payload: {
          files: files.map((f) => ({
            name: f.name,
            content: f.content,
            language: f.language,
          })),
          entryPoint,
        },
      })

      // Failsafe: ensure isBusy is reset even if DidRun is never received
      setTimeout(() => {
        setIsBusy((current) => {
          if (current) {
            console.warn("[RRunner] Failsafe: resetting isBusy after timeout")
            return false
          }
          return current
        })
      }, 30000) // 30 second timeout
    }, [files])

    // Auto-run on file change (if Live) or initial load
    // Python runner debounces this. For now, simple effect.
    // Auto-run on file change (if Live) or initial load
    const previousFilesRef = useRef<string>("")

    useEffect(() => {
      // serialized check to avoid rapid re-runs if object references change but content doesn't
      const currentFilesHash = JSON.stringify(files.map((f) => ({ n: f.name, c: f.content })))

      if (currentFilesHash === previousFilesRef.current) {
        return
      }

      // Debounce
      const t = setTimeout(() => {
        previousFilesRef.current = currentFilesHash
        runR()
      }, 800) // Increased debounce to 800ms to catch startup flurries

      return () => clearTimeout(t)
    }, [files, runR])

    useImperativeHandle(ref, () => ({
      captureThumbnail: async () => null, // Todo
      stop: async () => {
        // Terminate and re-init
      },
      restart: async () => {
        runR()
      },
      installPackage: async () => ({ success: false, error: "Not implemented" }),
      runFile: async () => {},
      provideInput: async () => {},
    }))

    return (
      <div
        ref={containerRef}
        className="flex h-full flex-col border-l border-border bg-background text-foreground dark:border-zinc-800"
      >
        {/* Header Bar - matches Python preview */}
        <div className="flex h-10 items-center justify-between border-b border-zinc-200 bg-muted/20 px-2 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MonitorPlay className="h-3.5 w-3.5" />
            <span className="max-w-[200px] truncate">Preview (R)</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col overflow-auto p-4">
          {previewItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              {isBusy ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                  <p className="mt-2 text-xs">Running code...</p>
                </>
              ) : (
                <>
                  <Box className="h-8 w-8 opacity-20" />
                  <p className="mt-2 text-xs">No graphical output generated.</p>
                  <p className="mt-1 text-[10px] opacity-75">R plots will appear here.</p>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {previewItems.map((item, i) => (
                <div key={i} className="flex justify-center overflow-auto">
                  {item.type === "html" ? (
                    <div dangerouslySetInnerHTML={{ __html: item.content }} />
                  ) : (
                    <img
                      src={item.content}
                      alt={`Plot ${i + 1}`}
                      className="max-w-full rounded border border-border shadow-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  })
)

RRunner.displayName = "RRunner"
