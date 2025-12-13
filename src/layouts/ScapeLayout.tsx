import { Header } from "@/components/layout/Header"


interface ScapeLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  headerActions?: React.ReactNode
  headerTitle?: React.ReactNode
}

export function ScapeLayout({ children, sidebar, headerActions, headerTitle }: ScapeLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Header actions={headerActions} customTitle={headerTitle} />
      <div className="flex flex-1 overflow-hidden">
        {sidebar}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
