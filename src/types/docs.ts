export type DocsNodeType = "category" | "page"

export interface DocsNode {
  id: string
  parent_id: string | null
  type: DocsNodeType
  title: string
  slug: string
  content: string | null // Null for categories
  excerpt: string | null
  sort_order: number
  is_hidden: boolean
  is_published: boolean
  created_at: string
  updated_at: string
  // Computed / Recursive
  children?: DocsNode[]
}

export interface DocsTreeItem extends DocsNode {
  children: DocsTreeItem[]
}
