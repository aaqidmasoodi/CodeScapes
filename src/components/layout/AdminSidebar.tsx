import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Settings, LogOut, LayoutDashboard, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

interface AdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab?: string
  isMobile?: boolean
}

export function AdminSidebar({ className, activeTab = "dashboard", isMobile }: AdminSidebarProps) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [isHovered, setIsHovered] = useState(false)

  // Mobile always expanded, Desktop depends on hover
  const isExpanded = isMobile || isHovered

  const tabs = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { id: "docs", icon: FileText, label: "Documentation", path: "/admin/docs" },
  ]

  const handleTabClick = (path: string) => {
    navigate(path)
  }

  return (
    <div
      className={cn(
        "group z-50 flex h-full flex-col justify-between border-r bg-background py-4 transition-all duration-300 ease-in-out",
        isMobile ? "w-full border-none bg-transparent" : "w-16 hover:w-64 hover:shadow-xl",
        className
      )}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <nav className="flex flex-col gap-2 px-0">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={
              activeTab === tab.id || (activeTab === "dashboard" && tab.id === "dashboard")
                ? "secondary"
                : "ghost"
            }
            // ^ Simple check, can be improved for nested routes
            className={cn(
              "relative flex w-full items-center justify-start overflow-hidden p-0 transition-all duration-200",
              // Highlight logic: if activeTab starts with 'docs' and tab.id is 'docs', etc.
              // For now, simple strict match or default.
              (activeTab && activeTab.includes(tab.id)) ||
                (activeTab === "overview" && tab.id === "dashboard")
                ? "bg-secondary text-secondary-foreground"
                : ""
            )}
            onClick={() => handleTabClick(tab.path)}
          >
            {/* Fixed Width Icon Container - Guarantees 0 Shift */}
            <div className="flex h-10 w-16 shrink-0 items-center justify-center">
              <tab.icon className="h-5 w-5" />
            </div>

            <span
              className={cn(
                "whitespace-nowrap transition-opacity duration-300",
                isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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
        >
          <div className="flex h-10 w-16 shrink-0 items-center justify-center">
            <Settings className="h-5 w-5" />
          </div>
          <span
            className={cn(
              "whitespace-nowrap transition-opacity duration-300",
              isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            Settings
          </span>
        </Button>

        <Button
          variant="ghost"
          className="relative flex w-full items-center justify-start overflow-hidden p-0 text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
          onClick={() => signOut()}
        >
          <div className="flex h-10 w-16 shrink-0 items-center justify-center">
            <LogOut className="h-5 w-5" />
          </div>
          <span
            className={cn(
              "whitespace-nowrap transition-opacity duration-300",
              isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            Sign Out
          </span>
        </Button>
      </div>
    </div>
  )
}
