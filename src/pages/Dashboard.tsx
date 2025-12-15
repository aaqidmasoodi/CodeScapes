import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLiveQuery } from "dexie-react-hooks"
import {
  Search,
  Globe,
  BookOpen,
  Clock,
  Trash2,
  MoreVertical,
  Layout,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { db, deleteScape, type Scape } from "@/lib/db"

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")

  // Delete Modal State
  const [scapeToDelete, setScapeToDelete] = useState<Scape | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  // Real data from Dexie
  const myScapes = useLiveQuery(() => db.scapes.orderBy("createdAt").reverse().toArray())

  const filteredScapes = myScapes?.filter((scape) =>
    scape.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteClick = (e: React.MouseEvent, scape: Scape) => {
    e.stopPropagation()
    setScapeToDelete(scape)
    setDeleteConfirmation("")
  }

  const confirmDelete = async () => {
    if (!scapeToDelete) return

    await deleteScape(scapeToDelete.id!)
    setScapeToDelete(null)
    setDeleteConfirmation("")
  }

  const isDeleteValid = scapeToDelete && deleteConfirmation === `delete ${scapeToDelete.name}`

  const renderContent = () => {
    if (activeTab === "learn") {
      return (
        <div className="flex h-full flex-col items-center justify-center bg-muted/5 p-8 text-center">
          <BookOpen className="mb-4 h-16 w-16 text-muted-foreground/20" />
          <h2 className="text-2xl font-bold">Learning Center</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Tutorials, documentation, and guides to help you master CodeScape are coming soon.
          </p>
        </div>
      )
    }

    if (activeTab === "community") {
      return (
        <div className="flex h-full flex-col items-center justify-center bg-muted/5 p-8 text-center">
          <Globe className="mb-4 h-16 w-16 text-muted-foreground/20" />
          <h2 className="text-2xl font-bold">Community Hub</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Explore and fork scapes created by other developers in the CodeScape Cloud.
          </p>
        </div>
      )
    }

    // Default: My Scapes (Dashboard)
    return (
      <div className="flex h-full flex-col bg-background">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background/95 px-6 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Scapes</h1>
            <p className="text-sm text-muted-foreground">Manage your local projects</p>
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
        <div className="flex-1 overflow-auto p-6">
          {!filteredScapes || filteredScapes.length === 0 ? (
            <div className="mx-auto flex h-[60vh] max-w-2xl flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/5 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Layout className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No scapes found</h3>
              <p className="mx-auto mb-6 mt-1 max-w-xs text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query."
                  : "create your first project to get started."}
              </p>
              {!searchQuery && <CreateScapeDialog />}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredScapes.map((scape) => (
                <Card
                  key={scape.id}
                  className="group relative flex cursor-pointer flex-col overflow-hidden border-muted transition-all hover:border-primary/50 hover:shadow-lg"
                  onClick={() => navigate(`/scape/${scape.id}`)}
                >
                  {/* Decorative Banner or Thumbnail */}
                  <div className="h-36 w-full overflow-hidden border-b bg-muted/20">
                    {scape.thumbnail ? (
                      <img
                        src={scape.thumbnail}
                        alt="Scape Preview"
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50 transition-colors group-hover:from-primary/5 group-hover:to-blue-500/5" />
                    )}
                  </div>

                  <CardHeader className="px-4 pb-2 pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="line-clamp-1 text-lg leading-tight transition-colors group-hover:text-primary">
                          {scape.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-xs">
                          <span
                            className={scape.source === "cloud" ? "font-medium text-blue-500" : ""}
                          >
                            {scape.source === "cloud" ? "Cloud Scape" : "Local File"}
                          </span>
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
                        {scape.template}
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(scape.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="h-full flex-1 overflow-hidden">{renderContent()}</main>
      </div>
    </div>
  )
}
