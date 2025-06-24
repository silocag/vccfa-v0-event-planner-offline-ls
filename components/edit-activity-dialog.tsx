"use client"

import type { Activity, ProposedDay } from "@/types/app"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"

interface EditActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity: Activity | null
  agreedDays: ProposedDay[]
  onSave: (activityId: string | null, updates: Partial<Activity>) => void
}

export function EditActivityDialog({ open, onOpenChange, activity, agreedDays, onSave }: EditActivityDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  useEffect(() => {
    if (activity) {
      setName(activity.name)
      setDescription(activity.description || "")
      setDate(activity.date)
      setTime(activity.time)
    } else {
      setName("")
      setDescription("")
      setDate("")
      setTime("")
    }
  }, [activity, open])

  const handleSave = () => {
    if (!name.trim() || !date.trim() || !time.trim()) return

    onSave(activity?.id || null, {
      name: name.trim(),
      description: description.trim(),
      date: date.trim(),
      time: time.trim(),
    })
    onOpenChange(false)
  }

  const isDateAgreed = agreedDays.some((day) => day.date === date)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{activity ? `Edit Activity: ${activity.name}` : "Add New Activity"}</DialogTitle>
          <DialogDescription>
            {activity ? "Update the details for this activity." : "Add a new activity to the event."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="activity-name">Activity Name *</Label>
            <Input
              id="activity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Team Building Games"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-description">Description</Label>
            <Textarea
              id="activity-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fun games to foster team spirit..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activity-date">Date *</Label>
              <Select value={date} onValueChange={setDate}>
                <SelectTrigger id="activity-date">
                  <SelectValue placeholder="Select a date" />
                </SelectTrigger>
                <SelectContent>
                  {agreedDays.length === 0 ? (
                    <SelectItem value="no-agreed-days" disabled>
                      No agreed days available
                    </SelectItem>
                  ) : (
                    agreedDays
                      .slice()
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((day) => (
                        <SelectItem key={day.id} value={day.date}>
                          {new Date(day.date).toLocaleDateString()}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              {!isDateAgreed && date && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" /> This date is not an agreed day.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-time">Time *</Label>
              <Input id="activity-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !date.trim() || !time.trim()}>
            {activity ? "Save Changes" : "Add Activity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
