import { useState, useRef, useCallback } from "react"

export type InputMode = "text" | "password"

export function useConsoleInput() {
  const [isWaiting, setIsWaiting] = useState(false)
  const [mode, setMode] = useState<InputMode>("text")
  const [prompt, setPrompt] = useState<string>("")
  const resolveRef = useRef<((value: string) => void) | null>(null)

  const requestInput = useCallback((promptText: string, isPassword?: boolean): Promise<string> => {
    setPrompt(promptText || "")
    setMode(isPassword ? "password" : "text")
    setIsWaiting(true)

    return new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const resolveInput = useCallback((value: string) => {
    if (resolveRef.current) {
      resolveRef.current(value)
      resolveRef.current = null
    }
    setIsWaiting(false)
    setPrompt("")
  }, [])

  return {
    isWaiting,
    mode,
    prompt,
    requestInput,
    resolveInput,
  }
}
