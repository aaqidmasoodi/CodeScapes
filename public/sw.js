/// <reference lib="webworker" />

const CACHE_NAME = "codescape-preview-v3"
const fileSystem = new Map()

self.addEventListener("install", (event) => {
  // Activate immediately
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  // Claim clients immediately
  event.waitUntil(self.clients.claim())
  console.log("[SW] Activated")
})

self.addEventListener("message", async (event) => {
  if (!event.data) return

  const { type, payload } = event.data

  if (type === "FILE_UPDATE") {
    if (payload.clear) {
      console.log("[SW] Clearing filesystem")
      fileSystem.clear()
    }

    if (Array.isArray(payload.files)) {
      console.log(`[SW] caching ${payload.files.length} files`)
      payload.files.forEach((file) => {
        let content = file.content
        let contentType = "application/octet-stream"

        if (file.name.endsWith(".html")) contentType = "text/html"
        else if (file.name.endsWith(".css")) contentType = "text/css"
        else if (file.name.endsWith(".js")) contentType = "application/javascript"
        else if (file.name.endsWith(".json")) contentType = "application/json"
        else if (file.name.endsWith(".png")) contentType = "image/png"
        else if (file.name.endsWith(".jpg") || file.name.endsWith(".jpeg"))
          contentType = "image/jpeg"
        else if (file.name.endsWith(".svg")) contentType = "image/svg+xml"
        else if (file.name.endsWith(".wasm")) contentType = "application/wasm"

        console.log(`[SW] Storing ${file.name} as ${contentType}`)

        if (typeof content === "string") {
          // Detect Remote URL (Storage)
          if (content.startsWith("http://") || content.startsWith("https://")) {
            fileSystem.set(file.name, content)
          } else {
            fileSystem.set(file.name, new Blob([content], { type: contentType }))
          }
        } else {
          // Binary
          if (content instanceof Blob) {
            fileSystem.set(file.name, content)
          } else {
            // ArrayBuffer or Uint8Array
            fileSystem.set(file.name, new Blob([content], { type: contentType }))
          }
        }
      })
    }

    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ type: "ACK" })
    }
  }
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Use /preview-v3/ as the standard path
  if (url.pathname.startsWith("/preview-v3/")) {
    let path = url.pathname.replace("/preview-v3/", "")
    if (path === "" || path === "/") path = "index.html"

    const content = fileSystem.get(path)

    if (content) {
      if (
        typeof content === "string" &&
        (content.startsWith("http://") || content.startsWith("https://"))
      ) {
        console.log(`[SW] Proxying ${path} to ${content}`)
        event.respondWith(
          fetch(content)
            .then((response) => {
              // Recreate response with enforced CORP headers
              const newHeaders = new Headers(response.headers)
              newHeaders.set("Cross-Origin-Resource-Policy", "cross-origin")
              newHeaders.set("Access-Control-Allow-Origin", "*")

              return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: newHeaders,
              })
            })
            .catch((e) => {
              console.error("[SW] Proxy fetch failed:", e)
              return new Response("Proxy error", { status: 502 })
            })
        )
        return
      }

      event.respondWith(
        new Response(content, {
          status: 200,
          headers: {
            "Content-Type": content.type,
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Resource-Policy": "cross-origin",
          },
        })
      )
      return
    } else {
      console.error(`[SW] File not found in memory: ${path}`)
      event.respondWith(
        new Response(`File not found: ${path}`, {
          status: 404,
          headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Resource-Policy": "cross-origin",
          },
        })
      )
      return
    }
  }
})
