import { useState, useEffect, useRef } from "react"
import type { ScapeFile } from "@/types/file"
import { debug } from "@/lib/debug"

export interface SafariPreviewState {
  blobUrl: string
  ready: boolean
  contentReady: boolean
  error: string | null
}

/**
 * Safari Preview Hook
 *
 * For Safari/iOS browsers, compiles code server-side using Supabase Edge Function
 * then serves via secure blob URL (no Service Worker needed).
 */
export function useSafariPreview(
  files: ScapeFile[],
  scapeId: string,
  versionKey?: number,
  onLog?: (level: string, args: unknown[]) => void
): SafariPreviewState {
  const [blobUrl, setBlobUrl] = useState("")
  const [ready, setReady] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onLogRef = useRef(onLog)
  const prevBlobUrlRef = useRef<string>("")

  useEffect(() => {
    onLogRef.current = onLog
  })

  // Listen for messages from the blob iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SANDBOX_LOG") {
        const { level, payload } = event.data
        onLogRef.current?.(level, payload)

        const prefix = `%c[SafariPreview]`
        const style = "background: #222; color: #8bf"
        if (level === "log") console.log(prefix, style, ...payload)
        if (level === "warn") console.warn(prefix, style, ...payload)
        if (level === "error") console.error(prefix, style, ...payload)
      }

      if (event.data?.type === "SANDBOX_CONTENT_READY") {
        setContentReady(true)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // Compile files when they change
  useEffect(() => {
    if (files.length === 0) return

    const compile = async () => {
      try {
        debug.log(
          "[SafariPreview] Compiling files...",
          files.map((f) => f.name)
        )
        setReady(false)
        setContentReady(false)
        setError(null)

        // Get Supabase credentials from env
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Supabase credentials not configured")
        }

        // Use local Edge Function if running on localhost
        const isLocalhost =
          window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        const edgeFunctionUrl = isLocalhost
          ? "http://localhost:54321/functions/v1/compile-preview"
          : `${supabaseUrl}/functions/v1/compile-preview`

        debug.log("[SafariPreview] Using Edge Function:", edgeFunctionUrl)

        // POST to Edge Function with auth
        const response = await fetch(edgeFunctionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            files: files.map((f) => ({
              name: f.name,
              content: typeof f.content === "string" ? f.content : "",
            })),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Compilation failed: ${response.status}`)
        }

        const { html, success } = await response.json()

        if (!success || !html) {
          throw new Error("Invalid response from compile service")
        }

        // Debug: Log first 500 chars of compiled HTML
        debug.log("[SafariPreview] Compiled HTML preview:", html.substring(0, 500))

        // Create Blob URL
        const blob = new Blob([html], { type: "text/html" })
        const url = URL.createObjectURL(blob)

        // Revoke previous URL to avoid memory leaks
        if (prevBlobUrlRef.current) {
          URL.revokeObjectURL(prevBlobUrlRef.current)
        }
        prevBlobUrlRef.current = url

        debug.log("[SafariPreview] Compilation complete, blob URL created")
        setBlobUrl(url)
        setReady(true)
      } catch (err) {
        console.error("[SafariPreview] Compilation error:", err)
        setError(String(err))
        setReady(false)
      }
    }

    compile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    scapeId,
    versionKey,
    files
      .map((f) => `${f.name}:${typeof f.content === "string" ? f.content.substring(0, 100) : ""}`)
      .join("|"),
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current)
      }
    }
  }, [])

  return {
    blobUrl,
    ready,
    contentReady,
    error,
  }
}

/**
 * Detect if we should use Safari preview fallback
 */
export function shouldUseSafariPreview(): boolean {
  if (typeof window === "undefined") return false

  const ua = navigator.userAgent

  // iOS detection (all iOS browsers use WebKit)
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)

  // Safari detection (macOS Safari, not Chrome/Firefox)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)

  debug.log("[SafariPreview] Browser detection:", { isIOS, isSafari, ua })

  return isIOS || isSafari
}
