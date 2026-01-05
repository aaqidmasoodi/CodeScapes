import { motion } from "framer-motion"
import { Code2, Globe, Palette, Blocks, Moon, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Palette,
    title: "Creative Coding",
    description:
      "p5.js, Three.js, vanilla JS—bring your artistic visions to life with powerful graphics libraries.",
    className: "md:col-span-1",
  },
  {
    icon: Code2,
    title: "Python in Browser",
    description:
      "Run Python directly in your browser with Pyodide. Turtle graphics, data viz, and more.",
    className: "md:col-span-1",
  },
  {
    icon: Globe,
    title: "Instant Sharing",
    description: "One-click publish to the community. Share your creations with a simple link.",
    className: "md:col-span-1",
  },
  {
    icon: Blocks,
    title: "Visual Flow Editor",
    description: "Build with blocks. Our visual editor makes programming accessible to everyone.",
    className: "md:col-span-1",
  },
  {
    icon: Moon,
    title: "Dark Mode Native",
    description:
      "Designed for late-night coding sessions. Easy on your eyes, beautiful by default.",
    className: "md:col-span-1",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "No downloads, no installs. Start coding in seconds with our browser-based IDE.",
    className: "md:col-span-1",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

export function FeaturesGrid() {
  return (
    <section className="relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Create
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete creative coding environment, right in your browser.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5",
                feature.className
              )}
            >
              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500/20">
                <feature.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>

              {/* Hover Gradient */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
