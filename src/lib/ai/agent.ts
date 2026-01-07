/**
 * Scapper Agent - Core AI Logic
 *
 * Manages conversation, tool execution loop, and progress reporting.
 */

import { chatCompletion, parseToolArguments, GroqAPIError } from "./groqClient"
import type { GroqMessage, GroqToolCall } from "./groqClient"
import { getToolsForEnvironment, executeTool } from "./tools"
import type { ToolContext, ToolResult } from "./tools"
import { buildProjectContext, formatContextForPrompt } from "./context"

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
   - ALWAYS use \`verify_and_run\` after making changes to check they work
   - If errors are detected, analyze the error and FIX IT immediately
   - Self-correct up to 3 times before asking user for help
   - Don't consider a task done until the code runs without errors
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
4. \`verify_and_run\` to check the code works
5. If error: analyze and fix with \`apply_diff\`, then verify again

**WORKFLOW for new files**:
1. \`create_file\` with the content
2. \`verify_and_run\` to check the code works
3. If error: analyze and fix, verify again

**WORKFLOW for complex/multi-file changes**:
1. Use \`propose_plan\` to show the user what you intend to do
2. Wait for user to approve the plan
3. Once approved (user says yes/approve/continue), proceed with execution
4. For simple single-file edits, you can skip planning and edit directly

**OUTPUT FORMAT**: 
- Brief summary with ✓ bullets. NO XML tags. 1-3 lines max.
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
- Separation of Concerns: ALWAYS keep HTML in .html, CSS in .css, and JS in .js
- Frameworks: Three.js, p5.js

**DESIGN PRINCIPLES** (CRITICAL for visual quality):
- Use CSS Custom Properties for theming: --primary-color, --bg-color, --text-color, --accent-color
- Prefer HSL colors for easy theming: hsl(220, 70%, 50%)
- Use consistent spacing scale: 0.5rem, 1rem, 1.5rem, 2rem, 3rem, 4rem
- Add visual polish: subtle shadows (box-shadow), rounded corners (border-radius), smooth transitions
- Typography: Use system fonts or embed Google Fonts with <link> in <head>
- Every section needs proper padding and visual hierarchy

**IMAGE RULES** (CRITICAL - External URLs are BLOCKED):
- NEVER use external image URLs (picsum.photos, unsplash.com, placeholder.com, etc.) - they will NOT load
- For image placeholders, use CSS gradient backgrounds or inline SVG:
  Example: <div class="img-placeholder" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 100%; height: 200px; border-radius: 8px;"></div>
- For icons, use emoji or simple inline SVG

**WORKFLOW FOR WEB PROJECTS**:
1. For NEW files or complete rewrites: Use \`overwrite_file\` (NOT apply_diff for initial creation)
2. Create files in order: index.html → style.css → script.js
3. After creation, use \`verify_and_run\` to check output
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
  return `You are Scapper, a Python Data Science Expert for CodeScapes.
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
      // Truncate huge tool outputs (like file reads or long stdout)
      if (msg.content.length > 200) {
        return {
          ...msg,
          content: `[Output truncated. Original length: ${msg.content.length} chars]`,
        }
      }
    }
    return msg
  })
}

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
  const systemPrompt = await buildSystemPrompt(toolContext)

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

      const response = await chatCompletion(messages, tools, {
        signal,
        maxTokens: 8192,
        temperature: 0.8,
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
          const toolResult = await executeToolCall(toolCall, toolContext, onProgress)

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
                },
                updatedHistory: compressHistory(updatedHistory),
              }
            }
          }
        }

        // Small delay between iterations to avoid rate limits
        await sleep(3000)

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
        updatedHistory: compressHistory(updatedHistory),
      }
    }

    // Hit loop limit
    return {
      result: {
        success: false,
        message: "Task incomplete",
        error: "Maximum iterations reached. The task may be too complex.",
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
      result: { success: false, message: "", error: errorMessage },
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
    // For analyze_codebase, show compact summary
    else if (toolName === "analyze_codebase") {
      const lines = result.output.split("\n")
      progressMessage = lines.slice(0, 2).join(" | ")
    }
    // For view_file_outline, show compact summary
    else if (toolName === "view_file_outline") {
      const lines = result.output.split("\n").filter((l) => l.trim())
      progressMessage = `📄 ${lines[0] || safePath}`
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
        progressMessage = `⚠️ Code ran but has ${errorType}: ${errorMsg}`
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
