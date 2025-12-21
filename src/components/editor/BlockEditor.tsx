import { useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import * as Blockly from "blockly"
import { compileWorkspace } from "@/runners/flow/compiler"

// --- THEME ---
import { CODESCAPE_DARK_THEME, CODESCAPE_LIGHT_THEME, registerBlocks } from "./blockly-init"

// --- TOOLBOX DEFINITION ---
// eslint-disable-next-line react-refresh/only-export-components
export const TOOLBOX_CATEGORIES = [
  {
    name: "Motion",
    colour: "#3b82f6",
    contents: [
      { kind: "block", type: "move_steps" },
      { kind: "block", type: "turn_right" },
    ],
  },
  {
    name: "Events",
    colour: "#eab308",
    contents: [{ kind: "block", type: "event_when_flag_clicked" }],
  },
  {
    name: "Control",
    colour: "#8b5cf6",
    contents: [
      { kind: "block", type: "controls_repeat_ext" },
      { kind: "block", type: "controls_whileUntil" },
    ],
  },
]

export interface BlockEditorHandle {
  getCode: () => string
  loadJSON: (json: object) => void
  toJSON: () => object // Serialization
  clear: () => void // Clear workspace
  resize: () => void
  activateCategory: (name: string) => void
  spawnBlock: (type: string, clientX: number, clientY: number) => void
}

export interface BlockEditorProps {
  theme: "light" | "dark"
  onChange?: (code: string, json: object) => void
  onInit?: () => void
}

export const BlockEditor = forwardRef<BlockEditorHandle, BlockEditorProps>(
  ({ theme, onChange, onInit }, ref) => {
    const editorDiv = useRef<HTMLDivElement>(null)
    const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
    const onChangeRef = useRef(onChange)
    const onInitRef = useRef<(() => void) | undefined>(onInit)

    // Keep ref updated
    useEffect(() => {
      onChangeRef.current = onChange
      onInitRef.current = onInit
    }, [onChange, onInit])

    useImperativeHandle(ref, () => ({
      getCode: () => {
        if (!workspaceRef.current) return ""
        return compileWorkspace(workspaceRef.current)
      },
      loadJSON: (json: object) => {
        if (!workspaceRef.current) {
          console.warn("[BlockEditor] loadJSON called but workspace is null")
          return
        }
        // Verify rendering state
        if (workspaceRef.current.rendered) {
          try {
            Blockly.serialization.workspaces.load(json, workspaceRef.current)
          } catch (err) {
            console.error("[BlockEditor] loadJSON Failed:", err)
          }
        } else {
          console.warn("[BlockEditor] Workspace exists but is NOT rendered. Cannot load blocks.")
        }
      },
      toJSON: () => {
        if (!workspaceRef.current) return {}
        return Blockly.serialization.workspaces.save(workspaceRef.current)
      },
      clear: () => {
        if (workspaceRef.current) {
          workspaceRef.current.clear()
        }
      },
      resize: () => {
        Blockly.svgResize(workspaceRef.current as Blockly.WorkspaceSvg)
      },
      activateCategory: (name: string) => {
        if (!workspaceRef.current) return
        const toolbox = workspaceRef.current.getToolbox()
        if (toolbox) {
          // @ts-expect-error - Internal API but necessary for programmatic selection
          toolbox.selectCategoryByName(name)
        }
      },
      spawnBlock: (type: string, clientX: number, clientY: number) => {
        const workspace = workspaceRef.current
        if (!workspace) return

        // 1. Create Block
        const block = workspace.newBlock(type)
        block.initSvg()
        block.render()

        // 2. Position it relative to the viewport
        // We need to convert clientX/Y to workspace coordinates.
        // Blockly has utility for this, but standard SVG matrix math is reliable.
        const injectionDiv = workspace.getInjectionDiv()
        const boundingRect = injectionDiv.getBoundingClientRect()

        // Calculate relative to the injection div (0,0 of workspace visual area)
        const relX = clientX - boundingRect.left
        const relY = clientY - boundingRect.top

        // Convert to Workspace scale/pan
        const scrollX = workspace.scrollX
        const scrollY = workspace.scrollY
        const scale = workspace.scale

        const workspaceX = relX / scale - scrollX / scale
        const workspaceY = relY / scale - scrollY / scale

        block.moveTo(new Blockly.utils.Coordinate(workspaceX, workspaceY))

        // 3. Initiate Drag (The "Ghost" Handoff)
        if (Blockly.Gesture.inProgress()) {
          // @ts-expect-error - Internal
          const gesture = Blockly.Gesture.inprogress_
          gesture.setStartBlock(block)
        } else {
          // Fallback: Just select it
          block.select()
        }
      },
    }))

    // Dynamic Theme Update
    useEffect(() => {
      if (workspaceRef.current) {
        const targetTheme = theme === "light" ? CODESCAPE_LIGHT_THEME : CODESCAPE_DARK_THEME
        workspaceRef.current.setTheme(targetTheme)
        workspaceRef.current.refreshTheme()

        // Update grid colors manually because setTheme doesn't affect the grid
        const grid = workspaceRef.current.getGrid()
        if (grid) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - access to private to update color
          grid.update(theme === "light" ? "#ccc" : "#3f3f46")
        }
      }
    }, [theme])

    // Drag & Drop Handlers
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "copy"
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      const type = e.dataTransfer.getData("block-type")
      if (type && workspaceRef.current) {
        // We can reuse the spawnBlock logic but we need to expose it or duplicate the coorindate logic
        // Since spawnBlock is in the handle, we can just call the logic directly here or use the imperative handle ref if we had it (we are inside the component so we don't)

        // Copied/Adapted logic from spawnBlock to ensure access to closure variables
        const workspace = workspaceRef.current
        const block = workspace.newBlock(type)
        block.initSvg()
        block.render()

        const injectionDiv = workspace.getInjectionDiv()
        const boundingRect = injectionDiv.getBoundingClientRect()
        const relX = e.clientX - boundingRect.left
        const relY = e.clientY - boundingRect.top
        const workspaceX = relX / workspace.scale - workspace.scrollX / workspace.scale
        const workspaceY = relY / workspace.scale - workspace.scrollY / workspace.scale

        block.moveTo(new Blockly.utils.Coordinate(workspaceX, workspaceY))

        // Immediately start dragging the new block so it feels natural
        block.select()
        // If we want to snap to mouse, we could try:
        if (Blockly.Gesture.inProgress()) {
          // @ts-expect-error - Internal
          const gesture = Blockly.Gesture.inprogress_
          gesture.setStartBlock(block)
        }
      }
    }

    useEffect(() => {
      if (!editorDiv.current) return
      if (workspaceRef.current) {
        console.log("[Blockly] Workspace already active. Skipping inject.")
        return
      }

      // 1. Register Blocks Safely (Just in case module level didn't catch it)
      registerBlocks()

      // Use the explicitly passed theme
      const initialTheme = theme === "light" ? CODESCAPE_LIGHT_THEME : CODESCAPE_DARK_THEME

      // Inject workspace
      console.log(
        "[Blockly] Injecting. Theme:",
        theme,
        "Div Connected:",
        editorDiv.current.isConnected
      )

      try {
        workspaceRef.current = Blockly.inject(editorDiv.current, {
          toolbox: { kind: "flyoutToolbox", contents: [] }, // Custom Sidebar replacement
          theme: initialTheme,
          renderer: "zelos", // Scratch-like renderer
          move: {
            scrollbars: true,
            drag: true,
            wheel: true,
          },
          zoom: {
            controls: true,
            wheel: true,
            startScale: 0.9,
          },
          grid: {
            spacing: 20,
            length: 3,
            colour: theme === "light" ? "#ccc" : "#3f3f46",
            snap: true,
          },
          trashcan: true,
          modalInputs: false, // Force inline editing
        })
        console.log("[Blockly] Injection Complete. Rendered:", workspaceRef.current.rendered)
      } catch (e) {
        console.error("[Blockly] INJECTION FATAL ERROR:", e)
        return
      }

      // Signal Readiness
      if (onInitRef.current) {
        onInitRef.current()
      }

      // Hide default toolbox
      const style = document.createElement("style")
      style.innerHTML = `
      .blocklyToolboxDiv { display: none !important; } 
      .blocklyFlyout { display: none !important; }
      .blocklyFlyoutBackground { display: none !important; }
      .blocklyFlyoutScrollbar { display: none !important; }
      .blocklySvg { border: none !important; outline: none !important; }
      .blocklyMainBackground { stroke-width: 0 !important; stroke: none !important; }
    `
      document.head.appendChild(style)

      // Change Listener
      const listener = (e: Blockly.Events.Abstract) => {
        if (e.type === Blockly.Events.FINISHED_LOADING) return
        if (e.isUiEvent) return // Ignore clicks, scrolls, toolbox open

        // Use ref to avoid stale closure
        if (workspaceRef.current && onChangeRef.current) {
          const code = compileWorkspace(workspaceRef.current)
          const json = Blockly.serialization.workspaces.save(workspaceRef.current)
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - overload mismatch in types vs runtime
          onChangeRef.current(code, json)
        }
      }
      workspaceRef.current.addChangeListener(listener)

      // ResizeObserver
      const observer = new ResizeObserver(() => {
        if (workspaceRef.current) {
          Blockly.svgResize(workspaceRef.current as Blockly.WorkspaceSvg)
        }
      })
      observer.observe(editorDiv.current)

      return () => {
        console.log("[Blockly] Disposing workspace...")
        observer.disconnect()
        // clean style
        if (document.head.contains(style)) {
          document.head.removeChild(style)
        }
        if (workspaceRef.current) {
          workspaceRef.current.dispose()
          workspaceRef.current = null
        }
      }
    }, [])

    return (
      <div
        ref={editorDiv}
        className="h-full w-full"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          backgroundColor: theme === "light" ? "#dbdbe1" : "#1e1e20",
        }}
      />
    )
  }
)

BlockEditor.displayName = "BlockEditor"
