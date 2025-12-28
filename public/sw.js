/// <reference lib="webworker" />

// =============================================================================
// SERVICE WORKER VERSIONING AND LIFECYCLE
// =============================================================================

/**
 * SW_VERSION: Increment this on every deploy to force clients to update.
 * Format: YYYY.MM.DD.patch (e.g., 2024.12.25.1)
 */
const SW_VERSION = "2024.12.25.1"

/**
 * TTL: Maximum age before the SW self-destructs (7 days in milliseconds)
 * This is a safety net for users who don't visit frequently
 */
const SW_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Creation timestamp - set when SW is first installed
 * Stored in a way that persists across activations
 */
let swCreatedAt = Date.now()

// =============================================================================
// DEBUG CONFIG
// =============================================================================

const DEBUG = true
const log = (...args) => DEBUG && console.log("[SW]", ...args)
const warn = (...args) => DEBUG && console.warn("[SW]", ...args)

// =============================================================================
// CACHE AND FILESYSTEM
// =============================================================================

const CACHE_NAME = "codescape-preview-v3"
// Structure: Map<ScapeId, Map<FileName, Content>>
const fileSystem = new Map()

// =============================================================================
// LIFECYCLE EVENTS
// =============================================================================

self.addEventListener("install", (event) => {
  log(`Installing version ${SW_VERSION}`)
  // Activate immediately - don't wait for old SW to die
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  log(`Activated version ${SW_VERSION}`)
  // Claim all clients immediately
  event.waitUntil(self.clients.claim())
})

// =============================================================================
// TTL SELF-DESTRUCT CHECK
// =============================================================================

/**
 * Periodically check if this SW has exceeded its TTL
 * If so, unregister and let the next page load get a fresh SW
 */
const checkTTL = () => {
  const age = Date.now() - swCreatedAt
  if (age > SW_MAX_AGE_MS) {
    warn(`TTL exceeded (${Math.round(age / 1000 / 60 / 60)} hours old). Self-destructing...`)
    self.registration.unregister().then(() => {
      log("Unregistered due to TTL")
    })
  }
}

// Check TTL every 5 minutes
setInterval(checkTTL, 5 * 60 * 1000)

// =============================================================================
// MESSAGE HANDLING
// =============================================================================

self.addEventListener("message", (event) => {
  const { data, ports } = event
  const port = ports[0]

  if (!data || !data.type) return

  // VERSION CHECK - Respond to version queries from the app
  if (data.type === "GET_VERSION") {
    if (port) {
      port.postMessage({
        version: SW_VERSION,
        createdAt: swCreatedAt,
        maxAge: SW_MAX_AGE_MS,
      })
    }
    return
  }

  // SKIP_WAITING - Force this SW to activate immediately
  if (data.type === "SKIP_WAITING") {
    log("Received SKIP_WAITING, activating immediately")
    self.skipWaiting()
    return
  }

  // FORCE_UNREGISTER - Nuclear option
  if (data.type === "FORCE_UNREGISTER") {
    log("Received FORCE_UNREGISTER, self-destructing")
    self.registration.unregister()
    return
  }

  // FILE_UPDATE - Original preview filesystem logic
  if (data.type === "FILE_UPDATE") {
    const { scapeId, files, clear } = data.payload

    if (!scapeId) {
      console.error("[SW] Missing scapeId in FILE_UPDATE")
      return
    }

    log(`Received Update for Scape: ${scapeId} (${files.length} files)`)

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
      log(`Storing ${file.name} in ${scapeId}`)

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

// =============================================================================
// INPUT BLOCKING (Python input() support)
// =============================================================================

const pendingInputs = new Map()

// =============================================================================
// TURTLE GRAPHICS EVENT QUEUE
// =============================================================================

// Event queue for turtle keyboard events
// Worker polls this via sync XHR during screen.update()
const turtleEvents = []

// =============================================================================
// FETCH INTERCEPTION
// =============================================================================

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // 1. Python Input Blocking Strategy
  if (url.pathname === "/_wait_input") {
    const id = url.searchParams.get("id")
    if (!id) return event.respondWith(new Response("Missing ID", { status: 400 }))

    log(`Holding connection for Input ID: ${id}`)

    event.respondWith(
      new Promise((resolve) => {
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

          log(`Attempting to release ID: ${id}. Available:`, [...pendingInputs.keys()])

          if (pendingInputs.has(id)) {
            log(`Releasing Input ID: ${id} with value: "${value}"`)
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

  // 3. Turtle Graphics Event Queue
  // Worker polls this to get keyboard events
  if (url.pathname === "/_turtle_events") {
    // Return all queued events and clear the queue
    const events = [...turtleEvents]
    turtleEvents.length = 0 // Clear queue
    event.respondWith(
      new Response(JSON.stringify(events), {
        headers: { "Content-Type": "application/json" },
      })
    )
    return
  }

  // Main thread pushes events here (Keyboard, Mouse, etc.)
  if (url.pathname === "/_turtle_push_event" || url.pathname === "/_turtle_keydown") {
    event.respondWith(
      (async () => {
        try {
          const data = await event.request.json()
          log(`Turtle Event Pushed:`, data)
          turtleEvents.push(data)
          return new Response("OK", { status: 200 })
        } catch (e) {
          console.error(e)
          return new Response("Error processing turtle event", { status: 500 })
        }
      })()
    )
    return
  }

  // 4. Preview Filesystem - Scope: /preview-v3/<scapeId>/<filePath>
  if (url.pathname.startsWith("/preview-v3/")) {
    const parts = url.pathname.split("/")
    if (parts.length < 4) {
      event.respondWith(new Response("Invalid preview URL format", { status: 400 }))
      return
    }

    const scapeId = parts[2]
    let path = parts.slice(3).join("/")

    if (path === "" || path === "/") path = "index.html"

    if (!scapeId || !path) {
      event.respondWith(new Response("Invalid preview URL parameters", { status: 400 }))
      return
    }

    log(`Fetch Request: Scape=${scapeId}, Path=${path}`)

    const scapeFs = fileSystem.get(scapeId)

    if (!scapeFs) {
      warn(`No filesystem found for Scape: ${scapeId}`)
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
        log(`Proxying ${path} to ${content}`)
        event.respondWith(
          fetch(content)
            .then((response) => {
              const newHeaders = new Headers(response.headers)
              newHeaders.set("Cross-Origin-Resource-Policy", "cross-origin")
              newHeaders.set("Access-Control-Allow-Origin", "*")
              newHeaders.set("Cache-Control", "no-store, no-cache")

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

      log(`Serving ${path} from memory (Namespace: ${scapeId})`)
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

    warn(`File not found in ${scapeId}: ${path}`)
    event.respondWith(new Response("File not found", { status: 404 }))
  }
})
