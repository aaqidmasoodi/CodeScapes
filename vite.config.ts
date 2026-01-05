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
      },
    },
    mode === "production" &&
      obfuscator({
        global: true,
        options: {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.3, // Lowered for stability
          deadCodeInjection: false,
          debugProtection: false, // Disabled to prevent runtime freezes
          debugProtectionInterval: 4000,
          disableConsoleOutput: true,
          identifierNamesGenerator: "hexadecimal",
          log: false,
          numbersToExpressions: true,
          renameGlobals: false,
          selfDefending: false, // Disabled to prevent loops
          simplify: true,
          splitStrings: false,
          stringArray: true,
          stringArrayCallsTransform: true,
          stringArrayCallsTransformThreshold: 0.3, // Lowered
          stringArrayEncoding: ["base64"],
          stringArrayIndexShift: true,
          stringArrayRotate: true,
          stringArrayShuffle: true,
          stringArrayWrappersCount: 1,
          stringArrayWrappersChainedCalls: true,
          stringArrayWrappersType: "function",
          stringArrayThreshold: 0.3, // Lowered
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
