import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLiveQuery } from "dexie-react-hooks"
import { Search, Globe, BookOpen, Clock, Code2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateScapeDialog } from "@/components/dashboard/CreateScapeDialog"
import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"
import { db } from "@/lib/db"

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("dashboard")

  // Real data from Dexie
  const myScapes = useLiveQuery(() => db.scapes.orderBy('createdAt').reverse().toArray())

  const renderContent = () => {
    if (activeTab === 'learn') {
      return (
        <div className="flex-1 overflow-auto bg-muted/10 p-8">
          <div className="mx-auto max-w-5xl text-center py-20">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-bold">Learning Center</h2>
            <p className="text-muted-foreground mt-2">Tutorials and documentation coming soon.</p>
          </div>
        </div>
      )
    }

    if (activeTab === 'community') {
      return (
        <div className="flex-1 overflow-auto bg-muted/10 p-8">
          <div className="mx-auto max-w-5xl text-center py-20">
            <Globe className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-bold">Community Hub</h2>
            <p className="text-muted-foreground mt-2">Explore scapes created by other developers.</p>
          </div>
        </div>
      )
    }

    // Default: My Scapes (Dashboard)
    return (
      <div className="flex-1 overflow-auto bg-muted/10 p-8">
        <div className="mx-auto max-w-5xl space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Scapes</h1>
              <p className="text-muted-foreground">Manage your projects and discover new scapes.</p>
            </div>
            <CreateScapeDialog />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search scapes..." className="pl-9 w-full md:w-[300px]" />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="my-scapes" className="space-y-6">
            <TabsList>
              <TabsTrigger value="my-scapes">All Scapes</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="my-scapes" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {!myScapes || myScapes.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    <Code2 className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-4">You haven't created any scapes yet.</p>
                    <div className="mt-2">
                      <CreateScapeDialog />
                    </div>
                  </div>
                ) : (
                  myScapes.map(scape => (
                    <Card
                      key={scape.id}
                      className="group flex flex-col cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                      onClick={() => navigate(`/scape/${scape.id}`)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{scape.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3" />
                          Updated {scape.updatedAt.toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 pb-2">
                        <div className="flex gap-2">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary uppercase">
                            {scape.type}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground group-hover:text-primary">
                          Open Editor →
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 opacity-20" />
                <p className="mt-4">Use the "New Scape" button to access templates.</p>
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  )
}
