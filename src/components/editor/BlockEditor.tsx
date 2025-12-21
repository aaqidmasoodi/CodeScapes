import { useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import * as Blockly from "blockly"
import { compileWorkspace } from "@/runners/flow/compiler"

// --- THEME ---
const CODESCAPE_THEME = Blockly.Theme.defineTheme("codescape", {
  name: "codescape",
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: "#1e1e20", // Matches zinc-900/950
    toolboxBackgroundColour: "#18181b", // Matches zinc-950
    toolboxForegroundColour: "#cfd0d2",
    flyoutBackgroundColour: "#27272a", // zinc-800
    flyoutOpacity: 0.8,
    scrollbarColour: "#52525b",
    scrollbarOpacity: 0.5,
  },
  blockStyles: {
    loop_blocks: { colourPrimary: "#10b981" }, // Green
    logic_blocks: { colourPrimary: "#8b5cf6" }, // Purple
    math_blocks: { colourPrimary: "#3b82f6" }, // Blue
    procedure_blocks: { colourPrimary: "#ec4899" }, // Pink
  },
})

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

const INITIAL_TOOLBOX = {
  kind: "categoryToolbox",
  contents: TOOLBOX_CATEGORIES.map((c) => ({
    kind: "category",
    name: c.name,
    colour: c.colour,
    contents: c.contents,
  })),
}

// --- CUSTOM BLOCKS DEFINITION (Phase 3.1) ---
// We define them globally for now. In future, move to 'blocks/definitions.ts'
Blockly.Blocks["move_steps"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("move")
      .appendField(new Blockly.FieldNumber(10), "STEPS")
      .appendField("steps")
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour(230)
    this.setTooltip("Move sprite forward")
  },
}

Blockly.Blocks["turn_right"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("turn")
      .appendField("dw") // Icon placeholder
      .appendField(new Blockly.FieldNumber(15), "DEGREES")
      .appendField("degrees")
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour(230)
  },
}

Blockly.Blocks["event_when_flag_clicked"] = {
  init: function () {
    this.appendDummyInput().appendField("When 🚩 clicked")
    this.setNextStatement(true, null)
    this.setColour(120)
    this.setTooltip("Runs when Green Flag is clicked")
  },
}

export interface BlockEditorHandle {
  getCode: () => string
  loadJSON: (json: object) => void
  resize: () => void
  activateCategory: (name: string) => void
}

// 102
export interface BlockEditorProps {
  onChange?: (code: string, json: object) => void
  onInit?: () => void
}

export const BlockEditor = forwardRef<BlockEditorHandle, BlockEditorProps>(
  ({ onChange, onInit }, ref) => {
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
        if (!workspaceRef.current) return
        Blockly.serialization.workspaces.load(json, workspaceRef.current)
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
    }))

    useEffect(() => {
      if (!editorDiv.current) return

      // Inject workspace
      workspaceRef.current = Blockly.inject(editorDiv.current, {
        toolbox: INITIAL_TOOLBOX,
        theme: CODESCAPE_THEME,
        renderer: "zelos", // Scratch-like renderer
        zoom: {
          controls: true,
          wheel: true,
          startScale: 0.9,
        },
        grid: {
          spacing: 20,
          length: 3,
          colour: "#3f3f46",
          snap: true,
        },
        trashcan: true,
      })

      // Signal Readiness
      // Signal Readiness
      if (onInitRef.current) {
        onInitRef.current()
      }

      // Hide default toolbox
      const style = document.createElement("style")
      style.innerHTML = `
      .blocklyToolboxDiv { display: none !important; } 
      .blocklyFlyout { z-index: 999; }
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
        Blockly.svgResize(workspaceRef.current as Blockly.WorkspaceSvg)
      })
      observer.observe(editorDiv.current)

      return () => {
        observer.disconnect()
        // clean style
        document.head.removeChild(style)
        workspaceRef.current?.dispose()
      }
    }, [])

    return <div ref={editorDiv} className="h-full w-full" />
  }
)

BlockEditor.displayName = "BlockEditor"
