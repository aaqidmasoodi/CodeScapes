import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { DocsRepository } from "@/lib/repositories/DocsRepository"
import type { DocsTreeItem } from "@/types/docs"
import { Button } from "@/components/ui/button"
import { Plus, Folder, FileText, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
// import { useToast } from "@/components/ui/use-toast"

function AdminNodeItem({
  item,
  depth = 0,
  onDelete,
}: {
  item: DocsTreeItem
  depth?: number
  onDelete: (id: string, name: string) => void
}) {
  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex items-center justify-between border-b px-4 py-3 hover:bg-muted/50",
          depth > 0 && "pl-8"
        )}
      >
        <div className="flex items-center gap-3">
          {item.type === "category" ? (
            <Folder className="h-5 w-5 text-blue-500" />
          ) : (
            <FileText className="h-5 w-5 text-gray-500" />
          )}
          <div className="flex flex-col">
            <span className={cn("font-medium", item.is_hidden && "line-through opacity-50")}>
              {item.title}
              {!item.is_published && (
                <span className="ml-2 rounded bg-yellow-500/10 px-1 text-xs text-yellow-500">
                  DRAFT
                </span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">/{item.slug}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/admin/docs/edit/${item.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(item.id, item.title)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {item.children.map((child) => (
        <AdminNodeItem key={child.id} item={child} depth={depth + 1} onDelete={onDelete} />
      ))}
    </div>
  )
}

export function AdminDashboard() {
  const [tree, setTree] = useState<DocsTreeItem[]>([])
  const [loading, setLoading] = useState(true)
  // const { toast } = useToast()

  useEffect(() => {
    loadTree()
  }, [])

  async function loadTree() {
    try {
      setLoading(true)
      const data = await DocsRepository.getAdminTree()
      setTree(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return

    try {
      await DocsRepository.deleteNode(id)
      loadTree()
    } catch {
      alert("Failed to delete")
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Documentation</h2>
        <Button asChild>
          <Link to="/admin/docs/new">
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <div className="bg-muted/50 px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
          Structure
        </div>
        {tree.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No docs found. Create one!</div>
        ) : (
          tree.map((node) => <AdminNodeItem key={node.id} item={node} onDelete={handleDelete} />)
        )}
      </div>
    </div>
  )
}
