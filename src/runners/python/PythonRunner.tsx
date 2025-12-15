import { useRef, useEffect, useImperativeHandle, forwardRef, memo } from "react"
import { Terminal, PanelRightClose, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ScapeFile } from "@/types/file"
import type { ScapeRunnerHandle } from "@/runners/types"
import type { LogEntry } from "@/types/log"
import PythonWorker from "./worker.ts?worker" // Vite Worker Import

interface PythonRunnerProps {
  files: ScapeFile[]
  onCollapse?: () => void
  onOutput?: (log: LogEntry) => void
  dependencies?: string[]
}

import { useState } from "react"

export const PythonRunner = memo(
  forwardRef<ScapeRunnerHandle, PythonRunnerProps>(
    ({ files, onOutput, onCollapse, dependencies = [] }, ref) => {
      const workerRef = useRef<Worker | null>(null)
      const [images, setImages] = useState<string[]>([])
      const pendingInstalls = useRef<
        Map<string, (result: { success: boolean; error?: string }) => void>
      >(new Map()) // Map package name to resolver

      const [restartTrigger, setRestartTrigger] = useState(0)
      const dependenciesRef = useRef(dependencies)

      // Keep deps ref up to date
      useEffect(() => {
        dependenciesRef.current = dependencies
      }, [dependencies])

      // Expose handle (Thumbnail not supported yet for text output)
      useImperativeHandle(ref, () => ({
        captureThumbnail: async () => null,
        restart: async () => {
          setRestartTrigger((prev) => prev + 1)
        },
        installPackage: async (pkg: string) => {
          if (!workerRef.current) return { success: false, error: "Worker not ready" }

          return new Promise<{ success: boolean; error?: string }>((resolve) => {
            // Store resolver
            pendingInstalls.current.set(pkg, resolve)

            // Send Request
            workerRef.current?.postMessage({
              type: "INSTALL",
              payload: pkg,
            })

            // Timeout fallback? (30s)
            setTimeout(() => {
              if (pendingInstalls.current.has(pkg)) {
                pendingInstalls.current.get(pkg)?.({ success: false, error: "Timeout" })
                pendingInstalls.current.delete(pkg)
              }
            }, 30000)
          })
        },
      }))

      // Initialize Worker
      useEffect(() => {
        // Spawn Worker
        const worker = new PythonWorker()
        workerRef.current = worker

        worker.onmessage = (e) => {
          const { type, payload } = e.data

          if (type === "STATUS") {
            // Status updates (kept internal for now)
          } else if (type === "OUTPUT") {
            onOutput?.({
              id: crypto.randomUUID(),
              type: "stdout",
              content: payload,
              timestamp: Date.now(),
            })
          } else if (type === "ERROR") {
            onOutput?.({
              id: crypto.randomUUID(),
              type: "stderr",
              content: payload,
              timestamp: Date.now(),
            })
          } else if (type === "IMAGE") {
            setImages((prev) => [...prev, payload])
          } else if (type === "DidRun") {
            // Ready
          } else if (type === "INSTALL_SUCCESS") {
            const pkg = payload
            if (pendingInstalls.current.has(pkg)) {
              pendingInstalls.current.get(pkg)?.({ success: true })
              pendingInstalls.current.delete(pkg)
            }
          } else if (type === "INSTALL_ERROR") {
            // Payload is now { pkg, error }
            const { pkg, error } = payload
            if (pendingInstalls.current.has(pkg)) {
              pendingInstalls.current.get(pkg)?.({ success: false, error })
              pendingInstalls.current.delete(pkg)
            }
          }
        }

        // Initialize Pyodide with dependencies
        // Use ref to get latest dependencies without triggering re-run on prop change
        worker.postMessage({ type: "INIT", payload: { dependencies: dependenciesRef.current } })

        return () => {
          worker.terminate()
          workerRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [restartTrigger, dependencies.join(",")]) // Run when restart triggered or deps change

      // Handle File Changes (Run Code)
      useEffect(() => {
        if (!workerRef.current || files.length === 0) return

        // Find entry point? Default main.py
        // We pass all files and let worker handle FS
        // We assume main.py is entry. Robustness: Fallback to first .py file?
        const entryPoint = files.find((f) => f.name === "main.py")
          ? "main.py"
          : files.find((f) => f.name.endsWith(".py"))?.name

        if (entryPoint) {
          // Clear global logs? This is handled by ScapeEditor on Refresh/Run, but not necessarily on auto-update.
          // For now we assume consistent flow.

          workerRef.current.postMessage({
            type: "RUN",
            payload: {
              files: files.map((f) => ({ name: f.name, content: f.content })),
              entryPoint,
            },
          })
          setImages([]) // Clear old images
        } else {
          console.warn("No Python entry point found (main.py)")
        }
      }, [files])

      return (
        <div className="flex h-full flex-col border-l bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex h-10 items-center justify-between border-b border-zinc-200 bg-muted/20 px-2 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" />
              <span>Preview (Python)</span>
            </div>
            {onCollapse && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={onCollapse}
                title="Collapse Preview"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex flex-1 flex-col items-center justify-start overflow-y-auto bg-white p-4 font-mono text-sm text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
            {images.length > 0 ? (
              <div className="flex flex-col gap-4">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-lg border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <img src={`data:image/png;base64,${img}`} alt={`Plot ${i + 1}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 pt-20 text-zinc-400 dark:text-zinc-500">
                <Image className="h-10 w-10 opacity-20 dark:opacity-50" />
                <span>Python Runtime Active</span>
                <p className="mt-1 max-w-xs text-center text-xs text-zinc-500 dark:text-zinc-400">
                  Output from <code>plt.show()</code> will appear here.
                  <br />
                  Standard output is available in the Terminal.
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }
  )
)

PythonRunner.displayName = "PythonRunner"
