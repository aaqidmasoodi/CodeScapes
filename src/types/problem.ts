export interface Problem {
  id: string
  file: string
  message: string
  line: number
  column: number
  severity: "error" | "warning" | "info"
  source: "syntax" | "runtime"
}
