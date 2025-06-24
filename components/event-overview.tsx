"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Home, Activity, Info } from "lucide-react"
import type { Event, UserRole } from "@/types/app"
import { useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"

interface EventOverviewProps {
  event: Event
  userRole: UserRole
}

export function EventOverview({ event, userRole }: EventOverviewProps) {
  const agreedDaysDates = useMemo(() => {
    return event.proposedDays
      .filter((day) => event.agreedDays.includes(day.id))
      .map((day) => new Date(day.date))
      .sort((a, b) => a.getTime() - b.getTime())
  }, [event.proposedDays, event.agreedDays])

  const agreedLocations = useMemo(() => {
    return event.locations.filter((loc) => event.agreedLocations.includes(loc.id))
  }, [event.locations, event.agreedLocations])

  const agreedAccommodations = useMemo(() => {
    return event.accommodations.filter((acc) => event.agreedAccommodations.includes(acc.id))
  }, [event.accommodations, event.agreedAccommodations])

  const totalGuests = event.guests.length
  const totalActivities = event.activities.length

  const { users } = useAuth()

  const organizerName = useMemo(() => {
    const organizer = users.find((u) => u.id === event.organizerId)
    return organizer ? organizer.name : "Unknown"
  }, [users, event.organizerId])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Event Details
          </CardTitle>
          <CardDescription>General information about the event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <h4 className="font-medium">Description:</h4>
            <p className="text-sm text-gray-600">{event.description || "No description provided."}</p>
          </div>
          {event.generalNotes && (
            <div>
              <h4 className="font-medium">General Notes:</h4>
              <p className="text-sm text-gray-600">{event.generalNotes}</p>
            </div>
          )}
          <div>
            <h4 className="font-medium">Organizer:</h4>
            <p className="text-sm text-gray-600">{organizerName}</p>
          </div>
          <div>
            <h4 className="font-medium">Your Role:</h4>
            <Badge variant={userRole === "Organizer" ? "default" : "secondary"}>{userRole}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Agreed Days
          </CardTitle>
          <CardDescription>The days that have been agreed upon for the event.</CardDescription>
        </CardHeader>
        <CardContent>
          {agreedDaysDates.length === 0 ? (
            <p className="text-gray-500">No days agreed yet.</p>
          ) : (
            <div className="space-y-2">
              {agreedDaysDates.map((date, index) => (
                <div key={index} className="flex items-center text-sm text-gray-700">
                  <Badge variant="outline" className="mr-2">
                    {date.toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Agreed Locations
          </CardTitle>
          <CardDescription>The locations that have been agreed upon for the event.</CardDescription>
        </CardHeader>
        <CardContent>
          {agreedLocations.length === 0 ? (
            <p className="text-gray-500">No locations agreed yet.</p>
          ) : (
            <div className="space-y-2">
              {agreedLocations.map((location) => (
                <div key={location.id} className="flex items-center text-sm text-gray-700">
                  <Badge variant="outline" className="mr-2">
                    {location.name}
                  </Badge>
                  {location.address && <span className="text-gray-500">{location.address}</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="h-5 w-5 mr-2" />
            Agreed Accommodations
          </CardTitle>
          <CardDescription>The accommodations that have been agreed upon for the event.</CardDescription>
        </CardHeader>
        <CardContent>
          {agreedAccommodations.length === 0 ? (
            <p className="text-gray-500">No accommodations agreed yet.</p>
          ) : (
            <div className="space-y-2">
              {agreedAccommodations.map((accommodation) => (
                <div key={accommodation.id} className="flex items-center text-sm text-gray-700">
                  <Badge variant="outline" className="mr-2">
                    {accommodation.name}
                  </Badge>
                  {accommodation.description && <span className="text-gray-500">{accommodation.description}</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Guests
          </CardTitle>
          <CardDescription>Total number of guests attending the event.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalGuests}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Activities
          </CardTitle>
          <CardDescription>Total number of planned activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalActivities}</p>
        </CardContent>
      </Card>
    </div>
  )
}
