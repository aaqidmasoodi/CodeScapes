import Dexie, { type EntityTable } from "dexie"
import type { EnvironmentId } from "@/types/environment"

export interface Scape {
  id: number
  name: string
  environment: EnvironmentId
  template: string // The ID of the template used (e.g. 'blank', 'threejs')
  source: "local" | "cloud"
  syncStatus?: "synced" | "dirty" | "offline"
  authorId?: string
  cloudId?: string
  thumbnail?: string // Base64 data URL
  createdAt: Date
  updatedAt: Date
  dependencies?: string[] // Installed Package Names
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
db.version(3).stores({
  scapes: "++id, name, type, source, createdAt, updatedAt",
  files: "++id, scapeId, name, [scapeId+name]",
})

// Version 4: Environments Architecture
db.version(4)
  .stores({
    scapes: "++id, name, environment, source, createdAt, updatedAt", // Replaced 'type' with 'environment'
    files: "++id, scapeId, name, [scapeId+name]",
  })
  .upgrade((tx) => {
    return (
      tx
        .table("scapes")
        .toCollection()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .modify((scape: any) => {
          // Default to Web environment for existing projects
          scape.environment = "web"
          // Migrate old 'type' to 'template'
          if (scape.type) {
            scape.template = scape.type
            delete scape.type
          } else {
            scape.template = "blank"
          }
        })
    )
  })

// Version 5: Package Manager
db.version(5)
  .stores({
    scapes: "++id, name, environment, source, createdAt, updatedAt, *dependencies", // Index dependencies for searching
    files: "++id, scapeId, name, [scapeId+name]",
  })
  .upgrade((tx) => {
    return tx
      .table("scapes")
      .toCollection()
      .modify((scape) => {
        if (!scape.dependencies) {
          scape.dependencies = []
        }
      })
  })

// Helper to delete a scape and its files transactionally
export async function deleteScape(id: number) {
  await db.transaction("rw", db.scapes, db.files, async () => {
    await db.files.where("scapeId").equals(id).delete()
    await db.scapes.delete(id)
  })
}

export { db }
