import { SHORTCUTS, getShortcutLabel, isMac } from "@/config/shortcuts"
import { Monitor, Keyboard, Laptop, Code2, FolderCog, RotateCcw } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { EditorSettings } from "@/hooks/useEditorSettings"
import type { Scape } from "@/lib/db"
import { useState } from "react"

interface SettingsPaneProps {
  editorSettings: EditorSettings
  onEditorSettingChange: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void
  onResetEditorSettings: () => void
  scape?: Scape
  onScapeUpdate?: (updates: Partial<Scape>) => Promise<void>
  isCloud?: boolean
}

export function SettingsPane({
  editorSettings,
  onEditorSettingChange,
  onResetEditorSettings,
  scape,
  onScapeUpdate,
  isCloud = false,
}: SettingsPaneProps) {
  // Project settings local state
  const [projectName, setProjectName] = useState(scape?.name || "")
  const [projectDescription, setProjectDescription] = useState(scape?.description || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProject = async () => {
    if (!onScapeUpdate) return
    setIsSaving(true)
    try {
      await onScapeUpdate({
        name: projectName,
        description: projectDescription,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const hasProjectChanges =
    projectName !== scape?.name || projectDescription !== (scape?.description || "")

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h2 className="text-xl font-semibold tracking-tight">Scape Settings</h2>
        <p className="text-sm text-muted-foreground">
          Customize your editor, project, and view shortcuts.
        </p>
      </div>

      {/* Tabs Container */}
      <Tabs defaultValue="editor" className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tab List */}
        <TabsList className="h-auto w-44 flex-col items-stretch justify-start gap-1 rounded-none border-r bg-muted/30 p-3">
          <TabsTrigger
            value="editor"
            className="justify-start gap-2 px-3 py-2.5 text-left data-[state=active]:bg-background"
          >
            <Code2 className="h-4 w-4" />
            <span>Editor</span>
          </TabsTrigger>
          <TabsTrigger
            value="project"
            className="justify-start gap-2 px-3 py-2.5 text-left data-[state=active]:bg-background"
          >
            <FolderCog className="h-4 w-4" />
            <span>Project</span>
          </TabsTrigger>
          <TabsTrigger
            value="shortcuts"
            className="justify-start gap-2 px-3 py-2.5 text-left data-[state=active]:bg-background"
          >
            <Keyboard className="h-4 w-4" />
            <span>Shortcuts</span>
          </TabsTrigger>
          <TabsTrigger
            value="environment"
            className="justify-start gap-2 px-3 py-2.5 text-left data-[state=active]:bg-background"
          >
            <Monitor className="h-4 w-4" />
            <span>Environment</span>
          </TabsTrigger>
        </TabsList>

        {/* Right Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Editor Tab */}
          <TabsContent value="editor" className="m-0 h-full overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h3 className="mb-1 text-sm font-medium">Editor Preferences</h3>
                <p className="text-xs text-muted-foreground">
                  Customize how code appears in the editor.
                </p>
              </div>

              <Separator />

              {/* Font Size */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="fontSize" className="text-sm font-medium">
                    Font Size
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Adjust the editor font size (12-24px)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      onEditorSettingChange("fontSize", Math.max(12, editorSettings.fontSize - 1))
                    }
                    disabled={editorSettings.fontSize <= 12}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {editorSettings.fontSize}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      onEditorSettingChange("fontSize", Math.min(24, editorSettings.fontSize + 1))
                    }
                    disabled={editorSettings.fontSize >= 24}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Word Wrap */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="wordWrap" className="text-sm font-medium">
                    Word Wrap
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Wrap long lines to fit the editor width
                  </p>
                </div>
                <Select
                  value={editorSettings.wordWrap}
                  onValueChange={(value) =>
                    onEditorSettingChange("wordWrap", value as EditorSettings["wordWrap"])
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on">On</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="wordWrapColumn">Column</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Minimap */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="minimap" className="text-sm font-medium">
                    Minimap
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show a miniature overview of your code
                  </p>
                </div>
                <Switch
                  id="minimap"
                  checked={editorSettings.minimap}
                  onCheckedChange={(checked) => onEditorSettingChange("minimap", checked)}
                />
              </div>

              {/* Line Numbers */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lineNumbers" className="text-sm font-medium">
                    Line Numbers
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display line numbers in the gutter
                  </p>
                </div>
                <Select
                  value={editorSettings.lineNumbers}
                  onValueChange={(value) =>
                    onEditorSettingChange("lineNumbers", value as EditorSettings["lineNumbers"])
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on">On</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="relative">Relative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Reset Button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResetEditorSettings}
                  className="gap-2"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Project Tab */}
          <TabsContent value="project" className="m-0 h-full overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h3 className="mb-1 text-sm font-medium">Project Settings</h3>
                <p className="text-xs text-muted-foreground">
                  Update your project name and description.
                </p>
              </div>

              <Separator />

              {scape ? (
                <>
                  {/* Project Name */}
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="My Awesome Project"
                      maxLength={100}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="projectDescription">Description</Label>
                    <textarea
                      id="projectDescription"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="A brief description of your project..."
                      maxLength={500}
                      rows={4}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {projectDescription.length}/500 characters
                    </p>
                  </div>

                  <Separator />

                  {/* Save Button */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {isCloud ? "Saved to cloud" : "Saved locally"}
                    </p>
                    <Button onClick={handleSaveProject} disabled={!hasProjectChanges || isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FolderCog className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No project loaded.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Shortcuts Tab */}
          <TabsContent value="shortcuts" className="m-0 h-full overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h3 className="mb-1 text-sm font-medium">Keyboard Shortcuts</h3>
                <p className="text-xs text-muted-foreground">
                  Quick reference for available shortcuts.
                </p>
              </div>

              <div className="rounded-lg border bg-card">
                <div className="grid grid-cols-2 border-b bg-muted/40 p-3 text-sm font-medium">
                  <div>Action</div>
                  <div className="text-right">Keybinding</div>
                </div>
                <div className="divide-y">
                  {SHORTCUTS.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="grid grid-cols-2 items-center p-3 text-sm transition-colors hover:bg-muted/20"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{shortcut.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {shortcut.description}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <kbd className="inline-flex h-6 min-w-[20px] items-center justify-center rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
                          {getShortcutLabel(shortcut)}
                        </kbd>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Environment Tab */}
          <TabsContent value="environment" className="m-0 h-full overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h3 className="mb-1 text-sm font-medium">Environment Information</h3>
                <p className="text-xs text-muted-foreground">
                  Details about your coding environment.
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                {/* Platform */}
                <div className="rounded-md border p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Laptop className="h-4 w-4" />
                    <span>Platform</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isMac ? "macOS" : "Windows / Linux"}
                  </p>
                </div>

                {/* Engine */}
                <div className="rounded-md border p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Code2 className="h-4 w-4" />
                    <span>Editor Engine</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Monaco Editor</p>
                </div>

                {/* Environment Type */}
                {scape && (
                  <div className="rounded-md border p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Monitor className="h-4 w-4" />
                      <span>Project Type</span>
                    </div>
                    <p className="text-sm capitalize text-muted-foreground">{scape.environment}</p>
                  </div>
                )}

                {/* Source */}
                {scape && (
                  <div className="rounded-md border p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <FolderCog className="h-4 w-4" />
                      <span>Storage</span>
                    </div>
                    <p className="text-sm capitalize text-muted-foreground">
                      {scape.source === "cloud" ? "Cloud Synced" : "Local Only"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
