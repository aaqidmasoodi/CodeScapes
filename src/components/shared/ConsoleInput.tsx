import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ConsoleInputProps {
  mode: "text" | "password"
  onSubmit: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function ConsoleInput({
  mode,
  onSubmit,
  disabled = false,
  className,
  placeholder,
}: ConsoleInputProps) {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus on mount logic (if enabled)
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [disabled])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(value)
    setValue("")
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex-1", className)}>
      <input
        ref={inputRef}
        type={mode}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="m-0 w-full border-none bg-transparent p-0 font-mono text-foreground outline-none"
        autoFocus={!disabled}
        disabled={disabled}
        autoComplete="off"
        spellCheck="false"
        placeholder={placeholder}
      />
    </form>
  )
}
