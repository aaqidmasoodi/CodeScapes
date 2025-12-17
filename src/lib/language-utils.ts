export function getLanguageFromFilename(filename: string): string {
  if (!filename) return "plaintext"

  const lower = filename.toLowerCase()

  // Specific filenames
  if (lower === "dockerfile") return "dockerfile"
  if (lower === "makefile") return "makefile"

  // Extensions
  if (lower.endsWith(".tsx")) return "typescript"
  if (lower.endsWith(".ts")) return "typescript"
  if (lower.endsWith(".jsx")) return "javascript"
  if (lower.endsWith(".js")) return "javascript"
  if (lower.endsWith(".mjs")) return "javascript"
  if (lower.endsWith(".cjs")) return "javascript"

  if (lower.endsWith(".html")) return "html"
  if (lower.endsWith(".htm")) return "html"

  if (lower.endsWith(".css")) return "css"
  if (lower.endsWith(".scss")) return "scss"
  if (lower.endsWith(".less")) return "less"

  if (lower.endsWith(".json")) return "json"
  if (lower.endsWith(".csv")) return "csv" // Was often misidentified
  if (lower.endsWith(".xml")) return "xml"
  if (lower.endsWith(".yaml")) return "yaml"
  if (lower.endsWith(".yml")) return "yaml"

  if (lower.endsWith(".md")) return "markdown"
  if (lower.endsWith(".markdown")) return "markdown"

  if (lower.endsWith(".py")) return "python"
  if (lower.endsWith(".sql")) return "sql"
  if (lower.endsWith(".go")) return "go"
  if (lower.endsWith(".rs")) return "rust"
  if (lower.endsWith(".java")) return "java"
  if (lower.endsWith(".cpp")) return "cpp"
  if (lower.endsWith(".c")) return "c"
  if (lower.endsWith(".php")) return "php"

  // Default fallback
  return "plaintext"
}
