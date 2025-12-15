/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/no-explicit-any */
// Pyodide Worker
// Handles Python execution in a separate thread

// Import scripts is used for loading Pyodide from CDN
// Types not strictly available in Worker scope without generic lib

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<any>
  loadPackage: (packages: string[]) => Promise<void>
  FS: {
    writeFile: (path: string, content: string | Uint8Array, options?: any) => void
    mkdir: (path: string) => void
    readdir: (path: string) => string[]
  }
  setStdout: (options: { batched: (msg: string) => void }) => void
  setStderr: (options: { batched: (msg: string) => void }) => void
  globals: any
}

let pyodide: PyodideInterface | null = null
let loadPromise: Promise<PyodideInterface> | null = null

const loadPyodide = async () => {
  if (pyodide) return pyodide
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    postMessage({ type: "STATUS", payload: "Loading Pyodide..." })

    // Load from CDN
    // Using importScripts because this is a classic worker context usually,
    // but Vite creates Module Workers. We might need a slightly different approach for Vite?
    // Actually, Vite supports explicit worker imports.
    // But Pyodide itself is best loaded via CDN to capture the WASM correctly.

    // We'll trust the global `loadPyodide` function becomes available after importing the script.
    // In a module worker, we might need to import it.
    // Let's try flexible loading.

    try {
      // Dynamic import for module worker support
      const { loadPyodide: pyodideLoader } =
        // @ts-expect-error: Importing from CDN is not supported by TS locally
        await import("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.mjs")

      pyodide = await pyodideLoader({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
      })

      if (!pyodide) throw new Error("Failed to initialize Pyodide")

      // Setup I/O
      pyodide.setStdout({
        batched: (msg: string) => {
          postMessage({ type: "OUTPUT", payload: msg })
        },
      })
      pyodide.setStderr({
        batched: (msg: string) => {
          postMessage({ type: "ERROR", payload: msg })
        },
      })

      // Load Micropip and Pre-load Matplotlib
      postMessage({ type: "STATUS", payload: "Loading libraries..." })
      try {
        await pyodide.loadPackage(["micropip"])
      } catch {
        // Retry?
        await pyodide.loadPackage(["micropip"])
      }

      // Verify micropip loading
      await pyodide.runPythonAsync(`
      import sys
      import importlib
      
      # Retry loop for micropip import
      import time
      for i in range(5):
          try:
              importlib.invalidate_caches()
              import micropip
              break
          except ImportError:
              if i == 4: raise
              time.sleep(0.2)
      
      await micropip.install("matplotlib")
    `)

      postMessage({ type: "STATUS", payload: "Ready" })
      return pyodide
    } catch (error: any) {
      postMessage({ type: "ERROR", payload: `Failed to load Pyodide: ${error.message}` })
      throw error
    }
  })()

  return loadPromise
}

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data

  if (type === "INIT") {
    await loadPyodide()
  }

  if (type === "RUN") {
    const { files, entryPoint } = payload
    const py = await loadPyodide()

    try {
      if (!files || !Array.isArray(files)) {
        throw new Error("No files provided")
      }

      // 1. Write files to Virtual FS
      postMessage({ type: "STATUS", payload: "Writing files..." })

      // Reset FS? (Might be complex, for now we overwrite)

      for (const file of files) {
        // Simple directory creation (flat for now, support nested later if needed logic exists)
        // Check if path has directories
        const parts = file.name.split("/")
        if (parts.length > 1) {
          // Create directories recursively
          let currentPath = ""
          for (let i = 0; i < parts.length - 1; i++) {
            currentPath += (i === 0 ? "" : "/") + parts[i]
            try {
              py.FS.mkdir(currentPath)
            } catch {
              // Ignore if exists
            }
          }
        }

        py.FS.writeFile(file.name, file.content)
      }

      // 2. Run Entry Point
      postMessage({ type: "STATUS", payload: `Running ${entryPoint}...` })

      const mainFile = files.find((f: any) => f.name === entryPoint)
      if (!mainFile) {
        throw new Error(`Entry point ${entryPoint} not found`)
      }

      // Preamble: Patch Matplotlib show()
      const preamble = `
import os
import base64
import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def show_hook(*args, **kwargs):
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    # Send image to JS
    import js
    js.postMessage(js.Object.fromEntries([['type', 'IMAGE'], ['payload', img_str]]))
    plt.close()

plt.show = show_hook
`
      await py.runPythonAsync(preamble)

      // Execute User Code
      // We use runPythonAsync to allow top-level await
      await py.runPythonAsync(mainFile.content)

      postMessage({ type: "DidRun" })
    } catch (error: any) {
      // Python Error
      postMessage({ type: "ERROR", payload: error.message || String(error) })
    }
  }
}

export {}
