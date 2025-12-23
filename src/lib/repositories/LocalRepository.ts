import { db, type Scape } from "@/lib/db"
import type { ScapeFile, FileType } from "@/types/file"
import type { IScapeRepository } from "./types"

export class LocalRepository implements IScapeRepository {
  async getScape(id: string): Promise<Scape | undefined> {
    return db.scapes.get(id)
  }

  async listScapes(): Promise<Scape[]> {
    return db.scapes.orderBy("createdAt").reverse().toArray()
  }

  async saveScape(scape: Scape): Promise<void> {
    await db.scapes.put(scape)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async _update(_scapeId: string, _content: Partial<Scape>, _userId?: string): Promise<Scape> {
    throw new Error("Method not implemented.")
  }

  async updateScape(id: string, updates: Partial<Scape>): Promise<void> {
    await db.scapes.update(id, updates)
  }

  async deleteScape(id: string): Promise<void> {
    // Transactional delete
    await db.transaction("rw", db.scapes, db.files, async () => {
      await db.files.where("scapeId").equals(id).delete()
      await db.scapes.delete(id)
    })
  }

  async getFiles(scapeId: string): Promise<ScapeFile[]> {
    const files = await db.files.where("scapeId").equals(scapeId).toArray()
    return files.map((f) => ({
      id: f.id, // Strictly string now
      name: f.name,
      language: f.language as FileType,
      content: f.content,
      // scapeId is internal to DB, but ScapeFile doesn't strictly need it if context is known
      // But typically ScapeFile interface might have it. Let's check type definition if needed.
    }))
  }

  async createFile(file: ScapeFile & { scapeId: string }): Promise<void> {
    if (!file.id) throw new Error("File ID is required")
    await db.files.add({
      id: file.id,
      scapeId: file.scapeId,
      name: file.name,
      language: file.language,
      content: file.content,
    })
  }

  async bulkCreateFiles(files: (ScapeFile & { scapeId: string })[]): Promise<void> {
    await db.files.bulkAdd(
      files.map((f) => ({
        id: f.id,
        scapeId: f.scapeId,
        name: f.name,
        language: f.language,
        content: f.content,
      }))
    )
  }

  async updateFileContent(
    id: string,
    content: string | Blob | ArrayBuffer | Uint8Array
  ): Promise<void> {
    await db.files.update(id, { content })
  }

  async updateFileName(id: string, name: string): Promise<void> {
    await db.files.update(id, { name })
  }

  async deleteFile(id: string): Promise<void> {
    await db.files.delete(id)
  }

  async bulkDeleteFiles(ids: string[]): Promise<void> {
    await db.files.bulkDelete(ids)
  }

  async bulkUpdateFiles(updates: { id: string; changes: Partial<ScapeFile> }[]): Promise<void> {
    // Dexie doesn't have a bulkUpdate in the same way, so Promise.all is fine
    await Promise.all(
      updates.map((u) => {
        // Map ScapeFile keys to DB keys if they differ (they partially do)
        // ScapeFile has {id, name, ...} which matches.
        return db.files.update(u.id, u.changes)
      })
    )
  }
  // --- Community Stubs (Local repo doesn't support them fully yet) ---
  async getPublicScapes(): Promise<Scape[]> {
    return []
  }
  async toggleLike(): Promise<boolean> {
    return false
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getComments(_scapeId: string): Promise<unknown[]> {
    return []
  }
  async addComment(): Promise<void> {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async forkScape(_scapeId: string, _userId: string): Promise<string> {
    // Basic local fork? Maybe later. For now throw or no-op.
    throw new Error("Local fork not implemented")
  }
}
