/**
 * Groq API Client for Scapper AI Agent
 *
 * Uses Groq's fast inference for tool-calling with Qwen3-32b model.
 */

// Types
export interface GroqMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string
  tool_call_id?: string
  tool_calls?: GroqToolCall[]
}

export interface GroqToolCall {
  id: string
  type: "function"
  function: {
    name: string
    arguments: string // JSON string
  }
}

export interface GroqTool {
  type: "function"
  function: {
    name: string
    description: string
    parameters: {
      type: "object"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      properties: Record<string, any>
      required: string[]
    }
  }
}

export interface GroqResponse {
  id: string
  choices: {
    message: {
      role: "assistant"
      content: string | null
      tool_calls?: GroqToolCall[]
    }
    finish_reason: "stop" | "tool_calls" | "length"
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Error class
export class GroqAPIError extends Error {
  status?: number
  code?: string

  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = "GroqAPIError"
    this.status = status
    this.code = code
  }
}

// Main client
export async function chatCompletion(
  messages: GroqMessage[],
  tools?: GroqTool[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
    reasoning_effort?: "low" | "medium" | "high"
    signal?: AbortSignal
  }
): Promise<GroqResponse> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    throw new GroqAPIError(
      "Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file.",
      401,
      "missing_api_key"
    )
  }

  const {
    model = "openai/gpt-oss-120b",
    maxTokens,
    temperature = 0.6,
    reasoning_effort = "medium",
  } = options || {}

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
    reasoning_effort,
  }

  if (maxTokens) {
    body.max_completion_tokens = maxTokens
  }

  if (tools && tools.length > 0) {
    body.tools = tools
    body.tool_choice = "auto"
  }

  // Retry logic with exponential backoff
  const MAX_RETRIES = 3
  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Add delay between attempts (and before first request to slow things down)
      if (attempt > 0) {
        const delay = Math.min(5000 * Math.pow(2, attempt), 30000) // 5s, 10s, 20s max 30s
        await sleep(delay)
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: options?.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[Groq API Error]", response.status, errorData) // Log actual error

        // Check if rate limited or generation failed (e.g. invalid tool call hallucination)
        if (
          response.status === 429 ||
          response.status >= 500 ||
          (response.status === 400 && errorData.error?.code === "failed_generation") ||
          (response.status === 400 && JSON.stringify(errorData).includes("failed_generation"))
        ) {
          const isRateLimit = response.status === 429
          const isServerError = response.status >= 500
          const errorType = isRateLimit
            ? "rate_limit"
            : isServerError
              ? "server_error"
              : "generation_failed"

          console.log(
            `[Scapper] ${
              isRateLimit
                ? "Rate limited"
                : isServerError
                  ? "Groq server error"
                  : "Generation failed"
            }, waiting ${Math.min(5000 * Math.pow(2, attempt + 1), 30000) / 1000}s before retry...`
          )

          if (attempt === MAX_RETRIES - 1) {
            // Don't wait on the very last attempt if we're measuring straight away
          }

          lastError = new GroqAPIError(
            isRateLimit
              ? "Rate limited - waiting before retry..."
              : isServerError
                ? "Groq server error - retrying..."
                : "Model generation failed - retrying...",
            response.status,
            errorType
          )
          // Exponential backoff handles the wait
          continue
        }

        throw new GroqAPIError(
          errorData.error?.message || `Groq API error: ${response.status}`,
          response.status,
          errorData.error?.code
        )
      }

      const data: GroqResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof GroqAPIError && error.status !== 429) {
        throw error
      }
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }

  // All retries exhausted
  throw (
    lastError ||
    new GroqAPIError(
      `Rate limit exceeded after ${MAX_RETRIES} retries. Please wait a minute and try again.`,
      429,
      "rate_limit_exhausted"
    )
  )
}

/**
 * Streaming result from chat completion
 */
export interface StreamChunk {
  type: "token" | "reasoning" | "tool_call" | "done" | "error"
  content?: string
  toolCalls?: GroqToolCall[]
  error?: string
  usage?: GroqResponse["usage"]
}

/**
 * Streaming chat completion - yields tokens as they arrive
 */
export async function* chatCompletionStream(
  messages: GroqMessage[],
  tools?: GroqTool[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
    signal?: AbortSignal
  }
): AsyncGenerator<StreamChunk, void, unknown> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    yield {
      type: "error",
      error: "Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file.",
    }
    return
  }

  const { model = "openai/gpt-oss-120b", maxTokens = 4096, temperature = 0.6 } = options || {}

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
    stream: true,
  }

  if (maxTokens) {
    body.max_completion_tokens = maxTokens
  }

  if (tools && tools.length > 0) {
    body.tools = tools
    body.tool_choice = "auto"
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: options?.signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      yield {
        type: "error",
        error: errorData.error?.message || `Groq API error: ${response.status}`,
      }
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      yield { type: "error", error: "No response body" }
      return
    }

    const decoder = new TextDecoder()
    let buffer = ""
    const toolCalls: Map<number, { id: string; name: string; arguments: string }> = new Map()
    let fullContent = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Process complete SSE events
      const lines = buffer.split("\n")
      buffer = lines.pop() || "" // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue
        const data = line.slice(6).trim()

        if (data === "[DONE]") {
          // Stream complete
          if (toolCalls.size > 0) {
            const calls: GroqToolCall[] = Array.from(toolCalls.values()).map((tc) => ({
              id: tc.id,
              type: "function" as const,
              function: { name: tc.name, arguments: tc.arguments },
            }))
            yield { type: "tool_call", toolCalls: calls }
          }
          yield { type: "done", content: fullContent }
          return
        }

        try {
          const parsed = JSON.parse(data)

          // Check for error in stream
          if (parsed.error) {
            yield { type: "error", error: parsed.error.message }
            return
          }

          const delta = parsed.choices?.[0]?.delta

          // Handle both content and reasoning tokens
          if (delta?.content) {
            fullContent += delta.content
            yield { type: "token", content: delta.content }
          }

          // Yield reasoning tokens separately for UI display
          if (delta?.reasoning) {
            // Don't add to fullContent - reasoning is separate from final answer
            yield { type: "reasoning", content: delta.reasoning }
          }

          // Handle streaming tool calls
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0
              if (!toolCalls.has(idx)) {
                toolCalls.set(idx, { id: tc.id || "", name: "", arguments: "" })
              }
              const existing = toolCalls.get(idx)!
              if (tc.id) existing.id = tc.id
              if (tc.function?.name) existing.name = tc.function.name
              if (tc.function?.arguments) existing.arguments += tc.function.arguments
            }
          }

          // Check for finish reason
          if (parsed.choices?.[0]?.finish_reason === "tool_calls" && toolCalls.size > 0) {
            const calls: GroqToolCall[] = Array.from(toolCalls.values()).map((tc) => ({
              id: tc.id,
              type: "function" as const,
              function: { name: tc.name, arguments: tc.arguments },
            }))
            yield { type: "tool_call", toolCalls: calls }
          }

          // Extract usage if present
          if (parsed.usage) {
            yield { type: "done", content: fullContent, usage: parsed.usage }
            return
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }
    }

    // Final yield if we exit normally
    if (toolCalls.size > 0) {
      const calls: GroqToolCall[] = Array.from(toolCalls.values()).map((tc) => ({
        id: tc.id,
        type: "function" as const,
        function: { name: tc.name, arguments: tc.arguments },
      }))
      yield { type: "tool_call", toolCalls: calls }
    }
    yield { type: "done", content: fullContent }
  } catch (error) {
    yield {
      type: "error",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Helper for delays
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Parse tool call arguments safely
 */
export function parseToolArguments<T>(toolCall: GroqToolCall): T {
  try {
    return JSON.parse(toolCall.function.arguments) as T
  } catch {
    throw new Error(`Failed to parse tool arguments: ${toolCall.function.arguments}`)
  }
}
