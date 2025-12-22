import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Search,
  Clock,
  Trash2,
  MoreVertical,
  Layout,
  AlertTriangle,
  Menu,
  Database,
  Cloud,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateScapeDialog } from "@/components/dashboard/CreateScapeDialog"
import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"
import { type Scape } from "@/lib/db"
import { useScapes } from "@/hooks/useScapes"

import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/useAuth"

export default function Dashboard() {
  const navigate = useNavigate()
  // URL-based State
  const { tab } = useParams<{ tab: string }>()
  const activeTab = tab || "scapes"

  const [searchQuery, setSearchQuery] = useState("")

  // Delete Modal State
  const [scapeToDelete, setScapeToDelete] = useState<Scape | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  // Real data from Hooks
  const { scapes: myScapes, loading, deleteScape } = useScapes()
  const { user } = useAuth()

  const activeTabValidated = ["local", "cloud"].includes(activeTab) ? activeTab : "local"

  // Redirect if trying to access cloud without auth
  if (activeTabValidated === "cloud" && !user) {
    navigate("/dashboard/local", { replace: true })
    return null
  }

  const filteredScapes = myScapes?.filter((scape) => {
    // 1. Filter by Tab (Source)
    if (activeTabValidated === "local" && scape.source !== "local") return false
    if (activeTabValidated === "cloud" && scape.source !== "cloud") return false

    // 2. Filter by Search
    const matchesSearch = scape.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    return true
  })

  const handleDeleteClick = (e: React.MouseEvent, scape: Scape) => {
    e.stopPropagation()
    setScapeToDelete(scape)
    setDeleteConfirmation("")
  }

  const confirmDelete = async () => {
    if (!scapeToDelete) return

    await deleteScape(scapeToDelete)
    setScapeToDelete(null)
    setDeleteConfirmation("")
  }

  const isDeleteValid = scapeToDelete && deleteConfirmation === `delete ${scapeToDelete.name}`

  const renderContent = () => {
    // Default: My Scapes (Dashboard) - Unified View
    return (
      <div className="flex h-full flex-col bg-background">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background/95 px-6 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {activeTabValidated === "cloud" ? "Cloud Scapes" : "Local Scapes"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTabValidated === "cloud"
                ? "Manage your synced projects"
                : "Manage your local projects"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="bg-muted/50 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <CreateScapeDialog />
          </div>
        </div>

        {/* content */}
        <div className="flex-1 overflow-auto p-6 [scrollbar-gutter:stable]">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-36 w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !filteredScapes || filteredScapes.length === 0 ? (
            <div className="mx-auto flex h-[60vh] max-w-2xl flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/5 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Layout className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No scapes found</h3>
              <p className="mx-auto mb-6 mt-1 max-w-xs text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query."
                  : "Create your first project to get started."}
              </p>
              {!searchQuery && <CreateScapeDialog />}
            </div>
          ) : (
            <div className="columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5">
              {filteredScapes.map((scape) => {
                // Determine Environment Label
                const envLabel =
                  {
                    web: "Web",
                    python: "Python",
                    flowscape: "FlowScape",
                    node: "Node",
                  }[scape.environment] || scape.environment

                const hasThumbnail = scape.thumbnail && scape.thumbnail.length > 100

                // Normalize thumbnail - ensure it has data: prefix
                const thumbnailSrc = hasThumbnail
                  ? scape.thumbnail?.startsWith("data:")
                    ? scape.thumbnail
                    : `data:image/jpeg;base64,${scape.thumbnail}`
                  : null

                return (
                  <Card
                    key={scape.id}
                    className="group relative mb-4 flex cursor-pointer break-inside-avoid flex-col overflow-hidden border-muted transition-all hover:border-primary/50 hover:shadow-lg"
                    onClick={() => navigate(`/scape/${scape.id}`)}
                  >
                    {/* Thumbnail (only if valid) */}
                    {thumbnailSrc && (
                      <div className="max-h-48 w-full overflow-hidden border-b bg-muted/20">
                        <img
                          src={thumbnailSrc}
                          alt="Scape Preview"
                          className="h-full w-full transform-gpu object-cover object-center transition-transform duration-300 will-change-transform group-hover:scale-[1.02]"
                        />
                      </div>
                    )}

                    <CardHeader className="px-4 pb-2 pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="line-clamp-1 text-lg leading-tight transition-colors group-hover:text-primary">
                            {scape.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            {scape.source === "cloud" ? (
                              <span title="Cloud Scape">
                                <Cloud className="h-4 w-4 text-blue-500" />
                              </span>
                            ) : (
                              <span title="Local File">
                                <Database className="h-4 w-4 text-muted-foreground" />
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="-mr-2 h-8 w-8 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => handleDeleteClick(e, scape)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="relative flex-1 px-5 pb-4">
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-gray-500/10">
                          {envLabel}
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(scape.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!scapeToDelete} onOpenChange={(open) => !open && setScapeToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Delete Scape
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the project{" "}
                <span className="font-semibold text-foreground">{scapeToDelete?.name}</span> and all
                of its files.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="mb-2 block text-sm text-muted-foreground">
                Type{" "}
                <span className="font-mono font-bold text-foreground">
                  delete {scapeToDelete?.name}
                </span>{" "}
                to confirm:
              </label>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={`delete ${scapeToDelete?.name}`}
                className="font-mono"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setScapeToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={!isDeleteValid}>
                Delete Scape
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Header showFullLogo />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar (Hidden on Mobile) */}
        {/* Desktop Sidebar (Spacer + Overlay) */}
        <div className="relative hidden md:block">
          <div className="h-full w-16" /> {/* Spacer */}
          <div className="absolute inset-y-0 left-0 z-50">
            {/* Sidebar Active Tab from URL */}
            <Sidebar activeTab={activeTab} />
          </div>
        </div>

        {/* Mobile Sidebar (Sheet) */}
        <div className="sticky top-0 z-20 flex w-full items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar
                activeTab={activeTab}
                isMobile={true}
                className="w-full border-none bg-transparent"
              />
            </SheetContent>
          </Sheet>
          <span className="font-semibold">Dashboard</span>
        </div>

        <main className="relative z-0 h-full flex-1 overflow-hidden">{renderContent()}</main>
      </div>
    </div>
  )
}
