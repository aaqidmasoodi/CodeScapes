import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"
import { DocsRepository } from "@/lib/repositories/DocsRepository"
import type { DocsTreeItem } from "@/types/docs"
import { ModeToggle } from "@/components/mode-toggle"
import { CodeScapeLogo } from "@/components/brand/Logo"

interface DocsSidebarItemProps {
  item: DocsTreeItem
  depth?: number
  activeSlug: string
}

function DocsSidebarItem({ item, depth = 0, activeSlug }: DocsSidebarItemProps) {
  const [isOpen, setIsOpen] = useState(true)
  const hasChildren = item.children && item.children.length > 0
  const isActive = item.slug === activeSlug

  if (item.type === "page") {
    return (
      <Link
        to={`/docs/${item.slug}`}
        className={cn(
          "flex w-full items-center rounded-md px-2 py-1.5 text-sm font-medium hover:underline",
          isActive ? "font-semibold text-primary" : "text-muted-foreground",
          depth > 0 && "ml-4"
        )}
      >
        {item.title}
      </Link>
    )
  }

  // Category (Folder)
  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold hover:bg-muted/50",
          depth > 0 && "ml-4"
        )}
      >
        <span>{item.title}</span>
        {hasChildren && (
          <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
        )}
      </button>

      {isOpen && hasChildren && (
        <div className="ml-3 mt-1 flex flex-col gap-1 border-l pl-1">
          {item.children.map((child) => (
            <DocsSidebarItem
              key={child.id}
              item={child}
              depth={depth + 1}
              activeSlug={activeSlug}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const [tree, setTree] = useState<DocsTreeItem[]>([])
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const location = useLocation()

  // Extract clean slug from path: /docs/foo -> foo
  const currentSlug = location.pathname.split("/").pop() || ""

  useEffect(() => {
    DocsRepository.getPublicTree().then(setTree)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="flex h-14 items-center border-b px-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
        <span className="ml-2 font-bold">Documentation</span>
      </div>

      {/* Left Sidebar - FIXED */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r bg-background transition-transform lg:translate-x-0",
          !isMobileNavOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link to="/" className="flex items-center gap-2">
            <CodeScapeLogo size={28} />
            <span className="font-semibold">CodeScapes</span>
            <Badge
              variant="secondary"
              className="border-primary/20 bg-primary/10 text-xs text-primary"
            >
              Docs
            </Badge>
          </Link>
        </div>
        <div className="flex h-[calc(100vh-3.5rem)] flex-col">
          <ScrollArea className="flex-1 py-6 pl-4 pr-6">
            <div className="flex flex-col gap-2">
              {tree.map((node) => (
                <DocsSidebarItem key={node.id} item={node} activeSlug={currentSlug} />
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <ModeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content - SCROLLABLE, CENTERED */}
      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
