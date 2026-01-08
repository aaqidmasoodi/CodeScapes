/**
 * Scapper Agent - Core AI Logic
 *
 * Manages conversation, tool execution loop, and progress reporting.
 * Features: Streaming responses, intent classification, smart failure recovery.
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

// --- Dynamic System Prompt Builder ---

// --- Specialized Prompt Builders ---

const COMMON_RULES = `
**CRITICAL RULES**:
1. **EDITING FILES**: 
   - PREFERRED: Use \`apply_diff\` for precise line-based edits (specify startLine, endLine, content)
   - Use \`read_file\` to see file structure and line numbers
   - FALLBACK: Use \`overwrite_file\` only for complete rewrites of small files
   - DEPRECATED: Avoid \`edit_file\` (text matching is fragile)
2. **UNDERSTANDING CODE**:
   - Use \`analyze_codebase\` to understand project structure before making changes
   - Use \`read_file\` only when you need the actual code content
3. **CREATING FILES**:
   - Use \`create_file\` for new files (will fail if file exists)
   - NEVER use create_file on existing files
4. **PACKAGES**: 
   - Verify via \`list_packages\`, install via \`install_package\` BEFORE writing code
5. **CLARIFICATION**:
   - Use \`ask_user\` when the request is ambiguous or you need confirmation
   - Don't guess - ask when uncertain about important details
6. **CODE DELIVERY**: 
   - ALWAYS put code into files. NEVER just dump code blocks in chat.
7. **VERIFICATION** (IMPORTANT):
   - NEVER run \`verify_and_run\` automatically after creating/editing code
   - ALWAYS ask the user: "Would you like me to run/verify this code?"
   - Only run verification if the user explicitly says YES
   - You can still statically analyze syntax, but do not execute code without permission
8. **SELF-CORRECTION** (CRITICAL):
   - If apply_diff FAILS with "Text not found": RE-READ the file to see actual content, then try again
   - NEVER claim success if edits failed - be honest and keep trying
   - After multiple failures, use \`overwrite_file\` as a fallback
   - Check for syntax errors: mismatched quotes, brackets, tags
9. **HONESTY**:
   - NEVER say "Fixed!" unless you have VERIFIED the code works
   - If unsure, say "I've made changes, but please test to confirm"
   - Admit when you don't know or when something unexpected happened

**WORKFLOW for editing existing files**:
1. \`read_file\` to see the current content
2. \`apply_diff\` with search/replace changes
   Example: apply_diff("main.py", [{search: "old_code", replace: "new_code"}])
3. If apply_diff FAILS: \`read_file\` again to see what's actually there, then retry
4. Ask user to verify (or use \`verify_and_run\` if permitted)
5. If error: analyze and fix with \`apply_diff\`, then verify again

**WORKFLOW for new files**:
1. \`create_file\` with the content
2. If error: analyze and fix, verify again

**WORKFLOW for complex/multi-file changes**:
1. Use \`propose_plan\` to show the user what you intend to do
2. Wait for user to approve the plan
3. When you receive a message starting with [PLAN_APPROVED], this means the user approved your plan:
   - The approved plan JSON is included in the message
   - IMMEDIATELY EXECUTE the plan steps one by one
   - CRITICAL: Do NOT call propose_plan again - the plan is already approved
   - CRITICAL: Do NOT ask for confirmation again - just DO IT
   - Start creating/modifying files according to the approved plan
4. For simple single-file edits, you can skip planning and edit directly

**OUTPUT FORMAT**: 
- Brief summary with ✓ bullets. NO XML tags. 1-3 lines max.
- NEVER use emojis. Use plain text only.
- Keep responses SIMPLE and user-friendly
- NEVER expose internal details like "Pyodide", "entry point", or system architecture
- NEVER mention tool names to users
- Example GOOD: "Would you like me to run this code for you?"`

function getExecutionSection(ctx: ToolContext): string {
  const { environment } = ctx
  const hasExecution = environment.capabilities.terminal || environment.capabilities.packages
  return hasExecution
    ? `\nExecution Capabilities:\n${environment.capabilities.terminal ? "- Can run scripts\n" : ""}${environment.capabilities.packages ? "- Can install packages (pip/npm)\n" : ""}`
    : ""
}

function buildWebPrompt(ctx: ToolContext): string {
  return `You are Scapper, a Senior Frontend Architect for CodeScapes.
**ENVIRONMENT**: Web (HTML/CSS/JS)
**ENTRY POINT**: ${ctx.environment.entryPoint}

**EXPERTISE**:
- Modern Semantic HTML5
- CSS3 (Flexbox, Grid, Responsive Design)
- Modern JavaScript (ES6+, DOM Manipulation)
- Creative Coding Libraries: Three.js, p5.js, GSAP, anime.js
- Separation of Concerns: ALWAYS keep HTML in .html, CSS in .css, and JS in .js
- You can learn and adapt to ANY library or framework the user requests

**DESIGN PRINCIPLES** (CRITICAL for visual quality):
- Use CSS Custom Properties for theming: --primary-color, --bg-color, --text-color, --accent-color
- Prefer HSL colors for easy theming: hsl(220, 70%, 50%)
- Use consistent spacing scale: 0.5rem, 1rem, 1.5rem, 2rem, 3rem, 4rem
- Add visual polish: subtle shadows (box-shadow), rounded corners (border-radius), smooth transitions
- Typography: Use system fonts or embed Google Fonts with <link> in <head>
- Every section needs proper padding and visual hierarchy

**IMAGES & ASSETS**:
- Use real images from Unsplash, Pexels, or Picsum for professional results:
  Example: <img src="https://images.unsplash.com/photo-1234567890?w=800" alt="Description">
  Example: <img src="https://picsum.photos/800/600" alt="Placeholder">
- Use appropriate images that match the content (hero images, profile photos, product shots, etc.)
- For icons, use inline SVG or icon libraries like Lucide/Heroicons via CDN

**WORKFLOW FOR WEB PROJECTS**:
1. For NEW files or complete rewrites: Use \`overwrite_file\` (NOT apply_diff for initial creation)
2. Create files in order: index.html → style.css → script.js
3. Ask user if they want to run/preview the website
4. For small targeted edits to existing files: Use \`apply_diff\`

**WEB RULES**:
1. When asked to "create a website", ALWAYS create:
   - index.html (structure with semantic HTML)
   - style.css (complete styling with CSS variables)
   - script.js (interactivity)
2. Link them correctly: <link rel="stylesheet" href="style.css"> and <script src="script.js" defer></script>
3. Use document.querySelector/getElementById robustly
4. NO alert(), prompt(), or confirm(). Build proper UI instead.

**QUALITY BAR** (Your output MUST meet these standards):
- The website MUST look professional and polished - not like a beginner project
- Use CSS Grid or Flexbox for ALL layouts - NEVER rely on default document flow
- Add hover states and transitions to all interactive elements
- Ensure proper contrast between text and backgrounds
- Mobile-responsive design with media queries

${getExecutionSection(ctx)}
${COMMON_RULES}
`
}

function buildPythonPrompt(ctx: ToolContext): string {
  const { dependencies } = ctx
  return `You are Scapper, a Python Expert for CodeScapes.
**ENVIRONMENT**: Python 3 (Pyodide Runtime)
**INSTALLED**: ${dependencies.length > 0 ? dependencies.join(", ") : "None"}

**EXPERTISE**:
- Modern Python 3
- Data Analysis (pandas, numpy)
- Visualization (matplotlib)
- Scientific Computing (scipy)
- Error Debugging

**PYTHON RULES**:
1. **Visualization**: ALWAYS use \`matplotlib.pyplot.show()\` to display plots.
2. **Data First**: Before reading a file (read_csv), CHECK if it exists using \`list_files\`.
   - If missing, ask user if they want sample data created.
3. **Robustness**: Wrap risky operations (IO, parsing) in try/except blocks.
4. **Packages**: You MUST verify installed packages using \`list_packages\`. If a required package (like 'pandas') is missing, you MUST install it using \`install_package\` BEFORE writing code. Do not ask for permission for standard libraries.

${getExecutionSection(ctx)}
${COMMON_RULES}
`
}

function buildRPrompt(ctx: ToolContext): string {
  const { dependencies } = ctx
  return `You are Scapper, a Statistical Data Analyst Expert in R for CodeScapes.
**ENVIRONMENT**: R (WebR - WebAssembly)
**PACKAGES**: ${dependencies.length > 0 ? dependencies.join(", ") : "Standard Library"}

**EXPERTISE**:
- Tidyverse (dplyr, ggplot2, tidyr)
- Base R
- Data Visualization
- Statistical Analysis

**R RULES**:
1. **Visualization**: Use \`plot()\`, \`hist()\`, or \`ggplot()\` to create plots. 
   - CRITICAL: When using \`ggplot2\`, you MUST explicitly print the plot object (e.g., \`print(p)\`) for it to render in a script.
2. **Data First**: Check for data files before reading.
3. **Packages**: Verify installed packages. If a library is needed (like 'ggplot2'), use \`install_package\` first.
   - Note: WebR supports many CRAN packages but not all.

${getExecutionSection(ctx)}
${COMMON_RULES}
`
}

function buildGenericPrompt(ctx: ToolContext): string {
  return `You are Scapper, an AI coding assistant for CodeScapes.
**ENVIRONMENT**: ${ctx.environment.name}
**ENTRY POINT**: ${ctx.environment.entryPoint}

${getExecutionSection(ctx)}
${COMMON_RULES}
`
}

async function buildSystemPrompt(ctx: ToolContext): Promise<string> {
  // Build the base prompt based on environment
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

  // Inject project context (file tree, dependencies, memories)
  try {
    const projectContext = await buildProjectContext(ctx.scapeId, ctx.files, ctx.dependencies)
    const contextSection = formatContextForPrompt(projectContext)

    if (contextSection) {
      basePrompt += `\n\n---\n${contextSection}`
    }
  } catch (e) {
    console.warn("[Agent] Failed to build context:", e)
  }

  return basePrompt
}

// --- History Compression ---

const MAX_HISTORY_MESSAGES = 10 // Keep last 5 user+assistant pairs

function compressHistory(history: GroqMessage[]): GroqMessage[] {
  // Keep the last 6 messages intact (3 turns)
  const PRESERVE_COUNT = 6
  if (history.length <= PRESERVE_COUNT) return history

  return history.map((msg, index) => {
    // Determine if this message is "old" (outside the preserved window)
    const isOld = index < history.length - PRESERVE_COUNT

    if (isOld && msg.role === "tool" && typeof msg.content === "string") {
      // NEVER truncate plan proposals or approvals - they contain critical context
      if (msg.content.includes("[PLAN_PROPOSAL]") || msg.content.includes("[PLAN_APPROVED]")) {
        return msg
      }
      // Truncate huge tool outputs (like file reads or long stdout)
      if (msg.content.length > 200) {
        return {
          ...msg,
          content: `[Output truncated. Original length: ${msg.content.length} chars]`,
        }
      }
    }

    // Also preserve user messages that contain plan approvals
    if (isOld && msg.role === "user" && typeof msg.content === "string") {
      if (msg.content.includes("[PLAN_APPROVED]")) {
        return msg
      }
    }

    return msg
  })
}

export interface ScapperProgress {
  type: "thinking" | "tool" | "result" | "error" | "done" | "streaming" | "reasoning"
  message: string
  /** For streaming type - the token delta */
  token?: string
}

export interface ScapperResult {
  success: boolean
  message: string
  error?: string
  /** Intent that was classified for this request */
  intent?: Intent
}

// --- Main Agent Function ---

export async function runScapper(
  userMessage: string,
  conversationHistory: GroqMessage[],
  toolContext: ToolContext,
  onProgress: (progress: ScapperProgress) => void,
  signal?: AbortSignal,
  isAnsweringQuestion: boolean = false // For quota tracking - true when answering ask_user
): Promise<{ result: ScapperResult; updatedHistory: GroqMessage[] }> {
  // Classify prompt type for quota tracking
  const promptType: PromptType = classifyPromptType(
    userMessage,
    conversationHistory,
    isAnsweringQuestion
  )
  console.log(`[Scapper] Prompt type: ${promptType}`)

  // Clear file cache if this is a new conversation
  if (conversationHistory.length === 0) {
    clearFileCache()
  }

  // --- INTENT CLASSIFICATION ---
  onProgress({ type: "thinking", message: "Understanding your request..." })

  let intent: Intent = "complex_task" // Default to full tool suite
  try {
    const classification = await classifyIntent(userMessage)
    intent = classification.intent
    console.log(`[Scapper] Intent: ${intent} (confidence: ${classification.confidence})`)
  } catch (e) {
    console.warn("[Scapper] Intent classification failed, defaulting to complex_task:", e)
  }

  // Build dynamic system prompt based on environment
  let systemPrompt = await buildSystemPrompt(toolContext)

  // Inject File Cache
  const fileCacheContext = formatFileCacheForPrompt()
  if (fileCacheContext) {
    systemPrompt += fileCacheContext
  }

  // Get tools based on environment capabilities and intent
  // For questions, we can use no tools (faster response)
  const tools =
    intent === "question" ? [] : getToolsForEnvironment(toolContext.environment.capabilities)

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

  // --- STREAMING PATH FOR QUESTIONS ---
  if (intent === "question") {
    try {
      let fullResponse = ""
      const stream = chatCompletionStream(messages, [], {
        signal,
        model: "llama-3.3-70b-versatile",
        promptType, // For quota tracking
      })

      let reasoningContent = ""

      for await (const chunk of stream) {
        if (signal?.aborted) {
          throw new Error("Aborted by user")
        }

        if (chunk.type === "token" && chunk.content) {
          fullResponse += chunk.content
          onProgress({ type: "streaming", message: fullResponse, token: chunk.content })
        } else if (chunk.type === "reasoning" && chunk.content) {
          // Accumulate and display reasoning/thinking
          reasoningContent += chunk.content
          onProgress({ type: "reasoning", message: reasoningContent, token: chunk.content })
        } else if (chunk.type === "error") {
          throw new Error(chunk.error)
        } else if (chunk.type === "done") {
          break
        }
      }

      updatedHistory.push({ role: "assistant", content: fullResponse })
      onProgress({ type: "done", message: fullResponse })

      return {
        result: { success: true, message: fullResponse, intent },
        updatedHistory: compressHistory(updatedHistory),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Streaming error"
      onProgress({ type: "error", message: errorMessage })
      return {
        result: { success: false, message: "", error: errorMessage, intent },
        updatedHistory: compressHistory(updatedHistory),
      }
    }
  }

  // --- STANDARD AGENTIC PATH (simple_edit / complex_task) ---
  // Track failures for recovery
  const failureTracker: Map<string, number> = new Map() // path -> failure count

  try {
    // Agent loop - keep going until no more tool calls
    let loopCount = 0
    const MAX_LOOPS = 30 // Safety limit

    while (loopCount < MAX_LOOPS) {
      loopCount++

      if (signal?.aborted) {
        throw new Error("Aborted by user")
      }

      const response = await chatCompletion(messages, tools, {
        signal,
        maxTokens: 8192,
        temperature: 0.8,
        promptType: loopCount === 1 ? promptType : "scapper_response", // Only first iteration counts for quota
      })
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
          const toolName = toolCall.function.name
          const args = parseToolArguments<Record<string, unknown>>(toolCall) || {}

          const toolResult = await executeToolCall(toolCall, toolContext, onProgress)

          // --- SMART FAILURE RECOVERY for apply_diff ---
          if (!toolResult.success && toolName === "apply_diff" && typeof args.path === "string") {
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

          // Add tool result to messages
          messages.push({
            role: "tool",
            content: toolResult.success
              ? toolResult.output
              : `Error: ${toolResult.error}\nDetails:\n${toolResult.output}`,
            tool_call_id: toolCall.id,
          })

          // Check for plan proposal - pause for user approval
          if (toolResult.output.includes("[PLAN_PROPOSAL]")) {
            // Extract plan JSON
            const planMatch = toolResult.output.match(/\[PLAN_PROPOSAL\](.*?)\[\/PLAN_PROPOSAL\]/s)
            if (planMatch) {
              const planJson = planMatch[1]

              // Add to history so context is preserved
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

        // Small delay between iterations to avoid rate limits
        await sleep(4000)

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
        result: { success: true, message: finalMessage, intent },
        updatedHistory: compressHistory(updatedHistory),
      }
    }

    // Hit loop limit
    return {
      result: {
        success: false,
        message: "Task incomplete",
        error: "Maximum iterations reached. The task may be too complex.",
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

// --- Tool Execution Helper ---

async function executeToolCall(
  toolCall: GroqToolCall,
  ctx: ToolContext,
  onProgress: (progress: ScapperProgress) => void
): Promise<ToolResult> {
  const toolName = toolCall.function.name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const args = parseToolArguments<Record<string, any>>(toolCall) || {}

  // Show progress based on tool
  const safePath = args.path || "file"
  const progressMessages: Record<string, string> = {
    list_files: "Reading project structure...",
    read_file: `Reading ${safePath}...`,
    create_file: `Creating ${safePath}...`,
    overwrite_file: `Overwriting ${safePath}...`,
    edit_file: `Editing ${safePath}...`,
    delete_file: `Deleting ${safePath}...`,
    search_files: `Searching for "${args.query || "query"}"...`,
    // Agentic tools
    apply_diff: `Applying changes to ${safePath}...`,
    analyze_codebase: "Analyzing project structure...",
    view_file_outline: `Analyzing structure of ${safePath}...`,
    ask_user: "Asking for clarification...",
    // Verification tools
    verify_and_run: `Verifying ${safePath || "code"}...`,
  }

  onProgress({ type: "tool", message: progressMessages[toolName] || `Running ${toolName}...` })

  const result = await executeTool(toolName, args, ctx, (msg) => {
    onProgress({ type: "tool", message: msg })
  })

  if (result.success) {
    // Format progress message based on tool type
    let progressMessage = result.output

    // For read_file, show compact summary instead of full content
    if (toolName === "read_file") {
      const lineCount = result.output.split("\n").length
      progressMessage = `Analyzed ${args.path} (${lineCount} lines)`
    }
    // For list_files, show count instead of full list if many files
    else if (toolName === "list_files" && result.output.split("\n").length > 5) {
      const fileCount = result.output.split("\n").length
      progressMessage = `Found ${fileCount} files in project`
    }
    // For search_files, show match count
    else if (toolName === "search_files") {
      const matchCount = (result.output.match(/\n/g) || []).length + 1
      if (matchCount > 5) {
        progressMessage = `Found ${matchCount} matches for "${args.query}"`
      }
    }
    // For analyze_codebase, show compact summary
    else if (toolName === "analyze_codebase") {
      const lines = result.output.split("\n")
      progressMessage = lines.slice(0, 2).join(" | ")
    }
    // For view_file_outline, show compact summary
    else if (toolName === "view_file_outline") {
      const lines = result.output.split("\n").filter((l) => l.trim())
      progressMessage = `${lines[0] || safePath}`
    }
    // For apply_diff, the output is already formatted nicely
    else if (toolName === "apply_diff") {
      progressMessage = result.output
    }
    // For ask_user, show the response received
    else if (toolName === "ask_user") {
      progressMessage = result.output
    }
    // For verify_and_run, show pass/fail with error summary if applicable
    else if (toolName === "verify_and_run") {
      if (result.output.includes("[ERROR DETECTED]")) {
        // Extract error type and message for display
        const typeMatch = result.output.match(/Type: (\w+)/)
        const msgMatch = result.output.match(/Message: (.+)/)
        const errorType = typeMatch ? typeMatch[1] : "error"
        const errorMsg = msgMatch ? msgMatch[1].slice(0, 60) : "See output for details"
        progressMessage = `Code ran but has ${errorType}: ${errorMsg}`
      } else if (result.output.includes("(No output")) {
        progressMessage = "✓ Code ran successfully (no output)"
      } else {
        // Show truncated output
        const firstLine = result.output.split("\n")[0] || ""
        progressMessage = `✓ Code ran: ${firstLine.slice(0, 50)}${firstLine.length > 50 ? "..." : ""}`
      }
    }

    onProgress({ type: "result", message: `✓ ${progressMessage} ` })
  } else {
    onProgress({ type: "error", message: `✗ ${result.error} ` })
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
