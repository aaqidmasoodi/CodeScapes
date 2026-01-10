/**
 * Intent Classifier for Scapper
 *
 * Fast classification of user intent to route requests appropriately:
 * - question: Direct answer without tools (streaming)
 * - simple_edit: Single file operation
 * - complex_task: Multi-file, requires planning
 */

import { chatCompletion } from "./groqClient"

export type Intent = "question" | "simple_edit" | "complex_task"

export interface ClassificationResult {
  intent: Intent
  confidence: number
  reasoning?: string
}

// Keywords that strongly suggest each intent
const QUESTION_PATTERNS = [
  /^what (is|are|does)/i,
  /^how (do|does|can|to)/i,
  /^why (is|does|do)/i,
  /^can you explain/i,
  /^explain/i,
  /^tell me about/i,
  /\?$/,
]

const SIMPLE_EDIT_PATTERNS = [
  /^(add|remove|delete|change|update|fix|rename) (a |the |this )?(\w+)/i,
  /^make (a |the )?(\w+) (bigger|smaller|red|blue|green|faster|slower)/i,
  /^create a (function|variable|class|method|file)/i,
]

const COMPLEX_TASK_PATTERNS = [
  /^(create|build|make) (a |an )?(website|app|application|project|game)/i,
  /^(redesign|refactor|rebuild)/i,
  /multiple (files|components)/i,
  /^implement/i,
  /^set up/i,
]

/**
 * Fast local classification using patterns
 * Returns null if uncertain (should fall back to LLM)
 */
function classifyByPatterns(message: string): ClassificationResult | null {
  const trimmed = message.trim().toLowerCase()

  // Check question patterns (pure knowledge questions without code context)
  for (const pattern of QUESTION_PATTERNS) {
    if (pattern.test(message)) {
      return { intent: "question", confidence: 0.85 }
    }
  }

  // Check complex task patterns (before simple to catch multi-file)
  for (const pattern of COMPLEX_TASK_PATTERNS) {
    if (pattern.test(message)) {
      return { intent: "complex_task", confidence: 0.8 }
    }
  }

  // Check simple edit patterns
  for (const pattern of SIMPLE_EDIT_PATTERNS) {
    if (pattern.test(message)) {
      return { intent: "simple_edit", confidence: 0.75 }
    }
  }

  // Very short messages are likely simple
  if (trimmed.split(/\\s+/).length <= 5) {
    return { intent: "simple_edit", confidence: 0.6 }
  }

  // Uncertain - need LLM classification
  return null
}

/**
 * LLM-based classification for ambiguous cases
 */
async function classifyWithLLM(message: string): Promise<ClassificationResult> {
  const classificationPrompt = `Classify this user request into exactly one category:

USER REQUEST: "${message}"

Categories:
- "question": User is asking for explanation, information, or understanding (no code changes needed)
- "simple_edit": User wants a small, focused change (single file, one function, minor fix)
- "complex_task": User wants multiple files created/modified, new features, or major changes

Respond with ONLY a JSON object:
{"intent": "question"|"simple_edit"|"complex_task", "confidence": 0.0-1.0}`

  try {
    const response = await chatCompletion(
      [{ role: "user", content: classificationPrompt }],
      undefined,
      {
        model: "llama-3.1-8b-instant", // Fast, small model for classification
        maxTokens: 100,
        temperature: 0.1,
      }
    )

    const content = response.choices[0]?.message?.content || ""
    const jsonMatch = content.match(/\{[^}]+\}/)

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        intent: parsed.intent as Intent,
        confidence: parsed.confidence || 0.7,
      }
    }
  } catch (error) {
    console.warn("[Classifier] LLM classification failed:", error)
  }

  // Default to complex_task if uncertain
  return { intent: "complex_task", confidence: 0.5 }
}

/**
 * Main classification function
 * Uses fast pattern matching first, falls back to LLM for ambiguous cases
 */
export async function classifyIntent(message: string): Promise<ClassificationResult> {
  // Try fast pattern matching first
  const patternResult = classifyByPatterns(message)

  if (patternResult && patternResult.confidence >= 0.7) {
    return patternResult
  }

  // Fall back to LLM for ambiguous cases
  return classifyWithLLM(message)
}

/**
 * Quick sync classification for immediate feedback
 * Returns null if LLM classification is needed
 */
export function classifyIntentSync(message: string): ClassificationResult | null {
  return classifyByPatterns(message)
}
