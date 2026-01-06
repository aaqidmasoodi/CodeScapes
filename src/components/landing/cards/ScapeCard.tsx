import { motion } from "framer-motion"
import { Eye, Heart } from "lucide-react"
import { useCommunityScapes } from "@/hooks/useCommunityScapes"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

const appleEase = [0.16, 1, 0.3, 1] as const

interface ScapeCardProps {
  scapeIndex?: number
  delay?: number
  className?: string
}

export function ScapeCard({ scapeIndex = 0, delay = 0, className }: ScapeCardProps) {
  const { scapes, isLoading } = useCommunityScapes({ filter: "all" })
  const scape = scapes[scapeIndex]

  if (isLoading) {
    return (
      <div className={cn("col-span-3 lg:col-span-2", className)}>
        <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      </div>
    )
  }

  if (!scape) return null

  return (
    <motion.div
      className={cn("col-span-3 lg:col-span-2", className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: appleEase }}
    >
      <Link
        to={`/community/scape/${scape.id}`}
        className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-black/10 shadow-sm transition-all hover:shadow-lg dark:border-white/5"
      >
        {scape.thumbnail ? (
          <img
            src={scape.thumbnail}
            alt={scape.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-4xl">🎨</div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
          <h4 className="truncate text-sm font-medium text-white">{scape.name}</h4>
          <div className="mt-1 flex items-center gap-3 text-xs text-white/70">
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
  )
}
