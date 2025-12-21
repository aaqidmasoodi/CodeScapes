import { Files, Search, Settings, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface ActivityTool {
  id: string
  icon: React.ElementType
  label: string
}

interface EditorActivityBarProps {
  activeTool: string | null
  onToolSelect: (toolId: string | null) => void
  onSettingsClick: () => void
  className?: string
  topTools?: ActivityTool[]
  bottomTools?: ActivityTool[]
}

export function EditorActivityBar({
  activeTool,
  onToolSelect,
  onSettingsClick,
  className,
  topTools = [],
  bottomTools = [],
}: EditorActivityBarProps) {
  // Default tools if none provided (backward compatibility)
  const defaultTopTools: ActivityTool[] = [
    { id: "explorer", icon: Files, label: "Explorer" },
    { id: "search", icon: Search, label: "Search" },
    { id: "secrets", icon: Lock, label: "Secrets" },
  ]

  const toolsToRender = topTools.length > 0 ? topTools : defaultTopTools

  const handleToolClick = (toolId: string) => {
    if (activeTool === toolId) {
      onToolSelect(null)
    } else {
      onToolSelect(toolId)
    }
  }

  return (
    <div
      className={cn(
        "flex h-full w-12 flex-col justify-between border-r bg-muted/20 py-4",
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        {toolsToRender.map((tool) => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? "secondary" : "ghost"}
            size="icon"
            className={cn(
              "h-10 w-10 text-muted-foreground",
              activeTool === tool.id && "text-foreground"
            )}
            onClick={() => handleToolClick(tool.id)}
            title={tool.label}
          >
            <tool.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        {bottomTools.map((tool) => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? "secondary" : "ghost"}
            size="icon"
            className={cn(
              "h-10 w-10 text-muted-foreground",
              activeTool === tool.id && "text-foreground"
            )}
            onClick={() => handleToolClick(tool.id)}
            title={tool.label}
          >
            <tool.icon className="h-5 w-5" />
          </Button>
        ))}

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-muted-foreground"
          title="Settings"
          onClick={onSettingsClick}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
