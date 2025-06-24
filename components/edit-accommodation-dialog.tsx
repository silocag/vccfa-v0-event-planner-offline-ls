"use client"

import type { Accommodation, Room, Bed } from "@/types/app"
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Plus, Minus, ChevronDown, BedIcon, HomeIcon } from "lucide-react"

interface EditAccommodationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accommodation: Accommodation | null
  onSave: (accommodationId: string | null, updates: Partial<Accommodation>) => void
}

export function EditAccommodationDialog({ open, onOpenChange, accommodation, onSave }: EditAccommodationDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [rooms, setRooms] = useState<Room[]>([])
  const [childrenBedsAvailable, setChildrenBedsAvailable] = useState(false)
  const [allowsAnimals, setAllowsAnimals] = useState(false)
  const [foodServices, setFoodServices] = useState<string[]>([])
  const [dietaryOptions, setDietaryOptions] = useState<string[]>([])
  const [generalNotes, setGeneralNotes] = useState("")

  useEffect(() => {
    if (accommodation) {
      setName(accommodation.name)
      setDescription(accommodation.description || "")
      setRooms(accommodation.rooms || [])
      setChildrenBedsAvailable(accommodation.childrenBedsAvailable || false)
      setAllowsAnimals(accommodation.allowsAnimals || false)
      setFoodServices(accommodation.foodServices || [])
      setDietaryOptions(accommodation.dietaryOptions || [])
      setGeneralNotes(accommodation.generalNotes || "")
    } else {
      setName("")
      setDescription("")
      setRooms([])
      setChildrenBedsAvailable(false)
      setAllowsAnimals(false)
      setFoodServices([])
      setDietaryOptions([])
      setGeneralNotes("")
    }
  }, [accommodation, open])

  const handleFoodServiceChange = (service: string, checked: boolean) => {
    setFoodServices((prev) => (checked ? [...prev, service] : prev.filter((s) => s !== service)))
  }

  const handleDietaryOptionChange = (option: string, checked: boolean) => {
    setDietaryOptions((prev) => (checked ? [...prev, option] : prev.filter((o) => o !== option)))
  }

  const addRoom = () => {
    setRooms([...rooms, { id: `room-${Date.now()}`, type: "single", beds: [] }])
  }

  const removeRoom = (roomId: string) => {
    setRooms(rooms.filter((room) => room.id !== roomId))
  }

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    setRooms(rooms.map((room) => (room.id === roomId ? { ...room, ...updates } : room)))
  }

  const addBed = (roomId: string) => {
    setRooms(
      rooms.map((room) =>
        room.id === roomId ? { ...room, beds: [...room.beds, { id: `bed-${Date.now()}`, type: "single" }] } : room,
      ),
    )
  }

  const removeBed = (roomId: string, bedId: string) => {
    setRooms(
      rooms.map((room) => (room.id === roomId ? { ...room, beds: room.beds.filter((bed) => bed.id !== bedId) } : room)),
    )
  }

  const updateBed = (roomId: string, bedId: string, updates: Partial<Bed>) => {
    setRooms(
      rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              beds: room.beds.map((bed) => (bed.id === bedId ? { ...bed, ...updates } : bed)),
            }
          : room,
      ),
    )
  }

  const handleSave = () => {
    if (!name.trim()) return

    onSave(accommodation?.id || null, {
      name: name.trim(),
      description: description.trim(),
      rooms,
      childrenBedsAvailable,
      allowsAnimals,
      foodServices,
      dietaryOptions,
      generalNotes: generalNotes.trim(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {accommodation ? `Edit Accommodation: ${accommodation.name}` : "Add New Accommodation"}
          </DialogTitle>
          <DialogDescription>
            {accommodation
              ? "Update the details for this accommodation option."
              : "Add a new accommodation option for the event."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="accommodation-name">Name *</Label>
            <Input
              id="accommodation-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Grand Hotel"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accommodation-description">Description</Label>
            <Textarea
              id="accommodation-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Luxury hotel in downtown..."
              rows={3}
            />
          </div>

          <div className="space-y-4 border rounded-md p-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Rooms</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRoom}>
                <Plus className="h-4 w-4 mr-1" />
                Add Room
              </Button>
            </div>
            {rooms.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-2">No rooms defined yet.</p>
            ) : (
              <div className="space-y-3">
                {rooms.map((room, roomIndex) => (
                  <Collapsible key={room.id} defaultOpen={true} className="border rounded-md p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center gap-2 flex-1 cursor-pointer">
                          <HomeIcon className="h-4 w-4 text-gray-600" />
                          <h4 className="font-medium">
                            {room.name || `Room ${roomIndex + 1}`} ({room.type || "No Type"})
                          </h4>
                          <p className="text-sm text-gray-500">({room.beds.length} beds)</p>
                          <Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0">
                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                            <span className="sr-only">Toggle room details</span>
                          </Button>
                        </div>
                      </CollapsibleTrigger>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRoom(room.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Minus className="h-4 w-4" />
                        <span className="sr-only">Remove room</span>
                      </Button>
                    </div>
                    <CollapsibleContent className="pt-3 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`room-name-${room.id}`}>Room Name (optional)</Label>
                        <Input
                          id={`room-name-${room.id}`}
                          value={room.name || ""}
                          onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                          placeholder="e.g., Suite A, Room 101"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`room-type-${room.id}`}>Room Type</Label>
                        <Select
                          value={room.type}
                          onValueChange={(value: Room["type"]) => updateRoom(room.id, { type: value })}
                        >
                          <SelectTrigger id={`room-type-${room.id}`}>
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single Room</SelectItem>
                            <SelectItem value="double">Double Room</SelectItem>
                            <SelectItem value="suite">Suite</SelectItem>
                            <SelectItem value="family">Family Room</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`room-notes-${room.id}`}>Room Notes</Label>
                        <Textarea
                          id={`room-notes-${room.id}`}
                          value={room.notes || ""}
                          onChange={(e) => updateRoom(room.id, { notes: e.target.value })}
                          placeholder="e.g., Ocean view, wheelchair accessible"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-3 border-t pt-3 mt-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Beds in this Room</Label>
                          <Button type="button" variant="outline" size="sm" onClick={() => addBed(room.id)}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add Bed
                          </Button>
                        </div>
                        {room.beds.length === 0 ? (
                          <p className="text-gray-500 text-xs text-center py-1">No beds defined for this room.</p>
                        ) : (
                          <div className="space-y-2">
                            {room.beds.map((bed) => (
                              <div key={bed.id} className="flex items-center space-x-2 border rounded-md p-2 bg-white">
                                <BedIcon className="h-4 w-4 text-gray-500" />
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                  <Select
                                    value={bed.type}
                                    onValueChange={(value: Bed["type"]) => updateBed(room.id, bed.id, { type: value })}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue placeholder="Select bed type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="single">Single Bed</SelectItem>
                                      <SelectItem value="double">Double Bed</SelectItem>
                                      <SelectItem value="queen">Queen Bed</SelectItem>
                                      <SelectItem value="king">King Bed</SelectItem>
                                      <SelectItem value="bunk">Bunk Bed</SelectItem>
                                      <SelectItem value="sofa">Sofa Bed</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    value={bed.notes || ""}
                                    onChange={(e) => updateBed(room.id, bed.id, { notes: e.target.value })}
                                    placeholder="Bed notes (e.g., pull-out)"
                                    className="h-8"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeBed(room.id, bed.id)}
                                  className="text-red-500 hover:text-red-600 h-8 w-8 p-0"
                                >
                                  <Minus className="h-4 w-4" />
                                  <span className="sr-only">Remove bed</span>
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="children-beds-available"
              checked={childrenBedsAvailable}
              onCheckedChange={(checked) => setChildrenBedsAvailable(!!checked)}
            />
            <label
              htmlFor="children-beds-available"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Children's Beds Available
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allows-animals"
              checked={allowsAnimals}
              onCheckedChange={(checked) => setAllowsAnimals(!!checked)}
            />
            <label
              htmlFor="allows-animals"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Allows Animals
            </label>
          </div>

          <div className="space-y-2">
            <Label>Food Services</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="breakfast"
                  checked={foodServices.includes("Breakfast")}
                  onCheckedChange={(checked) => handleFoodServiceChange("Breakfast", !!checked)}
                />
                <label htmlFor="breakfast" className="text-sm font-medium leading-none">
                  Breakfast
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lunch"
                  checked={foodServices.includes("Lunch")}
                  onCheckedChange={(checked) => handleFoodServiceChange("Lunch", !!checked)}
                />
                <label htmlFor="lunch" className="text-sm font-medium leading-none">
                  Lunch
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dinner"
                  checked={foodServices.includes("Dinner")}
                  onCheckedChange={(checked) => handleFoodServiceChange("Dinner", !!checked)}
                />
                <label htmlFor="dinner" className="text-sm font-medium leading-none">
                  Dinner
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="room-service"
                  checked={foodServices.includes("Room Service")}
                  onCheckedChange={(checked) => handleFoodServiceChange("Room Service", !!checked)}
                />
                <label htmlFor="room-service" className="text-sm font-medium leading-none">
                  Room Service
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dietary Options</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vegan"
                  checked={dietaryOptions.includes("Vegan")}
                  onCheckedChange={(checked) => handleDietaryOptionChange("Vegan", !!checked)}
                />
                <label htmlFor="vegan" className="text-sm font-medium leading-none">
                  Vegan
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gluten-free"
                  checked={dietaryOptions.includes("Gluten-Free")}
                  onCheckedChange={(checked) => handleDietaryOptionChange("Gluten-Free", !!checked)}
                />
                <label htmlFor="gluten-free" className="text-sm font-medium leading-none">
                  Gluten-Free
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="halal"
                  checked={dietaryOptions.includes("Halal")}
                  onCheckedChange={(checked) => handleDietaryOptionChange("Halal", !!checked)}
                />
                <label htmlFor="halal" className="text-sm font-medium leading-none">
                  Halal
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="general-notes">General Notes</Label>
            <Textarea
              id="general-notes"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Any other specific requirements or notes about the accommodation..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {accommodation ? "Save Changes" : "Add Accommodation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
