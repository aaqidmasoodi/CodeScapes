/// <reference lib="webworker" />

const CACHE_NAME = "codescape-preview-v3"
const fileSystem = new Map()

self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("message", async (event) => {
  if (!event.data) return

  const { type, payload } = event.data

  if (type === "FILE_UPDATE") {
    if (payload.clear) {
      fileSystem.clear()
    }

    if (Array.isArray(payload.files)) {
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

        if (typeof content === "string") {
          fileSystem.set(file.name, new Blob([content], { type: contentType }))
        } else {
          if (content instanceof Blob) {
            fileSystem.set(file.name, content)
          } else {
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

  // Intercept /preview-v3/ requests
  if (url.pathname.startsWith("/preview-v3/")) {
    let path = url.pathname.replace("/preview-v3/", "")
    if (path === "" || path === "/") path = "index.html"

    const content = fileSystem.get(path)

    if (content) {
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

self.addEventListener("install", (event) => {
  // Activate immediately
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  // Claim clients immediately
  event.waitUntil(self.clients.claim())
})

self.addEventListener("message", async (event) => {
  if (!event.data) return

  const { type, payload } = event.data

  if (type === "FILE_UPDATE") {
    // Payload is a map or array of files: { [path]: content }
    if (payload.clear) {
      fileSystem.clear()
    }

    // Process files
    if (Array.isArray(payload.files)) {
      payload.files.forEach((file) => {
        let content = file.content
        let contentType = "application/octet-stream"

        // mime type inference
        if (file.name.endsWith(".html")) contentType = "text/html"
        else if (file.name.endsWith(".css")) contentType = "text/css"
        else if (file.name.endsWith(".js")) contentType = "application/javascript"
        else if (file.name.endsWith(".json")) contentType = "application/json"
        else if (file.name.endsWith(".png")) contentType = "image/png"
        else if (file.name.endsWith(".jpg") || file.name.endsWith(".jpeg"))
          contentType = "image/jpeg"
        else if (file.name.endsWith(".svg")) contentType = "image/svg+xml"
        else if (file.name.endsWith(".wasm")) contentType = "application/wasm"

        if (typeof content === "string") {
          fileSystem.set(file.name, new Blob([content], { type: contentType }))
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

    // Respond to acknowledge
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ type: "ACK" })
    }
  }
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Only intercept requests under /preview/
  if (url.pathname.startsWith("/preview/")) {
    let path = url.pathname.replace("/preview/", "")
    if (path === "" || path === "/") path = "index.html"

    const content = fileSystem.get(path)

    if (content) {
      event.respondWith(
        new Response(content, {
          status: 200,
          headers: {
            "Content-Type": content.type,
            "Cache-Control": "no-cache",
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Resource-Policy": "same-origin", // FIX: Allow resource to be loaded
          },
        })
      )
      return
    } else {
      // 404 for virtual file
      event.respondWith(
        new Response(`File not found: ${path}`, {
          status: 404,
          headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Resource-Policy": "same-origin",
          },
        })
      )
      return
    }
  }
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Activated")
  // Claim clients immediately
  event.waitUntil(self.clients.claim())
})

self.addEventListener("message", async (event) => {
  if (!event.data) return

  const { type, payload } = event.data
  console.log("[SW] Message received:", type)

  if (type === "FILE_UPDATE") {
    // Payload is a map or array of files: { [path]: content }
    // We expect clear: boolean to wipe cache first?
    if (payload.clear) {
      console.log("[SW] Clearing filesystem")
      fileSystem.clear()
    }

    // Process files
    // Payload.files might be an array of { name: string, content: string | Blob }
    if (Array.isArray(payload.files)) {
      console.log(`[SW] caching ${payload.files.length} files`)
      payload.files.forEach((file) => {
        let content = file.content
        let contentType = "application/octet-stream"

        // mime type inference
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
          fileSystem.set(file.name, new Blob([content], { type: contentType }))
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

    console.log("[SW] Filesystem size:", fileSystem.size)

    // Respond to acknowledge
    if (event.ports && event.ports[0]) {
      console.log("[SW] Sending ACK")
      event.ports[0].postMessage({ type: "ACK" })
    }
  }
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Only intercept requests under /preview/
  // The iframe will load /preview/index.html
  if (url.pathname.startsWith("/preview/")) {
    // Extract relative path: /preview/index.html -> index.html
    // /preview/assets/logo.png -> assets/logo.png
    let path = url.pathname.replace("/preview/", "")

    // Handle root /preview/ -> index.html
    if (path === "" || path === "/") path = "index.html"

    console.log(`[SW] Fetch intercepted for: ${path}`)

    const content = fileSystem.get(path)

    if (content) {
      console.log(`[SW] Serving ${path} from memory`)
      event.respondWith(
        new Response(content, {
          status: 200,
          headers: {
            "Content-Type": content.type,
            "Cache-Control": "no-cache",
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
          },
        })
      )
      return
    } else {
      console.error(`[SW] File not found in memory: ${path}`)
      console.log("Current keys:", [...fileSystem.keys()])
      // 404 for virtual file
      event.respondWith(
        new Response(`File not found: ${path}`, {
          status: 404,
          headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
          },
        })
      )
      return
    }
  }

  // Allow all other requests (extensions, external CDNs, etc.)
})
