/**
 * Source Control Pane
 *
 * Git-like version control UI for scapes.
 * Shows changed files, commit history, and allows committing/restoring.
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  GitCommit,
  RefreshCw,
  RotateCcw,
  Trash2,
  Plus,
  Minus,
  Edit3,
  Clock,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScapeFile } from "@/types/file"
import type { FileStatus } from "@/lib/git/repo"
import type { GitManager } from "@/hooks/useGitManager"

interface SourceControlPaneProps {
  scapeId: string
  files: ScapeFile[]
  onRestoreFiles?: (files: Array<{ name: string; content: string }>) => void
  git: GitManager
}

export function SourceControlPane({ scapeId, onRestoreFiles, git }: SourceControlPaneProps) {
  const [commitMessage, setCommitMessage] = useState("")
  const [lastCommitSuccess, setLastCommitSuccess] = useState(false)

  // Handle commit
  const handleCommit = async () => {
    if (!commitMessage.trim() || !scapeId) return

    try {
      await git.commit(commitMessage.trim())

      setCommitMessage("")
      setLastCommitSuccess(true)
      setTimeout(() => setLastCommitSuccess(false), 2000)
    } catch (err) {
      console.error("[SourceControl] Commit failed:", err)
    }
  }

  // Handle restore to previous commit
  const handleRestore = async (commitSha: string) => {
    if (!scapeId || !onRestoreFiles) return

    try {
      const restoredFiles = await git.checkout(commitSha)
      onRestoreFiles(restoredFiles)
      await git.refresh(false)
    } catch (err) {
      console.error("[SourceControl] Restore failed:", err)
    }
  }

  // Status icon
  const StatusIcon = ({ status }: { status: FileStatus["status"] }) => {
    switch (status) {
      case "added":
        return <Plus className="h-3 w-3 text-green-500" />
      case "modified":
        return <Edit3 className="h-3 w-3 text-yellow-500" />
      case "deleted":
        return <Minus className="h-3 w-3 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-sm font-medium">Source Control</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => git.refresh(true)}
          disabled={git.isLoading}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", git.isLoading && "animate-spin")} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          {/* Commit Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Commit message..."
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleCommit()
                  }
                }}
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                className="h-8 px-3"
                onClick={handleCommit}
                disabled={!commitMessage.trim() || git.isCommitting}
              >
                {lastCommitSuccess ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : git.isCommitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <GitCommit className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Changed Files */}
          {git.changedFiles.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Changes ({git.changedFiles.length})
              </span>
              <div className="space-y-0.5">
                {git.changedFiles.map((file) => (
                  <div
                    key={file.path}
                    className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-muted/50"
                  >
                    <StatusIcon status={file.status} />
                    <span className="truncate">{file.path}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commit History */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              History ({git.history.length})
            </span>
            {git.history.length === 0 ? (
              <p className="text-xs text-muted-foreground">No commits yet</p>
            ) : (
              <div className="space-y-1">
                {git.history.map((c, idx) => (
                  <div
                    key={c.sha}
                    className="group flex items-start gap-2 rounded px-2 py-1.5 hover:bg-muted/50"
                  >
                    <Clock className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs">{c.message}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(c.timestamp).toLocaleString()} &middot; {c.sha.slice(0, 7)}
                      </p>
                      {idx > 0 && onRestoreFiles && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100"
                          onClick={() => handleRestore(c.sha)}
                          title="Restore to this commit"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                      {idx === 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-destructive opacity-0 hover:text-destructive group-hover:opacity-100"
                          onClick={() => git.undoCommit()}
                          title="Undo this commit"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
