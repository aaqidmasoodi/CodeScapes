import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type CardSize = "small" | "medium" | "large" | "tall" | "wide" | "full"

interface GridCardProps {
  size?: CardSize
  className?: string
  children: React.ReactNode
  animate?: boolean
  delay?: number
}

const sizeClasses: Record<CardSize, string> = {
  small: "col-span-6 lg:col-span-3",
  medium: "col-span-6 lg:col-span-4",
  large: "col-span-12 lg:col-span-6",
  tall: "col-span-6 lg:col-span-3 row-span-2",
  wide: "col-span-12 lg:col-span-8",
  full: "col-span-12",
}

const appleEase = [0.16, 1, 0.3, 1] as const

export function GridCard({
  size = "small",
  className,
  children,
  animate = true,
  delay = 0,
}: GridCardProps) {
  const content = (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.04]",
        "dark:bg-white/[0.01] dark:hover:bg-white/[0.03]",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  )

  if (!animate) return content

  return (
    <motion.div
      className={sizeClasses[size]}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: appleEase }}
    >
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.04]",
          "dark:bg-white/[0.01] dark:hover:bg-white/[0.03]",
          className
        )}
      >
        {children}
      </div>
    </motion.div>
  )
}
