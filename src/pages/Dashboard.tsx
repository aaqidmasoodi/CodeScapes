import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLiveQuery } from "dexie-react-hooks"
import { Search, Globe, BookOpen, Clock, Trash2, MoreVertical, Layout } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateScapeDialog } from "@/components/dashboard/CreateScapeDialog"
import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"
import { db, deleteScape } from "@/lib/db"

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")

  // Real data from Dexie
  const myScapes = useLiveQuery(() => db.scapes.orderBy('createdAt').reverse().toArray())

  const filteredScapes = myScapes?.filter(scape =>
    scape.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation() // Prevent card click
    if (confirm("Are you sure you want to delete this scape? This action cannot be undone.")) {
      await deleteScape(id)
    }
  }

  const renderContent = () => {
    if (activeTab === 'learn') {
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-muted/5">
          <BookOpen className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h2 className="text-2xl font-bold">Learning Center</h2>
          <p className="text-muted-foreground mt-2 max-w-md">Tutorials, documentation, and guides to help you master CodeScape are coming soon.</p>
        </div>
      )
    }

    if (activeTab === 'community') {
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-muted/5">
          <Globe className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h2 className="text-2xl font-bold">Community Hub</h2>
          <p className="text-muted-foreground mt-2 max-w-md">Explore and fork scapes created by other developers in the CodeScape Cloud.</p>
        </div>
      )
    }

    // Default: My Scapes (Dashboard)
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Toolbar */}
        <div className="border-b px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Scapes</h1>
            <p className="text-sm text-muted-foreground">Manage your local projects</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 bg-muted/50"
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
            <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed rounded-xl mx-auto max-w-2xl bg-muted/5">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Layout className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No scapes found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-xs mx-auto">
                {searchQuery ? "Try adjusting your search query." : "create your first project to get started."}
              </p>
              {!searchQuery && <CreateScapeDialog />}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredScapes.map(scape => (
                <Card
                  key={scape.id}
                  className="group relative flex flex-col cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg overflow-hidden border-muted"
                  onClick={() => navigate(`/scape/${scape.id}`)}
                >
                  {/* Decorative Banner */}
                  <div className="h-24 bg-gradient-to-br from-muted to-muted/50 group-hover:from-primary/5 group-hover:to-blue-500/5 transition-colors absolute w-full top-0 left-0" />

                  <CardHeader className="relative pt-6 pb-2 px-5 mt-10">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                          {scape.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-xs">
                          <span className={scape.source === 'cloud' ? 'text-blue-500 font-medium' : ''}>
                            {scape.source === 'cloud' ? 'Cloud Scape' : 'Local File'}
                          </span>
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => handleDelete(e, scape.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pb-4 px-5 relative">
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-gray-500/10">
                        {scape.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-auto">
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
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-hidden h-full">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

