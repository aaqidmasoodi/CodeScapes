import { useCallback } from "react"
import { parseCommand } from "@/lib/shell/parser"
import type { CommandHandler, ShellContext, ShellOutput } from "@/lib/shell/types"
import type { ScapeFile } from "@/types/file"
import { searchFiles } from "@/lib/search"
import { getLanguageFromFilename } from "@/lib/language-utils"

// Kernel Interface - Needs access to file system hooks
interface FileSystemHooks {
  files: ScapeFile[]
  createFile: (name: string, type: ScapeFile["language"], content?: string) => Promise<void>
  updateFile: (name: string, content: string) => Promise<void>
  deleteFile: (name: string) => Promise<void>
  // Bridge to external runners (like Python pip)
  onExecCommand?: (
    cmd: string,
    arg: string
  ) => Promise<{ success: boolean; warning?: string; error?: string }>
  onLog?: (output: ShellOutput) => void
}

// --- HELPER FUNCTIONS ---

/**
 * Check if a path represents a folder in the file system
 */
function isFolder(files: ScapeFile[], path: string): boolean {
  const file = files.find((f) => f.name === path)
  return file?.language === "folder"
}

/**
 * Check if a file/folder exists
 */
function exists(files: ScapeFile[], path: string): ScapeFile | undefined {
  return files.find((f) => f.name === path)
}

/**
 * Validate filename for common issues
 */
function validateFilename(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim() === "") {
    return { valid: false, error: "missing operand" }
  }

  // Check for invalid characters (null bytes - bash-like restrictions)
  // eslint-disable-next-line no-control-regex
  const invalidChars = /[\x00]/
  if (invalidChars.test(name)) {
    return { valid: false, error: `invalid filename: '${name}'` }
  }

  return { valid: true }
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
    // Parse flags
    let showAll = false
    let longFormat = false
    const paths: string[] = []

    for (const arg of args) {
      if (arg === "-a" || arg === "--all") {
        showAll = true
      } else if (arg === "-l") {
        longFormat = true
      } else if (arg === "-la" || arg === "-al") {
        showAll = true
        longFormat = true
      } else if (!arg.startsWith("-")) {
        paths.push(arg)
      }
    }

    const targetPath = paths[0] || ctx.cwd

    // Check if target exists and is not a file
    const targetFile = exists(ctx.files, targetPath)
    if (targetFile && targetFile.language !== "folder") {
      // ls on a file just returns the file name (bash behavior)
      return { type: "stdout", content: targetPath }
    }

    const prefix = targetPath === "/" || targetPath === "." ? "" : targetPath + "/"

    const items = new Set<string>()

    ctx.files.forEach((f) => {
      if (f.name.startsWith(prefix)) {
        // Extract next segment
        const relative = f.name.slice(prefix.length)
        const segment = relative.split("/")[0]
        if (segment) {
          // Skip hidden files unless -a flag
          if (!showAll && segment.startsWith(".")) return
          items.add(segment)
        }
      }
    })

    if (items.size === 0) {
      return { type: "stdout", content: "" }
    }

    if (longFormat) {
      // Simple long format
      const lines: string[] = []
      const sortedItems = Array.from(items).sort()
      for (const item of sortedItems) {
        const fullPath = prefix + item
        const file = ctx.files.find((f) => f.name === fullPath)
        const type = file?.language === "folder" ? "d" : "-"
        const size = typeof file?.content === "string" ? file.content.length : 0
        lines.push(`${type}rw-r--r--  ${String(size).padStart(6)}  ${item}`)
      }
      return { type: "stdout", content: lines.join("\n") }
    }

    return {
      type: "stdout",
      content: Array.from(items).sort().join("  "),
    }
  },

  touch: async (args, ctx) => {
    if (args.length === 0) {
      return { type: "error", content: "touch: missing file operand" }
    }

    for (const filename of args) {
      const validation = validateFilename(filename)
      if (!validation.valid) {
        return { type: "error", content: `touch: ${validation.error}` }
      }

      const existing = exists(ctx.files, filename)

      // Can't touch a directory
      if (existing?.language === "folder") {
        // In real bash, touch on directory updates timestamp. Here we just skip.
        continue
      }

      if (!existing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await ctx.createFile(filename, "plaintext" as any, "")
      }
      // If file exists, bash would update timestamp - we just do nothing
    }
    return
  },

  rm: async (args, ctx) => {
    // Parse flags
    let recursive = false
    let force = false
    const targets: string[] = []

    for (const arg of args) {
      if (arg === "-r" || arg === "-R" || arg === "--recursive") {
        recursive = true
      } else if (arg === "-f" || arg === "--force") {
        force = true
      } else if (arg === "-rf" || arg === "-fr") {
        recursive = true
        force = true
      } else if (!arg.startsWith("-")) {
        targets.push(arg)
      }
    }

    if (targets.length === 0) {
      return { type: "error", content: "rm: missing operand" }
    }

    for (const target of targets) {
      const file = exists(ctx.files, target)

      if (!file) {
        if (!force) {
          return {
            type: "error",
            content: `rm: cannot remove '${target}': No such file or directory`,
          }
        }
        continue // -f silently ignores missing files
      }

      if (file.language === "folder") {
        if (!recursive) {
          return { type: "error", content: `rm: cannot remove '${target}': Is a directory` }
        }
        // Delete folder and all children
        const prefix = target + "/"
        const toDelete = ctx.files.filter((f) => f.name === target || f.name.startsWith(prefix))
        for (const f of toDelete) {
          await ctx.deleteFile(f.name)
        }
      } else {
        await ctx.deleteFile(target)
      }
    }

    return
  },

  cat: async (args, ctx) => {
    if (args.length === 0) {
      return { type: "error", content: "cat: missing operand" }
    }

    const outputs: string[] = []

    for (const filename of args) {
      const file = exists(ctx.files, filename)

      if (!file) {
        return { type: "error", content: `cat: ${filename}: No such file or directory` }
      }

      if (file.language === "folder") {
        return { type: "error", content: `cat: ${filename}: Is a directory` }
      }

      if (typeof file.content === "string") {
        outputs.push(file.content)
      } else {
        outputs.push("[Binary File]")
      }
    }

    return {
      type: "stdout",
      content: outputs.join("\n"),
    }
  },

  mkdir: async (args, ctx) => {
    // Parse flags
    let createParents = false
    const dirs: string[] = []

    for (const arg of args) {
      if (arg === "-p" || arg === "--parents") {
        createParents = true
      } else if (!arg.startsWith("-")) {
        dirs.push(arg)
      }
    }

    if (dirs.length === 0) {
      return { type: "error", content: "mkdir: missing operand" }
    }

    for (const dir of dirs) {
      const validation = validateFilename(dir)
      if (!validation.valid) {
        return { type: "error", content: `mkdir: ${validation.error}` }
      }

      const existing = exists(ctx.files, dir)

      if (existing) {
        if (!createParents) {
          return { type: "error", content: `mkdir: cannot create directory '${dir}': File exists` }
        }
        // -p flag silently ignores existing directories
        continue
      }

      // Create parent directories if -p flag
      if (createParents) {
        const parts = dir.split("/")
        let currentPath = ""
        for (const part of parts) {
          currentPath = currentPath ? `${currentPath}/${part}` : part
          if (!exists(ctx.files, currentPath)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await ctx.createFile(currentPath, "folder" as any)
          }
        }
      } else {
        // Check if parent exists
        const lastSlash = dir.lastIndexOf("/")
        if (lastSlash > 0) {
          const parent = dir.substring(0, lastSlash)
          if (!exists(ctx.files, parent)) {
            return {
              type: "error",
              content: `mkdir: cannot create directory '${dir}': No such file or directory`,
            }
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await ctx.createFile(dir, "folder" as any)
      }
    }

    return
  },

  grep: async (args, ctx) => {
    // Parse flags
    let caseInsensitive = false
    let listFilesOnly = false
    let lineNumbers = true // Default on like grep -n
    let invertMatch = false
    const patterns: string[] = []
    const fileFilters: string[] = []

    for (const arg of args) {
      if (arg === "-i" || arg === "--ignore-case") {
        caseInsensitive = true
      } else if (arg === "-l" || arg === "--files-with-matches") {
        listFilesOnly = true
      } else if (arg === "-n" || arg === "--line-number") {
        lineNumbers = true
      } else if (arg === "-v" || arg === "--invert-match") {
        invertMatch = true
      } else if (arg.startsWith("-")) {
        // Ignore unknown flags
      } else if (patterns.length === 0) {
        patterns.push(arg)
      } else {
        fileFilters.push(arg)
      }
    }

    if (patterns.length === 0) {
      return { type: "error", content: "usage: grep [-i] [-l] [-n] [-v] PATTERN [FILE...]" }
    }

    const pattern = patterns[0]

    // Filter files if specified
    let filesToSearch = ctx.files.filter((f) => f.language !== "folder")
    if (fileFilters.length > 0) {
      filesToSearch = filesToSearch.filter((f) =>
        fileFilters.some((filter) => f.name.includes(filter))
      )
    }

    if (invertMatch) {
      // For -v, we need to manually filter lines
      const lines: string[] = []
      const regex = new RegExp(pattern, caseInsensitive ? "gi" : "g")

      for (const file of filesToSearch) {
        if (typeof file.content !== "string") continue
        const fileLines = file.content.split("\n")

        for (let i = 0; i < fileLines.length; i++) {
          if (!regex.test(fileLines[i])) {
            if (lineNumbers) {
              lines.push(`${file.name}:${i + 1}:${fileLines[i]}`)
            } else {
              lines.push(`${file.name}:${fileLines[i]}`)
            }
          }
          regex.lastIndex = 0 // Reset for global regex
        }
      }

      return { type: "stdout", content: lines.join("\n") }
    }

    // Perform search
    const results = searchFiles(filesToSearch, pattern, {
      caseSensitive: !caseInsensitive,
      regex: false,
      maxTotalResults: 200,
    })

    if (results.totalMatches === 0) {
      return { type: "stdout", content: "" }
    }

    // Format output
    const lines: string[] = []

    if (listFilesOnly) {
      // Just list file names
      for (const fileResult of results.results) {
        lines.push(fileResult.file.name)
      }
    } else {
      // Show matches with line numbers
      for (const fileResult of results.results) {
        for (const match of fileResult.matches) {
          if (lineNumbers) {
            lines.push(`${fileResult.file.name}:${match.line}:${match.lineContent}`)
          } else {
            lines.push(`${fileResult.file.name}:${match.lineContent}`)
          }
        }
      }
    }

    return { type: "stdout", content: lines.join("\n") }
  },

  pip: async (args, ctx) => {
    if (!ctx.execCommand) {
      return { type: "error", content: "pip: environment does not support package management" }
    }

    // Basic Args Parser
    const subCmd = args[0]
    const rawArgs = args.slice(1)

    // Flags
    const flags: Record<string, boolean> = {
      noDeps: false,
      keepGoing: false,
      verbose: false,
    }

    const packages: string[] = []

    // Parse arguments
    for (const arg of rawArgs) {
      if (arg === "--no-deps") flags.noDeps = true
      else if (arg === "--keep-going") flags.keepGoing = true
      else if (arg === "--verbose" || arg === "-v") flags.verbose = true
      else if (!arg.startsWith("-")) packages.push(arg)
      // else ignore unknown flags for now
    }

    if (subCmd === "install") {
      if (packages.length === 0)
        return { type: "error", content: "usage: pip install PACKAGE [PACKAGE...] [options]" }

      const pkgList = packages.join(", ")
      ctx.log({ type: "stdout", content: `Collecting ${pkgList}...` })
      if (flags.noDeps) ctx.log({ type: "stdout", content: "  Using cached/no-deps mode" })

      try {
        const payload = JSON.stringify({
          packages,
          options: flags,
        })

        const result = await ctx.execCommand("pip-install", payload, (msg) => {
          ctx.log({ type: "stdout", content: msg })
        })

        if (result.success) {
          return { type: "stdout", content: `Successfully installed ${pkgList}` }
        } else {
          return { type: "error", content: `Failed to install ${pkgList}: ${result.error}` }
        }
      } catch (e) {
        return { type: "error", content: `Error: ${e}` }
      }
    }

    if (subCmd === "uninstall") {
      if (packages.length === 0) return { type: "error", content: "usage: pip uninstall PACKAGE" }

      const pkg = packages[0]
      if (packages.length > 1)
        ctx.log({
          type: "stdout",
          content:
            "Note: Uninstalling multiple packages is not supported yet. Processing only the first one.",
        })

      ctx.log({ type: "stdout", content: `Found existing installation: ${pkg}` })
      ctx.log({ type: "stdout", content: `Uninstalling ${pkg}...` })

      try {
        const result = await ctx.execCommand("pip-uninstall", pkg)
        if (result.success) {
          return { type: "stdout", content: `Successfully uninstalled ${pkg}` }
        } else {
          return { type: "error", content: `Failed to uninstall ${pkg}: ${result.error}` }
        }
      } catch (e) {
        return { type: "error", content: `Error: ${e}` }
      }
    }

    return { type: "stdout", content: "usage: pip install PACKAGE | pip uninstall PACKAGE" }
  },

  // --- Additional helpful commands ---

  clear: async () => {
    return { type: "clear", content: "" }
  },

  help: async () => {
    const helpText = `Available commands:
  echo [TEXT...]        Print text to output
  pwd                   Print working directory
  ls [-la] [PATH]       List directory contents
  cat FILE [FILE...]    Display file contents
  touch FILE [FILE...]  Create empty file(s)
  mkdir [-p] DIR        Create directory
  rm [-rf] FILE         Remove file or directory
  grep [-ilnv] PATTERN [FILE...]  Search for pattern
  pip install PKG       Install Python package
  scapper               Start AI coding assistant
  clear                 Clear terminal
  help                  Show this help`
    return { type: "stdout", content: helpText }
  },

  scapper: async () => {
    // Special command that signals TerminalPane to enter scapper mode
    return { type: "scapper-enter", content: "" }
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
        return { type: "error", content: `${parsed.command}: command not found` }
      }

      // Build Context
      const ctx: ShellContext = {
        cwd,
        files: fs.files,
        createFile: fs.createFile,
        updateFile: fs.updateFile,
        deleteFile: fs.deleteFile,
        execCommand: fs.onExecCommand, // Pass the bridge
        log: fs.onLog || (() => {}),
      }

      try {
        const result = await handler(parsed.args, ctx)
        const output = result || { type: "success", content: "" }

        // Handle Redirection
        if (parsed.redirect) {
          const content = output.content
          const target = parsed.redirect.target

          // Validate redirect target
          if (!target || target.trim() === "") {
            return { type: "error", content: "syntax error near unexpected token `newline'" }
          }

          // Cannot redirect to a directory
          if (isFolder(fs.files, target)) {
            return { type: "error", content: `bash: ${target}: Is a directory` }
          }

          // > Overwrite
          if (parsed.redirect.type === "write") {
            const existingFile = exists(fs.files, target)
            if (existingFile) {
              await fs.updateFile(target, content)
            } else {
              // Detect language from file extension
              const language = getLanguageFromFilename(target) as ScapeFile["language"]
              await fs.createFile(target, language, content)
            }
          }
          // >> Append
          else if (parsed.redirect.type === "append") {
            const existingFile = exists(fs.files, target)
            if (existingFile && typeof existingFile.content === "string") {
              await fs.updateFile(target, existingFile.content + "\n" + content)
            } else if (existingFile) {
              return { type: "error", content: `bash: ${target}: cannot append to binary file` }
            } else {
              // Detect language from file extension
              const language = getLanguageFromFilename(target) as ScapeFile["language"]
              await fs.createFile(target, language, content)
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
