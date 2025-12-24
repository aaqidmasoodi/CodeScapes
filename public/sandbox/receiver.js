/**
 * Sandbox Receiver
 * Runs inside the Iframe on the isolated domain.
 * 1. Listening for "INIT" from Parent
 * 2. Registers Service Worker
 * 3. Sends "READY" to Parent
 * 4. Receives Files -> Hydrates SW
 * 5. Redirects to /run/<id>/index.html
 */

// DEBUG: Set to false for production builds (Vercel)
const DEBUG = true
const log = (...args) => DEBUG && console.log(...args)

const PARENT_ORIGIN = "*" // Should be strict in production

async function init() {
  log("[Receiver] Booting...")

  if (!("serviceWorker" in navigator)) {
    console.error("[Receiver] Service Worker not supported")
    return
  }

  // 1. Register SW
  // We register it at the root of the sandbox path
  try {
    const reg = await navigator.serviceWorker.register("./sw.js", {
      scope: "./",
    })

    await navigator.serviceWorker.ready
    log("[Receiver] SW Ready")

    // 2. Notify Parent we are alive
    window.parent.postMessage({ type: "SANDBOX_READY" }, PARENT_ORIGIN)
  } catch (e) {
    console.error("[Receiver] SW Failed", e)
    window.parent.postMessage({ type: "SANDBOX_ERROR", error: e.message }, PARENT_ORIGIN)
  }
}

// 3. Listen for Handshake
window.addEventListener("message", async (event) => {
  // Validation (TODO: Strict origin check)
  if (!event.data) return

  if (event.data.type === "COMPILE_FILES") {
    const { scapeId, files } = event.data.payload
    log(`[Receiver] Compiling ${scapeId}...`)

    // 4. Send to SW
    const sw = navigator.serviceWorker.controller
    if (!sw) {
      console.error("[Receiver] No SW controller found. Reloading...")
      window.location.reload()
      return
    }

    const channel = new MessageChannel()
    channel.port1.onmessage = (e) => {
      if (e.data.type === "ACK") {
        log("[Receiver] Hydration Complete. Redirecting...")
        // 5. Redirect to Intercepted URL
        window.location.replace(`./run/${scapeId}/index.html`)
      }
    }

    sw.postMessage(
      {
        type: "HYDRATE",
        payload: { scapeId, files },
      },
      [channel.port2]
    )
  }
})

init()
