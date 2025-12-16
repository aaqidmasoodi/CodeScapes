import { useState, useEffect, useCallback, useRef } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import type { ScapeFile, FileType } from "@/types/file"

export function useFileSystem(scapeId: string | number) {
  const [files, setFiles] = useState<ScapeFile[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Live Query to DB
  const dbFiles = useLiveQuery(() => db.files.where("scapeId").equals(scapeId).toArray(), [scapeId])

  // --- Synchronization Logic ---

  useEffect(() => {
    if (!dbFiles) return

    // Map DB files to ScapeFiles
    const mappedFiles: ScapeFile[] = dbFiles.map((f) => ({
      id: f.id,
      name: f.name,
      language: f.language as unknown as FileType,
      content: f.content,
    }))

    if (!isInitialized) {
      // First Load: Trust DB
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFiles(mappedFiles)
      setIsInitialized(true)
    } else {
      // Subsequent Updates: Smart Sync
      // We only want to accept changes from the DB if the STRUCTURE changed (added/removed/renamed files)
      // We DO NOT want to accept content changes from the DB if we are currently editing (prevent loops).

      const currentStructure = files
        .map((f) => `${f.id}:${f.name}`)
        .sort()
        .join("|")
      const newStructure = mappedFiles
        .map((f) => `${f.id}:${f.name}`)
        .sort()
        .join("|")

      if (currentStructure !== newStructure) {
        // Merge Strategy:
        // 1. Take structure from DB (Source of Truth for existence)
        // 2. Preserve local content for files that exist in both (Source of Truth for edits)
        const merged = mappedFiles.map((dbFile) => {
          const local = files.find((f) => f.id === dbFile.id)
          if (local) {
            // Keep local content
            return { ...dbFile, content: local.content }
          }
          // New file from DB -> Use DB content
          return dbFile
        })

        setFiles(merged)
      }
    }
  }, [dbFiles, isInitialized, files]) // Depend on 'files' for the merge logic

  // --- Auto-Save Logic ---
  // We used to do this in the Editor, but now the Hook owns it.
  // Actually, simpler approach: Trigger save in `updateFile` but debounced?
  // Or keep a separate effect that watches `files` and saves changed ones?
  // Given we want "One Way Data Flow", explicit saves are better than watching state.
  // But purely explicit (in updateFile) floods the DB.
  // Let's implement a ref-based debounce for saving content.

  const saveTimeoutRef = useRef<Record<number, NodeJS.Timeout>>({})

  const saveContentToDb = useCallback(
    (fileId: number, content: string | Blob | ArrayBuffer | Uint8Array) => {
      if (saveTimeoutRef.current[fileId]) {
        clearTimeout(saveTimeoutRef.current[fileId])
      }

      saveTimeoutRef.current[fileId] = setTimeout(async () => {
        await db.files.update(fileId, { content })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.scapes.update(scapeId as any, { updatedAt: new Date() }) // Cast scapeId for update
        delete saveTimeoutRef.current[fileId]
      }, 500) // 500ms Debounce for DB writes
    },
    [scapeId]
  )

  // --- Actions ---

  const createFile = useCallback(
    async (
      name: string,
      language: FileType,
      content: string | Blob | ArrayBuffer | Uint8Array = ""
    ) => {
      // Optimistic: We can't really do optimistic create easily because we need the ID from DB.
      // So we await DB. The `useEffect` above will handle adding it to state when it detects structure change.
      await db.files.add({
        scapeId,
        name,
        language,
        content,
      })
    },
    [scapeId]
  )

  const updateFile = useCallback(
    (name: string, content: string | Blob | ArrayBuffer | Uint8Array) => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.name === name) {
            if (f.id) saveContentToDb(f.id, content)
            return { ...f, content }
          }
          return f
        })
      )
    },
    [saveContentToDb]
  )

  // Renaming is structural, so await DB
  const renameFile = useCallback(
    async (oldPath: string, newPath: string) => {
      // 1. Find file
      const file = files.find((f) => f.name === oldPath)
      // Folder renaming? Handled by caller usually, but if file:
      if (file && file.id) {
        await db.files.update(file.id, { name: newPath })
      }
      // Deep rename (folders) is complex, usually handled by checking startsWith.
      // For now assuming caller handles atomic renames or this hook exposes specific methods.
      // Let's implement a bulk rename helper if needed, or just let 'updateFile' handle content.
      // Actually, ScapeEditor handles recursive renames.
      // Instead of duplicating that logic here, let's expose a generic 'updateAttributes' or specific 'rename'.

      // For now, let's stick to simple file ops. Complex folder moves might essentially be direct DB calls
      // that invoke the 'Structure Change' sync.
      // So exposing direct DB access or generic helper is fine.
    },
    [files]
  )

  const deleteFile = useCallback(
    async (path: string) => {
      // Recursive delete
      const toDelete = files.filter((f) => f.name === path || f.name.startsWith(path + "/"))
      const ids = toDelete.map((f) => f.id).filter((id): id is number => id !== undefined)
      if (ids.length > 0) {
        await db.files.bulkDelete(ids)
      }
    },
    [files]
  )

  // Custom bulk update (for folders move)
  const bulkRename = useCallback(async (updates: { id: number; name: string }[]) => {
    await Promise.all(updates.map((u) => db.files.update(u.id, { name: u.name })))
  }, [])

  return {
    files,
    isInitialized,
    createFile,
    updateFile,
    renameFile,
    deleteFile,
    bulkRename,
  }
}
