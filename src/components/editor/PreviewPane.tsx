import { useRef, forwardRef, useImperativeHandle, memo } from "react"
import { MonitorPlay, PanelRightClose } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ScapeFile } from "@/types/file"
import { ENVIRONMENTS } from "@/config/environments"
import type { EnvironmentId } from "@/types/environment"
import { PythonRunner } from "@/runners/python/PythonRunner"
import { WebRunner } from "@/runners/web/WebRunner"
import { FlowRunner } from "@/runners/flow/FlowRunner"
import { RRunner } from "@/runners/r/RRunner"
import type { LogEntry } from "@/types/log"
import type { ScapeRunnerHandle } from "@/runners/types"

// Re-export handle type for consumers
export type { ScapeRunnerHandle as PreviewPaneHandle }

interface PreviewPaneProps {
  files: ScapeFile[]
  scapeId: string
  onCollapse: () => void
  onOutput?: (log: LogEntry) => void
  environment: EnvironmentId
  isRunning: boolean
  dependencies?: string[]
  onBusyChange?: (isBusy: boolean) => void
  onInputRequest?: (prompt: string) => void
  onFileSystemUpdate?: (files: ScapeFile[]) => void
  onSystemCommand?: (cmd: string) => Promise<void>
  showStoppedOverlay?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project?: any // For FlowScape High-Speed Sync
}

// --- SWITCHBOARD ---
export const PreviewPane = memo(
  forwardRef<ScapeRunnerHandle, PreviewPaneProps>((props, ref) => {
    const { environment = "web", isRunning = true, onBusyChange, scapeId } = props

    const runnerRef = useRef<ScapeRunnerHandle>(null)

    useImperativeHandle(ref, () => ({
      captureThumbnail: async () => {
        if (isRunning && runnerRef.current) {
          return await runnerRef.current.captureThumbnail()
        }
        return null
      },
      installPackage: async (pkg: string, onProgress?: (message: string) => void) => {
        if (isRunning && runnerRef.current?.installPackage) {
          return await runnerRef.current.installPackage(pkg, onProgress)
        }
        return { success: false, error: "Environment not running or packages not supported" }
      },
      listPackages: async () => {
        if (isRunning && runnerRef.current?.listPackages) {
          return await runnerRef.current.listPackages()
        }
        return []
      },
      restart: async () => {
        if (isRunning && runnerRef.current?.restart) {
          await runnerRef.current.restart()
        }
      },
      provideInput: async (text: string) => {
        if (isRunning && runnerRef.current && "provideInput" in runnerRef.current) {
          // @ts-expect-error - Custom method on extended handle
          await runnerRef.current.provideInput(text)
        }
      },
      updateScript: (code: string) => {
        if (runnerRef.current?.updateScript) {
          runnerRef.current.updateScript(code)
        }
      },
      run: () => {
        if (runnerRef.current?.run) {
          runnerRef.current.run()
        }
      },
      stop: () => {
        if (runnerRef.current?.stop) {
          runnerRef.current.stop()
        }
      },
      runFile: async (path: string, opts?: import("@/runners/types").RunFileOptions) => {
        if (runnerRef.current?.runFile) {
          await runnerRef.current.runFile(path, opts)
        }
      },
      postMessage: (message: Record<string, unknown>) => {
        if (runnerRef.current?.postMessage) {
          runnerRef.current.postMessage(message)
        }
      },
      runSystemCommand: async (cmd: string, args: Record<string, unknown>) => {
        // 1. Try forwarding to runner (preferred)
        if (runnerRef.current?.runSystemCommand) {
          try {
            return await runnerRef.current.runSystemCommand(cmd, args)
          } catch (e: unknown) {
            // If runtime not ready, fall back to local
            const errMsg = e instanceof Error ? e.message : String(e)
            if (!errMsg.includes("Runtime not ready")) {
              throw e
            }
          }
        }

        // 2. Local Fallback for 'aplay'
        if (cmd === "aplay") {
          const { filename } = args
          const file = props.files.find((f) => f.name === filename)
          if (!file) throw new Error(`File '${filename}' not found`)

          // Decode content
          let buffer: ArrayBuffer | null = null
          if (file.content instanceof Uint8Array) {
            buffer = file.content.buffer as unknown as ArrayBuffer
          } else if (typeof file.content === "string") {
            // Try base64
            try {
              const bin = atob(file.content)
              const len = bin.length
              const bytes = new Uint8Array(len)
              for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i)
              buffer = bytes.buffer
            } catch {
              // Not base64, maybe raw text (unlikely for wav) or utf8?
              // Just try playing what we have?
              // Creating buffer from string directly is hard without context.
              // Assuming base64 for now if string.
            }
          } else if (
            file.content instanceof ArrayBuffer ||
            file.content instanceof SharedArrayBuffer
          ) {
            buffer = file.content as unknown as ArrayBuffer
          }

          if (!buffer) throw new Error("Could not read audio file content")

          // Play locally
          const audioContext = new (
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          )()

          const ctx = audioContext
          try {
            const audioBuffer = await ctx.decodeAudioData(buffer.slice(0)) // slice to copy if needed
            const source = ctx.createBufferSource()
            source.buffer = audioBuffer
            source.connect(ctx.destination)

            if (ctx.state === "suspended") await ctx.resume()

            source.start(0)

            // Wait for completion (sync mode)
            // If args.async is true, shell already handled it?
            // ScapeEditor sends 'async: false' usually because shell waits for our promise?
            // Wait... ScapeEditor sends { async: isAsync }.
            // If isAsync is true, we should resolve immediately?
            // Actually, Shell calls `command &` -> shell doesn't await `runSystemCommand`.
            // So we can ALWAYS await here?
            // NO. If shell waits, we must wait.

            return new Promise<void>((resolve) => {
              source.onended = () => {
                ctx.close().catch(() => {})
                resolve()
              }
            })
          } catch (e: unknown) {
            ctx.close().catch(() => {})
            const errMsg = e instanceof Error ? e.message : String(e)
            throw new Error(`Failed to play audio: ${errMsg}`)
          }
        }

        throw new Error(`System command '${cmd}' not supported in this environment`)
      },
    }))

    // STOPPED STATE
    if (!isRunning && props.showStoppedOverlay !== false) {
      return (
        <div className="flex h-full flex-col border-l border-border bg-muted/5 dark:border-zinc-800">
          {/* Header for Stopped State */}
          <div className="flex h-10 items-center justify-between border-b border-border bg-muted/20 px-2 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MonitorPlay className="h-3.5 w-3.5" />
              <span>Preview (Stopped)</span>
            </div>
            {props.onCollapse && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={props.onCollapse}
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            )}
          </div>
          {/* Overlay Content */}
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
            <div className="mb-4 rounded-full bg-muted p-4">
              <MonitorPlay className="h-8 w-8 opacity-20" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-foreground">Scape Stopped</h3>
            <p className="max-w-xs text-center text-sm">The environment is currently stopped.</p>
          </div>
        </div>
      )
    }

    const config = ENVIRONMENTS[environment]
    // Default to WebRunner if unknown, or specifically PythonRunner for python
    // In future this can be dynamic based on 'runner' field in config
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let RunnerComponent: any = WebRunner

    if (config?.runner === "python-runner") RunnerComponent = PythonRunner
    if (config?.runner === "flow-runner") RunnerComponent = FlowRunner
    if (config?.runner === "r-runner") RunnerComponent = RRunner

    return (
      <RunnerComponent
        files={props.files}
        scapeId={scapeId}
        onCollapse={props.onCollapse}
        onOutput={props.onOutput}
        dependencies={props.dependencies}
        onBusyChange={onBusyChange}
        onInputRequest={props.onInputRequest}
        onFileSystemUpdate={props.onFileSystemUpdate}
        onSystemCommand={props.onSystemCommand}
        project={props.project}
        ref={runnerRef}
      />
    )
  })
)

PreviewPane.displayName = "PreviewPane"
