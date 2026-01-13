// Types for Collections & Library Feature

export interface Collection {
  id: string
  user_id: string
  title: string
  description: string | null
  is_public: boolean
  is_featured: boolean
  slug: string | null
  created_at: string
  updated_at: string
}

export interface CollectionTopic {
  id: string
  collection_id: string
  title: string
  description: string | null
  order_index: number
  created_at: string
}

export interface CollectionTopicScape {
  topic_id: string
  scape_id: string
  order_index: number
  created_at: string
  // Linked Scape Data (Joined)
  scapes?: {
    id: string
    name: string
    thumbnail: string | null
    environment: string | null
  }
}

// Composite type for the "Book View"
export interface CollectionWithTopics extends Collection {
  topics: (CollectionTopic & {
    scapes: CollectionTopicScape[]
  })[]
}
