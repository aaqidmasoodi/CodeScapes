import { useRef, forwardRef, useImperativeHandle, memo } from "react"
import { MonitorPlay, PanelRightClose } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ScapeFile } from "@/types/file"
import { ENVIRONMENTS } from "@/config/environments"
import type { EnvironmentId } from "@/types/environment"
import { PythonRunner } from "@/runners/python/PythonRunner"
import { WebRunner } from "@/runners/web/WebRunner"
import { FlowRunner } from "@/runners/flow/FlowRunner"
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
        project={props.project}
        ref={runnerRef}
      />
    )
  })
)

PreviewPane.displayName = "PreviewPane"
