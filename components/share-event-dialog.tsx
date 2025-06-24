"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CopyIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Event, UserRole } from "@/types/app"

interface ShareEventDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  event: Event
  userRole: UserRole
}

export function ShareEventDialog({ isOpen, onOpenChange, event, userRole }: ShareEventDialogProps) {
  const eventLink = typeof window !== "undefined" ? `${window.location.origin}/event/${event.id}` : ""

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventLink)
    toast({
      title: "Link Copied!",
      description: "The event link has been copied to your clipboard.",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Event</DialogTitle>
          <DialogDescription>Share this event with your guests.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-link" className="text-right">
              Event Link
            </Label>
            <Input id="event-link" value={eventLink} readOnly className="col-span-3" />
          </div>
          <Button type="button" onClick={handleCopyLink}>
            <CopyIcon className="mr-2 h-4 w-4" /> Copy Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
