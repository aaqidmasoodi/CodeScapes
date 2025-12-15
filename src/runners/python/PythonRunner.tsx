import { useRef, useEffect, useImperativeHandle, forwardRef, memo } from "react"
import { MonitorPlay, Box, PanelRightClose } from "lucide-react"
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
  onBusyChange?: (isBusy: boolean) => void
}

import { useState } from "react"

export const PythonRunner = memo(
  forwardRef<ScapeRunnerHandle, PythonRunnerProps>(
    ({ files, onOutput, onCollapse, dependencies = [], onBusyChange }, ref) => {
      const workerRef = useRef<Worker | null>(null)
      // Preview Items: Can be { type: "image", content: string } or { type: "html", content: string }
      const [previewItems, setPreviewItems] = useState<
        { type: "image" | "html"; content: string }[]
      >([])
      const pendingInstalls = useRef<
        Map<string, (result: { success: boolean; error?: string }) => void>
      >(new Map()) // Map package name to resolver

      const [restartTrigger, setRestartTrigger] = useState(0)

      // Expose handle (Thumbnail not supported yet for text output)
      useImperativeHandle(ref, () => ({
        captureThumbnail: async () => null,
        restart: async () => {
          onBusyChange?.(true)
          setRestartTrigger((prev) => prev + 1)
        },
        installPackage: async (pkg: string) => {
          if (!workerRef.current) return { success: false, error: "Worker not ready" }

          // Installing is also a busy state
          onBusyChange?.(true)

          return new Promise<{ success: boolean; error?: string }>((resolve) => {
            // Store resolver
            pendingInstalls.current.set(pkg, (result) => {
              onBusyChange?.(false)
              resolve(result)
            })

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
                onBusyChange?.(false)
              }
            }, 30000)
          })
        },
      }))

      // Initialize Worker
      useEffect(() => {
        // Initial load is busy
        onBusyChange?.(true)

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
            // Error means execution stopped
            onBusyChange?.(false)
            onOutput?.({
              id: crypto.randomUUID(),
              type: "stderr",
              content: payload,
              timestamp: Date.now(),
            })
          } else if (type === "IMAGE") {
            setPreviewItems((prev) => [...prev, { type: "image", content: payload }])
          } else if (type === "PREVIEW_HTML") {
            setPreviewItems((prev) => [...prev, { type: "html", content: payload }])
          } else if (type === "DidRun") {
            // Execution / Init finished
            onBusyChange?.(false)
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
        // Use prop directly to ensure latest value is used (ref might be stale during effect execution)
        worker.postMessage({ type: "INIT", payload: { dependencies } })

        return () => {
          worker.terminate()
          workerRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [restartTrigger, dependencies.join(",")]) // Run when restart triggered or deps change

      const dependenciesKey = dependencies.join(",")

      // Handle File Changes (Run Code)
      useEffect(() => {
        if (!workerRef.current || files.length === 0) return

        // NOTE: We do NOT trigger busy state here for auto-refresh
        // as per user request to keep it subtle.

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
          setPreviewItems([]) // Clear old previews
        } else {
          console.warn("No Python entry point found (main.py)")
        }
      }, [files, dependenciesKey])

      // Render Logic
      return (
        <div className="flex h-full flex-col border-l border-border bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex h-10 items-center justify-between border-b border-zinc-200 bg-muted/20 px-2 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MonitorPlay className="h-3.5 w-3.5" />
              <span className="max-w-[200px] truncate">Preview (Python)</span>
            </div>

            <div className="flex items-center gap-3">
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
          </div>
          <div className="flex flex-1 flex-col overflow-auto p-4">
            {previewItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <Box className="h-8 w-8 opacity-20" />
                <p className="mt-2 text-xs">No graphical output generated.</p>
                <p className="mt-1 text-[10px] opacity-75">
                  Plots (matplotlib) and DataFrames (pandas) will appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {previewItems.map((item, i) => (
                  <div key={i} className="flex justify-center overflow-auto">
                    {item.type === "image" ? (
                      <img
                        src={`data:image/png;base64,${item.content}`}
                        alt={`Plot ${i + 1}`}
                        className="max-w-full rounded border border-border shadow-sm"
                      />
                    ) : (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none overflow-x-auto rounded border border-border bg-card p-4 shadow-sm"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                        // Pandas tables need some CSS injection to look good
                        style={{ width: "100%" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Add basic styles for Pandas tables if needed via style tag or global CSS */}
          <style>{`
            .dataframe {
              width: 100%;
              border-collapse: collapse;
              border-spacing: 0;
              font-size: 0.875rem; /* text-sm */
              line-height: 1.25rem;
            }
            
            /* Header Styling */
            .dataframe thead th {
              text-align: left;
              padding: 0.75rem 1rem;
              font-weight: 600;
              color: var(--foreground);
              background-color: var(--muted);
              border-bottom: 2px solid var(--border);
              white-space: nowrap;
            }

            /* Body Styling */
            .dataframe tbody td {
              padding: 0.75rem 1rem;
              text-align: left;
              border-bottom: 1px solid var(--border);
              color: var(--foreground);
              white-space: nowrap;
              max-width: 300px;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            /* Alternating Rows (Zebra Striping) */
            .dataframe tbody tr:nth-child(even) {
              background-color: hsl(var(--muted) / 0.3);
            }

            /* Hover Effect */
            .dataframe tbody tr:hover {
              background-color: hsl(var(--muted) / 0.6);
            }

            /* Index Column (optional, Pandas usually adds this) */
            .dataframe tbody th {
              font-weight: 500;
              text-align: left;
              padding: 0.75rem 1rem;
              border-bottom: 1px solid var(--border);
              background-color: transparent;
              color: var(--muted-foreground);
            }
          `}</style>
        </div>
      )
    }
  )
)

PythonRunner.displayName = "PythonRunner"
