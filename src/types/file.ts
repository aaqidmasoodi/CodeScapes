export type FileType = "html" | "css" | "javascript" | "json" | "markdown" | "folder" | "python"

export interface ScapeFile {
  id?: number
  name: string
  content: string
  language: FileType
}
