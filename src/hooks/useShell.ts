import { useCallback } from "react"
import { parseCommand } from "@/lib/shell/parser"
import type { CommandHandler, ShellContext, ShellOutput } from "@/lib/shell/types"
import type { ScapeFile } from "@/types/file"

// Kernel Interface - Needs access to file system hooks
interface FileSystemHooks {
  files: ScapeFile[]
  createFile: (name: string, type: ScapeFile["language"], content?: string) => Promise<void>
  updateFile: (name: string, content: string) => Promise<void>
  deleteFile: (name: string) => Promise<void>
}

// --- COMMAND REGISTRY ---
const commands: Record<string, CommandHandler> = {
  echo: async (args) => {
    return {
      type: "stdout",
      content: args.join(" "),
    }
  },

  pwd: async (_, ctx) => {
    return {
      type: "stdout",
      content: ctx.cwd,
    }
  },

  ls: async (args, ctx) => {
    // Basic implementation: Filter files by current folder
    // TODO: Handle 'ls path/to/folder'
    const targetPath = args[0] || ctx.cwd

    // Normalize path logic needed? For now assume root '.'
    // Files are flat list with names like "folder/file.txt"
    // We need to list items that are direct children.

    // Simplification: Root only for now or simple prefix match
    const prefix = targetPath === "/" || targetPath === "." ? "" : targetPath + "/"

    const items = new Set<string>()

    ctx.files.forEach((f) => {
      if (f.name.startsWith(prefix)) {
        // Extract next segment
        const relative = f.name.slice(prefix.length)
        const segment = relative.split("/")[0]
        if (segment) items.add(segment)
      }
    })

    return {
      type: "stdout",
      content: Array.from(items).join("  "),
    }
  },

  touch: async (args, ctx) => {
    if (!args[0]) return { type: "error", content: "usage: touch <filename>" }
    const filename = args[0]

    const exists = ctx.files.find((f) => f.name === filename)
    if (!exists) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ctx.createFile(filename, "plaintext" as any, "")
    }
    return
  },

  rm: async (args, ctx) => {
    if (!args[0]) return { type: "error", content: "usage: rm <filename>" }
    const filename = args[0]
    await ctx.deleteFile(filename)
    return
  },

  cat: async (args, ctx) => {
    if (!args[0]) return { type: "error", content: "usage: cat <filename>" }
    const filename = args[0]
    const file = ctx.files.find((f) => f.name === filename)

    if (!file) return { type: "error", content: `cat: ${filename}: No such file` }

    let content = ""
    if (typeof file.content === "string") {
      content = file.content
    } else {
      content = "[Binary File]"
    }

    return {
      type: "stdout",
      content,
    }
  },

  mkdir: async (args, ctx) => {
    if (!args[0]) return { type: "error", content: "usage: mkdir <directory>" }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.createFile(args[0], "folder" as any)
    return
  },
}

export function useShell(fs: FileSystemHooks) {
  // Shell State (could extend to Environment Variables, History, etc)
  const cwd = "."

  const execute = useCallback(
    async (input: string): Promise<ShellOutput> => {
      const parsed = parseCommand(input)
      if (!parsed) return { type: "info", content: "" }

      const handler = commands[parsed.command]
      if (!handler) {
        return { type: "error", content: `command not found: ${parsed.command}` }
      }

      // Build Context
      const ctx: ShellContext = {
        cwd,
        files: fs.files,
        createFile: fs.createFile,
        updateFile: fs.updateFile,
        deleteFile: fs.deleteFile,
        log: () => {}, // TODO: Streaming support
      }

      try {
        const result = await handler(parsed.args, ctx)
        const output = result || { type: "success", content: "" }

        // Handle Redirection
        if (parsed.redirect) {
          const content = output.content
          const target = parsed.redirect.target

          // > Overwrite
          if (parsed.redirect.type === "write") {
            const exists = fs.files.find((f) => f.name === target)
            if (exists) {
              await fs.updateFile(target, content)
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await fs.createFile(target, "plaintext" as any, content)
            }
          }
          // >> Append
          else if (parsed.redirect.type === "append") {
            const exists = fs.files.find((f) => f.name === target)
            if (exists && typeof exists.content === "string") {
              await fs.updateFile(target, exists.content + "\n" + content)
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await fs.createFile(target, "plaintext" as any, content)
            }
          }

          // Return empty success (silent) as output was redirected
          return { type: "success", content: "" }
        }

        return output
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e)
        return { type: "error", content: message }
      }
    },
    [fs, cwd]
  )

  return { execute }
}
