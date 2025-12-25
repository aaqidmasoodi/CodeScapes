/**
 * Tool definitions for Scapper AI Agent
 *
 * These tools allow the AI to interact with the CodeScapes file system.
 */

import type { GroqTool } from "./groqClient"
import type { ScapeFile } from "@/types/file"
import { searchFiles, replaceInFile } from "@/lib/search"
import { getLanguageFromFilename } from "@/lib/language-utils"

// --- Tool Definitions (sent to LLM) ---

export const SCAPPER_TOOLS: GroqTool[] = [
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

// --- Tool Executor Context ---

export interface ToolContext {
  files: ScapeFile[]
  createFile: (name: string, type: ScapeFile["language"], content?: string) => Promise<void>
  updateFile: (name: string, content: string) => Promise<void>
  deleteFile: (name: string) => Promise<void>
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

      case "delete_file":
        return await executeDeleteFile(args.path, ctx)

      case "search_files":
        return executeSearchFiles(args.query, ctx)

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

  await ctx.createFile(path, language, content)

  const lines = content.split("\n").length
  return { success: true, output: `Created ${path} (${lines} lines)` }
}

async function executeEditFile(
  path: string,
  search: string,
  replace: string,
  ctx: ToolContext
): Promise<ToolResult> {
  const file = ctx.files.find((f) => f.name === path)

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

  await ctx.updateFile(path, newContent)

  return { success: true, output: `Updated ${path} (${count} replacement${count > 1 ? "s" : ""})` }
}

async function executeDeleteFile(path: string, ctx: ToolContext): Promise<ToolResult> {
  const file = ctx.files.find((f) => f.name === path)

  if (!file) {
    return { success: false, output: "", error: `File not found: ${path}` }
  }

  await ctx.deleteFile(path)

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
