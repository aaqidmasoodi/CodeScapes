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
              const response = await fetch(targetUrl)

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
              console.error("Proxy error:", error)
              res.statusCode = 500
              res.end(JSON.stringify({ error: "Proxy failed" }))
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
