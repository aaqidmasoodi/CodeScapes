import Dexie, { type EntityTable } from "dexie"
import type { EnvironmentId } from "@/types/environment"

export interface Scape {
  id: string // UUID
  name: string
  environment: EnvironmentId
  template: string
  source: "local" | "cloud"
  syncStatus?: "synced" | "dirty" | "offline"
  authorId?: string
  cloudId?: string
  thumbnail?: string // Base64 data URL (or URL in future)
  createdAt: Date
  updatedAt: Date
  dependencies?: string[]
}

export interface File {
  id: string // UUID
  scapeId: string // UUID
  name: string
  content: string | Blob | ArrayBuffer | Uint8Array
  language: string
}

const db = new Dexie("CodeScapeNext") as Dexie & {
  scapes: EntityTable<Scape, "id">
  files: EntityTable<File, "id">
}

// Version 1: Clean Slate
db.version(1).stores({
  scapes: "id, name, environment, source, createdAt, updatedAt, *dependencies", // 'id' (no ++) means manual UUID
  files: "id, scapeId, name, [scapeId+name]", // 'id' (no ++) means manual UUID
})

// Helper to delete a scape and its files transactionally
export async function deleteScape(id: string) {
  await db.transaction("rw", db.scapes, db.files, async () => {
    await db.files.where("scapeId").equals(id).delete()
    await db.scapes.delete(id)
  })
}

export { db }
