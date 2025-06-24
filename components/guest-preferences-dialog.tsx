"use client"

import type { Guest } from "@/types/app"
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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GuestPreferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest: Guest | null // Allow guest to be null
  onSave: (guestId: string, preferences: Guest["preferences"]) => void
}

export function GuestPreferencesDialog({ open, onOpenChange, guest, onSave }: GuestPreferencesDialogProps) {
  // Safely initialize state with default values if guest or preferences are undefined
  const [roomType, setRoomType] = useState<Guest["preferences"]["roomType"]>(guest?.preferences?.roomType || "")
  const [bedType, setBedType] = useState<Guest["preferences"]["bedType"]>(guest?.preferences?.bedType || "")
  const [childrenBeds, setChildrenBeds] = useState(guest?.preferences?.childrenBeds || 0)
  const [animals, setAnimals] = useState(guest?.preferences?.animals || "")
  const [foodPreferences, setFoodPreferences] = useState<Guest["preferences"]["foodPreferences"]>(
    guest?.preferences?.foodPreferences || [],
  )
  const [generalNotes, setGeneralNotes] = useState(guest?.preferences?.generalNotes || "")

  useEffect(() => {
    if (guest) {
      setRoomType(guest.preferences.roomType || "")
      setBedType(guest.preferences.bedType || "")
      setChildrenBeds(guest.preferences.childrenBeds || 0)
      setAnimals(guest.preferences.animals || "")
      setFoodPreferences(guest.preferences.foodPreferences || [])
      setGeneralNotes(guest.preferences.generalNotes || "")
    } else {
      // Reset state if guest becomes null (e.g., dialog closes)
      setRoomType("")
      setBedType("")
      setChildrenBeds(0)
      setAnimals("")
      setFoodPreferences([])
      setGeneralNotes("")
    }
  }, [guest])

  const handleFoodPreferenceChange = (preference: string, checked: boolean) => {
    setFoodPreferences((prev) => (checked ? [...prev, preference] : prev.filter((p) => p !== preference)))
  }

  const handleSave = () => {
    if (!guest) return // Should not happen if dialog is only open with a valid guest

    onSave(guest.id, {
      roomType,
      bedType,
      childrenBeds,
      animals,
      foodPreferences,
      generalNotes,
    })
    onOpenChange(false)
  }

  // Only render content if guest is available
  if (!guest) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Preferences for {guest.name}</DialogTitle>
          <DialogDescription>Define accommodation, food, and other notes for this guest.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="roomType" className="text-right">
              Room Type
            </Label>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Room</SelectItem>
                <SelectItem value="double">Double Room</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bedType" className="text-right">
              Bed Type
            </Label>
            <Select value={bedType} onValueChange={setBedType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select bed type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Bed</SelectItem>
                <SelectItem value="double">Double Bed</SelectItem>
                <SelectItem value="queen">Queen Bed</SelectItem>
                <SelectItem value="king">King Bed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="childrenBeds" className="text-right">
              Children's Beds
            </Label>
            <Input
              id="childrenBeds"
              type="number"
              value={childrenBeds}
              onChange={(e) => setChildrenBeds(Number.parseInt(e.target.value) || 0)}
              className="col-span-3"
              min="0"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="animals" className="text-right">
              Animals
            </Label>
            <Input
              id="animals"
              value={animals}
              onChange={(e) => setAnimals(e.target.value)}
              placeholder="e.g., dog, cat"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Food Preferences</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vegetarian"
                  checked={foodPreferences.includes("vegetarian")}
                  onCheckedChange={(checked) => handleFoodPreferenceChange("vegetarian", !!checked)}
                />
                <label
                  htmlFor="vegetarian"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Vegetarian
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vegan"
                  checked={foodPreferences.includes("vegan")}
                  onCheckedChange={(checked) => handleFoodPreferenceChange("vegan", !!checked)}
                />
                <label
                  htmlFor="vegan"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Vegan
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lactose-free"
                  checked={foodPreferences.includes("lactose-free")}
                  onCheckedChange={(checked) => handleFoodPreferenceChange("lactose-free", !!checked)}
                />
                <label
                  htmlFor="lactose-free"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Lactose-Free
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="generalNotes" className="text-right">
              General Notes
            </Label>
            <Textarea
              id="generalNotes"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Any other specific requirements or notes..."
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
