import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { DocsRepository } from "@/lib/repositories/DocsRepository"
import type { DocsNode, DocsTreeItem } from "@/types/docs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MarkdownRenderer } from "@/components/docs/MarkdownRenderer"
import { ArrowLeft, Save } from "lucide-react"

// Helper to flatten tree for select options
function flattenTree(
  nodes: DocsTreeItem[],
  depth = 0
): Array<{ id: string; title: string; depth: number }> {
  let result: Array<{ id: string; title: string; depth: number }> = []
  for (const node of nodes) {
    result.push({ id: node.id, title: node.title, depth })
    if (node.children) {
      result = [...result, ...flattenTree(node.children, depth + 1)]
    }
  }
  return result
}

export function AdminEditor() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()

  const [formData, setFormData] = useState<Partial<DocsNode>>({
    title: "",
    slug: "",
    type: "page",
    content: "# New Page\nWrite content here...",
    is_published: false,
    parent_id: null,
    sort_order: 0,
    is_hidden: false,
  })

  // Parent Options
  const [parents, setParents] = useState<Array<{ id: string; title: string; depth: number }>>([])

  // Load existing data + tree for parents
  useEffect(() => {
    // Load Tree for Parent Selection
    DocsRepository.getAdminTree().then((tree) => {
      setParents(flattenTree(tree))
    })

    if (!isNew && id) {
      DocsRepository.getNodeById(id).then((node) => {
        if (node) setFormData(node)
      })
    }
  }, [id, isNew])

  async function handleSave() {
    try {
      if (isNew) {
        await DocsRepository.createNode(formData)
      } else {
        if (id) await DocsRepository.updateNode(id, formData)
      }
      navigate("/admin/docs")
    } catch (e) {
      alert("Error saving: " + e)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/docs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">{isNew ? "Create Node" : "Edit Node"}</h2>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Form Side */}
        <div className="-ml-1 space-y-6 overflow-y-auto pb-10 pl-1 pr-4 pt-1">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Page Title"
            />
          </div>

          <div className="grid gap-2">
            <Label>Slug (URL segment)</Label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="my-page-slug"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as "page" | "category" })
                }
              >
                <option value="page">Page</option>
                <option value="category">Category (Folder)</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label>Parent</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.parent_id || ""}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
              >
                <option value="">(Root)</option>
                {parents
                  .filter((p) => p.id !== id) // Prevent self-parenting
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {"- ".repeat(p.depth)}
                      {p.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Sort Order</Label>
            <Input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex items-center gap-4 rounded-md border p-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={(c) => setFormData({ ...formData, is_published: c })}
              />
              <Label htmlFor="published">Published</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="hidden"
                checked={formData.is_hidden}
                onCheckedChange={(c) => setFormData({ ...formData, is_hidden: c })}
              />
              <Label htmlFor="hidden">Hidden from Nav</Label>
            </div>
          </div>

          {formData.type === "page" && (
            <div className="flex min-h-[400px] flex-1 flex-col gap-2">
              <Label>Content (Markdown)</Label>
              <textarea
                className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Live Preview Side */}
        <div className="overflow-y-auto rounded-md border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
            Live Preview
          </h3>
          <div className="prose max-w-none dark:prose-invert">
            <h1>{formData.title}</h1>
            {formData.type === "page" && <MarkdownRenderer content={formData.content || ""} />}
          </div>
        </div>
      </div>
    </div>
  )
}
