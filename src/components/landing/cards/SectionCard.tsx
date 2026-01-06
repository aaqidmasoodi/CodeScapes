import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const appleEase = [0.16, 1, 0.3, 1] as const

interface SectionCardProps {
  title: string
  highlightWord?: string
  subtitle?: string
  delay?: number
  showCTA?: boolean
  ctaLink?: string
  ctaText?: string
  viewAllLink?: string
  className?: string
}

export function SectionCard({
  title,
  highlightWord,
  subtitle,
  delay = 0,
  showCTA = false,
  ctaLink = "/dashboard",
  ctaText = "Get Started",
  viewAllLink,
  className,
}: SectionCardProps) {
  const words = title.split(" ")

  return (
    <motion.div
      className={cn("col-span-6 lg:col-span-3", className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: appleEase }}
    >
      <div className="flex h-full flex-col justify-center rounded-2xl border border-black/10 bg-gradient-to-br from-emerald-500/10 via-white/80 to-white/60 p-8 shadow-sm dark:border-white/5 dark:from-emerald-500/10 dark:via-zinc-900/80 dark:to-zinc-900/60 lg:p-10">
        <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
          {words.map((word, i) => (
            <span key={i}>
              {word === highlightWord ? (
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  {word}
                </span>
              ) : (
                word
              )}
              {i < words.length - 1 && " "}
            </span>
          ))}
        </h2>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        {showCTA && (
          <Button
            size="sm"
            className="mt-4 w-fit bg-emerald-500 text-white hover:bg-emerald-600"
            asChild
          >
            <Link to={ctaLink}>
              {ctaText}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="mt-4 inline-flex items-center gap-1 text-sm text-emerald-500 hover:text-emerald-600"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </motion.div>
  )
}
