import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, Users, Star, Check, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export function AdminOverview() {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    docsCount: 0,
    usersCount: 0,
  })
  const [featuredScapeId, setFeaturedScapeId] = useState("")
  const [newFeaturedId, setNewFeaturedId] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchData() {
      // Fetch stats
      const { count: docs } = await supabase
        .from("docs_nodes")
        .select("*", { count: "exact", head: true })
      setStats({ docsCount: docs || 0, usersCount: 0 })

      // Fetch featured scape setting
      const { data: setting } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "featured_scape_id")
        .single()

      if (setting?.value) {
        const id = typeof setting.value === "string" ? setting.value : JSON.stringify(setting.value)
        setFeaturedScapeId(id.replace(/"/g, ""))
        setNewFeaturedId(id.replace(/"/g, ""))
      }
    }
    fetchData()
  }, [])

  const handleSaveFeatured = async () => {
    if (!newFeaturedId.trim()) return

    setSaving(true)
    const { error } = await supabase.from("site_settings").upsert({
      key: "featured_scape_id",
      value: JSON.stringify(newFeaturedId.trim()),
      updated_at: new Date().toISOString(),
    })

    setSaving(false)

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } else {
      setFeaturedScapeId(newFeaturedId.trim())
      toast({ title: "Saved!", description: "Featured scape updated." })
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Admin Overview</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Docs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.docsCount}</div>
            <p className="text-xs text-muted-foreground">Pages and Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Managed via Supabase Auth</p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Scape Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Scape (Landing Page)
          </CardTitle>
          <CardDescription>
            Choose which scape to display in the hero section of the landing page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Scape ID (UUID)"
              value={newFeaturedId}
              onChange={(e) => setNewFeaturedId(e.target.value)}
              className="font-mono text-sm"
            />
            <Button
              onClick={handleSaveFeatured}
              disabled={saving || newFeaturedId === featuredScapeId}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
          {featuredScapeId && (
            <p className="mt-2 text-xs text-muted-foreground">
              Current: <code className="rounded bg-muted px-1">{featuredScapeId}</code>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Button asChild size="lg" className="h-24 text-lg" variant="outline">
              <Link to="/admin/docs">
                <FileText className="mr-2 h-6 w-6" />
                Manage Documentation
              </Link>
            </Button>
            <Button asChild size="lg" className="h-24 text-lg" variant="outline" disabled>
              <Link to="/admin/users">
                <Users className="mr-2 h-6 w-6" />
                Manage Users (Soon)
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
