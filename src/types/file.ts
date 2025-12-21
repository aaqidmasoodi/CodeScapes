export type FileType =
  | "html"
  | "css"
  | "javascript"
  | "json"
  | "markdown"
  | "folder"
  | "python"
  | "image"
  | "binary"
  | "csv"
  | "plaintext"

export interface ScapeFile {
  id?: string // Changed from number to string (UUID)
  name: string
  content: string | Blob | ArrayBuffer | Uint8Array
  language: FileType
}
