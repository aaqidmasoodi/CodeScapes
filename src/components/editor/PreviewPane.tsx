import { useEffect, useState, useMemo, useRef, forwardRef, useImperativeHandle, memo } from "react"
import { MonitorPlay, Play, Loader2 } from "lucide-react"
import html2canvas from "html2canvas"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { ScapeFile } from "@/types/file"

export interface PreviewPaneHandle {
  captureThumbnail: () => Promise<string | null>
}

interface PreviewPaneProps {
  files: ScapeFile[]
  autoRefresh: boolean
  onAutoRefreshChange: (enabled: boolean) => void
  onRefresh: () => void
  isRefreshing?: boolean
}

export const PreviewPane = memo(
  forwardRef<PreviewPaneHandle, PreviewPaneProps>(
    ({ files, autoRefresh, onAutoRefreshChange, onRefresh, isRefreshing }, ref) => {
      const iframeRef = useRef<HTMLIFrameElement>(null)

      useImperativeHandle(ref, () => ({
        captureThumbnail: async () => {
          const iframe = iframeRef.current
          if (!iframe || !iframe.contentDocument || !iframe.contentDocument.body) return null

          try {
            // OPTIMIZATION: If the scape has a <canvas> (WebGL/Three.js/p5.js),
            // capture it directly! It's faster and avoids CSS parsing issues.
            const canvasEl = iframe.contentDocument.querySelector("canvas")
            if (canvasEl) {
              return canvasEl.toDataURL("image/jpeg", 0.7)
            }

            // Fallback: Use html2canvas for HTML/CSS scapes
            const canvas = await html2canvas(iframe.contentDocument.body, {
              useCORS: true,
              logging: false,
              ignoreElements: (element) =>
                element.tagName === "SCRIPT" || element.tagName === "LINK", // Avoid parsing external resources if possible
            })
            return canvas.toDataURL("image/jpeg", 0.7)
          } catch {
            // Silently fail to avoid console spam during live editing
            // console.warn("Thumbnail capture failed", error)
            return null
          }
        },
      }))

      // Navigation State
      const [activePreviewPath, setActivePreviewPath] = useState("index.html")

      // Listen for navigation requests from the iframe
      useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
          if (e.data?.type === "NAVIGATE") {
            const path = e.data.path
            // Simple resolution: remove leading ./ or /
            // e.g. "./about.html" -> "about.html"
            const cleanPath = path.replace(/^[./]+/, "")

            // Check if file exists
            if (files.some((f) => f.name === cleanPath)) {
              setActivePreviewPath(cleanPath)
            } else {
              console.warn(`Preview navigation failed: File '${cleanPath}' not found.`)
            }
          }
        }
        window.addEventListener("message", handleMessage)
        return () => window.removeEventListener("message", handleMessage)
      }, [files])

      // Reset to index.html if current file is deleted, but generally persist state
      useEffect(() => {
        if (files.length > 0 && !files.some((f) => f.name === activePreviewPath)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setActivePreviewPath("index.html")
        }
      }, [files, activePreviewPath])

      // 1. Create Blob URLs for all files
      // We strip './' from imports in JS files to force them to be "bare modules"
      // This bypasses the "Invalid relative url" error in Blob/SrcDoc environments
      const blobUrls = useMemo(() => {
        const newUrls: Record<string, string> = {}

        files.forEach((file) => {
          let content = file.content
          let type = "text/javascript"

          if (file.name.endsWith(".js")) {
            // Rewrite relative imports to bare imports
            // e.g. import { x } from './scene.js' -> import { x } from 'scene.js'
            content = content.replace(/from\s+['"]\.\/([^'"]+)['"]/g, "from '$1'")
            // Also handle import './style.css' ?
            // Usually side-effect imports: import './interaction.js'
            content = content.replace(/import\s+['"]\.\/([^'"]+)['"]/g, "import '$1'")
          }

          if (file.name.endsWith(".css")) type = "text/css"
          if (file.name.endsWith(".html")) type = "text/html"

          const blob = new Blob([content], { type })
          newUrls[file.name] = URL.createObjectURL(blob)
        })

        return newUrls
      }, [files])

      // Cleanup Blob URLs when they change or component unmounts
      useEffect(() => {
        return () => {
          Object.values(blobUrls).forEach((url) => URL.revokeObjectURL(url))
        }
      }, [blobUrls])

      // 2. Construct the HTML (using srcDoc for simplicity/stability)
      const srcDoc = useMemo(() => {
        const htmlFile = files.find((f) => f.name === activePreviewPath)
        if (!htmlFile) {
          return `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#666;">File '${activePreviewPath}' not found</div>`
        }

        // Build Import Map
        const imports: Record<string, string> = {
          three: "https://esm.sh/three@0.160.0",
          "three/": "https://esm.sh/three@0.160.0/",
        }

        // Map bare filenames to Blob URLs
        Object.entries(blobUrls).forEach(([name, url]) => {
          if (name.endsWith(".js")) {
            imports[name] = url
          }
        })

        const importMap = { imports }

        let processedHtml = htmlFile.content

        // Inject Import Map, WebGL Shim, and Navigation Interceptor
        const importMapScript = `
      <script>
        // Force preserveDrawingBuffer for WebGL to enable screenshots
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, options) {
          if (type === 'webgl' || type === 'webgl2') {
            options = options || {};
            options.preserveDrawingBuffer = true;
          }
          return originalGetContext.call(this, type, options);
        };

        // Error Handling
        window.onerror = function(message, source, lineno, colno, error) { 
          window.parent.postMessage({
            type: 'RUNTIME_ERROR',
            payload: { message: message, line: lineno, column: colno }
          }, '*');
        };

        // Navigation Interceptor
        document.addEventListener('click', (e) => {
          const link = e.target.closest('a');
          if (!link) return;
          const href = link.getAttribute('href');
          
          // Ignore hashes (let browser handle scrolling)
          if (!href || href.startsWith('#')) return;
          
          // Force external links to new tab
          if (href.startsWith('http') || href.startsWith('//')) {
            link.target = '_blank';
            return;
          }
          
          // Intercept relative navigation
          e.preventDefault();
          window.parent.postMessage({ type: 'NAVIGATE', path: href }, '*');
        });
      </script>
      <script type="importmap">
        ${JSON.stringify(importMap, null, 2)}
      </script>
    `

        if (processedHtml.includes("<head>")) {
          processedHtml = processedHtml.replace("<head>", "<head>" + importMapScript)
        } else {
          processedHtml = importMapScript + processedHtml
        }

        // Inject CSS Link Replacements
        processedHtml = processedHtml.replace(
          /<link[^>]*href=["']([^"']+)["'][^>]*>/gi,
          (match, href) => {
            const cleanName = href.replace(/^\.\//, "")
            if (blobUrls[cleanName] && cleanName.endsWith(".css")) {
              return `<link rel="stylesheet" href="${blobUrls[cleanName]}">`
            }
            return match
          }
        )

        // Inject JS Script Replacements
        processedHtml = processedHtml.replace(
          /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
          (match, src) => {
            const cleanName = src.replace(/^\.\//, "")
            if (blobUrls[cleanName] && cleanName.endsWith(".js")) {
              // Replace with bare import if we want, OR just direct Blob URL source associated with the file
              // Since it's a top-level script tag, we can use the Blob URL directly
              return match.replace(src, blobUrls[cleanName])
            }
            return match
          }
        )

        return processedHtml
      }, [files, blobUrls, activePreviewPath])

      return (
        <div className="flex h-full flex-col border-l bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex h-10 items-center justify-between border-b border-zinc-200 bg-muted/20 px-2 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MonitorPlay className="h-3.5 w-3.5" />
              <span className="max-w-[200px] truncate">Preview</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium uppercase text-muted-foreground">
                  Auto
                </span>
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={onAutoRefreshChange}
                  className="scale-75 data-[state=checked]:bg-green-500"
                />
              </div>
              <div className="h-4 w-px bg-border/50" />

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-green-500/10 hover:text-green-500"
                onClick={onRefresh}
                title="Run (Update Preview)"
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-white">
            <iframe
              ref={iframeRef}
              title="preview"
              srcDoc={srcDoc}
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-modals allow-popups"
            />
          </div>
        </div>
      )
    }
  )
)
PreviewPane.displayName = "PreviewPane"
