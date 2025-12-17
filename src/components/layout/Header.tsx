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
          <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-xl font-bold text-transparent">
            CodeScapes
          </span>
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
  const { user, signIn, signOut, loading } = useAuth()
  if (loading) return null

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={signIn}>
        Sign In
      </Button>
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
