export interface ShortcutConfig {
  id: string
  label: string
  keys: {
    mac: string
    win: string
  }
  description: string
  // Helper for display
  displayKeys?: string[]
}

export const SHORTCUTS: ShortcutConfig[] = [
  {
    id: "save",
    label: "Save File",
    keys: {
      mac: "Meta+s",
      win: "Ctrl+s",
    },
    description: "Save the current file and formatting code",
  },
  {
    id: "run",
    label: "Run / Refresh",
    keys: {
      mac: "Meta+Enter",
      win: "Ctrl+Enter",
    },
    description: "Run the code and refresh the preview",
  },
  {
    id: "format",
    label: "Format Document",
    keys: {
      mac: "Shift+Alt+f",
      win: "Shift+Alt+f",
    },
    description: "Format the current code",
  },
  {
    id: "toggleSidebar",
    label: "Toggle Sidebar",
    keys: {
      mac: "Meta+b",
      win: "Ctrl+b",
    },
    description: "Show or hide the file explorer sidebar",
  },
  {
    id: "toggleTerminal",
    label: "Toggle Terminal",
    keys: {
      mac: "Ctrl+`",
      win: "Ctrl+`",
    },
    description: "Show or hide the terminal panel",
  },
]

export const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0

export const getShortcutLabel = (shortcut: ShortcutConfig) => {
  const keys = isMac ? shortcut.keys.mac : shortcut.keys.win
  // Prettify keys for display
  return keys
    .replace("Meta", "Cmd")
    .replace("Control", "Ctrl")
    .replace("Alt", "Option")
    .split("+")
    .join(" + ")
}

export const checkShortcut = (e: KeyboardEvent, shortcutId: string): boolean => {
  const shortcut = SHORTCUTS.find((s) => s.id === shortcutId)
  if (!shortcut) return false

  const keyConfig = isMac ? shortcut.keys.mac : shortcut.keys.win
  // Simple parser: check modifiers and key
  // Format expectation: Modifier+Modifier+Key (e.g., Meta+s, Shift+Alt+f)

  const parts = keyConfig.toLowerCase().split("+")
  const mainKey = parts[parts.length - 1]

  const hasMeta = parts.includes("meta") || parts.includes("cmd")
  const hasCtrl = parts.includes("ctrl") || parts.includes("control")
  const hasShift = parts.includes("shift")
  const hasAlt = parts.includes("alt")

  // Check Modifiers
  if (e.metaKey !== hasMeta) return false
  if (e.ctrlKey !== hasCtrl) return false
  if (e.shiftKey !== hasShift) return false
  if (e.altKey !== hasAlt) return false

  // Check Key
  // Handle special cases if needed, but for now strict checking
  if (mainKey === "enter" && e.key === "Enter") return true
  if (mainKey === "`" && (e.key === "`" || e.code === "Backquote")) return true
  if (e.key.toLowerCase() === mainKey) return true

  return false
}
