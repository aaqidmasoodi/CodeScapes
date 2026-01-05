import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"
// import obfuscator from "rollup-plugin-obfuscator"

export default defineConfig(() => ({
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
      },
    },
    // Obfuscation disabled for staging debugging
    // mode === "production" && obfuscator({ ... })
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
