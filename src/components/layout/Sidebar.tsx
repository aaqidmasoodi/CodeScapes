import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Settings,
  LogOut,
  Database,
  Cloud,
  Globe,
  Book,
  MessageSquarePlus,
  Library,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog"

import { useLocation } from "react-router-dom"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isMobile?: boolean
  onMobileLinkClick?: () => void
}

export function Sidebar({ className, isMobile, onMobileLinkClick }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [isHovered, setIsHovered] = useState(false)

  // Determine active tab based on path
  const path = location.pathname
  let activeTab = "scapes" // Default fallthrough, though usually not hit if routing is correct
  if (path.startsWith("/dashboard/local")) activeTab = "local"
  else if (path.startsWith("/dashboard/cloud")) activeTab = "cloud"
  else if (path.startsWith("/dashboard/collections")) activeTab = "collections"
  else if (path.startsWith("/dashboard/library")) activeTab = "library"
  else if (path.startsWith("/community")) activeTab = "community"

  // Mobile always expanded, Desktop depends on hover
  const isExpanded = isMobile || isHovered

  const allTabs = [
    { id: "local", icon: Database, label: "Local Scapes", path: "/dashboard/local" },
    { id: "cloud", icon: Cloud, label: "Cloud Scapes", path: "/dashboard/cloud" },
    { id: "collections", icon: Book, label: "Collections", path: "/dashboard/collections" },
    { id: "library", icon: Library, label: "Library", path: "/dashboard/library" },
    { id: "community", icon: Globe, label: "Community", path: "/community" },
  ]

  const tabs = user ? allTabs : allTabs.filter((t) => !["cloud", "collections"].includes(t.id))

  const handleTabClick = (path: string | null) => {
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
        "group z-50 flex h-full flex-col justify-between border-r bg-background py-4 transition-all duration-300 ease-in-out",
        isMobile ? "w-full border-none bg-transparent" : "w-12 hover:w-56 hover:shadow-xl",
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
            onClick={() => handleTabClick(tab.path)}
          >
            {/* Fixed Width Icon Container - Guarantees 0 Shift */}
            <div className="flex h-9 w-12 shrink-0 items-center justify-center">
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
        <FeedbackDialog
          trigger={
            <Button
              variant="ghost"
              className="relative flex w-full items-center justify-start overflow-hidden p-0 text-muted-foreground hover:text-primary"
              onMouseDown={() => !isMobile && setIsHovered(false)}
            >
              <div className="flex h-9 w-12 shrink-0 items-center justify-center">
                <MessageSquarePlus className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "whitespace-nowrap transition-opacity duration-300",
                  isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                Feedback
              </span>
            </Button>
          }
        />

        <Button
          variant="ghost"
          className="relative flex w-full items-center justify-start overflow-hidden p-0 text-muted-foreground hover:text-primary"
          onClick={() => navigate("/docs/introduction")}
        >
          <div className="flex h-9 w-12 shrink-0 items-center justify-center">
            <Book className="h-5 w-5" />
          </div>
          <span
            className={cn(
              "whitespace-nowrap transition-opacity duration-300",
              isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            Documentation
          </span>
        </Button>

        <Button
          variant="ghost"
          className="relative flex w-full items-center justify-start overflow-hidden p-0 text-muted-foreground hover:text-primary"
          onClick={() => console.log("Open settings")}
        >
          <div className="flex h-9 w-12 shrink-0 items-center justify-center">
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

        {user && (
          <Button
            variant="ghost"
            className="relative flex w-full items-center justify-start overflow-hidden p-0 text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
            onClick={() => signOut()}
          >
            <div className="flex h-9 w-12 shrink-0 items-center justify-center">
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
        )}
      </div>
    </div>
  )
}
