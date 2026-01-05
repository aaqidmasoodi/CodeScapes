import { useRef, useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { supabase } from "@/lib/supabase"

const DEFAULT_FEATURED_SCAPE = "9478cf68-d30a-4fa9-bc68-bbd715a829f4"

// Apple-style easing
const appleEase = [0.16, 1, 0.3, 1] as const

export function HeroSection() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const { resolvedTheme } = useTheme()
  const [featuredScapeId, setFeaturedScapeId] = useState(DEFAULT_FEATURED_SCAPE)

  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const previewY = useTransform(scrollYProgress, [0, 1], [0, 50])

  // Fetch featured scape
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

  // Theme sync
  const sendThemeToIframe = useCallback(() => {
    if (iframeRef.current?.contentWindow && resolvedTheme) {
      iframeRef.current.contentWindow.postMessage(
        { type: "THEME_CHANGE", theme: resolvedTheme },
        "*"
      )
    }
  }, [resolvedTheme])

  useEffect(() => {
    sendThemeToIframe()
    const timeout = setTimeout(sendThemeToIframe, 100)
    return () => clearTimeout(timeout)
  }, [resolvedTheme, sendThemeToIframe])

  const handleIframeLoad = () => setTimeout(sendThemeToIframe, 50)

  return (
    <>
      <section
        ref={sectionRef}
        className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 pb-8 pt-20"
      >
        {/* Animated Background Orbs */}
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ y: backgroundY }}
        >
          <div className="absolute -left-[10%] top-[10%] h-[500px] w-[500px] rounded-full bg-emerald-500/15 blur-[100px] dark:bg-emerald-500/10" />
          <div className="absolute -right-[10%] bottom-[10%] h-[500px] w-[500px] rounded-full bg-emerald-400/10 blur-[100px] dark:bg-emerald-400/5" />
        </motion.div>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 lg:flex-row lg:items-center lg:gap-16">
          {/* Text Content - Centered & Marketing-Focused */}
          <motion.div
            className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: appleEase }}
          >
            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: appleEase }}
            >
              Code. Create.{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                Share.
              </span>
            </motion.h1>

            <motion.p
              className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: appleEase }}
            >
              The browser-based creative coding playground. Build interactive visualizations with
              p5.js, Python, and more—no installation needed.
            </motion.p>

            <motion.div
              className="mt-6 flex flex-col gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: appleEase }}
            >
              <Button size="lg" className="bg-emerald-500 text-white hover:bg-emerald-600" asChild>
                <Link to="/dashboard">
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10"
                asChild
              >
                <Link to="/community">
                  Explore Gallery
                  <Play className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.p
              className="mt-4 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: appleEase }}
            >
              Free forever • No signup required
            </motion.p>
          </motion.div>

          {/* Live Demo Preview */}
          <motion.div
            className="relative w-full max-w-[520px] lg:flex-[1.1]"
            style={{ y: previewY }}
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: appleEase }}
          >
            {/* Subtle Glow */}
            <div className="absolute -inset-1 -z-10 rounded-xl bg-gradient-to-b from-emerald-500/20 to-transparent opacity-50 blur-xl" />

            {/* Preview Container - 16:10 */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900/90 shadow-2xl backdrop-blur-sm">
              {/* Window Chrome */}
              <div className="flex h-8 items-center gap-1.5 border-b border-white/5 bg-white/5 px-3">
                <div className="h-2 w-2 rounded-full bg-[#FF5F56]" />
                <div className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
                <div className="h-2 w-2 rounded-full bg-[#27C93F]" />
              </div>

              {/* Preview Content */}
              <div className="relative h-[calc(100%-2rem)] w-full bg-black">
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
          </motion.div>
        </div>
      </section>

      {/* Scroll Indicator - Between Sections */}
      <div className="relative z-10 flex justify-center py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="h-10 w-5 rounded-full border border-muted-foreground/20 p-1">
            <motion.div
              className="h-1.5 w-full rounded-full bg-muted-foreground/40"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </>
  )
}
