import * as Blockly from "blockly"

// --- THEME ---
export const CODESCAPE_DARK_THEME = Blockly.Theme.defineTheme("codescape_dark", {
  name: "codescape_dark",
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
    loop_blocks: { colourPrimary: "#8b5cf6" }, // Purple (Control)
    logic_blocks: { colourPrimary: "#8b5cf6" }, // Purple
    math_blocks: { colourPrimary: "#3b82f6" }, // Blue
    procedure_blocks: { colourPrimary: "#ec4899" }, // Pink
    motion_blocks: { colourPrimary: "#3b82f6" }, // Blue (Motion)
    event_blocks: { colourPrimary: "#eab308" }, // Yellow (Events)
  },
})

export const CODESCAPE_LIGHT_THEME = Blockly.Theme.defineTheme("codescape_light", {
  name: "codescape_light",
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: "#dbdbe1", // Matches light theme background
    toolboxBackgroundColour: "#e4e4e7", // Matches zinc-200
    toolboxForegroundColour: "#3f3f46", // Matches zinc-700
    flyoutBackgroundColour: "#d4d4d8", // Matches zinc-300
    flyoutOpacity: 0.8,
    scrollbarColour: "#a1a1aa", // Matches zinc-400
    scrollbarOpacity: 0.5,
  },
  blockStyles: {
    loop_blocks: { colourPrimary: "#8b5cf6" }, // Purple
    logic_blocks: { colourPrimary: "#8b5cf6" }, // Purple
    math_blocks: { colourPrimary: "#3b82f6" }, // Blue
    procedure_blocks: { colourPrimary: "#ec4899" }, // Pink
    motion_blocks: { colourPrimary: "#3b82f6" }, // Blue
    event_blocks: { colourPrimary: "#eab308" }, // Yellow
  },
})

// --- PREVIEW THEMES (Transparent Background) ---
export const CODESCAPE_DARK_PREVIEW_THEME = Blockly.Theme.defineTheme("codescape_dark_preview", {
  name: "codescape_dark_preview",
  base: CODESCAPE_DARK_THEME,
  componentStyles: {
    ...CODESCAPE_DARK_THEME.componentStyles,
    workspaceBackgroundColour: "transparent",
  },
  blockStyles: CODESCAPE_DARK_THEME.blockStyles,
})

export const CODESCAPE_LIGHT_PREVIEW_THEME = Blockly.Theme.defineTheme("codescape_light_preview", {
  name: "codescape_light_preview",
  base: CODESCAPE_LIGHT_THEME,
  componentStyles: {
    ...CODESCAPE_LIGHT_THEME.componentStyles,
    workspaceBackgroundColour: "transparent",
  },
  blockStyles: CODESCAPE_LIGHT_THEME.blockStyles,
})

// --- CUSTOM BLOCKS DEFINITION ---
export const registerBlocks = () => {
  if (typeof Blockly === "undefined") return

  // Check if already registered to avoid warnings/errors
  if (Blockly.Blocks["move_steps"]) return

  Blockly.Blocks["move_steps"] = {
    init: function () {
      this.appendDummyInput()
        .appendField("move")
        .appendField(new Blockly.FieldNumber(10), "STEPS")
        .appendField("steps")
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setStyle("motion_blocks")
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
      this.setStyle("motion_blocks")
    },
  }

  Blockly.Blocks["event_when_flag_clicked"] = {
    init: function () {
      this.appendDummyInput().appendField("When 🚩 clicked")
      this.setNextStatement(true, null)
      this.setStyle("event_blocks")
      this.setTooltip("Runs when Green Flag is clicked")
    },
  }
}
