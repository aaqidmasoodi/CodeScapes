import { useEffect, useState } from "react"
import { Outlet, Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/Header"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { Badge } from "@/components/ui/badge"

export function AdminLayout() {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)
  const location = useLocation()

  // Determine active tab for sidebar highlighting
  const activeTab = location.pathname.includes("/admin/docs") ? "docs" : "dashboard"

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false)
        setChecking(false)
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

      if (error || !data || !data.is_admin) {
        setIsAdmin(false)
      } else {
        setIsAdmin(true)
      }
      setChecking(false)
    }

    if (!authLoading) {
      checkAdmin()
    }
  }, [user, authLoading])

  if (authLoading || checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Verifying Admin Privileges...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Sheet>
        <Header
          customTitle={
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">CodeScapes</span>
              <Badge
                variant="secondary"
                className="border-primary/20 bg-primary/10 text-xs text-primary"
              >
                Admin
              </Badge>
            </div>
          }
          startContent={
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          }
        />
        <SheetContent side="left" className="w-64 p-0">
          <AdminSidebar
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
            <AdminSidebar activeTab={activeTab} />
          </div>
        </div>

        {/* Main Content */}
        <main className="relative z-0 h-full flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
