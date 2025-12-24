import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import type { ScapeFile, FileType } from "@/types/file"
import { LocalRepository } from "@/lib/repositories/LocalRepository"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import type { IScapeRepository } from "@/lib/repositories/types"
import { toast } from "@/components/ui/use-toast"
import { debug } from "@/lib/debug"

export function useFileSystem(scapeId: string, source: "local" | "cloud" = "local") {
  const [files, setFiles] = useState<ScapeFile[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Select Repository
  const repo = useMemo<IScapeRepository>(() => {
    return source === "cloud" ? new CloudRepository() : new LocalRepository()
  }, [source])

  // --- Data Loading Strategy ---
  // Option A: Local - Use LiveQuery for reactivity
  const localDbFiles = useLiveQuery(() => {
    if (source === "local") {
      return db.files.where("scapeId").equals(scapeId).toArray()
    }
    return Promise.resolve(undefined)
  }, [scapeId, source])

  // Option B: Cloud - Use manual fetch (LiveQuery doesn't support generic repo yet)
  const [cloudFiles, setCloudFiles] = useState<ScapeFile[] | null>(null)

  useEffect(() => {
    if (source === "cloud") {
      repo.getFiles(scapeId).then(setCloudFiles).catch(console.error)
    }
  }, [repo, scapeId, source])

  // Unify Data Sources
  const rawFiles = source === "local" ? localDbFiles : cloudFiles

  // --- Synchronization Logic ---

  useEffect(() => {
    // Wait for data to be loaded
    if (!rawFiles) return

    // Map DB files to ScapeFiles (ensure types)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedFiles: ScapeFile[] = (rawFiles as any[]).map((f) => ({
      id: f.id,
      name: f.name,
      language: f.language as FileType,
      content: f.content,
    }))

    if (!isInitialized) {
      // First Load: Trust Source
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFiles(mappedFiles)
      setIsInitialized(true)
    } else {
      // Subsequent Updates: Smart Merge
      // Only update if structure changed or if we are not editing locally
      const currentStructure = files
        .map((f) => `${f.id}:${f.name}`)
        .sort()
        .join("|")
      const newStructure = mappedFiles
        .map((f) => `${f.id}:${f.name}`)
        .sort()
        .join("|")

      if (currentStructure !== newStructure) {
        const merged = mappedFiles.map((remoteFile) => {
          const local = files.find((f) => f.id === remoteFile.id)
          if (local) {
            // Keep local content to prevent overwriting unsaved work if re-fetch happens
            // However, for Cloud, we probably want to trust remote if it updated?
            // For now, stick to "Local is Editor State".
            return { ...remoteFile, content: local.content }
          }
          return remoteFile
        })
        setFiles(merged)
      }
    }
  }, [rawFiles, isInitialized, files])

  // --- Auto-Save Logic ---
  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const saveContentToRepo = useCallback(
    (fileId: string, content: string | Blob | ArrayBuffer | Uint8Array) => {
      if (saveTimeoutRef.current[fileId]) {
        clearTimeout(saveTimeoutRef.current[fileId])
      }

      setSaveState("saving")

      saveTimeoutRef.current[fileId] = setTimeout(async () => {
        try {
          await repo.updateFileContent(fileId, content)

          // Update Timestamp on Scape (Removed for optimization - rely on explicit saves)
          // await repo.updateScape(scapeId, { updatedAt: new Date() })

          delete saveTimeoutRef.current[fileId]

          // Only set to saved if no other saving operations are pending
          if (Object.keys(saveTimeoutRef.current).length === 0) {
            setSaveState("saved")
            setLastSaved(new Date())
          }
        } catch (e) {
          console.error("Failed to auto-save:", e)
          setSaveState("error")
        }
      }, 3000) // 3s Debounce for Cloud Optimization
    },
    [repo, scapeId]
  )

  // --- Actions ---

  const createFile = useCallback(
    async (
      name: string,
      language: FileType,
      content: string | Blob | ArrayBuffer | Uint8Array = ""
    ) => {
      const newFile: ScapeFile & { scapeId: string } = {
        id: crypto.randomUUID(),
        scapeId,
        name,
        language,
        content,
      }

      // Optimistic Update (Optional, but good for UI)
      setFiles((prev) => [...prev, newFile])

      try {
        await repo.createFile(newFile)
        // If Cloud, we might need to re-fetch to confirm?
        // Or rely on the fact that we pushed it.
        // For Local, LiveQuery will catch it.
        if (source === "cloud") {
          // Manually update cloudFiles state to prevent flicker
          setCloudFiles((prev) => (prev ? [...prev, newFile] : [newFile]))
        }
      } catch (e) {
        console.error("Failed to create file:", e)
        // Rollback?
        setFiles((prev) => prev.filter((f) => f.id !== newFile.id))
        toast({
          title: "Failed to create file",
          description: "Please try again.",
          variant: "destructive",
        })
      }
    },
    [repo, scapeId, source]
  )

  const updateFile = useCallback(
    (name: string, content: string | Blob | ArrayBuffer | Uint8Array) => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.name === name) {
            if (f.id) saveContentToRepo(f.id, content)
            return { ...f, content }
          }
          return f
        })
      )
    },
    [saveContentToRepo]
  )

  const renameFile = useCallback(
    async (oldPath: string, newPath: string) => {
      const file = files.find((f) => f.name === oldPath)
      if (file && file.id) {
        // Optimistic
        setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, name: newPath } : f)))

        try {
          await repo.updateFileName(file.id, newPath)
          if (source === "cloud") {
            setCloudFiles(
              (prev) => prev?.map((f) => (f.id === file.id ? { ...f, name: newPath } : f)) || null
            )
          }
        } catch (e) {
          console.error("Rename failed", e)
          // Rollback logic would go here
        }
      }
    },
    [files, repo, source]
  )

  const deleteFile = useCallback(
    async (path: string) => {
      const toDelete = files.filter((f) => f.name === path || f.name.startsWith(path + "/"))
      const ids = toDelete.map((f) => f.id).filter((id): id is string => id !== undefined)

      if (ids.length > 0) {
        // Optimistic
        setFiles((prev) => prev.filter((f) => !ids.includes(f.id!)))

        try {
          await repo.bulkDeleteFiles(ids)
          if (source === "cloud") {
            setCloudFiles((prev) => prev?.filter((f) => !ids.includes(f.id!)) || null)
          }
        } catch (e) {
          console.error("Delete failed", e)
        }
      }
    },
    [files, repo, source]
  )

  const bulkRename = useCallback(
    async (updates: { id: string; name: string }[]) => {
      // Optimistic
      setFiles((prev) =>
        prev.map((f) => {
          const update = updates.find((u) => u.id === f.id)
          return update ? { ...f, name: update.name } : f
        })
      )

      try {
        await repo.bulkUpdateFiles(updates.map((u) => ({ id: u.id, changes: { name: u.name } })))
        if (source === "cloud") {
          setCloudFiles(
            (prev) =>
              prev?.map((f) => {
                const update = updates.find((u) => u.id === f.id)
                return update ? { ...f, name: update.name } : f
              }) || null
          )
        }
      } catch (e) {
        console.error("Bulk rename failed", e)
      }
    },
    [repo, source]
  )

  const updateScape = useCallback(
    async (updates: Partial<import("@/lib/db").Scape>) => {
      try {
        await repo.updateScape(scapeId, updates)
      } catch (e) {
        console.error("Failed to update scape:", e)
      }
    },
    [repo, scapeId]
  )

  // --- Real-Time Subscription (Cloud) ---
  useEffect(() => {
    if (source === "cloud" && repo.subscribeToFiles) {
      const unsubscribe = repo.subscribeToFiles(scapeId, (event, payload) => {
        // Client-Side Filter: Ensure event is for THIS scape
        // Raw Payload: { schema: 'public', table: 'files', commit_timestamp: '...', eventType: '...', new: {}, old: {} }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = payload as any
        const record = p.new || p.old
        // Defensive check for scape_id. For DELETE, scape_id might be missing if REPLICA IDENTITY not full, so we skip check for DELETE.
        if (event !== "DELETE") {
          if (record && record.scape_id && record.scape_id !== scapeId) return
        }

        debug.log("Realtime Event:", event, payload)

        if (event === "INSERT") {
          const newRecord = p.new
          if (!newRecord || newRecord.scape_id !== scapeId) return

          const newFile: ScapeFile = {
            id: newRecord.id,
            name: newRecord.name,
            language: newRecord.language,
            content: newRecord.content || "",
          }
          setFiles((prev) => {
            if (prev.some((f) => f.id === newFile.id)) return prev
            return [...prev, newFile]
          })
          setCloudFiles((prev) => {
            if (!prev) return [newFile]
            if (prev.some((f) => f.id === newFile.id)) return prev
            return [...prev, newFile]
          })
        }

        if (event === "DELETE") {
          // DELETE payload usually has 'old' property with the ID
          // Or if we passed full payload from repo, it might be nested
          // We cast to any to safely access potentially missing properties
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const raw = payload as any
          const id = raw.id || raw.old?.id || (raw.payload && raw.payload.old && raw.payload.old.id)

          if (id) {
            debug.log("Processing Realtime Delete for ID:", id)
            setFiles((prev) => prev.filter((f) => f.id !== id))
            setCloudFiles((prev) => prev?.filter((f) => f.id !== id) || null)
          } else {
            debug.warn("Realtime DELETE received but no ID found:", payload)
          }
        }

        if (event === "UPDATE") {
          const newRecord = p.new
          const id = newRecord.id

          const isMeSaving = !!saveTimeoutRef.current[id]

          if (!isMeSaving) {
            setFiles((prev) =>
              prev.map((f) => {
                if (f.id === id) {
                  return {
                    ...f,
                    name: newRecord.name,
                    content: newRecord.content,
                    language: newRecord.language,
                  }
                }
                return f
              })
            )
            setCloudFiles(
              (prev) =>
                prev?.map((f) =>
                  f.id === id ? { ...f, name: newRecord.name, content: newRecord.content } : f
                ) || null
            )
          }
        }
      })
      return () => {
        unsubscribe()
      }
    }
  }, [repo, scapeId, source])

  return {
    files,
    isInitialized,
    createFile,
    updateFile,
    renameFile,
    deleteFile,
    bulkRename,
    updateScape,
    saveState,
    lastSaved,
  }
}
