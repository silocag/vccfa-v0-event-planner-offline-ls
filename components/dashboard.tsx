"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { EventDetails } from "./event-details"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { EventCreationDialog } from "./event-creation-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Dashboard() {
  const { user, users, events, logout, switchUser, loading } = useAuth()
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [isEventCreationDialogOpen, setIsEventCreationDialogOpen] = useState(false)

  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      const userEvents = events.filter(
        (event) => event.organizerId === user?.id || event.guests.some((g) => g.userId === user?.id),
      )
      if (userEvents.length > 0) {
        setSelectedEventId(userEvents[0].id)
      }
    }
  }, [events, selectedEventId, user?.id])

  const selectedEvent = useMemo(() => {
    return events.find((event) => event.id === selectedEventId)
  }, [events, selectedEventId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <p>Please log in to view the dashboard.</p>
  }

  const userEvents = events.filter(
    (event) => event.organizerId === user.id || event.guests.some((g) => g.userId === user.id),
  )

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Welcome, {user.name}!</h1>
        <div className="flex items-center space-x-4">
          <Select onValueChange={switchUser} value={user.id}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Switch User" />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name} {u.id === user.id ? "(Current)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Your Events</h2>
        <Button onClick={() => setIsEventCreationDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" /> Create New Event
        </Button>
      </div>

      {userEvents.length === 0 ? (
        <Card className="w-full max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>No Events Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              It looks like you haven't created or been invited to any events.
            </p>
            <Button onClick={() => setIsEventCreationDialogOpen(true)}>Create Your First Event</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <Select value={selectedEventId || ""} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {userEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEvent ? (
            <EventDetails event={selectedEvent} />
          ) : (
            <Card className="w-full max-w-2xl mx-auto mt-8">
              <CardHeader>
                <CardTitle>Select an Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Please select an event from the dropdown above to view its details.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <EventCreationDialog open={isEventCreationDialogOpen} onOpenChange={setIsEventCreationDialogOpen} />
    </div>
  )
}
