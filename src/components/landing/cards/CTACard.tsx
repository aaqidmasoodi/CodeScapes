import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

const appleEase = [0.16, 1, 0.3, 1] as const

export function CTACard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: appleEase }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 py-16 text-center shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none lg:py-24">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[100px]" />
          <div className="absolute right-1/4 top-1/2 h-[300px] w-[300px] -translate-y-1/2 translate-x-1/2 rounded-full bg-emerald-500/5 blur-[80px]" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight lg:text-4xl">
          Ready to{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            Create?
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-md px-4 text-sm text-muted-foreground lg:text-base">
          Join thousands of creators building interactive masterpieces.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            className="bg-emerald-500 px-8 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
            asChild
          >
            <Link to="/dashboard">
              Start Coding Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-black/10 bg-white/50 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            asChild
          >
            <Link to="/community">Explore Gallery</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
