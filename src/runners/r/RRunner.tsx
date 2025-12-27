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
import { Loader2 } from "lucide-react"

import Worker from "./worker.ts?worker"

export const RRunner = memo(
  forwardRef<ScapeRunnerHandle, ScapeRunnerProps>(({ files, onOutput }, ref) => {
    const workerRef = useRef<Worker | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isBusy, setIsBusy] = useState(false)
    const [previewItems, setPreviewItems] = useState<{ type: "image" | "html"; content: string }[]>(
      []
    )

    // Stable Log Helper
    const log = useCallback(
      (type: "stdout" | "stderr" | "system", content: string) => {
        onOutput?.({
          id: crypto.randomUUID(),
          type,
          content,
          timestamp: Date.now(),
        })
      },
      [onOutput]
    )

    // Init Worker
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
    }, [log]) // Re-init if log changes? Ideally log is stable.

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
      <div ref={containerRef} className="flex h-full flex-col overflow-auto bg-background p-4">
        {isBusy && (
          <div className="absolute right-2 top-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}

        {previewItems.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground opacity-50">
            R Plots will appear here
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {previewItems.map((item, i) => (
              <div key={i} className="rounded border p-2">
                {item.type === "html" ? (
                  <div dangerouslySetInnerHTML={{ __html: item.content }} />
                ) : (
                  <img src={item.content} alt="Plot" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  })
)

RRunner.displayName = "RRunner"
