import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { SettingsPane } from "./SettingsPane"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-h-[80vh]">
        <VisuallyHidden>
          <DialogTitle>Settings</DialogTitle>
        </VisuallyHidden>
        <SettingsPane />
      </DialogContent>
    </Dialog>
  )
}
