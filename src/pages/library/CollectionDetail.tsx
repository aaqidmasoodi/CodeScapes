import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, BookOpen, Clock, Play, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { supabase } from "@/lib/supabase"
import type {
  Collection,
  CollectionTopic,
  CollectionTopicScape,
  CollectionWithTopics,
} from "@/types/collections"

export default function CollectionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [collection, setCollection] = useState<Collection | null>(null)
  const [topics, setTopics] = useState<CollectionWithTopics["topics"]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // 1. Get Collection Details
        const { data: collData, error: collError } = await supabase
          .from("collections")
          .select("*")
          .eq("id", id)
          .single()

        if (collError) throw collError
        setCollection(collData)

        // 2. Fetch Hierarchy
        const { data: topicData, error: topicError } = await supabase
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

        if (topicError) throw topicError

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

        const formattedTopics = (topicData as unknown as TopicStruct[]).map((t) => ({
          ...t,
          scapes: t.collection_topic_scapes
            .map((item) => ({
              ...item,
              scapes: item.scapes,
            }))
            .sort((a, b) => a.order_index - b.order_index),
        }))

        setTopics(
          formattedTopics as unknown as (CollectionTopic & { scapes: CollectionTopicScape[] })[]
        )
      } catch (error) {
        console.error("Error fetching collection details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading || !collection) {
    return (
      <DashboardLayout activeTab="library">
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab="library">
      <div className="flex h-full flex-col bg-background">
        {/* Navigation Header */}
        <div className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/95 px-6 py-4 backdrop-blur">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/library")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold leading-none">{collection.title}</h1>
            <p className="mt-1 text-xs text-muted-foreground">Collection</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-10">
            {/* Intro Section */}
            <div className="space-y-4 border-b pb-8">
              <p className="text-lg leading-relaxed text-muted-foreground">
                {collection.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Updated {new Date(collection.updated_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {topics.length} Sections
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-12">
              {topics.map((topic, index) => (
                <section key={topic.id} className="space-y-6">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold tracking-tight">{topic.title}</h2>
                      {topic.description && (
                        <p className="text-muted-foreground">{topic.description}</p>
                      )}
                    </div>
                  </div>

                  {/* List of Scapes in this Topic */}
                  <div className="grid grid-cols-1 gap-4 pl-0 md:pl-12">
                    {topic.scapes.map((link) => {
                      const scape = link.scapes as unknown as {
                        id: string
                        name: string
                        thumbnail: string | null
                        environment: string | null
                        description: string | null
                      }
                      if (!scape) return null // Deleted scape

                      return (
                        <div
                          key={scape.id}
                          className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/50 hover:shadow-md md:flex-row"
                        >
                          {/* Thumbnail */}
                          <div className="relative h-40 w-full shrink-0 bg-muted md:h-auto md:w-64">
                            {scape.thumbnail ? (
                              <img
                                src={
                                  scape.thumbnail.startsWith("http")
                                    ? scape.thumbnail
                                    : `data:image/jpeg;base64,${scape.thumbnail}`
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-secondary/30" />
                            )}

                            {/* Hover Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                              <Button
                                size="icon"
                                className="h-10 w-10 scale-90 rounded-full opacity-0 shadow-xl transition-all group-hover:scale-100 group-hover:opacity-100"
                                onClick={() => navigate(`/community/scape/${scape.id}`)}
                              >
                                <Play className="ml-0.5 h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex flex-1 flex-col p-4">
                            <div className="flex items-start justify-between">
                              <h3 className="line-clamp-1 text-lg font-semibold">{scape.name}</h3>
                              <Badge variant="secondary" className="text-xs font-medium uppercase">
                                {scape.environment || "Web"}
                              </Badge>
                            </div>
                            <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                              {scape.description || "No description provided."}
                            </p>

                            <div className="mt-4 flex items-center justify-end gap-2 border-t pt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/community/scape/${scape.id}`)}
                              >
                                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                Open Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {topic.scapes.length === 0 && (
                      <p className="text-sm italic text-muted-foreground">
                        No examples in this section yet.
                      </p>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
