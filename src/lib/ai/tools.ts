/**
 * Tool definitions for Scapper AI Agent
 *
 * These tools allow the AI to interact with the CodeScapes file system.
 */

import type { GroqTool } from "./groqClient"
import type { ScapeFile } from "@/types/file"
import { searchFiles, replaceInFile } from "@/lib/search"
import { getLanguageFromFilename } from "@/lib/language-utils"

// --- Base Tool Definitions (sent to LLM) ---

const BASE_TOOLS: GroqTool[] = [
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List all files in the current project. Returns file names and their types.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description:
        "Read the contents of a file. Use this to understand existing code before making changes.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file path to read (e.g., 'main.py' or 'src/utils.js')",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_file",
      description:
        "Create a new file with the specified content. The file type is auto-detected from the extension.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file path to create (e.g., 'index.html' or 'src/App.tsx')",
          },
          content: {
            type: "string",
            description: "The complete content for the file",
          },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "overwrite_file",
      description:
        "Replace the entire content of an existing file. Use this when you want to completely rewrite a file instead of making small edits.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file path to overwrite",
          },
          content: {
            type: "string",
            description: "The new complete content for the file",
          },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "edit_file",
      description:
        "Edit a file by replacing specific text. Use read_file first to see the current content, then provide the exact text to replace.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file path to edit",
          },
          search: {
            type: "string",
            description: "The exact text to find and replace (must match exactly)",
          },
          replace: {
            type: "string",
            description: "The new text to replace it with",
          },
        },
        required: ["path", "search", "replace"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_file",
      description: "Delete a file from the project.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file path to delete",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_files",
      description:
        "Search for text across all files in the project. Returns matching lines with file names and line numbers.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The text or pattern to search for",
          },
        },
        required: ["query"],
      },
    },
  },
]

// --- Execution Tools (conditionally available) ---

const RUN_FILE_TOOL: GroqTool = {
  type: "function",
  function: {
    name: "run_file",
    description:
      "Execute a file and get the output. Use this to verify your code works after creating or editing it.",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "The file path to run (e.g., 'main.py')",
        },
      },
      required: ["path"],
    },
  },
}

const INSTALL_PACKAGE_TOOL: GroqTool = {
  type: "function",
  function: {
    name: "install_package",
    description:
      "Install a package using the environment's package manager (pip for Python, npm for Web).",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The package name to install (e.g., 'pandas', 'lodash')",
        },
      },
      required: ["name"],
    },
  },
}

// --- Dynamic Tool List Builder ---

export function getToolsForEnvironment(capabilities: {
  packages?: boolean
  terminal?: boolean
}): GroqTool[] {
  const tools = [...BASE_TOOLS]

  if (capabilities.terminal) {
    tools.push(RUN_FILE_TOOL)
  }

  if (capabilities.packages) {
    tools.push(INSTALL_PACKAGE_TOOL)
  }

  return tools
}

// Legacy export for backwards compatibility
export const SCAPPER_TOOLS = BASE_TOOLS

// --- Environment Info Type ---

export interface EnvironmentInfo {
  id: string
  name: string
  entryPoint: string
  capabilities: {
    packages?: boolean
    terminal?: boolean
  }
}

// --- Execution Result Types ---

export interface RunResult {
  stdout: string
  stderr: string
  exitCode?: number
}

export interface InstallResult {
  success: boolean
  logs: string
  error?: string
}

// --- Tool Executor Context ---

export interface ToolContext {
  // File operations
  files: ScapeFile[]
  createFile: (name: string, type: ScapeFile["language"], content?: string) => Promise<void>
  updateFile: (name: string, content: string) => Promise<void>
  deleteFile: (name: string) => Promise<void>

  // Environment awareness
  environment: EnvironmentInfo
  dependencies: string[]

  // Execution capabilities (optional - depends on environment)
  runFile?: (path: string) => Promise<RunResult>
  installPackage?: (name: string, onProgress?: (msg: string) => void) => Promise<InstallResult>
}

// --- Tool Result Type ---

export interface ToolResult {
  success: boolean
  output: string
  error?: string
}

// --- Tool Executors ---

export async function executeTool(
  toolName: string,
  args: Record<string, string>,
  ctx: ToolContext
): Promise<ToolResult> {
  try {
    switch (toolName) {
      case "list_files":
        return executeListFiles(ctx)

      case "read_file":
        return executeReadFile(args.path, ctx)

      case "create_file":
        return await executeCreateFile(args.path, args.content, ctx)

      case "edit_file":
        return await executeEditFile(args.path, args.search, args.replace, ctx)

      case "overwrite_file":
        return await executeOverwriteFile(args.path, args.content, ctx)

      case "delete_file":
        return await executeDeleteFile(args.path, ctx)

      case "search_files":
        return executeSearchFiles(args.query, ctx)

      case "run_file":
        return await executeRunFile(args.path, ctx)

      case "install_package":
        return await executeInstallPackage(args.name, ctx)

      default:
        return { success: false, output: "", error: `Unknown tool: ${toolName}` }
    }
  } catch (error) {
    return {
      success: false,
      output: "",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

function executeListFiles(ctx: ToolContext): ToolResult {
  const fileList = ctx.files
    .filter((f) => f.language !== "folder")
    .map((f) => `${f.name} (${f.language})`)
    .join("\n")

  return {
    success: true,
    output: fileList || "No files in project",
  }
}

function executeReadFile(path: string, ctx: ToolContext): ToolResult {
  const file = ctx.files.find((f) => f.name === path)

  if (!file) {
    return { success: false, output: "", error: `File not found: ${path}` }
  }

  if (file.language === "folder") {
    return { success: false, output: "", error: `Cannot read directory: ${path}` }
  }

  if (typeof file.content !== "string") {
    return { success: false, output: "", error: `Cannot read binary file: ${path}` }
  }

  return { success: true, output: file.content }
}

async function executeCreateFile(
  path: string,
  content: string,
  ctx: ToolContext
): Promise<ToolResult> {
  // Check if file already exists
  const existing = ctx.files.find((f) => f.name === path)
  if (existing) {
    return {
      success: false,
      output: "",
      error: `File already exists: ${path}`,
    }
  }

  // Detect language from extension
  const language = getLanguageFromFilename(path) as ScapeFile["language"]

  // Call the actual createFile callback FIRST
  await ctx.createFile(path, language, content)

  // Create file object for local context update AFTER callback succeeds
  // This prevents race condition where handleCreateFile sees file already exists
  const newFile: ScapeFile = {
    name: path,
    language,
    content,
  }
  ctx.files.push(newFile)

  const lines = content.split("\n").length
  return { success: true, output: `Created ${path} (${lines} lines)` }
}

async function executeEditFile(
  path: string,
  search: string,
  replace: string,
  ctx: ToolContext
): Promise<ToolResult> {
  const fileIndex = ctx.files.findIndex((f) => f.name === path)
  const file = ctx.files[fileIndex]

  if (!file) {
    return { success: false, output: "", error: `File not found: ${path}` }
  }

  if (typeof file.content !== "string") {
    return { success: false, output: "", error: `Cannot edit binary file: ${path}` }
  }

  // Perform replacement
  const { newContent, count } = replaceInFile(file.content, search, replace, {
    caseSensitive: true,
    regex: false,
  })

  if (count === 0) {
    return {
      success: false,
      output: "",
      error: `Text not found in ${path}: "${search.slice(0, 50)}..."`,
    }
  }

  // Update local context
  ctx.files[fileIndex] = { ...file, content: newContent }

  await ctx.updateFile(path, newContent)

  return { success: true, output: `Updated ${path} (${count} replacement${count > 1 ? "s" : ""})` }
}

async function executeOverwriteFile(
  path: string,
  content: string,
  ctx: ToolContext
): Promise<ToolResult> {
  const fileIndex = ctx.files.findIndex((f) => f.name === path)
  const file = ctx.files[fileIndex]

  if (!file) {
    return { success: false, output: "", error: `File not found: ${path}` }
  }

  // Call the update callback FIRST
  await ctx.updateFile(path, content)

  // Update local context AFTER callback succeeds
  ctx.files[fileIndex] = { ...file, content }

  const lines = content.split("\n").length
  return { success: true, output: `Overwrote ${path} (${lines} lines)` }
}

async function executeDeleteFile(path: string, ctx: ToolContext): Promise<ToolResult> {
  const fileIndex = ctx.files.findIndex((f) => f.name === path)

  if (fileIndex === -1) {
    return { success: false, output: "", error: `File not found: ${path}` }
  }

  // Call the actual delete callback FIRST
  await ctx.deleteFile(path)

  // Update local context AFTER callback succeeds
  ctx.files.splice(fileIndex, 1)

  return { success: true, output: `Deleted ${path}` }
}

function executeSearchFiles(query: string, ctx: ToolContext): ToolResult {
  const results = searchFiles(ctx.files, query, {
    caseSensitive: false,
    maxTotalResults: 50,
  })

  if (results.totalMatches === 0) {
    return { success: true, output: "No matches found" }
  }

  const lines: string[] = []
  for (const fileResult of results.results) {
    for (const match of fileResult.matches) {
      lines.push(`${fileResult.file.name}:${match.line}: ${match.lineContent.trim()}`)
    }
  }

  let output = lines.join("\n")
  if (results.truncated) {
    output += `\n... (${results.totalMatches} total matches, showing first 50)`
  }

  return { success: true, output }
}

// --- Execution Tools ---

async function executeRunFile(path: string, ctx: ToolContext): Promise<ToolResult> {
  if (!ctx.runFile) {
    return {
      success: false,
      output: "",
      error: "Run capability not available in this environment",
    }
  }

  // Find the file to verify it exists
  const file = ctx.files.find((f) => f.name === path)
  if (!file) {
    return { success: false, output: "", error: `File not found: ${path}` }
  }

  try {
    // Run with a timeout (30 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Execution timed out after 30 seconds")), 30000)
    })

    const result = await Promise.race([ctx.runFile(path), timeoutPromise])

    // Build output string
    let output = ""
    if (result.stdout) {
      output += result.stdout
    }
    if (result.stderr) {
      // Include stderr in output so the agent can see errors
      if (output) output += "\n"
      output += `[STDERR]\n${result.stderr}`
    }

    if (result.stderr && !result.stdout) {
      // Pure error case
      return {
        success: false,
        output: "",
        error: `Execution failed:\n${result.stderr}`,
      }
    }

    return {
      success: true,
      output: output || "(No output)",
    }
  } catch (error) {
    return {
      success: false,
      output: "",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function executeInstallPackage(name: string, ctx: ToolContext): Promise<ToolResult> {
  if (!ctx.installPackage) {
    return {
      success: false,
      output: "",
      error: "Package installation not available in this environment",
    }
  }

  try {
    // Longer timeout for package installs (120 seconds) - some packages like matplotlib are large
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Package installation timed out after 120 seconds`)),
        120000
      )
    })

    const result = await Promise.race([ctx.installPackage(name), timeoutPromise])

    if (result.success) {
      return {
        success: true,
        output: `Successfully installed ${name}${result.logs ? `\n${result.logs}` : ""}`,
      }
    } else {
      return {
        success: false,
        output: "",
        error: result.error || `Failed to install ${name}`,
      }
    }
  } catch (error) {
    return {
      success: false,
      output: "",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
