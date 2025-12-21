import type { BlockEditorHandle } from "@/components/editor/BlockEditor"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BlockPreview } from "./BlockPreview"

interface BlockPaletteProps {
  category: string
  editorRef: React.RefObject<BlockEditorHandle | null>
  theme: "light" | "dark"
}

// Simple hardcoded map for now (matches BlockEditor.tsx TOOLBOX_CATEGORIES)
const CATEGORY_BLOCKS: Record<string, { type: string; label: string }[]> = {
  Motion: [
    { type: "move_steps", label: "move 10 steps" },
    { type: "motion_turn_right", label: "turn right 15 deg" },
    { type: "motion_turn_left", label: "turn left 15 deg" },
    { type: "motion_gotoxy", label: "go to x: 0 y: 0" },
    { type: "motion_gotorandom", label: "go to random position" },
  ],
  Looks: [
    { type: "looks_say", label: "say Hello!" },
    { type: "looks_show", label: "show" },
    { type: "looks_hide", label: "hide" },
    { type: "looks_setsize", label: "set size to 100%" },
    { type: "looks_switchbackdrop", label: "switch backdrop" },
  ],
  Events: [{ type: "event_when_flag_clicked", label: "when flag clicked" }],
  Control: [
    { type: "controls_repeat_ext", label: "repeat 10" },
    { type: "controls_whileUntil", label: "while <>" },
  ],
}

export function BlockPalette({ category, editorRef, theme }: BlockPaletteProps) {
  const blocks = CATEGORY_BLOCKS[category] || []

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("block-type", type)
    e.dataTransfer.effectAllowed = "copy"

    // CUSTOM DRAG IMAGE MAGIC
    const target = e.currentTarget as HTMLElement
    // Use the inner block canvas group, which contains ONLY the block paths, no background rect
    // blocklySvg > blocklyWorkspace > blocklyBlockCanvas
    // We try to find the specific group to avoid dragging the white background
    const blockCanvas = target.querySelector("g.blocklyBlockCanvas")

    if (blockCanvas) {
      e.dataTransfer.setDragImage(blockCanvas, 20, 10)
    }
  }

  return (
    <div className="flex h-full flex-col bg-muted/5">
      <div className="flex items-center gap-2 border-b border-border p-3">
        {/* Color dot is less important now that blocks are real, but keeps context */}
        <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
        <span className="text-sm font-semibold">{category}</span>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="flex flex-col items-center space-y-2">
          {blocks.map((block) => (
            <div
              key={block.type}
              draggable
              className="group relative inline-block cursor-grab overflow-hidden active:cursor-grabbing"
              onDragStart={(e) => handleDragStart(e, block.type)}
              onClick={(e) => editorRef.current?.spawnBlock(block.type, e.clientX, e.clientY)}
              title={block.label}
            >
              <div className="origin-left">
                <BlockPreview type={block.type} theme={theme} />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
