import { Link, useLocation } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthDialog } from "@/components/auth/AuthDialog"
import { CodeScapeLogo, CodeScapeFullLogo } from "@/components/brand/Logo"
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown"

interface HeaderProps {
  actions?: React.ReactNode
  customTitle?: React.ReactNode
  centerContent?: React.ReactNode
  endActions?: React.ReactNode
  showFullLogo?: boolean
  startContent?: React.ReactNode
  isFixed?: boolean
}

export function Header({
  actions,
  customTitle,
  centerContent,
  endActions,
  showFullLogo = false,
  startContent,
  isFixed = false,
}: HeaderProps) {
  const baseClasses = "flex h-12 shrink-0 items-center justify-between px-4"
  const fixedClasses = isFixed
    ? "fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md"
    : "relative border-b bg-background"

  return (
    <header className={`${baseClasses} ${fixedClasses}`}>
      <div className="flex items-center gap-2">
        {startContent}
        {customTitle ? (
          customTitle
        ) : (
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            {showFullLogo ? (
              <CodeScapeFullLogo height={28} className="text-foreground" />
            ) : (
              <CodeScapeLogo size={32} />
            )}
          </Link>
        )}
      </div>

      {centerContent && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {centerContent}
        </div>
      )}

      <div className="flex items-center gap-2">
        {actions}
        <NotificationDropdown />
        <ModeToggle />
        <AuthButtons />
        {endActions}
      </div>
    </header>
  )
}

function AuthButtons() {
  const { user, signOut, loading } = useAuth()
  const location = useLocation()

  // Dashboard routes should redirect to full login page
  // Editor routes (and others) should use the modal to preserve state
  const isDashboard = location.pathname.startsWith("/dashboard") || location.pathname === "/"

  if (loading) return null

  if (!user) {
    if (isDashboard) {
      return (
        <Button variant="outline" size="sm" asChild>
          <Link to="/login">Sign In</Link>
        </Button>
      )
    }

    return (
      <AuthDialog>
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </AuthDialog>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata.avatar_url} alt={user.email} />
            <AvatarFallback>{user.email?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.user_metadata.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={`/u/${user.user_metadata.username || user.id}`}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-red-500">
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
