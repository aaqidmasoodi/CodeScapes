import { useState, useMemo } from "react"
import { useCollection } from "@/hooks/useCollection"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Clock, Edit, Search, Filter, Play, BookOpen, Cloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Collection } from "@/types/collections"
import { Skeleton } from "@/components/ui/skeleton"

export default function CollectionViewer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Optimistically use collection from navigation state if available
  const [optimisticCollection] = useState<Collection | null>(location.state?.collection || null)

  // Fetch with Caching
  const { collection: fetchedCollection, topics, loading } = useCollection(id)

  // Use fetched data if available, otherwise fallback to optimistic data
  const collection = fetchedCollection || optimisticCollection

  // Filter State
  const [search, setSearch] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<string>("all")

  // derived flat list of all scapes with topic info
  const allScapes = useMemo(() => {
    // Define minimal type needed for the mapping
    type TopicStruct = {
      id: string
      title: string
      scapes: Array<{
        scopes: unknown // Keeping 'unknown' to avoid explicit any
        scapes: {
          id: string
          name: string
          description?: string | null
          thumbnail?: string | null
          environment?: string | null
          updated_at: string
          // Add other scape fields if needed
        }
      }>
    }

    return (topics as unknown as TopicStruct[])
      .flatMap((topic) =>
        topic.scapes.map((s) => ({
          ...s.scapes,
          topicTitle: topic.title,
          topicId: topic.id,
        }))
      )
      .filter((s) => !!s) // filter out nulls if any
  }, [topics])

  const filteredScapes = useMemo(() => {
    return allScapes.filter((scape) => {
      // Search Filter
      const matchesSearch =
        scape.name.toLowerCase().includes(search.toLowerCase()) ||
        (scape.description && scape.description.toLowerCase().includes(search.toLowerCase()))

      // Topic Filter
      const matchesTopic = selectedTopic === "all" || scape.topicId === selectedTopic

      return matchesSearch && matchesTopic
    })
  }, [allScapes, search, selectedTopic])

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Unified Sticky Header matching Dashboard.tsx */}
      <div className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background/95 px-6 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div>
            <div className="flex items-center gap-3">
              {collection ? (
                <>
                  <h1 className="text-2xl font-bold tracking-tight">{collection.title}</h1>
                  <Badge
                    variant={collection.is_public ? "default" : "outline"}
                    className="h-5 py-0.5 text-xs font-normal"
                  >
                    {collection.is_public ? "Public" : "Private"}
                  </Badge>
                </>
              ) : (
                <Skeleton className="h-8 w-48" />
              )}
            </div>
            <div className="mt-1 line-clamp-1 max-w-md text-sm text-muted-foreground">
              {collection ? (
                collection.description || "Manage this collection's content"
              ) : (
                <Skeleton className="h-4 w-64" />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 md:flex-none">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search scapes..."
              className="bg-muted/50 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Topic Filter */}
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="w-[140px] bg-muted/50 md:w-[160px]">
              <div className="flex items-center truncate">
                <Filter className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">
                  {selectedTopic === "all"
                    ? "All Topics"
                    : topics.find((t) => t.id === selectedTopic)?.title}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All Topics</SelectItem>
              {topics.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Edit Button */}
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(`/dashboard/collections/${id}/edit`)}
            className="hidden md:flex"
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={() => navigate(`/dashboard/collections/${id}/edit`)}
            className="flex md:hidden"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-auto bg-muted/5 p-4 [scrollbar-gutter:stable] md:p-6">
        {loading ? (
          /* Skeleton Grid */
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="space-y-2 px-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredScapes.length === 0 ? (
          <div className="mx-auto flex h-[50vh] max-w-2xl flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/5 text-center md:h-[60vh]">
            <div className="mb-4 rounded-full bg-muted p-4">
              <BookOpen className="h-6 w-6 text-muted-foreground md:h-8 md:w-8" />
            </div>
            <h3 className="text-lg font-semibold">No scapes found in collection</h3>
            <p className="mx-auto mb-6 mt-1 max-w-xs text-sm text-muted-foreground">
              {search
                ? "Try adjusting your filters."
                : "This collection is empty. Add scapes in Edit mode."}
            </p>
            {!search && (
              <Button onClick={() => navigate(`/dashboard/collections/${id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Collection
              </Button>
            )}
          </div>
        ) : (
          /* Responsive Grid matching Dashboard.tsx exactly */
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredScapes.map((scape) => {
              const envLabel =
                {
                  web: "Web",
                  python: "Python",
                  flowscape: "FlowScape",
                  node: "Node",
                  r: "R Language",
                }[scape.environment as string] || scape.environment

              const hasThumbnail = scape.thumbnail && scape.thumbnail.length > 50

              // Normalize thumbnail - handle both URL (new) and base64 (legacy)
              const thumbnailSrc = hasThumbnail
                ? scape.thumbnail?.startsWith("http://") || scape.thumbnail?.startsWith("https://")
                  ? scape.thumbnail // New URL format - use directly
                  : scape.thumbnail?.startsWith("data:")
                    ? scape.thumbnail // Already has data: prefix
                    : `data:image/jpeg;base64,${scape.thumbnail}` // Legacy raw base64
                : null

              return (
                <Card
                  key={scape.id}
                  className="group relative flex cursor-pointer flex-col overflow-hidden border-muted transition-all hover:border-primary/50 hover:shadow-lg"
                  onClick={() => navigate(`/scape/${scape.id}`)}
                >
                  {/* Thumbnail */}
                  {thumbnailSrc ? (
                    <div className="max-h-48 w-full overflow-hidden border-b bg-muted/20">
                      <img
                        src={thumbnailSrc}
                        alt="Scape Preview"
                        className="h-full w-full transform-gpu object-cover object-center transition-transform duration-300 will-change-transform group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    /* Fallback when no thumbnail */
                    <div className="flex h-40 w-full items-center justify-center border-b bg-muted/20">
                      <Play className="h-10 w-10 text-muted-foreground/20" />
                    </div>
                  )}

                  {/* Topic Badge Overlay */}
                  <div className="absolute right-2 top-2 z-10">
                    <Badge
                      variant="secondary"
                      className="bg-background/80 text-xs font-normal shadow-sm backdrop-blur"
                    >
                      {scape.topicTitle}
                    </Badge>
                  </div>

                  <CardHeader className="px-4 pb-2 pt-4">
                    <div className="flex items-start justify-between">
                      <div className="w-full space-y-1">
                        <CardTitle className="line-clamp-1 text-lg leading-tight transition-colors group-hover:text-primary">
                          {scape.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span title="Cloud Scape">
                            <Cloud className="h-4 w-4 text-blue-500" />
                          </span>
                          <span className="max-w-[180px] truncate">
                            {scape.description || "No description"}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative mt-auto px-5 pb-4">
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-gray-500/10">
                        {envLabel}
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(scape.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
