import { motion } from "framer-motion"

const appleEase = [0.16, 1, 0.3, 1] as const

interface SectionHeaderProps {
  title: string
  subtitle?: string
  delay?: number
}

export function SectionHeader({ title, subtitle, delay = 0 }: SectionHeaderProps) {
  return (
    <motion.div
      className="col-span-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: appleEase }}
    >
      <div className="rounded-2xl border border-black/10 bg-gradient-to-r from-emerald-500/5 to-transparent p-8 shadow-sm dark:border-white/5 dark:from-emerald-500/10 lg:p-10">
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          {title.split(" ").map((word, i) => (
            <span key={i}>
              {i === title.split(" ").length - 1 ? (
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  {word}
                </span>
              ) : (
                word + " "
              )}
            </span>
          ))}
        </h2>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </motion.div>
  )
}
