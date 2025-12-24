import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { DocsRepository } from "@/lib/repositories/DocsRepository"
import type { DocsNode } from "@/types/docs"
import { MarkdownRenderer } from "@/components/docs/MarkdownRenderer"
import { Skeleton } from "@/components/ui/skeleton"

export function DocsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<DocsNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return

    let cancelled = false

    const fetchPage = async () => {
      setLoading(true)
      setError(false)

      try {
        const node = await DocsRepository.getPageBySlug(slug)
        if (cancelled) return

        if (node) {
          setPage(node)
        } else {
          setError(true)
        }
      } catch (err) {
        if (cancelled) return
        console.error("Failed to load doc:", err)
        setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPage()

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">Doc page not found.</p>
      </div>
    )
  }

  // Extract Headings for TOC
  const headings =
    page.content?.match(/^#{2,3} .+$/gm)?.map((line) => {
      const level = line.startsWith("###") ? 3 : 2
      const title = line.replace(/^#{2,3} /, "")
      // Simple slugify (must match rehype-slug behavior roughly)
      const id = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
      return { id, title, level }
    }) || []

  return (
    <>
      {/* Right TOC - FIXED */}
      <aside className="fixed right-8 top-24 z-30 hidden w-56 xl:block">
        <h4 className="mb-4 text-sm font-semibold text-foreground">On This Page</h4>
        {headings.length > 0 ? (
          <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
            {headings.map((h, i) => (
              <a
                key={i}
                href={`#${h.id}`}
                className={`transition-colors hover:text-foreground ${h.level === 3 ? "pl-4" : ""}`}
              >
                {h.title}
              </a>
            ))}
          </nav>
        ) : (
          <p className="text-xs text-muted-foreground">No subsections</p>
        )}
      </aside>

      {/* Article Content */}
      <article className="duration-500 animate-in fade-in xl:mr-64">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{page.title}</h1>
          {page.excerpt && <p className="mt-4 text-xl text-muted-foreground">{page.excerpt}</p>}
        </div>

        <MarkdownRenderer content={page.content || ""} />

        <div className="mt-16 border-t pt-8 text-sm text-muted-foreground">
          Last updated: {new Date(page.updated_at).toLocaleDateString()}
        </div>
      </article>
    </>
  )
}
