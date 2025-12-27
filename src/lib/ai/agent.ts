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

// --- Specialized Prompt Builders ---

const COMMON_RULES = `
**CRITICAL RULES**:
1. To COMPLETELY REWRITE a file: use overwrite_file (no need to match text)
2. To make SMALL CHANGES: use edit_file with search/replace
   (Tip: For small files, just use overwrite_file instead - it's safer)
3. NEVER use create_file on a file that already exists - it will fail
4. If you need packages, INSTALL THEM FIRST. Verify via \`list_packages\` and install via \`install_package\`.
5. **CODE DELIVERY**: ALWAYS put generated code into a file using \`create_file\` or \`overwrite_file\`. NEVER just dump code blocks in the chat. Use the main entry point if the user doesn't specify a file name.


**WORKFLOW for rewriting an existing file**:
1. Use overwrite_file with the new content (no need to read first)
   Example: overwrite_file("hello.py", "print('New content')")

**WORKFLOW for small edits**:
1. read_file to see current content
2. edit_file with search=exact text to change, replace=new text
   Example: edit_file("hello.py", "print('Old')", "print('New')")

**WORKFLOW for new files**:
1. create_file with the content

**OUTPUT FORMAT**: 
- Brief summary with ✓ bullets. NO XML tags. 1-3 lines max.
- Keep responses SIMPLE and user-friendly
- NEVER expose internal details like "Pyodide", "entry point", or system architecture
- NEVER mention tool names (e.g. don't say "use run_file")
- Example BAD: "You can use run_file to execute it"
- Example GOOD: "Would you like me to run this code for you?"
- Example BAD response: "You're in Python 3 using Pyodide"
- Example GOOD response: "You're in a Python environment!"`

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

**WEB RULES**:
1. When asked to "create a website", ALWAYS create:
   - index.html (structure)
   - style.css (visuals)
   - script.js (interactivity)
2. Link them correctly in index.html (<link>, <script type="module">)
3. Use document.querySelector/getElementById robustly
4. NO alert(), prompts, or confirms. Build UI instead.

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

function buildGenericPrompt(ctx: ToolContext): string {
  return `You are Scapper, an AI coding assistant for CodeScapes.
**ENVIRONMENT**: ${ctx.environment.name}
**ENTRY POINT**: ${ctx.environment.entryPoint}

${getExecutionSection(ctx)}
${COMMON_RULES}
`
}

function buildSystemPrompt(ctx: ToolContext): string {
  switch (ctx.environment.id) {
    case "web":
      return buildWebPrompt(ctx)
    case "python":
      return buildPythonPrompt(ctx)
    default:
      return buildGenericPrompt(ctx)
  }
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
            content: toolResult.success
              ? toolResult.output
              : `Error: ${toolResult.error}\nDetails:\n${toolResult.output}`,
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
  const args = parseToolArguments<Record<string, string>>(toolCall)

  // Show progress based on tool
  const progressMessages: Record<string, string> = {
    list_files: "Reading project structure...",
    read_file: `Reading ${args.path}...`,
    create_file: `Creating ${args.path}...`,
    overwrite_file: `Overwriting ${args.path}...`,
    edit_file: `Editing ${args.path}...`,
    delete_file: `Deleting ${args.path}...`,
    search_files: `Searching for "${args.query}"...`,
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
