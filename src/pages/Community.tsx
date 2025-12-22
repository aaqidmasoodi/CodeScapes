import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Heart, GitFork, User, Code2 } from "lucide-react"

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

    const filteredScapes = scapes.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            {/* 1. Full Width Top Header */}
            <div className="z-50 border-b bg-background w-full">
                <Header
                    showFullLogo={true}
                    actions={
                        <div className="flex w-full min-w-[300px] items-center gap-2">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search community..."
                                    className="pl-8 h-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    }
                />
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* 2. Absolute Sidebar (Overlays content) */}
                <div className="absolute left-0 top-0 z-40 h-full group">
                    <Sidebar activeTab="community" className="h-full border-r bg-background/95 backdrop-blur shadow-sm" />
                </div>

                {/* 3. Main Content (Offsets for collapsed sidebar) */}
                <main className="flex-1 overflow-auto bg-background p-6 ml-16">
                    {/* Toolbar / Filters */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Explore Scapes</h1>
                            <p className="text-sm text-muted-foreground">Discover projects from the community</p>
                        </div>

                        <div className="flex items-center gap-2">
                            {["all", "web", "python"].map((f) => (
                                <Button
                                    key={f}
                                    variant={filter === f ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => setFilter(f as any)}
                                    className="capitalize"
                                >
                                    {f}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Skeleton key={i} className="h-64 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : filteredScapes.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center border-2 border-dashed rounded-lg">
                            <Search className="h-10 w-10 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No scapes found</h3>
                            <p className="text-muted-foreground">Try creating one or adjust your filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredScapes.map((scape) => (
                                <Card
                                    key={scape.id}
                                    className="group cursor-pointer overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg"
                                    onClick={() => navigate(`/community/scape/${scape.id}`)}
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

                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="line-clamp-1 text-base">{scape.name}</CardTitle>
                                            <Badge variant="outline" className="text-xs">
                                                {getEnvLabel(scape.environment)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                            {scape.description || "No description provided."}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="flex items-center justify-between border-t p-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            {scape.author?.avatar ? (
                                                <img src={scape.author.avatar} alt="Author" className="h-4 w-4 rounded-full" />
                                            ) : (
                                                <User className="h-3 w-3" />
                                            )}
                                            <span>{scape.author?.name || "Unknown"}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
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
        </div>
    )
}
