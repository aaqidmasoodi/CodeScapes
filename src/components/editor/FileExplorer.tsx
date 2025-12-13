import { File, Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScapeFile } from "@/types/file"

export interface FileNode {
  id: string
  name: string
  type: "file" | "folder"
  file?: ScapeFile
  children?: FileNode[]
  isOpen?: boolean
}

interface FileExplorerProps {
  files: FileNode[]
  activeFileId?: string
  onFileSelect: (file: ScapeFile) => void
}

export function FileExplorer({ files, activeFileId, onFileSelect }: FileExplorerProps) {
  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            "flex cursor-pointer items-center gap-2 px-2 py-1 text-sm transition-colors hover:bg-muted/50",
            level > 0 && "pl-4",
            activeFileId === node.id && "bg-secondary text-secondary-foreground"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => node.type === "file" && node.file && onFileSelect(node.file)}
        >
          {node.type === "folder" ? (
            <Folder className="h-4 w-4 text-primary/70" />
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}
          <span>{node.name}</span>
        </div>
        {node.children && node.isOpen && <div>{renderTree(node.children, level + 1)}</div>}
      </div>
    ))
  }

  return (
    <div className="h-full overflow-auto p-2">
      <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">Explorer</h3>
      <div className="flex flex-col gap-0.5">{renderTree(files)}</div>
    </div>
  )
}
