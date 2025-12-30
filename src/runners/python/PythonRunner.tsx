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
import { debug } from "@/lib/debug"
import { TurtleCanvas, type TurtleCanvasHandle } from "./TurtleCanvas"

interface PythonRunnerProps {
  files: ScapeFile[]
  scapeId?: string // Optional for Python runner as it uses client-side isolation mostly
  onCollapse?: () => void
  onOutput?: (log: LogEntry) => void
  dependencies?: string[]
  onBusyChange?: (isBusy: boolean) => void
  onInputRequest?: (prompt: string) => Promise<string> | void
  onFileSystemUpdate?: (files: ScapeFile[]) => void
  onSystemCommand?: (cmd: string) => Promise<void>
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
        onSystemCommand,
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

      // Turtle graphics support
      const turtleCanvasRef = useRef<TurtleCanvasHandle>(null)
      const [isTurtleActive, setIsTurtleActive] = useState(false)
      const pendingTurtleCommands = useRef<Array<{ cmd: string; [key: string]: unknown }>>([])

      const pendingInstalls = useRef<
        Map<
          string,
          {
            resolve: (result: { success: boolean; error?: string }) => void
            onProgress?: (message: string) => void
          }
        >
      >(new Map())
      const pendingListPackages = useRef<
        ((packages: { name: string; version: string }[]) => void) | null
      >(null)
      const pendingAudioResolve = useRef<
        ((result: { success: boolean; error?: string }) => void) | null
      >(null)
      const runResolveRef = useRef<(() => void) | null>(null)
      // Track active sounds by ID for stop/volume control
      const activeSounds = useRef<
        Map<string, { source: AudioBufferSourceNode; gainNode: GainNode }>
      >(new Map())
      // For terminal-initiated runs that need to wait for completion
      const pendingFileRunRef = useRef<{
        path: string
        resolve: () => void
        opts?: import("../types").RunFileOptions
      } | null>(null)
      // Per-run callbacks for terminal-initiated execution
      const activeRunCallbacks = useRef<import("../types").RunFileOptions | null>(null)
      // Flag to prevent auto-run from interfering with explicit runFile calls
      const isExplicitRunRef = useRef(false)

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
        onSystemCommand,
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
          onSystemCommand,
        }
      }, [
        onOutput,
        onBusyChange,
        onInputRequest,
        onSystemCommand,
        onFileSystemUpdate,
        dependencies,
        files,
        socketEmit,
      ])

      // Forward declaration for initWorker to use
      const runPythonRef = useRef<() => Promise<void>>(async () => {})
      const isTurtleActiveRef = useRef(false)
      const audioContextRef = useRef<AudioContext | null>(null)

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

      // --- AudioContext Resume on User Gesture ---
      // Browsers suspend AudioContext until user interaction.
      // This effect resumes it on first click/keydown.
      useEffect(() => {
        const resumeAudioContext = () => {
          const ctx = audioContextRef.current
          if (ctx && ctx.state === "suspended") {
            ctx
              .resume()
              .then(() => {
                console.log("[Sound] AudioContext resumed via user gesture")
              })
              .catch(() => {
                /* ignore */
              })
          }
        }

        // Listen for user interactions
        document.addEventListener("click", resumeAudioContext, { once: true })
        document.addEventListener("keydown", resumeAudioContext, { once: true })
        document.addEventListener("touchstart", resumeAudioContext, { once: true })

        return () => {
          document.removeEventListener("click", resumeAudioContext)
          document.removeEventListener("keydown", resumeAudioContext)
          document.removeEventListener("touchstart", resumeAudioContext)
        }
      }, [])

      // --- Stable Worker Init ---
      // This function now has ZERO dependencies and never changes.
      // It reads the latest dependencies from propsRef.
      const initWorker = useCallback(() => {
        if (workerRef.current) {
          // Reject any pending installs if the worker is being killed
          if (pendingInstalls.current.size > 0) {
            pendingInstalls.current.forEach((handler) =>
              handler.resolve({ success: false, error: "Worker terminated during operation" })
            )
            pendingInstalls.current.clear()
          }
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
          debug.warn("SharedArrayBuffer not available. using Service Worker fallback for input.")
          // Don't show error to user
        }

        const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
        workerRef.current = worker
        isReadyRef.current = false
        setBusy(true)

        worker.onmessage = (e) => {
          const { type, payload } = e.data
          // console.log(`[PythonRunner] Received message type: ${type}`)
          if (type === "SYSTEM_COMMAND") {
            console.log("[PythonRunner] Received SYSTEM_COMMAND", payload)
          }

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
              // If terminal-initiated run, use the passed callback
              if (activeRunCallbacks.current?.onOutput) {
                activeRunCallbacks.current.onOutput(payload, "stdout")
              } else {
                log("stdout", payload)
              }
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
              // If terminal-initiated run, use the passed callback
              if (activeRunCallbacks.current?.onOutput) {
                activeRunCallbacks.current.onOutput(cleanPayload, "stderr")
              } else {
                log("stderr", cleanPayload)
              }
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
            case "TURTLE_CMD":
              // Forward turtle command to canvas
              debug.log("[PythonRunner] TURTLE_CMD received:", JSON.stringify(payload))
              if (payload?.cmd) {
                debug.log(
                  `[PythonRunner] Processing cmd: ${payload.cmd}, isTurtleActive(ref): ${isTurtleActiveRef.current}`
                )
                // Mark turtle as active on first command
                if (!isTurtleActiveRef.current) {
                  debug.log("[PythonRunner] Setting isTurtleActive = true")
                  // Update ref immediately to prevent subsequent commands from triggering state update
                  isTurtleActiveRef.current = true
                  setIsTurtleActive(true)
                }
                // Queue command if canvas not ready yet, otherwise execute immediately
                if (turtleCanvasRef.current) {
                  debug.log("[PythonRunner] Canvas ref available, calling handleCommand")
                  turtleCanvasRef.current.handleCommand(payload)
                } else {
                  debug.log(
                    "[PythonRunner] Canvas ref NOT available, queueing command. Queue size:",
                    pendingTurtleCommands.current.length + 1
                  )
                  pendingTurtleCommands.current.push(payload)
                }
              } else {
                debug.log("[PythonRunner] TURTLE_CMD has no cmd property:", payload)
              }
              break
            case "DidRun":
              setBusy(false)
              if (!isTurtleActiveRef.current) setIsTurtleActive(false) // Clean up if no graphics used
              if (!isReadyRef.current) {
                isReadyRef.current = true
                // Check for pending file run first (terminal-initiated)
                if (pendingFileRunRef.current) {
                  const { path, resolve: pendingResolve, opts } = pendingFileRunRef.current
                  pendingFileRunRef.current = null
                  // Execute with the stored path and resolve
                  runResolveRef.current = pendingResolve
                  // IMPORTANT: Set the callbacks for this run
                  activeRunCallbacks.current = opts || null
                  // Re-run with the specific path (don't await, just trigger)
                  // Use opts.files if provided, otherwise use propsRef
                  const currentFiles = opts?.files || propsRef.current.files
                  const entryPoint = path
                  if (currentFiles.some((f) => f.name === entryPoint)) {
                    setPreviewItems([])
                    setIsTurtleActive(false)
                    isTurtleActiveRef.current = false
                    turtleCanvasRef.current?.clear()
                    setBusy(true)
                    workerRef.current?.postMessage({
                      type: "RUN",
                      payload: {
                        files: currentFiles.map((f) => ({
                          name: f.name,
                          content: f.content,
                          language: f.language,
                        })),
                        entryPoint,
                        env: envVars,
                      },
                    })
                    // DON'T resolve yet - wait for the new run's DidRun
                    break
                  } else {
                    log("stderr", `Error: File '${entryPoint}' not found.`)
                    pendingResolve()
                    runResolveRef.current = null
                    activeRunCallbacks.current = null
                  }
                } else if (pendingRunRef.current) {
                  pendingRunRef.current = false
                  runPythonRef.current()
                  // Don't clear callbacks here - the new run will set them if needed
                  break
                }
              }
              // Resolve the pending run promise if any (this is the ACTUAL completion)
              if (runResolveRef.current) {
                runResolveRef.current()
                runResolveRef.current = null
                // Clear callbacks and explicit run flag when run actually completes
                activeRunCallbacks.current = null
                isExplicitRunRef.current = false
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
            case "PACKAGES_LIST":
              if (pendingListPackages.current) {
                try {
                  const list = JSON.parse(payload)
                  pendingListPackages.current(list)
                } catch {
                  pendingListPackages.current([])
                }
                pendingListPackages.current = null
              }
              break
            case "INPUT_REQUEST": {
              // Store ID for submission
              const { prompt, id } = payload
              pendingInputIdRef.current = id

              // If terminal-initiated run, use the passed callback
              if (activeRunCallbacks.current?.onInputRequest) {
                // Call async callback and submit input when resolved
                activeRunCallbacks.current.onInputRequest(prompt).then((value) => {
                  // Submit the input to the worker
                  fetch("/_submit_input", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, value }),
                  })
                })
              } else {
                // Normal behavior: trigger prop callback
                const result = propsRef.current.onInputRequest?.(prompt)

                // If the host returns a promise (Preview Console), wait for it and submit
                if (result instanceof Promise) {
                  result.then((value) => {
                    fetch("/_submit_input", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id, value }),
                    })
                  })
                }
              }
              break
            }
            case "AUDIO_DATA": {
              const { data, format, async: isAsync, filename } = payload

              // Decode base64 to ArrayBuffer
              const binaryString = atob(data)
              const bytes = new Uint8Array(binaryString.length)
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
              }

              // Create or reuse AudioContext
              let audioContext = audioContextRef.current
              const AudioContextClass =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext })
                  .webkitAudioContext

              if (!audioContext || audioContext.state === "closed") {
                if (!AudioContextClass) {
                  log("stderr", "Audio playback not supported in this browser")
                  if (pendingAudioResolve.current) {
                    pendingAudioResolve.current({ success: false, error: "Audio not supported" })
                    pendingAudioResolve.current = null
                  }
                  break
                }
                audioContext = new AudioContextClass()
                audioContextRef.current = audioContext
              }

              audioContext
                .decodeAudioData(bytes.buffer)
                .then((audioBuffer) => {
                  const source = audioContext!.createBufferSource()
                  source.buffer = audioBuffer
                  source.connect(audioContext!.destination)

                  source.onended = () => {
                    // Do NOT close shared context
                    // Signal completion for sync mode
                    if (!isAsync && pendingAudioResolve.current) {
                      pendingAudioResolve.current({ success: true })
                      pendingAudioResolve.current = null
                    }
                  }

                  // Ensure context is running (fixes short sounds not playing if suspended)
                  const resumePromise =
                    audioContext!.state === "suspended" ? audioContext!.resume() : Promise.resolve()

                  resumePromise
                    .then(() => {
                      source.start(0)
                      debug.log(`[PythonRunner] Playing audio: ${filename} (${format})`)

                      if (isAsync && pendingAudioResolve.current) {
                        pendingAudioResolve.current({ success: true })
                        pendingAudioResolve.current = null
                      }
                    })
                    .catch((e) => {
                      console.error("Failed to resume audio context:", e)
                    })
                })
                .catch((err) => {
                  log("stderr", `Failed to decode audio: ${err.message}`)
                  // Do NOT close shared context on decode error
                  if (pendingAudioResolve.current) {
                    pendingAudioResolve.current({ success: false, error: err.message })
                    pendingAudioResolve.current = null
                  }
                })
              break
            }
            case "AUDIO_ERROR": {
              const { error, async: isAsync } = payload
              log("stderr", `Audio error: ${error}`)
              if (!isAsync && pendingAudioResolve.current) {
                pendingAudioResolve.current({ success: false, error })
                pendingAudioResolve.current = null
              }
              break
            }
            // --- codescapes.sound module handlers ---
            case "AUDIO_PLAY": {
              const { id, data, filename, loop, volume } = payload as {
                id: string
                data: string
                filename: string
                loop: boolean
                volume: number
              }
              console.log(`[Sound] Playing: ${filename} (id=${id}, loop=${loop}, vol=${volume})`)

              // Decode base64 → ArrayBuffer
              try {
                const binary = atob(data)
                const bytes = new Uint8Array(binary.length)
                for (let i = 0; i < binary.length; i++) {
                  bytes[i] = binary.charCodeAt(i)
                }

                let audioContext = audioContextRef.current
                const AudioContextClass =
                  window.AudioContext ||
                  (window as unknown as { webkitAudioContext: typeof AudioContext })
                    .webkitAudioContext
                if (!audioContext || audioContext.state === "closed") {
                  if (!AudioContextClass) {
                    console.error("[Sound] Web Audio API not supported")
                    break
                  }
                  audioContext = new AudioContextClass() as AudioContext
                  audioContextRef.current = audioContext
                }

                // Resume if suspended (browser autoplay policy)
                if (audioContext.state === "suspended") {
                  audioContext.resume()
                }

                audioContext
                  .decodeAudioData(bytes.buffer.slice(0))
                  .then((buffer) => {
                    const source = audioContext!.createBufferSource()
                    const gainNode = audioContext!.createGain()

                    source.buffer = buffer
                    source.loop = loop
                    gainNode.gain.value = volume

                    source.connect(gainNode)
                    gainNode.connect(audioContext!.destination)

                    source.onended = () => {
                      console.log(`[Sound] Ended: ${filename} (id=${id})`)
                      activeSounds.current.delete(id)
                    }

                    activeSounds.current.set(id, { source, gainNode })
                    source.start(0)
                    console.log(`[Sound] Started: ${filename}`)
                  })
                  .catch((e) => console.error("[Sound] Decode failed:", filename, e))
              } catch (e) {
                console.error("[Sound] Failed to process audio:", e)
              }
              break
            }
            case "AUDIO_STOP": {
              const { id } = payload as { id: string }
              const sound = activeSounds.current.get(id)
              if (sound) {
                console.log(`[Sound] Stopping: ${id}`)
                try {
                  sound.source.stop()
                } catch {
                  /* Already stopped */
                }
                activeSounds.current.delete(id)
              }
              break
            }
            case "AUDIO_VOLUME": {
              const { id, volume } = payload as { id: string; volume: number }
              const sound = activeSounds.current.get(id)
              if (sound) {
                console.log(`[Sound] Volume: ${id} → ${volume}`)
                sound.gainNode.gain.value = Math.max(0, Math.min(1, volume))
              }
              break
            }
            case "AUDIO_STOP_ALL": {
              console.log(`[Sound] Stopping all (${activeSounds.current.size} sounds)`)
              activeSounds.current.forEach(({ source }) => {
                try {
                  source.stop()
                } catch {
                  /* Already stopped */
                }
              })
              activeSounds.current.clear()
              break
            }
            case "FS_UPDATE":
              propsRef.current.onFileSystemUpdate?.(payload)
              break
            case "SYSTEM_COMMAND": {
              const { cmd, id } = payload
              // Execute securely via Shell (delegated via props)
              const execute = propsRef.current.onSystemCommand
              console.log("[PythonRunner] onSystemCommand prop exists?", !!execute)

              if (execute) {
                execute(cmd)
                  .then(() => {
                    // Resolve the blocking XHR in worker
                    // IMPORTANT: Use /_submit_input (not /_wait_input) to RELEASE the held connection
                    console.log("[PythonRunner] System command resolved, unblocking worker...")
                    fetch("/_submit_input", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id, value: "0" }), // value = exit code
                    }).catch((e: Error) => console.error("Failed to resolve system command", e))
                  })
                  .catch((e: Error) => {
                    console.error("System command failed", e)
                    // Release with error code
                    fetch("/_submit_input", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id, value: "1" }), // Error exit code
                    }).catch(() => {})
                  })
              } else {
                console.error("[PythonRunner] onSystemCommand prop is MISSING")
                // Unblock anyway to avoid deadlock
                fetch("/_submit_input", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id, value: "127" }),
                }).catch(() => {})
              }
              break
            }
          }
        }

        worker.onerror = (e) => {
          log("stderr", `Worker Error: ${e.message}`)
          setBusy(false)
          // Resolve with error if crashing (safety)
          if (runResolveRef.current) {
            runResolveRef.current()
            runResolveRef.current = null
          }
          // Also fail any pending installs
          if (pendingInstalls.current.size > 0) {
            pendingInstalls.current.forEach((handler) =>
              handler.resolve({ success: false, error: `Worker Error: ${e.message}` })
            )
            pendingInstalls.current.clear()
          }
        }

        // Initialize with CURRENT dependencies
        worker.postMessage({
          type: "INIT",
          payload: {
            dependencies: propsRef.current.dependencies,
            sharedBuffer: sab,
          },
        })
      }, [log, setBusy, envVars])

      // --- Stable Run Logic ---
      // --- Stable Run Logic ---
      const runPython = useCallback(
        (overrideEntryPoint?: string, opts?: import("../types").RunFileOptions) => {
          return new Promise<void>((resolve) => {
            // Use opts.files if provided (direct terminal exec), otherwise use props
            const currentFiles = opts?.files || propsRef.current.files
            if (!currentFiles.length) {
              resolve()
              return
            }

            // Store per-run callbacks if provided (for terminal-initiated runs)
            if (opts) {
              activeRunCallbacks.current = opts
              isExplicitRunRef.current = true // Prevent auto-run from interfering
            } else if (!isExplicitRunRef.current) {
              // Only clear if not in explicit run mode (auto-run shouldn't interfere)
              activeRunCallbacks.current = null
            }

            // 1. Check if busy -> Restart if so to clear input blocks
            if (workerRef.current && isBusyRef.current) {
              initWorker()
              // If an explicit file path was provided (terminal run), store it to wait for completion
              if (overrideEntryPoint) {
                pendingFileRunRef.current = { path: overrideEntryPoint, resolve, opts }
              } else {
                pendingRunRef.current = true
                resolve()
              }
              return
            }

            // 2. Check if init -> Queue
            if (!workerRef.current) {
              initWorker()
              if (overrideEntryPoint) {
                pendingFileRunRef.current = { path: overrideEntryPoint, resolve, opts }
              } else {
                pendingRunRef.current = true
                resolve()
              }
              return
            }
            if (!isReadyRef.current) {
              if (overrideEntryPoint) {
                pendingFileRunRef.current = { path: overrideEntryPoint, resolve, opts }
              } else {
                pendingRunRef.current = true
                resolve()
              }
              return
            }

            // Strict Entry Point Logic
            const entryPoint =
              overrideEntryPoint ||
              (currentFiles.find((f) => f.name === "main.py")
                ? "main.py"
                : currentFiles.find((f) => f.name === "app.py")
                  ? "app.py"
                  : null)

            // Conflict Warning
            if (
              !overrideEntryPoint &&
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
              resolve()
              return
            }

            // If overriding, check if file exists
            if (overrideEntryPoint && !currentFiles.some((f) => f.name === overrideEntryPoint)) {
              log("stderr", `Error: File '${overrideEntryPoint}' not found.`)
              resolve()
              return
            }

            setPreviewItems([])

            // Reset turtle state
            // setIsTurtleActive(false) // FLICKER FIX: Keep mounted to avoid flash
            isTurtleActiveRef.current = false
            turtleCanvasRef.current?.clear()

            // Clear shared buffer if still used for other things, but not vital for input anymore
            if (sharedArrayRef.current) {
              Atomics.store(sharedArrayRef.current, 0, 0)
            }

            setBusy(true)

            // Set resolving ref (will be called by DidRun)
            runResolveRef.current = resolve

            // Reset canvas size to defaults for a fresh run
            // setCanvasSize({ width: 800, height: 600 }) // REMOVED: Causes jitter if script uses different size

            workerRef.current.postMessage({
              type: "RUN",
              payload: {
                files: currentFiles.map((f) => ({
                  name: f.name,
                  content: f.content as string | Uint8Array,
                  language: f.language,
                })),
                entryPoint,
                env: envVars, // Inject Secrets
              },
            })
          })
        },
        [initWorker, log, setBusy, envVars]
      )

      // Keep ref updated
      useEffect(() => {
        runPythonRef.current = () => runPython()
      }, [runPython])

      // 0. Service Worker Watchdog
      useEffect(() => {
        if (!navigator.serviceWorker.controller) {
          debug.warn("[Runner] No Service Worker controlling this page! Input may fail.")
        } else {
          debug.log("[Runner] Service Worker active and controlling.")
        }

        const onControllerChange = () => {
          debug.log("[Runner] Service Worker controller changed (Code updated?)")
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
      const [persistentCanvas] = useState<HTMLCanvasElement>(() => {
        const c = document.createElement("canvas")
        c.width = 800
        c.height = 600
        c.className = "rounded border bg-white shadow-sm"
        // Absolute positioning to align with overlay canvas in TurtleCanvas
        c.style.position = "absolute"
        c.style.left = "0"
        c.style.top = "0"
        return c
      })
      const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
        width: 800,
        height: 600,
      })

      // Flush pending turtle commands when canvas becomes available (Bug 3 fix)
      useEffect(() => {
        if (isTurtleActive && turtleCanvasRef.current && pendingTurtleCommands.current.length > 0) {
          debug.log(
            "[PythonRunner] useEffect flushing pending commands:",
            pendingTurtleCommands.current.length
          )
          pendingTurtleCommands.current.forEach((cmd) =>
            turtleCanvasRef.current?.handleCommand(cmd)
          )
          pendingTurtleCommands.current = []
        }
      }, [isTurtleActive])

      // 2. Run whenever files change (and secrets are ready, if needed)
      useEffect(() => {
        // Skip auto-run if an explicit runFile call is in progress
        if (isExplicitRunRef.current) {
          return
        }
        // Defer execution to avoid synchronous state update during render
        const t = setTimeout(() => {
          runPython()
        }, 0)
        return () => clearTimeout(t)
      }, [files, runPython, envVars])

      // --- Handle ---
      useImperativeHandle(ref, () => ({
        captureThumbnail: async () => {
          // Priority 1: Matplotlib/Pandas plots
          if (lastFigureRef.current) {
            return `data:image/png;base64,${lastFigureRef.current}`
          }
          // Priority 2: Turtle Canvas
          if (isTurtleActiveRef.current && turtleCanvasRef.current) {
            return turtleCanvasRef.current.getCanvasDataURL()
          }
          return null
        },
        stop: async () => {
          // 1. Try Graceful Stop (KeyboardInterrupt)
          if (sharedArrayRef.current) {
            log("system", "Saving files and stopping...")
            // 2 is standard for SIGINT in Pyodide/Emscripten context
            Atomics.store(sharedArrayRef.current, 0, 2)

            // Give the worker a chance to catch interrupt, run 'finally', and sync FS
            await new Promise((r) => setTimeout(r, 1000))
          }

          // 2. Hard Kill & Restart Worker
          // This ensures a fresh environment for the next run
          debug.log("[PythonRunner] Force terminating worker")
          initWorker()

          // Reset busy state
          setBusy(false)
        },
        restart: async () => {
          // Soft Restart: We rely on the parent updating props (files),
          // which triggers the useEffect above (calling runPython).
          debug.log("[PythonRunner] Soft restart initiated via prop update")
        },
        runFile: async (path: string, opts?: import("../types").RunFileOptions) => {
          await runPython(path, opts)
        },
        installPackage: async (pkg, onProgress) => {
          return new Promise((resolve) => {
            if (!workerRef.current) {
              resolve({ success: false, error: "Runtime not ready" })
              return
            }
            // ... install logic
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

        listPackages: async () => {
          return new Promise((resolve) => {
            if (!workerRef.current) {
              resolve([])
              return
            }
            pendingListPackages.current = resolve
            workerRef.current.postMessage({ type: "LIST_PACKAGES" })
            // Timeout 5s
            setTimeout(() => {
              if (pendingListPackages.current) {
                pendingListPackages.current([])
                pendingListPackages.current = null
              }
            }, 5000)
          })
        },

        provideInput: async (text: string) => {
          const id = pendingInputIdRef.current
          if (!id) {
            debug.warn("Provide Input called without pending ID")
            return
          }
          try {
            debug.log(`[Runner] Submitting input for ID: ${id}, Value: "${text}"`)
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
                debug.log("[Runner] Debug: Pending Inputs in SW:", debugKeys)
              } catch (d) {
                debug.warn("[Runner] Failed to fetch debug inputs (Is SW active?)", d)
              }
            } else {
              debug.log("[Runner] Input submitted successfully")
            }
            pendingInputIdRef.current = null
          } catch (e) {
            console.error("[Runner] Input submission error:", e)
          }
        },
        postMessage: (message: Record<string, unknown>) => {
          if (workerRef.current) {
            workerRef.current.postMessage(message)
          } else {
            debug.warn("[Runner] postMessage called but worker not ready")
          }
        },
        runSystemCommand: async (cmd: string, args: Record<string, unknown>) => {
          if (cmd === "aplay") {
            // Deadlock Prevention: Play audio LOCALLY to avoid blocking worker interaction
            const { filename, files: taskFiles } = args as {
              filename: string
              files?: Array<{ name: string; content: string | Uint8Array | ArrayBuffer }>
            }
            console.log(`[PythonRunner] System Command: aplay ${filename}`)
            const targetFile = taskFiles?.find((f) => f.name === filename)

            if (!targetFile) {
              console.error(`[PythonRunner] File not found: ${filename}`)
              throw new Error(`File not found: ${filename}`)
            }

            // Prepare Audio Buffer
            // Binary files are stored as Base64 strings or Uint8Array
            // Prepare Audio Buffer
            // Binary files are stored as Base64 strings or Uint8Array
            let arrayBuffer: ArrayBuffer
            if (typeof targetFile.content === "string") {
              const binaryString = atob(targetFile.content)
              const bytes = new Uint8Array(binaryString.length)
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
              }
              arrayBuffer = bytes.buffer
            } else if (targetFile.content instanceof Uint8Array) {
              // Create a COPY of the buffer to ensure we don't pass a view of a larger buffer
              // and to avoid SharedArrayBuffer issues.
              const bytes = new Uint8Array(targetFile.content)
              arrayBuffer = bytes.buffer.slice(
                bytes.byteOffset,
                bytes.byteOffset + bytes.byteLength
              )
            } else {
              // ArrayBuffer or similar - slice to ensure copy
              arrayBuffer = (targetFile.content as ArrayBuffer).slice(0)
            }

            console.log(`[PythonRunner] Audio Buffer Size: ${arrayBuffer.byteLength}`)

            return new Promise((resolve) => {
              // Initialize Audio Context
              const AudioContextClass =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext })
                  .webkitAudioContext
              if (!AudioContextClass) {
                console.error("[PythonRunner] Audio not supported")
                resolve(void 0)
                return
              }

              let audioContext = audioContextRef.current
              if (!audioContext || audioContext.state === "closed") {
                audioContext = new AudioContextClass() as AudioContext
                audioContextRef.current = audioContext
              }

              console.log(`[PythonRunner] AudioContext State: ${audioContext.state}`)

              // Decode and Play
              audioContext
                .decodeAudioData(arrayBuffer)
                .then((decodedBuffer) => {
                  console.log(
                    `[PythonRunner] Decoded successfully. Duration: ${decodedBuffer.duration}s`
                  )
                  const source = audioContext!.createBufferSource()
                  source.buffer = decodedBuffer
                  source.connect(audioContext!.destination)

                  let isResolved = false
                  const safeResolve = () => {
                    if (!isResolved) {
                      isResolved = true
                      console.log("[PythonRunner] Audio playback finished (resolved)")
                      resolve(void 0)
                    }
                  }

                  source.onended = () => {
                    console.log("[PythonRunner] Playback ended (event)")
                    safeResolve()
                  }

                  // Safety timeout based on duration + buffer (500ms)
                  // If onended fails (e.g. suspended context weirdness), this ensures unblocking.
                  const durationMs = decodedBuffer.duration * 1000
                  console.log(
                    `[PythonRunner] Audio Duration: ${decodedBuffer.duration.toFixed(2)}s. Safety timeout set for ${durationMs + 500}ms.`
                  )

                  setTimeout(() => {
                    if (!isResolved) {
                      console.warn("[PythonRunner] Audio playback timed out (fallback resolve)")
                      safeResolve()
                    }
                  }, durationMs + 500)

                  // Resume if needed
                  if (audioContext!.state === "suspended") {
                    console.log("[PythonRunner] Resuming AudioContext...")
                    audioContext!
                      .resume()
                      .then(() => {
                        console.log("[PythonRunner] Resumed. Starting playback...")
                        source.start(0)
                      })
                      .catch((e) => {
                        console.error("[PythonRunner] Resume failed", e)
                        safeResolve()
                      })
                  } else {
                    console.log("[PythonRunner] Starting playback immediately...")
                    source.start(0)
                  }
                })
                .catch((e) => {
                  console.error("[PythonRunner] Audio decode failed", e)
                  resolve(void 0)
                })
            })
          }
          // Other system commands can be added here
          throw new Error(`Unknown system command: ${cmd}`)
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
            {/* Turtle Graphics Canvas */}
            {isTurtleActive && (
              <div className="mb-4 flex justify-center">
                <TurtleCanvas
                  ref={(handle) => {
                    // Store ref immediately
                    turtleCanvasRef.current = handle
                    // Flush pending commands when canvas becomes available
                    if (handle && pendingTurtleCommands.current.length > 0) {
                      pendingTurtleCommands.current.forEach((cmd) => handle.handleCommand(cmd))
                      pendingTurtleCommands.current = []
                    }
                  }}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  onResize={(w, h) => {
                    debug.log(`[PythonRunner] onResize: ${w}x${h}`)
                    setCanvasSize({ width: w, height: h })
                  }}
                  canvasInstance={persistentCanvas}
                />
              </div>
            )}

            {previewItems.length === 0 && !isTurtleActive ? (
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
                      Plots (matplotlib), Turtle graphics, and DataFrames (pandas) will appear here.
                    </p>
                  </>
                )}
              </div>
            ) : previewItems.length > 0 ? (
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
                        className="prose prose-sm max-w-none overflow-x-auto rounded border border-border bg-card p-4 shadow-sm dark:prose-invert"
                        dangerouslySetInnerHTML={{
                          __html: item.content,
                        }}
                        style={{ width: "100%" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : null}
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
