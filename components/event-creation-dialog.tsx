"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import type { DateRange } from "@/types/app"
import { Plus, X } from "lucide-react"

interface EventCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventCreationDialog({ open, onOpenChange }: EventCreationDialogProps) {
  const { createEvent } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dateRanges, setDateRanges] = useState<DateRange[]>([{ start: "", end: "" }])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    const validDateRanges = dateRanges.filter((range) => range.start && range.end)

    createEvent({
      title: title.trim(),
      description: description.trim(),
      dateRanges: validDateRanges,
    })

    // Reset form
    setTitle("")
    setDescription("")
    setDateRanges([{ start: "", end: "" }])
    onOpenChange(false)
  }

  const addDateRange = () => {
    setDateRanges([...dateRanges, { start: "", end: "" }])
  }

  const removeDateRange = (index: number) => {
    setDateRanges(dateRanges.filter((_, i) => i !== index))
  }

  const updateDateRange = (index: number, field: "start" | "end", value: string) => {
    const updated = dateRanges.map((range, i) => (i === index ? { ...range, [field]: value } : range))
    setDateRanges(updated)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>Set up your event details. You can add guests and activities later.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summer Team Retreat"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A fun weekend getaway for the team..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Date Ranges</Label>
              <Button type="button" variant="outline" size="sm" onClick={addDateRange}>
                <Plus className="h-4 w-4 mr-1" />
                Add Range
              </Button>
            </div>

            {dateRanges.map((range, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    type="date"
                    value={range.start}
                    onChange={(e) => updateDateRange(index, "start", e.target.value)}
                    placeholder="Start date"
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="flex-1">
                  <Input
                    type="date"
                    value={range.end}
                    onChange={(e) => updateDateRange(index, "end", e.target.value)}
                    placeholder="End date"
                  />
                </div>
                {dateRanges.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeDateRange(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
