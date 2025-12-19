import type { ParsedCommand } from "./types"

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // 1. Tokenize (respecting quotes)
  const tokens: string[] = []
  let current = ""
  let inQuote: '"' | "'" | null = null

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i]

    if (inQuote) {
      if (char === inQuote) {
        inQuote = null
      } else {
        current += char
      }
    } else {
      if (char === '"' || char === "'") {
        inQuote = char
      } else if (char === " ") {
        if (current) {
          tokens.push(current)
          current = ""
        }
      } else {
        current += char
      }
    }
  }
  if (current) tokens.push(current)

  if (tokens.length === 0) return null

  // 2. Parse Redirection
  let redirect: ParsedCommand["redirect"] | undefined
  const args: string[] = []
  let skipNext = false

  for (let i = 0; i < tokens.length; i++) {
    if (skipNext) {
      skipNext = false
      continue
    }

    const token = tokens[i]

    if (token === ">" || token === ">>") {
      const target = tokens[i + 1]
      if (target) {
        redirect = {
          type: token === ">" ? "write" : "append",
          target,
        }
        skipNext = true
      }
    } else {
      args.push(token)
    }
  }

  const command = args.shift() // First token is command

  if (!command) return null

  return {
    command,
    args,
    redirect,
  }
}
