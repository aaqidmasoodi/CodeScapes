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

export interface ScapeFile {
  id?: number
  name: string
  content: string | Blob | ArrayBuffer | Uint8Array
  language: FileType
}
