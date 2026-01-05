import { useRef, useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { supabase } from "@/lib/supabase"

const DEFAULT_FEATURED_SCAPE = "9478cf68-d30a-4fa9-bc68-bbd715a829f4"

export function HeroSection() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { resolvedTheme } = useTheme()
  const [featuredScapeId, setFeaturedScapeId] = useState(DEFAULT_FEATURED_SCAPE)

  // Fetch featured scape from settings
  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "featured_scape_id")
        .single()

      if (data?.value) {
        const id = typeof data.value === "string" ? data.value.replace(/"/g, "") : data.value
        if (id) setFeaturedScapeId(id)
      }
    }
    fetchFeatured()
  }, [])

  // Sync theme to iframe
  const sendThemeToIframe = useCallback(() => {
    if (iframeRef.current?.contentWindow && resolvedTheme) {
      iframeRef.current.contentWindow.postMessage(
        { type: "THEME_CHANGE", theme: resolvedTheme },
        "*"
      )
    }
  }, [resolvedTheme])

  // Effect to send theme when it changes
  useEffect(() => {
    sendThemeToIframe()
    const timeout = setTimeout(sendThemeToIframe, 100)
    return () => clearTimeout(timeout)
  }, [resolvedTheme, sendThemeToIframe])

  // Send theme when iframe loads
  const handleIframeLoad = () => {
    setTimeout(sendThemeToIframe, 50)
  }

  return (
    <section className="relative flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center overflow-hidden px-4 py-20">
      {/* Background Gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/5" />
        <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/5" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
        {/* Text Content */}
        <motion.div
          className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Your Code is a{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              Masterpiece
            </span>
          </h1>

          <motion.p
            className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            Create, visualize, and share interactive code directly in your browser. From p5.js
            sketches to Python turtle graphics—bring your ideas to life.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
              asChild
            >
              <Link to="/dashboard">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/community">
                Explore Community
                <Play className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.p
            className="mt-4 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          >
            No signup required • 100% browser-based
          </motion.p>
        </motion.div>

        {/* Live Demo Preview - FULL WIDTH HERO */}
        <motion.div
          className="relative w-full lg:flex-[1.3]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border bg-card shadow-2xl">
            {/* Window Chrome */}
            <div className="flex h-8 items-center gap-2 border-b bg-muted/50 px-4">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs text-muted-foreground">preview</span>
            </div>
            {/* Preview Content */}
            <div className="relative h-[calc(100%-2rem)] w-full bg-zinc-950 dark:bg-zinc-950">
              <iframe
                ref={iframeRef}
                src={`/view/${featuredScapeId}`}
                className="h-full w-full border-0"
                title="Live Demo"
                loading="lazy"
                onLoad={handleIframeLoad}
              />
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-xl bg-gradient-to-br from-emerald-500/20 to-transparent blur-xl" />
        </motion.div>
      </div>
    </section>
  )
}
