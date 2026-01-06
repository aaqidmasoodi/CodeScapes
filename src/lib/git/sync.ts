/**
 * Supabase Sync for Git Repositories
 *
 * Serializes the IndexedDB-stored repo to a blob and syncs with Supabase Storage.
 */

import { supabase } from "@/lib/supabase"
import { getFS, getRepoDir, initRepo } from "./repo"

const STORAGE_BUCKET = "scapes"
const REPO_FILENAME = "repo.json"

/**
 * Serialize the repo to a JSON blob containing all files
 */
async function serializeRepo(scapeId: string): Promise<string> {
  const fs = getFS(scapeId)
  const dir = getRepoDir(scapeId)

  const data: Record<string, string> = {}

  async function walkDir(currentPath: string, prefix = "") {
    const entries = await fs.promises.readdir(currentPath)

    for (const entry of entries) {
      const fullPath = `${currentPath}/${entry}`
      const relativePath = prefix ? `${prefix}/${entry}` : entry

      try {
        const stat = await fs.promises.stat(fullPath)

        if (stat.isDirectory()) {
          await walkDir(fullPath, relativePath)
        } else {
          const content = await fs.promises.readFile(fullPath, "utf8")
          data[relativePath] = content as string
        }
      } catch {
        // Skip files we can't read
      }
    }
  }

  await walkDir(dir)

  return JSON.stringify(data)
}

/**
 * Restore a repo from a JSON blob
 */
async function deserializeRepo(scapeId: string, jsonData: string): Promise<void> {
  const fs = getFS(scapeId)
  const dir = getRepoDir(scapeId)

  const data = JSON.parse(jsonData) as Record<string, string>

  // Create base directory
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await fs.promises.mkdir(dir, { recursive: true } as any)
  } catch {
    // May already exist
  }

  // Write all files
  for (const [relativePath, content] of Object.entries(data)) {
    const fullPath = `${dir}/${relativePath}`

    // Ensure parent directories exist
    const parts = relativePath.split("/")
    if (parts.length > 1) {
      const parentDir = `${dir}/${parts.slice(0, -1).join("/")}`
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await fs.promises.mkdir(parentDir, { recursive: true } as any)
      } catch {
        // May already exist
      }
    }

    await fs.promises.writeFile(fullPath, content, "utf8")
  }
}

/**
 * Save repo to Supabase Storage
 */
export async function saveToSupabase(
  scapeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const json = await serializeRepo(scapeId)
    const blob = new Blob([json], { type: "application/json" })

    const path = `${scapeId}/${REPO_FILENAME}`

    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
      upsert: true,
      contentType: "application/json",
    })

    if (error) {
      console.error("[Git Sync] Failed to save to Supabase:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[Git Sync] Error serializing repo:", message)
    return { success: false, error: message }
  }
}

/**
 * Load repo from Supabase Storage
 */
export async function loadFromSupabase(
  scapeId: string
): Promise<{ success: boolean; exists: boolean; error?: string }> {
  try {
    const path = `${scapeId}/${REPO_FILENAME}`

    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(path)

    if (error) {
      if (error.message.includes("not found") || error.message.includes("404")) {
        return { success: true, exists: false }
      }
      console.error("[Git Sync] Failed to load from Supabase:", error)
      return { success: false, exists: false, error: error.message }
    }

    if (!data) {
      return { success: true, exists: false }
    }

    const json = await data.text()
    await deserializeRepo(scapeId, json)

    return { success: true, exists: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[Git Sync] Error restoring repo:", message)
    return { success: false, exists: false, error: message }
  }
}

/**
 * Initialize repo from Supabase or create new
 */
export async function initFromSupabase(scapeId: string): Promise<void> {
  // Try to load from Supabase
  const result = await loadFromSupabase(scapeId)

  if (!result.exists) {
    // No existing repo, initialize new one
    await initRepo(scapeId)
  }
}

/**
 * Delete repo from Supabase Storage
 */
export async function deleteFromSupabase(scapeId: string): Promise<void> {
  const path = `${scapeId}/${REPO_FILENAME}`
  await supabase.storage.from(STORAGE_BUCKET).remove([path])
}
