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

    const [activePreviewPath, setActivePreviewPath] = useState("index.html")
    const [refreshKey, setRefreshKey] = useState(0)
    const [assetsReady, setAssetsReady] = useState(false)

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

    // 1. Create Data URLs for all files (Support Credentialless Iframe)
    const [assetUrls, setAssetUrls] = useState<Record<string, string>>({})

    useEffect(() => {
      let isMounted = true
      // eslint-disable-next-line
      setAssetsReady(false)

      const generateUrls = async () => {
        const rawAssets: Record<string, string> = {}
        const processedAssets: Record<string, string> = {}

        // 1. Process Leaf Assets (Images, Fonts, WASM, JSON, etc.)
        // These have no dependencies.
        const leafFiles = files.filter(
          (f) => !f.name.endsWith(".css") && !f.name.endsWith(".js") && !f.name.endsWith(".html")
        )
        const leafPromises = leafFiles.map(async (file) => {
          let type = "application/octet-stream"
          if (file.name.endsWith(".png")) type = "image/png"
          else if (file.name.endsWith(".jpg") || file.name.endsWith(".jpeg")) type = "image/jpeg"
          else if (file.name.endsWith(".svg")) type = "image/svg+xml"
          else if (file.name.endsWith(".gif")) type = "image/gif"
          else if (file.name.endsWith(".webp")) type = "image/webp"
          else if (file.name.endsWith(".wasm")) type = "application/wasm"
          else if (file.name.endsWith(".json")) type = "application/json"

          let blob: Blob
          if (typeof file.content === "string") {
            blob = new Blob([file.content], { type })
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            blob = new Blob([file.content as any], { type })
          }

          return new Promise<void>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              if (reader.result && typeof reader.result === "string") {
                rawAssets[file.name] = reader.result
              }
              resolve()
            }
            reader.readAsDataURL(blob)
          })
        })
        await Promise.all(leafPromises)

        // 2. Process CSS (Inject Leaf Assets)
        const cssFiles = files.filter((f) => f.name.endsWith(".css"))
        cssFiles.forEach((file) => {
          let content = file.content as string
          // Replace url('./asset.png') or url("asset.png") with Data URI
          content = content.replace(
            /url\(\s*['"]?(\.\/)?([^'")]+)['"]?\s*\)/gi,
            (match, _dotSlash, name) => {
              const cleanName = name // The regex group 2 captures the name
              if (rawAssets[cleanName]) return `url('${rawAssets[cleanName]}')`
              return match
            }
          )
          // Convert to Base64
          const encoded = btoa(unescape(encodeURIComponent(content)))
          processedAssets[file.name] = `data:text/css;base64,${encoded}`
        })

        // 3. Process JS (Imports)
        const jsFiles = files.filter((f) => f.name.endsWith(".js"))
        jsFiles.forEach((file) => {
          let content = file.content as string
          // Try to handle imports?
          // Ideally we replace imports with Data URIs too, but circular deps are hard.
          // For now, simpler: just bare imports or blob imports if we had them.
          // Since we use importmap, we don't need to replace imports in content generally,
          // EXCEPT relative paths if we want them to work without importmap magic.
          // But map handles "file.js".
          // We do need to handle other assets in JS? No, usually handled by runtime fetch, which we can't easily patch inside strict syntax.

          // Just rewrite relative imports for Module system
          content = content.replace(/from\s+['"]\.\/([^'"]+)['"]/g, "from '$1'")
          content = content.replace(/import\s+['"]\.\/([^'"]+)['"]/g, "import '$1'")

          const encoded = btoa(unescape(encodeURIComponent(content)))
          processedAssets[file.name] = `data:text/javascript;base64,${encoded}`
        })

        if (isMounted) {
          setAssetUrls({ ...rawAssets, ...processedAssets })
          setAssetsReady(true)
        }
      }

      generateUrls()
      return () => {
        isMounted = false
      }
    }, [files])

    // 2. Construct the HTML
    const srcDoc = useMemo(() => {
      // Don't build srcDoc until assets are ready to avoid 404s/flashes
      if (
        !assetsReady &&
        files.some((f) => f.name.match(/\.(png|jpg|jpeg|gif|wasm|json|css|js)$/))
      ) {
        return ""
      }

      const htmlFile = files.find((f) => f.name === activePreviewPath)
      if (!htmlFile) {
        return `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#666;">File '${activePreviewPath}' not found</div>`
      }

      if (typeof htmlFile.content !== "string") {
        return `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#666;">Cannot render binary file '${activePreviewPath}' as HTML</div>`
      }

      // Build Import Map
      const imports: Record<string, string> = {
        three: "https://esm.sh/three@0.160.0",
        "three/": "https://esm.sh/three@0.160.0/",
      }

      // Map bare filenames to Data URLs
      Object.entries(assetUrls).forEach(([name, url]) => {
        if (name.endsWith(".js")) {
          imports[name] = url
        }
      })

      const importMap = { imports }

      let processedHtml = htmlFile.content as string

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

      // Generic Replacer for src, href, and url()
      const replaceUrl = (name: string) => {
        // Strictly ignore external URLs and data URIs
        if (
          name.startsWith("http://") ||
          name.startsWith("https://") ||
          name.startsWith("//") ||
          name.startsWith("data:") ||
          name.startsWith("blob:")
        ) {
          return name
        }

        const cleanName = name.replace(/^\.\//, "")
        if (assetUrls[cleanName]) return assetUrls[cleanName]
        return name // No match, return original
      }

      // Inject CSS Link Replacements (href)
      processedHtml = processedHtml.replace(
        /<link[^>]*href=["']([^"']+)["'][^>]*>/gi,
        (match, href) => {
          const newUrl = replaceUrl(href)
          return match.replace(href, newUrl)
        }
      )

      // Inject JS Script Replacements (src)
      processedHtml = processedHtml.replace(
        /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
        (match, src) => {
          const newUrl = replaceUrl(src)
          return match.replace(src, newUrl)
        }
      )

      // Inject Image Replacements (src)
      processedHtml = processedHtml.replace(
        /<img[^>]*src=["']([^"']+)["'][^>]*>/gi,
        (match, src) => {
          // If external, add crossorigin="anonymous"
          if (src.startsWith("http") || src.startsWith("//")) {
            if (!match.includes("crossorigin")) {
              return match.replace("<img", '<img crossorigin="anonymous"')
            }
            return match
          }
          const newUrl = replaceUrl(src)
          return match.replace(src, newUrl)
        }
      )

      // Catch-all for other src elements (audio, video, source, iframe)
      processedHtml = processedHtml.replace(
        /<(audio|video|source|iframe|embed|object)[^>]*src=["']([^"']+)["'][^>]*>/gi,
        (match, _tag, src) => {
          const newUrl = replaceUrl(src)
          return match.replace(src, newUrl)
        }
      )

      // CSS url() replacements in the HTML (style tags) - Simple regex
      processedHtml = processedHtml.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi, (_match, url) => {
        const newUrl = replaceUrl(url)
        return `url('${newUrl}')`
      })

      return processedHtml
    }, [files, assetUrls, activePreviewPath, assetsReady])

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
        // Force full re-mount of iframe
        setRefreshKey((prev) => prev + 1)
      },
      installPackage: async () => ({ success: false, error: "Not supported in Web environment" }),
    }))

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
        <div className="relative flex-1 bg-white">
          {assetsReady || files.length === 0 ? (
            <iframe
              key={refreshKey}
              ref={iframeRef}
              title="preview"
              srcDoc={srcDoc}
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads"
              // @ts-expect-error - credentialless is a new feature for COEP isolation
              credentialless="true"
            />
          ) : (
            <div className="flex h-full animate-pulse items-center justify-center text-sm text-zinc-400">
              Loading assets...
            </div>
          )}
        </div>
      </div>
    )
  })
)

WebRunner.displayName = "WebRunner"
