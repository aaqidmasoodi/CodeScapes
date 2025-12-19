/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/no-explicit-any */

// Pyodide Worker

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
      const { loadPyodide: pyodideLoader } =
        await import("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.mjs")

      pyodide = await pyodideLoader({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
      })

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
    readyPromise = readyPromise.then(runInstall)
    await readyPromise
  }

  if (type === "RUN") {
    let py: PyodideInterface | null = null
    try {
      await readyPromise
      const { files, entryPoint } = payload
      py = await loadPyodide()

      if (!files || !Array.isArray(files)) {
        throw new Error("No files provided")
      }

      // 0. Reset Environment
      await py.runPythonAsync(`
        for name in list(globals().keys()):
          if name not in ['__name__', '__doc__', '__package__', '__loader__', '__spec__', '__annotations__', '__builtins__', 'micropip']:
            del globals()[name]
      `)

      // 0.5 Patch Input
      await py.runPythonAsync(`
        import builtins
        import js
        
        def _input(prompt=""):
            # Do NOT print prompt here to avoid buffering issues.
            # We send it to JS (which includes the ID generation)
            return js.wait_for_input(prompt)
            
        builtins.input = _input
      `)

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

      // Execute User Code
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
      postMessage({ type: "ERROR", payload: error.message || String(error) })
    } finally {
      // 3. Sync Filesystem Back to Main Thread
      if (py) {
        try {
          // Recursive scan of the virtual filesystem
          const filesProxy = await py.runPythonAsync(`
            import os
            import base64
            import js

            def _serialize_fs(path='.'):
                files = []
                # Skip system and hidden directories
                SKIP_DIRS = {'.', '..', 'lib', 'tmp', 'home', 'dev', 'proc', 'sys'}
                
                try:
                    for item in os.listdir(path):
                        if item in SKIP_DIRS and path == '.': continue
                        if item.startswith('.'): continue # Skip hidden files

                        full_path = os.path.join(path, item)
                        
                        if os.path.isdir(full_path):
                            # Recurse
                            files.extend(_serialize_fs(full_path))
                        else:
                            # Read File
                            try:
                                with open(full_path, 'rb') as f:
                                    content = f.read()
                                    # Detect binary? For now treat mostly as text or base64?
                                    # Passing binary to JS via Pyodide is cleaner if we use specific API
                                    # But simplistic approach: Text if valid utf-8, else Base64?
                                    
                                    try:
                                        text_content = content.decode('utf-8')
                                        files.append({
                                            'name': full_path.replace('./', ''),
                                            'content': text_content,
                                            'is_binary': False
                                        })
                                    except UnicodeDecodeError:
                                        # Binary fallback (encode as Base64)
                                        b64_content = base64.b64encode(content).decode('ascii')
                                        files.append({
                                            'name': full_path.replace('./', ''),
                                            'content': b64_content,
                                            'encoding': 'base64'
                                        })
                            except Exception:
                                pass
                except Exception:
                    pass
                return files

            _files = _serialize_fs()
            _files
          `)
          // Convert Python Proxy to JS Object
          // We use the `toJs` method which comes with Pyodide proxies.
          // Map/Dict will be converted to Map by default, we want Object.
          // List will be converted to Array.
          const localFiles = filesProxy.toJs({
            dict_converter: Object.fromEntries,
          })

          // Cleanup proxy
          filesProxy.destroy()

          postMessage({ type: "FS_UPDATE", payload: localFiles })
        } catch (e) {
          console.warn("[Worker] FS Sync failed", e)
        }
      }

      postMessage({ type: "DidRun" })
    }
  }
}

export {}
