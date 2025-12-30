import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { debug } from "@/lib/debug"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// =============================================================================
// SERVICE WORKER REGISTRATION WITH VERSION CHECK
// =============================================================================

/**
 * EXPECTED_SW_VERSION: Must match SW_VERSION in public/sw.js
 * When you deploy, update BOTH this value and sw.js
 */
const EXPECTED_SW_VERSION = "2024.12.25.1"

/**
 * Register Service Worker with version checking and force-update capability
 */
async function registerServiceWorker() {
  // Skip SW registration on file:// protocol (Electron)
  if (window.location.protocol === "file:") {
    debug.log("Skipping SW registration in Electron (file:// protocol)")
    return
  }

  if (!("serviceWorker" in navigator)) {
    debug.log("Service Workers not supported")
    return
  }

  try {
    // First, check if there's an existing registration
    const existingReg = await navigator.serviceWorker.getRegistration("/")

    if (existingReg?.active) {
      // Query the existing SW's version
      const version = await getSWVersion(existingReg.active)

      if (version && version !== EXPECTED_SW_VERSION) {
        debug.log(`SW version mismatch: have ${version}, need ${EXPECTED_SW_VERSION}`)

        // Force the new SW to take over
        existingReg.active.postMessage({ type: "FORCE_UNREGISTER" })

        // Wait a moment for unregistration
        await new Promise((r) => setTimeout(r, 100))

        // Unregister explicitly as backup
        await existingReg.unregister()
        debug.log("Old SW unregistered, refreshing...")

        // Reload to get fresh registration
        window.location.reload()
        return
      }
    }

    // Register (or re-register) the SW
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
    debug.log("SW registered:", registration.scope)

    // Force update check
    registration.update()

    // Handle waiting SW (new version available)
    if (registration.waiting) {
      debug.log("New SW waiting, triggering activation")
      registration.waiting.postMessage({ type: "SKIP_WAITING" })
    }

    // Listen for new SW installations
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          debug.log("New SW installed and waiting")
          // The useAppStatus hook will detect this and show update button
        }
      })
    })
  } catch (err) {
    console.error("SW registration failed:", err)
  }
}

/**
 * Query the Service Worker's version via MessageChannel
 */
function getSWVersion(sw: ServiceWorker): Promise<string | null> {
  return new Promise((resolve) => {
    const channel = new MessageChannel()

    // Timeout after 2 seconds
    const timeout = setTimeout(() => {
      resolve(null)
    }, 2000)

    channel.port1.onmessage = (event) => {
      clearTimeout(timeout)
      resolve(event.data?.version || null)
    }

    sw.postMessage({ type: "GET_VERSION" }, [channel.port2])
  })
}

// Start registration
registerServiceWorker()
