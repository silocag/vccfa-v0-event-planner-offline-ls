"use client"

import { useState, useMemo, useEffect } from "react"
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
import {
  Plus,
  Pencil,
  Trash,
  MoreVertical,
  MapPin,
  CheckCircle2,
  Users,
  Check,
  Clock,
  X,
  Lock,
  Unlock,
} from "lucide-react"
import type { Event, Location, UserRole, Guest } from "@/types/app"
import { useAuth } from "@/hooks/use-auth"
import { VoteSummary } from "./vote-summary"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { EditLocationDialog } from "./edit-location-dialog"

interface LocationManagementProps {
  event: Event
  userRole: UserRole
}

export function LocationManagement({ event, userRole }: LocationManagementProps) {
  const { user, updateEvent } = useAuth()
  const [selectedVoterGuestId, setSelectedVoterGuestId] = useState<string | null>(null)
  const [isEditLocationDialogOpen, setIsEditLocationDialogOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const canManage = userRole === "Organizer"

  const votersForSelection: Guest[] = useMemo(() => {
    if (!user || !event?.guests) return []
    const currentUserGuestEntry = event.guests.find((guest) => guest.userId === user.id)
    if (userRole === "Organizer") {
      return event.guests.filter((g) => g.userId)
    } else if (userRole === "Group Admin") {
      if (currentUserGuestEntry && currentUserGuestEntry.groupId) {
        return event.guests.filter((guest) => guest.groupId === currentUserGuestEntry.groupId && guest.userId)
      }
      return currentUserGuestEntry ? [currentUserGuestEntry] : []
    } else {
      return currentUserGuestEntry ? [currentUserGuestEntry] : []
    }
  }, [user, userRole, event?.guests])

  useEffect(() => {
    if (votersForSelection.length > 0 && !votersForSelection.find((v) => v.id === selectedVoterGuestId)) {
      const currentUserGuestEntry = event.guests.find((guest) => guest.userId === user?.id)
      setSelectedVoterGuestId(currentUserGuestEntry?.id || votersForSelection[0].id)
    }
  }, [votersForSelection, selectedVoterGuestId, user?.id, event.guests])

  const handleAddLocation = () => {
    setSelectedLocation(null)
    setIsEditLocationDialogOpen(true)
  }

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location)
    setIsEditLocationDialogOpen(true)
  }

  const handleSaveLocation = (locationId: string | null, updates: Partial<Location>) => {
    let updatedLocations: Location[]
    if (locationId) {
      updatedLocations = event.locations.map((loc) => (loc.id === locationId ? { ...loc, ...updates } : loc))
    } else {
      const newLocation: Location = {
        id: `loc-${Date.now()}`,
        name: updates.name || "New Location",
        address: updates.address || "",
      }
      updatedLocations = [...event.locations, newLocation]
    }
    updateEvent(event.id, { locations: updatedLocations })
    setIsEditLocationDialogOpen(false)
  }

  const handleDeleteLocation = (locationId: string) => {
    const updatedLocations = event.locations.filter((location) => location.id !== locationId)
    const updatedVotes = { ...event.votes }
    if (updatedVotes.locations) {
      Object.keys(updatedVotes.locations).forEach((guestId) => {
        if (updatedVotes.locations[guestId]) {
          delete updatedVotes.locations[guestId][locationId]
        }
      })
    }
    const updatedAgreedLocations = (event.agreedLocations ?? []).filter((id) => id !== locationId)
    updateEvent(event.id, {
      locations: updatedLocations,
      votes: updatedVotes,
      agreedLocations: updatedAgreedLocations,
    })
  }

  const toggleVotingLock = (category: keyof Event["votingLocked"]) => {
    if (!canManage) return
    updateEvent(event.id, {
      votingLocked: { ...event.votingLocked, [category]: !event.votingLocked[category] },
    })
  }

  const vote = (category: string, itemId: string, voteValue: "available" | "maybe" | "not-available") => {
    if (!selectedVoterGuestId) return
    const currentVotes = event.votes[category] || {}
    const voterVotes = currentVotes[selectedVoterGuestId] || {}
    updateEvent(event.id, {
      votes: {
        ...event.votes,
        [category]: {
          ...currentVotes,
          [selectedVoterGuestId]: { ...voterVotes, [itemId]: voteValue },
        },
      },
    })
  }

  const getGuestVote = (category: string, itemId: string) => {
    if (!selectedVoterGuestId) return null
    return event.votes[category]?.[selectedVoterGuestId]?.[itemId]
  }

  const toggleAgreed = (itemId: string) => {
    if (!canManage) return
    const currentAgreed = event.agreedLocations ?? []
    const isAgreed = currentAgreed.includes(itemId)
    const newAgreed = isAgreed ? currentAgreed.filter((id) => id !== itemId) : [...currentAgreed, itemId]
    updateEvent(event.id, { agreedLocations: newAgreed })
  }

  const ListVoteButtons = ({ category, itemId }: { category: string; itemId: string }) => {
    const guestVote = getGuestVote(category, itemId)
    const isLockedForCategory = event.votingLocked[category as keyof Event["votingLocked"]]
    const isDisabled = !selectedVoterGuestId || (isLockedForCategory && userRole !== "Organizer")

    if (isLockedForCategory && userRole !== "Organizer") {
      return <Badge variant="secondary">Voting Locked</Badge>
    }
    return (
      <div className="flex space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={guestVote === "available" ? "default" : "outline"}
                onClick={() => vote(category, itemId, "available")}
                className="px-2 bg-green-100 hover:bg-green-200 text-green-800 data-[state=active]:bg-green-500 data-[state=active]:text-white"
                data-state={guestVote === "available" ? "active" : "inactive"}
                disabled={isDisabled}
              >
                <Check className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Vote Available</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={guestVote === "maybe" ? "default" : "outline"}
                onClick={() => vote(category, itemId, "maybe")}
                className="px-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
                data-state={guestVote === "maybe" ? "active" : "inactive"}
                disabled={isDisabled}
              >
                <Clock className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Vote Maybe</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={guestVote === "not-available" ? "default" : "outline"}
                onClick={() => vote(category, itemId, "not-available")}
                className="px-2 bg-red-100 hover:bg-red-200 text-red-800 data-[state=active]:bg-red-500 data-[state=active]:text-white"
                data-state={guestVote === "not-available" ? "active" : "inactive"}
                disabled={isDisabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Vote Not Available</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {votersForSelection.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Voting As
            </CardTitle>
            <CardDescription>Select which guest you are voting for.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedVoterGuestId ?? ""} onValueChange={setSelectedVoterGuestId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a guest to vote as" />
              </SelectTrigger>
              <SelectContent>
                {votersForSelection.map((guest) => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.name}
                    {guest.userId === user?.id ? " (You)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Event Locations
                {event.votingLocked.locations && <Lock className="h-4 w-4 ml-2 text-gray-500" />}
              </CardTitle>
              <CardDescription>Vote on potential event locations</CardDescription>
            </div>
            <div className="flex space-x-2">
              {canManage && (
                <>
                  <Button variant="outline" size="sm" onClick={() => toggleVotingLock("locations")}>
                    {event.votingLocked.locations ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" onClick={handleAddLocation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {event.locations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No locations proposed yet</p>
          ) : (
            <div className="space-y-3">
              {event.locations.map((location) => (
                <div key={location.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium flex items-center">
                      {location.name}
                      {(event.agreedLocations ?? []).includes(location.id) && (
                        <Badge variant="default" className="ml-2 bg-green-500 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Agreed
                        </Badge>
                      )}
                    </p>
                    {location.address && <p className="text-sm text-gray-600">{location.address}</p>}
                    <VoteSummary category="locations" itemId={location.id} event={event} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <ListVoteButtons category="locations" itemId={location.id} />
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Location actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditLocation(location)}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleAgreed(location.id)}
                            className={`${(event.agreedLocations ?? []).includes(location.id) ? "text-red-600" : "text-green-600"}`}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {(event.agreedLocations ?? []).includes(location.id)
                              ? "Unmark as Agreed"
                              : "Mark as Agreed"}
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
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently remove "{location.name}" from the
                                  proposed locations and clear all votes for it.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteLocation(location.id)}>
                                  Remove Location
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditLocationDialog
        open={isEditLocationDialogOpen}
        onOpenChange={setIsEditLocationDialogOpen}
        location={selectedLocation}
        onSave={handleSaveLocation}
      />
    </div>
  )
}
