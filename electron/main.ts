import { app, BrowserWindow, shell } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─ dist
// │ ├─ electron
// │ │ ├─ main.js
// │ │ └─ preload.js
// │ └─ index.html
//
// process.env.DIST
// process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null = null

function createWindow() {
    win = new BrowserWindow({
        title: 'CodeScape',
        icon: path.join(process.env.VITE_PUBLIC || '', 'favicon.ico'),
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true, // We will need to adjust this if we want to read local files directly, but we are using Dexie for now
        },
    })

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL)
        win.webContents.openDevTools()
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(__dirname, '../index.html'))
    }

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) shell.openExternal(url)
        return { action: 'deny' }
    })
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(createWindow)
