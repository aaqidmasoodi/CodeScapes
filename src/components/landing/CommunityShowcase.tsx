import { useRef } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Heart, Eye, GitFork } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCommunityScapes } from "@/hooks/useCommunityScapes"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"

export function CommunityShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { scapes, isLoading } = useCommunityScapes({ filter: "all" })

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // Take first 8 scapes for showcase
  const featuredScapes = scapes.slice(0, 8)

  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <motion.div
          className="mb-12 flex items-end justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From the{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                Community
              </span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              Discover what creators are building on CodeScapes.
            </p>
          </div>

          <div className="hidden gap-2 sm:flex">
            <Button variant="outline" size="icon" onClick={() => scroll("left")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll("right")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Scrollable Cards */}
        <div ref={scrollRef} className="no-scrollbar flex gap-6 overflow-x-auto pb-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-72 flex-shrink-0">
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <Skeleton className="mt-3 h-5 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                </div>
              ))
            : featuredScapes.map((scape, index) => (
                <motion.div
                  key={scape.id}
                  className="group w-72 flex-shrink-0"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link to={`/community/scape/${scape.id}`}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-card transition-all group-hover:border-emerald-500/50 group-hover:shadow-lg">
                      {/* Thumbnail */}
                      {scape.thumbnail ? (
                        <img
                          src={scape.thumbnail}
                          alt={scape.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <span className="text-4xl">🎨</span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-sm font-medium text-white">View Project →</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="mt-3">
                      <h3 className="truncate font-semibold">{scape.name}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {scape.stats?.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {scape.stats?.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="h-3 w-3" />
                          {scape.stats?.forks || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        {/* View All Button */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button variant="outline" asChild>
            <Link to="/community">View All Projects →</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
