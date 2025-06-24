"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import type React from "react"
import type { User } from "@/types/app" // Declare the User type
import { users } from "@/data/users" // Import the users data

import { useState, useMemo } from "react" // Import useMemo
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/hooks/use-auth"
import type { Event, Guest, Group } from "@/types/app"
import { Plus, Users, Mail, Crown, Shield, Grip, Tag, ChevronDown, MoreVertical, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { GuestPreferencesDialog } from "./guest-preferences-dialog" // Import the new component

interface GuestManagementProps {
  event: Event
  userRole: "Organizer" | "Guest" | "Group Admin" // Pass userRole to determine editing permissions
  readOnly?: boolean // New prop
}

export function GuestManagement({ event, userRole, readOnly = false }: GuestManagementProps) {
  const { user, updateEvent } = useAuth() // Get users to link guests
  const [showAddGuest, setShowAddGuest] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [groupName, setGroupName] = useState("")
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editedGroupName, setEditedGroupName] = useState("")
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false)
  const [selectedGuestForPreferences, setSelectedGuestForPreferences] = useState<Guest | null>(null)

  const addGuest = () => {
    if (!guestName.trim()) return

    const matchingUser = users.find((u) => u.email === guestEmail.trim())

    const newGuest: Guest = {
      id: Date.now().toString(),
      name: guestName.trim(),
      email: guestEmail.trim() || undefined,
      isOrganizer: false,
      isGroupAdmin: false,
      groupId: undefined,
      userId: matchingUser ? matchingUser.id : undefined, // Link guest to user if email matches
      preferences: {
        roomType: "",
        bedType: "",
        childrenBeds: 0,
        animals: "",
        foodPreferences: [],
        generalNotes: "",
      },
    }

    updateEvent(event.id, {
      guests: [...event.guests, newGuest],
    })

    setGuestName("")
    setGuestEmail("")
    setShowAddGuest(false)
  }

  const createGroup = () => {
    if (!groupName.trim()) return

    const newGroup: Group = {
      id: Date.now().toString(),
      name: groupName.trim(),
      adminId: undefined,
    }

    updateEvent(event.id, {
      groups: [...event.groups, newGroup],
    })

    setGroupName("")
    setShowCreateGroup(false)
  }

  const toggleGuestRole = (guestId: string, role: "organizer" | "groupAdmin") => {
    if (readOnly) return // Prevent changes in read-only mode
    const updatedGuests = event.guests.map((guest) => {
      if (guest.id === guestId) {
        if (role === "organizer") {
          return { ...guest, isOrganizer: !guest.isOrganizer }
        } else {
          // role === "groupAdmin"
          // Only allow group admin if guest is in a group and has a userId (can be a voter)
          if (!guest.groupId && !guest.isGroupAdmin) {
            return guest // Cannot make ungrouped guest a group admin
          }
          // A group admin must be linked to a user account to be able to vote for others
          if (!guest.userId && !guest.isGroupAdmin) {
            return guest // Cannot make a guest without a user ID a group admin
          }
          return { ...guest, isGroupAdmin: !guest.isGroupAdmin }
        }
      }
      return guest
    })

    const updatedGroups = [...event.groups]

    // Handle group admin assignment/unassignment in groups
    const guestBeingToggled = updatedGuests.find((g) => g.id === guestId)
    if (guestBeingToggled && role === "groupAdmin" && guestBeingToggled.groupId) {
      const currentGroup = updatedGroups.find((g) => g.id === guestBeingToggled.groupId)
      if (currentGroup) {
        if (guestBeingToggled.isGroupAdmin) {
          // If guest is now admin, set them as adminId for their group
          currentGroup.adminId = guestBeingToggled.id
        } else {
          // If guest is no longer admin, clear adminId if they were the one
          if (currentGroup.adminId === guestBeingToggled.id) {
            currentGroup.adminId = undefined
          }
        }
      }
    }

    updateEvent(event.id, { guests: updatedGuests, groups: updatedGroups })
  }

  const assignGuestToGroup = (guestId: string, groupId: string | undefined) => {
    if (readOnly) return // Prevent changes in read-only mode
    const updatedGuests = event.guests.map((guest) => {
      if (guest.id === guestId) {
        // If guest was admin of their old group, clear that group's adminId
        if (guest.groupId) {
          const oldGroup = event.groups.find((g) => g.id === guest.groupId)
          if (oldGroup && oldGroup.adminId === guest.id) {
            oldGroup.adminId = undefined // Clear admin for old group
          }
        }
        // If moving to ungrouped, ensure they are not group admin
        if (groupId === undefined) {
          return { ...guest, groupId, isGroupAdmin: false }
        }
        return { ...guest, groupId }
      }
      return guest
    })

    // Update groups in case adminId was cleared
    const updatedGroups = [...event.groups] // This will contain the updated oldGroup if modified above
    updateEvent(event.id, { guests: updatedGuests, groups: updatedGroups })
  }

  const removeGuest = (guestId: string) => {
    if (readOnly) return // Prevent changes in read-only mode
    const updatedGuests = event.guests.filter((guest) => guest.id !== guestId)
    const updatedGroups = [...event.groups]

    // If the removed guest was a group admin, clear their adminId from the group
    const removedGuest = event.guests.find((g) => g.id === guestId)
    if (removedGuest && removedGuest.groupId) {
      const groupOfRemovedGuest = updatedGroups.find((g) => g.id === removedGuest.groupId)
      if (groupOfRemovedGuest && groupOfRemovedGuest.adminId === removedGuest.id) {
        groupOfRemovedGuest.adminId = undefined
      }
    }

    // Also remove any votes associated with this guest
    const updatedVotes = { ...event.votes }
    Object.keys(updatedVotes).forEach((category) => {
      if (updatedVotes[category] && updatedVotes[category][guestId]) {
        delete updatedVotes[category][guestId]
      }
    })

    updateEvent(event.id, { guests: updatedGuests, groups: updatedGroups, votes: updatedVotes })
  }

  const renameGuest = (guestId: string, newName: string) => {
    if (readOnly) return // Prevent changes in read-only mode
    const updatedGuests = event.guests.map((guest) =>
      guest.id === guestId ? { ...guest, name: newName.trim() } : guest,
    )
    updateEvent(event.id, { guests: updatedGuests })
  }

  const removeGroup = (groupId: string) => {
    if (readOnly) return // Prevent changes in read-only mode
    const updatedGroups = event.groups.filter((group) => group.id !== groupId)
    const updatedGuests = event.guests.map((guest) => {
      // If guest was in the deleted group, unassign them and ensure they are not group admin
      if (guest.groupId === groupId) {
        // If the guest was admin of the deleted group, ensure isGroupAdmin is false
        // This check is a bit redundant as assignGuestToGroup(undefined) handles it, but good for clarity
        return { ...guest, groupId: undefined, isGroupAdmin: false }
      }
      return guest
    })

    updateEvent(event.id, {
      groups: updatedGroups,
      guests: updatedGuests,
    })
  }

  const handleDragStart = (e: React.DragEvent, guestId: string) => {
    if (readOnly) {
      e.preventDefault()
      return
    }
    setDraggedGuestId(guestId)
    e.dataTransfer.setData("text/plain", guestId) // Set data for cross-browser compatibility
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (readOnly) {
      e.preventDefault()
      return
    }
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDropOnGroup = (e: React.DragEvent, targetGroupId: string) => {
    if (readOnly) {
      e.preventDefault()
      return
    }
    e.preventDefault()
    const droppedGuestId = e.dataTransfer.getData("text/plain")
    if (droppedGuestId) {
      assignGuestToGroup(droppedGuestId, targetGroupId)
      setDraggedGuestId(null)
    }
  }

  const handleDropOnUngrouped = (e: React.DragEvent) => {
    if (readOnly) {
      e.preventDefault()
      return
    }
    e.preventDefault()
    const droppedGuestId = e.dataTransfer.getData("text/plain")
    if (droppedGuestId) {
      assignGuestToGroup(droppedGuestId, undefined)
      setDraggedGuestId(null)
    }
  }

  const handleEditGroupNameStart = (groupId: string, currentName: string) => {
    if (readOnly) return
    setEditingGroupId(groupId)
    setEditedGroupName(currentName)
  }

  const handleEditGroupNameSave = (groupId: string) => {
    if (readOnly) return
    if (editedGroupName.trim() && editedGroupName !== event.groups.find((g) => g.id === groupId)?.name) {
      const updatedGroups = event.groups.map((group) =>
        group.id === groupId ? { ...group, name: editedGroupName.trim() } : group,
      )
      updateEvent(event.id, { groups: updatedGroups })
    }
    setEditingGroupId(null)
    setEditedGroupName("")
  }

  const handleKeyDown = (e: React.KeyboardEvent, groupId: string) => {
    if (readOnly) return
    if (e.key === "Enter") {
      handleEditGroupNameSave(groupId)
    } else if (e.key === "Escape") {
      setEditingGroupId(null)
      setEditedGroupName("")
    }
  }

  const handleSavePreferences = (guestId: string, preferences: Guest["preferences"]) => {
    const updatedGuests = event.guests.map((g) => (g.id === guestId ? { ...g, preferences: preferences } : g))
    updateEvent(event.id, { guests: updatedGuests })
  }

  const openPreferencesDialog = (guest: Guest) => {
    setSelectedGuestForPreferences(guest)
    setShowPreferencesDialog(true)
  }

  // Combine actual groups with a virtual "Ungrouped" group for rendering
  const allDisplayGroups = [
    { id: "ungrouped-group-id", name: "Ungrouped", adminId: undefined }, // Virtual group
    ...event.groups,
  ]

  return (
    <div className="space-y-6">
      {/* Main Guests Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center text-xl">
                <Users className="h-6 w-6 mr-3" />
                Event Guests ({event.guests.length})
              </CardTitle>
              <CardDescription>
                {readOnly
                  ? "View guests and their groups"
                  : "Manage guests and organize them into groups using drag & drop"}
              </CardDescription>
            </div>
            {!readOnly && (
              <div className="flex space-x-2">
                <Dialog open={showAddGuest} onOpenChange={setShowAddGuest}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Guest
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Guest</DialogTitle>
                      <DialogDescription>Add a guest to your event</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="guest-name">Name *</Label>
                        <Input
                          id="guest-name"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guest-email">Email (optional)</Label>
                        <Input
                          id="guest-email"
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowAddGuest(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addGuest} disabled={!guestName.trim()}>
                          Add Guest
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      New Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Group</DialogTitle>
                      <DialogDescription>Create a group to organize guests (e.g., families, teams)</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="group-name">Group Name</Label>
                        <Input
                          id="group-name"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          placeholder="Marketing Team"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createGroup} disabled={!groupName.trim()}>
                          Create Group
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {event.guests.length === 0 && event.groups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No guests or groups added yet</p>
              {!readOnly && <p className="text-gray-400 text-sm mb-4">Start by adding guests to your event</p>}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Groups Section */}
              <div>
                {allDisplayGroups.length === 1 &&
                allDisplayGroups[0].id === "ungrouped-group-id" &&
                event.guests.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No groups created yet and no guests added</p>
                ) : (
                  <div className="space-y-4">
                    {allDisplayGroups.map((group) => {
                      const isUngroupedSection = group.id === "ungrouped-group-id"
                      const groupMembers = isUngroupedSection
                        ? event.guests.filter((guest) => !guest.groupId)
                        : event.guests.filter((guest) => guest.groupId === group.id)

                      // Don't render empty ungrouped section if all guests are grouped AND there are other groups
                      if (isUngroupedSection && groupMembers.length === 0 && event.groups.length > 0) {
                        return null
                      }

                      return (
                        <Collapsible key={group.id} defaultOpen={true} className="group/collapsible">
                          <div
                            className="border rounded-lg p-4 transition-colors"
                            onDragOver={readOnly ? undefined : handleDragOver}
                            onDrop={
                              readOnly
                                ? undefined
                                : (e) =>
                                    isUngroupedSection ? handleDropOnUngrouped(e) : handleDropOnGroup(e, group.id)
                            }
                            style={{
                              borderColor:
                                !readOnly &&
                                draggedGuestId &&
                                (isUngroupedSection
                                  ? !event.guests.find((g) => g.id === draggedGuestId)?.groupId
                                  : event.guests.find((g) => g.id === draggedGuestId)?.groupId !== group.id)
                                  ? "#3b82f6"
                                  : "",
                              backgroundColor:
                                !readOnly &&
                                draggedGuestId &&
                                (isUngroupedSection
                                  ? !event.guests.find((g) => g.id === draggedGuestId)?.groupId
                                  : event.guests.find((g) => g.id === draggedGuestId)?.groupId !== group.id)
                                  ? "#eff6ff"
                                  : "",
                            }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center gap-2 flex-1 cursor-pointer">
                                  {editingGroupId === group.id && !isUngroupedSection && !readOnly ? (
                                    <Input
                                      value={editedGroupName}
                                      onChange={(e) => setEditedGroupName(e.target.value)}
                                      onBlur={() => handleEditGroupNameSave(group.id)}
                                      onKeyDown={(e) => handleKeyDown(e, group.id)}
                                      className="h-8 text-lg font-medium"
                                      autoFocus
                                    />
                                  ) : (
                                    <h4 className="font-medium text-lg flex items-center gap-2">{group.name}</h4>
                                  )}
                                  <p className="text-sm text-gray-600">
                                    ({groupMembers.length} member{groupMembers.length !== 1 ? "s" : ""})
                                  </p>
                                  <Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0">
                                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    <span className="sr-only">Toggle group visibility</span>
                                  </Button>
                                </div>
                              </CollapsibleTrigger>
                              {!isUngroupedSection && !readOnly && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                                      <MoreVertical className="h-4 w-4" />
                                      <span className="sr-only">Group actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditGroupNameStart(group.id, group.name)}>
                                      Rename Group
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                          Delete Group
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the group "
                                            {group.name}" and unassign all its members.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => removeGroup(group.id)}>
                                            Delete Group
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                            <CollapsibleContent>
                              <div className="space-y-2 min-h-[60px] pt-2">
                                {groupMembers.length === 0 ? (
                                  <p className="text-gray-400 text-sm text-center py-4">
                                    {readOnly
                                      ? "No guests in this group."
                                      : "Drop guests here to add them to this group"}
                                  </p>
                                ) : (
                                  groupMembers.map((guest) => (
                                    <GuestCard
                                      key={guest.id}
                                      guest={guest}
                                      groups={event.groups}
                                      onDragStart={handleDragStart}
                                      onToggleRole={toggleGuestRole}
                                      onRemove={removeGuest}
                                      onAssignToGroup={assignGuestToGroup}
                                      onRenameGuest={renameGuest}
                                      isDragging={draggedGuestId === guest.id}
                                      compact
                                      readOnly={readOnly} // Pass readOnly to GuestCard
                                      user={user} // Pass current user for preference editing logic
                                      userRole={userRole} // Pass userRole for preference editing logic
                                      onEditPreferences={openPreferencesDialog} // Pass the new handler
                                      allGuests={event.guests} // Pass allGuests for preference editing logic
                                    />
                                  ))
                                )}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedGuestForPreferences && (
        <GuestPreferencesDialog
          open={showPreferencesDialog}
          onOpenChange={setShowPreferencesDialog}
          guest={selectedGuestForPreferences}
          onSave={handleSavePreferences}
        />
      )}
    </div>
  )
}

interface GuestCardProps {
  guest: Guest
  groups: Group[]
  onDragStart: (e: React.DragEvent, guestId: string) => void
  onToggleRole: (guestId: string, role: "organizer" | "groupAdmin") => void
  onRemove: (guestId: string) => void
  onAssignToGroup: (guestId: string, groupId: string | undefined) => void
  onRenameGuest: (guestId: string, newName: string) => void
  isDragging: boolean
  compact?: boolean
  readOnly?: boolean // New prop
  user: User | null // Current logged-in user
  userRole: "Organizer" | "Guest" | "Group Admin" // Role of the current user in this event
  onEditPreferences: (guest: Guest) => void // New prop for opening preferences dialog
  allGuests: Guest[] // New prop: all guests in the event
}

function GuestCard({
  guest,
  groups,
  onDragStart,
  onToggleRole,
  onRemove,
  onAssignToGroup,
  onRenameGuest,
  isDragging,
  compact = false,
  readOnly = false, // Default to false
  user,
  userRole,
  onEditPreferences, // Destructure the new prop
  allGuests, // Destructure the new prop
}: GuestCardProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(guest.name)

  const groupName = guest.groupId ? groups.find((g) => g.id === guest.groupId)?.name : null

  const handleEditNameSave = () => {
    if (readOnly) return
    if (editedName.trim() && editedName !== guest.name) {
      onRenameGuest(guest.id, editedName.trim())
    }
    setIsEditingName(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return
    if (e.key === "Enter") {
      handleEditNameSave()
    } else if (e.key === "Escape") {
      setEditedName(guest.name) // Revert to original name
      setIsEditingName(false)
    }
  }

  // Determine if the current user can edit this specific guest's preferences
  const canEditPreferences = useMemo(() => {
    if (userRole === "Organizer") {
      return true // Organizer can edit any guest
    }

    const currentUserGuestEntry = allGuests.find((g) => g.userId === user?.id)

    if (userRole === "Guest") {
      return currentUserGuestEntry?.id === guest.id // Regular guest can edit only their own
    }

    if (userRole === "Group Admin") {
      if (!currentUserGuestEntry || !currentUserGuestEntry.isGroupAdmin) {
        return false // Current user is not a recognized group admin guest entry
      }
      // Find the group this user administers
      const adminGroup = groups.find((g) => g.adminId === currentUserGuestEntry.id)
      // Check if the guest being displayed belongs to the group administered by the current user
      return adminGroup?.id === guest.groupId
    }

    return false // Default case
  }, [userRole, user, guest, allGuests, groups]) // Add all relevant dependencies

  const hasMenuItems = canEditPreferences || !readOnly

  return (
    <div
      draggable={!readOnly} // Disable drag if readOnly
      onDragStart={(e) => onDragStart(e, guest.id)}
      className={`border rounded-lg p-2 ${readOnly ? "cursor-default" : "cursor-grab active:cursor-grabbing"} transition-all hover:shadow-md ${
        isDragging ? "opacity-50 scale-95" : ""
      } ${compact ? "bg-gray-50" : "bg-white"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            {!readOnly && <Grip className="h-4 w-4 text-gray-400 flex-shrink-0" />}
            {isEditingName && !readOnly ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleEditNameSave}
                onKeyDown={handleKeyDown}
                className="h-7 text-base font-medium flex-1"
                autoFocus
              />
            ) : (
              <h4 className="font-medium truncate">{guest.name}</h4>
            )}
            {guest.isOrganizer && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Organizer
              </Badge>
            )}
            {guest.isGroupAdmin && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>

          {guest.email && (
            <p className="text-sm text-gray-600 flex items-center mb-1 truncate">
              <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
              {guest.email}
            </p>
          )}

          <p className="text-sm text-gray-600 flex items-center mb-1 truncate">
            <Tag className="h-3 w-3 mr-1 flex-shrink-0" />
            {groupName || "Ungrouped"}
          </p>
        </div>

        {hasMenuItems && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Guest actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEditPreferences && (
                <DropdownMenuItem onClick={() => onEditPreferences(guest)}>
                  <Settings className="h-4 w-4 mr-2" /> Edit Preferences
                </DropdownMenuItem>
              )}
              {!readOnly && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditingName(true)}>Rename Guest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleRole(guest.id, "organizer")}>
                    {guest.isOrganizer ? "Unset as Organizer" : "Set as Organizer"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onToggleRole(guest.id, "groupAdmin")}
                    disabled={!guest.groupId || !guest.userId}
                  >
                    {guest.isGroupAdmin ? "Unset as Group Admin" : "Set as Group Admin"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Assign to Group</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => onAssignToGroup(guest.id, undefined)}>
                        Ungrouped
                      </DropdownMenuItem>
                      {groups.map((group) => (
                        <DropdownMenuItem key={group.id} onClick={() => onAssignToGroup(guest.id, group.id)}>
                          {group.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        {" "}
                        {/* Prevent dropdown from closing immediately */}
                        Delete Guest
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently remove "{guest.name}" from the event.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onRemove(guest.id)}>Remove Guest</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
