import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const appleEase = [0.16, 1, 0.3, 1] as const

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  delay?: number
  className?: string
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
  className,
}: FeatureCardProps) {
  return (
    <motion.div
      className={cn("col-span-3 lg:col-span-2", className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay, ease: appleEase }}
    >
      <div className="group relative h-full overflow-hidden rounded-2xl border border-white/20 bg-white/60 p-5 shadow-lg shadow-black/5 backdrop-blur-xl transition-all hover:border-emerald-500/30 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none dark:hover:bg-white/[0.06]">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="mb-1.5 text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}
