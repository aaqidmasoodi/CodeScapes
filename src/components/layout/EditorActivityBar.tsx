import { Files, Search, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type EditorTool = "explorer" | "search" | "settings" | null

interface EditorActivityBarProps {
    activeTool: EditorTool
    onToolSelect: (tool: EditorTool) => void
    className?: string
}

export function EditorActivityBar({ activeTool, onToolSelect, className }: EditorActivityBarProps) {
    const tools = [
        { id: "explorer", icon: Files, label: "Explorer" },
        { id: "search", icon: Search, label: "Search" },
    ]

    const handleToolClick = (toolId: string) => {
        // Toggle logic: if clicking active tool, deselect it (collapse)
        if (activeTool === toolId) {
            onToolSelect(null)
        } else {
            onToolSelect(toolId as EditorTool)
        }
    }

    return (
        <div className={cn("flex h-full w-12 flex-col justify-between border-r bg-muted/20 py-4", className)}>
            <div className="flex flex-col items-center gap-2">
                {tools.map((tool) => (
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
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground"
                    title="Settings"
                >
                    <Settings className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
