import Dexie, { type EntityTable } from "dexie"

export interface Scape {
  id: number
  name: string
  type: string // 'blank' | 'three' | 'p5' | 'html'
  source: "local" | "cloud"
  syncStatus?: "synced" | "dirty" | "offline"
  authorId?: string
  cloudId?: string
  thumbnail?: string // Base64 data URL
  createdAt: Date
  updatedAt: Date
}

export interface File {
  id: number
  scapeId: number
  name: string
  content: string
  language: string
}

const db = new Dexie("CodeScapeDB") as Dexie & {
  scapes: EntityTable<Scape, "id">
  files: EntityTable<File, "id">
}

// Version 2: Added source, syncStatus, authorId, cloudId
db.version(2)
  .stores({
    scapes: "++id, name, type, source, createdAt, updatedAt",
    files: "++id, scapeId, name, [scapeId+name]",
  })
  .upgrade((tx) => {
    return tx
      .table("scapes")
      .toCollection()
      .modify((scape) => {
        scape.source = "local"
        scape.syncStatus = "offline"
      })
  })

// Version 3: Added thumbnail
db.version(3)
  .stores({
    scapes: "++id, name, type, source, createdAt, updatedAt", // thumbnail is not indexed
    files: "++id, scapeId, name, [scapeId+name]",
  })
  .upgrade(() => {
    // No migration needed for new optional field, but we can init it if we wanted
  })

// Helper to delete a scape and its files transactionally
export async function deleteScape(id: number) {
  await db.transaction("rw", db.scapes, db.files, async () => {
    await db.files.where("scapeId").equals(id).delete()
    await db.scapes.delete(id)
  })
}

export { db }
