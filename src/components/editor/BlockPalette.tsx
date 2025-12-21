import type { BlockEditorHandle } from "@/components/editor/BlockEditor"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BlockPaletteProps {
  category: string
  editorRef: React.RefObject<BlockEditorHandle | null>
}

// Simple hardcoded map for now (matches BlockEditor.tsx TOOLBOX_CATEGORIES)
const CATEGORY_BLOCKS: Record<string, { type: string; label: string }[]> = {
  Motion: [
    { type: "move_steps", label: "move 10 steps" },
    { type: "turn_right", label: "turn right 15 deg" },
  ],
  Events: [{ type: "event_when_flag_clicked", label: "when flag clicked" }],
  Control: [
    { type: "controls_repeat_ext", label: "repeat 10" },
    { type: "controls_whileUntil", label: "while <>" },
  ],
}

const CATEGORY_COLORS: Record<string, string> = {
  Motion: "#3b82f6", // Blue
  Events: "#eab308", // Yellow
  Control: "#8b5cf6", // Purple
}

export function BlockPalette({ category, editorRef }: BlockPaletteProps) {
  const blocks = CATEGORY_BLOCKS[category] || []
  const color = CATEGORY_COLORS[category] || "#71717a"

  const handleMouseDown = (e: React.MouseEvent, type: string) => {
    // 1. Prevent default to stop weird text selection
    e.preventDefault()

    // 2. Spawn the block via the Editor's imperative API
    if (editorRef.current) {
      editorRef.current.spawnBlock(type, e.clientX, e.clientY)
    }
  }

  return (
    <div className="flex h-full flex-col bg-muted/5">
      <div className="flex items-center gap-2 border-b border-border p-3">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-semibold">{category}</span>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="flex flex-col gap-2">
          {blocks.map((block) => (
            <div
              key={block.type}
              className="flex cursor-grab select-none items-center gap-2 rounded-md border border-border bg-card p-2 text-xs hover:border-primary/50 hover:bg-accent active:cursor-grabbing"
              onMouseDown={(e) => handleMouseDown(e, block.type)}
              title={block.label}
            >
              <div
                className="h-full w-1 rounded-full opacity-80"
                style={{ backgroundColor: color }}
              />
              <span className="truncate">{block.label}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
