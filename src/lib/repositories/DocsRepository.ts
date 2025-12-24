import { supabase } from "../supabase"
import type { DocsNode, DocsTreeItem } from "@/types/docs"

export class DocsRepository {
  /**
   * Fetches all published nodes and builds a recursive tree.
   * Optimized for Public Viewer (Read-only, published only).
   */
  static async getPublicTree(): Promise<DocsTreeItem[]> {
    const { data, error } = await supabase
      .from("docs_nodes")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })

    if (error) throw error
    return this.buildTree(data as DocsNode[])
  }

  /**
   * Fetches ALL nodes (including hidden/drafts).
   * For Admin Portal.
   */
  static async getAdminTree(): Promise<DocsTreeItem[]> {
    const { data, error } = await supabase
      .from("docs_nodes")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error) throw error
    return this.buildTree(data as DocsNode[])
  }

  /**
   * Fetch a single page by slug.
   */
  static async getPageBySlug(slug: string): Promise<DocsNode | null> {
    const { data, error } = await supabase
      .from("docs_nodes")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single()

    if (error) return null
    return data as DocsNode
  }

  /**
   * Admin: Get node by ID (for editing)
   */
  static async getNodeById(id: string): Promise<DocsNode | null> {
    const { data, error } = await supabase.from("docs_nodes").select("*").eq("id", id).single()

    if (error) return null
    return data as DocsNode
  }

  /* =========================
       CRUD (Admin Only)
       (RLS will block these if user is not admin)
    ========================= */

  static async createNode(node: Partial<DocsNode>): Promise<DocsNode> {
    const { data, error } = await supabase.from("docs_nodes").insert(node).select().single()

    if (error) throw error
    return data as DocsNode
  }

  static async updateNode(id: string, updates: Partial<DocsNode>): Promise<DocsNode> {
    const { data, error } = await supabase
      .from("docs_nodes")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as DocsNode
  }

  static async deleteNode(id: string): Promise<void> {
    const { error } = await supabase.from("docs_nodes").delete().eq("id", id)

    if (error) throw error
  }

  /* =========================
       Helpers
    ========================= */

  private static buildTree(flatNodes: DocsNode[]): DocsTreeItem[] {
    const rootNodes: DocsTreeItem[] = []
    const map = new Map<string, DocsTreeItem>()

    // 1. Initialize map
    flatNodes.forEach((node) => {
      map.set(node.id, { ...node, children: [] })
    })

    // 2. Build Hierarchy
    flatNodes.forEach((node) => {
      const item = map.get(node.id)!
      if (node.parent_id && map.has(node.parent_id)) {
        map.get(node.parent_id)!.children.push(item)
      } else {
        rootNodes.push(item)
      }
    })

    return rootNodes
  }
}
