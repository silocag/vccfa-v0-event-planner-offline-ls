"use client"

import type { Location } from "@/types/app"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface EditLocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  location: Location | null
  onSave: (locationId: string | null, updates: Partial<Location>) => void
}

export function EditLocationDialog({ open, onOpenChange, location, onSave }: EditLocationDialogProps) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")

  useEffect(() => {
    if (location) {
      setName(location.name)
      setAddress(location.address || "")
    } else {
      setName("")
      setAddress("")
    }
  }, [location, open])

  const handleSave = () => {
    if (!name.trim()) return

    onSave(location?.id || null, {
      name: name.trim(),
      address: address.trim(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{location ? `Edit Location: ${location.name}` : "Add New Location"}</DialogTitle>
          <DialogDescription>
            {location ? "Update the details for this event location." : "Add a new location for your event."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="location-name">Location Name *</Label>
            <Input
              id="location-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Central Park"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location-address">Address</Label>
            <Input
              id="location-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="New York, NY"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {location ? "Save Changes" : "Add Location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
