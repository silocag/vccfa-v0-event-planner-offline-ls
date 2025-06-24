"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Guest, Activity, Group } from "@/types/app"

interface AssignGuestsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity: Activity | null // Allow activity to be null
  allGuests: Guest[]
  groups: Group[]
  userRole: "Organizer" | "Guest" | "Group Admin"
  currentUserId: string | undefined
  onSave: (activityId: string, assignedGuestIds: string[]) => void
}

export function AssignGuestsDialog({
  open,
  onOpenChange,
  activity,
  allGuests,
  groups,
  userRole,
  currentUserId,
  onSave,
}: AssignGuestsDialogProps) {
  // Safely initialize selectedGuestIds, providing an empty array if activity is null
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>(activity?.assignedGuestIds || [])

  useEffect(() => {
    // Update selectedGuestIds when the activity prop changes
    setSelectedGuestIds(activity?.assignedGuestIds || [])
  }, [activity])

  const assignableGuests = useMemo(() => {
    if (!activity) return [] // If no activity, no guests to assign

    if (userRole === "Organizer") {
      return allGuests // Organizer can assign all guests
    } else if (userRole === "Group Admin") {
      const currentUserGuestEntry = allGuests.find((g) => g.userId === currentUserId)
      const adminGroup = groups.find((g) => g.adminId === currentUserGuestEntry?.id)
      if (adminGroup) {
        return allGuests.filter((guest) => guest.groupId === adminGroup.id) // Group Admin can assign members of their group
      }
      return [] // If no group found for admin, no guests to assign
    } else if (userRole === "Guest") {
      const currentUserGuestEntry = allGuests.find((g) => g.userId === currentUserId)
      return currentUserGuestEntry ? [currentUserGuestEntry] : [] // Regular guest can only assign themselves
    }
    return []
  }, [userRole, allGuests, groups, currentUserId, activity]) // Added activity to dependencies

  const handleCheckboxChange = (guestId: string, checked: boolean) => {
    // Prevent non-organizers from assigning guests outside their scope
    if (userRole === "Group Admin") {
      const isGuestInAdminGroup = assignableGuests.some((g) => g.id === guestId)
      if (!isGuestInAdminGroup) return // Cannot assign guests outside their group
    } else if (userRole === "Guest") {
      const isCurrentUser = allGuests.find((g) => g.id === guestId)?.userId === currentUserId
      if (!isCurrentUser) return // Cannot assign other guests
    }

    setSelectedGuestIds((prev) => (checked ? [...prev, guestId] : prev.filter((id) => id !== guestId)))
  }

  const handleSave = () => {
    if (!activity) return // Should not happen if dialog is opened correctly, but for safety

    // Filter selectedGuestIds to ensure only allowed guests are saved
    const finalAssignedGuestIds = selectedGuestIds.filter((id) => assignableGuests.some((g) => g.id === id))
    onSave(activity.id, finalAssignedGuestIds)
    onOpenChange(false)
  }

  // Do not render the dialog content if activity is null, as it's required for title and description
  if (!activity) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Guests to "{activity.name}"</DialogTitle>
          <DialogDescription>Select guests who will participate in this activity.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ScrollArea className="h-60 w-full rounded-md border p-4">
            <div className="space-y-3">
              {assignableGuests.length === 0 ? (
                <p className="text-gray-500 text-center">
                  {userRole === "Organizer"
                    ? "No guests available to assign."
                    : userRole === "Group Admin"
                      ? "No members in your group to assign."
                      : "You can only assign yourself."}
                </p>
              ) : (
                assignableGuests.map((guest) => (
                  <div key={guest.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`guest-${guest.id}`}
                      checked={selectedGuestIds.includes(guest.id)}
                      onCheckedChange={(checked) => handleCheckboxChange(guest.id, checked as boolean)}
                      disabled={userRole === "Guest" && guest.userId !== currentUserId} // Only current user can check their own box
                    />
                    <Label
                      htmlFor={`guest-${guest.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {guest.name} {guest.email ? `(${guest.email})` : ""}
                      {guest.userId === currentUserId ? " (You)" : ""}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Assignments</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
