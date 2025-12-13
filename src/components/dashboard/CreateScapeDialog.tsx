import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Layout, Box, Paintbrush, Code2, Laptop, Cloud, Lock } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import { TEMPLATES, type TemplateType, type TemplateFile } from "@/lib/templates"
import { cn } from "@/lib/utils"
// import { useAuthStore } from "@/store/useAuthStore" // Temporarily disabled for clean build or use if needed

export function CreateScapeDialog() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("blank")
  const [source, setSource] = useState<"local" | "cloud">("local")
  const [loading, setLoading] = useState(false)

  // Auth placeholder (can integrate store later for real checks)
  const isAuthenticated = false // Mock

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      // 1. Create Scape
      const scapeId = await db.scapes.add({
        name: name.trim(),
        type: selectedTemplate,
        source: source, // 'local' or 'cloud'
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // 2. Create Files from Template
      const template = TEMPLATES[selectedTemplate]
      await db.files.bulkAdd(
        template.files.map((file: TemplateFile) => ({
          scapeId: scapeId as number,
          name: file.name,
          content: file.content,
          language: file.language,
        }))
      )

      // 3. Navigate
      setOpen(false)
      navigate("/scape/" + scapeId)

      // Reset form
      setName("")
      setSelectedTemplate("blank")
      setSource("local")
    } catch (error) {
      console.error("Failed to create scape:", error)
      alert("Failed to create scape. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const TemplateIcon = ({ type }: { type: TemplateType }) => {
    switch (type) {
      case "blank":
        return <Layout className="h-6 w-6" />
      case "three":
        return <Box className="h-6 w-6" />
      case "p5":
        return <Paintbrush className="h-6 w-6" />
      case "html":
        return <Code2 className="h-6 w-6" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Scape
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Scape</DialogTitle>
            <DialogDescription>
              Choose a template and location for your new project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Scape Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Project"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Location Selector */}
            <div className="grid gap-2">
              <Label>storage Location</Label>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={cn(
                    "cursor-pointer p-3 transition-all hover:border-primary",
                    source === "local"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setSource("local")}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-background p-2 shadow-sm">
                      <Laptop className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold">Local Device</div>
                      <div className="text-[10px] text-muted-foreground">Saved to browser</div>
                    </div>
                  </div>
                </Card>

                <Card
                  className={cn(
                    "relative cursor-pointer p-3 transition-all",
                    source === "cloud"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-primary/50",
                    !isAuthenticated && "opacity-70"
                  )}
                  onClick={() => {
                    if (isAuthenticated) setSource("cloud")
                    else alert("Please login to create cloud scapes (Coming Soon)")
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-background p-2 shadow-sm">
                      <Cloud className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold">CodeScape Cloud</div>
                      <div className="text-[10px] text-muted-foreground">Sync across devices</div>
                    </div>
                  </div>
                  {!isAuthenticated && (
                    <div className="absolute right-2 top-2">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </Card>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Template</Label>
              <div className="grid grid-cols-2 gap-4">
                {(Object.keys(TEMPLATES) as TemplateType[]).map((type) => (
                  <Card
                    key={type}
                    className={cn(
                      "cursor-pointer p-4 transition-all hover:border-primary",
                      selectedTemplate === type
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedTemplate(type)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-md bg-background p-2 shadow-sm">
                        <TemplateIcon type={type} />
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold">{TEMPLATES[type].name}</div>
                        <div className="text-xs text-muted-foreground">
                          {TEMPLATES[type].description}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Scape"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
