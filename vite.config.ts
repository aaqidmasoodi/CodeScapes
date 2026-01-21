import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"
import { loadEnv } from "vite"
import obfuscator from "rollup-plugin-obfuscator"

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [
      react(),
      {
        name: "configure-response-headers",
        configureServer: (server) => {
          server.middlewares.use((_req, _res, next) => {
            // res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
            // res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
            next()
          })

          // Mock Turnstile Verification (for local dev)
          server.middlewares.use("/api/verify-turnstile", async (req, res) => {
            const chunks = []
            for await (const chunk of req) chunks.push(chunk)
            const body = Buffer.concat(chunks).toString()

            res.setHeader("Content-Type", "application/json")
            res.setHeader("Access-Control-Allow-Origin", "*")

            try {
              const { token } = JSON.parse(body || "{}")
              // Always succeed in dev if token is present (even if it's the real Cloudflare token, we can't verify it locally easily without secrets)
              // But specifically check for our dev bypass
              if (token) {
                setTimeout(() => {
                  res.end(JSON.stringify({ success: true }))
                }, 500) // Small delay to simulate network
              } else {
                res.statusCode = 400
                res.end(JSON.stringify({ success: false, error: "Missing token" }))
              }
            } catch {
              res.statusCode = 400
              res.end(JSON.stringify({ success: false, error: "Invalid JSON" }))
            }
          })

          // Localhost CORS Proxy Middleware
          server.middlewares.use("/api/cors-proxy", async (req, res) => {
            const urlObj = new URL(req.url || "", `http://${req.headers.host}`)
            const targetUrl = urlObj.searchParams.get("url")

            if (!targetUrl) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: "Missing url parameter" }))
              return
            }

            try {
              // Validate URL format
              try {
                new URL(targetUrl)
              } catch {
                res.statusCode = 400
                res.end(JSON.stringify({ error: "Invalid target URL" }))
                return
              }

              const response = await fetch(targetUrl)

              // Propagate upstream status
              res.statusCode = response.status

              // Forward headers
              res.setHeader("Access-Control-Allow-Origin", "*")
              res.setHeader(
                "Content-Type",
                response.headers.get("Content-Type") || "application/octet-stream"
              )

              // Stream response
              const buffer = await response.arrayBuffer()
              res.end(Buffer.from(buffer))
            } catch (error) {
              // Log the real error for debugging
              console.error("Proxy error:", error)

              // Determine appropriate status code
              let statusCode = 500
              let errorMessage = "Internal Proxy Error"

              // Check for common network errors
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const code = (error as any).cause?.code || (error as any).code

              if (code === "ENOTFOUND") {
                statusCode = 502 // Bad Gateway (Upstream unreachable / DNS error)
                errorMessage = "Upstream unreachable (DNS Error)"
              } else if (code === "ECONNREFUSED") {
                statusCode = 502
                errorMessage = "Upstream connection refused"
              } else if (code === "ETIMEDOUT") {
                statusCode = 504 // Gateway Timeout
                errorMessage = "Upstream request timed out"
              }

              // Return sanitized error to client
              res.statusCode = statusCode
              const message =
                mode === "production" ? errorMessage : `${errorMessage}: ${String(error)}`
              res.end(JSON.stringify({ error: message }))
            }
          })

          // Localhost Scapper AI Proxy Middleware (for local development)
          server.middlewares.use("/api/scapper-proxy", async (req, res) => {
            // Set CORS headers
            res.setHeader("Access-Control-Allow-Origin", "*")
            res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

            if (req.method === "OPTIONS") {
              res.statusCode = 200
              res.end()
              return
            }

            if (req.method !== "POST") {
              res.statusCode = 405
              res.end(JSON.stringify({ error: "Method not allowed" }))
              return
            }

            // Get GROQ API key from environment
            const groqApiKey = env.GROQ_API_KEY
            if (!groqApiKey) {
              console.error("[Scapper Proxy] GROQ_API_KEY not found in environment")
              res.statusCode = 500
              res.end(JSON.stringify({ error: "GROQ_API_KEY not configured" }))
              return
            }

            try {
              // Collect request body
              let body = ""
              for await (const chunk of req) {
                body += chunk.toString()
              }
              const requestBody = JSON.parse(body)

              // Remove promptType before forwarding to Groq
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { promptType, ...groqBody } = requestBody

              // Forward to Groq API
              const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${groqApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(groqBody),
              })

              // Handle streaming responses
              if (requestBody.stream && groqResponse.body) {
                res.setHeader("Content-Type", "text/event-stream")
                res.setHeader("Cache-Control", "no-cache")
                res.setHeader("Connection", "keep-alive")

                const reader = groqResponse.body.getReader()
                const decoder = new TextDecoder()

                try {
                  while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    const chunk = decoder.decode(value, { stream: true })
                    res.write(chunk)
                  }
                  res.end()
                } catch (streamError) {
                  console.error("[Scapper Proxy] Stream error:", streamError)
                  res.end()
                }
                return
              }

              // Handle non-streaming responses
              const groqData = await groqResponse.json()
              res.statusCode = groqResponse.status
              res.setHeader("Content-Type", "application/json")
              res.end(JSON.stringify(groqData))
            } catch (error) {
              console.error("[Scapper Proxy] Error:", error)
              res.statusCode = 500
              res.end(JSON.stringify({ error: "Internal server error" }))
            }
          })
        },
      },
      mode === "production" &&
        obfuscator({
          global: false, // Critical: Only obfuscate user code, not vendor bundles (fixes "N is not a function")
          include: ["src/**/*.{ts,tsx,js,jsx}"],
          exclude: [/node_modules/, /\.test\./],
          options: {
            compact: true,
            controlFlowFlattening: false, // Disabled for stability
            deadCodeInjection: false,
            debugProtection: false,
            disableConsoleOutput: true,
            identifierNamesGenerator: "hexadecimal",
            log: false,
            numbersToExpressions: false, // Disabled for performance/stability
            renameGlobals: false,
            selfDefending: false,
            simplify: true,
            splitStrings: false,
            stringArray: true,
            stringArrayThreshold: 0.3,
            transformObjectKeys: false,
            unicodeEscapeSequence: false,
          },
        }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: false, // IP Protection: Disable source maps
      rollupOptions: {
        // Exclude api folder and Node.js modules from client bundle
        external: [/^api\//, "fs", "path"],
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      exclude: ["tests/**", "node_modules/**"],
    },
    server: {
      headers: {
        // "Cross-Origin-Embedder-Policy": "require-corp",
        // "Cross-Origin-Opener-Policy": "same-origin",
      },
    },
    preview: {
      headers: {
        // "Cross-Origin-Embedder-Policy": "require-corp",
        // "Cross-Origin-Opener-Policy": "same-origin",
      },
    },
  }
})
