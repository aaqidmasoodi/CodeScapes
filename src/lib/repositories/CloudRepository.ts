import { supabase } from "@/lib/supabase"
import type { Scape } from "@/lib/db"
import type { ScapeFile, FileType } from "@/types/file"
import type { IScapeRepository } from "./types"

// --- Helpers for Binary Support ---

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary_string = atob(base64)
  const len = binary_string.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes
}

export class CloudRepository implements IScapeRepository {
  /**
   * Uploads a binary asset to Supabase Storage and returns the Public URL.
   */
  private async uploadAsset(id: string, content: Blob | ArrayBuffer | Uint8Array): Promise<string> {
    const path = `assets/${id}` // Flat structure usage file ID
    let body: BodyInit

    if (content instanceof Uint8Array) {
      body = content.buffer as ArrayBuffer // Force cast to standard ArrayBuffer
    } else {
      body = content as Blob | ArrayBuffer
    }

    const { error } = await supabase.storage.from("scape-assets").upload(path, body, {
      upsert: true,
      contentType: content instanceof Blob ? content.type : undefined,
    })

    if (error) {
      console.error("Storage Upload Failed:", error)
      throw error
    }

    const { data } = supabase.storage.from("scape-assets").getPublicUrl(path)
    return data.publicUrl
  }

  private isBinary(content: string | Blob | ArrayBuffer | Uint8Array, language?: string): boolean {
    if (content instanceof Blob || content instanceof ArrayBuffer || content instanceof Uint8Array)
      return true
    if (language === "image" || language === "binary") return true
    return false
  }

  private async processContentForStorage(
    id: string,
    content: string | Blob | ArrayBuffer | Uint8Array,
    language?: string
  ): Promise<string> {
    // 1. If it's already a URL (previous upload), return strict
    if (typeof content === "string" && content.startsWith("http")) return content

    // 2. If Binary, Upload to Storage
    if (this.isBinary(content, language)) {
      // Convert string to Blob if needed? No, string binary is rare unless base64.
      // If string and Language=Binary, it might be base64.
      if (typeof content === "string") {
        // Assume it is NOT binary if it is a simple string, unless base64 prefixed
        if (content.startsWith("base64:")) {
          const buf = base64ToArrayBuffer(content.slice(7))
          return this.uploadAsset(id, buf)
        }
        // Otherwise treat as text
        return content
      }
      return this.uploadAsset(id, content)
    }

    // 3. Fallback for text strings (standard code)
    if (typeof content === "string") return content

    // 4. Edge case: Small binary? Use base64? No, user wants storage.
    // If somehow fell through (e.g. unknown type), default to base64 legacy
    // reuse legacy logic inline if needed, but uploadAsset covers Blob/Buffer.
    return this.uploadAsset(id, content as Blob)
  }

  /**
   * Downloads an asset from a URL (used for hydrating local DB from Cloud).
   */
  async downloadAsset(url: string): Promise<Blob> {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to download asset: ${response.statusText}`)
    return response.blob()
  }

  async getScape(id: string): Promise<Scape | undefined> {
    const { data, error } = await supabase.from("scapes").select("*").eq("id", id).maybeSingle()

    if (error) throw error
    if (!data) return undefined

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
      is_public: data.is_public || false,
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
      is_public: scape.is_public,
    })

    if (error) throw error
  }

  async updateScape(id: string, updates: Partial<Scape>): Promise<void> {
    // Map updates to snake_case
    const dbUpdates: Record<string, unknown> = {}
    if (updates.name) dbUpdates.name = updates.name
    if (updates.thumbnail) dbUpdates.thumbnail = updates.thumbnail
    if (updates.dependencies) dbUpdates.dependencies = updates.dependencies
    if (updates.is_public !== undefined) dbUpdates.is_public = updates.is_public
    if (updates.updatedAt) dbUpdates.updated_at = updates.updatedAt.toISOString()
    else dbUpdates.updated_at = new Date().toISOString()

    const { error } = await supabase.from("scapes").update(dbUpdates).eq("id", id)
    if (error) throw error
  }

  async getFiles(scapeId: string): Promise<ScapeFile[]> {
    const { data, error } = await supabase.from("files").select("*").eq("scape_id", scapeId)
    if (error) throw error

    return data.map((f) => {
      let content: string | Uint8Array = f.content || ""

      // Check for Base64 prefix
      if (typeof f.content === "string" && f.content.startsWith("base64:")) {
        try {
          content = base64ToArrayBuffer(f.content.slice(7))
        } catch {
          console.warn("Failed to decode base64 content for file:", f.name)
        }
        content = base64ToArrayBuffer(f.content.slice(7))
      }

      return {
        id: f.id,
        name: f.name,
        language: f.language as FileType,
        scapeId: f.scape_id,
        updatedAt: new Date(f.updated_at),
        content: content,
      }
    })
  }

  async createFile(file: ScapeFile & { scapeId: string }): Promise<void> {
    if (!file.id) throw new Error("File ID is required")

    const contentStr = await this.processContentForStorage(file.id, file.content, file.language)

    // Use upsert to handle cases where file already exists (e.g., reopening project)
    const { error } = await supabase.from("files").upsert(
      {
        id: file.id,
        scape_id: file.scapeId,
        name: file.name,
        language: file.language,
        content: contentStr,
      },
      { onConflict: "scape_id,name" }
    )

    if (error) throw error
  }

  async bulkCreateFiles(files: (ScapeFile & { scapeId: string })[]): Promise<void> {
    if (files.length === 0) return

    // Must resolve all content preps
    const rows = await Promise.all(
      files.map(async (f) => ({
        id: f.id,
        scape_id: f.scapeId,
        name: f.name,
        language: f.language,
        content: await this.processContentForStorage(f.id!, f.content, f.language),
      }))
    )

    const { error } = await supabase.from("files").insert(rows)
    if (error) throw error
  }

  async updateFileContent(
    id: string,
    content: string | Blob | ArrayBuffer | Uint8Array
  ): Promise<void> {
    const contentStr = await this.processContentForStorage(id, content)

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
    // 1. Fetch files to identify assets and enable explicit RLS-compliant deletion
    const files = await this.getFiles(id)

    // 2. Cleanup Storage Assets (Images/Binaries)
    const assetPaths: string[] = []
    files.forEach((f) => {
      // Check if content is a string URL pointing to our storage
      // The uploadAsset method uses path `assets/${fileId}`
      if (typeof f.content === "string" && f.content.includes("/scape-assets/")) {
        // We can infer the path from logic or construct it knowning the file ID convention
        // uploadAsset uses: `assets/${file.id}`
        assetPaths.push(`assets/${f.id}`)
      }
    })

    if (assetPaths.length > 0) {
      const { error: storageError } = await supabase.storage.from("scape-assets").remove(assetPaths)

      if (storageError) {
        console.warn("Failed to cleanup storage assets:", storageError)
        // Proceed anyway to ensure DB consistency
      }
    }

    // 3. Delete Files explicitly (Fixes RLS Cascade Issue)
    // RLS policy "Users can delete files..." requires the Scape to exist.
    // So we must delete files BEFORE deleting the Scape.
    if (files.length > 0) {
      const { error: filesError } = await supabase.from("files").delete().eq("scape_id", id)

      if (filesError) throw filesError
    }

    // 4. Delete Scape
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
      updates.map(async (u) => {
        const dbChanges: Record<string, unknown> = {} // Fixed 'any'
        if (u.changes.name) dbChanges.name = u.changes.name
        if (u.changes.content) {
          dbChanges.content = await this.processContentForStorage(
            u.id,
            u.changes.content,
            u.changes.language
          )
        }

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
          // NOTE: Server-side filtering for DELETE events requires REPLICA IDENTITY FULL and can be flaky.
          // We remove the filter here and filter client-side in the callback/hook to be safe.
          // Raw Payload: { schema: 'public', table: 'files', commit_timestamp: '...', eventType: '...', new: {}, old: {} }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p = payload as any
          const newData = p.new
          // Decode content if needed before callback
          if (
            (payload.eventType === "INSERT" || payload.eventType === "UPDATE") &&
            newData &&
            typeof newData.content === "string" &&
            newData.content.startsWith("base64:")
          ) {
            try {
              newData.content = base64ToArrayBuffer(newData.content.slice(7))
            } catch (e) {
              console.warn("Failed to decode realtime base64", e)
            }
          }

          // Pass full payload so receiver can check new/old explicitly
          callback(payload.eventType as "INSERT" | "UPDATE" | "DELETE", payload) // Cast eventType
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  // --- Community Implementation ---

  async getPublicScapes(filter?: "web" | "python" | "flow"): Promise<Scape[]> {
    let query = supabase
      .from("scapes")
      .select(`
        *,
        profiles (
          full_name,
          username,
          avatar_url
        ),
        deployments!published_version_id (
          thumbnail
        ),
        likes (count),
        comments (count)
      `)
      .eq("is_public", true)
      .not("published_version_id", "is", null)
      .order("updated_at", { ascending: false })

    if (filter) {
      if (filter === "web") query = query.eq("environment", "html-css-js") // Map 'web' to actual env ID
      else if (filter === "python") query = query.eq("environment", "python-script")
      // Mapping logic might need to be more robust or match EnvironmentIds directly
      // For now assume standard env IDs if passed directly, or map simplified
    }

    const { data, error } = await query
    if (error) throw error

    // Fetch stats in parallel or separate query?
    // For now simple list. Ideally we join with likes count but that requires View/RPC.
    // We'll leave stats empty for list view or fetch later.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((d: any) => {
      // Handle Supabase join sometimes returning array
      const deploymentRaw = d.deployments
      const deployment = Array.isArray(deploymentRaw) ? deploymentRaw[0] : deploymentRaw
      const frozenThumbnail = deployment?.thumbnail

      return {
        id: d.id,
        name: d.name,
        environment: d.environment as Scape["environment"],
        template: d.template,
        source: "cloud",
        authorId: d.author_id,
        syncStatus: "synced",
        createdAt: new Date(d.created_at),
        updatedAt: new Date(d.updated_at),
        thumbnail: frozenThumbnail || d.thumbnail, // PREFER FROZEN THUMBNAIL
        dependencies: d.dependencies || [],
        is_public: true,
        description: d.description,
        parentId: d.parent_id,
        author: d.profiles ? {
          name: d.profiles.full_name || d.profiles.username || "Unknown",
          avatar: d.profiles.avatar_url,
          username: d.profiles.username
        } : undefined,
        stats: {
          views: 0,
          likes: d.likes?.[0]?.count || 0,
          forks: 0
        }
      }
    })
  }

  async toggleLike(scapeId: string, userId: string): Promise<boolean> {
    // Check if liked
    const { data: existing } = await supabase
      .from("likes")
      .select("*")
      .eq("scape_id", scapeId)
      .eq("user_id", userId)
      .maybeSingle()

    if (existing) {
      await supabase.from("likes").delete().eq("scape_id", scapeId).eq("user_id", userId)
      return false
    } else {
      await supabase.from("likes").insert({ scape_id: scapeId, user_id: userId })
      return true
    }
  }

  async getComments(scapeId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("comments")
      .select("*, author:author_id(email)") // minimal user info
      .eq("scape_id", scapeId)
      .order("created_at", { ascending: true })

    if (error) throw error
    return data
  }

  async addComment(scapeId: string, userId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from("comments")
      .insert({ scape_id: scapeId, author_id: userId, content })
    if (error) throw error
  }

  async forkScape(scapeId: string, userId: string): Promise<string> {
    // 1. Fetch Original
    const original = await this.getScape(scapeId)
    if (!original) throw new Error("Scape not found")

    // 2. Create New Scape ID
    const newId = crypto.randomUUID()

    // 3. Save Scape Copy
    await this.saveScape({
      ...original,
      id: newId,
      name: `${original.name} (Fork)`,
      authorId: userId, // New Owner
      source: "cloud",
      parentId: original.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      is_public: false, // Private by default
    })

    // 4. Fetch Files
    const files = await this.getFiles(scapeId)

    // 5. Duplicate Files
    await this.bulkCreateFiles(
      files.map((f) => ({
        ...f,
        id: crypto.randomUUID(), // New File ID
        scapeId: newId,    // Link to New Scape
      }))
    )

    return newId
  }

  // --- Deployment System ---

  async deployScape(scapeId: string): Promise<string> {
    // 1. Fetch current scape and files
    const { data: scapeData, error: scapeError } = await supabase
      .from("scapes")
      .select("thumbnail")
      .eq("id", scapeId)
      .single()

    if (scapeError) throw scapeError

    const files = await this.getFiles(scapeId)

    // 2. Create Snapshot JSON
    const snapshot = {
      version: 1, // Schema version for the snapshot format itself
      timestamp: Date.now(),
      thumbnail: scapeData.thumbnail, // Cache the thumbnail
      files: files.map(f => ({
        name: f.name,
        content: f.content instanceof Uint8Array
          ? "base64:" + btoa(String.fromCharCode(...f.content))
          : f.content,
        language: f.language
      }))
    }

    // 3. Upload to Storage
    const deploymentId = crypto.randomUUID()
    const path = `${scapeId}/${deploymentId}.json`
    const fileBody = new Blob([JSON.stringify(snapshot)], { type: "application/json" })

    const { error: uploadError } = await supabase.storage
      .from("scape-deployments")
      .upload(path, fileBody, { upsert: true })

    if (uploadError) throw uploadError

    // 4. Create Deployment Record
    // Determine version number: fetch latest version + 1
    const { data: latest } = await supabase
      .from("deployments")
      .select("version")
      .eq("scape_id", scapeId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextVersion = (latest?.version || 0) + 1

    const { error: deployError } = await supabase
      .from("deployments")
      .insert({
        id: deploymentId,
        scape_id: scapeId,
        version: nextVersion,
        url: path, // Storing path relative to bucket
        thumbnail: scapeData.thumbnail // Freeze the thumbnail in the DB record too
      })

    if (deployError) throw deployError

    // 5. Update Scape with Published Version link
    // And ensure is_public is true (optional, maybe user wants private deployment?)
    // For community platform: Deployment usually implies Public.
    const { error: updateError } = await supabase
      .from("scapes")
      .update({
        published_version_id: deploymentId,
        updated_at: new Date().toISOString()
      })
      .eq("id", scapeId)

    if (updateError) throw updateError

    return deploymentId
  }

  async getPublishedScape(scapeId: string): Promise<{ scape: Scape, files: ScapeFile[] } | null> {
    // 1. Fetch Scape with published_version_id
    const { data: scapeData, error: scapeError } = await supabase
      .from("scapes")
      .select("*, published_version_id")
      .eq("id", scapeId)
      .maybeSingle()

    if (scapeError || !scapeData || !scapeData.published_version_id) return null

    // 2. Fetch Deployment Record to get Storage Path
    const { data: deployment, error: deployError } = await supabase
      .from("deployments")
      .select("url")
      .eq("id", scapeData.published_version_id)
      .single()

    if (deployError || !deployment) return null

    // 3. Download Snapshot JSON
    // Use helper if authenticated, or public URL if bucket is public.
    // Bucket is public, so we can use publicUrl or download.
    // "download" method requires auth usually for private buckets, but here it works for public too.
    // Using .download() from supabase client is robust.

    const { data: blob, error: downloadError } = await supabase.storage
      .from("scape-deployments")
      .download(deployment.url)

    if (downloadError) {
      console.error("Failed to download snapshot", downloadError)
      return null
    }

    const text = await blob.text()
    const snapshot = JSON.parse(text)

    // 4. Hydrate
    const files: ScapeFile[] = snapshot.files.map((f: any) => {
      let content = f.content
      if (typeof content === "string" && content.startsWith("base64:")) {
        content = base64ToArrayBuffer(content.slice(7))
      }
      return {
        id: crypto.randomUUID(), // Virtual ID
        scapeId: scapeId,
        name: f.name,
        language: f.language,
        content: content,
        updatedAt: new Date(snapshot.timestamp)
      }
    })

    const scape: Scape = {
      id: scapeData.id,
      name: scapeData.name,
      environment: scapeData.environment as Scape["environment"],
      template: scapeData.template,
      source: "cloud",
      authorId: scapeData.author_id,
      createdAt: new Date(scapeData.created_at),
      updatedAt: new Date(scapeData.updated_at),
      thumbnail: snapshot.thumbnail || scapeData.thumbnail, // Use cached thumbnail if available
      dependencies: scapeData.dependencies || [],
      is_public: scapeData.is_public,
      description: scapeData.description,
      parentId: scapeData.parent_id,
    }

    return { scape, files }
  }

  async getDeployments(scapeId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("deployments")
      .select("id, version, created_at, thumbnail")
      .eq("scape_id", scapeId)
      .order("version", { ascending: false })

    if (error) throw error
    return data
  }
}
