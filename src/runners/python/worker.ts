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

      // Define CORS proxy patch function (called after requests is installed)
      await pyodide.runPythonAsync(`
        import js
        
        def _apply_cors_proxy_patch():
            """
            Apply the CORS proxy patch to the requests module.
            Call this after installing 'requests' via pip.
            """
            try:
                import requests
                import js
                from urllib.parse import quote, urlparse
                
                # Check if already patched
                if hasattr(requests.Session, '_cors_proxy_patched'):
                    return
                
                # Store original request method
                _original_request = requests.Session.request
                
                def _proxied_request(self, method, url, **kwargs):
                    parsed = urlparse(str(url))
                    
                    # Only proxy external URLs (http/https with a host)
                    if parsed.scheme in ('http', 'https') and parsed.netloc:
                        # Construct absolute proxy URL using current origin
                        # requests requires a schema (http/https)
                        origin = js.location.origin
                        proxy_url = f"{origin}/api/cors-proxy?url={quote(str(url), safe='')}"
                        return _original_request(self, method, proxy_url, **kwargs)
                    
                    return _original_request(self, method, url, **kwargs)
                
                # Monkey-patch Session.request
                requests.Session.request = _proxied_request
                requests.Session._cors_proxy_patched = True
                
            except ImportError:
                pass  # requests not installed yet, that's fine
        
        def _apply_pil_patch():
            """
            Patch PIL.Image for:
            1. save() - sync filesystem immediately
            2. show() - display in CodeScapes preview pane
            """
            try:
                from PIL import Image
                import io
                import base64
                import json
                
                # --- Patch save() for filesystem sync ---
                if not getattr(Image.Image, '_sync_patched', False):
                    _original_save = Image.Image.save
                    
                    def _synced_save(self, fp, format=None, **params):
                        # Robustness: Auto-convert RGBA/P to RGB if saving as JPEG
                        # This prevents "OSError: cannot write mode RGBA as JPEG"
                        target_format = format
                        if not target_format and isinstance(fp, str):
                            import os
                            ext = os.path.splitext(fp)[1].lower()
                            if ext in ['.jpg', '.jpeg']:
                                target_format = 'JPEG'
                                
                        if str(target_format).upper() == 'JPEG' and self.mode in ('RGBA', 'P'):
                            # Create a converted copy and save that instead
                            converted = self.convert('RGB')
                            result = _original_save(converted, fp, format, **params)
                        else:
                            result = _original_save(self, fp, format, **params)
                            
                        # Trigger filesystem sync via JS
                        try:
                            js.sync_file_system()
                        except:
                            pass
                        return result

                    Image.Image.save = _synced_save
                    Image.Image._sync_patched = True
                
                # --- Patch show() for preview display ---
                if not getattr(Image.Image, '_show_patched', False):
                    
                    def _preview_show(self, title=None, **kwargs):
                        """Display image in CodeScapes preview pane."""
                        try:
                            # Convert to PNG bytes
                            buf = io.BytesIO()
                            
                            # Handle mode conversion for compatibility
                            img_to_save = self
                            if self.mode not in ('RGB', 'RGBA', 'L', '1', 'P', 'LA', 'PA'):
                                img_to_save = self.convert('RGB')
                            
                            img_to_save.save(buf, format='PNG')
                            img_data = base64.b64encode(buf.getvalue()).decode('utf-8')
                            
                            # Post to preview with optional title and metadata
                            payload = {
                                'type': 'PIL_IMAGE',
                                'payload': {
                                    'data': img_data,
                                    'title': title,
                                    'width': self.width,
                                    'height': self.height,
                                    'mode': self.mode
                                }
                            }
                            js.postMessage(js.JSON.parse(json.dumps(payload)))
                        except Exception as e:
                            print(f"[PIL] Failed to show image: {e}")
                    
                    Image.Image.show = _preview_show
                    Image.Image._show_patched = True
                    
            except ImportError:
                pass 

        # Store in builtins so it's accessible from anywhere
        import builtins
        builtins._apply_cors_proxy_patch = _apply_cors_proxy_patch
        builtins._apply_pil_patch = _apply_pil_patch
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

        return (self as any)._xhr_block(id)
      }

      // Generic Blocking Utility (reused by input and system)
      ;(self as any)._xhr_block = (id: string) => {
        while (true) {
          const xhr = new XMLHttpRequest()
          xhr.open("GET", `/_wait_input?id=${id}`, false)
          try {
            xhr.send(null)
            if (xhr.status === 200) {
              const text = xhr.responseText
              // Sanity check for HTML fallback
              if (
                !text.trim().toLowerCase().startsWith("<html") &&
                !text.trim().toLowerCase().startsWith("<!doctype")
              ) {
                return text
              }
            }
            // Busy wait
            const start = Date.now()
            while (Date.now() - start < 100) {
              /* spin */
            }
          } catch {
            // Silent fail - input fallback
            return ""
          }
        }
      }

      // Generic System Command Handler
      ;(self as any).run_system_command = (cmd: string) => {
        const id = Math.random().toString(36).substring(7)

        // Notify Main Thread
        self.postMessage({
          type: "SYSTEM_COMMAND",
          payload: { cmd, id },
        })

        // Block and wait for completion signal
        // The main thread will 'resolve' this ID when the command finishes
        ;(self as any)._xhr_block(id)

        return 0 // os.system returns exit code, assume 0 for success
      }

      // Expose syncFileSystem to global scope for Python
      ;(self as any).sync_file_system = syncFileSystem

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
            # Apply CORS proxy patch if requests was installed
            if hasattr(__builtins__, '_apply_cors_proxy_patch'):
                _apply_cors_proxy_patch()
            # Apply PIL patch if pillow/PIL was installed
            if hasattr(__builtins__, '_apply_pil_patch'):
                _apply_pil_patch()
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
            # Apply CORS proxy patch if requests was installed
            if hasattr(__builtins__, '_apply_cors_proxy_patch'):
                _apply_cors_proxy_patch()
            # Apply PIL patch if pillow/PIL was installed
            if hasattr(__builtins__, '_apply_pil_patch'):
                _apply_pil_patch()
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

  if (type === "AUDIO_PLAY") {
    const handleAudioPlay = async () => {
      const py = await loadPyodide()
      try {
        let data = payload
        if (typeof payload === "string") {
          try {
            data = JSON.parse(payload)
          } catch {
            // If parse fails, assume it's just a filename string? No, spec is strict.
            throw new Error("Invalid payload format")
          }
        }
        const { filename, async: isAsync, files } = data

        // Sync files if provided (legacy check: logic copied from RUN handler)
        if (files && Array.isArray(files)) {
          for (const file of files) {
            // Skip directories passed as files (legacy)
            if (file.language === "folder") {
              try {
                py.FS.mkdir(file.name)
              } catch {
                // Ignore if exists
              }
              continue
            }

            // Ensure parent directories exist
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

            try {
              py.FS.writeFile(file.name, contentToWrite)
            } catch (err: any) {
              console.warn(`[Audio] Failed to write ${file.name}: ${err.message}`)
            }
          }
        }

        // Read file from virtual filesystem
        let audioData: Uint8Array
        try {
          audioData = py.FS.readFile(filename, { encoding: "binary" })
        } catch {
          postMessage({
            type: "AUDIO_ERROR",
            payload: { error: `Cannot read file: ${filename}`, async: isAsync },
          })
          return
        }

        // Convert to base64
        let binary = ""
        const len = audioData.byteLength
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(audioData[i])
        }
        const base64 = btoa(binary)

        // Determine format from extension
        const ext = filename.split(".").pop()?.toLowerCase() || "wav"

        // Send to main thread for playback
        postMessage({
          type: "AUDIO_DATA",
          payload: {
            data: base64,
            format: ext,
            async: isAsync,
            filename,
          },
        })
      } catch (e: any) {
        postMessage({
          type: "AUDIO_ERROR",
          payload: { error: e.message || String(e), async: false },
        })
      }
    }
    readyPromise.then(handleAudioPlay)
  }

  if (type === "WRITE_IMAGE") {
    // Forward to handler for writing image to virtual FS
    const { filename, data } = payload
    const py = await loadPyodide()
    try {
      // Decode base64 to binary
      const binaryString = atob(data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      // Write to virtual filesystem
      py.FS.writeFile(filename, bytes)
      console.log(`[Worker] Wrote image to virtual FS: ${filename}`)
      // Sync to update file explorer
      syncFileSystem()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[Worker] Failed to write image: ${msg}`)
    }
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
        
        # --- CodeScapes Sound Module ---
        import uuid
        import base64
        
        class _SoundInstance:
            """Represents a single sound instance with playback control."""
            def __init__(self, filename, loop=False, volume=1.0):
                self._id = str(uuid.uuid4())[:8]
                self._filename = filename
                self._loop = bool(loop)
                self._volume = max(0.0, min(1.0, float(volume)))
                self._playing = False
            
            def play(self):
                """Start playback. Non-blocking."""
                if self._playing:
                    return self
                # Read file from virtual FS
                try:
                    with open(self._filename, 'rb') as f:
                        data = f.read()
                except FileNotFoundError:
                    raise FileNotFoundError(f"Sound file not found: {self._filename}")
                except Exception as e:
                    raise RuntimeError(f"Failed to read sound file: {e}")
                
                b64_data = base64.b64encode(data).decode('ascii')
                
                # Send to main thread
                payload = json.dumps({
                    'type': 'AUDIO_PLAY',
                    'payload': {
                        'id': self._id,
                        'data': b64_data,
                        'filename': self._filename,
                        'loop': self._loop,
                        'volume': self._volume
                    }
                })
                js.postMessage(js.JSON.parse(payload))
                self._playing = True
                return self
            
            def stop(self):
                """Stop playback."""
                if not self._playing:
                    return
                payload = json.dumps({
                    'type': 'AUDIO_STOP',
                    'payload': {'id': self._id}
                })
                js.postMessage(js.JSON.parse(payload))
                self._playing = False
            
            @property
            def volume(self):
                return self._volume
            
            @volume.setter
            def volume(self, val):
                self._volume = max(0.0, min(1.0, float(val)))
                payload = json.dumps({
                    'type': 'AUDIO_VOLUME',
                    'payload': {'id': self._id, 'volume': self._volume}
                })
                js.postMessage(js.JSON.parse(payload))
            
            @property
            def loop(self):
                return self._loop
            
            @loop.setter
            def loop(self, val):
                self._loop = bool(val)
                # Note: Changing loop on an already-playing sound requires re-send
                # For simplicity, this only affects next play() call
        
        class CodeScapesSound:
            """Non-blocking audio playback for CodeScapes.
            
            Usage:
                from codescapes import sound
                
                # Simple (fire-and-forget)
                sound.play("beep.wav")
                sound.play("music.mp3", loop=True)
                sound.stop_all()
                
                # Controlled
                s = sound.Sound("bgm.mp3")
                s.volume = 0.5
                s.loop = True
                s.play()
                s.stop()
            """
            Sound = _SoundInstance
            
            @staticmethod
            def play(filename, loop=False, volume=1.0):
                """Play a sound file. Returns immediately (non-blocking).
                
                Args:
                    filename: Path to sound file in the scape
                    loop: If True, loop forever
                    volume: 0.0 to 1.0
                    
                Returns:
                    _SoundInstance for further control
                """
                s = _SoundInstance(filename, loop=loop, volume=volume)
                return s.play()
            
            @staticmethod
            def stop_all():
                """Stop all playing sounds."""
                payload = json.dumps({'type': 'AUDIO_STOP_ALL'})
                js.postMessage(js.JSON.parse(payload))
        
        mod.sound = CodeScapesSound()
        sys.modules["codescapes"] = mod

        # --- Shim os.system ---
        import os
        def _system(cmd):
            # Check for background execution &
            if cmd.strip().endswith("&"):
                # If background, we submit but assume success immediately
                # Note: We probably still want to send it to JS to run?
                # Yes, run_system_command handles notification.
                # BUT run_system_command blocks by default.
                # We need to tell JS not to block?
                # Or handle logic here.
                # If we use run_system_command as defined, it BLOCKS.
                # So we must NOT block here if '&' exists.
                
                # Logic:
                # 1. Parse cmd
                # 2. Call JS NON-blocking variant? 
                # OR Modify run_system_command to accept block flag?
                
                # Let's Modify run_system_command logic in python?
                # No, better: Just fire and forget postMessage from Python?
                # We can use js.postMessage directly here for non-blocking cases.
                
                clean_cmd = cmd.strip()[:-1].strip()
                import json
                js.postMessage(js.JSON.parse(json.dumps({
                    'type': 'SYSTEM_COMMAND',
                    'payload': { 'cmd': clean_cmd, 'id': 'background' } 
                })))
                return 0
            
            return js.run_system_command(cmd)

        os.system = _system
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
      // Syncs all files to the editor. The handler in ScapeEditor (handleFileSystemUpdate)
      // filters the update to only ADD new files; existing source files are NOT overwritten.
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

// Handle WRITE_IMAGE message (for turtle.save() and similar)
// This handler is called from PythonRunner when TurtleCanvas sends image data
const handleWriteImageMessage = async (payload: { filename: string; data: string }) => {
  const py = await loadPyodide()
  try {
    const { filename, data } = payload
    // Decode base64 to binary
    const binaryString = atob(data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    // Write to virtual filesystem
    py.FS.writeFile(filename, bytes)
    console.log(`[Worker] Wrote image to virtual FS: ${filename}`)
    // Sync to update file explorer
    syncFileSystem()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[Worker] Failed to write image: ${msg}`)
  }
}

// Expose to message handler
;(self as unknown as { handleWriteImage: typeof handleWriteImageMessage }).handleWriteImage =
  handleWriteImageMessage

// Expose sync function to JS global for Python access
;(self as any).sync_fs = () => {
  // Fire and forget sync
  syncFileSystem()
}

export {}
