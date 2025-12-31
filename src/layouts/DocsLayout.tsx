import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"
import { DocsRepository } from "@/lib/repositories/DocsRepository"
import type { DocsTreeItem } from "@/types/docs"
import { Header } from "@/components/layout/Header"
import { CodeScapeFullLogo } from "@/components/brand/Logo"

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
  const location = useLocation()

  // Extract clean slug from path: /docs/foo -> foo
  const currentSlug = location.pathname.split("/").pop() || ""

  useEffect(() => {
    DocsRepository.getPublicTree().then(setTree)
  }, [])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Shared Header with Docs Badge - full width */}
      <Sheet>
        <Header
          customTitle={
            <Link to="/" className="flex items-center gap-1">
              <CodeScapeFullLogo height={28} className="text-foreground" />
              <Badge
                variant="secondary"
                className="border-primary/20 bg-primary/10 text-xs text-primary"
              >
                Docs
              </Badge>
            </Link>
          }
          startContent={
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          }
        />
        <SheetContent side="left" className="w-64 p-0">
          <ScrollArea className="h-full py-6 pl-4 pr-6">
            <div className="flex flex-col gap-2">
              {tree.map((node) => (
                <DocsSidebarItem key={node.id} item={node} activeSlug={currentSlug} />
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - hidden on mobile */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r lg:block">
          <div className="py-6 pl-4 pr-6">
            <div className="flex flex-col gap-2">
              {tree.map((node) => (
                <DocsSidebarItem key={node.id} item={node} activeSlug={currentSlug} />
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content - SCROLLABLE */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-6 pb-10 pt-10 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
