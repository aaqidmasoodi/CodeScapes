/// <reference lib="webworker" />

// DEBUG: Set to false for production builds (Vercel)
const DEBUG = true
const log = (...args) => DEBUG && console.log(...args)
const warn = (...args) => DEBUG && console.warn(...args)

// Detect environment for path prefix
// Localhost uses /sandbox/run/, subdomain uses /run/
const isLocalhost = self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1"
const RUN_PATH_PREFIX = isLocalhost ? "/sandbox/run" : "/run"

const CACHE_NAME = "codescape-sandbox-v3"
const FILES_CACHE = "codescape-files-v1"

self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
  log("[Sandbox SW] Activated v3 (Persistent)")
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
      // Load files into Persistent Cache
      const { scapeId, files, env } = event.data.payload
      log(`[Sandbox SW] Hydrating ${scapeId} (${files.length} files)`)

      // Prepare Injection Script
      const envSafe = env || {}
      const injectionScript = `<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
      <script>
        (function() {
          if (window.__cs_preamble) return;
          window.__cs_preamble = true;
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
          nativeConsole.log("[Sandbox Preamble] Setting process.env", ${JSON.stringify(Object.keys(envSafe))});
          var env = ${JSON.stringify(envSafe)};
          window.process = window.process || {};
          window.process.env = env;
          if (typeof process === 'undefined') {
            window.process = { env: env };
          }
          function notifyReady() {
            window.parent.postMessage({ type: "SANDBOX_CONTENT_READY" }, "*");
          }
          window.addEventListener("load", function() {
            var waitForFonts = document.fonts && document.fonts.ready 
              ? document.fonts.ready 
              : Promise.resolve();
            waitForFonts.then(function() {
              setTimeout(notifyReady, 500);
            });
          });
          window.addEventListener("message", function(e) {
            if (e.data && e.data.type === "SANDBOX_CAPTURE_THUMBNAIL") {
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
              if (typeof html2canvas !== "undefined") {
                setTimeout(function() {
                  // Detect background color, handle transparent/gradient cases
                  var bgColor = window.getComputedStyle(document.body).backgroundColor;
                  // If transparent or empty, fallback to white
                  if (!bgColor || bgColor === "rgba(0, 0, 0, 0)" || bgColor === "transparent") {
                    bgColor = "#ffffff";
                  }
                  
                  html2canvas(document.body, {
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    scale: 1,
                    backgroundColor: bgColor,
                    onclone: function(clonedDoc) {
                      // Extract all CSS rules from the original document's stylesheets
                      // and inject them as inline <style> tags in the cloned document
                      try {
                        var cssText = "";
                        var sheets = document.styleSheets;
                        for (var i = 0; i < sheets.length; i++) {
                          try {
                            var rules = sheets[i].cssRules || sheets[i].rules;
                            if (rules) {
                              for (var j = 0; j < rules.length; j++) {
                                cssText += rules[j].cssText + "\\n";
                              }
                            }
                          } catch (e) {
                            // Cross-origin stylesheets will throw SecurityError
                            // We skip those as they're external CDN styles
                            nativeConsole.warn("[Sandbox] Skipping cross-origin stylesheet:", sheets[i].href);
                          }
                        }
                        
                        if (cssText) {
                          var styleEl = clonedDoc.createElement("style");
                          styleEl.textContent = cssText;
                          clonedDoc.head.appendChild(styleEl);
                        }
                        
                        // Remove external stylesheet links to prevent 404s
                        var links = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
                        links.forEach(function(link) {
                          link.remove();
                        });
                      } catch (err) {
                        nativeConsole.error("[Sandbox] CSS extraction failed:", err);
                      }
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

      try {
        const cache = await caches.open(FILES_CACHE)

        // Clear existing cache entries for this scapeId to ensure fresh files
        const existingRequests = await cache.keys()
        for (const request of existingRequests) {
          if (request.url.includes(`/run/${scapeId}/`)) {
            await cache.delete(request)
          }
        }
        log(`[Sandbox SW] Cleared old cache entries for ${scapeId}`)

        // Process and Store files
        const putPromises = files.map(async (file) => {
          let blob = file.content
          const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
          let type = MIME_TYPES[ext] || "text/plain"

          // Inject Secrets into HTML
          if (injectionScript && ext === ".html" && typeof blob === "string") {
            const hasHead = /<head/i.test(blob)
            const hasBody = /<body/i.test(blob)
            if (hasHead) {
              blob = blob.replace(/<head[^>]*>/i, (match) => `${match}${injectionScript}`)
            } else if (hasBody) {
              blob = blob.replace(/<body[^>]*>/i, (match) => `${match}${injectionScript}`)
            } else {
              blob = injectionScript + blob
            }
          }

          if (typeof blob === "string") {
            // Remote/Data Uri handling
            if (blob.startsWith("data:")) {
              try {
                const res = await fetch(blob)
                blob = await res.blob()
                type = blob.type || type
              } catch (e) {
                console.error(`[Sandbox SW] Failed to decode data URI`, e)
              }
            } else if (blob.startsWith("http") || blob.startsWith("/")) {
              try {
                const res = await fetch(blob, { mode: "cors" })
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                blob = await res.blob()
                type = blob.type || type
              } catch (e) {
                console.error(`[Sandbox SW] Failed fetch remote`, e)
                blob = new Blob([blob], { type })
              }
            } else {
              blob = new Blob([blob], { type })
            }
          } else {
            // Ensure correct type
            if (blob.type !== type) blob = new Blob([blob], { type })
          }

          // Construct Cache Key using environment-aware prefix
          // Note: file.name might contain subdirectories e.g. "css/style.css"
          // We must ensure it matches the fetch request URL exactly.
          const cacheUrl = new URL(`${RUN_PATH_PREFIX}/${scapeId}/${file.name}`, self.location.origin)

          await cache.put(
            cacheUrl,
            new Response(blob, {
              status: 200,
              headers: {
                "Content-Type": type,
                "Cache-Control": "no-store",
                "Cross-Origin-Resource-Policy": "cross-origin",
                "Access-Control-Allow-Origin": "*",
              },
            })
          )
        })

        await Promise.all(putPromises)
        log(`[Sandbox SW] Hydration Complete for ${scapeId}`)

        // Acknowledge
        if (event.ports[0]) event.ports[0].postMessage({ type: "ACK" })
      } catch (err) {
        console.error("[Sandbox SW] Hydration Failed", err)
      }
      break
    }
  }
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  if (url.pathname.includes("/run/")) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((response) => {
        if (response) return response

        // Not in cache?
        // Try normalized lookup (handle ./ or missing /) if needed,
        // but strict matching is safer.
        // If strictly not found, return our friendly error.
        return new Response("Sandbox not hydrated (File not found in cache)", { status: 404 })
      })
    )
  }
})
