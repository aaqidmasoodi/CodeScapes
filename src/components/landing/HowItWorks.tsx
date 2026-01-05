import { motion } from "framer-motion"
import { Plus, Code, Globe } from "lucide-react"

const steps = [
  {
    icon: Plus,
    title: "Create",
    description: "Start a new project with one click. Choose Web, Python, or Flow.",
  },
  {
    icon: Code,
    title: "Code",
    description: "Write in our powerful Monaco editor with syntax highlighting and autocomplete.",
  },
  {
    icon: Globe,
    title: "Share",
    description: "Publish to the community and share your creation with a simple link.",
  },
]

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-muted/30 py-24">
      <div className="mx-auto max-w-5xl px-4">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How It{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From idea to live project in minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative flex flex-col items-center gap-8 md:flex-row md:justify-between md:gap-4">
          {/* Connecting Line (Desktop) */}
          <div className="absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent md:block" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="relative z-10 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              {/* Step Number */}
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-background">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                  <step.icon className="h-8 w-8" />
                </div>
              </div>

              {/* Step Number Badge */}
              <span className="mb-2 text-sm font-medium text-emerald-500">Step {index + 1}</span>

              {/* Content */}
              <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
              <p className="max-w-xs text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
