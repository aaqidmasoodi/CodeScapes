import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

const appleEase = [0.16, 1, 0.3, 1] as const

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-white/[0.01] py-20 dark:bg-black/20">
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.h2
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: appleEase }}
        >
          Ready to Create?
        </motion.h2>

        <motion.p
          className="mx-auto mt-4 max-w-md text-muted-foreground"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: appleEase }}
        >
          Join thousands of creators building interactive masterpieces.
        </motion.p>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: appleEase }}
        >
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
        </motion.div>

        <p className="mt-4 text-xs text-muted-foreground opacity-70">No credit card required</p>
      </div>
    </section>
  )
}
