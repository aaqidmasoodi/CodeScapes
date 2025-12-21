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
import { CodeScapeLogo } from "@/components/brand/Logo"

interface HeaderProps {
  actions?: React.ReactNode
  customTitle?: React.ReactNode
  endActions?: React.ReactNode
}

export function Header({ actions, customTitle, endActions }: HeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        {customTitle ? (
          customTitle
        ) : (
          <div className="flex items-center gap-2">
            <CodeScapeLogo size={32} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <ModeToggle />
        <AuthButtons />
        {endActions}
      </div>
    </header>
  )
}

function AuthButtons() {
  const { user, signOut, loading } = useAuth()
  if (loading) return null

  if (!user) {
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
        <DropdownMenuItem onClick={signOut} className="text-red-500">
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
