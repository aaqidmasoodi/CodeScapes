export interface LogEntry {
  id: string
  type: "stdout" | "stderr" | "system"
  content: string
  timestamp: number
}
