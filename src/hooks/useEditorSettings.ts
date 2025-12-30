import { useState, useEffect, useCallback } from "react"

export interface EditorSettings {
  fontSize: number
  wordWrap: "on" | "off" | "wordWrapColumn"
  minimap: boolean
  lineNumbers: "on" | "off" | "relative"
}

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  wordWrap: "on",
  minimap: false,
  lineNumbers: "on",
}

const STORAGE_KEY = "codescape:editor-settings"

export function useEditorSettings() {
  const [settings, setSettings] = useState<EditorSettings>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      }
    } catch (e) {
      console.warn("Failed to parse editor settings from localStorage", e)
    }
    return DEFAULT_SETTINGS
  })

  // Persist to localStorage when settings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (e) {
      console.warn("Failed to save editor settings to localStorage", e)
    }
  }, [settings])

  const updateSetting = useCallback(
    <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return {
    settings,
    updateSetting,
    resetSettings,
  }
}
