import { useState, useRef, useEffect } from "react"
import {
  File,
  Folder,
  FolderOpen,
  FilePlus,
  FolderPlus,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
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
  onCreateFile: (
    name: string,
    type?: string,
    content?: string | Blob | ArrayBuffer | Uint8Array
  ) => void
  onCreateFolder: (name: string) => void
  onDelete: (path: string) => void
  onMove: (oldPath: string, newPath: string) => void
}

export function FileExplorer({
  files,
  activeFileId,
  onFileSelect,
  onToggleFolder,
  onCreateFile,
  onCreateFolder,
  onDelete,
  onMove,
}: FileExplorerProps) {
  // Creation State with Context
  const [creationStart, setCreationStart] = useState<{
    type: "file" | "folder"
    parentPath?: string
  } | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  // DnD State
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null)

  // Temporary input state
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (creationStart) inputRef.current?.focus()
  }, [creationStart])

  const handleCommitCreation = () => {
    if (!creationStart || !inputRef.current) return
    const rawName = inputRef.current.value.trim()

    if (rawName) {
      // Construct full path if nested
      const fullName = creationStart.parentPath ? `${creationStart.parentPath}/${rawName}` : rawName

      if (creationStart.type === "file") {
        onCreateFile(fullName)
      } else {
        onCreateFolder(fullName)
      }
    }
    setCreationStart(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCommitCreation()
    else if (e.key === "Escape") setCreationStart(null)
  }

  // --- HTML5 DnD Handlers ---
  const handleDragStart = (e: React.DragEvent, node: FileNode) => {
    e.dataTransfer.setData("text/plain", node.path)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, node: FileNode | null) => {
    e.preventDefault()
    e.stopPropagation() // Prevent bubbling to container if handling node

    // If node is null, we are over the root container
    if (!node) {
      setDragOverNodeId("root")
      e.dataTransfer.dropEffect = "move"
      return
    }

    // If over a folder, target that folder
    if (node.type === "folder") {
      setDragOverNodeId(node.path)
      e.dataTransfer.dropEffect = "move"
    } else {
      // If over a file, target its parent folder
      const parentPath = node.path.includes("/")
        ? node.path.substring(0, node.path.lastIndexOf("/"))
        : "root"
      setDragOverNodeId(parentPath)
      e.dataTransfer.dropEffect = "move"
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverNodeId(null)
  }

  const handleDrop = async (e: React.DragEvent, targetNode: FileNode | null) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverNodeId(null)

    // Determine Target Path
    let targetPath = ""
    if (targetNode) {
      if (targetNode.type === "folder") {
        targetPath = targetNode.path
      } else {
        // Dropped on a file -> Goes to same folder
        targetPath = targetNode.path.includes("/")
          ? targetNode.path.substring(0, targetNode.path.lastIndexOf("/"))
          : ""
      }
    }

    // Check for Native Files first
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesList = Array.from(e.dataTransfer.files)

      for (const file of filesList) {
        // 1. Size Check (10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large (Max 10MB).`)
          continue
        }

        // 2. Determine Type & Read Strategy
        const isText =
          file.type.startsWith("text/") ||
          file.name.endsWith(".json") ||
          file.name.endsWith(".js") ||
          file.name.endsWith(".ts") ||
          file.name.endsWith(".py") ||
          file.name.endsWith(".md")

        let content: string | ArrayBuffer
        let fileType = "binary"

        if (isText) {
          content = await file.text()
          // Infer simpler type for code editor support
          if (file.name.endsWith(".html")) fileType = "html"
          else if (file.name.endsWith(".css")) fileType = "css"
          else if (file.name.endsWith(".json")) fileType = "json"
          else if (file.name.endsWith(".md")) fileType = "markdown"
          else if (file.name.endsWith(".py")) fileType = "python"
          else if (file.name.endsWith(".js") || file.name.endsWith(".ts")) fileType = "javascript"
          else fileType = "binary" // Fallback if unsure, but we read as text
        } else {
          // Binary (Images, WASM, etc.)
          content = await file.arrayBuffer()
          if (file.type.startsWith("image/")) fileType = "image"
          else fileType = "binary"
        }

        // 3. Create File
        const newPath = targetPath ? `${targetPath}/${file.name}` : file.name
        onCreateFile(newPath, fileType, content)
      }
      return
    }

    // --- Internal App DnD (Moving Files) ---
    const sourcePath = e.dataTransfer.getData("text/plain")

    // Strict Check removed: Can drop on files (to resolve parent)

    if (!sourcePath) return

    // Prevent dropping onto itself or direct parent (logic needs care)
    // Source: "folder/file.txt", Target: "folder" -> No op
    // Source: "file.txt", Target: "" -> No op
    if (sourcePath === targetPath) return // Same path?

    // Check if already in target folder
    const sourceDir = sourcePath.split("/").slice(0, -1).join("/")
    if (sourceDir === targetPath) return

    // Move logic: New path = targetPath/sourceName
    const sourceName = sourcePath.split("/").pop()
    const newPath = targetPath ? `${targetPath}/${sourceName}` : sourceName

    if (newPath) {
      onMove(sourcePath, newPath)
    }
  }

  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => {
      const isCreatingHere = creationStart?.parentPath === node.path

      return (
        <div key={node.id} className="select-none">
          <ContextMenu>
            <ContextMenuTrigger>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, node)}
                onDragOver={(e) => handleDragOver(e, node)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, node)}
                className={cn(
                  "mx-1 flex cursor-pointer items-center gap-1.5 rounded-sm border border-transparent px-2 py-1 text-sm transition-colors hover:bg-muted/50",
                  activeFileId === node.name &&
                    node.type === "file" &&
                    "bg-secondary text-secondary-foreground",
                  selectedFolderId === node.path && "bg-muted/30",
                  // Stronger highlight in light mode (blue-200), subtle in dark mode (blue-900/40)
                  dragOverNodeId === node.path &&
                    "border-blue-500/50 bg-blue-200/50 dark:border-blue-500/50 dark:bg-blue-900/40"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (node.type === "file" && node.file) {
                    onFileSelect(node.file)
                    // Auto-select parent folder so "New File" creates a sibling
                    const parentDir = node.path.split("/").slice(0, -1).join("/")
                    setSelectedFolderId(parentDir || null)
                  } else {
                    onToggleFolder(node.path)
                    setSelectedFolderId(node.path)
                  }
                }}
              >
                {node.type === "folder" && (
                  <span className="text-muted-foreground/70">
                    {node.isOpen ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
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
              <ContextMenuItem
                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                onClick={() => onDelete(node.path)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          {/* Render Input if creating directly inside this folder */}
          {isCreatingHere && (
            <div
              className="mx-1 flex items-center gap-1.5 px-2 py-1"
              style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
            >
              <span className="pl-2 text-muted-foreground/70">
                {creationStart.type === "folder" ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <span className="w-3" />
                )}
              </span>
              {creationStart.type === "folder" ? (
                <Folder className="h-4 w-4 text-blue-500/80" />
              ) : (
                <File className="h-4 w-4 text-muted-foreground/80" />
              )}
              <Input
                ref={inputRef}
                className="h-6 px-1 py-0 text-sm"
                onBlur={handleCommitCreation}
                onKeyDown={handleKeyDown}
                placeholder={creationStart.type === "file" ? "filename.ext" : "foldername"}
              />
            </div>
          )}

          {node.children && node.isOpen && (
            <div className="ml-3 border-l border-muted/20">
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  // Handle root creation vs nested creation
  const handleStartCreation = (type: "file" | "folder") => {
    setCreationStart({
      type,
      parentPath: selectedFolderId || undefined,
    })
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-muted/50 bg-muted/5 transition-colors",
        // Stronger root highlight in light mode
        dragOverNodeId === "root" && "bg-blue-300/30 dark:bg-blue-900/20"
      )}
      onClick={() => setSelectedFolderId(null)}
      onDragOver={(e) => handleDragOver(e, null)} // Handle drag over root
      onDrop={(e) => handleDrop(e, null)} // Handle drop onto root
      onDragLeave={handleDragLeave}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between border-b border-muted/50 bg-background/50 px-3 py-2 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleStartCreation("file")}
            title="New File"
          >
            <FilePlus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleStartCreation("folder")}
            title="New Folder"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto py-2">
        {/* Input Field at Root (Top) - Only if parentPath is undefined */}
        {creationStart && !creationStart.parentPath && (
          <div className="mx-1 flex items-center gap-1.5 px-2 py-1">
            <span className="pl-2 text-muted-foreground/70">
              {creationStart.type === "folder" ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <span className="w-3" />
              )}
            </span>
            {creationStart.type === "folder" ? (
              <Folder className="h-4 w-4 text-blue-500/80" />
            ) : (
              <File className="h-4 w-4 text-muted-foreground/80" />
            )}
            <Input
              ref={inputRef}
              className="h-6 px-1 py-0 text-sm"
              onBlur={handleCommitCreation}
              onKeyDown={handleKeyDown}
              placeholder={creationStart.type === "file" ? "filename.ext" : "foldername"}
            />
          </div>
        )}

        {files.length === 0 && !creationStart ? (
          <div className="py-8 text-center text-xs text-muted-foreground">No files</div>
        ) : (
          <div className="flex flex-col gap-0.5">{renderTree(files)}</div>
        )}
      </div>
    </div>
  )
}
