import { useState, useRef, forwardRef, useImperativeHandle, memo, useMemo, useEffect } from "react"
import { MonitorPlay, PanelRightClose } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ScapeFile } from "@/types/file"
import type { ScapeRunnerHandle } from "@/runners/types"
import { usePreviewBridge } from "@/hooks/usePreviewBridge"

// --- THE INVISIBLE ENGINE (Phase 2 Placeholder) ---
const HARNESS_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>FlowScape Runtime</title>
    <style>
        body { margin: 0; padding: 0; overflow: hidden; background: #000; }
        canvas { display: block; }
    </style>
    <!-- p5.js from CDN (Future: Bundle this or serve locally) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
    <script src="./engine.js"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>
`

const ENGINE_JS = `
// FlowScape Engine v1.0 "Multi-Sprite"
console.log("[FlowScape] Engine Booting...");

// --- CORE CLASSES ---

class Scheduler {
    constructor() {
        this.threads = []; // Active generator functions { iterator, context, waitingUntil }
        this.dt = 0;
    }

    // Add a script (generator) to the scheduler
    start(generatorFn, context) {
        // console.log("[FlowScape] Scheduler: Starting New Thread for", context.name);
        if (!generatorFn) return;
        const iterator = generatorFn(context);
        this.threads.push({ iterator, context, waitingUntil: 0 });
    }
    
    stopAllForTarget(target) {
        this.threads = this.threads.filter(t => t.context !== target);
    }

    stopAll() {
        if (this.threads.length > 0) console.log("[FlowScape] Scheduler: Stopping All Threads");
        this.threads = [];
    }

    tick(dt) {
        this.dt = dt;
        const now = Date.now();
        const activeThreads = [];

        for (const thread of this.threads) {
            // Check wait condition
            if (thread.waitingUntil > now) {
                activeThreads.push(thread);
                continue;
            }

            // Step the generator
            // We pass the runtime API as the yield return value if needed, 
            // but usually blocks just call methods on 'sprite'.
            const result = thread.iterator.next();
            
            if (!result.done) {
                // If yielded a number, treat as Wait(ms)
                if (typeof result.value === 'number') {
                    // console.log("Waiting", result.value);
                    thread.waitingUntil = now + (result.value * 1000);
                }
                activeThreads.push(thread);
            }
        }
        this.threads = activeThreads;
    }
}

class Runtime {
    constructor(p) {
        this.p = p;
        this.targets = [];
        this.scheduler = new Scheduler();
        window.runtime = this; // Expose for debug
    }
    
    setBackdrop(nameOrIndex) {
        const stage = this.targets.find(t => t.isStage);
        if (!stage) return;
        
        // Find costume by name
        let index = stage.costumes.findIndex(c => c.name === nameOrIndex);
        
        // Or by index if number
        if (index === -1 && !isNaN(nameOrIndex)) {
            index = Number(nameOrIndex);
        }
        
        if (index >= 0 && index < stage.costumes.length) {
            stage.currentCostume = index;
        }
    }

    loadProject(projectData) {
        // console.log("[FlowScape] Hot-Loading Project:", projectData);
        
        const newTargetIds = new Set(projectData.targets.map(t => t.id));
        
        // 1. Remove deleted targets
        this.targets = this.targets.filter(t => {
            if (!newTargetIds.has(t.id)) {
                this.scheduler.stopAllForTarget(t);
                return false;
            }
            return true;
        });

        // 2. Update or Create targets
        projectData.targets.forEach(tData => {
            let target = this.targets.find(t => t.id === tData.id);
            
            if (target) {
                // Update properties but PRESERVE Position/Direction (Hot Swap)
                target.name = tData.name;
                target.size = tData.size ?? 100;
                target.visible = tData.visible ?? true;
                target.currentCostume = tData.currentCostume ?? 0;
                // console.log("Load Target", target.name, "Costume:", target.currentCostume);
                if (tData.costumes) target.costumes = tData.costumes;
                
                // target.x = tData.x; // Don't overwrite runtime X
                // target.y = tData.y; // Don't overwrite runtime Y
                // target.direction = tData.direction; // Don't overwrite runtime Direction

                // Code Update Check
                if (target.code !== tData.code) {
                    // console.log("Code changed for", target.name);
                    target.code = tData.code;
                    
                    // Restart Script for this target
                    this.scheduler.stopAllForTarget(target);
                    
                    try {
                        const scriptFn = eval(target.code);
                        // FIX: Do NOT auto-start script on edit. Wait for Green Flag.
                        // if (typeof scriptFn === 'function') {
                        //    this.scheduler.start(scriptFn, target);
                        // }
                    } catch (e) {
                         console.error("Failed to hot-swap script for", target.name, e);
                    }
                }
            } else {
                // New Target
                target = new Target(this.p, tData);
                this.targets.push(target);
                
                // Start its code immediately? Or wait for Flag? 
                // Usually wait for flag, but if we are "live editing", maybe?
                // For now, let's respect the "Run" state. 
                // If we want auto-start strings, we can check here.
            }
        });
        
        // console.log("[FlowScape] Active Targets:", this.targets.length);
    }

    start() {
        this.scheduler.stopAll();
        // console.log("[FlowScape] Runtime Start");
        this.targets.forEach(target => {
             if (target.code) {
                 try {
                     const scriptFn = eval(target.code);
                     if (typeof scriptFn === 'function') {
                         this.scheduler.start(scriptFn, target);
                     }
                 } catch (e) {
                     console.error("Error starting script", e);
                 }
             }
        });
    }

    stop() {
        this.scheduler.stopAll();
    }

    tick(dt) {
        this.scheduler.tick(dt);
        
        // Draw Stage First
        const stage = this.targets.find(t => t.isStage);
        if (stage) stage.draw();

        // Draw Sprites
        this.targets.filter(t => !t.isStage && t.visible).forEach(s => s.draw());
        
        // Broadcast State (Throttled ~ 10fps is enough for UI)
        if (this.p.frameCount % 3 === 0) {
            this.broadcastState();
        }
    }

    broadcastState() {
        // We only send mutable state
        const payload = this.targets.map(t => ({
            id: t.id,
            x: t.x,
            y: t.y,
            direction: t.direction,
            size: t.size,
            visible: t.visible
        }));
        
        window.parent.postMessage({
            type: "FlowScape:StateUpdate",
            payload,
            meta: {
                threads: this.scheduler.threads.length
            }
        }, "*");
    }

    // --- INTERACTION ---

    handleMousePress(mx, my) {
        // Convert to Scratch Coordinates
        const centerX = this.p.width / 2;
        const centerY = this.p.height / 2;
        const scratchX = mx - centerX;
        const scratchY = centerY - my; // Invert Y

        // Hit Test (Reverse order to grab top-most)
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const t = this.targets[i];
            if (t.isStage || !t.visible) continue;

            // Simple Box Hit Test (Assuming 40x40 size for now, ideally use t.size/costume)
            // Default rect is 40x40 scaled.
            const halfSize = (40 * (t.size / 100)) / 2;
            
            if (
                scratchX >= t.x - halfSize && 
                scratchX <= t.x + halfSize &&
                scratchY >= t.y - halfSize &&
                scratchY <= t.y + halfSize
            ) {
                this.draggingTarget = t;
                // Offset to keep sprite under mouse relatively
                this.dragOffsetX = t.x - scratchX;
                this.dragOffsetY = t.y - scratchY;
                return;
            }
        }
    }

    handleMouseDrag(mx, my) {
        if (!this.draggingTarget) return;

        const centerX = this.p.width / 2;
        const centerY = this.p.height / 2;
        const scratchX = mx - centerX;
        const scratchY = centerY - my;

        this.draggingTarget.x = scratchX + this.dragOffsetX;
        this.draggingTarget.y = scratchY + this.dragOffsetY;
        
        // VISUAL UPDATE ONLY (p5 state) - Do NOT broadcast to React yet.
        // this.broadcastState(); 
    }

    handleMouseRelease() {
        if (this.draggingTarget) {
            // Final broadcast to update React UI
            this.broadcastState();
        }
        this.draggingTarget = null;
    }
}

class Target {
    constructor(p, data) {
        this.p = p;
        this.id = data.id;
        this.name = data.name;
        this.isStage = data.isStage;
        
        // State
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.direction = data.direction ?? 90;
        this.size = data.size ?? 100;
        this.visible = data.visible ?? true;
        this.code = data.code; // Compiled Generator IIFE
        
        // Todo: Load Costumes
    }

    move(steps) {
        const rad = this.p.radians(this.direction - 90);
        this.x += Math.cos(rad) * steps;
        this.y += Math.sin(rad) * steps;
    }

    turn(degrees) {
        this.direction += degrees;
        // Normalize to 0-360 or -180/180? Scratch uses -180 to 180.
        // For simplicity:
        this.direction = this.direction % 360;
    }
    
    setXY(x, y) {
        this.x = Number(x);
        this.y = Number(y);
    }
    
    goToRandom() {
        // Assume standard Scratch stage size 480x360
        const halfW = 240;
        const halfH = 180;
        this.x = Math.floor(Math.random() * 480) - halfW;
        this.y = Math.floor(Math.random() * 360) - halfH;
    }
    
    // Looks
    setVisible(visible) {
        this.visible = Boolean(visible);
    }
    
    setSize(size) {
        this.size = Number(size);
    }

    say(text) {
        console.log(this.name + " says:", text);
        // Todo: Render bubble
    }

    draw() {
        if (this.isStage) {
            // Background Logic
            let bgDrawn = false;
            
            // Backgrounds don't use X/Y translation, they fill screen
            this.p.push();
            this.p.resetMatrix(); // Ensure we are drawing to absolute screen coordinates
            
            // Check for costume
            if (this.costumes && this.costumes.length > this.currentCostume) {
                const costume = this.costumes[this.currentCostume];
                // Allow any string assetId to be tried as a background color
                // (e.g. "red", "blue", "#ff0000")
                // Future: Implement loadImage for blobs/urls
                if (costume && costume.assetId) {
                    try {
                        this.p.background(costume.assetId);
                        bgDrawn = true;
                    } catch(e) {
                         // Ignore invalid colors
                    }
                }
            }
            
            // Default White if nothing drawn
            if (!bgDrawn) {
                this.p.background(255); 
            }
            this.p.pop();
            return;
        }

        // Sprite Drawing
        this.p.push();
        
        // Scratch Coordinate System: 0,0 is CENTER. Y is UP.
        // p5 0,0 is Top-Left, Y is Down.
        const centerX = this.p.width / 2;
        const centerY = this.p.height / 2;
        
        const screenX = centerX + this.x;
        const screenY = centerY - this.y; // Invert Y
        
        this.p.translate(screenX, screenY);
        this.p.rotate(this.p.radians(this.direction - 90));
        this.p.scale(this.size / 100);
        
        // Default Look (Cat Placeholder - Orange)
        this.p.fill(255, 165, 0); 
        this.p.stroke(0);
        this.p.strokeWeight(2);
        this.p.rectMode(this.p.CENTER);
        this.p.rect(0, 0, 40, 40);
        
        // Face
        this.p.fill(0);
        this.p.rect(-10, -10, 5, 5); // Eye
        this.p.rect(10, -10, 5, 5); // Eye
        this.p.noFill();
        this.p.arc(0, 5, 20, 10, 0, this.p.PI); // Mouth
        
        this.p.pop();
    }
}

// --- GLOBAL RUNTIME ---

let vm;

// --- MESSAGING SYSTEM ---
window.addEventListener("message", (event) => {
    const { type, payload } = event.data;
    
    if (type === "FlowScape:Init") {
        if (vm) vm.loadProject(payload);
    }
    
    if (type === "FlowScape:Run") {
        if (vm) vm.start();
    }
    if (type === "FlowScape:Stop") {
        if (vm) vm.stop();
    }
    if (type === "FlowScape:ScriptUpdate") {
        try {
            // Hot-Swap the User Script
            eval(payload.code); 
        } catch(e) {
            console.error("Script Update Failed:", e);
        }
    }
    if (type === "FlowScape:CaptureThumbnail") {
        // Capture the p5 canvas and send back
        try {
            const canvas = document.querySelector("canvas");
            if (canvas) {
                const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                window.parent.postMessage({ type: "FlowScape:ThumbnailData", payload: dataUrl }, "*");
            } else {
                window.parent.postMessage({ type: "FlowScape:ThumbnailData", payload: null }, "*");
            }
        } catch(e) {
            console.error("[FlowScape] Thumbnail capture failed:", e);
            window.parent.postMessage({ type: "FlowScape:ThumbnailData", payload: null }, "*");
        }
    }
});

// --- P5 LOOP ---

new p5((p) => {
    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight);
        p.frameRate(30);
        
        vm = new Runtime(p);
        
        // Send Ready Signal
        console.log("[FlowScape] Runtime Ready");
    };

    p.draw = () => {
        if (vm) vm.tick(p.deltaTime);
    };

    // --- INPUT HANDLING (Dragging) ---
    p.mousePressed = () => {
        if (!vm) return;
        vm.handleMousePress(p.mouseX, p.mouseY);
    };

    p.mouseDragged = () => {
        if (!vm) return;
        vm.handleMouseDrag(p.mouseX, p.mouseY);
    };

    p.mouseReleased = () => {
        if (!vm) return;
        vm.handleMouseRelease();
    };

    p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
    };
});
`

interface FlowRunnerProps {
  files: ScapeFile[] // Raw project files (json, assets)
  scapeId: string
  onCollapse?: () => void
  onBusyChange?: (isBusy: boolean) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project?: any // Passed directly from Store for High-Speed Sync
}

export const FlowRunner = memo(
  forwardRef<ScapeRunnerHandle, FlowRunnerProps>(
    ({ files: rawFiles, scapeId, onCollapse, project: liveProject }, ref) => {
      const iframeRef = useRef<HTMLIFrameElement>(null)
      const [refreshKey, setRefreshKey] = useState(0)
      const [threadCount, setThreadCount] = useState(0)

      useEffect(() => {
        const handleMsg = (e: MessageEvent) => {
          if (e.data?.type === "FlowScape:StateUpdate" && e.data?.meta?.threads !== undefined) {
            setThreadCount(e.data.meta.threads)
          }
        }
        window.addEventListener("message", handleMsg)
        return () => window.removeEventListener("message", handleMsg)
      }, [])

      // 1. INJECTION: Mix user files with Harness
      const runtimeFiles = useMemo(
        () => [
          ...rawFiles, // Include assets
          { id: "sys-1", name: "index.html", language: "html" as const, content: HARNESS_HTML },
          { id: "sys-2", name: "engine.js", language: "javascript" as const, content: ENGINE_JS },
        ],
        [rawFiles]
      )

      const [socketId] = useState(() => crypto.randomUUID())

      // 2. BRIDGE: Use the standard hook
      const bridge = usePreviewBridge(
        runtimeFiles,
        scapeId,
        socketId,
        iframeRef,
        { hotUpdate: "true" },
        refreshKey
      )

      useImperativeHandle(ref, () => ({
        captureThumbnail: async () => {
          return new Promise((resolve) => {
            const timeout = setTimeout(() => {
              window.removeEventListener("message", handler)
              resolve(null)
            }, 2000)

            const handler = (e: MessageEvent) => {
              if (e.data?.type === "FlowScape:ThumbnailData") {
                clearTimeout(timeout)
                window.removeEventListener("message", handler)
                resolve(e.data.payload || null)
              }
            }

            window.addEventListener("message", handler)
            iframeRef.current?.contentWindow?.postMessage(
              { type: "FlowScape:CaptureThumbnail" },
              "*"
            )
          })
        },
        restart: async () => {
          console.log("[FlowRunner] Hard Restarting...")
          setRefreshKey((k) => k + 1)
        },
        installPackage: async () => ({ success: false, error: "Not supported" }),
        run: () => {
          iframeRef.current?.contentWindow?.postMessage({ type: "FlowScape:Run" }, "*")
        },
        stop: () => {
          iframeRef.current?.contentWindow?.postMessage({ type: "FlowScape:Stop" }, "*")
        },
        updateScript: (code: string) => {
          iframeRef.current?.contentWindow?.postMessage(
            { type: "FlowScape:ScriptUpdate", payload: { code } },
            "*"
          )
        },
      }))

      // Init Project on Load (Fast Path)
      useEffect(() => {
        if (!bridge.ready) return

        // PRIORITIZE: liveProject (Store) -> project.json (File) -> Default
        let project = liveProject

        if (!project) {
          const projectFile = rawFiles.find((f) => f.name === "project.json")
          if (projectFile && projectFile.content) {
            try {
              project = JSON.parse(projectFile.content as string)
              console.log("[FlowRunner] Found project.json in files", project)
            } catch (e) {
              console.error("[FlowRunner] Failed to parse project.json", e)
            }
          }
        }

        // Fallback
        if (!project) {
          console.warn("[FlowRunner] No project found, using fallback.")
          project = { targets: [] } // Empty
        }

        // Send to Engine
        // No debounce for Zero-Latency updates
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "FlowScape:Init",
            payload: project,
          },
          "*"
        )
      }, [bridge.ready, rawFiles, liveProject])

      return (
        <div className="flex h-full flex-col border-l border-border bg-background dark:border-zinc-800">
          {/* Header */}
          <div className="flex h-10 items-center justify-between border-b border-border bg-muted/20 px-2 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MonitorPlay className="h-3.5 w-3.5" />
              <span>Flow Runtime</span>
              {threadCount > 0 && (
                <span className="ml-2 rounded-full bg-green-500/20 px-1.5 py-0.5 text-[10px] font-medium text-green-500">
                  {threadCount} active
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {onCollapse && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={onCollapse}
                  title="Collapse Preview"
                >
                  <PanelRightClose className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Viewport */}
          <div className="relative flex-1 bg-zinc-950">
            {!bridge.ready && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-sm text-zinc-500">
                <p>Booting Engine...</p>
                <code className="mt-2 block space-y-1 text-xs opacity-50">
                  {bridge.url.split("?")[0]}
                </code>
              </div>
            )}

            <iframe
              key={refreshKey}
              ref={iframeRef}
              src={bridge.url}
              className="block h-full w-full border-0"
              // Standard sandbox
              sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
            />
          </div>
        </div>
      )
    }
  )
)

FlowRunner.displayName = "FlowRunner"
