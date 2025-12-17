import { supabase } from "@/lib/supabase"
import type { Scape } from "@/lib/db"
import type { ScapeFile, FileType } from "@/types/file"
import type { IScapeRepository } from "./types"

export class CloudRepository implements IScapeRepository {
  async getScape(id: string): Promise<Scape | undefined> {
    const { data, error } = await supabase.from("scapes").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return undefined // Not found
      throw error
    }

    // Map snake_case DB to camelCase Application
    return {
      id: data.id,
      name: data.name,
      environment: data.environment as Scape["environment"],
      template: data.template,
      source: "cloud", // Enforce cloud source
      authorId: data.author_id,
      syncStatus: "synced", // Fetched from cloud = synced
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      thumbnail: data.thumbnail,
      dependencies: data.dependencies || [],
    }
  }

  async listScapes(userId?: string): Promise<Scape[]> {
    if (!userId) return []

    const { data, error } = await supabase
      .from("scapes")
      .select("*")
      .eq("author_id", userId)
      .order("updated_at", { ascending: false })

    if (error) throw error

    return data.map((d) => ({
      id: d.id,
      name: d.name,
      environment: d.environment as Scape["environment"],
      template: d.template,
      source: "cloud",
      authorId: d.author_id,
      syncStatus: "synced",
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
      thumbnail: d.thumbnail,
      dependencies: d.dependencies || [],
    }))
  }

  async saveScape(scape: Scape): Promise<void> {
    const { error } = await supabase.from("scapes").upsert({
      id: scape.id,
      name: scape.name,
      environment: scape.environment,
      template: scape.template,
      source: "cloud",
      author_id: scape.authorId,
      updated_at: new Date().toISOString(),
      thumbnail: scape.thumbnail,
      dependencies: scape.dependencies,
    })

    if (error) throw error
  }

  async updateScape(id: string, updates: Partial<Scape>): Promise<void> {
    // Map updates to snake_case
    const dbUpdates: Record<string, unknown> = {}
    if (updates.name) dbUpdates.name = updates.name
    if (updates.thumbnail) dbUpdates.thumbnail = updates.thumbnail
    if (updates.dependencies) dbUpdates.dependencies = updates.dependencies
    if (updates.updatedAt) dbUpdates.updated_at = updates.updatedAt.toISOString()
    else dbUpdates.updated_at = new Date().toISOString()

    const { error } = await supabase.from("scapes").update(dbUpdates).eq("id", id)
    if (error) throw error
  }

  async getFiles(scapeId: string): Promise<ScapeFile[]> {
    const { data, error } = await supabase.from("files").select("*").eq("scape_id", scapeId)
    if (error) throw error

    return data.map((f) => ({
      id: f.id,
      name: f.name,
      language: f.language as FileType,
      content: f.content,
    }))
  }

  async createFile(file: ScapeFile & { scapeId: string }): Promise<void> {
    if (!file.id) throw new Error("File ID is required")

    // Ensure content is string
    let contentStr = ""
    if (typeof file.content === "string") contentStr = file.content
    else {
      // TODO: Handle binary content (upload to storage?)
      console.warn(
        "CloudRepository: Binary content not yet fully supported, saving as empty string."
      )
      contentStr = ""
    }

    const { error } = await supabase.from("files").insert({
      id: file.id,
      scape_id: file.scapeId,
      name: file.name,
      language: file.language,
      content: contentStr,
    })

    if (error) throw error
  }

  async bulkCreateFiles(files: (ScapeFile & { scapeId: string })[]): Promise<void> {
    if (files.length === 0) return

    const rows = files.map((f) => ({
      id: f.id,
      scape_id: f.scapeId,
      name: f.name,
      language: f.language,
      content: typeof f.content === "string" ? f.content : "", // TODO binary
    }))

    const { error } = await supabase.from("files").insert(rows)
    if (error) throw error
  }

  async updateFileContent(
    id: string,
    content: string | Blob | ArrayBuffer | Uint8Array
  ): Promise<void> {
    let contentStr = ""
    if (typeof content === "string") contentStr = content
    else {
      // TODO: Binary support
      console.warn("CloudRepository: Binary content update ignored.")
      return
    }

    const { error } = await supabase
      .from("files")
      .update({ content: contentStr, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error
  }

  async updateFileName(id: string, name: string): Promise<void> {
    const { error } = await supabase
      .from("files")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error
  }

  async deleteFile(id: string): Promise<void> {
    const { error } = await supabase.from("files").delete().eq("id", id)
    if (error) throw error
  }

  async deleteScape(id: string): Promise<void> {
    const { error } = await supabase.from("scapes").delete().eq("id", id)
    if (error) throw error
  }

  async bulkDeleteFiles(ids: string[]): Promise<void> {
    if (ids.length === 0) return
    const { error } = await supabase.from("files").delete().in("id", ids)
    if (error) throw error
  }

  async bulkUpdateFiles(updates: { id: string; changes: Partial<ScapeFile> }[]): Promise<void> {
    // Supabase doesn't have a single bulk update endpoint for different values per row easily without RCP.
    // Parallel updates for now.
    await Promise.all(
      updates.map((u) => {
        const dbChanges: Record<string, unknown> = {} // Fixed 'any'
        if (u.changes.name) dbChanges.name = u.changes.name
        if (u.changes.content && typeof u.changes.content === "string")
          dbChanges.content = u.changes.content

        return supabase.from("files").update(dbChanges).eq("id", u.id)
      })
    )
  }

  subscribeToFiles(
    scapeId: string,
    callback: (event: "INSERT" | "UPDATE" | "DELETE", payload: unknown) => void // Fixed 'any'
  ): () => void {
    const channel = supabase
      .channel(`scape-files:${scapeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "files",
          // NOTE: Server-side filtering for DELETE events requires REPLICA IDENTITY FULL and can be flaky.
          // We remove the filter here and filter client-side in the callback/hook to be safe.
          // RLS ensures we only see our own files anyway.
        },
        (payload) => {
          // Pass full payload so receiver can check new/old explicitly
          callback(payload.eventType as "INSERT" | "UPDATE" | "DELETE", payload) // Cast eventType
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}
