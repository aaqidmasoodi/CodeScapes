import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  memo,
  useState,
  useCallback,
} from "react"
import { MonitorPlay, Box, PanelRightClose, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ScapeFile } from "@/types/file"
import type { ScapeRunnerHandle } from "@/runners/types"
import type { LogEntry } from "@/types/log"
import { secretsService } from "@/services/secrets"
import { useSocketBridge } from "@/hooks/useSocketBridge"

interface PythonRunnerProps {
  files: ScapeFile[]
  scapeId?: string // Optional for Python runner as it uses client-side isolation mostly
  onCollapse?: () => void
  onOutput?: (log: LogEntry) => void
  dependencies?: string[]
  onBusyChange?: (isBusy: boolean) => void
  onInputRequest?: (prompt: string) => void
  onFileSystemUpdate?: (files: ScapeFile[]) => void
  isLive?: boolean
}

export const PythonRunner = memo(
  forwardRef<ScapeRunnerHandle, PythonRunnerProps>(
    (
      {
        files,
        onOutput,
        onCollapse,
        dependencies = [],
        onBusyChange,
        onInputRequest,
        onFileSystemUpdate,
        scapeId,
        isLive,
      },
      ref
    ) => {
      const workerRef = useRef<Worker | null>(null)
      const containerRef = useRef<HTMLDivElement>(null)
      const isReadyRef = useRef(false)
      const pendingRunRef = useRef(false)
      const isBusyRef = useRef(false)
      const [isBusy, setIsBusyState] = useState(false)
      const [envVars, setEnvVars] = useState<Record<string, string>>({})

      // Shared Buffer for Output/Input
      const sharedBufferRef = useRef<SharedArrayBuffer | null>(null)
      const sharedArrayRef = useRef<Int32Array | null>(null)

      const [previewItems, setPreviewItems] = useState<
        { type: "image" | "html"; content: string }[]
      >([])
      const lastFigureRef = useRef<string | null>(null)
      const pendingInstalls = useRef<
        Map<
          string,
          {
            resolve: (result: { success: boolean; error?: string }) => void
            onProgress?: (message: string) => void
          }
        >
      >(new Map())

      // 0. Socket Bridge
      const { emit: socketEmit } = useSocketBridge(scapeId, (event, data) => {
        // Forward incoming socket events to Worker
        workerRef.current?.postMessage({
          type: "SOCKET_EVENT",
          payload: { event, data },
        })
      })

      // --- Stable Refs for Props ---
      // We use refs to hold the latest prop values so our callbacks (runPython, initWorker)
      // don't need to be re-created when props change. This breaks the infinite loop cycles.
      const propsRef = useRef({
        onOutput,
        onBusyChange,
        onInputRequest,
        onFileSystemUpdate,
        dependencies,
        files,
        socketEmit,
      })

      useEffect(() => {
        if (!scapeId) return
        secretsService.getSecrets(scapeId).then((secrets) => {
          const map: Record<string, string> = {}
          secrets.forEach((s) => (map[s.key] = s.value))
          setEnvVars(map)
        })
      }, [scapeId])

      useEffect(() => {
        propsRef.current = {
          onOutput,
          onBusyChange,
          onInputRequest,
          onFileSystemUpdate,
          dependencies,
          files,
          socketEmit,
        }
      }, [onOutput, onBusyChange, onInputRequest, onFileSystemUpdate, dependencies, files, socketEmit])

      // Forward declaration for initWorker to use
      const runPythonRef = useRef<() => Promise<void>>(async () => { })

      // --- Stable Helpers ---

      const setBusy = useCallback((busy: boolean) => {
        isBusyRef.current = busy
        setIsBusyState(busy)
        propsRef.current.onBusyChange?.(busy)
      }, [])

      const log = useCallback((type: "stdout" | "stderr" | "system", content: string) => {
        propsRef.current.onOutput?.({
          id: crypto.randomUUID(),
          type,
          content,
          timestamp: Date.now(),
        })
      }, [])

      // --- Stable Worker Init ---
      // This function now has ZERO dependencies and never changes.
      // It reads the latest dependencies from propsRef.
      const initWorker = useCallback(() => {
        if (workerRef.current) {
          workerRef.current.terminate()
        }

        // Create SharedArrayBuffer
        let sab: SharedArrayBuffer | null = null
        try {
          sab = new SharedArrayBuffer(1024)
          sharedBufferRef.current = sab
          sharedArrayRef.current = new Int32Array(sab)
        } catch {
          // Valid fallback exists (Service Worker), so this is not fatal.
          console.warn("SharedArrayBuffer not available. using Service Worker fallback for input.")
          // Don't show error to user
        }

        const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
        workerRef.current = worker
        isReadyRef.current = false
        setBusy(true)

        worker.onmessage = (e) => {
          const { type, payload } = e.data

          switch (type) {
            case "SOCKET_EMIT":
              propsRef.current.socketEmit(payload.event, payload.data)
              break
            case "STATUS":
              // Route to pending installs if active (for pip progress in terminal)
              if (pendingInstalls.current.size > 0) {
                pendingInstalls.current.forEach((handler) => handler.onProgress?.(payload))
              }
              // Otherwise, suppress system logs (Blue text) from Output Pane as requested.
              break
            case "OUTPUT":
              log("stdout", payload)
              break
            case "ERROR": {
              // Sanitize Pyodide error messages
              let cleanPayload = payload
              if (cleanPayload.includes("is included in the Pyodide distribution")) {
                cleanPayload = cleanPayload.replace(
                  /The module '(.+?)' is included in the Pyodide distribution, but it is not installed[\s\S]*/,
                  "The module '$1' is not installed.\nYou can install it by running:\n  pip install $1\n"
                )
              }
              log("stderr", cleanPayload)
              // Don't clear busy on simple stderr, only on finish/error
              // Actually stderr usually means execution continues or finishes differently.
              // We'll let DidRun clear the busy state.
              if (payload.includes("Traceback") || payload.includes("Error")) {
                // If it looks like a fatal error, maybe we should clear busy?
                // Python usually sends DidRun after error too.
              }
              break
            }
            case "PREVIEW_HTML":
              setPreviewItems((prev) => [...prev, { type: "html", content: payload }])
              break
            case "IMAGE":
              setPreviewItems((prev) => [...prev, { type: "image", content: payload }])
              // Store first figure for thumbnail
              if (!lastFigureRef.current) {
                lastFigureRef.current = payload
              }
              break
            case "DidRun":
              setBusy(false)
              if (!isReadyRef.current) {
                isReadyRef.current = true
                if (pendingRunRef.current) {
                  pendingRunRef.current = false
                  runPythonRef.current()
                }
              }
              break
            case "INSTALL_SUCCESS":
              // Do NOT log to system (Output Pane)
              if (pendingInstalls.current.has(payload)) {
                // Notify progress one last time if needed, or just resolve
                // user prefers terminal feedback so maybe confirmation here?
                // The 'resolve' itself returns to useShell which prints "Successfully installed...".
                // So we don't need to double print.

                pendingInstalls.current.get(payload)?.resolve({ success: true })
                pendingInstalls.current.delete(payload)
              }
              setBusy(false)
              break
            case "INSTALL_ERROR":
              setBusy(false)
              if (payload && typeof payload === "object") {
                const { pkg, error } = payload
                if (pendingInstalls.current.has(pkg)) {
                  pendingInstalls.current.get(pkg)?.resolve({
                    success: false,
                    error,
                  })
                  pendingInstalls.current.delete(pkg)
                }
              }
              break
            case "INPUT_REQUEST": {
              // Store ID for submission
              const { prompt, id } = payload
              pendingInputIdRef.current = id
              propsRef.current.onInputRequest?.(prompt)
              break
            }
            case "FS_UPDATE":
              propsRef.current.onFileSystemUpdate?.(payload)
              break
          }
        }

        worker.onerror = (e) => {
          log("stderr", `Worker Error: ${e.message}`)
          setBusy(false)
        }

        // Initialize with CURRENT dependencies
        worker.postMessage({
          type: "INIT",
          payload: {
            // dependencies: propsRef.current.dependencies, // Removed check for now, can add back
            dependencies: propsRef.current.dependencies,
            // sharedBuffer: sab, // No longer vital, but can keep if needed for other things? No.
          },
        })
      }, [log, setBusy])

      // --- Stable Run Logic ---
      const runPython = useCallback(async () => {
        // Use `files` prop directly (it will be updated by parent setDebouncedFiles)
        const currentFiles = files
        if (!currentFiles.length) return

        // 1. Check if busy -> Restart if so to clear input blocks
        if (workerRef.current && isBusyRef.current) {
          initWorker()
          pendingRunRef.current = true
          return
        }

        // 2. Check if init -> Queue
        if (!workerRef.current) {
          initWorker()
          pendingRunRef.current = true
          return
        }
        if (!isReadyRef.current) {
          pendingRunRef.current = true
          return
        }

        // Strict Entry Point Logic
        const entryPoint = currentFiles.find((f) => f.name === "main.py")
          ? "main.py"
          : currentFiles.find((f) => f.name === "app.py")
            ? "app.py"
            : null

        // Conflict Warning
        if (
          currentFiles.find((f) => f.name === "main.py") &&
          currentFiles.find((f) => f.name === "app.py")
        ) {
          log("system", "Note: Both 'main.py' and 'app.py' found. Defaulting to 'main.py'.")
        }

        if (!entryPoint) {
          log(
            "stderr",
            "Error: No entry point found.\nPlease create a 'main.py' or 'app.py' file in the root directory to run your code."
          )
          return
        }

        setPreviewItems([])

        // Clear shared buffer if still used for other things, but not vital for input anymore
        if (sharedArrayRef.current) {
          Atomics.store(sharedArrayRef.current, 0, 0)
        }

        setBusy(true)
        workerRef.current.postMessage({
          type: "RUN",
          payload: {
            files: currentFiles.map((f) => ({
              name: f.name,
              content: f.content,
              language: f.language,
            })),
            entryPoint,
            env: envVars, // Inject Secrets
          },
        })
      }, [initWorker, log, setBusy, envVars, files])

      // Keep ref updated
      useEffect(() => {
        runPythonRef.current = runPython
      }, [runPython])

      // 0. Service Worker Watchdog
      useEffect(() => {
        if (!navigator.serviceWorker.controller) {
          console.warn("[Runner] No Service Worker controlling this page! Input may fail.")
        } else {
          console.log("[Runner] Service Worker active and controlling.")
        }

        const onControllerChange = () => {
          console.log("[Runner] Service Worker controller changed (Code updated?)")
        }
        navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)
        return () =>
          navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
      }, [])

      // 1. Initialize on mount or when dependencies change (deeply)
      const depsString = JSON.stringify(dependencies)
      useEffect(() => {
        const timer = setTimeout(() => {
          initWorker()
        }, 0)
        return () => {
          clearTimeout(timer)
          workerRef.current?.terminate()
        }
      }, [depsString, initWorker])

      const pendingInputIdRef = useRef<string | null>(null)

      // 2. Run whenever files change (and secrets are ready, if needed)
      useEffect(() => {
        // Defer execution to avoid synchronous state update during render
        const t = setTimeout(() => {
          runPython()
        }, 0)
        return () => clearTimeout(t)
      }, [files, runPython, envVars])

      // --- Handle ---
      useImperativeHandle(ref, () => ({
        captureThumbnail: async () => lastFigureRef.current,
        stop: async () => {
          // Explicit Force Stop (Kill Worker)
          initWorker()
        },
        restart: async () => {
          // Soft Restart: We rely on the parent updating props (files),
          // which triggers the useEffect above (calling runPython).
          // We don't need to do anything here except maybe log.
          console.log("[PythonRunner] Soft restart initiated via prop update")
        },
        installPackage: async (pkg, onProgress) => {
          return new Promise((resolve) => {
            if (!workerRef.current) {
              resolve({ success: false, error: "Runtime not ready" })
              return
            }
            setBusy(true)
            pendingInstalls.current.set(pkg, { resolve, onProgress })

            workerRef.current.postMessage({
              type: "INSTALL",
              payload: pkg,
            })

            // Timeout fallback
            setTimeout(() => {
              if (pendingInstalls.current.has(pkg)) {
                pendingInstalls.current.get(pkg)?.resolve({
                  success: false,
                  error: "Timeout",
                })
                pendingInstalls.current.delete(pkg)
                setBusy(false)
              }
            }, 120000)
          })
        },

        provideInput: async (text: string) => {
          const id = pendingInputIdRef.current
          if (!id) {
            console.warn("Provide Input called without pending ID")
            return
          }
          try {
            console.log(`[Runner] Submitting input for ID: ${id}, Value: "${text}"`)
            const res = await fetch("/_submit_input", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id, value: text }),
            })
            if (!res.ok) {
              const text = await res.text()
              console.error(
                `[Runner] Input submission failed: ${res.status} ${res.statusText} - Body: ${text}`
              )

              // Debug: Check what inputs are pending
              try {
                const debugRes = await fetch("/_debug_inputs")
                const debugKeys = await debugRes.json()
                console.log("[Runner] Debug: Pending Inputs in SW:", debugKeys)
              } catch (d) {
                console.warn("[Runner] Failed to fetch debug inputs (Is SW active?)", d)
              }
            } else {
              console.log("[Runner] Input submitted successfully")
            }
            pendingInputIdRef.current = null
          } catch (e) {
            console.error("[Runner] Input submission error:", e)
          }
        },
      }))

      return (
        <div
          ref={containerRef}
          className="flex h-full flex-col border-l border-border bg-background text-foreground dark:border-zinc-800"
        >
          {!isLive && (
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
          )}
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
                    <p className="mt-1 text-[10px] opacity-75">
                      Plots (matplotlib) and DataFrames (pandas) will appear here.
                    </p>
                  </>
                )}
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
                        dangerouslySetInnerHTML={{
                          __html: item.content,
                        }}
                        style={{ width: "100%" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Styles for Pandas */}
          <style>{`
            .dataframe { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
            .dataframe thead th { text-align: left; padding: 0.5rem; background: var(--muted); border-bottom: 2px solid var(--border); }
            .dataframe tbody td { padding: 0.5rem; border-bottom: 1px solid var(--border); }
            .dataframe tbody tr:nth-child(even) { background: hsl(var(--muted)/0.3); }
           `}</style>
        </div>
      )
    }
  )
)

PythonRunner.displayName = "PythonRunner"
