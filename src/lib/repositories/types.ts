import type { ScapeFile } from "@/types/file"
import type { Scape } from "@/lib/db" // Re-using DB type for now, might decouple later

export interface IScapeRepository {
  // Scape Operations
  getScape(id: string): Promise<Scape | undefined>
  listScapes(userId?: string): Promise<Scape[]>
  saveScape(scape: Scape): Promise<void>
  updateScape(id: string, updates: Partial<Scape>): Promise<void>
  deleteScape(id: string): Promise<void>

  // File Operations
  getFiles(scapeId: string): Promise<ScapeFile[]>
  createFile(file: ScapeFile & { scapeId: string }): Promise<void>
  bulkCreateFiles(files: (ScapeFile & { scapeId: string })[]): Promise<void>
  updateFileContent(id: string, content: string | Blob | ArrayBuffer | Uint8Array): Promise<void>
  updateFileName(id: string, name: string): Promise<void>
  deleteFile(id: string): Promise<void>

  // Bulk Operations (for complex moves/deletes)
  bulkDeleteFiles(ids: string[]): Promise<void>
  bulkUpdateFiles(updates: { id: string; changes: Partial<ScapeFile> }[]): Promise<void>

  // Community Features
  getPublicScapes(filter?: "web" | "python" | "flow"): Promise<Scape[]>
  toggleLike(scapeId: string, userId: string): Promise<boolean> // returns true if liked
  getComments(scapeId: string): Promise<any[]>
  addComment(scapeId: string, userId: string, content: string): Promise<void>
  forkScape(scapeId: string, userId: string): Promise<string> // returns new scapeId

  // Realtime
  subscribeToFiles?(
    scapeId: string,
    callback: (event: "INSERT" | "UPDATE" | "DELETE", payload: unknown) => void
  ): () => void
}
