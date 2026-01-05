import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ChevronLeft, ChevronRight, Heart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCommunityScapes } from "@/hooks/useCommunityScapes"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"

const appleEase = [0.16, 1, 0.3, 1] as const

export function CommunityShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const { scapes, isLoading } = useCommunityScapes({ filter: "all" })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Reduced parallax movement
  const backgroundY = useTransform(scrollYProgress, [0, 1], [30, -30])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      })
    }
  }

  const featuredScapes = scapes.slice(0, 8)

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-16">
      {/* Background */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ y: backgroundY }}
      >
        <div className="absolute -left-1/4 top-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-[150px]" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header - Compact */}
        <motion.div
          className="mb-8 flex items-end justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: appleEase }}
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From the Community</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Discover what creators are building.
            </p>
          </div>

          <div className="hidden gap-2 sm:flex">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              className="h-8 w-8 rounded-full border-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              className="h-8 w-8 rounded-full border-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Scrollable Cards - Smaller & Tighter */}
        <div ref={scrollRef} className="no-scrollbar -mx-6 flex gap-4 overflow-x-auto px-6 pb-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-64 flex-shrink-0">
                  <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                  <Skeleton className="mt-3 h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </div>
              ))
            : featuredScapes.map((scape, index) => (
                <motion.div
                  key={scape.id}
                  className="group w-64 flex-shrink-0"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05, ease: appleEase }}
                >
                  <Link to={`/community/scape/${scape.id}`}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-card transition-all duration-300 group-hover:border-emerald-500/30 group-hover:shadow-lg">
                      {scape.thumbnail ? (
                        <img
                          src={scape.thumbnail}
                          alt={scape.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <span className="text-3xl">🎨</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <h3 className="truncate text-sm font-semibold">{scape.name}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {scape.stats?.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {scape.stats?.likes || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        {/* View All */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link to="/community">View All Projects →</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
