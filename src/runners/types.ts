import type { ScapeFile } from "@/types/file"
import type { LogEntry } from "@/types/log"

export interface ScapeRunnerProps {
  files: ScapeFile[]
  dependencies?: string[]
  onOutput?: (log: LogEntry) => void
  onCollapse?: () => void
  onBusyChange?: (isBusy: boolean) => void
  onInputRequest?: (prompt: string) => Promise<string> | void
  isLive?: boolean
}

// Options for runFile when executing from terminal
export interface RunFileOptions {
  onOutput?: (content: string, type: "stdout" | "stderr") => void
  onInputRequest?: (prompt: string) => Promise<string>
  // Pass files directly to bypass debounced props
  files?: { name: string; content: string | Uint8Array; language: string }[]
}

export interface ScapeRunnerHandle {
  captureThumbnail(): Promise<string | null>
  restart(): Promise<void>
  installPackage(
    pkg: string,
    onProgress?: (message: string) => void
  ): Promise<{ success: boolean; error?: string }>
  listPackages?: () => Promise<{ name: string; version: string }[]>
  run?: () => void
  runFile?: (path: string, opts?: RunFileOptions) => Promise<void>
  stop?: () => void
  updateScript?: (code: string) => void
  provideInput?: (text: string) => void
  postMessage?: (message: Record<string, unknown>) => void
  runSystemCommand?: (cmd: string, args: Record<string, unknown>) => Promise<void>
}
