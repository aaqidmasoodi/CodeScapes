import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Register Main Service Worker for Python Input Interception
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(
    (registration) => {
      console.log("Main SW registered: ", registration.scope)
      registration.update() // Force update check
    },
    (err) => {
      console.error("Main SW registration failed: ", err)
    }
  )
}
