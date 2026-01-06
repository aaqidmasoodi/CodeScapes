import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import {
  syncFileSystem,
  getLog,
  getStatus,
  commit as gitCommit,
  checkout,
  type CommitInfo,
  type FileStatus,
} from "@/lib/git/repo"
import { saveToSupabase as syncToCloud } from "@/lib/git/sync"
import type { ScapeFile } from "@/types/file"

export interface GitManager {
  isReady: boolean
  isLoading: boolean
  isCommitting: boolean
  changedFiles: FileStatus[]
  history: CommitInfo[]
  commit: (message: string) => Promise<void>
  checkout: (sha: string) => Promise<Array<{ name: string; content: string }>>
  refresh: (sync?: boolean) => Promise<void>
}

export function useGitManager(
  scapeId: string | undefined,
  files: ScapeFile[],
  isCloud = true
): GitManager {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)
  const [changedFiles, setChangedFiles] = useState<FileStatus[]>([])
  const [history, setHistory] = useState<CommitInfo[]>([])

  // Debounce file changes (1s)
  const debouncedFiles = useDebounce(files, 1000)

  // Refresh Status & History
  const refresh = useCallback(
    async (sync = false, filesSnapshot?: Array<{ name: string; content: string }>) => {
      if (!scapeId) return

      setIsLoading(true)
      try {
        if (sync && filesSnapshot) {
          await syncFileSystem(scapeId, filesSnapshot)
        }

        const [status, log] = await Promise.all([getStatus(scapeId), getLog(scapeId)])

        setChangedFiles(status)
        setHistory(log)
        setIsReady(true)
      } catch (e) {
        console.error("[Git] Refresh failed", e)
      } finally {
        setIsLoading(false)
      }
    },
    [scapeId]
  )

  // Initial Load
  useEffect(() => {
    if (scapeId) {
      refresh(true)
    }
  }, [scapeId, refresh])

  // Auto-Sync on File Change
  useEffect(() => {
    if (isReady && debouncedFiles.length > 0) {
      const fileData = debouncedFiles
        .filter((f) => f.language !== "folder" && f.content !== undefined)
        .map((f) => ({
          name: f.name,
          content: typeof f.content === "string" ? f.content : "",
        }))
      refresh(true, fileData)
    }
  }, [debouncedFiles, isReady, refresh])

  // Commit Action
  const commit = async (message: string) => {
    if (!scapeId) return
    setIsCommitting(true)
    try {
      const fileData = files
        .filter((f) => f.language !== "folder" && f.content !== undefined)
        .map((f) => ({
          name: f.name,
          content: typeof f.content === "string" ? f.content : "",
        }))

      await gitCommit(scapeId, message, fileData)

      if (isCloud) {
        await syncToCloud(scapeId)
      }

      await refresh(false) // No need to sync files again, just status
    } catch (e) {
      console.error("[Git] Commit failed", e)
    } finally {
      setIsCommitting(false)
    }
  }

  const checkoutCommit = async (sha: string) => {
    if (!scapeId) return []
    return checkout(scapeId, sha)
  }

  return {
    isReady,
    isLoading,
    isCommitting,
    changedFiles,
    history,
    commit,
    checkout: checkoutCommit,
    refresh,
  }
}
