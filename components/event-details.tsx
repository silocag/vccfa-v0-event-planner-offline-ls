"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { SettingsIcon, Share2Icon } from "lucide-react"
import { EventOverview } from "./event-overview"
import { GuestManagement } from "./guest-management"
import { CalendarVoting } from "./calendar-voting"
import { LocationManagement } from "./location-management"
import { AccommodationManagement } from "./accommodation-management"
import { ActivityManagement } from "./activity-management"
import { useAuth } from "@/hooks/use-auth"
import type { Event, UserRole } from "@/types/app"
import { EditEventDialog } from "./edit-event-dialog"
import { ConfirmDialog } from "./confirm-dialog"
import { ShareEventDialog } from "./share-event-dialog"

interface EventDetailsProps {
  event: Event
}

export function EventDetails({ event }: EventDetailsProps) {
  const { user, updateEvent } = useAuth()

  const userRole: UserRole = useMemo(() => {
    if (!user) return "Guest"
    if (user.id === event.organizerId) return "Organizer"

    const guestEntry = event.guests.find((g) => g.userId === user.id)
    if (guestEntry?.isGroupAdmin) return "Group Admin"

    return "Guest"
  }, [user, event])

  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false)
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false)
  const [isShareEventDialogOpen, setIsShareEventDialogOpen] = useState(false)

  const handleSaveEventDetails = (updates: Partial<Event>) => {
    updateEvent(event.id, updates)
    setIsEditEventDialogOpen(false)
  }

  const handleDeleteEvent = () => {
    // In a real app, this would be an API call. Here we filter the state.
    // The context/provider would need a `deleteEvent` method.
    // For now, this dialog will just close. A full implementation is out of scope.
    console.log(`Deleting event ${event.id}`)
    setIsConfirmDeleteDialogOpen(false)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        {userRole === "Organizer" && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsShareEventDialogOpen(true)}>
              <Share2Icon className="h-4 w-4 mr-2" /> Share
            </Button>
            <Button variant="outline" onClick={() => setIsEditEventDialogOpen(true)}>
              <SettingsIcon className="h-4 w-4 mr-2" /> Edit Event
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="py-4">
          <EventOverview event={event} userRole={userRole} />
        </TabsContent>
        <TabsContent value="calendar" className="py-4">
          <CalendarVoting event={event} userRole={userRole} />
        </TabsContent>
        <TabsContent value="guests" className="py-4">
          <GuestManagement event={event} userRole={userRole} />
        </TabsContent>
        <TabsContent value="locations" className="py-4">
          <LocationManagement event={event} userRole={userRole} />
        </TabsContent>
        <TabsContent value="accommodations" className="py-4">
          <AccommodationManagement event={event} userRole={userRole} />
        </TabsContent>
        <TabsContent value="activities" className="py-4">
          <ActivityManagement event={event} userRole={userRole} />
        </TabsContent>
      </Tabs>

      <EditEventDialog
        isOpen={isEditEventDialogOpen}
        onOpenChange={setIsEditEventDialogOpen}
        event={event}
        onSave={handleSaveEventDetails}
        onDeleteClick={() => setIsConfirmDeleteDialogOpen(true)}
      />
      <ConfirmDialog
        isOpen={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={handleDeleteEvent}
      />
      <ShareEventDialog
        isOpen={isShareEventDialogOpen}
        onOpenChange={setIsShareEventDialogOpen}
        event={event}
        userRole={userRole}
      />
    </div>
  )
}
