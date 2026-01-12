/**
 * Scapper Agent - Core AI Logic (Compact + Robust)
 *
 * Manages conversation, tool execution loop, and progress reporting.
 * Features: Streaming responses, intent classification, token optimization, smart failure recovery.
 */

import {
  chatCompletion,
  chatCompletionStream,
  parseToolArguments,
  GroqAPIError,
} from "./groqClient"
import type { GroqMessage, GroqToolCall } from "./groqClient"
import { getToolsForEnvironment, executeTool } from "./tools"
import type { ToolContext, ToolResult } from "./tools"
import { buildProjectContext, formatContextForPrompt } from "./context"
import { formatFileCacheForPrompt, clearFileCache } from "./fileCache"
import { classifyIntent, type Intent } from "./classifier"
import { classifyPromptType, type PromptType } from "../quotaClient"

// -----------------------------------------------------------------------------
// 🔻 REDUCED COMMON RULES (with ROBUSTNESS SAFEGUARDS)
// -----------------------------------------------------------------------------

const COMMON_RULES = `
Rules:
1. Use tools to modify files; NEVER claim changes without tool calls.
2. Prefer precise edits (apply_diff) over rewrites.
3. Ask the user only if blocked or ambiguous.
4. Keep responses brief and user-friendly.

CRITICAL SAFEGUARDS:
- IMPLICIT COMMANDS: Users often say "Make it red" or "Sort the list". INTERPRET THESE AS COMMANDS TO MODIFY CODE. Do NOT ask for permission. JUST DO IT.
- EXECUTION: NEVER run code automatically. ALWAYS ask "Would you like me to run this?" first.
- VERIFICATION: Do not claim success without tools. Never say "Fixed!" unless you verified it.
`

function getExecutionSection(ctx: ToolContext): string {
  const { environment } = ctx
  if (!environment.capabilities.terminal && !environment.capabilities.packages) return ""
  return `Execution: ${environment.capabilities.terminal ? "run" : ""}${environment.capabilities.packages ? " install" : ""}`
}

function buildWebPrompt(ctx: ToolContext): string {
  return `You are Scapper, an expert frontend engineer.
Env: Web (HTML/CSS/JS)
Entry: ${ctx.environment.entryPoint}
Use modern best practices (HTML5, CSS Flex/Grid). Build clean, professional UI.
${getExecutionSection(ctx)}
${COMMON_RULES}`
}

function buildPythonPrompt(ctx: ToolContext): string {
  return `You are Scapper, an expert Python developer.
Env: Python 3
Installed: ${ctx.dependencies.length ? ctx.dependencies.join(", ") : "None"}
You MUST verify installed packages using \`list_packages\`. If a required package (like 'pandas') is missing, you MUST install it using \`install_package\` BEFORE writing code.
Write correct, robust Python code. Visualization: use matplotlib.pyplot.show().
${getExecutionSection(ctx)}
${COMMON_RULES}`
}

function buildRPrompt(ctx: ToolContext): string {
  return `You are Scapper, an expert R data analyst.
Env: R
Packages: ${ctx.dependencies.length ? ctx.dependencies.join(", ") : "Standard"}
You MUST verify installed packages. If a library is needed, use \`install_package\` first.
${getExecutionSection(ctx)}
${COMMON_RULES}`
}

function buildGenericPrompt(ctx: ToolContext): string {
  return `You are Scapper, an AI coding assistant.
Env: ${ctx.environment.name}
Entry: ${ctx.environment.entryPoint}
${getExecutionSection(ctx)}
${COMMON_RULES}`
}

// -----------------------------------------------------------------------------
// System prompt builder (Context-Aware)
// -----------------------------------------------------------------------------

async function buildSystemPrompt(ctx: ToolContext, intent: Intent): Promise<string> {
  let basePrompt: string

  switch (ctx.environment.id) {
    case "web":
      basePrompt = buildWebPrompt(ctx)
      break
    case "python":
      basePrompt = buildPythonPrompt(ctx)
      break
    case "r":
      basePrompt = buildRPrompt(ctx)
      break
    default:
      basePrompt = buildGenericPrompt(ctx)
  }

  // ⚠️ CONDITIONAL CONTEXT: Inject project context ONLY when tools are likely needed
  // This saves ~1000+ tokens on general questions
  if (intent !== "question") {
    try {
      const projectContext = await buildProjectContext(ctx.scapeId, ctx.files, ctx.dependencies)
      const contextSection = formatContextForPrompt(projectContext)
      if (contextSection) {
        basePrompt += `\n\n${contextSection}`
      }
    } catch (e) {
      console.warn("[Agent] Failed to build context:", e)
    }
  }

  return basePrompt
}

// -----------------------------------------------------------------------------
// History compression
// -----------------------------------------------------------------------------

const MAX_HISTORY_MESSAGES = 10

function compressHistory(history: GroqMessage[]): GroqMessage[] {
  // Keep the last 6 messages intact (3 turns)
  const PRESERVE_COUNT = 6
  if (history.length <= PRESERVE_COUNT) return history

  return history.map((msg, index) => {
    // Determine if this message is "old" (outside the preserved window)
    const isOld = index < history.length - PRESERVE_COUNT

    if (isOld && msg.role === "tool" && typeof msg.content === "string") {
      // NEVER truncate plan proposals or approvals
      if (msg.content.includes("[PLAN_PROPOSAL]") || msg.content.includes("[PLAN_APPROVED]")) {
        return msg
      }
      // Truncate huge tool outputs
      if (msg.content.length > 200) {
        return {
          ...msg,
          content: `[Output truncated. Original length: ${msg.content.length} chars]`,
        }
      }
    }

    if (isOld && msg.role === "user" && typeof msg.content === "string") {
      if (msg.content.includes("[PLAN_APPROVED]")) {
        return msg
      }
    }

    return msg
  })
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ScapperProgress {
  type: "thinking" | "tool" | "result" | "error" | "done" | "streaming" | "reasoning"
  message: string
  token?: string
}

export interface ScapperResult {
  success: boolean
  message: string
  error?: string
  intent?: Intent
}

// -----------------------------------------------------------------------------
// MAIN AGENT
// -----------------------------------------------------------------------------

export async function runScapper(
  userMessage: string,
  conversationHistory: GroqMessage[],
  toolContext: ToolContext,
  onProgress: (progress: ScapperProgress) => void,
  signal?: AbortSignal,
  isAnsweringQuestion: boolean = false
): Promise<{ result: ScapperResult; updatedHistory: GroqMessage[] }> {
  const promptType: PromptType = classifyPromptType(
    userMessage,
    conversationHistory,
    isAnsweringQuestion
  )

  if (conversationHistory.length === 0) {
    clearFileCache()
  }

  onProgress({ type: "thinking", message: "Understanding your request..." })

  let intent: Intent = "complex_task"
  try {
    intent = (await classifyIntent(userMessage)).intent
    console.log(`[Scapper] Intent: ${intent}`)
  } catch (e) {
    console.warn("[Scapper] Intent classification failed:", e)
  }

  // 1. Build system prompt (passing intent for optimization)
  let systemPrompt = await buildSystemPrompt(toolContext, intent)

  const fileCacheContext = formatFileCacheForPrompt()
  if (fileCacheContext) {
    systemPrompt += fileCacheContext
  }

  const tools =
    intent === "question" ? [] : getToolsForEnvironment(toolContext.environment.capabilities)

  const messages: GroqMessage[] = [
    { role: "system", content: systemPrompt },
    ...compressHistory(conversationHistory),
    { role: "user", content: userMessage },
  ]

  const updatedHistory: GroqMessage[] = [
    ...compressHistory(conversationHistory),
    { role: "user" as const, content: userMessage },
  ]
  if (updatedHistory.length > MAX_HISTORY_MESSAGES) {
    updatedHistory.splice(0, updatedHistory.length - MAX_HISTORY_MESSAGES)
  }

  // ---------------------------------------------------------------------------
  // FAST PATH: QUESTIONS
  // ---------------------------------------------------------------------------

  if (intent === "question") {
    try {
      let fullResponse = ""
      const stream = chatCompletionStream(messages, [], {
        signal,
        model: "llama-3.3-70b-versatile",
        promptType,
      })

      for await (const chunk of stream) {
        if (signal?.aborted) throw new Error("Aborted")

        if (chunk.type === "token" && chunk.content) {
          fullResponse += chunk.content
          onProgress({ type: "streaming", message: fullResponse, token: chunk.content })
        }
        if (chunk.type === "done") break
      }

      updatedHistory.push({ role: "assistant", content: fullResponse })
      onProgress({ type: "done", message: fullResponse })

      return {
        result: { success: true, message: fullResponse, intent },
        updatedHistory: compressHistory(updatedHistory),
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Streaming error"
      onProgress({ type: "error", message: msg })
      return {
        result: { success: false, message: "", error: msg, intent },
        updatedHistory: compressHistory(updatedHistory),
      }
    }
  }

  // ---------------------------------------------------------------------------
  // AGENTIC LOOP (token-safe + robust)
  // ---------------------------------------------------------------------------

  const failureTracker = new Map<string, number>()
  let loopCount = 0
  const MAX_LOOPS = 30

  try {
    while (loopCount++ < MAX_LOOPS) {
      if (signal?.aborted) throw new Error("Aborted")

      const response = await chatCompletion(messages, tools, {
        signal,
        temperature: 0.8,
        maxTokens: 8192,
        promptType: loopCount === 1 ? promptType : "scapper_response",
      })

      const assistantMessage = response.choices[0].message
      messages.push({
        role: "assistant", // explicit role
        content: assistantMessage.content || "", // handle null
        tool_calls: assistantMessage.tool_calls,
      })

      // Handle Tools
      if (assistantMessage.tool_calls?.length) {
        for (const toolCall of assistantMessage.tool_calls) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const args = parseToolArguments<Record<string, any>>(toolCall)

          if (!args) {
            messages.push({
              role: "tool",
              content:
                "Error: Failed to parse tool arguments (invalid JSON). Please check your syntax and try again.",
              tool_call_id: toolCall.id,
            })
            onProgress({ type: "error", message: "Invalid JSON from model, asking for retry..." })
            continue
          }

          const toolResult = await executeToolCall(toolCall, toolContext, onProgress)

          // --- SMART FAILURE RECOVERY for apply_diff ---
          if (
            !toolResult.success &&
            toolCall.function.name === "apply_diff" &&
            typeof args.path === "string"
          ) {
            const filePath = args.path
            const failCount = (failureTracker.get(filePath) || 0) + 1
            failureTracker.set(filePath, failCount)

            // Auto-read the file to provide current content
            try {
              const readResult = await executeTool("read_file", { path: filePath }, toolContext)
              if (readResult.success) {
                const recoveryHint =
                  failCount >= 3
                    ? `\n\n[RECOVERY HINT] This edit has failed ${failCount} times. Consider using \`overwrite_file\` instead.`
                    : ""

                // Inject current file content to help the model retry correctly
                messages.push({
                  role: "tool",
                  content: `Edit failed: ${toolResult.error}\n\nHere is the CURRENT file content for ${filePath}:\n\`\`\`\n${readResult.output}\n\`\`\`${recoveryHint}`,
                  tool_call_id: toolCall.id,
                })

                onProgress({
                  type: "error",
                  message: `Edit failed - auto-reading file for retry...`,
                })
                continue // Skip normal tool result push
              }
            } catch {
              // Read failed, fall through to normal error handling
            }
          }

          messages.push({
            role: "tool",
            content: toolResult.success
              ? toolResult.output
              : `Error: ${toolResult.error}\n${toolResult.output}`,
            tool_call_id: toolCall.id,
          })

          // Check for plan proposal
          if (toolResult.output.includes("[PLAN_PROPOSAL]")) {
            // Basic plan handling logic (simplified for rewrite but functional)
            const planMatch = toolResult.output.match(/\[PLAN_PROPOSAL\](.*?)\[\/PLAN_PROPOSAL\]/s)
            if (planMatch) {
              const planJson = planMatch[1]
              updatedHistory.push({
                role: "assistant",
                content: `I've proposed a plan. Waiting for your approval.`,
              })
              onProgress({ type: "done", message: `[PLAN_PROPOSAL]${planJson}[/PLAN_PROPOSAL]` })
              return {
                result: {
                  success: true,
                  message: `[PLAN_PROPOSAL]${planJson}[/PLAN_PROPOSAL]`,
                  intent,
                },
                updatedHistory: compressHistory(updatedHistory),
              }
            }
          }
        }

        messages.push({
          role: "system",
          content: "Continue. Use tools if needed.",
        })

        await sleep(4000)
        continue
      }

      // --- VERIFICATION LOOP (Anti-Hallucination) ---
      const content = assistantMessage.content || ""
      const hasActionClaim =
        /(?:^|\s)(?:created|updated|fixed|modified|rewrote|edited)\s+[`"']?[\w/.-]+[`"']?/i.test(
          content
        )

      // Check for User Command (Input-Based Verification)
      const hasUserCommand =
        /(?:^|\s)(?:create|make|update|change|overwrite|fix|refactor|implement)\b/i.test(
          userMessage
        )

      if (
        (hasActionClaim || hasUserCommand) &&
        (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0)
      ) {
        const retryKey = "__hallucination_retry__"
        const currentRetries = failureTracker.get(retryKey) || 0

        if (currentRetries < 2) {
          failureTracker.set(retryKey, currentRetries + 1)
          onProgress({ type: "reasoning", message: "Verifying..." })

          let alertMsg = `SYSTEM ALERT: You stated in your last message that you created/updated a file, but you did NOT generate any tool calls to actually perform the action.`
          if (hasUserCommand) {
            alertMsg = `SYSTEM ALERT: The user explicitly asked you to perform an action ("${userMessage.substring(0, 50)}..."), but you did NOT generate any tool calls.`
          }

          messages.push({
            role: "system",
            content: `${alertMsg} You MUST use tools like \`create_file\`, \`apply_diff\`, or \`overwrite_file\` to make changes. DO NOT APOLOGIZE. DO NOT EXPLAIN. JUST EXECUTE THE TOOLS NOW.`,
          })
          await sleep(3000) // Pacing delay for UI
          continue
        }
      }

      const finalMessage = assistantMessage.content || "Done!"
      updatedHistory.push({ role: "assistant", content: finalMessage })
      onProgress({ type: "done", message: finalMessage })

      return {
        result: { success: true, message: finalMessage, intent },
        updatedHistory: compressHistory(updatedHistory),
      }
    }

    return {
      result: {
        success: false,
        message: "Task incomplete",
        error: "Maximum iterations reached.",
        intent,
      },
      updatedHistory: compressHistory(updatedHistory),
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
      result: { success: false, message: "", error: errorMessage, intent },
      updatedHistory: compressHistory(updatedHistory),
    }
  }
}

// -----------------------------------------------------------------------------
// Tool Execution Helper (Preserved)
// -----------------------------------------------------------------------------

async function executeToolCall(
  toolCall: GroqToolCall,
  ctx: ToolContext,
  onProgress: (progress: ScapperProgress) => void
): Promise<ToolResult> {
  const toolName = toolCall.function.name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const args = parseToolArguments<Record<string, any>>(toolCall) || {}

  const safePath = args.path || "file"
  const progressMessages: Record<string, string> = {
    list_files: "Reading project structure...",
    read_file: `Reading ${safePath}...`,
    create_file: `Creating ${safePath}...`,
    overwrite_file: `Overwriting ${safePath}...`,
    edit_file: `Editing ${safePath}...`,
    delete_file: `Deleting ${safePath}...`,
    search_files: `Searching for "${args.query || "query"}"...`,
    apply_diff: `Applying changes to ${safePath}...`,
    analyze_codebase: "Analyzing project structure...",
    view_file_outline: `Analyzing structure of ${safePath}...`,
    ask_user: "Asking for clarification...",
    verify_and_run: `Verifying ${safePath || "code"}...`,
  }

  onProgress({ type: "tool", message: progressMessages[toolName] || `Running ${toolName}...` })

  const result = await executeTool(toolName, args, ctx, (msg) => {
    onProgress({ type: "tool", message: msg })
  })

  if (result.success) {
    let progressMessage = result.output
    if (toolName === "read_file") {
      const lineCount = result.output.split("\n").length
      progressMessage = `Analyzed ${args.path} (${lineCount} lines)`
    } else if (toolName === "list_files" && result.output.split("\n").length > 5) {
      const fileCount = result.output.split("\n").length
      progressMessage = `Found ${fileCount} files`
    } else if (toolName === "verify_and_run") {
      if (result.output.includes("[ERROR DETECTED]")) {
        progressMessage = "Code ran with errors (see output)"
      } else {
        progressMessage = "✓ Code ran successfully"
      }
    }
    onProgress({ type: "result", message: `✓ ${progressMessage} ` })
  } else {
    onProgress({ type: "error", message: `✗ ${result.error} ` })
  }

  return result
}

export function createEmptyConversation(): GroqMessage[] {
  return []
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
