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

const loadPyodide = async (): Promise<PyodideInterface> => {
  if (pyodide) return pyodide
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    postMessage({ type: "STATUS", payload: "Loading Pyodide..." })

    try {
      // Dynamic import for module worker support
      // Using declaration in vite-env.d.ts to satisfy TS
      const { loadPyodide: pyodideLoader } =
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

      // Load Micropip
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

let readyPromise: Promise<void> = Promise.resolve()

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data

  if (type === "INIT") {
    // We wrap the installation logic in a promise and assign it to readyPromise.
    // We do NOT await it immediately at the top level here to allow the function
    // to return control, but we update the global readyPromise so subsequent
    // messages (like RUN) will wait for this chain.
    const runInit = async () => {
      const py = await loadPyodide()
      // Install initial dependencies
      if (
        payload.dependencies &&
        Array.isArray(payload.dependencies) &&
        payload.dependencies.length > 0
      ) {
        postMessage({
          type: "STATUS",
          payload: `Installing ${payload.dependencies.length} packages...`,
        })
        try {
          await py.runPythonAsync(`
            import micropip
            await micropip.install(${JSON.stringify(payload.dependencies)})
          `)
          postMessage({ type: "STATUS", payload: "Packages installed" })
        } catch (err: any) {
          postMessage({
            type: "ERROR",
            payload: `Failed to install dependencies: ${err.message}`,
          })
        }
      }
      postMessage({ type: "DidRun" }) // Signal ready
    }

    // Chain to ensure order if multiple INITs (unlikely but safe)
    readyPromise = readyPromise.then(runInit)
    await readyPromise
  }

  if (type === "INSTALL") {
    const runInstall = async () => {
      const py = await loadPyodide()
      const packageName = payload
      try {
        postMessage({ type: "STATUS", payload: `Installing ${packageName}...` })
        await py.runPythonAsync(`
            import micropip
            await micropip.install("${packageName}")
            `)
        postMessage({ type: "INSTALL_SUCCESS", payload: packageName })
      } catch (err: any) {
        postMessage({ type: "ERROR", payload: `Failed to install ${packageName}: ${err.message}` })
        postMessage({
          type: "INSTALL_ERROR",
          payload: { pkg: packageName, error: err.message },
        })
      }
    }
    // Block subsequent runs on this install too
    readyPromise = readyPromise.then(runInstall)
    await readyPromise
  }

  if (type === "RUN") {
    // Wait for any pending initialization or installation
    await readyPromise

    const { files, entryPoint } = payload
    const py = await loadPyodide()

    try {
      if (!files || !Array.isArray(files)) {
        throw new Error("No files provided")
      }

      // 0. Reset Environment (Clear previous variables)
      // We explicitly keep 'micropip' as it is loaded in INIT and essential for package management.
      // We do NOT need to keep 'sys' or other imports because re-importing them is fast (cached in sys.modules).
      // We keep dunder methods and __builtins__.
      await py.runPythonAsync(`
        for name in list(globals().keys()):
          if name not in ['__name__', '__doc__', '__package__', '__loader__', '__spec__', '__annotations__', '__builtins__', 'micropip']:
            del globals()[name]
      `)

      // 1. Write files to Virtual FS
      postMessage({ type: "STATUS", payload: "Writing files..." })

      for (const file of files) {
        const parts = file.name.split("/")
        if (parts.length > 1) {
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

try:
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
except ImportError:
    pass

# Suppress SSL warnings in browser context (false alarms)
try:
    import urllib3
    from urllib3.exceptions import InsecureRequestWarning
    urllib3.disable_warnings(InsecureRequestWarning)
except ImportError:
    pass
`
      await py.runPythonAsync(preamble)

      // Execute User Code
      // output handling is done via setStdout/setStderr
      // runPythonAsync returns the result of the last expression
      const result = await py.runPythonAsync(mainFile.content)

      // CHECK FOR RICH OUTPUT (Implicit Return)
      if (result && typeof result === "object") {
        try {
          // Check for _repr_html_ method (Jupyter standard)
          // Note: Pyodide proxies have these methods if the python object has them
          if (result._repr_html_) {
            const html = result._repr_html_()
            postMessage({ type: "PREVIEW_HTML", payload: html })
          }
        } catch (e) {
          console.warn("Failed to extract rich repr", e)
        } finally {
          // Important: Destroy the proxy to free memory
          result.destroy?.()
        }
      }

      postMessage({ type: "DidRun" })
    } catch (error: any) {
      postMessage({ type: "ERROR", payload: error.message || String(error) })
    }
  }
}

export {}
