import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab?: string
  showMobileHeader?: boolean
}

export function DashboardLayout({ children, activeTab = "community" }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Sheet>
        <Header
          showFullLogo
          startContent={
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          }
        />
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar
            activeTab={activeTab}
            isMobile={true}
            className="w-full border-none bg-transparent"
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <div className="relative hidden md:block">
          <div className="h-full w-16" /> {/* Spacer */}
          <div className="absolute inset-y-0 left-0 z-50">
            <Sidebar activeTab={activeTab} />
          </div>
        </div>

        {/* Main Content */}
        <main className="relative z-0 h-full flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
