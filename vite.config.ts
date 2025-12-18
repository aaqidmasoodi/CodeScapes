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
        server.middlewares.use((_req, res, next) => {
          // res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
          // res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
          next()
        })
      },
    },
    mode === "production" &&
      obfuscator({
        global: true,
        options: {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.5, // Reduced from 0.75
          deadCodeInjection: false, // Disabled (Major perf/crash culprit)
          debugProtection: true,
          debugProtectionInterval: 4000,
          disableConsoleOutput: true,
          identifierNamesGenerator: "hexadecimal", // Strongest
          log: false, // Cleaner build output
          numbersToExpressions: true, // Good for confusing math
          renameGlobals: false,
          selfDefending: true, // Prevents tampering
          simplify: true,
          splitStrings: false, // Disabled (Can cause crashes with huge chunks)
          stringArray: true,
          stringArrayCallsTransform: true,
          stringArrayCallsTransformThreshold: 0.5,
          stringArrayEncoding: ["base64"],
          stringArrayIndexShift: true,
          stringArrayRotate: true,
          stringArrayShuffle: true,
          stringArrayWrappersCount: 1, // Reduced wrapper complexity
          stringArrayWrappersChainedCalls: true,
          stringArrayWrappersType: "function",
          stringArrayThreshold: 0.5,
          transformObjectKeys: false, // Disabled to fix IndexedDB persistence
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
