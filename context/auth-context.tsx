"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, Event } from "@/types/app"

interface AuthContextType {
  user: User | null
  users: User[]
  events: Event[]
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  switchUser: (userId: string) => void
  createEvent: (event: Omit<Event, "id" | "organizerId" | "createdAt">) => void
  updateEvent: (eventId: string, updates: Partial<Event>) => void
  toggleAgreed: (eventId: string, category: "days" | "locations" | "accommodations", itemId: string) => void
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load data from localStorage
    const savedUsers = localStorage.getItem("event-planner-users")
    const savedEvents = localStorage.getItem("event-planner-events")
    const savedCurrentUser = localStorage.getItem("event-planner-current-user")

    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers)
      setUsers(parsedUsers)

      if (savedCurrentUser) {
        const currentUser = parsedUsers.find((u: User) => u.id === savedCurrentUser)
        if (currentUser) setUser(currentUser)
      }
    } else {
      // Initialize with demo users and events
      const demoUsers: User[] = [
        { id: "1", name: "Alice Johnson", email: "alice@example.com", password: "password" },
        { id: "2", name: "Bob Smith", email: "bob@example.com", password: "password" },
        { id: "3", name: "Carol Davis", email: "carol@example.com", password: "password" },
      ]
      setUsers(demoUsers)
      localStorage.setItem("event-planner-users", JSON.stringify(demoUsers))

      // Create demo events with comprehensive data
      const demoEvents: Event[] = [
        {
          id: "event-1",
          title: "Summer Team Retreat 2025",
          description:
            "Annual team building retreat in the mountains. Join us for hiking, team activities, and relaxation.",
          organizerId: "1", // Alice is organizer
          createdAt: "2025-01-15T10:00:00Z",
          dateRanges: [
            { start: "2025-07-14", end: "2025-07-17" }, // Updated date range
            { start: "2025-07-22", end: "2025-07-24" },
          ],
          guests: [
            {
              id: "guest-1",
              name: "Bob Smith",
              email: "bob@example.com",
              isOrganizer: false,
              isGroupAdmin: true,
              groupId: "group-1",
              preferences: {
                roomType: "single",
                bedType: "queen",
                foodPreferences: ["vegetarian"],
                breakfast: true,
                pets: false,
              },
            },
            {
              id: "guest-2",
              name: "Carol Davis",
              email: "carol@example.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: "group-1",
              preferences: {
                roomType: "double",
                bedType: "king",
                foodPreferences: ["gluten-free"],
                breakfast: true,
                pets: true,
              },
            },
            {
              id: "guest-3",
              name: "David Wilson",
              email: "david@example.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: "group-2",
              preferences: {
                roomType: "single",
                bedType: "double",
                foodPreferences: [],
                breakfast: false,
                pets: false,
              },
            },
            {
              id: "guest-4",
              name: "Emma Thompson",
              email: "emma@example.com",
              isOrganizer: false,
              isGroupAdmin: true,
              groupId: "group-2",
              preferences: {
                roomType: "suite",
                bedType: "king",
                foodPreferences: ["vegan", "lactose-free"],
                breakfast: true,
                pets: false,
              },
            },
            {
              id: "guest-5",
              name: "Frank Miller",
              email: "frank@example.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: undefined,
              preferences: {
                roomType: "double",
                bedType: "queen",
                foodPreferences: [],
                breakfast: true,
                pets: false,
              },
            },
            {
              id: "guest-6",
              name: "Grace Lee",
              email: "grace@example.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: undefined,
              preferences: {
                roomType: "single",
                bedType: "single",
                foodPreferences: ["pescatarian"],
                breakfast: false,
                pets: true,
              },
            },
          ],
          groups: [
            { id: "group-1", name: "Marketing Team", adminId: "guest-1" },
            { id: "group-2", name: "Engineering Team", adminId: "guest-4" },
          ],
          proposedDays: [
            { id: "day-1", date: "2025-07-14" },
            { id: "day-2", date: "2025-07-15" },
            { id: "day-3", date: "2025-07-16" },
            { id: "day-4", date: "2025-07-17" },
            { id: "day-5", date: "2025-07-22" },
            { id: "day-6", date: "2025-07-23" },
            { id: "day-7", date: "2025-07-24" },
          ],
          locations: [
            { id: "loc-1", name: "Mountain Resort Lodge", address: "123 Mountain View Dr, Aspen, CO" },
            { id: "loc-2", name: "Lakeside Conference Center", address: "456 Lake Shore Blvd, Tahoe, CA" },
            { id: "loc-3", name: "Forest Retreat Center", address: "789 Pine Tree Lane, Yellowstone, WY" },
          ],
          accommodations: [
            { id: "acc-1", name: "Grand Mountain Hotel", description: "Luxury hotel with spa and mountain views" },
            { id: "acc-2", name: "Cozy Cabins Resort", description: "Rustic cabins perfect for team bonding" },
            { id: "acc-3", name: "Lakeside Inn", description: "Charming inn with lake access and activities" },
          ],
          activities: [
            {
              id: "act-1",
              name: "Team Hiking",
              description: "Guided hike through scenic trails",
              date: "2025-07-15",
              time: "09:00",
            },
            {
              id: "act-2",
              name: "BBQ Dinner",
              description: "Outdoor barbecue and team socializing",
              date: "2025-07-15",
              time: "18:00",
            },
            {
              id: "act-3",
              name: "Workshop: Innovation",
              description: "Creative thinking and innovation workshop",
              date: "2025-07-16",
              time: "10:00",
            },
          ],
          votes: {
            days: {
              "1": { "day-1": "available", "day-2": "available", "day-3": "maybe", "day-4": "not-available" },
              "2": { "day-1": "available", "day-2": "maybe", "day-3": "available", "day-4": "available" },
              "3": { "day-1": "maybe", "day-2": "available", "day-3": "available", "day-4": "maybe" },
            },
            locations: {
              "1": { "loc-1": "available", "loc-2": "maybe", "loc-3": "not-available" },
              "2": { "loc-1": "available", "loc-2": "available", "loc-3": "maybe" },
              "3": { "loc-1": "maybe", "loc-2": "available", "loc-3": "available" },
            },
            accommodations: {
              "1": { "acc-1": "available", "acc-2": "maybe", "acc-3": "available" },
              "2": { "acc-1": "maybe", "acc-2": "available", "acc-3": "available" },
              "3": { "acc-1": "available", "acc-2": "available", "acc-3": "maybe" },
            },
          },
          votingLocked: {
            days: false,
            locations: false,
            accommodations: false,
            activities: false,
          },
          agreedDays: [],
          agreedLocations: [],
          agreedAccommodations: [],
        },
        {
          id: "event-2",
          title: "Product Launch Party",
          description: "Celebrating our new product launch with clients and team members.",
          organizerId: "2", // Bob is organizer
          createdAt: "2025-02-01T14:30:00Z",
          dateRanges: [{ start: "2025-08-10", end: "2025-08-10" }],
          guests: [
            {
              id: "guest-7",
              name: "Alice Johnson",
              email: "alice@example.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: "group-3",
              preferences: {
                roomType: "single",
                bedType: "queen",
                foodPreferences: [],
                breakfast: true,
                pets: false,
              },
            },
            {
              id: "guest-8",
              name: "Carol Davis",
              email: "carol@example.com",
              isOrganizer: false,
              isGroupAdmin: true,
              groupId: "group-3",
              preferences: {
                roomType: "double",
                bedType: "king",
                foodPreferences: ["vegetarian"],
                breakfast: false,
                pets: false,
              },
            },
            {
              id: "guest-9",
              name: "John Client",
              email: "john@client.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: "group-4",
              preferences: {
                roomType: "suite",
                bedType: "king",
                foodPreferences: [],
                breakfast: true,
                pets: false,
              },
            },
            {
              id: "guest-10",
              name: "Sarah Partner",
              email: "sarah@partner.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: "group-4",
              preferences: {
                roomType: "double",
                bedType: "queen",
                foodPreferences: ["gluten-free"],
                breakfast: true,
                pets: true,
              },
            },
          ],
          groups: [
            { id: "group-3", name: "Internal Team", adminId: "guest-8" },
            { id: "group-4", name: "External Partners", adminId: undefined },
          ],
          proposedDays: [{ id: "day-8", date: "2025-08-10" }],
          locations: [
            { id: "loc-4", name: "Downtown Event Hall", address: "100 Main St, San Francisco, CA" },
            { id: "loc-5", name: "Rooftop Venue", address: "200 Sky Tower, San Francisco, CA" },
          ],
          accommodations: [
            { id: "acc-4", name: "City Center Hotel", description: "Modern hotel in the heart of downtown" },
          ],
          activities: [
            {
              id: "act-4",
              name: "Product Demo",
              description: "Live demonstration of new features",
              date: "2025-08-10",
              time: "15:00",
            },
            {
              id: "act-5",
              name: "Networking Reception",
              description: "Cocktails and networking",
              date: "2025-08-10",
              time: "17:00",
            },
          ],
          votes: {
            days: {
              "2": { "day-8": "available" },
              "1": { "day-8": "available" },
              "3": { "day-8": "maybe" },
            },
            locations: {
              "2": { "loc-4": "available", "loc-5": "maybe" },
              "1": { "loc-4": "maybe", "loc-5": "available" },
              "3": { "loc-4": "available", "loc-5": "available" },
            },
          },
          votingLocked: {
            days: true,
            locations: false,
            accommodations: false,
            activities: false,
          },
          agreedDays: [],
          agreedLocations: [],
          agreedAccommodations: [],
        },
        {
          id: "event-3",
          title: "Weekend Family Reunion",
          description: "Annual family gathering with activities for all ages.",
          organizerId: "3", // Carol is organizer
          createdAt: "2025-03-10T09:15:00Z",
          dateRanges: [{ start: "2025-09-14", end: "2025-09-15" }],
          guests: [
            {
              id: "guest-11",
              name: "Alice Johnson",
              email: "alice@example.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: undefined,
              preferences: {
                roomType: "double",
                bedType: "queen",
                foodPreferences: [],
                breakfast: true,
                pets: false,
              },
            },
            {
              id: "guest-12",
              name: "Bob Smith",
              email: "bob@example.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: undefined,
              preferences: {
                roomType: "single",
                bedType: "single",
                foodPreferences: ["lactose-free"],
                breakfast: false,
                pets: true,
              },
            },
          ],
          groups: [],
          proposedDays: [
            { id: "day-9", date: "2025-09-14" },
            { id: "day-10", date: "2025-09-15" },
          ],
          locations: [{ id: "loc-6", name: "Community Center", address: "500 Community Dr, Austin, TX" }],
          accommodations: [],
          activities: [],
          votes: {},
          votingLocked: {
            days: false,
            locations: false,
            accommodations: false,
            activities: false,
          },
          agreedDays: [],
          agreedLocations: [],
          agreedAccommodations: [],
        },
      ]

      setEvents(demoEvents)
      localStorage.setItem("event-planner-events", JSON.stringify(demoEvents))
    }

    if (savedEvents) {
      setEvents(JSON.parse(savedEvents))
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = users.find((u) => u.email === email && u.password === password)
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("event-planner-current-user", foundUser.id)
      return true
    }
    return false
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    if (users.find((u) => u.email === email)) {
      return false // User already exists
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password,
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem("event-planner-users", JSON.stringify(updatedUsers))
    setUser(newUser)
    localStorage.setItem("event-planner-current-user", newUser.id)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("event-planner-current-user")
  }

  const switchUser = (userId: string) => {
    const foundUser = users.find((u) => u.id === userId)
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("event-planner-current-user", foundUser.id)
    }
  }

  const createEvent = (eventData: Omit<Event, "id" | "organizerId" | "createdAt">) => {
    if (!user) return

    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      organizerId: user.id,
      createdAt: new Date().toISOString(),
      guests: [],
      groups: [],
      proposedDays: [],
      locations: [],
      accommodations: [],
      activities: [],
      votes: {},
      votingLocked: {
        days: false,
        locations: false,
        accommodations: false,
        activities: false,
      },
      agreedDays: [],
      agreedLocations: [],
      agreedAccommodations: [],
    }

    const updatedEvents = [...events, newEvent]
    setEvents(updatedEvents)
    localStorage.setItem("event-planner-events", JSON.stringify(updatedEvents))
  }

  const updateEvent = (eventId: string, updates: Partial<Event>) => {
    const updatedEvents = events.map((event) => (event.id === eventId ? { ...event, ...updates } : event))
    setEvents(updatedEvents)
    localStorage.setItem("event-planner-events", JSON.stringify(updatedEvents))
  }

  const toggleAgreed = (eventId: string, category: "days" | "locations" | "accommodations", itemId: string) => {
    const updatedEvents = events.map((event) => {
      if (event.id === eventId) {
        const agreedKey = `agreed${category.charAt(0).toUpperCase() + category.slice(1)}` as
          | "agreedDays"
          | "agreedLocations"
          | "agreedAccommodations"
        const currentAgreed = event[agreedKey] as string[]
        const isAgreed = currentAgreed.includes(itemId)
        const newAgreed = isAgreed ? currentAgreed.filter((id) => id !== itemId) : [...currentAgreed, itemId]

        return {
          ...event,
          [agreedKey]: newAgreed,
        }
      }
      return event
    })
    setEvents(updatedEvents)
    localStorage.setItem("event-planner-events", JSON.stringify(updatedEvents))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        events,
        login,
        register,
        logout,
        switchUser,
        createEvent,
        updateEvent,
        toggleAgreed,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
