import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Settings, LogOut, Database, Cloud, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab?: string
  onTabChange?: (tab: string) => void
  isMobile?: boolean
  onMobileLinkClick?: () => void
}

export function Sidebar({
  className,
  activeTab = "scapes",
  onTabChange,
  isMobile,
  onMobileLinkClick,
}: SidebarProps) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [isHovered, setIsHovered] = useState(false)

  // Mobile always expanded, Desktop depends on hover
  const isExpanded = isMobile || isHovered

  const allTabs = [
    { id: "local", icon: Database, label: "Local Scapes", path: "/dashboard/local" },
    { id: "cloud", icon: Cloud, label: "Cloud Scapes", path: "/dashboard/cloud" },
    { id: "community", icon: Globe, label: "Community", path: "/community" },
  ]

  const tabs = user ? allTabs : allTabs.filter(t => t.id !== "cloud")

  const handleTabClick = (tabId: string, path: string | null) => {
    if (onTabChange) {
      onTabChange(tabId)
    }
    if (path) {
      navigate(path)
    }
    if (onMobileLinkClick) {
      onMobileLinkClick()
    }
  }

  return (
    <div
      className={cn(
        "z-50 flex h-full flex-col justify-between border-r bg-background py-4 transition-all duration-300 ease-in-out",
        isMobile
          ? "w-full border-none bg-transparent"
          : cn("w-16 hover:w-64 hover:shadow-xl", isExpanded && "w-64"),
        className
      )}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <nav className="flex flex-col gap-2 px-0">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "secondary" : "ghost"}
            className={cn(
              "relative flex w-full items-center justify-start overflow-hidden p-0 transition-all duration-200",
              activeTab === tab.id && "bg-secondary text-secondary-foreground"
            )}
            onClick={() => handleTabClick(tab.id, tab.path)}
          >
            {/* Fixed Width Icon Container - Guarantees 0 Shift */}
            <div className="flex h-10 w-16 shrink-0 items-center justify-center">
              <tab.icon className="h-5 w-5" />
            </div>

            <span
              className={cn(
                "whitespace-nowrap transition-opacity duration-300",
                isExpanded ? "opacity-100" : "opacity-0"
              )}
            >
              {tab.label}
            </span>
          </Button>
        ))}
      </nav>

      <div className="flex flex-col gap-2 px-0">
        <Button
          variant="ghost"
          className="relative flex w-full items-center justify-start overflow-hidden p-0 text-muted-foreground hover:text-primary"
          onClick={() => console.log("Open settings")}
        >
          <div className="flex h-10 w-16 shrink-0 items-center justify-center">
            <Settings className="h-5 w-5" />
          </div>
          <span
            className={cn(
              "whitespace-nowrap transition-opacity duration-300",
              isExpanded ? "opacity-100" : "opacity-0"
            )}
          >
            Settings
          </span>
        </Button>

        {user && (
          <Button
            variant="ghost"
            className="relative flex w-full items-center justify-start overflow-hidden p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => signOut()}
          >
            <div className="flex h-10 w-16 shrink-0 items-center justify-center">
              <LogOut className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "whitespace-nowrap transition-opacity duration-300",
                isExpanded ? "opacity-100" : "opacity-0"
              )}
            >
              Sign Out
            </span>
          </Button>
        )}
      </div>
    </div>
  )
}
