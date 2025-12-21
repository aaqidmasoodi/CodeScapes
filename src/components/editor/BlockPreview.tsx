import { useRef, useEffect, useState } from "react"
import * as Blockly from "blockly"
import {
  CODESCAPE_DARK_PREVIEW_THEME,
  CODESCAPE_LIGHT_PREVIEW_THEME,
  registerBlocks,
} from "./blockly-init"

interface BlockPreviewProps {
  type: string
  theme?: "light" | "dark"
}

export const BlockPreview = ({ type, theme = "dark" }: BlockPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const [size, setSize] = useState({ width: 0, height: 56 })

  // Resize workspace whenever container size changes
  useEffect(() => {
    if (workspaceRef.current && size.width > 0 && size.height > 0) {
      Blockly.svgResize(workspaceRef.current)
    }
  }, [size])

  useEffect(() => {
    if (!containerRef.current) return
    if (workspaceRef.current) return

    // Ensure blocks are registered
    registerBlocks()

    // Inject Headless-like workspace (read-only, no scrollbars)
    const targetTheme =
      theme === "light" ? CODESCAPE_LIGHT_PREVIEW_THEME : CODESCAPE_DARK_PREVIEW_THEME

    workspaceRef.current = Blockly.inject(containerRef.current, {
      readOnly: true,
      scrollbars: false,
      zoom: {
        controls: false,
        wheel: false,
        startScale: 0.7, // Slightly smaller fit
      },
      theme: targetTheme,
      renderer: "zelos",
      css: true,
      // minimal sounds/trashcan
      trashcan: false,
      sounds: false,
    })

    // Create the block
    const block = workspaceRef.current.newBlock(type)
    block.initSvg()
    block.render()

    // Explicitly hide the background rect to ensure true transparency during drag
    const background = workspaceRef.current
      .getCanvas()
      .parentNode?.querySelector(".blocklyMainBackground")
    if (background) {
      ;(background as HTMLElement).style.display = "none"
    }

    // --- SIZING LOGIC ---
    // We use block.getHeightWidth() because it is synchronous and reliable for a single block.
    // workspace.getBlocksBoundingBox() can be flaky on initial render frames.

    // 1. Move block to have a nice margin from top-left (8px)
    block.moveBy(8, 8)

    // 2. Get dimensions
    const bbox = block.getHeightWidth()

    // 3. Add ample padding (16px total buffer) to avoid cropping strokes/hats/notches
    const padding = 16
    const newWidth = bbox.width + padding
    const newHeight = bbox.height + padding

    setSize({ width: newWidth, height: newHeight })

    // Force initial resize
    Blockly.svgResize(workspaceRef.current)

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose()
        workspaceRef.current = null
      }
    }
  }, []) // Run once

  // Handle Theme Update
  useEffect(() => {
    if (workspaceRef.current) {
      const targetTheme =
        theme === "light" ? CODESCAPE_LIGHT_PREVIEW_THEME : CODESCAPE_DARK_PREVIEW_THEME
      workspaceRef.current.setTheme(targetTheme)
      workspaceRef.current.refreshTheme()
    }
  }, [theme])

  return (
    <div
      ref={containerRef}
      style={{ height: size.height, width: size.width || "100%" }}
      className="pointer-events-none relative overflow-hidden transition-all duration-200"
    />
  )
}
