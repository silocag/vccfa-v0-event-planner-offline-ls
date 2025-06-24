"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash, MoreVertical, Activity, Users, AlertCircle } from "lucide-react"
import type { Event, Activity as ActivityType, UserRole, ProposedDay } from "@/types/app"
import { useAuth } from "@/hooks/use-auth"
import { AssignGuestsDialog } from "./assign-guests-dialog"
import { EditActivityDialog } from "./edit-activity-dialog"

interface ActivityManagementProps {
  event: Event
  userRole: UserRole
}

export function ActivityManagement({ event, userRole }: ActivityManagementProps) {
  const { user, updateEvent } = useAuth()
  const [showAssignGuestsDialog, setShowAssignGuestsDialog] = useState(false)
  const [selectedActivityForAssignment, setSelectedActivityForAssignment] = useState<ActivityType | null>(null)
  const [showEditActivityDialog, setShowEditActivityDialog] = useState(false)
  const [selectedActivityForEdit, setSelectedActivityForEdit] = useState<ActivityType | null>(null)

  const canManageActivities = userRole === "Organizer"
  const canAssignGuests = userRole === "Organizer" || userRole === "Group Admin"

  const agreedDays: ProposedDay[] = useMemo(() => {
    return event.proposedDays.filter((day) => event.agreedDays.includes(day.id))
  }, [event.proposedDays, event.agreedDays])

  const handleOpenAssignGuests = useCallback((activity: ActivityType) => {
    setSelectedActivityForAssignment(activity)
    setShowAssignGuestsDialog(true)
  }, [])

  const handleSaveAssignedGuests = useCallback(
    (activityId: string, assignedGuestIds: string[]) => {
      const updatedActivities = event.activities.map((act) =>
        act.id === activityId ? { ...act, assignedGuestIds } : act,
      )
      updateEvent(event.id, { activities: updatedActivities })
    },
    [event, updateEvent],
  )

  const handleAddActivity = () => {
    setSelectedActivityForEdit(null)
    setShowEditActivityDialog(true)
  }

  const handleEditActivity = useCallback((activity: ActivityType) => {
    setSelectedActivityForEdit(activity)
    setShowEditActivityDialog(true)
  }, [])

  const handleSaveActivity = useCallback(
    (activityId: string | null, updates: Partial<ActivityType>) => {
      let updatedActivities: ActivityType[]
      if (activityId) {
        updatedActivities = event.activities.map((act) => (act.id === activityId ? { ...act, ...updates } : act))
      } else {
        const newActivity: ActivityType = {
          id: `act-${Date.now()}`,
          name: updates.name || "New Activity",
          description: updates.description || "",
          date: updates.date || "",
          time: updates.time || "",
          assignedGuestIds: [],
        }
        updatedActivities = [...event.activities, newActivity]
      }
      updateEvent(event.id, { activities: updatedActivities })
      setShowEditActivityDialog(false)
    },
    [event, updateEvent],
  )

  const handleDeleteActivity = useCallback(
    (activityId: string) => {
      const updatedActivities = event.activities.filter((activity) => activity.id !== activityId)
      updateEvent(event.id, { activities: updatedActivities })
    },
    [event, updateEvent],
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Planned Activities
              </CardTitle>
              <CardDescription>Manage and assign guests to activities for the event.</CardDescription>
            </div>
            {canManageActivities && (
              <Button size="sm" onClick={handleAddActivity}>
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {event.activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activities planned yet.</p>
          ) : (
            <div className="space-y-4">
              {event.activities
                .slice()
                .sort((a, b) => {
                  const dateA = new Date(`${a.date}T${a.time || "00:00"}`)
                  const dateB = new Date(`${b.date}T${b.time || "00:00"}`)
                  return dateA.getTime() - dateB.getTime()
                })
                .map((activity) => {
                  const isDateAgreed = agreedDays.some((agreedDay) => agreedDay.date === activity.date)
                  const assignedGuests = activity.assignedGuestIds
                    .map((guestId) => event.guests.find((g) => g.id === guestId))
                    .filter(Boolean) as any[]

                  return (
                    <div key={activity.id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{activity.name}</h3>
                          {activity.description && <p className="text-sm text-gray-600 mt-1">{activity.description}</p>}
                          <div className="mt-2 text-sm text-gray-700 flex items-center">
                            <span className="font-medium">Date & Time:</span>&nbsp;
                            {activity.date ? new Date(activity.date).toLocaleDateString() : "Not set"} at{" "}
                            {activity.time || "Not set"}
                            {!isDateAgreed && activity.date && (
                              <Badge variant="destructive" className="ml-2 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" /> Not Agreed Day
                              </Badge>
                            )}
                          </div>
                          {assignedGuests.length > 0 && (
                            <div className="mt-2 text-sm text-gray-700 flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span className="font-medium">Assigned Guests:</span>&nbsp;
                              {assignedGuests.map((g) => g.name).join(", ")}
                            </div>
                          )}
                        </div>
                        {(canManageActivities || canAssignGuests) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canManageActivities && (
                                <DropdownMenuItem onClick={() => handleEditActivity(activity)}>
                                  <Pencil className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                              )}
                              {canAssignGuests && (
                                <DropdownMenuItem onClick={() => handleOpenAssignGuests(activity)}>
                                  <Users className="h-4 w-4 mr-2" /> Assign Guests
                                </DropdownMenuItem>
                              )}
                              {canManageActivities && (
                                <>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                        <Trash className="h-4 w-4 mr-2" /> Delete
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently remove "{activity.name}".
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteActivity(activity.id)}>
                                          Delete
                                        </AlertDialogAction>
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
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <AssignGuestsDialog
        open={showAssignGuestsDialog}
        onOpenChange={setShowAssignGuestsDialog}
        activity={selectedActivityForAssignment}
        allGuests={event.guests}
        groups={event.groups}
        userRole={userRole}
        currentUserId={user?.id}
        onSave={handleSaveAssignedGuests}
      />

      <EditActivityDialog
        open={showEditActivityDialog}
        onOpenChange={setShowEditActivityDialog}
        activity={selectedActivityForEdit}
        agreedDays={agreedDays}
        onSave={handleSaveActivity}
      />
    </div>
  )
}
