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

  const { model = "qwen/qwen3-32b", maxTokens, temperature = 0.6 } = options || {}

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
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
        console.log(`[Scapper] Rate limited, waiting ${delay / 1000}s before retry...`)
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
          (response.status === 400 && errorData.error?.code === "failed_generation") ||
          (response.status === 400 && JSON.stringify(errorData).includes("failed_generation"))
        ) {
          const isRateLimit = response.status === 429
          lastError = new GroqAPIError(
            isRateLimit
              ? "Rate limited - waiting before retry..."
              : "Model generation failed - retrying...",
            response.status,
            isRateLimit ? "rate_limit" : "generation_failed"
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
