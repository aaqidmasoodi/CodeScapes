/**
 * esbuild bundler for Vercel API functions
 *
 * Bundles each API function with all dependencies into a single file.
 * This solves the ESM module resolution issue where shared modules
 * like rateLimit.ts aren't properly included by Vercel's default bundler.
 *
 * Usage: node scripts/bundle-api.mjs
 */

import * as esbuild from "esbuild"
import { readdirSync, mkdirSync, existsSync } from "fs"
import { join, basename } from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, "..")

// Source files in api-src/, bundled output in api/
const API_SRC = join(projectRoot, "api-src")
const API_DIST = join(projectRoot, "api")

// Ensure output directory exists
if (!existsSync(API_DIST)) {
    mkdirSync(API_DIST, { recursive: true })
}

// Get all .ts files in api/ (excluding lib folder)
const apiFiles = readdirSync(API_SRC).filter(
    (f) => f.endsWith(".ts") && !f.startsWith("_")
)

console.log(`🔧 Bundling ${apiFiles.length} API functions...`)

for (const file of apiFiles) {
    const entryPoint = join(API_SRC, file)
    const outFile = join(API_DIST, file.replace(".ts", ".js"))

    try {
        await esbuild.build({
            entryPoints: [entryPoint],
            bundle: true,
            platform: "node",
            target: "node18",
            format: "esm",
            outfile: outFile,
            external: [
                // Don't bundle these - Vercel provides them
                "@vercel/node",
            ],
            // Ensure all other dependencies are bundled inline
            packages: "bundle",
            minify: false, // Keep readable for debugging
            sourcemap: false,
            logLevel: "info",
        })
        console.log(`  ✅ ${file} → ${basename(outFile)}`)
    } catch (error) {
        console.error(`  ❌ Failed to bundle ${file}:`, error)
        process.exit(1)
    }
}

console.log(`\n✨ All API functions bundled to ${API_DIST}/`)
