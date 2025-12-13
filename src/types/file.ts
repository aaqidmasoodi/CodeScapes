export type FileType = "html" | "css" | "javascript" | "json" | "markdown" | "folder"

export interface ScapeFile {
  id?: number
  name: string
  content: string
  language: FileType
}
