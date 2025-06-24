"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Event } from "@/types/app"
import { TrashIcon } from "@radix-ui/react-icons"

interface EditEventDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  event: Event
  onSave: (updatedEvent: Event) => void
  onDeleteClick: () => void
}

export function EditEventDialog({ isOpen, onOpenChange, event, onSave, onDeleteClick }: EditEventDialogProps) {
  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description)

  useEffect(() => {
    if (isOpen) {
      setTitle(event.title)
      setDescription(event.description)
    }
  }, [isOpen, event])

  const handleSave = () => {
    const updatedEvent = {
      ...event,
      title,
      description,
    }
    onSave(updatedEvent)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Event Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDeleteClick}>
            <TrashIcon className="h-4 w-4 mr-2" /> Delete Event
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
