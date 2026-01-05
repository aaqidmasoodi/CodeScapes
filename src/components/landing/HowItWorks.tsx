import { motion } from "framer-motion"
import { Plus, Code, Globe } from "lucide-react"

const steps = [
  {
    icon: Plus,
    title: "Create",
    description: "Start with Web, Python, or Flow.",
  },
  {
    icon: Code,
    title: "Code",
    description: "Powerful Monaco editor.",
  },
  {
    icon: Globe,
    title: "Share",
    description: "Publish with one click.",
  },
]

const appleEase = [0.16, 1, 0.3, 1] as const

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="relative z-10 mx-auto max-w-4xl px-6">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: appleEase }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mt-2 text-muted-foreground">From idea to live project in minutes.</p>
        </motion.div>

        {/* Steps - Compact */}
        <div className="relative flex flex-col items-center justify-between gap-8 md:flex-row md:gap-0">
          {/* Connecting Line - Dotted & Subtle */}
          <div className="absolute left-1/2 top-10 hidden h-px w-2/3 -translate-x-1/2 border-t border-dashed border-border md:block" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="relative flex flex-1 flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: appleEase }}
            >
              {/* Step Circle - Smaller */}
              <div className="relative mb-4 bg-background px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-500 shadow-sm">
                  <step.icon className="h-5 w-5" />
                </div>
              </div>

              {/* Content */}
              <h3 className="mb-1 text-base font-semibold">{step.title}</h3>
              <p className="max-w-[150px] text-xs text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
