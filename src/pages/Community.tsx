import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, Heart, GitFork, User, Code2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

import { CloudRepository } from "@/lib/repositories/CloudRepository"
import { type Scape } from "@/lib/db"

const repo = new CloudRepository()

export default function CommunityPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [scapes, setScapes] = useState<Scape[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "web" | "python" | "flow">("all")

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await repo.getPublicScapes(filter === "all" ? undefined : filter)
        setScapes(data)
      } catch (e) {
        console.error("Failed to load community scapes", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filter])

  const filteredScapes = scapes.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getIcon = (env: string) => {
    switch (env) {
      case "python-script":
        return <Code2 className="h-4 w-4 text-yellow-500" />
      case "html-css-js":
        return <div className="h-4 w-4 rounded-full bg-blue-500" />
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-500" />
    }
  }

  const getEnvLabel = (env: string) => {
    switch (env) {
      case "python-script":
        return "Python"
      case "html-css-js":
        return "Web"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Sheet>
        {/* 1. Full Width Top Header */}
        <div className="z-50 w-full border-b bg-background">
          <Header
            showFullLogo={true}
            startContent={
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            }
            actions={null}
          />
        </div>

        {/* Mobile Sidebar Content */}
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar
            activeTab="community"
            isMobile={true}
            className="w-full border-none bg-transparent"
          />
        </SheetContent>

        <div className="relative flex flex-1 overflow-hidden">
          {/* 2. Absolute Sidebar (Hidden on Mobile) */}
          <div className="group absolute left-0 top-0 z-40 hidden h-full md:block">
            <Sidebar
              activeTab="community"
              className="h-full border-r bg-background/95 shadow-sm backdrop-blur"
            />
          </div>

          {/* 3. Main Content (Offsets for collapsed sidebar on Desktop ONLY) */}
          <main className="flex-1 overflow-auto bg-background p-6 md:ml-16">
            {/* Toolbar / Filters */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">Community</h1>
                  <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px]">
                    Beta
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Discover projects from the community
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search Bar */}
                <div className="relative w-full min-w-[200px] max-w-sm sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search community..."
                    className="h-9 pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  {["all", "web", "python"].map((f) => (
                    <Button
                      key={f}
                      variant={filter === f ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setFilter(f as "all" | "web" | "python" | "flow")}
                      className="capitalize"
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <Skeleton key={i} className="h-52 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredScapes.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
                <Search className="mb-4 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">No scapes found</h3>
                <p className="text-muted-foreground">Try creating one or adjust your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredScapes.map((scape) => (
                  <Card
                    key={scape.id}
                    className="group cursor-pointer overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg"
                    onClick={() =>
                      navigate(`/community/scape/${scape.id}`, {
                        state: { from: location.pathname },
                      })
                    }
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted">
                      {scape.thumbnail ? (
                        <img
                          src={scape.thumbnail}
                          alt={scape.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-secondary/20">
                          {getIcon(scape.environment)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/10" />
                    </div>

                    <CardHeader className="p-3 pb-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-1 text-sm font-medium leading-none">
                          {scape.name}
                        </CardTitle>
                        <Badge variant="outline" className="h-5 px-1 text-[10px]">
                          {getEnvLabel(scape.environment)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {scape.description || "No description provided."}
                      </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t p-3 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {scape.author?.avatar ? (
                          <img
                            src={scape.author.avatar}
                            alt="Author"
                            className="h-3.5 w-3.5 rounded-full"
                          />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        <span className="truncate">{scape.author?.name || "Unknown"}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{scape.stats?.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="h-3 w-3" />
                          <span>{scape.stats?.forks || 0}</span>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </Sheet>
    </div>
  )
}
