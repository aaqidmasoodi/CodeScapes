import { SHORTCUTS, getShortcutLabel, isMac } from "@/config/shortcuts"
import {
  Monitor,
  Keyboard,
  Laptop,
  Code2,
  FolderCog,
  RotateCcw,
  Zap,
  Sparkles,
  ArrowUpCircle,
} from "lucide-react"
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
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { ScapperIcon, ProBadge } from "@/components/brand/ScapperIcon"
import { getQuotaStatus, type QuotaStatus } from "@/lib/quotaClient"
import { UpgradeModal } from "@/components/billing/StripePaymentForm"
import { useAuth } from "@/hooks/useAuth"

// Same validation as CreateScapeDialog
const NAME_REGEX = /^[a-zA-Z0-9 ]+$/
const NAME_MAX_LENGTH = 25
const DESCRIPTION_MAX_LENGTH = 500

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
  const { user } = useAuth()

  // Project settings local state
  const [projectName, setProjectName] = useState(scape?.name || "")
  const [projectDescription, setProjectDescription] = useState(scape?.description || "")
  const [nameError, setNameError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Pro tab state
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  // Fetch quota status
  useEffect(() => {
    if (!user) return

    const fetchQuota = async () => {
      try {
        const status = await getQuotaStatus()
        setQuotaStatus(status)
      } catch (e) {
        console.error("Failed to fetch quota:", e)
      }
    }

    fetchQuota()
  }, [user])

  // Sync state when scape prop changes (e.g., dialog reopens or scape updates)
  useEffect(() => {
    setProjectName(scape?.name || "")
    setProjectDescription(scape?.description || "")
    setNameError("")
  }, [scape?.id, scape?.name, scape?.description])

  const validateName = (value: string) => {
    if (!value.trim()) {
      return "Project name is required"
    }
    if (!NAME_REGEX.test(value)) {
      return "Only letters, numbers, and spaces allowed"
    }
    if (value.length > NAME_MAX_LENGTH) {
      return `Name must be ${NAME_MAX_LENGTH} characters or less`
    }
    return ""
  }

  const handleNameChange = (value: string) => {
    setProjectName(value)
    setNameError(validateName(value))
  }

  const handleSaveProject = async () => {
    if (!onScapeUpdate) return

    const error = validateName(projectName)
    if (error) {
      setNameError(error)
      return
    }

    setIsSaving(true)
    try {
      await onScapeUpdate({
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
      })
      toast({
        title: "Project updated",
        description: "Your changes have been saved.",
      })
    } catch (e) {
      console.error("Failed to save project:", e)
      toast({
        title: "Failed to save",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const hasProjectChanges =
    projectName.trim() !== (scape?.name || "") ||
    projectDescription.trim() !== (scape?.description || "")

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

          {/* Pro Tab */}
          <div className="mt-auto pt-4">
            <TabsTrigger
              value="pro"
              className="w-full justify-start gap-2 px-3 py-2.5 text-left data-[state=active]:bg-background"
            >
              <ScapperIcon size={16} />
              <span>Scapper Pro</span>
              {quotaStatus?.tier === "pro" && <ProBadge className="ml-auto" />}
            </TabsTrigger>
          </div>
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
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="My Awesome Project"
                      maxLength={NAME_MAX_LENGTH}
                      className={
                        nameError ? "border-destructive focus-visible:ring-destructive" : ""
                      }
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {projectName.length}/{NAME_MAX_LENGTH}
                      </p>
                      {nameError && <p className="text-xs text-destructive">{nameError}</p>}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="projectDescription">
                      Description <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <textarea
                      id="projectDescription"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="A brief description of your project..."
                      maxLength={DESCRIPTION_MAX_LENGTH}
                      rows={4}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {projectDescription.length}/{DESCRIPTION_MAX_LENGTH} characters
                    </p>
                  </div>

                  <Separator />

                  {/* Save Button */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {isCloud ? "Saved to cloud" : "Saved locally"}
                    </p>
                    <Button
                      onClick={handleSaveProject}
                      disabled={!hasProjectChanges || isSaving || !!nameError}
                    >
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

          {/* Pro Tab */}
          <TabsContent value="pro" className="m-0 h-full overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h3 className="mb-1 text-sm font-medium">Scapper Pro</h3>
                <p className="text-xs text-muted-foreground">
                  Your AI assistant usage and subscription.
                </p>
              </div>

              <Separator />

              {/* Tier Badge */}
              <div className="flex items-center gap-4 rounded-lg border bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4">
                <ScapperIcon size={40} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {quotaStatus?.tier === "pro" ? "CodeScapes Pro" : "Free Plan"}
                    </span>
                    {quotaStatus?.tier === "pro" && <ProBadge />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quotaStatus?.tier === "pro"
                      ? "Unlimited Scapper prompts"
                      : "3 prompts per day"}
                  </p>
                </div>
              </div>

              {/* Usage Stats */}
              {quotaStatus && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Usage</h4>
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Prompts today</span>
                      <span className="text-sm font-medium">
                        {quotaStatus.tier === "pro"
                          ? `${quotaStatus.prompts_used} used`
                          : `${quotaStatus.prompts_used} / ${quotaStatus.prompts_limit}`}
                      </span>
                    </div>
                    {quotaStatus.tier === "free" && (
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                          style={{
                            width: `${Math.min(100, (quotaStatus.prompts_used / quotaStatus.prompts_limit) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                    {quotaStatus.tier === "free" && quotaStatus.resets_at && (
                      <p className="mt-2 text-xs text-muted-foreground">Resets at midnight UTC</p>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* Upgrade Section - Only for free users */}
              {quotaStatus?.tier === "free" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Upgrade to Pro</h4>
                  <div className="space-y-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <p className="text-sm text-muted-foreground">
                      Get unlimited Scapper prompts and supercharge your coding.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                        Unlimited AI prompts
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-emerald-500" />
                        Priority response times
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                        Early access to new features
                      </li>
                    </ul>
                    <Button
                      onClick={() => setUpgradeModalOpen(true)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    >
                      Upgrade to Pro - $9.99/month
                    </Button>
                  </div>
                </div>
              )}

              {/* Pro user subscription management */}
              {quotaStatus?.tier === "pro" && (
                <div className="text-center text-sm text-muted-foreground">
                  <p>Thank you for being a Pro subscriber! ✨</p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onSuccess={() => {
          // Refresh quota status after upgrade
          getQuotaStatus().then(setQuotaStatus)
        }}
      />
    </div>
  )
}
