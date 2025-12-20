import type { ScapeFile } from "@/types/file"
import type { LogEntry } from "@/types/log"

export interface ScapeRunnerProps {
  files: ScapeFile[]
  dependencies?: string[]
  onOutput?: (log: LogEntry) => void
  onCollapse?: () => void
  onBusyChange?: (isBusy: boolean) => void
  onInputRequest?: (prompt: string) => void
  isLive?: boolean
}

export interface ScapeRunnerHandle {
  captureThumbnail(): Promise<string | null>
  restart(): Promise<void>
  installPackage(
    pkg: string,
    onProgress?: (message: string) => void
  ): Promise<{ success: boolean; error?: string }>
}
