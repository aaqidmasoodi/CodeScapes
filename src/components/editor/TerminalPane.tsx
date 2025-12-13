import { Terminal as TerminalIcon, X, AlertCircle, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Problem } from "@/types/problem"

export type TerminalTab = "terminal" | "output" | "problems"

interface TerminalPaneProps {
  problems?: Problem[]
  activeTab: TerminalTab
  onTabChange: (tab: TerminalTab) => void
  onClose?: () => void
  isCollapsed?: boolean
}

export function TerminalPane({
  problems = [],
  activeTab,
  onTabChange,
  onClose,
  isCollapsed = false
}: TerminalPaneProps) {

  // If collapsed, we just render a thin bar at the bottom (handled by parent mostly, but we can provide the UI)
  // Actually, standard pattern is to render the header only.

  return (
    <div className={cn("flex flex-col bg-background text-foreground", isCollapsed ? "h-auto border-t" : "h-full")}>
      <div className={cn("flex items-center justify-between px-4 py-2", !isCollapsed && "border-b")}>
        <div className="flex items-center gap-4 text-xs font-medium uppercase text-muted-foreground">
          <div
            className={cn(
              "flex items-center gap-2 cursor-pointer pb-2 -mb-2.5 hover:text-foreground transition-colors",
              activeTab === "terminal" && !isCollapsed && "border-b-2 border-primary text-foreground",
              activeTab === "terminal" && isCollapsed && "text-foreground"
            )}
            onClick={() => onTabChange("terminal")}
          >
            <TerminalIcon className="h-3.5 w-3.5" />
            Terminal
          </div>
          <div
            className={cn(
              "cursor-pointer pb-2 -mb-2.5 hover:text-foreground transition-colors",
              activeTab === "output" && !isCollapsed && "border-b-2 border-primary text-foreground",
              activeTab === "output" && isCollapsed && "text-foreground"
            )}
            onClick={() => onTabChange("output")}
          >
            Output
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 cursor-pointer pb-2 -mb-2.5 hover:text-foreground transition-colors",
              activeTab === "problems" && !isCollapsed && "border-b-2 border-primary text-foreground",
              activeTab === "problems" && isCollapsed && "text-foreground"
            )}
            onClick={() => onTabChange("problems")}
          >
            Problems
            {problems.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                {problems.length}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isCollapsed ? (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onTabChange(activeTab)}>
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-auto p-4 font-mono text-xs">
          {activeTab === "terminal" && (
            <>
              <div className="text-muted-foreground">CodeScape Terminal [Version 1.0.0]</div>
              <div className="mb-2">(c) 2025 CodeScape Inc.</div>

              <div className="flex gap-2">
                <span className="text-green-500">➜</span>
                <span className="text-blue-500">~/project</span>
                <span>npm start</span>
              </div>
              <div className="mt-1 text-muted-foreground">
                &gt; react-scripts start
                <br />
                Starting the development server...
              </div>

              <div className="mt-2 flex gap-2">
                <span className="text-green-500">➜</span>
                <span className="text-blue-500">~/project</span>
                <span className="animate-pulse">_</span>
              </div>
            </>
          )}

          {activeTab === "output" && (
            <div className="text-muted-foreground">No output available.</div>
          )}

          {activeTab === "problems" && (
            <div className="flex flex-col gap-1">
              {problems.length === 0 ? (
                <div className="text-muted-foreground">No problems have been detected in the workspace.</div>
              ) : (
                problems.map(problem => (
                  <div key={problem.id} className="group flex cursor-pointer items-start gap-2 hover:bg-muted/50 p-1 rounded">
                    <AlertCircle className={cn("mt-0.5 h-3.5 w-3.5 flex-shrink-0", problem.severity === "error" ? "text-destructive" : "text-yellow-500")} />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-foreground">{problem.message}</span>
                      <span className="text-muted-foreground">{problem.file} [{problem.line}:{problem.column}]</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
