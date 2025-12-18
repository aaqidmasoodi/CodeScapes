/// <reference lib="webworker" />

const CACHE_NAME = "codescape-sandbox-v1"
// Map<ScapeId, Map<FilePath, Blob>>
const fileSystem = new Map()

self.addEventListener("install", (event) => {
    self.skipWaiting()
})

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim())
    console.log("[Sandbox SW] Activated")
})

self.addEventListener("message", (event) => {
    if (!event.data || !event.data.type) return

    switch (event.data.type) {
        case "HYDRATE": {
            // Load files into memory
            const { scapeId, files } = event.data.payload
            console.log(`[Sandbox SW] Hydrating ${scapeId} (${files.length} files)`)

            const scapeFs = new Map()
            for (const file of files) {
                // Assume content is already prepared (or handle conversion if string)
                let blob = file.content
                if (typeof blob === "string") {
                    // Basic mime type guessing
                    let type = "text/plain"
                    if (file.name.endsWith(".html")) type = "text/html"
                    else if (file.name.endsWith(".js")) type = "application/javascript"
                    else if (file.name.endsWith(".css")) type = "text/css"

                    blob = new Blob([file.content], { type })
                }
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
            // If not found, perhaps we are just booting up or lost context.
            // Return 404 or a "Loading" page
            return event.respondWith(new Response("Sandbox not hydrated", { status: 404 }))
        }

        const file = scapeFs.get(filePath)
        if (file) {
            const resp = new Response(file, {
                status: 200,
                headers: {
                    "Content-Type": file.type,
                    "Cache-Control": "no-store",
                    "Cross-Origin-Resource-Policy": "cross-origin",
                    "Access-Control-Allow-Origin": "*"
                }
            })
            return event.respondWith(resp)
        }

        return event.respondWith(new Response("File not found", { status: 404 }))
    }
})
