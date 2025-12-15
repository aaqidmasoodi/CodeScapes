import { useEffect, useState, useMemo, useRef, forwardRef, useImperativeHandle, memo } from "react"
import { MonitorPlay, PanelRightClose } from "lucide-react"
import html2canvas from "html2canvas"

import { Button } from "@/components/ui/button"
import type { ScapeFile } from "@/types/file"
import type { ScapeRunnerHandle } from "@/runners/types"

interface WebRunnerProps {
  files: ScapeFile[]
  onCollapse?: () => void
  onBusyChange?: (isBusy: boolean) => void
}

// WebRunner doesn't need to report busy state currently, but we accept the prop
// to match the interface.
export const WebRunner = memo(
  forwardRef<ScapeRunnerHandle, WebRunnerProps>(({ files, onCollapse }, ref) => {
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
            ignoreElements: (element) => element.tagName === "SCRIPT" || element.tagName === "LINK", // Avoid parsing external resources if possible
          })
          return canvas.toDataURL("image/jpeg", 0.7)
        } catch {
          return null
        }
      },
      restart: async () => {
        if (iframeRef.current) {
          // Force reload by resetting srcdoc
          // (Changing key might be cleaner, but simple re-assignment often works if content changed)
          // Actually, we rely on the srcDoc dependency array in the hook below.
          // But if we want to force a "reload" animation or state reset:
          const currentSrcDoc = iframeRef.current.srcdoc
          iframeRef.current.srcdoc = ""
          setTimeout(() => {
            if (iframeRef.current) iframeRef.current.srcdoc = currentSrcDoc
          }, 10)
        }
      },
      installPackage: async () => ({ success: false, error: "Not supported in Web environment" }),
    }))

    // Navigation State
    const [activePreviewPath, setActivePreviewPath] = useState("index.html")

    // Listen for navigation requests from the iframe
    useEffect(() => {
      const handleMessage = (e: MessageEvent) => {
        if (e.data?.type === "NAVIGATE") {
          const path = e.data.path
          // Simple resolution: remove leading ./ or /
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
    const [blobUrls, setBlobUrls] = useState<Record<string, string>>({})

    useEffect(() => {
      const newUrls: Record<string, string> = {}

      files.forEach((file) => {
        let content = file.content
        let type = "text/javascript"

        if (file.name.endsWith(".js")) {
          // Rewrite relative imports to bare imports
          content = content.replace(/from\s+['"]\.\/([^'"]+)['"]/g, "from '$1'")
          content = content.replace(/import\s+['"]\.\/([^'"]+)['"]/g, "import '$1'")
        }

        if (file.name.endsWith(".css")) type = "text/css"
        if (file.name.endsWith(".html")) type = "text/html"

        const blob = new Blob([content], { type })
        newUrls[file.name] = URL.createObjectURL(blob)
      })

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBlobUrls(newUrls)

      // Cleanup with delay to prevent 404s on rapid reloads
      return () => {
        const urlsToRevoke = Object.values(newUrls)
        setTimeout(() => {
          urlsToRevoke.forEach((url) => URL.revokeObjectURL(url))
        }, 5000)
      }
    }, [files])

    // 2. Construct the HTML
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
          e.preventDefault();
          const href = link.getAttribute('href');
          if (!href || href === '#' || href === '') return;
          if (href.startsWith('#')) {
             const target = document.querySelector(href);
             if (target) target.scrollIntoView();
             return;
          }
          if (href.startsWith('http') || href.startsWith('//')) {
            window.open(href, '_blank');
            return;
          }
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
            <span className="max-w-[200px] truncate">Preview (Web)</span>
          </div>

          <div className="flex items-center gap-3">
            {onCollapse && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={onCollapse}
                title="Collapse Preview"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            )}
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
  })
)

WebRunner.displayName = "WebRunner"
