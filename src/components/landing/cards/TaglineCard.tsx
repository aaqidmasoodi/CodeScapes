import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

const appleEase = [0.16, 1, 0.3, 1] as const

export function TaglineCard() {
  return (
    <motion.div
      className="col-span-6 lg:col-span-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: appleEase }}
    >
      <div className="flex h-full flex-col justify-center rounded-2xl border border-white/20 bg-white/60 p-6 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none lg:p-8">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          Code.
          <br />
          Create.
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            Share.
          </span>
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          The browser-based creative coding playground. No installation needed.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600" asChild>
            <Link to="/dashboard">
              Start Creating
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
            asChild
          >
            <Link to="/community">
              Explore
              <Play className="ml-1.5 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
