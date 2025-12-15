import { useEffect, useState, useMemo, useRef, forwardRef, useImperativeHandle, memo } from "react"
import { MonitorPlay, Play, Loader2, PanelRightClose, Terminal } from "lucide-react"
import html2canvas from "html2canvas"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { ScapeFile } from "@/types/file"
import { ENVIRONMENTS } from "@/config/environments"
import type { EnvironmentId } from "@/types/environment"

export interface PreviewPaneHandle {
  captureThumbnail: () => Promise<string | null>
}

interface PreviewPaneProps {
  files: ScapeFile[]
  autoRefresh: boolean
  onAutoRefreshChange: (enabled: boolean) => void
  onRefresh: () => void
  isRefreshing?: boolean
  onCollapse?: () => void
  environment?: EnvironmentId
}

// --- WEB RUNNER (Original Logic) ---
const WebRunner = memo(
  forwardRef<PreviewPaneHandle, PreviewPaneProps>(
    ({ files, autoRefresh, onAutoRefreshChange, onRefresh, isRefreshing, onCollapse }, ref) => {
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
      const blobUrls = useMemo(() => {
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

        return newUrls
      }, [files])

      // Cleanup Blob URLs
      useEffect(() => {
        return () => {
          Object.values(blobUrls).forEach((url) => URL.revokeObjectURL(url))
        }
      }, [blobUrls])

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

              {onCollapse && (
                <>
                  <div className="h-4 w-px bg-border/50" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    onClick={onCollapse}
                    title="Collapse Preview"
                  >
                    <PanelRightClose className="h-4 w-4" />
                  </Button>
                </>
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
    }
  )
)
WebRunner.displayName = "WebRunner"

// --- PYTHON RUNNER PLACEHOLDER ---
const PythonRunnerPlaceholder = memo(
  forwardRef<PreviewPaneHandle, PreviewPaneProps>(({ onCollapse }, ref) => {
    useImperativeHandle(ref, () => ({
      captureThumbnail: async () => null,
    }))

    return (
      <div className="flex h-full flex-col border-l bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-10 items-center justify-between border-b border-zinc-200 bg-muted/20 px-2 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Terminal className="h-3.5 w-3.5" />
            <span>Python Runtime</span>
          </div>
          {onCollapse && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onCollapse}>
              <PanelRightClose className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
          <Terminal className="mb-4 h-12 w-12 opacity-20" />
          <h3 className="text-lg font-medium text-foreground">Python Environment</h3>
          <p className="mt-2 max-w-xs text-center text-sm">
            Python runner is under construction. Output will appear in the Terminal pane or here if
            using Turtle/PyGame.
          </p>
        </div>
      </div>
    )
  })
)
PythonRunnerPlaceholder.displayName = "PythonRunnerPlaceholder"

// --- SWITCHBOARD ---
export const PreviewPane = memo(
  forwardRef<PreviewPaneHandle, PreviewPaneProps>((props, ref) => {
    const { environment = "web" } = props
    const runnerRef = useRef<PreviewPaneHandle>(null)

    useImperativeHandle(ref, () => ({
      captureThumbnail: async () => {
        if (runnerRef.current) {
          return await runnerRef.current.captureThumbnail()
        }
        return null
      },
    }))

    const config = ENVIRONMENTS[environment]
    // Default to WebRunner if unknown or web
    const RunnerComponent = config?.runner === "python-runner" ? PythonRunnerPlaceholder : WebRunner

    return <RunnerComponent {...props} ref={runnerRef} />
  })
)
PreviewPane.displayName = "PreviewPane"
