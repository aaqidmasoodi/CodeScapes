import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Book, MoreVertical, Trash2, Globe, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { useCollections } from "@/hooks/useCollection"
import { useQueryClient } from "@tanstack/react-query"

export default function CollectionsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Cached Data Fetching
  const { data: collections = [], isLoading: loading } = useCollections(user?.id)

  // Creation State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this collection?")) return

    try {
      const { error } = await supabase.from("collections").delete().eq("id", id)
      if (error) throw error

      // Invalidate cache to refresh list
      queryClient.invalidateQueries({ queryKey: ["collections", user?.id] })
    } catch (error) {
      console.error("Error deleting collection:", error)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      setIsCreating(true)
      const { data, error } = await supabase
        .from("collections")
        .insert({
          user_id: user?.id,
          title: newTitle,
          description: newDescription,
          is_public: false,
        })
        .select()
        .single()

      if (error) throw error

      setIsCreateOpen(false)
      setNewTitle("")
      setNewDescription("")

      // Invalidate cache immediately
      await queryClient.invalidateQueries({ queryKey: ["collections", user?.id] })

      // Navigate to the VIEW page, not edit
      if (data) navigate(`/dashboard/collections/${data.id}`)
    } catch (error) {
      console.error("Error creating collection:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <DashboardLayout activeTab="collections">
      <div className="flex h-full flex-col bg-background">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">My Collections</h1>
              <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px]">
                Beta
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Organize your Cloud Scapes into groups.</p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
                <DialogDescription>Start a new collection to organize your work.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Collection Title</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Python Tutorials"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description (Optional)</Label>
                  <Textarea
                    id="desc"
                    placeholder="What is this collection about?"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!newTitle.trim() || isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Collection
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="flex h-[50vh] flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/5">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Book className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No collections yet</h3>
              <p className="mb-6 mt-1 max-w-sm text-center text-sm text-muted-foreground">
                Create a collection to group your Scapes effectively.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>Create Collection</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {collections.map((collection) => (
                <Card
                  key={collection.id}
                  className="group relative cursor-pointer overflow-hidden transition-all hover:border-primary/50 hover:shadow-md"
                  onClick={() =>
                    navigate(`/dashboard/collections/${collection.id}`, { state: { collection } })
                  }
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="line-clamp-1">{collection.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => handleDelete(e, collection.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                      {collection.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {collection.is_public ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Globe className="h-3 w-3" /> Public
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Private
                        </span>
                      )}
                      <span>•</span>
                      <span>Created {new Date(collection.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
