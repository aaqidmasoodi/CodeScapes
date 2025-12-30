import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { SettingsPane } from "./SettingsPane"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import type { EditorSettings } from "@/hooks/useEditorSettings"
import type { Scape } from "@/lib/db"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editorSettings: EditorSettings
  onEditorSettingChange: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void
  onResetEditorSettings: () => void
  scape?: Scape
  onScapeUpdate?: (updates: Partial<Scape>) => Promise<void>
}

export function SettingsModal({
  open,
  onOpenChange,
  editorSettings,
  onEditorSettingChange,
  onResetEditorSettings,
  scape,
  onScapeUpdate,
}: SettingsModalProps) {
  const isCloud = scape?.source === "cloud"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[560px] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <VisuallyHidden>
          <DialogTitle>Scape Settings</DialogTitle>
        </VisuallyHidden>
        <SettingsPane
          editorSettings={editorSettings}
          onEditorSettingChange={onEditorSettingChange}
          onResetEditorSettings={onResetEditorSettings}
          scape={scape}
          onScapeUpdate={onScapeUpdate}
          isCloud={isCloud}
        />
      </DialogContent>
    </Dialog>
  )
}
