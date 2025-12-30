import { app, BrowserWindow, shell, ipcMain } from "electron"
import path from "path"
import http from "http"
import fs from "fs"

// --- Embedded Sandbox Server for Offline Support ---
const SANDBOX_PORT = 3003
let sandboxServer: http.Server | null = null

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
}

function startSandboxServer() {
  // In packaged app, sandbox files are in resources/app.asar/public/sandbox
  // In dev, they're in public/sandbox
  const sandboxDir = app.isPackaged
    ? path.join(process.resourcesPath, "app.asar", "public", "sandbox")
    : path.join(__dirname, "..", "public", "sandbox")

  sandboxServer = http.createServer((req, res) => {
    // CORS Headers
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin")
    res.setHeader("Cache-Control", "no-store")

    if (req.method === "OPTIONS") {
      res.writeHead(204)
      res.end()
      return
    }

    let safePath = (req.url || "/").split("?")[0]
    if (safePath === "/") safePath = "/bootloader.html"

    const filePath = path.join(sandboxDir, safePath)

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404)
        res.end("Not found")
        return
      }

      const ext = path.extname(filePath).toLowerCase()
      const contentType = MIME_TYPES[ext] || "application/octet-stream"

      res.writeHead(200, { "Content-Type": contentType })
      res.end(content)
    })
  })

  sandboxServer.listen(SANDBOX_PORT, "127.0.0.1", () => {
    console.log(`[Electron] Sandbox server running at http://127.0.0.1:${SANDBOX_PORT}`)
  })
}

// --- Main Window ---
let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    title: "CodeScape",
    icon: path.join(__dirname, "..", "build", "icon.png"),
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  })

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString())
    // Send sandbox port to renderer
    win?.webContents.send("sandbox-port", SANDBOX_PORT)
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"))
  }

  // External links open in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url)
    return { action: "deny" }
  })
}

// --- IPC Handler for sandbox port ---
ipcMain.handle("get-sandbox-port", () => SANDBOX_PORT)

// --- App Lifecycle ---
app.on("window-all-closed", () => {
  sandboxServer?.close()
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  startSandboxServer()
  createWindow()
})
