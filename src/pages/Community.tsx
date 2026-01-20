import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { useCommunityScapes } from "@/hooks/useCommunityScapes"
import { ScapeCard } from "@/components/community/ScapeCard"
import { SeoHead } from "@/components/common/SeoHead"

type FilterType = "all" | "web" | "python" | "flow"

export default function CommunityPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchQuery, setSearchQuery] = useState("")

  // Get filter from URL or default to "all"
  const filterFromUrl = (searchParams.get("filter") as FilterType) || "all"
  const [filter, setFilter] = useState<FilterType>(filterFromUrl)

  // Browser Detection (computed once on mount)
  const isRestrictedBrowser = useMemo(() => {
    if (typeof navigator === "undefined") return false
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    const isSafariRaw =
      /Safari/.test(navigator.userAgent) &&
      !/Chrome/.test(navigator.userAgent) &&
      !/Chromium/.test(navigator.userAgent)
    return isIOS || isSafariRaw
  }, [])

  // Effective filter (force python for restricted browsers)
  const effectiveFilter = isRestrictedBrowser ? "python" : filter

  // Use the cached infinite query hook
  const { scapes, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useCommunityScapes({
    filter: effectiveFilter,
  })

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "200px", // Trigger 200px before reaching bottom
      threshold: 0,
    })

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [handleObserver])

  // Client-side search filter
  const filteredScapes = scapes.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase())
    // Hard filter for restricted browsers (Safari/iOS)
    if (isRestrictedBrowser) {
      return matchesSearch && s.environment === "python"
    }
    return matchesSearch
  })

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: scapes.map((s, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://codescapes.io/community/scape/${s.id}`,
      name: s.name,
    })),
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <SeoHead
        title="Community"
        description="Discover interactive coding projects created by the CodeScapes community."
        url="https://codescapes.io/community"
        jsonLd={jsonLd}
      />

      {/* Main Content (Offsets for collapsed sidebar on Desktop ONLY) */}
      <main className="flex-1 overflow-auto bg-background p-6">
        {/* Toolbar / Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Community</h1>
              <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px]">
                Beta
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Discover projects from the community</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Bar */}
            <div className="relative w-full min-w-[200px] max-w-sm sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search community..."
                className="h-9 pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {!isRestrictedBrowser && (
              <div className="flex items-center gap-2">
                {["all", "web", "python"].map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newFilter = f as FilterType
                      setFilter(newFilter)
                      // Update URL
                      if (newFilter === "all") {
                        setSearchParams({})
                      } else {
                        setSearchParams({ filter: newFilter })
                      }
                    }}
                    className="capitalize"
                  >
                    {f}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <Skeleton key={i} className="h-52 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredScapes.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
            <Search className="mb-4 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-medium">No scapes found</h3>
            <p className="text-muted-foreground">Try creating one or adjust your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredScapes.map((scape) => (
                <ScapeCard
                  key={scape.id}
                  scape={scape}
                  onClick={() =>
                    navigate(`/community/scape/${scape.id}`, {
                      state: { from: location.pathname },
                    })
                  }
                />
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="mt-8 flex justify-center">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading more...</span>
                </div>
              )}
              {!hasNextPage && scapes.length > 0 && (
                <p className="text-sm text-muted-foreground">You've reached the end</p>
              )}
            </div>

            {/* Skeleton placeholders while loading more */}
            {isFetchingNextPage && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={`loading-${i}`} className="h-52 w-full rounded-xl" />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
