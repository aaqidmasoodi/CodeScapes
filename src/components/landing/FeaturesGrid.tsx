import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Code2, Globe, Palette, Blocks, Moon, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Palette,
    title: "Creative Coding",
    description: "p5.js, Three.js, vanilla JS—your artistic visions.",
  },
  {
    icon: Code2,
    title: "Python in Browser",
    description: "Run Python via Pyodide. Turtle graphics & data viz.",
  },
  {
    icon: Globe,
    title: "Instant Sharing",
    description: "One-click publish. Share with a simple link.",
  },
  {
    icon: Blocks,
    title: "Visual Editor",
    description: "Build with blocks. Accessible to everyone.",
  },
  {
    icon: Moon,
    title: "Dark Mode Native",
    description: "Designed for late-night coding sessions.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "No installs. Start coding in seconds.",
  },
]

const appleEase = [0.16, 1, 0.3, 1] as const

export function FeaturesGrid() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Subtle parallax for background
  const backgroundY = useTransform(scrollYProgress, [0, 1], [50, -50])

  return (
    <section ref={sectionRef} className="relative -mt-10 overflow-hidden pb-24 pt-20">
      {/* Background Subtle Noise/Texture */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{ y: backgroundY }}
      >
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Section Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: appleEase }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to <span className="text-emerald-500">Create</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            A complete creative coding environment, refined for the modern web.
          </p>
        </motion.div>

        {/* Features Grid - Compact & Styled */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: appleEase }}
              className="group"
            >
              <div
                className={cn(
                  "relative h-full overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300",
                  "hover:border-emerald-500/20 hover:bg-white/[0.04]",
                  "dark:bg-white/[0.01] dark:hover:bg-white/[0.03]"
                )}
              >
                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
