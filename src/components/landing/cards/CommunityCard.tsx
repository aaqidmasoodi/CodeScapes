import { motion } from "framer-motion"
import { Eye, Heart } from "lucide-react"
import { useCommunityScapes } from "@/hooks/useCommunityScapes"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"

const appleEase = [0.16, 1, 0.3, 1] as const

export function CommunityCard() {
  const { scapes, isLoading } = useCommunityScapes({ filter: "all" })
  const featuredScapes = scapes.slice(0, 4)

  return (
    <motion.div
      className="col-span-12 lg:col-span-4 lg:row-span-2"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3, ease: appleEase }}
    >
      <div className="h-full overflow-hidden rounded-2xl border border-black/10 bg-white/80 p-5 shadow-sm dark:border-white/5 dark:bg-white/[0.02] dark:shadow-none">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">From the Community</h3>

        <div className="grid grid-cols-2 gap-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))
            : featuredScapes.map((scape) => (
                <Link
                  key={scape.id}
                  to={`/community/scape/${scape.id}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-white/5 bg-card transition-all hover:border-emerald-500/30"
                >
                  {scape.thumbnail ? (
                    <img
                      src={scape.thumbnail}
                      alt={scape.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-2xl">
                      🎨
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex items-center gap-2 text-[10px] text-white/80">
                      <span className="flex items-center gap-0.5">
                        <Eye className="h-3 w-3" />
                        {scape.stats?.views || 0}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-3 w-3" />
                        {scape.stats?.likes || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
        </div>

        <Link
          to="/community"
          className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground"
        >
          View All →
        </Link>
      </div>
    </motion.div>
  )
}
