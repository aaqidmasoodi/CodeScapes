/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/no-explicit-any */

// Pyodide Worker

// Import turtle shim as raw string for injection
import turtleShimCode from "./turtle_shim.py?raw"

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<any>
  loadPackage: (packages: string[]) => Promise<void>
  setInterruptBuffer: (buffer: SharedArrayBuffer) => void
  FS: {
    writeFile: (path: string, content: string | Uint8Array, options?: any) => void
    mkdir: (path: string) => void
    readdir: (path: string) => string[]
    stat: (path: string) => { mode: number; size: number }
    readFile: (path: string, options?: { encoding?: "utf8" | "binary" }) => any
    isDir: (mode: number) => boolean
    isFile: (mode: number) => boolean
    unlink: (path: string) => void
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
      const { loadPyodide: pyodideLoader } =
        await import("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.mjs")

      pyodide = (await pyodideLoader({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
      })) as unknown as PyodideInterface

      if (!pyodide) throw new Error("Failed to initialize Pyodide")

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

      postMessage({ type: "STATUS", payload: "Loading libraries..." })
      try {
        await pyodide.loadPackage(["micropip"])
      } catch {
        // Fallback or retry
        await pyodide.loadPackage(["micropip"])
      }

      // Install and patch pyodide-http to enable 'requests'
      await pyodide.runPythonAsync(`
        import micropip
        await micropip.install('pyodide-http')
        import pyodide_http
        pyodide_http.patch_all()
      `)

      // Verify imports (optional but good for stability)
      await pyodide.runPythonAsync(`
        import sys
        import importlib
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
    if (payload.sharedBuffer) {
      // Legacy SAB support (ignored for now)
    }

    const runInit = async () => {
      const py = await loadPyodide()

      if (payload.sharedBuffer && py) {
        py.setInterruptBuffer(payload.sharedBuffer)
        console.log("[Worker] Interrupt Buffer Attached")
      }

      // Define blocking input function in JS
      // Using self explicitly to attach to global scope for Pyodide access
      ;(self as any).wait_for_input = (prompt: string) => {
        const id = Math.random().toString(36).substring(7)

        // Notify Main Thread (React) to show input UI
        postMessage({
          type: "INPUT_REQUEST",
          payload: { prompt, id },
        })

        while (true) {
          // Check for timeout (e.g. 1 hour? Input might take long)
          // But if we are continually hitting the server (Bypass loop), we should throttle.

          const xhr = new XMLHttpRequest()
          xhr.open("GET", `/_wait_input?id=${id}`, false) // false = synchronous
          try {
            xhr.send(null)

            if (xhr.status === 200) {
              const text = xhr.responseText

              // 1. Sanity Check for Safari/Server Fallback
              // If we get the index.html content, it's a bypass. Retry.
              const isHtml =
                text.trim().toLowerCase().startsWith("<!doctype html") ||
                text.trim().toLowerCase().startsWith("<html")

              if (!isHtml) {
                return text
              }

              // BYPASS DETECTED
              console.warn("[Worker] Input XHR hit server fallback (HTML detected). Retrying...")
            } else {
              console.warn(`[Worker] Input XHR failed with status ${xhr.status}. Retrying...`)
            }

            // Busy-Wait Sleep (Small delay to allow SW to potentially claim or server to breathe)
            const sleepStart = Date.now()
            while (Date.now() - sleepStart < 100) {
              // spin
            }
          } catch (e) {
            console.error("[Worker] XHR Error", e)
            return ""
          }
        }
      }

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
      postMessage({ type: "DidRun" })
    }

    readyPromise = readyPromise.then(runInit)
    await readyPromise
  }

  if (type === "INSTALL") {
    const runInstall = async () => {
      const py = await loadPyodide()

      let packages: string[] = []
      let options: any = {}

      // Robust Payload Parsing
      let parsedPayload = payload
      if (typeof payload === "string" && payload.trim().startsWith("{")) {
        try {
          parsedPayload = JSON.parse(payload)
        } catch {
          // treat as raw string
        }
      }

      if (typeof parsedPayload === "string") {
        packages = [parsedPayload]
      } else if (typeof parsedPayload === "object") {
        packages = parsedPayload.packages || []
        options = parsedPayload.options || {}
      }

      if (packages.length === 0) {
        postMessage({ type: "ERROR", payload: "No packages specified for install" })
        return
      }

      const packageListStr = packages.join(", ")

      try {
        postMessage({ type: "STATUS", payload: `Installing ${packageListStr}...` })

        // Pass options to micropip?
        // micropip.install(requirements, keep_going=False, deps=True, credentials=None, pre=False, index_urls=None, verbose=False)
        // We will construct the kwargs string based on options

        const kwargs: string[] = []
        if (options.noDeps) kwargs.push("deps=False")
        if (options.keepGoing) kwargs.push("keep_going=True")
        if (options.verbose) kwargs.push("verbose=True")

        const kwargsStr = kwargs.length > 0 ? `, ${kwargs.join(", ")}` : ""
        const requirementsJson = JSON.stringify(packages)

        await py.runPythonAsync(`
            import micropip
            await micropip.install(${requirementsJson}${kwargsStr})
            `)

        // Send "Ready" status via onProgress (STATUS) before final success signal?
        // Or just let Success signal handle it.
        // Note: The STATUS handler in PythonRunner broadcasts to all active installs, so valid.

        // IMPORTANT: We must send back the ORIGINAL 'payload' string as the ID
        // so PythonRunner can find the Promise in its map.
        postMessage({ type: "INSTALL_SUCCESS", payload: payload })
      } catch (err: any) {
        postMessage({
          type: "ERROR",
          payload: `Failed to install ${packageListStr}: ${err.message}`,
        })
        postMessage({
          type: "INSTALL_ERROR",
          payload: { pkg: payload, error: err.message },
        })
      }
    }
    readyPromise = readyPromise.then(runInstall)
    await readyPromise
  }

  if (type === "LIST_PACKAGES") {
    const py = await loadPyodide()
    try {
      const packagesJson = await py.runPythonAsync(`
        import importlib.metadata
        import json
        
        pkgs = []
        try:
            for dist in importlib.metadata.distributions():
                name = dist.metadata["Name"]
                version = dist.version
                if name:
                    pkgs.append({"name": name, "version": version})
        except Exception as e:
             print(f"DEBUG: pip list failed: {e}")
        
        json.dumps(pkgs)
      `)
      postMessage({ type: "PACKAGES_LIST", payload: packagesJson })
    } catch (e: any) {
      postMessage({ type: "ERROR", payload: `Failed to list packages: ${e.message}` })
    }
  }

  if (type === "SOCKET_EVENT") {
    // Dispatch event to Python codescapes module
    // We assume the user has run code (RUN) which initialized the 'codescapes' module.
    // If not, we just ignore it.
    const runDispatch = async () => {
      const py = await loadPyodide()
      try {
        const { event, data } = payload
        const dataJson = JSON.stringify(data)
        // We use triple quotes for safety, but dataJson is JSON escaped so safe.
        // But what if data contains triple quotes? JSON.stringify handles escaping quotes.
        // Wait, passing as string literal in python code?
        // Better: inject variable first? No, simple injection:
        // codescapes.socket._dispatch('event', json.loads('...'))

        await py.runPythonAsync(`
          try:
            import codescapes
            import json
            codescapes.socket._dispatch('${event}', json.loads('''${dataJson}'''))
          except Exception:
            pass
        `)
      } catch {
        // Ignore errors during dispatch (e.g. module not loaded yet)
      }
    }
    // We fire and forget, don't await on readyPromise main chain?
    // Actually, we must ensure pyodide is loaded.
    readyPromise.then(runDispatch)
  }

  if (type === "RUN") {
    let py: PyodideInterface | null = null
    try {
      await readyPromise
      const { files, entryPoint, socketId } = payload
      py = await loadPyodide()

      if (!files || !Array.isArray(files)) {
        throw new Error("No files provided")
      }

      // 0. Reset Environment
      await py.runPythonAsync(`
        for name in list(globals().keys()):
          if name not in ['__name__', '__doc__', '__package__', '__loader__', '__spec__', '__annotations__', '__builtins__', 'micropip']:
            del globals()[name]
            
        # 0.1 Aggressive Module Cleanup (Fixes Hot Reload)
        # We must remove user modules from sys.modules so they are re-imported from disk.
        import sys
        import os
        import importlib
        
        to_delete = []
        # Get current working directory (virtual fs root)
        cwd = os.getcwd()
        
        # Modules to preserve (internal shims that should persist but reset state)
        preserve_modules = {'turtle'}
        
        # Iterate over all loaded modules
        for name, module in list(sys.modules.items()):
            # Check if the module has a file path
            if hasattr(module, '__file__') and module.__file__:
                fpath = module.__file__
                
                # Robust User Module Detection:
                # If it's NOT in the system library path (/lib), it's user code.
                # Pyodide places stdlib and site-packages in /lib.
                # User code is in /home/pyodide or .
                
                if not fpath.startswith('/lib') and name not in preserve_modules:
                   to_delete.append(name)
                   
        for name in to_delete:
            del sys.modules[name]
        
        # Reset turtle module state if it exists
        if 'turtle' in sys.modules:
            turtle_mod = sys.modules['turtle']
            # Reset singletons for a fresh start
            turtle_mod._default_turtle = None
            if hasattr(turtle_mod, '_ScreenClass'):
                turtle_mod._ScreenClass._instance = None
            # Reset turtle ID counter
            if hasattr(turtle_mod, 'Turtle'):
                turtle_mod.Turtle._id_counter = 0
                turtle_mod.Turtle._all_turtles = []
            
        importlib.invalidate_caches()

        # 0.2 State Hardening (Env, Logs, Figures, Argv)
        # Snapshotting env vars is hard because we want to keep what WE injected, but clear what USER added.
        # Simple strategy: We re-inject secrets every run (see 0.6), so strict clearing is safe IF we do it before injection.
        # But wait, 0.6 runs LATER. So we can just clear os.environ here? 
        # CAUTION: Pyodide needs some env vars? Generally safe to reset to basic defaults?
        # Better approach: We don't track 'default' env yet. 
        # Safer: Just handle Logging and Plots for now to avoid breaking Pyodide internals.
        # Pyodide's os.environ is minimal.
        
        # Reset Logging
        import logging
        try:
            # Clear root logger handlers (prevent duplicates)
            logging.getLogger().handlers.clear()
        except: pass
        
        # Reset Matplotlib
        try:
             import matplotlib.pyplot as plt
             plt.close('all')
        except: pass
        
        # Reset Sys Argv (Scripts might mutate it)
        sys.argv = ['']
      `)

      // 0.5 Patch Input & Inject CodeScapes Socket
      await py.runPythonAsync(`
        import builtins
        import js
        import sys
        import json
        
        # --- Unbuffered Stdout ---
        import sys
        import json
        class UnbufferedStdout:
            def write(self, text):
                if text:
                    js.postMessage(js.JSON.parse(json.dumps({
                        'type': 'OUTPUT',
                        'payload': text
                    })))
            def flush(self):
                pass
        
        sys.stdout = UnbufferedStdout()
        
        # --- Patch Input ---
        def _input(prompt=""):
            if prompt:
                print(prompt, end="", flush=True) 
            return js.wait_for_input("")
        builtins.input = _input
        
        # --- Inject CodeScapes Module ---
        import types
        
        class CodeScapesSocket:
            def __init__(self, id=None):
                self.id = id
                self._handlers = {}
                
            def on(self, event, handler):
                if event not in self._handlers:
                    self._handlers[event] = []
                self._handlers[event].append(handler)
                
            def emit(self, event, data=None):
                # Serialize aggressively to JSON string for passing to JS
                # This avoids DataCloneError (PyProxy not cloneable)
                try:
                    payload = json.dumps({
                        'type': 'SOCKET_EMIT',
                        'payload': {
                            'event': event,
                            'data': data
                        }
                    })
                    js.postMessage(js.JSON.parse(payload))
                except Exception as e:
                    print(f"Socket Emit Error: {e}")

            def _dispatch(self, event, data):
                if event in self._handlers:
                    for handler in self._handlers[event]:
                        try:
                            # 2-arg check? No, just pass data.
                            handler(data)
                        except Exception as e:
                            print(f"Error in socket handler for '{event}': {e}")

        # Create module
        mod = types.ModuleType("codescapes")
        mod.socket = CodeScapesSocket('${socketId || ""}')
        sys.modules["codescapes"] = mod
      `)

      // 0.6 Inject Secrets (Environment Variables)
      if (payload.env) {
        // Safe JSON injection via triple-quoted string
        const envJson = JSON.stringify(payload.env)
        await py.runPythonAsync(`
          import os
          import json
          try:
            _env_data = json.loads('''${envJson}''')
            os.environ.update(_env_data)
          except Exception as e:
            print(f"Failed to inject secrets: {e}")
        `)
      }

      // 1. Clean up Virtual FS (Remove old user files)
      // Safer and Easier: Use Python to clean up the current directory
      // This handles recursion and permissions cleanly and avoids missing definitions in PyodideInterface
      await py.runPythonAsync(`
        import os
        import shutil
        
        # Keep internal pyodide stuff if any, generally safe to wipe .
        for item in os.listdir('.'):
            if item in ['.', '..']: continue
            try:
                if os.path.isfile(item) or os.path.islink(item):
                    os.unlink(item)
                elif os.path.isdir(item):
                    shutil.rmtree(item)
            except Exception as e:
                pass
      `)

      // 2. Write files to Virtual FS
      postMessage({ type: "STATUS", payload: "Writing files..." })

      // Sort files so folders/parents come first if possible, though mkdir -p handles it.
      // Actually, standard naive approach works if we differentiate folders.

      for (const file of files) {
        if (file.language === "folder") {
          try {
            py.FS.mkdir(file.name)
          } catch {
            // Ignore if exists
          }
          continue
        }

        // It's a file
        const parts = file.name.split("/")
        if (parts.length > 1) {
          let currentPath = ""
          for (let i = 0; i < parts.length - 1; i++) {
            currentPath += (i === 0 ? "" : "/") + parts[i]
            try {
              py.FS.mkdir(currentPath)
            } catch {
              // Ignore
            }
          }
        }

        let contentToWrite = file.content
        if (contentToWrite instanceof ArrayBuffer) {
          contentToWrite = new Uint8Array(contentToWrite)
        }

        // Ensure we don't overwrite a directory with a file of same name (shouldn't happen with valid tree)
        try {
          py.FS.writeFile(file.name, contentToWrite)
        } catch (err: any) {
          // If 'FS error', it might be because a directory exists at this path?
          // Or parent missing?
          // We already tried to create parents.
          console.warn(`Failed to write ${file.name}: ${err.message}`)
          // Don't throw, let other files try to write
        }
      }

      // 2. Run Entry Point
      postMessage({ type: "STATUS", payload: `Running ${entryPoint}...` })
      const mainFile = files.find((f: any) => f.name === entryPoint)
      if (!mainFile) throw new Error(`Entry point ${entryPoint} not found`)

      // Preamble for Matplotlib
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
        import js
        js.postMessage(js.Object.fromEntries([['type', 'IMAGE'], ['payload', img_str]]))
        plt.close()

    plt.show = show_hook
except ImportError:
    pass

try:
    import urllib3
    from urllib3.exceptions import InsecureRequestWarning
    urllib3.disable_warnings(InsecureRequestWarning)
except ImportError:
    pass
`
      await py.runPythonAsync(preamble)

      // Inject turtle graphics shim
      // Write to /lib/python/ so it's hidden from user's file explorer
      // but still importable via Python's sys.path
      try {
        // Ensure the directory exists
        try {
          py.FS.mkdir("/lib")
        } catch {
          /* already exists */
        }
        try {
          py.FS.mkdir("/lib/python")
        } catch {
          /* already exists */
        }
        py.FS.writeFile("/lib/python/turtle.py", turtleShimCode)
        // Add to Python path if not already there
        await py.runPythonAsync(`
import sys
if '/lib/python' not in sys.path:
    sys.path.insert(0, '/lib/python')
`)
        console.log("[Worker] Turtle shim written to /lib/python/ (hidden)")
      } catch (e) {
        console.warn("[Worker] Failed to write turtle shim:", e)
      }

      // Execute User Code
      postMessage({ type: "STATUS", payload: "Running code..." })
      const result = await py.runPythonAsync(mainFile.content)

      // Rich Output Check
      if (result && typeof result === "object") {
        try {
          if (result._repr_html_) {
            const html = result._repr_html_()
            postMessage({ type: "PREVIEW_HTML", payload: html })
          }
        } catch (e) {
          console.warn("Failed to extract rich repr", e)
        } finally {
          result.destroy?.()
        }
      }
    } catch (error: any) {
      if (error.name === "PythonError" && error.message.includes("KeyboardInterrupt")) {
        console.log("[Worker] Script interrupted by user")
      } else {
        postMessage({ type: "ERROR", payload: error.message || String(error) })
      }
    } finally {
      // 3. Sync Filesystem Back to Main Thread
      syncFileSystem()
      postMessage({ type: "DidRun" })
    }
  }
}

/**
 * Scans the virtual filesystem and sends updates to the main thread.
 * USES Synchronous FS API (Does not require Python instance to be free)
 */
function syncFileSystem() {
  if (!pyodide || !pyodide.FS) return

  try {
    const files: any[] = []
    const SKIP_DIRS = new Set([
      ".",
      "..",
      "lib",
      "tmp",
      "home",
      "dev",
      "proc",
      "sys",
      "__pycache__",
    ])

    function scan(path: string) {
      try {
        const items = pyodide!.FS.readdir(path)
        for (const item of items) {
          if (path === "." && SKIP_DIRS.has(item)) continue
          if (item.startsWith(".")) continue

          const fullPath = path === "." ? item : `${path}/${item}`
          const stat = pyodide!.FS.stat(fullPath)

          if (pyodide!.FS.isDir(stat.mode)) {
            scan(fullPath)
          } else {
            try {
              // Read as Uint8Array (binary)
              const content = pyodide!.FS.readFile(fullPath, { encoding: "binary" })

              // Try to decode as UTF-8
              try {
                const decoder = new TextDecoder("utf-8", { fatal: true })
                const text = decoder.decode(content)
                files.push({
                  name: fullPath,
                  content: text,
                  is_binary: false,
                })
              } catch {
                // Binary fallback (Base64)
                let binary = ""
                const bytes = content
                const len = bytes.byteLength
                for (let i = 0; i < len; i++) {
                  binary += String.fromCharCode(bytes[i])
                }
                const b64 = btoa(binary)
                files.push({
                  name: fullPath,
                  content: b64,
                  encoding: "base64",
                  is_binary: true,
                })
              }
            } catch (err: any) {
              console.warn(`[Worker] Failed to sync file ${fullPath}: ${err.message}`)
            }
          }
        }
      } catch (err: any) {
        console.warn(`[Worker] Failed to scan path ${path}: ${err.message}`)
      }
    }

    scan(".")
    postMessage({ type: "FS_UPDATE", payload: files })
  } catch (e) {
    console.warn("[Worker] FS Sync failed", e)
  }
}

// Expose sync function to JS global for Python access
;(self as any).sync_fs = () => {
  // Fire and forget sync
  syncFileSystem()
}

export {}
