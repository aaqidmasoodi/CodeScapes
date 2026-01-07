import { useState, useEffect, useCallback, useRef } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import {
  syncFileSystem,
  getLog,
  getStatus,
  resetToPrevious,
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
  undoCommit: () => Promise<void>
  refresh: (sync?: boolean) => Promise<void>
}

/**
 * Helper to convert ScapeFile[] to simple file data for git operations
 */
function toFileData(files: ScapeFile[]): Array<{ name: string; content: string }> {
  return files
    .filter((f) => f.language !== "folder" && f.content !== undefined)
    .map((f) => ({
      name: f.name,
      content: typeof f.content === "string" ? f.content : "",
    }))
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

  // Keep a ref to the latest files to avoid dependency issues
  // This allows refresh() to always access current files without being in deps
  const latestFilesRef = useRef<ScapeFile[]>(files)
  useEffect(() => {
    latestFilesRef.current = files
  }, [files])

  // Debounce file changes (1s)
  const debouncedFiles = useDebounce(files, 1000)

  // Core refresh function - always uses latestFilesRef when sync=true
  const refresh = useCallback(
    async (sync = false) => {
      if (!scapeId) return

      setIsLoading(true)
      try {
        if (sync) {
          const fileData = toFileData(latestFilesRef.current)
          await syncFileSystem(scapeId, fileData)
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

  // Initial Load - just fetch status and history (no file sync yet)
  // File sync will be triggered by the debounced effect once files are loaded
  useEffect(() => {
    if (scapeId) {
      refresh(false) // Don't sync files, just get current git state
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scapeId])

  // Auto-Sync on File Change (debounced 1s)
  // This handles both initial sync and subsequent changes
  useEffect(() => {
    if (scapeId && debouncedFiles.length > 0) {
      refresh(true) // Sync files to git, then update status
    }
  }, [debouncedFiles, scapeId, refresh])

  // Commit Action
  const commit = useCallback(
    async (message: string) => {
      if (!scapeId) return
      setIsCommitting(true)
      try {
        const fileData = toFileData(latestFilesRef.current)

        await gitCommit(scapeId, message, fileData)

        if (isCloud) {
          await syncToCloud(scapeId)
        }

        await refresh(false) // Just refresh status, files already in sync
      } catch (e) {
        console.error("[Git] Commit failed", e)
      } finally {
        setIsCommitting(false)
      }
    },
    [scapeId, isCloud, refresh]
  )

  const checkoutCommit = useCallback(
    async (sha: string) => {
      if (!scapeId) return []
      return checkout(scapeId, sha)
    },
    [scapeId]
  )

  const undoCommit = useCallback(async () => {
    if (!scapeId) return
    setIsLoading(true)
    try {
      await resetToPrevious(scapeId)
      await refresh(false)
    } catch (e) {
      console.error("Undo failed", e)
    } finally {
      setIsLoading(false)
    }
  }, [scapeId, refresh])

  return {
    isReady,
    isLoading,
    isCommitting,
    changedFiles,
    history,
    commit,
    checkout: checkoutCommit,
    undoCommit,
    refresh,
  }
}
