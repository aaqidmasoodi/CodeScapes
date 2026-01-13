import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Globe, Book, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { supabase } from "@/lib/supabase"
import type { Collection } from "@/types/collections"
import { Skeleton } from "@/components/ui/skeleton"

export default function LibraryPage() {
  const navigate = useNavigate()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchPublicCollections()
  }, [])

  const fetchPublicCollections = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setCollections(data || [])
    } catch (error) {
      console.error("Error fetching library:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCollections = collections.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout activeTab="library">
      <div className="flex h-full flex-col bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background/95 px-6 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Library</h1>
              <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px]">
                Beta
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Explore curated code collections from the community.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 [scrollbar-gutter:stable]">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="flex h-[50vh] flex-col items-center justify-center text-center text-muted-foreground">
              <Globe className="mb-4 h-12 w-12 opacity-20" />
              <h3 className="text-lg font-medium">No public collections found</h3>
              <p className="mt-1 text-sm">Be the first to publish a collection!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCollections.map((collection) => (
                <Card
                  key={collection.id}
                  className="group cursor-pointer overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg"
                  onClick={() => navigate(`/library/${collection.id}`)}
                >
                  <div className="flex h-32 items-center justify-center border-b bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                    <Book className="h-10 w-10 text-primary/40 transition-colors group-hover:text-primary/60" />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{collection.title}</CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                      {collection.description || "No description provided."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Community</span>
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
