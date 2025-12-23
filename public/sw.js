/// <reference lib="webworker" />

const CACHE_NAME = "codescape-preview-v3"
// Structure: Map<ScapeId, Map<FileName, Content>>
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

// --- Message Handling ---
self.addEventListener("message", (event) => {
  const { data, ports } = event
  const port = ports[0]

  if (!data || !data.type) return

  if (data.type === "FILE_UPDATE") {
    const { scapeId, files, clear } = data.payload

    if (!scapeId) {
      console.error("[SW] Missing scapeId in FILE_UPDATE")
      return
    }

    console.log(`[SW] Received Update for Scape: ${scapeId} (${files.length} files)`)

    // Get or Create Namespace
    let scapeFs = fileSystem.get(scapeId)
    if (!scapeFs || clear) {
      scapeFs = new Map()
      fileSystem.set(scapeId, scapeFs)
    }

    // Populate Files
    for (const file of files) {
      let contentType = "text/plain"
      if (file.name.endsWith(".html")) contentType = "text/html"
      else if (file.name.endsWith(".js")) contentType = "application/javascript"
      else if (file.name.endsWith(".css")) contentType = "text/css"
      else if (file.name.endsWith(".json")) contentType = "application/json"
      else if (file.name.endsWith(".png")) contentType = "image/png"
      else if (file.name.endsWith(".jpg") || file.name.endsWith(".jpeg")) contentType = "image/jpeg"
      else if (file.name.endsWith(".svg")) contentType = "image/svg+xml"
      else if (file.name.endsWith(".wasm")) contentType = "application/wasm"

      const content = file.content
      console.log(`[SW] Storing ${file.name} in ${scapeId}`)

      if (typeof content === "string") {
        // Remote URL or Text
        if (content.startsWith("http://") || content.startsWith("https://")) {
          scapeFs.set(file.name, content)
        } else {
          scapeFs.set(file.name, new Blob([content], { type: contentType }))
        }
      } else {
        // Binary
        if (content instanceof Blob) {
          scapeFs.set(file.name, content)
        } else {
          scapeFs.set(file.name, new Blob([content], { type: contentType }))
        }
      }
    }

    if (port) port.postMessage({ type: "ACK" })
  }
})

// --- Input Blocking Map ---
const pendingInputs = new Map()

// --- Fetch Interception ---
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // 1. Python Input Blocking Strategy
  if (url.pathname === "/_wait_input") {
    const id = url.searchParams.get("id")
    if (!id) return event.respondWith(new Response("Missing ID", { status: 400 }))

    console.log(`[SW] Holding connection for Input ID: ${id}`)
    console.log(`[SW] Current Params:`, [...pendingInputs.keys()])

    event.respondWith(
      new Promise((resolve) => {
        // Store the resolve function to be called later
        pendingInputs.set(id, resolve)
      })
    )
    return
  }

  if (url.pathname === "/_debug_inputs") {
    const keys = [...pendingInputs.keys()]
    event.respondWith(
      new Response(JSON.stringify(keys), { headers: { "Content-Type": "application/json" } })
    )
    return
  }

  if (url.pathname === "/_submit_input") {
    event.respondWith(
      (async () => {
        try {
          const data = await event.request.json()
          const { id, value } = data

          console.log(`[SW] Attempting to release ID: ${id}. Available:`, [...pendingInputs.keys()])

          if (pendingInputs.has(id)) {
            console.log(`[SW] Releasing Input ID: ${id} with value: "${value}"`)
            const resolve = pendingInputs.get(id)
            resolve(
              new Response(value, {
                status: 200,
                headers: { "X-SW-Intercept": "true" },
              })
            )
            pendingInputs.delete(id)
            return new Response("OK", { status: 200 })
          }
          return new Response("Input ID not found in Service Worker Map", { status: 404 })
        } catch (e) {
          console.error(e)
          return new Response("Error processing input", { status: 500 })
        }
      })()
    )
    return
  }

  // Scope: /preview-v3/<scapeId/<filePath>
  if (url.pathname.startsWith("/preview-v3/")) {
    // Extract parts: ["", "preview-v3", "scapeId", "rest..."]
    const parts = url.pathname.split("/")
    if (parts.length < 4) {
      event.respondWith(new Response("Invalid preview URL format", { status: 400 }))
      return // Invalid path
    }

    const scapeId = parts[2]
    let path = parts.slice(3).join("/") // Reconstruct file path

    // Default to index.html if path is empty
    if (path === "" || path === "/") path = "index.html"

    // Safety check just in case
    if (!scapeId || !path) {
      event.respondWith(new Response("Invalid preview URL parameters", { status: 400 }))
      return
    }

    console.log(`[SW] Fetch Request: Scape=${scapeId}, Path=${path}`)

    const scapeFs = fileSystem.get(scapeId)

    if (!scapeFs) {
      console.warn(`[SW] No filesystem found for Scape: ${scapeId}`)
      event.respondWith(new Response("Scape not initialized", { status: 404 }))
      return
    }

    const content = scapeFs.get(path)

    if (content) {
      // Handle Remote URL (Proxy)
      if (
        typeof content === "string" &&
        (content.startsWith("http://") || content.startsWith("https://"))
      ) {
        // ... (Proxy Logic kept same, just shortened for replacement matching if needed, but I can target the Block)
        // Actually, better to target the HTML serving block specifically.
      }

      // ...
    }
    console.log(`[SW] Proxying ${path} to ${content}`)
    event.respondWith(
      fetch(content)
        .then((response) => {
          // Recreate response with enforced CORP headers and No-Cache
          const newHeaders = new Headers(response.headers)
          newHeaders.set("Cross-Origin-Resource-Policy", "cross-origin")
          newHeaders.set("Access-Control-Allow-Origin", "*")
          newHeaders.set("Cache-Control", "no-store, no-cache") // Force no-cache on proxy too

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

  console.log(`[SW] Serving ${path} from memory (Namespace: ${scapeId})`)
  // Blob response
  const response = new Response(content, {
    status: 200,
    headers: {
      "Content-Type": content.type,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Access-Control-Allow-Origin": "*",
    },
  })
  event.respondWith(response)
  return
}

    console.warn(`[SW] File not found in ${scapeId}: ${path}`)
    event.respondWith(new Response("File not found", { status: 404 }))
  }
})
