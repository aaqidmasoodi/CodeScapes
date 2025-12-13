import { useState, useRef, useEffect } from "react"
import { File, Folder, FolderOpen, FilePlus, FolderPlus, Trash2, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScapeFile } from "@/types/file"
import type { FileNode } from "@/lib/file-tree"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface FileExplorerProps {
  files: FileNode[]
  activeFileId?: string
  onFileSelect: (file: ScapeFile) => void
  onToggleFolder: (path: string) => void
  onCreateFile: (name: string) => void
  onCreateFolder: (name: string) => void
  onDelete: (path: string) => void
}

export function FileExplorer({
  files,
  activeFileId,
  onFileSelect,
  onToggleFolder,
  onCreateFile,
  onCreateFolder,
  onDelete
}: FileExplorerProps) {

  // Creation State
  const [creationStart, setCreationStart] = useState<{ type: 'file' | 'folder' } | null>(null)

  // Temporary input state
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (creationStart && inputRef.current) {
      inputRef.current.focus()
    }
  }, [creationStart])

  const handleCommitCreation = () => {
    if (!creationStart || !inputRef.current) return
    const name = inputRef.current.value.trim()

    if (name) {
      if (creationStart.type === 'file') {
        onCreateFile(name)
      } else {
        onCreateFolder(name)
      }
    }
    setCreationStart(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommitCreation()
    } else if (e.key === 'Escape') {
      setCreationStart(null)
    }
  }

  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.id} className="select-none">
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn(
                "flex cursor-pointer items-center gap-1.5 px-2 py-1 text-sm transition-colors hover:bg-muted/50 rounded-sm mx-1",
                activeFileId === node.name && node.type === "file" && "bg-secondary text-secondary-foreground"
              )}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={(e) => {
                e.stopPropagation();
                if (node.type === "file" && node.file) {
                  onFileSelect(node.file)
                } else {
                  onToggleFolder(node.path)
                }
              }}
            >
              {node.type === "folder" && (
                <span className="text-muted-foreground/70">
                  {node.isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </span>
              )}

              {node.type === "folder" ? (
                node.isOpen ? (
                  <FolderOpen className="h-4 w-4 text-blue-500/80" />
                ) : (
                  <Folder className="h-4 w-4 text-blue-500/80" />
                )
              ) : (
                <File className="h-4 w-4 text-muted-foreground/80" />
              )}

              <span className="truncate">{node.name}</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(node.path)}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {node.children && node.isOpen && (
          <div className="border-l border-muted/20 ml-3">
            {renderTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className="flex flex-col h-full bg-muted/5 border-r border-muted/50">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-muted/50 bg-background/50 backdrop-blur-sm">
        <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Explorer</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCreationStart({ type: 'file' })} title="New File">
            <FilePlus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCreationStart({ type: 'folder' })} title="New Folder">
            <FolderPlus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto py-2">
        {/* Input Field at Root (Top) */}
        {creationStart && (
          <div className="flex items-center gap-1.5 px-2 py-1 mx-1">
            <span className="text-muted-foreground/70 pl-2">
              {creationStart.type === 'folder' ? <ChevronRight className="h-3 w-3" /> : <span className="w-3" />}
            </span>
            {creationStart.type === 'folder' ? <Folder className="h-4 w-4 text-blue-500/80" /> : <File className="h-4 w-4 text-muted-foreground/80" />}
            <Input
              ref={inputRef}
              className="h-6 text-sm px-1 py-0"
              onBlur={handleCommitCreation} // Commit on blur (VS Code style)
              onKeyDown={handleKeyDown}
              placeholder={creationStart.type === 'file' ? 'filename.ext' : 'foldername'}
            />
          </div>
        )}

        {files.length === 0 && !creationStart ? (
          <div className="text-center text-xs text-muted-foreground py-8">
            No files
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">{renderTree(files)}</div>
        )}
      </div>
    </div>
  )
}
