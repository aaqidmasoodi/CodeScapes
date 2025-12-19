import type { ScapeFile } from "@/types/file"

export interface ShellOutput {
  content: string
  type: "stdout" | "stderr" | "info" | "success" | "error"
}

export interface ShellContext {
  // The current working directory (virtual)
  cwd: string
  // Full access to the file system state
  files: ScapeFile[]
  // Kernel Methods
  createFile: (name: string, type: ScapeFile["language"], content?: string) => Promise<void>
  updateFile: (name: string, content: string) => Promise<void>
  deleteFile: (name: string) => Promise<void>
  // Output handler (for streaming output if needed, though usually we return formatted output)
  log: (output: ShellOutput) => void
}

export interface ParsedCommand {
  command: string
  args: string[]
  redirect?: {
    type: "write" | "append" // > or >>
    target: string
  }
}

export type CommandHandler = (args: string[], context: ShellContext) => Promise<ShellOutput | void>
