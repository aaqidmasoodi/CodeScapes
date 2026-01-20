import { Outlet } from "react-router-dom"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"

export function MainLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Sheet>
        {/* Unified Header */}
        <Header
          showFullLogo
          className="border-b"
          startContent={
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          }
        />

        <SheetContent side="left" className="w-64 p-0">
          <Sidebar isMobile={true} className="w-full border-none bg-transparent" />
        </SheetContent>

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar (Hidden on Mobile) */}
          <div className="relative hidden md:block">
            <div className="h-full w-12" /> {/* Spacer */}
            <div className="absolute inset-y-0 left-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Sidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <main className="relative z-0 flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
