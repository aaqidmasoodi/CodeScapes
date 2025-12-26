/**
 * Scapper Agent - Core AI Logic
 *
 * Manages conversation, tool execution loop, and progress reporting.
 */

import { chatCompletion, parseToolArguments, GroqAPIError } from "./groqClient"
import type { GroqMessage, GroqToolCall } from "./groqClient"
import { getToolsForEnvironment, executeTool } from "./tools"
import type { ToolContext, ToolResult } from "./tools"

// --- Dynamic System Prompt Builder ---

function buildSystemPrompt(ctx: ToolContext): string {
  const { environment, dependencies } = ctx

  // Environment-specific guidance
  const environmentGuidance: Record<string, string> = {
    python: `
- Use matplotlib.pyplot.show() to display plots
- The Python runtime is Pyodide (browser-based)
- Use the run_file tool to verify your code works`,
    web: `
- Use ES modules for JavaScript
- You can use import maps for CDN dependencies
- The preview updates live as you save files`,
    flowscape: `
- This is a visual programming environment
- Only modify project.json for flow data`,
  }

  const hasExecutionTools = environment.capabilities.terminal || environment.capabilities.packages
  const executionSection = hasExecutionTools
    ? `
Execution Tools:
${environment.capabilities.terminal ? "- run_file: Execute a script and see output\n" : ""}${environment.capabilities.packages ? "- install_package: Install packages with pip/npm\n" : ""}`
    : ""

  return `You are Scapper, an AI coding assistant for CodeScapes - a web-based code editor.

**ENVIRONMENT**: ${environment.name} (${environment.id})
**ENTRY POINT**: ${environment.entryPoint}
**INSTALLED DEPENDENCIES**: ${dependencies.length > 0 ? dependencies.join(", ") : "None"}

Your job is to help users build and modify code through natural language. You have access to tools to:
- List and read files
- Create new files
- Edit existing files (using search/replace)
- Delete files
- Search across files
${executionSection}
Guidelines:
1. Always read a file before editing it to understand the current content
2. When creating files, provide complete, working code
3. Use clear, descriptive file names with proper extensions
4. Be concise in your responses - show what you did, not explanations of what you're about to do
5. If something fails, read the error and try to fix it
6. After creating or editing code, use run_file to verify it works (if available)
${environmentGuidance[environment.id] || ""}

**OUTPUT FORMAT**:
When done, provide a brief, clean summary. Use this format:
- Use ✓ emoji for completed actions (e.g., "✓ Updated main.py to use uppercase")
- NO XML tags like <summary>, <changes>, etc.
- Keep it to 1-3 bullet points max
- Be direct: "Changed X to do Y" not "I have made changes to X..."

Example good summary:
✓ Updated main.py: band names now display in UPPERCASE
✓ Added .upper() to all format strings in generate_name()`
}

// --- Conversation Memory ---

const MAX_HISTORY_MESSAGES = 20 // Keep last 10 user+assistant pairs

// --- Types ---

export interface ScapperProgress {
  type: "thinking" | "tool" | "result" | "error" | "done"
  message: string
}

export interface ScapperResult {
  success: boolean
  message: string
  error?: string
}

// --- Main Agent Function ---

export async function runScapper(
  userMessage: string,
  conversationHistory: GroqMessage[],
  toolContext: ToolContext,
  onProgress: (progress: ScapperProgress) => void,
  signal?: AbortSignal
): Promise<{ result: ScapperResult; updatedHistory: GroqMessage[] }> {
  // Build dynamic system prompt based on environment
  const systemPrompt = buildSystemPrompt(toolContext)

  // Get tools based on environment capabilities
  const tools = getToolsForEnvironment(toolContext.environment.capabilities)

  // Build messages array
  const messages: GroqMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ]

  // Keep history manageable
  const updatedHistory = [...conversationHistory, { role: "user" as const, content: userMessage }]
  if (updatedHistory.length > MAX_HISTORY_MESSAGES) {
    updatedHistory.splice(0, updatedHistory.length - MAX_HISTORY_MESSAGES)
  }

  onProgress({ type: "thinking", message: "Understanding your request..." })

  try {
    // Agent loop - keep going until no more tool calls
    let loopCount = 0
    const MAX_LOOPS = 15 // Safety limit

    while (loopCount < MAX_LOOPS) {
      loopCount++

      if (signal?.aborted) {
        throw new Error("Aborted by user")
      }

      const response = await chatCompletion(messages, tools, { signal })
      const choice = response.choices[0]
      const assistantMessage = choice.message

      // Add assistant response to messages
      messages.push({
        role: "assistant",
        content: assistantMessage.content || "",
        tool_calls: assistantMessage.tool_calls,
      })

      // Check if we need to execute tools
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // Execute each tool call
        for (const toolCall of assistantMessage.tool_calls) {
          const toolResult = await executeToolCall(toolCall, toolContext, onProgress)

          // Add tool result to messages
          messages.push({
            role: "tool",
            content: toolResult.success ? toolResult.output : `Error: ${toolResult.error}`,
            tool_call_id: toolCall.id,
          })
        }

        // Small delay between iterations to avoid rate limits
        await sleep(500)

        // Continue the loop to let the model process tool results
        continue
      }

      // No tool calls - we're done
      const finalMessage = assistantMessage.content || "Done!"

      // Add to history
      updatedHistory.push({ role: "assistant", content: finalMessage })
      if (updatedHistory.length > MAX_HISTORY_MESSAGES) {
        updatedHistory.splice(0, updatedHistory.length - MAX_HISTORY_MESSAGES)
      }

      onProgress({ type: "done", message: finalMessage })

      return {
        result: { success: true, message: finalMessage },
        updatedHistory,
      }
    }

    // Hit loop limit
    return {
      result: {
        success: false,
        message: "Task incomplete",
        error: "Maximum iterations reached. The task may be too complex.",
      },
      updatedHistory,
    }
  } catch (error) {
    const errorMessage =
      error instanceof GroqAPIError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unknown error"

    onProgress({ type: "error", message: errorMessage })

    return {
      result: { success: false, message: "", error: errorMessage },
      updatedHistory,
    }
  }
}

// --- Tool Execution Helper ---

async function executeToolCall(
  toolCall: GroqToolCall,
  ctx: ToolContext,
  onProgress: (progress: ScapperProgress) => void
): Promise<ToolResult> {
  const toolName = toolCall.function.name
  const args = parseToolArguments<Record<string, string>>(toolCall)

  // Show progress based on tool
  const progressMessages: Record<string, string> = {
    list_files: "Reading project structure...",
    read_file: `Reading ${args.path}...`,
    create_file: `Creating ${args.path}...`,
    edit_file: `Editing ${args.path}...`,
    delete_file: `Deleting ${args.path}...`,
    search_files: `Searching for "${args.query}"...`,
  }

  onProgress({ type: "tool", message: progressMessages[toolName] || `Running ${toolName}...` })

  const result = await executeTool(toolName, args, ctx)

  if (result.success) {
    // Format progress message based on tool type
    let progressMessage = result.output

    // For read_file, show compact summary instead of full content
    if (toolName === "read_file") {
      const lineCount = result.output.split("\n").length
      progressMessage = `📄 Analyzed ${args.path} (${lineCount} lines)`
    }
    // For list_files, show count instead of full list if many files
    else if (toolName === "list_files" && result.output.split("\n").length > 5) {
      const fileCount = result.output.split("\n").length
      progressMessage = `📁 Found ${fileCount} files in project`
    }
    // For search_files, show match count
    else if (toolName === "search_files") {
      const matchCount = (result.output.match(/\n/g) || []).length + 1
      if (matchCount > 5) {
        progressMessage = `🔍 Found ${matchCount} matches for "${args.query}"`
      }
    }

    onProgress({ type: "result", message: `✓ ${progressMessage}` })
  } else {
    onProgress({ type: "error", message: `✗ ${result.error}` })
  }

  return result
}

// --- Export conversation utilities ---

export function createEmptyConversation(): GroqMessage[] {
  return []
}

// Helper for delays
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
