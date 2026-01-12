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
 * Uses LLM exclusively for robust context awareness
 */
export async function classifyIntent(message: string): Promise<ClassificationResult> {
  return classifyWithLLM(message)
}
