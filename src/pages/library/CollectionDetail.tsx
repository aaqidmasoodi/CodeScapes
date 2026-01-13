import { useState, useMemo } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { Search, Calendar, Code2, Loader2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { supabase } from "@/lib/supabase"
import type { Collection, CollectionTopic, CollectionTopicScape } from "@/types/collections"
import { useQuery } from "@tanstack/react-query"

// Extended type for flat list
type FlatScapeItem = CollectionTopicScape["scapes"] & {
  topicId: string
  topicTitle: string
  scapeId: string
  realScapeId: string
  updatedAt: string
  description: string | null
}

export default function CollectionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // 1. Optimistic Collection Data (from Navigation State)
  const initialCollection = location.state?.initialCollection as Collection | undefined

  // 2. Fetch Collection Details (Cache: ['collection', id])
  const { data: collection, isLoading: loadingCollection } = useQuery({
    queryKey: ["collection", id],
    queryFn: async () => {
      // If we have initial data, we don't necessarily avoid the fetch (staleTime handles that),
      // but React Query will use initialData immediately.
      const { data, error } = await supabase.from("collections").select("*").eq("id", id).single()
      if (error) throw error
      return data as Collection
    },
    initialData: initialCollection,
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 min
  })

  // 3. Fetch Topics & Scapes (Cache: ['collection-topics', id])
  const { data: topics = [], isLoading: loadingTopics } = useQuery({
    queryKey: ["collection-topics", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collection_topics")
        .select(
          `
        *,
        collection_topic_scapes (
          order_index,
          scape_id,
          topic_id,
          created_at,
          scapes (
            id,
            name,
            thumbnail,
            environment,
            description,
            updated_at
          )
        )
      `
        )
        .eq("collection_id", id)
        .order("order_index", { ascending: true })

      if (error) throw error

      // Transform and Sort
      type TopicStruct = {
        id: string
        title: string
        description: string | null
        collection_id: string
        order_index: number
        created_at: string
        updated_at: string
        collection_topic_scapes: {
          order_index: number
          scape_id: string
          topic_id: string
          created_at: string
          scapes: unknown
        }[]
      }

      return (data as unknown as TopicStruct[]).map((t) => ({
        ...t,
        scapes: t.collection_topic_scapes
          .map((item) => ({
            ...item,
            scapes: item.scapes,
          }))
          .sort((a, b) => a.order_index - b.order_index),
      })) as unknown as (CollectionTopic & { scapes: CollectionTopicScape[] })[]
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopicId, setSelectedTopicId] = useState<string>("all")

  // Flatten scapes for the grid
  const filteredScapes = useMemo(() => {
    const flatList: FlatScapeItem[] = []

    topics.forEach((topic) => {
      topic.scapes.forEach((link) => {
        const s = link.scapes
        if (!s) return

        flatList.push({
          ...s,
          topicId: topic.id,
          topicTitle: topic.title,
          scapeId: s.id,
          realScapeId: s.id,
          updatedAt: s.updated_at,
          description: s.description,
        })
      })
    })

    return flatList.filter((item) => {
      // Search Filter
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Topic Filter
      const matchesTopic = selectedTopicId === "all" || item.topicId === selectedTopicId

      return matchesSearch && matchesTopic
    })
  }, [topics, searchQuery, selectedTopicId])

  // Initial Loading Block: Only if we have NO collection data at all (not even optimistic)
  if (loadingCollection && !collection) {
    return (
      <DashboardLayout activeTab="library">
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  // Fallback if collection missing after load
  if (!collection && !loadingCollection) return null

  return (
    <DashboardLayout activeTab="library">
      <div className="flex h-full flex-col bg-background font-sans text-foreground">
        {/* === Header / Control Bar === */}
        <div className="sticky top-0 z-20 border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold leading-none">{collection?.title}</h1>
                  {collection?.is_public && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                      Public
                    </Badge>
                  )}
                </div>
                <p className="mt-1 line-clamp-1 max-w-md text-xs text-muted-foreground">
                  {collection?.description}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-1 items-center gap-2 md:max-w-md md:justify-end">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search scapes..."
                  className="h-9 border-input/50 bg-muted/50 pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
                <SelectTrigger className="h-9 w-[140px] border-input/50 bg-muted/50">
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* === Main Grid Canvas === */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="w-full">
            {loadingTopics ? (
              // --- Loading Skeleton for Grid Only ---
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="aspect-video w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredScapes.length === 0 ? (
              <div className="flex h-[50vh] flex-col items-center justify-center text-center">
                <div className="rounded-full bg-muted p-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No scapes found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or search query.
                </p>
                {(searchQuery || selectedTopicId !== "all") && (
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedTopicId("all")
                    }}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredScapes.map((scape) => (
                  <div
                    key={scape.realScapeId}
                    className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                    onClick={() => navigate(`/community/scape/${scape.realScapeId}`)}
                  >
                    {/* Thumbnail Header */}
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      {/* Thumbnail Image */}
                      {scape.thumbnail ? (
                        <img
                          src={
                            scape.thumbnail.startsWith("http")
                              ? scape.thumbnail
                              : `data:image/jpeg;base64,${scape.thumbnail}`
                          }
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary/30">
                          <Code2 className="h-10 w-10 text-muted-foreground/20" />
                        </div>
                      )}

                      {/* Topic Badge Overlay */}
                      <div className="absolute left-2 top-2">
                        <Badge
                          variant="secondary"
                          className="bg-background/80 text-[10px] font-bold shadow-sm backdrop-blur-sm hover:bg-background/100"
                        >
                          {scape.topicTitle}
                        </Badge>
                      </div>

                      {/* Play Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-all group-hover:opacity-100">
                        <div className="rounded-full bg-background/90 p-3 shadow-lg backdrop-blur-sm">
                          <Play className="ml-1 h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-1 text-base font-bold leading-tight transition-colors group-hover:text-primary">
                        {scape.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {scape.description || "No description provided."}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                        {/* Language/Env Badge */}
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="h-5 border-border/50 bg-muted/20 px-1.5 text-[10px] font-medium uppercase"
                          >
                            {scape.environment || "Web"}
                          </Badge>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 opacity-70" />
                          <span>{new Date(scape.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
