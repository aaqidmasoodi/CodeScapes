import { Files, Search, Settings, Lock, MessageSquarePlus, HelpCircle, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog"
import { ProModal } from "@/components/billing/ProModal"
import { useState, useEffect } from "react"
import { getQuotaStatus, type QuotaStatus } from "@/lib/quotaClient"
import { useAuth } from "@/hooks/useAuth"

export interface ActivityTool {
  id: string
  icon: React.ElementType
  label: string
  badge?: number | string
}

interface EditorActivityBarProps {
  activeTool: string | null
  onToolSelect: (toolId: string | null) => void
  onSettingsClick: () => void
  onHelpClick?: () => void
  className?: string
  topTools?: ActivityTool[]
  bottomTools?: ActivityTool[]
}

export function EditorActivityBar({
  activeTool,
  onToolSelect,
  onSettingsClick,
  onHelpClick,
  className,
  topTools = [],
  bottomTools = [],
}: EditorActivityBarProps) {
  const { user } = useAuth()
  const [proModalOpen, setProModalOpen] = useState(false)
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null)

  // Fetch quota status on mount and when user changes
  useEffect(() => {
    if (!user) return

    const fetchStatus = async () => {
      const status = await getQuotaStatus()
      setQuotaStatus(status)
    }

    fetchStatus()
  }, [user])

  const isPro = quotaStatus?.tier === "pro"

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
    <>
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
              data-tour={`sidebar-${tool.id}`}
              variant={activeTool === tool.id ? "secondary" : "ghost"}
              size="icon"
              onClick={() => handleToolClick(tool.id)}
              title={tool.label}
              className={cn(
                "relative h-10 w-10 text-muted-foreground",
                activeTool === tool.id && "text-foreground"
              )}
            >
              <tool.icon className="h-5 w-5" />
              {tool.badge ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                  {tool.badge}
                </span>
              ) : null}
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

          <FeedbackDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground"
                title="Feedback"
              >
                <MessageSquarePlus className="h-5 w-5" />
              </Button>
            }
          />

          {/* CodeScapes Pro Button - Golden for Pro users */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 transition-colors",
              isPro
                ? "text-amber-400 hover:text-amber-300" // Golden for Pro
                : "text-emerald-500 hover:text-emerald-400" // Green for Free
            )}
            title={isPro ? "You are Pro! ✨" : "CodeScapes Pro"}
            onClick={() => setProModalOpen(true)}
          >
            <Crown className="h-5 w-5" />
          </Button>

          {onHelpClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground"
              title="Help / Restart Tour"
              onClick={onHelpClick}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          )}

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

      {/* Pro Modal */}
      <ProModal isOpen={proModalOpen} onClose={() => setProModalOpen(false)} />
    </>
  )
}
