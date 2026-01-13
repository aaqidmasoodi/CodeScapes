import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams } from "react-router-dom"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus, Save, Trash2, RefreshCw, Search, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { useScapes } from "@/hooks/useScapes"
import type { Collection } from "@/types/collections"
import { toast } from "sonner"
// Import Scape type (assuming it exists in types/db or similar, otherwise define locally)
import type { Scape } from "@/lib/db"

// --- Types ---
type ScapeItem = {
  id: string // Unique draggable ID
  scape_id: string // Foreign Key (Real Scape ID)
  name: string
  thumbnail: string | null
  environment: string | null
}

type TopicItem = {
  id: string
  title: string
  scapes: ScapeItem[]
}

// --- Components ---

function SortableScapeItem({ scape, onRemove }: { scape: ScapeItem; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: scape.id,
    data: { type: "scape", scape },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-16 w-full rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 opacity-50"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 rounded-lg border bg-card p-2 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex h-8 w-6 cursor-grab items-center justify-center text-muted-foreground/30 hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-muted">
        {scape.thumbnail && (
          <img
            src={
              scape.thumbnail.startsWith("http")
                ? scape.thumbnail
                : `data:image/jpeg;base64,${scape.thumbnail}`
            }
            className="h-full w-full object-cover"
            alt=""
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="truncate text-sm font-medium leading-tight">{scape.name}</span>
        <span className="text-[10px] uppercase text-muted-foreground">
          {scape.environment || "WEB"}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground/30 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function SidebarDraggableScape({ scape }: { scape: Scape }) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: `sidebar-${scape.id}`,
    data: { type: "sidebar-scape", scape },
  })

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        className="flex items-center gap-3 rounded-lg border border-primary/50 bg-primary/5 p-2 opacity-50"
      >
        <div className="h-10 w-16 shrink-0 rounded bg-muted"></div>
        <div className="flex-1 space-y-1">
          <div className="h-3 w-20 rounded bg-muted-foreground/20"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="flex cursor-grab items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-muted/50 active:cursor-grabbing"
    >
      <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-muted shadow-sm">
        {scape.thumbnail && (
          <img
            src={
              scape.thumbnail.startsWith("http")
                ? scape.thumbnail
                : `data:image/jpeg;base64,${scape.thumbnail}`
            }
            className="h-full w-full object-cover"
            alt=""
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{scape.name}</div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          {scape.environment || "Web"}
        </div>
      </div>
      <Plus className="h-4 w-4 text-muted-foreground/30" />
    </div>
  )
}

function DroppableTopicArea({
  id,
  items,
  onRemove,
}: {
  id: string
  items: ScapeItem[]
  onRemove: (s: ScapeItem) => void
}) {
  const { setNodeRef } = useSortable({ id })
  return (
    <div ref={setNodeRef} className="min-h-[50px] space-y-2">
      {items.map((scape) => (
        <SortableScapeItem key={scape.id} scape={scape} onRemove={() => onRemove(scape)} />
      ))}
      {items.length === 0 && (
        <div className="flex h-12 items-center justify-center rounded border border-dashed text-xs text-muted-foreground/50">
          Drop scapes here
        </div>
      )}
    </div>
  )
}

export default function CollectionBuilder() {
  const { id } = useParams()
  const { user } = useAuth()
  const { scapes: cloudScapes, loading: loadingScapes } = useScapes()

  // --- State ---
  const [loading, setLoading] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  // Collection Metadata
  const [collectionData, setCollectionData] = useState<Partial<Collection>>({})

  // Topics
  const [topics, setTopics] = useState<TopicItem[]>([])
  const [activeDragItem, setActiveDragItem] = useState<ScapeItem | null>(null)

  // Search
  const [sidebarSearch, setSidebarSearch] = useState("")

  // Optimize Filtering
  const usedScapeIds = useMemo(() => {
    const ids = new Set<string>()
    topics.forEach((t) => t.scapes.forEach((s) => ids.add(s.scape_id)))
    return ids
  }, [topics])

  const sidebarList = useMemo(() => {
    const lowerSearch = sidebarSearch.toLowerCase()
    return cloudScapes.filter((s) => {
      // 1. Basic Filters
      const matchesSearch = s.source === "cloud" && s.name.toLowerCase().includes(lowerSearch)

      // 2. Exclude if already in collection (O(1) lookup)
      return matchesSearch && !usedScapeIds.has(s.id)
    })
  }, [cloudScapes, sidebarSearch, usedScapeIds])

  // --- Fetch Data ---
  useEffect(() => {
    if (!id || !user) return
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user])

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      // 1. Get Collection
      const { data: collData, error: collError } = await supabase
        .from("collections")
        .select("*")
        .eq("id", id)
        .single()
      if (collError) throw collError
      setCollectionData(collData)

      // 2. Get Topics & Scapes
      const { data: topicData, error: topicError } = await supabase
        .from("collection_topics")
        .select(
          `
  *,
  collection_topic_scapes(
    order_index,
    scape_id,
    scapes(id, name, thumbnail, environment)
  )
    `
        )
        .eq("collection_id", id)
        .order("order_index", { ascending: true })

      if (topicError) throw topicError

      // Define stricter type for the join result
      type TopicWithScapes = {
        id: string
        title: string
        collection_topic_scapes: {
          order_index: number
          scape_id: string
          scapes: {
            // Joined relation might be null or object
            name: string
            thumbnail: string | null
            environment: string | null
          } | null
        }[]
      }

      if (topicError) throw topicError

      const formattedTopics: TopicItem[] = (topicData as unknown as TopicWithScapes[]).map((t) => ({
        id: t.id,
        title: t.title,
        scapes: t.collection_topic_scapes
          .sort((a, b) => a.order_index - b.order_index)
          .map((item) => ({
            id: `scape-${item.scape_id}`,
            scape_id: item.scape_id,
            name: item.scapes?.name || "Unknown",
            thumbnail: item.scapes?.thumbnail || null,
            environment: item.scapes?.environment || null,
          })),
      }))

      setTopics(formattedTopics)
      setIsDirty(false)
    } catch (error) {
      console.error("Error fetching collection:", error)
      toast.error("Failed to load collection")
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // --- Actions ---

  const handleSave = async () => {
    if (!isDirty || !id) return
    setSaving(true)
    try {
      // 1. Update Collection Info
      const { error: collError } = await supabase
        .from("collections")
        .update({
          title: collectionData.title,
          description: collectionData.description,
          is_public: collectionData.is_public,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (collError) throw collError

      // 2. Sync Hierarchy (Topics & Scapes)
      // Strategy: Upsert (Update/Insert) all current items, then Prune (Delete) removed items.

      // A. Topics Sync
      const topicsPayload = topics.map((t, index) => ({
        id: t.id,
        collection_id: id,
        title: t.title,
        order_index: index,
        updated_at: new Date().toISOString(), // Ensure last_modified updates
      }))

      // Bulk Upsert Topics
      const { error: topicsUpsertError } = await supabase
        .from("collection_topics")
        .upsert(topicsPayload)

      if (topicsUpsertError) throw topicsUpsertError

      // Prune Deleted Topics
      const currentTopicIds = topics.map((t) => t.id)
      const { error: topicsDeleteError } = await supabase
        .from("collection_topics")
        .delete()
        .eq("collection_id", id)
        .not("id", "in", `(${currentTopicIds.join(",")})`) // Delete IDs NOT in current list

      if (topicsDeleteError) throw topicsDeleteError

      // B. Scapes Sync (Parallel per Topic)
      const scapePromises = topics.map(async (topic) => {
        // Prepare Scape Payload for this Topic
        if (topic.scapes.length > 0) {
          const scapesPayload = topic.scapes.map((s, index) => ({
            topic_id: topic.id,
            scape_id: s.scape_id,
            order_index: index,
          }))

          // Bulk Upsert Scapes for Topic
          const { error: scapesUpsertError } = await supabase
            .from("collection_topic_scapes")
            .upsert(scapesPayload, { onConflict: "topic_id,scape_id" })

          if (scapesUpsertError) throw scapesUpsertError
        }

        // Prune Deleted Scapes for this Topic
        const currentScapeIds = topic.scapes.map((s) => s.scape_id)

        // If list is empty, delete all for topic. Else delete only missing.
        let pruneQuery = supabase.from("collection_topic_scapes").delete().eq("topic_id", topic.id)

        if (currentScapeIds.length > 0) {
          pruneQuery = pruneQuery.not("scape_id", "in", `(${currentScapeIds.join(",")})`)
        }

        const { error: scapesDeleteError } = await pruneQuery
        if (scapesDeleteError) throw scapesDeleteError
      })

      await Promise.all(scapePromises)

      await fetchData(true) // Refresh state silently
      setIsDirty(false)
      toast.success("Changes saved successfully")
    } catch (e) {
      console.error(e)
      toast.error("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  // --- Add/Remove Topics/Scapes ---
  const handleAddTopic = () => {
    const title = `Topic ${topics.length + 1}`
    // Generate real UUID client-side for immediate usage in Upsert
    const tempId = crypto.randomUUID()
    setTopics((prev) => [...prev, { id: tempId, title, scapes: [] }])
    setIsDirty(true)
  }

  const handleUpdateMeta = (updates: Partial<Collection>) => {
    setCollectionData((prev) => ({ ...prev, ...updates }))
    setIsDirty(true)
  }

  const handleUpdateTopicTitle = (topicId: string, newTitle: string) => {
    setTopics((prev) => prev.map((t) => (t.id === topicId ? { ...t, title: newTitle } : t)))
    setIsDirty(true)
  }

  // --- DnD Handlers ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event

    if (active.data.current?.type === "sidebar-scape") {
      const scape = active.data.current.scape
      setActiveDragItem({
        id: `temp-${scape.id}`,
        scape_id: scape.id,
        name: scape.name,
        thumbnail: scape.thumbnail,
        environment: scape.environment,
      })
    } else {
      setActiveDragItem(active.data.current?.scape as ScapeItem)
    }
  }

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return

      const activeId = active.id
      const overId = over.id

      // Find the containers
      const findContainer = (id: string) => {
        if (id.startsWith("topic-") || topics.some((t) => t.id === id)) {
          return id.replace("topic-", "")
        }
        return topics.find((t) => t.scapes.some((item) => item.id === id))?.id
      }

      const activeContainer = findContainer(activeId as string)
      const overContainer = findContainer(overId as string)

      if (!activeContainer || !overContainer || activeContainer === overContainer) {
        return
      }

      // Moving between different containers is handled mostly by DragEnd for stability
    },
    [topics]
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragItem(null)

    if (!over) return

    const sourceId = active.id as string
    const targetId = over.id as string
    const isSidebarSource = sourceId.startsWith("sidebar-")

    const findTopicId = (itemId: string) => {
      // Direct drop on topic container
      if (itemId.startsWith("topic-") || topics.some((t) => t.id === itemId)) {
        return itemId.replace("topic-", "")
      }
      // Drop on an item inside a topic
      const topic = topics.find((t) => t.id === itemId || t.scapes.some((s) => s.id === itemId))
      return topic?.id
    }

    const sourceTopicId = isSidebarSource ? null : findTopicId(sourceId)
    const targetTopicId = findTopicId(targetId)

    if (!targetTopicId) return

    // CHECK DUPLICATES: Check if scape already exists in ANY topic (Global Uniqueness per collection)
    if (isSidebarSource) {
      const scapeData = active.data.current?.scape
      const alreadyExists = topics.some((t) => t.scapes.some((s) => s.scape_id === scapeData.id))

      if (alreadyExists) {
        toast.error("This scape is already in the collection")
        return
      }

      const newScapeItem: ScapeItem = {
        id: `scape-${scapeData.id}`,
        scape_id: scapeData.id,
        name: scapeData.name,
        thumbnail: scapeData.thumbnail,
        environment: scapeData.environment,
      }

      setTopics((prev) =>
        prev.map((t) => {
          if (t.id === targetTopicId) {
            return { ...t, scapes: [...t.scapes, newScapeItem] }
          }
          return t
        })
      )
      setIsDirty(true)
      return
    }

    // Sort / Move
    if (sourceTopicId && targetTopicId) {
      if (sourceTopicId === targetTopicId) {
        // Same Topic Sort
        const topic = topics.find((t) => t.id === sourceTopicId)
        if (!topic) return

        const oldIndex = topic.scapes.findIndex((s) => s.id === sourceId)
        const newIndex = topic.scapes.findIndex((s) => s.id === targetId)

        if (oldIndex !== newIndex && newIndex !== -1) {
          const newScapes = arrayMove(topic.scapes, oldIndex, newIndex)
          setTopics((prev) =>
            prev.map((t) => (t.id === sourceTopicId ? { ...t, scapes: newScapes } : t))
          )
          setIsDirty(true)
        }
      } else {
        // Cross Topic Move
        const sourceTopic = topics.find((t) => t.id === sourceTopicId)
        const targetTopic = topics.find((t) => t.id === targetTopicId)
        if (!sourceTopic || !targetTopic) return

        const dragItem = sourceTopic.scapes.find((s) => s.id === sourceId)
        if (!dragItem) return

        const targetIndex = targetTopic.scapes.findIndex((s) => s.id === targetId)
        const insertIndex = targetIndex === -1 ? targetTopic.scapes.length : targetIndex

        setTopics((prev) =>
          prev.map((t) => {
            if (t.id === sourceTopicId) {
              return { ...t, scapes: t.scapes.filter((s) => s.id !== sourceId) }
            }
            if (t.id === targetTopicId) {
              const newScapes = [...t.scapes]
              newScapes.splice(insertIndex, 0, dragItem)
              return { ...t, scapes: newScapes }
            }
            return t
          })
        )
        setIsDirty(true)
      }
    }
  }

  // --- Add/Remove Topics/Scapes ---

  const handleRemoveScape = (topicId: string, scapeItem: ScapeItem) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) return { ...t, scapes: t.scapes.filter((s) => s.id !== scapeItem.id) }
        return t
      })
    )
    setIsDirty(true)
  }

  if (loading) {
    return (
      <DashboardLayout activeTab="collections">
        <div className="flex h-full items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab="collections">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full flex-col bg-background">
          {/* --- Header --- */}
          <div className="sticky top-0 z-20 flex items-start justify-between border-b bg-background/80 px-6 py-4 backdrop-blur-xl">
            <div className="flex flex-1 flex-col gap-1">
              {collectionData.title !== undefined && (
                <Input
                  value={collectionData.title}
                  onChange={(e) => handleUpdateMeta({ title: e.target.value })}
                  className="h-auto w-full max-w-md border-none bg-transparent p-0 text-xl font-bold uppercase tracking-tight text-foreground shadow-none placeholder:text-muted-foreground/30 focus-visible:ring-0 sm:text-2xl"
                  placeholder="Collection Name"
                />
              )}
              <Textarea
                value={collectionData.description || ""}
                onChange={(e) => handleUpdateMeta({ description: e.target.value })}
                className="min-h-[24px] w-full max-w-lg resize-none border-none bg-transparent p-0 text-sm italic text-muted-foreground shadow-none focus-visible:ring-0"
                placeholder="Add a description..."
                rows={1}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-1.5">
                <Switch
                  id="public-mode"
                  checked={collectionData.is_public}
                  onCheckedChange={(checked) => handleUpdateMeta({ is_public: checked })}
                  className="scale-90"
                />
                <Label
                  htmlFor="public-mode"
                  className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {collectionData.is_public ? "Public" : "Private"}
                </Label>
              </div>

              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !isDirty}
                variant={isDirty ? "default" : "secondary"}
                className="min-w-[140px]"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* --- Main Layout --- */}
          <div className="flex flex-1 overflow-hidden">
            {/* LEFT: Topics Canvas */}
            <div className="flex-1 overflow-y-auto bg-muted/5 p-8">
              <div className="flex h-full flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Table of Contents
                  </h2>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleAddTopic}
                    className="h-7 text-xs"
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add Topic
                  </Button>
                </div>

                <div className="grid flex-1 content-start gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {topics.map((topic, index) => (
                    <div
                      key={topic.id}
                      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
                    >
                      {/* Topic Header */}
                      <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-4 py-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-background text-xs font-bold shadow-sm ring-1 ring-border/50">
                          {index + 1}
                        </span>
                        <Input
                          value={topic.title}
                          onChange={(e) => handleUpdateTopicTitle(topic.id, e.target.value)}
                          className="h-auto border-none bg-transparent p-0 text-sm font-semibold shadow-none focus-visible:ring-0"
                        />
                      </div>

                      {/* Drop Zone */}
                      <SortableContext
                        id={topic.id}
                        items={topic.scapes}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex-1 space-y-2 p-3">
                          <DroppableTopicArea
                            id={topic.id}
                            items={topic.scapes}
                            onRemove={(s) => handleRemoveScape(topic.id, s)}
                          />
                        </div>
                      </SortableContext>
                    </div>
                  ))}

                  {/* Add New Topic Card (Optional, but user has button) */}
                  {topics.length === 0 && (
                    <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/20">
                      <p className="text-sm text-muted-foreground">No topics yet.</p>
                      <Button variant="link" onClick={handleAddTopic}>
                        Create your first topic
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Scape Sidebar */}
            <div className="flex w-[320px] shrink-0 flex-col border-l bg-muted/10">
              <div className="border-b p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Source Scapes
                </h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="h-9 bg-background/50 pl-9"
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-2">
                  {loadingScapes ? (
                    <div className="py-10 text-center">
                      <RefreshCw className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    sidebarList.map((scape) => (
                      <SidebarDraggableScape key={scape.id} scape={scape} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragItem ? (
            <div className="flex w-[280px] cursor-grabbing items-center gap-3 rounded-lg border bg-background p-2 opacity-90 shadow-xl">
              <div className="h-10 w-16 shrink-0 overflow-hidden rounded bg-muted">
                {activeDragItem.thumbnail && (
                  <img
                    src={
                      activeDragItem.thumbnail.startsWith("http")
                        ? activeDragItem.thumbnail
                        : `data:image/jpeg;base64,${activeDragItem.thumbnail}`
                    }
                    className="h-full w-full object-cover"
                    alt=""
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{activeDragItem.name}</div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DashboardLayout>
  )
}
