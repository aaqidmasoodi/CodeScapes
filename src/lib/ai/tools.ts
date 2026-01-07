/**
 * Tool definitions for Scapper AI Agent
 *
 * These tools allow the AI to interact with the CodeScapes file system.
 */

import type { GroqTool } from "./groqClient"
import type { ScapeFile } from "@/types/file"
import { searchFiles, replaceInFile } from "@/lib/search"
import { getLanguageFromFilename } from "@/lib/language-utils"
import { applySafeChanges, type SafeChange } from "./safe-diff"
import { saveMemory } from "./memory"
import { updateFileCache } from "./fileCache"

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

// --- Agentic Tools (always available) ---

const AGENTIC_TOOLS: GroqTool[] = [
  {
    type: "function",
    function: {
      name: "apply_diff",
      description:
        "Apply search/replace changes to a file. SAFER than line-based edits - uses fuzzy matching. The search text must exist in the file or the edit will fail safely (preventing accidental overwrites).",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file path to edit",
          },
          changes: {
            type: "array",
            description:
              "Array of search/replace changes. Each must have 'search' (exact text to find) and 'replace' (text to replace with).",
            items: {
              type: "object",
              properties: {
                search: {
                  type: "string",
                  description:
                    "The exact text to find in the file. Must match existing content. Include enough context to be unique.",
                },
                replace: {
                  type: "string",
                  description:
                    "The new text to replace the search text with. Use empty string to delete.",
                },
              },
              required: ["search", "replace"],
            },
          },
        },
        required: ["path", "changes"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_codebase",
      description:
        "Analyze the project structure and get an overview of all files with their sizes and types. Use this to understand the project before making changes.",
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
      name: "view_file_outline",
      description:
        "Get the structure of a file (functions, classes, imports) with line numbers. Useful for understanding file structure without reading the entire content.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file path to analyze",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "ask_user",
      description:
        "Ask the user a clarifying question when you need more information to proceed correctly. Use this when the request is ambiguous or you need to confirm something important.",
      parameters: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The question to ask the user",
          },
        },
        required: ["question"],
      },
    },
  },
]

// --- Planning Tools (for structured planning before execution) ---

const PLANNING_TOOLS: GroqTool[] = [
  {
    type: "function",
    function: {
      name: "propose_plan",
      description:
        "Propose a plan of changes before executing. Use this for multi-file changes or complex operations. The user will see the plan and can approve, edit, or cancel it.",
      parameters: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "Brief 1-2 sentence summary of what will be done",
          },
          steps: {
            type: "array",
            description: "List of steps in the plan",
            items: {
              type: "object",
              properties: {
                action: {
                  type: "string",
                  enum: ["create", "modify", "delete", "run", "install"],
                  description:
                    "Type of action: create file, modify file, delete file, run code, or install package",
                },
                target: {
                  type: "string",
                  description: "File path or package name this step affects",
                },
                description: {
                  type: "string",
                  description: "Human-readable description of what this step does",
                },
              },
              required: ["action", "target", "description"],
            },
          },
        },
        required: ["summary", "steps"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "execute_plan",
      description:
        "Execute an approved plan. Only call this AFTER the user has approved the plan from propose_plan. This signals you should proceed with the changes.",
      parameters: {
        type: "object",
        properties: {
          confirmation: {
            type: "string",
            description: "Set to 'approved' to confirm execution",
          },
        },
        required: ["confirmation"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_memory",
      description:
        "Save a summary of important decisions or context for future sessions. Use this when the user makes a significant preference known, or after completing a major task.",
      parameters: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "Brief summary of what was discussed or accomplished",
          },
          keyDecisions: {
            type: "array",
            items: { type: "string" },
            description: "List of key decisions or preferences the user expressed",
          },
        },
        required: ["summary"],
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
          description: "Comma-separated package names to install (e.g., 'pandas, numpy, scipy')",
        },
      },
      required: ["name"],
    },
  },
}

const LIST_PACKAGES_TOOL: GroqTool = {
  type: "function",
  function: {
    name: "list_packages",
    description:
      "List all currently installed packages in the environment. Use this to verify installations.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
}

const VERIFY_AND_RUN_TOOL: GroqTool = {
  type: "function",
  function: {
    name: "verify_and_run",
    description:
      "Run the code to verify it works. Returns structured result with any errors detected. Use after making changes to verify they work correctly.",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description:
            "Optional file path to run. If not provided, runs the entry point (e.g., main.py, index.html)",
        },
      },
      required: [],
    },
  },
}

// --- Dynamic Tool List Builder ---

export function getToolsForEnvironment(capabilities: {
  packages?: boolean
  terminal?: boolean
}): GroqTool[] {
  // Start with base file tools, then add agentic and planning tools
  const tools = [...BASE_TOOLS, ...AGENTIC_TOOLS, ...PLANNING_TOOLS]

  if (capabilities.terminal) {
    tools.push(RUN_FILE_TOOL)
    tools.push(VERIFY_AND_RUN_TOOL)
  }

  if (capabilities.packages) {
    tools.push(INSTALL_PACKAGE_TOOL)
    tools.push(LIST_PACKAGES_TOOL)
  }

  return tools
}

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "")
}

/**
 * Normalize content from LLM responses.
 * Handles common issues like:
 * - Literal "\\n" strings that should be actual newlines
 * - Literal "\\t" strings that should be actual tabs
 */
function normalizeContent(content: string): string {
  if (!content) return content

  // Check if content has actual newlines - if so, it's already correct
  if (content.includes("\n")) {
    return content
  }

  // Content has no newlines - likely the LLM returned literal \n sequences
  // Replace literal \n (two chars) with actual newline
  // Also handle \t for tabs
  return content.replace(/\\n/g, "\n").replace(/\\t/g, "\t")
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
  // Scape identification (for memory storage)
  scapeId: string

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
  listPackages?: () => Promise<{ name: string; version: string }[]>

  // Agentic capabilities
  askUser?: (question: string) => Promise<string>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Record<string, any>,
  ctx: ToolContext,
  onProgress?: (message: string) => void
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
        return await executeInstallPackage(args.name, ctx, onProgress)

      case "list_packages":
        return await executeListPackages(ctx)

      // --- Agentic Tools ---

      case "apply_diff":
        return await executeApplyDiff(args.path, args.changes, ctx)

      case "analyze_codebase":
        return executeAnalyzeCodebase(ctx)

      case "view_file_outline":
        return executeViewFileOutline(args.path, ctx)

      case "ask_user":
        return await executeAskUser(args.question, ctx)

      case "verify_and_run":
        return await executeVerifyAndRun(args.path, ctx)

      // --- Planning Tools ---

      case "propose_plan":
        return executeProposePlan(args.summary, args.steps)

      case "execute_plan":
        return executeExecutePlan(args.confirmation)

      case "save_memory":
        return await executeSaveMemory(args.summary, args.keyDecisions, ctx)

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
  const file = ctx.files.find((f) => normalizePath(f.name) === normalizePath(path))

  if (!file) {
    return { success: false, output: "", error: `File not found: ${path}` }
  }

  if (file.language === "folder") {
    return { success: false, output: "", error: `Cannot read directory: ${path}` }
  }

  if (typeof file.content !== "string") {
    return { success: false, output: "", error: `Cannot read binary file: ${path}` }
  }

  // Smart Truncation: Cap at 4000 characters (~1000 tokens)
  const MAX_CHARS = 4000
  let content = file.content
  if (content.length > MAX_CHARS) {
    content =
      content.slice(0, MAX_CHARS) +
      `\n\n[...File truncated. Displaying first ${MAX_CHARS} of ${file.content.length} characters. Use chunked reading if needed.]`
  }

  // Update Cache
  updateFileCache(file.name, content)

  return { success: true, output: content }
}

async function executeCreateFile(
  path: string,
  content: string,
  ctx: ToolContext
): Promise<ToolResult> {
  // Check if file already exists
  const existing = ctx.files.find((f) => normalizePath(f.name) === normalizePath(path))
  if (existing) {
    return {
      success: false,
      output: "",
      error: `File already exists: ${path}`,
    }
  }

  // Detect language from extension
  const language = getLanguageFromFilename(path) as ScapeFile["language"]

  // Normalize content to fix escaped newlines from LLM
  const normalizedContent = normalizeContent(content)

  // Call the actual createFile callback FIRST
  await ctx.createFile(path, language, normalizedContent)

  // Create file object for local context update AFTER callback succeeds
  // This prevents race condition where handleCreateFile sees file already exists
  const newFile: ScapeFile = {
    name: path,
    language,
    content: normalizedContent,
  }
  ctx.files.push(newFile)

  // Update Cache
  updateFileCache(path, normalizedContent)

  const lines = normalizedContent.split("\n").length
  return { success: true, output: `Created ${path} (${lines} lines)` }
}

async function executeEditFile(
  path: string,
  search: string,
  replace: string,
  ctx: ToolContext
): Promise<ToolResult> {
  const fileIndex = ctx.files.findIndex((f) => normalizePath(f.name) === normalizePath(path))
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
  const fileIndex = ctx.files.findIndex((f) => normalizePath(f.name) === normalizePath(path))
  const file = ctx.files[fileIndex]

  if (!file) {
    // If not found, try to create it? No, overwrite implies existing.
    // But maybe we should be lenient? The prompt says "NEVER use create_file on existing".
    // Does overwrite_file imply strict replacement?
    // Let's stick to strict existing check for now, but with normalized path.
    return { success: false, output: "", error: `File not found: ${path}` }
  }

  // Use the actual found name for the callback to ensure exact match if case differs (though we normalized)
  // Actually, we should probably use the matched file's name for the update to be safe
  const targetPath = file ? file.name : path

  // Normalize content to fix escaped newlines from LLM
  const normalizedContent = normalizeContent(content)

  // Call the update callback FIRST
  await ctx.updateFile(targetPath, normalizedContent)

  // Update local context AFTER callback succeeds
  ctx.files[fileIndex] = { ...file, content: normalizedContent }

  // Update Cache
  updateFileCache(targetPath, normalizedContent)

  const lines = normalizedContent.split("\n").length
  return { success: true, output: `Overwrote ${path} (${lines} lines)` }
}

async function executeDeleteFile(path: string, ctx: ToolContext): Promise<ToolResult> {
  const fileIndex = ctx.files.findIndex((f) => normalizePath(f.name) === normalizePath(path))

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

async function executeInstallPackage(
  names: string,
  ctx: ToolContext,
  onProgress?: (message: string) => void
): Promise<ToolResult> {
  if (!ctx.installPackage) {
    return {
      success: false,
      output: "",
      error: "Package installation not available in this environment",
    }
  }

  const packages = names
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean)
  if (packages.length === 0) {
    return { success: false, output: "", error: "No package names provided" }
  }

  const results: string[] = []
  const errors: string[] = []

  try {
    // 120s timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Package installation timed out after 120 seconds`)),
        120000
      )
    })

    if (onProgress) onProgress(`Installing ${packages.join(", ")}...`)

    // Send as JSON payload to support batching
    const payload = JSON.stringify({ packages })
    const result = await Promise.race([ctx.installPackage(payload), timeoutPromise])

    if (result.success) {
      results.push(`✓ Installed ${packages.join(", ")}`)
    } else {
      errors.push(`✗ Failed: ${result.error}`)
    }
  } catch (error) {
    errors.push(`✗ Error: ${error instanceof Error ? error.message : String(error)}`)
  }

  const success = errors.length === 0
  const output = [...results, ...errors].join("\n")

  return {
    success,
    output,
    error: success ? undefined : "Some packages failed to install",
  }
}

async function executeListPackages(ctx: ToolContext): Promise<ToolResult> {
  if (!ctx.listPackages) {
    return { success: false, output: "", error: "Environment does not support listing packages." }
  }

  try {
    const packages = await ctx.listPackages()

    if (packages.length === 0) {
      return { success: true, output: "No packages installed." }
    }

    const lines = packages.map((p) => `${p.name} (${p.version})`)
    return {
      success: true,
      output: `Installed Packages:\n${lines.join("\n")}`,
    }
  } catch (error) {
    return {
      success: false,
      output: "",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// --- Agentic Tool Executors ---

/**
 * Apply search/replace changes to a file using fuzzy matching.
 * Much safer than line-based edits - search text must exist or edit fails.
 */
async function executeApplyDiff(
  path: string,
  changes: SafeChange[],
  ctx: ToolContext
): Promise<ToolResult> {
  const fileIndex = ctx.files.findIndex((f) => normalizePath(f.name) === normalizePath(path))
  const file = ctx.files[fileIndex]

  if (!file) {
    return { success: false, output: "", error: `File not found: ${path}` }
  }

  if (typeof file.content !== "string") {
    return { success: false, output: "", error: `Cannot edit binary file: ${path}` }
  }

  if (!changes || !Array.isArray(changes) || changes.length === 0) {
    return { success: false, output: "", error: "No changes provided" }
  }

  // Validate changes have required fields
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i]
    if (typeof change.search !== "string") {
      return { success: false, output: "", error: `Change ${i + 1}: missing 'search' field` }
    }
    if (typeof change.replace !== "string" && change.replace !== undefined) {
      return { success: false, output: "", error: `Change ${i + 1}: 'replace' must be a string` }
    }
    // Default empty replace to empty string
    if (change.replace === undefined) {
      change.replace = ""
    }
  }

  const originalContent = file.content
  const originalLines = originalContent.split("\n").length

  // Apply changes using safe-diff utility
  const result = applySafeChanges(originalContent, changes, {
    allowPartial: false, // All changes must succeed
    fuzzyMatch: true, // Enable fuzzy matching for resilience
  })

  if (!result.success) {
    // Build a helpful error message
    const failedList = result.failedChanges.map((f) => `  - "${f.search}": ${f.reason}`).join("\n")
    return {
      success: false,
      output: "",
      error: `Failed to apply changes:\n${failedList}`,
    }
  }

  // Update local context
  ctx.files[fileIndex] = { ...file, content: result.newContent }

  // Persist change
  await ctx.updateFile(file.name, result.newContent)

  // Update Cache
  updateFileCache(file.name, result.newContent)

  const newLines = result.newContent.split("\n").length
  const linesDelta = newLines - originalLines
  const deltaStr = linesDelta >= 0 ? `+${linesDelta}` : `${linesDelta}`

  return {
    success: true,
    output: `Applied ${result.appliedChanges} change${result.appliedChanges > 1 ? "s" : ""} to ${path} (${deltaStr} lines)`,
  }
}

/**
 * Analyze the codebase structure and provide an overview.
 */
function executeAnalyzeCodebase(ctx: ToolContext): ToolResult {
  const files = ctx.files.filter((f) => f.language !== "folder")
  const folders = ctx.files.filter((f) => f.language === "folder")

  // Group files by type
  const byType: Record<string, string[]> = {}
  for (const file of files) {
    const type = file.language || "unknown"
    if (!byType[type]) byType[type] = []
    byType[type].push(file.name)
  }

  // Build output
  const lines: string[] = []
  lines.push(`📁 Project Overview`)
  lines.push(`Total: ${files.length} files, ${folders.length} folders`)
  lines.push(`Entry Point: ${ctx.environment.entryPoint}`)
  lines.push(`Environment: ${ctx.environment.name}`)
  lines.push("")

  // Files by type
  lines.push("Files by type:")
  for (const [type, fileNames] of Object.entries(byType).sort()) {
    lines.push(`  ${type}: ${fileNames.length} file${fileNames.length > 1 ? "s" : ""}`)
    for (const name of fileNames.slice(0, 5)) {
      const file = ctx.files.find((f) => f.name === name)
      const size = typeof file?.content === "string" ? file.content.length : 0
      lines.push(`    - ${name} (${size} bytes)`)
    }
    if (fileNames.length > 5) {
      lines.push(`    ... and ${fileNames.length - 5} more`)
    }
  }

  // List dependencies if any
  if (ctx.dependencies.length > 0) {
    lines.push("")
    lines.push(`Dependencies: ${ctx.dependencies.join(", ")}`)
  }

  return { success: true, output: lines.join("\n") }
}

/**
 * Extract an outline of a file (functions, classes, imports).
 * Works for Python, JavaScript, TypeScript.
 */
function executeViewFileOutline(path: string, ctx: ToolContext): ToolResult {
  const file = ctx.files.find((f) => normalizePath(f.name) === normalizePath(path))

  if (!file) {
    return { success: false, output: "", error: `File not found: ${path}` }
  }

  if (typeof file.content !== "string") {
    return { success: false, output: "", error: `Cannot analyze binary file: ${path}` }
  }

  const lines = file.content.split("\n")
  const outline: string[] = []
  outline.push(`📄 ${path} (${lines.length} lines)`)
  outline.push("")

  const lang = file.language || ""

  // Python patterns
  if (lang === "python" || path.endsWith(".py")) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Imports
      if (trimmed.startsWith("import ") || trimmed.startsWith("from ")) {
        outline.push(`  L${i + 1}: ${trimmed}`)
      }
      // Functions
      else if (trimmed.startsWith("def ")) {
        const match = trimmed.match(/^def\s+(\w+)\s*\(/)
        if (match) {
          outline.push(`  L${i + 1}: def ${match[1]}()`)
        }
      }
      // Classes
      else if (trimmed.startsWith("class ")) {
        const match = trimmed.match(/^class\s+(\w+)/)
        if (match) {
          outline.push(`  L${i + 1}: class ${match[1]}`)
        }
      }
    }
  }
  // JavaScript/TypeScript patterns (check by file extension)
  else if (
    path.endsWith(".js") ||
    path.endsWith(".ts") ||
    path.endsWith(".jsx") ||
    path.endsWith(".tsx") ||
    path.endsWith(".mjs") ||
    path.endsWith(".cjs")
  ) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Imports
      if (trimmed.startsWith("import ")) {
        const short = trimmed.length > 60 ? trimmed.slice(0, 57) + "..." : trimmed
        outline.push(`  L${i + 1}: ${short}`)
      }
      // Exports
      else if (trimmed.startsWith("export ")) {
        if (
          trimmed.includes("function ") ||
          trimmed.includes("const ") ||
          trimmed.includes("class ")
        ) {
          const short = trimmed.length > 60 ? trimmed.slice(0, 57) + "..." : trimmed
          outline.push(`  L${i + 1}: ${short}`)
        }
      }
      // Functions
      else if (trimmed.startsWith("function ") || trimmed.match(/^(async\s+)?function\s+\w+/)) {
        const match = trimmed.match(/function\s+(\w+)/)
        if (match) {
          outline.push(`  L${i + 1}: function ${match[1]}()`)
        }
      }
      // Arrow functions assigned to const/let
      else if (trimmed.match(/^(const|let|var)\s+\w+\s*=\s*(async\s+)?\(/)) {
        const match = trimmed.match(/^(const|let|var)\s+(\w+)/)
        if (match) {
          outline.push(`  L${i + 1}: ${match[1]} ${match[2]} = () => ...`)
        }
      }
      // Classes
      else if (trimmed.startsWith("class ")) {
        const match = trimmed.match(/^class\s+(\w+)/)
        if (match) {
          outline.push(`  L${i + 1}: class ${match[1]}`)
        }
      }
    }
  }
  // HTML/CSS - simpler outline
  else if (lang === "html" || path.endsWith(".html")) {
    outline.push("  (HTML file - use read_file for full content)")
  } else if (lang === "css" || path.endsWith(".css")) {
    // Count selectors
    const selectorCount = (file.content.match(/\{/g) || []).length
    outline.push(`  ${selectorCount} CSS rule(s)`)
  } else {
    outline.push("  (Outline not available for this file type)")
  }

  if (outline.length <= 2) {
    outline.push("  (No notable structures found)")
  }

  return { success: true, output: outline.join("\n") }
}

/**
 * Ask the user a clarifying question.
 */
async function executeAskUser(question: string, ctx: ToolContext): Promise<ToolResult> {
  if (!ctx.askUser) {
    return {
      success: false,
      output: "",
      error: "ask_user is not available in this context",
    }
  }

  if (!question || question.trim() === "") {
    return { success: false, output: "", error: "No question provided" }
  }

  try {
    const answer = await ctx.askUser(question)
    return {
      success: true,
      output: `User responded: ${answer}`,
    }
  } catch (error) {
    return {
      success: false,
      output: "",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// --- Verification Result Type ---

export interface VerificationResult extends ToolResult {
  hasError: boolean
  errorType?: "syntax" | "import" | "runtime" | "timeout" | "unknown"
  errorMessage?: string
}

/**
 * Run code and return structured result with error detection.
 * Used for automatic verification after making changes.
 */
async function executeVerifyAndRun(
  path: string | undefined,
  ctx: ToolContext
): Promise<ToolResult> {
  if (!ctx.runFile) {
    return {
      success: false,
      output: "",
      error: "Run capability not available in this environment",
    }
  }

  // Use provided path or fall back to entry point
  const targetPath = path || ctx.environment.entryPoint

  // Verify the file exists
  const file = ctx.files.find((f) => normalizePath(f.name) === normalizePath(targetPath))
  if (!file) {
    return {
      success: false,
      output: "",
      error: `File not found: ${targetPath}`,
    }
  }

  try {
    // Run with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Execution timed out after 30 seconds")), 30000)
    })

    const result = await Promise.race([ctx.runFile(targetPath), timeoutPromise])

    // Analyze the output for errors
    const hasError = detectError(result.stdout, result.stderr)
    const errorInfo = hasError ? classifyError(result.stdout, result.stderr) : null

    // Build structured output
    let output = ""

    if (result.stdout) {
      output += result.stdout
    }

    if (result.stderr) {
      if (output) output += "\n"
      output += `[STDERR]\n${result.stderr}`
    }

    if (hasError && errorInfo) {
      // Add error summary for the AI
      output += `\n\n[ERROR DETECTED]\nType: ${errorInfo.type}\nMessage: ${errorInfo.message}`
    }

    // Return appropriate success status
    // If there's an error, we still return success: true but include error info
    // This allows the AI to see the error and attempt to fix it
    return {
      success: true,
      output: output || "(No output - execution completed silently)",
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Check if it's a timeout
    if (errorMessage.includes("timed out")) {
      return {
        success: false,
        output: "",
        error: `Execution timed out. The code may have an infinite loop or is waiting for input.`,
      }
    }

    return {
      success: false,
      output: "",
      error: errorMessage,
    }
  }
}

/**
 * Detect if the output contains an error.
 */
function detectError(stdout: string, stderr: string): boolean {
  const combined = `${stdout}\n${stderr}`.toLowerCase()

  // Python error patterns
  if (combined.includes("traceback (most recent call last)")) return true
  if (combined.includes("syntaxerror:")) return true
  if (combined.includes("nameerror:")) return true
  if (combined.includes("typeerror:")) return true
  if (combined.includes("valueerror:")) return true
  if (combined.includes("importerror:")) return true
  if (combined.includes("modulenotfounderror:")) return true
  if (combined.includes("attributeerror:")) return true
  if (combined.includes("indentationerror:")) return true

  // JavaScript error patterns
  if (combined.includes("uncaught")) return true
  if (combined.includes("referenceerror:")) return true
  if (combined.includes("syntaxerror:")) return true
  if (combined.includes("typeerror:")) return true

  // Generic error patterns
  if (stderr.trim().length > 0 && !stderr.includes("warning")) return true

  return false
}

/**
 * Classify the type of error for better AI understanding.
 */
function classifyError(
  stdout: string,
  stderr: string
): { type: "syntax" | "import" | "runtime" | "unknown"; message: string } {
  const combined = `${stdout}\n${stderr}`
  const lowerCombined = combined.toLowerCase()

  // Syntax errors
  if (lowerCombined.includes("syntaxerror") || lowerCombined.includes("indentationerror")) {
    const match = combined.match(/(?:SyntaxError|IndentationError):\s*(.+)/i)
    return {
      type: "syntax",
      message: match ? match[1].trim() : "Syntax error in code",
    }
  }

  // Import errors
  if (lowerCombined.includes("importerror") || lowerCombined.includes("modulenotfounderror")) {
    const match = combined.match(/(?:ImportError|ModuleNotFoundError):\s*(.+)/i)
    return {
      type: "import",
      message: match ? match[1].trim() : "Import/module error",
    }
  }

  // Runtime errors (NameError, TypeError, ValueError, etc.)
  const runtimePatterns = [
    "nameerror",
    "typeerror",
    "valueerror",
    "attributeerror",
    "referenceerror",
  ]
  for (const pattern of runtimePatterns) {
    if (lowerCombined.includes(pattern)) {
      const regex = new RegExp(`${pattern}:\\s*(.+)`, "i")
      const match = combined.match(regex)
      return {
        type: "runtime",
        message: match ? match[1].trim() : "Runtime error",
      }
    }
  }

  // Unknown error
  return {
    type: "unknown",
    message: stderr.slice(0, 200) || "Unknown error occurred",
  }
}

// --- Planning Tool Types ---

export interface PlanStep {
  action: "create" | "modify" | "delete" | "run" | "install"
  target: string
  description: string
}

export interface ProposedPlan {
  summary: string
  steps: PlanStep[]
}

// --- Planning Tool Execution ---

function executeProposePlan(summary: string, steps: PlanStep[]): ToolResult {
  // Encode the plan as JSON in the output so the UI can parse and display it
  const plan: ProposedPlan = { summary, steps }

  return {
    success: true,
    output: `[PLAN_PROPOSAL]${JSON.stringify(plan)}[/PLAN_PROPOSAL]`,
    // The agent.ts and UI will detect this special format and handle it
  }
}

function executeExecutePlan(confirmation: string): ToolResult {
  if (confirmation !== "approved") {
    return {
      success: false,
      output: "",
      error: "Plan not approved. User must approve the plan before execution.",
    }
  }

  return {
    success: true,
    output: "[PLAN_APPROVED] Proceeding with execution...",
  }
}

async function executeSaveMemory(
  summary: string,
  keyDecisions: string[] = [],
  ctx: ToolContext
): Promise<ToolResult> {
  try {
    // Get list of files that were likely modified this session
    const filesChanged = ctx.files.filter((f) => f.language !== "folder").map((f) => f.name)

    await saveMemory(ctx.scapeId, summary, filesChanged, keyDecisions)

    return {
      success: true,
      output: `Memory saved: "${summary}"`,
    }
  } catch (e) {
    return {
      success: false,
      output: "",
      error: `Failed to save memory: ${e instanceof Error ? e.message : String(e)}`,
    }
  }
}
