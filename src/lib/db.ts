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
  is_public?: boolean
}

export interface File {
  id: string // UUID
  scapeId: string // UUID
  name: string
  content: string | Blob | ArrayBuffer | Uint8Array
  language: string
}

export interface Autosave {
  id: string // scapeId
  data: any // Project JSON
  timestamp: number
}

const db = new Dexie("CodeScapeNext") as Dexie & {
  scapes: EntityTable<Scape, "id">
  files: EntityTable<File, "id">
  autosaves: EntityTable<Autosave, "id">
}

// Version 1: Clean Slate (If we need to migrate we'd add version(2))
// Since we are dev, we can update version 1 or add 2. Let's add 2 to be safe if DB exists.
// Handle blocked upgrades (e.g. other tabs open)
db.on("versionchange", () => {
  // Protocol: Close connection to allow other tabs to upgrade
  db.close()
  // Reload to pick up new version
  window.location.reload()
})

db.on("blocked", () => {
  console.error("Database upgrade blocked. Close other tabs.")
  // Note: alert might be intrusive but effective for this specific "stuck" case
  alert("Database upgrade blocked! Please close other CodeScape tabs to continue.")
})

db.version(2).stores({
  scapes: "id, name, environment, source, createdAt, updatedAt, *dependencies",
  files: "id, scapeId, name, [scapeId+name]",
  autosaves: "id, timestamp"
})

// Helper to delete a scape and its files transactionally
export async function deleteScape(id: string) {
  await db.transaction("rw", db.scapes, db.files, async () => {
    await db.files.where("scapeId").equals(id).delete()
    await db.scapes.delete(id)
  })
}

export { db }
