import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function AdminOverview() {
  const [stats, setStats] = useState({
    docsCount: 0,
    usersCount: 0, // Mock for now if profiles policy blocks count
  })

  useEffect(() => {
    // Quick fetch for stats
    async function fetchStats() {
      const { count: docs } = await supabase
        .from("docs_nodes")
        .select("*", { count: "exact", head: true })
      // const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      setStats({ docsCount: docs || 0, usersCount: 0 })
    }
    fetchStats()
  }, [])

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
