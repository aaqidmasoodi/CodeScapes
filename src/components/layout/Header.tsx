import { ModeToggle } from "@/components/mode-toggle"

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
            CodeScape
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <ModeToggle />
        {endActions}
      </div>
    </header>
  )
}
