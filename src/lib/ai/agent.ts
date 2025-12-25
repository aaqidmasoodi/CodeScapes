/**
 * Scapper Agent - Core AI Logic
 *
 * Manages conversation, tool execution loop, and progress reporting.
 */

import { chatCompletion, parseToolArguments, GroqAPIError } from "./groqClient"
import type { GroqMessage, GroqToolCall } from "./groqClient"
import { SCAPPER_TOOLS, executeTool } from "./tools"
import type { ToolContext, ToolResult } from "./tools"

// --- System Prompt ---

const SYSTEM_PROMPT = `You are Scapper, an AI coding assistant for CodeScapes - a web-based code editor.

Your job is to help users build and modify code through natural language. You have access to tools to:
- List and read files
- Create new files
- Edit existing files (using search/replace)
- Delete files
- Search across files

Guidelines:
1. Always read a file before editing it to understand the current content
2. When creating files, provide complete, working code
3. Use clear, descriptive file names with proper extensions
4. For web projects, use semantic HTML, modern CSS, and clean JavaScript
5. Be concise in your responses - show what you did, not explanations of what you're about to do
6. If something fails, explain the error briefly and try an alternative approach

When you're done with a task, provide a brief summary of what was created or changed.`

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
  // Build messages array
  const messages: GroqMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
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

      const response = await chatCompletion(messages, SCAPPER_TOOLS, { signal })
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
    onProgress({ type: "result", message: `✓ ${result.output}` })
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
