"use client"

import { useState, useMemo, useCallback } from "react"
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
import {
  Plus,
  Pencil,
  Trash,
  MoreVertical,
  BedSingle,
  XCircle,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
} from "lucide-react"
import type { Event, Accommodation, Guest, UserRole, Bed } from "@/types/app"
import { useAuth } from "@/hooks/use-auth"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EditAccommodationDialog } from "./edit-accommodation-dialog"

interface AccommodationManagementProps {
  event: Event
  userRole: UserRole
}

const ItemTypes = {
  GUEST: "guest",
}

interface DraggableGuestProps {
  guest: Guest
}

const DraggableGuest = ({ guest }: DraggableGuestProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.GUEST,
    item: { guestId: guest.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const bedPreference = guest.preferences?.bedType ? `(${guest.preferences.bedType.charAt(0).toUpperCase()})` : ""

  return (
    <div
      ref={drag}
      className={`cursor-grab rounded-md px-2 py-1 text-sm font-medium ${
        isDragging ? "opacity-50 border-dashed border-2 border-blue-500" : "bg-blue-100 text-blue-800"
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {guest.name} {bedPreference && <span className="ml-1 text-xs text-gray-600">{bedPreference}</span>}
    </div>
  )
}

const BedSlot = ({
  bed,
  onDropGuest,
  onUnassignGuest,
  canManage,
  guestsById,
}: {
  bed: Bed & { assignedGuests?: Guest[] }
  onDropGuest: (guestId: string, bedId: string) => void
  onUnassignGuest: (guestId: string) => void
  canManage: boolean
  guestsById: Map<string, Guest>
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.GUEST,
    drop: (item: { guestId: string }) => onDropGuest(item.guestId, bed.id),
    canDrop: (item: { guestId: string }) => {
      const currentAssignedIds = bed.assignedGuestIds || []
      // If the guest is already assigned to this specific bed, allow drop (no-op)
      if (currentAssignedIds.includes(item.guestId)) return true

      if (bed.type === "double") {
        // For double beds, allow drop if there's space (less than 2 guests)
        return currentAssignedIds.length < 2
      } else {
        // For single beds, allow drop only if empty
        return currentAssignedIds.length === 0
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  const isActive = isOver && canDrop

  const getPreferenceStatus = (guest: Guest, bedType: Bed["type"]) => {
    if (!guest.preferences) {
      return { status: "unknown", details: ["No preferences set."] }
    }

    const details: string[] = []
    let isBedTypeFulfilled = false

    if (guest.preferences.bedType) {
      if (guest.preferences.bedType === bedType) {
        details.push(`Preferred bed type (${guest.preferences.bedType}) fulfilled.`)
        isBedTypeFulfilled = true
      } else {
        details.push(`Preferred bed type (${guest.preferences.bedType}) not fulfilled by ${bedType}.`)
      }
    } else {
      details.push("No specific bed type preference.")
    }

    if (isBedTypeFulfilled) {
      return { status: "fulfilled", details }
    } else if (guest.preferences.bedType) {
      return { status: "unfulfilled", details }
    } else {
      return { status: "unknown", details: ["No relevant preferences set."] }
    }
  }

  return (
    <div
      ref={drop}
      className={`relative flex flex-col justify-center min-h-[64px] border rounded-md p-2 transition-colors ${
        isActive ? "bg-green-100 border-green-500" : canDrop ? "bg-blue-50 border-blue-300" : "bg-gray-50"
      }`}
    >
      <div className="flex items-center text-sm text-gray-600 mb-1">
        <BedSingle className="h-4 w-4 mr-2 text-gray-500" />
        <span>
          {bed.type} {bed.notes && `(${bed.notes})`}
        </span>
      </div>
      {bed.assignedGuests && bed.assignedGuests.length > 0 ? (
        <div className="flex flex-col items-start w-full space-y-1">
          {bed.assignedGuests.map((assignedGuest) => {
            const preferenceStatus = getPreferenceStatus(assignedGuest, bed.type)
            return (
              <div key={assignedGuest.id} className="flex items-center justify-between w-full">
                <DraggableGuest guest={assignedGuest} />
                <div className="flex items-center ml-2">
                  {/* Preference Icons */}
                  {preferenceStatus?.status === "fulfilled" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          {preferenceStatus.details.map((d, i) => (
                            <p key={i}>{d}</p>
                          ))}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {preferenceStatus?.status === "unfulfilled" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <XCircle className="h-4 w-4 text-red-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          {preferenceStatus.details.map((d, i) => (
                            <p key={i}>{d}</p>
                          ))}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {preferenceStatus?.status === "unknown" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          {preferenceStatus.details.map((d, i) => (
                            <p key={i}>{d}</p>
                          ))}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-600 ml-1"
                      onClick={() => onUnassignGuest(assignedGuest.id)}
                    >
                      <MinusCircle className="h-4 w-4" />
                      <span className="sr-only">Unassign guest</span>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <span className="text-gray-400 text-xs">Drag guest here</span>
      )}
    </div>
  )
}

function AccommodationManagementComponent({ event, userRole }: AccommodationManagementProps) {
  const { updateEvent } = useAuth()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null)

  const canManage = userRole === "Organizer"

  const assignedGuestIds = useMemo(() => {
    const ids = new Set<string>()
    event.accommodations.forEach((acc) => {
      acc.rooms.forEach((room) => {
        room.beds.forEach((bed) => {
          if (bed.assignedGuestIds) {
            bed.assignedGuestIds.forEach((guestId) => ids.add(guestId))
          }
        })
      })
    })
    return ids
  }, [event.accommodations])

  const unassignedGuests = useMemo(() => {
    return event.guests.filter((guest) => !assignedGuestIds.has(guest.id))
  }, [event.guests, assignedGuestIds])

  const guestsById = useMemo(() => {
    return new Map(event.guests.map((g) => [g.id, g]))
  }, [event.guests])

  const handleAddAccommodation = () => {
    setSelectedAccommodation(null)
    setIsEditDialogOpen(true)
  }

  const handleEditAccommodation = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation)
    setIsEditDialogOpen(true)
  }

  const handleSaveAccommodation = (accId: string | null, updates: Partial<Accommodation>) => {
    let updatedAccommodations: Accommodation[]
    if (accId) {
      updatedAccommodations = event.accommodations.map((acc) => (acc.id === accId ? { ...acc, ...updates } : acc))
    } else {
      const newAccommodation: Accommodation = {
        id: `acc-${Date.now()}`,
        name: updates.name || "New Accommodation",
        description: updates.description || "",
        rooms: updates.rooms || [],
      }
      updatedAccommodations = [...event.accommodations, newAccommodation]
    }
    updateEvent(event.id, { accommodations: updatedAccommodations })
    setIsEditDialogOpen(false)
  }

  const handleDeleteAccommodation = (accommodationId: string) => {
    const updatedAccommodations = event.accommodations.filter((acc) => acc.id !== accommodationId)
    updateEvent(event.id, { accommodations: updatedAccommodations })
  }

  const handleGuestAssignment = useCallback(
    (guestId: string, targetBedId: string, targetRoomId: string, targetAccommodationId: string) => {
      const updatedAccommodations = event.accommodations.map((acc) => {
        return {
          ...acc,
          rooms: acc.rooms.map((room) => {
            return {
              ...room,
              beds: room.beds.map((bed) => {
                let newAssignedGuestIds = bed.assignedGuestIds ? [...bed.assignedGuestIds] : []

                // 1. Remove guest from any bed they are currently assigned to
                if (newAssignedGuestIds.includes(guestId)) {
                  newAssignedGuestIds = newAssignedGuestIds.filter((id) => id !== guestId)
                }

                // 2. Assign guest to the target bed
                if (bed.id === targetBedId && room.id === targetRoomId && acc.id === targetAccommodationId) {
                  // Only add if there's space and the guest isn't already there
                  if (!newAssignedGuestIds.includes(guestId)) {
                    if (bed.type === "double" && newAssignedGuestIds.length < 2) {
                      newAssignedGuestIds.push(guestId)
                    } else if (bed.type !== "double" && newAssignedGuestIds.length === 0) {
                      newAssignedGuestIds.push(guestId)
                    }
                  }
                }

                return { ...bed, assignedGuestIds: newAssignedGuestIds.length > 0 ? newAssignedGuestIds : undefined }
              }),
            }
          }),
        }
      })
      updateEvent(event.id, { accommodations: updatedAccommodations })
    },
    [event.id, event.accommodations, updateEvent],
  )

  const handleUnassignGuest = useCallback(
    (guestId: string) => {
      const updatedAccommodations = event.accommodations.map((acc) => ({
        ...acc,
        rooms: acc.rooms.map((room) => ({
          ...room,
          beds: room.beds.map((bed) => ({
            ...bed,
            assignedGuestIds: bed.assignedGuestIds?.filter((id) => id !== guestId),
          })),
        })),
      }))
      updateEvent(event.id, { accommodations: updatedAccommodations })
    },
    [event.id, event.accommodations, updateEvent],
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle>Guests to Assign</CardTitle>
          <CardDescription>Drag guests to a bed.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 overflow-y-auto pr-2">
          {unassignedGuests.length === 0 ? (
            <p className="text-gray-500 text-sm">All guests assigned.</p>
          ) : (
            unassignedGuests.map((guest) => <DraggableGuest key={guest.id} guest={guest} />)
          )}
        </CardContent>
      </Card>

      <div className="lg:col-span-3 flex flex-col space-y-6">
        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Accommodations</CardTitle>
                <CardDescription>Manage accommodation details and assign guests.</CardDescription>
              </div>
              {canManage && (
                <Button size="sm" onClick={handleAddAccommodation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Accommodation
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto pr-2">
            {event.accommodations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No accommodations added yet.</p>
            ) : (
              <div className="space-y-8">
                {event.accommodations.map((accommodation) => (
                  <div key={accommodation.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{accommodation.name}</h3>
                        {accommodation.description && (
                          <p className="text-sm text-gray-600">{accommodation.description}</p>
                        )}
                      </div>
                      {canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditAccommodation(accommodation)}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
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
                                    This will remove "{accommodation.name}" and unassign all guests.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteAccommodation(accommodation.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {accommodation.rooms.map((room) => (
                      <div key={room.id} className="border rounded-md p-3 bg-gray-50 mt-4">
                        <h4 className="font-medium mb-3">
                          {room.name || "Unnamed Room"} ({room.type})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {room.beds.map((bed) => (
                            <BedSlot
                              key={bed.id}
                              bed={{
                                ...bed,
                                assignedGuests: bed.assignedGuestIds
                                  ?.map((id) => guestsById.get(id))
                                  .filter(Boolean) as Guest[],
                              }}
                              onDropGuest={(guestId) =>
                                handleGuestAssignment(guestId, bed.id, room.id, accommodation.id)
                              }
                              onUnassignGuest={handleUnassignGuest}
                              canManage={canManage}
                              guestsById={guestsById}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <EditAccommodationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        accommodation={selectedAccommodation}
        onSave={handleSaveAccommodation}
      />
    </div>
  )
}

export function AccommodationManagement(props: AccommodationManagementProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <AccommodationManagementComponent {...props} />
    </DndProvider>
  )
}
