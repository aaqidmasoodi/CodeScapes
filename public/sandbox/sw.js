/// <reference lib="webworker" />

const CACHE_NAME = "codescape-sandbox-v3"
// Map<ScapeId, Map<FilePath, Blob>>
const fileSystem = new Map()

self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
  console.log("[Sandbox SW] Activated v2")
})

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
}

self.addEventListener("message", async (event) => {
  if (!event.data || !event.data.type) return

  switch (event.data.type) {
    case "HYDRATE": {
      // Load files into memory
      const { scapeId, files, env } = event.data.payload
      console.log(`[Sandbox SW] Hydrating ${scapeId} (${files.length} files)`)

      // Prepare Injection Script
      // Always inject to ensure process is defined
      const envSafe = env || {}
      const injectionScript = `<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
      <script>
        (function() {
          if (window.__cs_preamble) return;
          window.__cs_preamble = true;

          // --- Console Proxy & Error Capture ---
          const PARENT_ORIGIN = "*";
          const nativeConsole = {
            log: console.log.bind(console),
            warn: console.warn.bind(console),
            error: console.error.bind(console)
          };

          function proxyUserConsole() {
            function send(level, args) {
              const payload = args.map((a) => {
                try {
                  return typeof a === "object" ? JSON.stringify(a) : String(a);
                } catch (e) {
                  return String(a);
                }
              });
              window.parent.postMessage({ type: "SANDBOX_LOG", level, payload }, PARENT_ORIGIN);
              nativeConsole[level].apply(console, args);
            }
            console.log = function() { send("log", Array.from(arguments)); };
            console.warn = function() { send("warn", Array.from(arguments)); };
            console.error = function() { send("error", Array.from(arguments)); };
          }
          proxyUserConsole();
          
          window.onerror = function(msg, url, line, col, error) {
             const payload = [msg, "@ " + (url ? url.split('/').pop() : 'unknown') + ":" + line + ":" + col];
             window.parent.postMessage({ type: "SANDBOX_LOG", level: "error", payload }, PARENT_ORIGIN);
             return false;
          };
          window.addEventListener("unhandledrejection", function(e) {
             window.parent.postMessage({ type: "SANDBOX_LOG", level: "error", payload: ["Unhandled Rejection:", e.reason] }, PARENT_ORIGIN);
          });
          // -------------------------------------

          nativeConsole.log("[Sandbox Preamble] Setting process.env", ${JSON.stringify(Object.keys(envSafe))});
          var env = ${JSON.stringify(envSafe)};
          window.process = window.process || {};
          window.process.env = env;
          if (typeof process === 'undefined') {
            window.process = { env: env };
          }
          
          // Content Ready Detection for Thumbnail Capture
          function notifyReady() {
            window.parent.postMessage({ type: "SANDBOX_CONTENT_READY" }, "*");
          }
          
          window.addEventListener("load", function() {
            // Wait for fonts and give extra time for CSS animations
            var waitForFonts = document.fonts && document.fonts.ready 
              ? document.fonts.ready 
              : Promise.resolve();
            
            waitForFonts.then(function() {
              // Extra 500ms for CSS transitions/animations
              setTimeout(notifyReady, 500);
            });
          });
          
          // Handle thumbnail capture requests from parent
          window.addEventListener("message", function(e) {
            if (e.data && e.data.type === "SANDBOX_CAPTURE_THUMBNAIL") {
              // First try canvas elements (p5.js, Three.js)
              var canvas = document.querySelector("canvas");
              if (canvas) {
                try {
                  var data = canvas.toDataURL("image/jpeg", 0.7);
                  window.parent.postMessage({ type: "SANDBOX_THUMBNAIL_DATA", payload: data }, "*");
                  return;
                } catch(err) {
                  nativeConsole.warn("[Sandbox] Canvas capture failed, trying html2canvas");
                }
              }
              
              // Fallback to html2canvas
              if (typeof html2canvas !== "undefined") {
                // Add a small delay to ensure styles are applied
                setTimeout(function() {
                  html2canvas(document.body, {
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    scale: 1,
                    backgroundColor: window.getComputedStyle(document.body).backgroundColor || "#ffffff",
                    onclone: function(clonedDoc) {
                      // Inline all computed styles to ensure they're captured
                      var elements = clonedDoc.querySelectorAll("*");
                      elements.forEach(function(el) {
                        var computed = window.getComputedStyle(document.body.querySelector(el.tagName) || document.body);
                        el.style.cssText = el.style.cssText || "";
                      });
                    }
                  }).then(function(cvs) {
                    var data = cvs.toDataURL("image/jpeg", 0.7);
                    window.parent.postMessage({ type: "SANDBOX_THUMBNAIL_DATA", payload: data }, "*");
                  }).catch(function(err) {
                    nativeConsole.error("[Sandbox] html2canvas failed:", err);
                    window.parent.postMessage({ type: "SANDBOX_THUMBNAIL_DATA", payload: null }, "*");
                  });
                }, 200);
              } else {
                nativeConsole.warn("[Sandbox] html2canvas not loaded");
                window.parent.postMessage({ type: "SANDBOX_THUMBNAIL_DATA", payload: null }, "*");
              }
            }
          });
          // Handle Hot Reload / Soft Compile
          window.addEventListener("message", function(event) {
             if (event.data && event.data.type === "COMPILE_FILES") {
                nativeConsole.log("[Preamble] Received COMPILE_FILES signal");
                if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
                    window.location.reload();
                    return;
                }
                
                const { scapeId, files, env } = event.data.payload;
                const channel = new MessageChannel();
                channel.port1.onmessage = function(e) {
                   if (e.data.type === "ACK") {
                      window.location.reload();
                   }
                };
                
                navigator.serviceWorker.controller.postMessage({
                   type: "HYDRATE",
                   payload: { scapeId, files, env }
                }, [channel.port2]);
             }
          });
        })();
      </script>`

      const scapeFs = new Map()
      for (const file of files) {
        let blob = file.content
        const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
        let type = MIME_TYPES[ext] || "text/plain"

        // Inject Secrets into HTML
        if (injectionScript && ext === ".html" && typeof blob === "string") {
          const hasHead = /<head/i.test(blob)
          const hasBody = /<body/i.test(blob)

          console.log(
            `[Sandbox SW] Injecting preamble into ${file.name} (Head: ${hasHead}, Body: ${hasBody})`
          )

          if (hasHead) {
            blob = blob.replace(/<head[^>]*>/i, (match) => `${match}${injectionScript}`)
          } else if (hasBody) {
            blob = blob.replace(/<body[^>]*>/i, (match) => `${match}${injectionScript}`)
          } else {
            blob = injectionScript + blob
          }
        }

        if (typeof blob === "string") {
          // Check if it's a Base64 Data URI
          if (blob.startsWith("data:")) {
            try {
              const res = await fetch(blob)
              blob = await res.blob()
              // Update type from blob if available, or keep inferred
              type = blob.type || type
            } catch (e) {
              console.error(`[Sandbox SW] Failed to decode data URI for ${file.name}`, e)
            }
          } else if (blob.startsWith("http") || blob.startsWith("/")) {
            // Check if it's a Remote URL (Supabase Storage)
            try {
              console.log(`[Sandbox SW] Fetching remote asset for ${file.name}: ${blob}`)
              const res = await fetch(blob, { mode: "cors" })
              if (!res.ok) throw new Error(`HTTP ${res.status}`)
              blob = await res.blob()
              // Use the actual type from the remote file
              type = blob.type || type
            } catch (e) {
              console.error(`[Sandbox SW] Failed to fetch remote asset ${file.name}`, e)
              // Fallback? convert text to blob so it doesn't crash, but it will be broken image
              blob = new Blob([blob], { type })
            }
          } else {
            // Regular text content
            // Use the local 'blob' variable which might have been modified (injected)
            blob = new Blob([blob], { type })
          }
        }

        // Ensure proper type on final blob
        if (blob instanceof Blob && blob.type !== type) {
          blob = new Blob([blob], { type })
        }

        console.log(`[Sandbox SW] Stored: ${file.name} (${type}, ${blob.size} bytes)`)
        scapeFs.set(file.name, blob)
      }

      fileSystem.set(scapeId, scapeFs)

      // Acknowledge
      if (event.ports[0]) event.ports[0].postMessage({ type: "ACK" })
      break
    }
  }
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Debug: Log all fetch events in scope
  if (url.pathname.includes("/sandbox/")) {
    console.log(`[Sandbox SW] Fetch: ${url.pathname}`)
  }

  // Intercept requests to /sandbox/run/<scapeId>/<path>
  // This matches the relative path structure from bootloader.html
  const PATH_PREFIX = "/sandbox/run/"

  if (url.pathname.includes("/run/")) {
    // Robust splitting: find /run/ and take everything after
    const parts = url.pathname.split("/run/")[1].split("/")
    const scapeId = parts[0]
    const filePath = parts.slice(1).join("/") || "index.html"

    const scapeFs = fileSystem.get(scapeId)

    if (!scapeFs) {
      console.warn(`[Sandbox SW] Scape FS not found for: ${scapeId}`)
      // If not found, perhaps we are just booting up or lost context.
      // Return 404 or a "Loading" page
      return event.respondWith(new Response("Sandbox not hydrated", { status: 404 }))
    }

    // Normalize: remove leading / or ./
    const normalizedPath = filePath.replace(/^(\.?\/)/, "")

    let file = scapeFs.get(normalizedPath)

    // Try exact match if normalization failed?
    if (!file) file = scapeFs.get(filePath)

    if (file) {
      const resp = new Response(file, {
        status: 200,
        headers: {
          "Content-Type": file.type,
          "Cache-Control": "no-store",
          "Cross-Origin-Resource-Policy": "cross-origin",
          "Access-Control-Allow-Origin": "*",
        },
      })
      return event.respondWith(resp)
    }

    console.warn(`[Sandbox SW] 404 Not Found: ${filePath} (Normalized: ${normalizedPath})`)
    console.warn(`[Sandbox SW] Available files:`, Array.from(scapeFs.keys()))

    return event.respondWith(new Response("File not found", { status: 404 }))
  }
})
