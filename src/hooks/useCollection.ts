import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { Collection, TopicWithJoinedScapes } from "@/types/collections"

export function useCollection(id: string | undefined) {
  const {
    data: collection,
    isLoading: loadingCollection,
    error: collectionError,
  } = useQuery({
    queryKey: ["collection", id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase.from("collections").select("*").eq("id", id).single()

      if (error) throw error
      return data as Collection
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const {
    data: topics = [],
    isLoading: loadingTopics,
    error: topicsError,
  } = useQuery({
    queryKey: ["collection_topics", id],
    queryFn: async () => {
      if (!id) return []
      const { data, error } = await supabase
        .from("collection_topics")
        .select(
          `
                    *,
                    collection_topic_scapes (
                        order_index,
                        scapes (
                            id,
                            name,
                            description,
                            thumbnail,
                            updated_at,
                            environment,
                            source
                        )
                    )
                `
        )
        .eq("collection_id", id)
        .order("order_index", { ascending: true })

      if (error) throw error

      // Transform and Sort
      return (data as unknown as TopicWithJoinedScapes[]).map((t) => ({
        ...t,
        scapes: t.collection_topic_scapes
          .map((item) => ({
            ...item,
            scapes: item.scapes,
          }))
          .sort((a, b) => a.order_index - b.order_index),
      }))
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    collection,
    topics,
    loading: loadingCollection || loadingTopics,
    error: collectionError || topicsError,
  }
}

export function useCollections(userId: string | undefined) {
  return useQuery({
    queryKey: ["collections", userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as Collection[]
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
