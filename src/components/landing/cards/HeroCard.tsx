import { useRef, useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "@/components/theme-provider"
import { supabase } from "@/lib/supabase"

const DEFAULT_FEATURED_SCAPE = "9478cf68-d30a-4fa9-bc68-bbd715a829f4"
const appleEase = [0.16, 1, 0.3, 1] as const

export function HeroCard() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { resolvedTheme } = useTheme()
  const [featuredScapeId, setFeaturedScapeId] = useState(DEFAULT_FEATURED_SCAPE)

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
    <motion.div
      className="col-span-6 row-span-2 lg:col-span-4 lg:row-span-3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: appleEase }}
    >
      <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/90 shadow-2xl">
        {/* Glow */}
        <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-b from-emerald-500/20 to-transparent opacity-50 blur-xl" />

        {/* Window Chrome */}
        <div className="flex h-10 items-center gap-1.5 border-b border-white/5 bg-white/5 px-4">
          <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
          <span className="ml-3 text-xs text-white/40">Live Preview</span>
        </div>

        {/* Preview Content */}
        <div className="relative h-[calc(100%-2.5rem)] w-full bg-black">
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
  )
}
