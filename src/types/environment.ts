import type { ScapeFile } from "./file"
import type { LucideIcon } from "lucide-react"

export type EnvironmentId = "web" | "python" | "node" | "flowscape" | "r"

export interface TemplateConfig {
  id: string
  name: string
  description: string
  dependencies?: string[] // Pre-installed packages for this template
  files: ScapeFile[]
}

export interface EnvironmentConfig {
  id: EnvironmentId
  name: string
  description: string
  icon: LucideIcon

  // File System Rules
  entryPoint: string
  allowedExtensions: string[]

  // UI Configuration
  defaultLayout: "preview" | "terminal"
  runner: "web-runner" | "python-runner" | "flow-runner" | "r-runner"

  // Templates available for this environment
  templates: TemplateConfig[]
}
