import { useState, useRef, forwardRef, useImperativeHandle, memo, useMemo } from "react"
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
// FlowScape Engine v0.5 "Invisible Engine"
console.log("[FlowScape] Engine Booting...");

// --- CORE CLASSES ---

class Scheduler {
    constructor() {
        this.threads = []; // Active generator functions
        this.dt = 0;
    }

    // Add a script (generator) to the scheduler
    start(generatorFn, context) {
        console.log("[FlowScape] Scheduler: Starting New Thread");
        if (!generatorFn) return;
        const iterator = generatorFn(context);
        this.threads.push({ iterator, context, waitingUntil: 0 });
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
            const result = thread.iterator.next();
            
            if (!result.done) {
                // If yielded a number, treat as Wait(ms)
                if (typeof result.value === 'number') {
                    thread.waitingUntil = now + (result.value * 1000);
                }
                activeThreads.push(thread);
            }
        }
        this.threads = activeThreads;
    }
}

class Sprite {
    constructor(p, name, x, y) {
        this.p = p;
        this.name = name;
        this.x = x;
        this.y = y;
        this.direction = 90;
        this.size = 100;
        this.visible = true;
    }

    move(steps) {
        console.log("[FlowScape] Sprite Moving steps: " + steps);
        const rad = this.p.radians(this.direction - 90);
        this.x += Math.cos(rad) * steps;
        this.y += Math.sin(rad) * steps;
    }

    turn(degrees) {
        this.direction += degrees;
    }

    draw() {
        if (!this.visible) return;
        this.p.push();
        this.p.translate(this.x, this.y);
        this.p.rotate(this.p.radians(this.direction - 90)); // p5 0 is right, Scratch 0 is up
        
        // Default Look (Cat Placeholder)
        this.p.fill(255, 165, 0);
        this.p.rectMode(this.p.CENTER);
        this.p.rect(0, 0, 40, 40);
        this.p.fill(0);
        this.p.rect(-10, -10, 5, 5); // Eye
        this.p.rect(10, -10, 5, 5); // Eye
        
        this.p.pop();
    }
}

// --- GLOBAL RUNTIME ---

let scheduler;
let sprites = [];
let p5Instance;
let cat;

// API Exposed to Block Code (The "Link")
window.runtime = {
    wait: (seconds) => seconds, // Generator yields this
    getSprite: (name) => sprites.find(s => s.name === name)
};

// --- MESSAGING SYSTEM ---
window.addEventListener("message", (event) => {
    if (!scheduler) return;
    
    const { type } = event.data;
    if (type === "FlowScape:Run") {
        console.log("[FlowScape] Event: Run");
        scheduler.stopAll();
        if (window.userScript) {
             console.log("[FlowScape] Found User Script. Executing...");
             if (cat) {
                 scheduler.start(window.userScript, cat);
             }
        } else {
             console.error("[FlowScape] No User Script found!");
        }
    }
    if (type === "FlowScape:Stop") {
        console.log("[FlowScape] Event: Stop");
        scheduler.stopAll();
    }
    if (type === "FlowScape:ScriptUpdate") {
        console.log("[FlowScape] Event: Script Update");
        try {
            // Hot-Swap the User Script
            eval(event.data.code); 
        } catch(e) {
            console.error("Script Update Failed:", e);
        }
    }
});

// --- P5 LOOP ---

new p5((p) => {
    p5Instance = p;
    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight);
        p.frameRate(30);
        
        scheduler = new Scheduler();
        
        // Create Default Sprite "Cat"
        cat = new Sprite(p, "Cat", p.width/2, p.height/2);
        sprites.push(cat);

        console.log("[FlowScape] Ready. Waiting for Green Flag.");
    };

    p.draw = () => {
        p.background(20); // Dark Gray Stage
        
        // 1. Tick Logic
        if (scheduler) scheduler.tick(p.deltaTime);
        
        // 2. Draw Sprites
        sprites.forEach(s => s.draw());
        
        // Debug
        p.fill(255);
        p.noStroke();
        p.textAlign(p.LEFT, p.TOP);
        if (scheduler) {
            p.text("Active Threads: " + scheduler.threads.length, 10, 10);
        }
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
}

export const FlowRunner = memo(
  forwardRef<ScapeRunnerHandle, FlowRunnerProps>(
    ({ files: rawFiles, scapeId, onCollapse }, ref) => {
      const iframeRef = useRef<HTMLIFrameElement>(null)
      const [refreshKey, setRefreshKey] = useState(0)

      // 1. INJECTION: Mix user files with Harness
      // We essentially "ignore" the user's index.html if they have one,
      // or we just providing the runtime environment.
      // For FlowScape, the "executable" is the Engine, not a user script.
      // The Engine reads 'project.json'.

      const runtimeFiles = useMemo(
        () => [
          ...rawFiles, // Include assets
          { id: "sys-1", name: "index.html", language: "html" as const, content: HARNESS_HTML },
          { id: "sys-2", name: "engine.js", language: "javascript" as const, content: ENGINE_JS },
        ],
        [rawFiles]
      )

      // 2. BRIDGE: Use the standard hook
      const bridge = usePreviewBridge(
        runtimeFiles,
        scapeId,
        iframeRef,
        { hotUpdate: "true" },
        refreshKey
      )

      useImperativeHandle(ref, () => ({
        captureThumbnail: async () => null, // Todo
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
            { type: "FlowScape:ScriptUpdate", code },
            "*"
          )
        },
      }))

      return (
        <div className="flex h-full flex-col border-l border-border bg-background dark:border-zinc-800">
          {/* Header */}
          <div className="flex h-10 items-center justify-between border-b border-border bg-muted/20 px-2 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MonitorPlay className="h-3.5 w-3.5" />
              <span>Flow Runtime</span>
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
