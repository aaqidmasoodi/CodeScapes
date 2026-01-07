import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"
import obfuscator from "rollup-plugin-obfuscator"

export default defineConfig(({ mode }) => ({
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
}))
