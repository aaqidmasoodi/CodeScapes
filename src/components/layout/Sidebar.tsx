import { useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, BookOpen, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function Sidebar({ className, activeTab = "scape", onTabChange }: SidebarProps) {
  const navigate = useNavigate()

  const tabs = [
    { id: "dashboard", icon: LayoutDashboard, label: "My Scapes", path: "/dashboard" },
    { id: "learn", icon: BookOpen, label: "Learn", path: "/dashboard" },
    { id: "community", icon: Users, label: "Community", path: "/dashboard" },
  ]

  const handleTabClick = (tabId: string, path: string | null) => {
    if (onTabChange) {
      onTabChange(tabId)
    }
    if (path) {
      navigate(path)
    }
  }

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col justify-between border-r bg-muted/20 py-4",
        className
      )}
    >
      <nav className="flex flex-col gap-1 px-3">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "justify-start gap-3 px-3",
              activeTab === tab.id && "bg-secondary text-secondary-foreground"
            )}
            onClick={() => handleTabClick(tab.id, tab.path)}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </Button>
        ))}
      </nav>

      <div className="px-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-primary"
          onClick={() => console.log("Open settings")}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Button>
      </div>
    </div>
  )
}
