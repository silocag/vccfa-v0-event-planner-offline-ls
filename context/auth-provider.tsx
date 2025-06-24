"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, Event } from "@/types/app" // Import Guest type

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

    let initialUsers: User[] = []
    if (savedUsers) {
      initialUsers = JSON.parse(savedUsers)
      setUsers(initialUsers)
    } else {
      // Initialize with demo users
      const demoUsers: User[] = [
        { id: "user-1", name: "Alice Johnson", email: "alice@example.com", password: "password" },
        { id: "user-2", name: "Bob Smith", email: "bob@example.com", password: "password" },
        { id: "user-3", name: "Carol Davis", email: "carol@example.com", password: "password" },
      ]
      initialUsers = demoUsers
      setUsers(demoUsers)
      localStorage.setItem("event-planner-users", JSON.stringify(demoUsers))
    }

    if (savedCurrentUser) {
      const currentUser = initialUsers.find((u: User) => u.id === savedCurrentUser)
      if (currentUser) setUser(currentUser)
    }

    let initialEvents: Event[] = []
    if (savedEvents) {
      // Ensure new properties are present when loading from localStorage
      const parsedEvents = JSON.parse(savedEvents).map((event: Event) => ({
        ...event,
        agreedDays: event.agreedDays || [],
        agreedLocations: event.agreedLocations || [],
        agreedAccommodations: event.agreedAccommodations || [],
        // Ensure guests have userId if they match a user and default preferences
        guests: event.guests.map((guest) => {
          const matchingUser = initialUsers.find((u) => u.email === guest.email)
          return {
            ...guest,
            userId: matchingUser ? matchingUser.id : guest.userId,
            preferences: guest.preferences || {
              roomType: "",
              bedType: "",
              childrenBeds: 0,
              animals: "",
              foodPreferences: [],
              generalNotes: "",
            },
            assignedRoomId: guest.assignedRoomId || undefined, // Initialize new field
            assignedBedId: guest.assignedBedId || undefined, // Initialize new field
          }
        }),
        // Migrate votes from userId to guestId if necessary (for old data)
        votes: Object.fromEntries(
          Object.entries(event.votes || {}).map(([category, userVotes]) => [
            category,
            Object.fromEntries(
              Object.entries(userVotes as { [userId: string]: any }).map(([userId, itemVotes]) => {
                const guestForUser = event.guests.find((g) => g.userId === userId)
                return [guestForUser ? guestForUser.id : userId, itemVotes] // Use guest.id if found, otherwise keep userId (for unlinked old data)
              }),
            ),
          ]),
        ),
        // Ensure activities have assignedGuestIds
        activities: event.activities.map((activity) => ({
          ...activity,
          assignedGuestIds: activity.assignedGuestIds || [],
        })),
        // Ensure accommodations have new fields and structured rooms
        accommodations: event.accommodations.map((acc) => ({
          ...acc,
          rooms:
            acc.rooms?.map((room) => ({
              ...room,
              beds: room.beds?.map((bed) => ({ ...bed, assignedGuestId: bed.assignedGuestId || undefined })) || [],
            })) || [], // Initialize rooms array and beds within
          childrenBedsAvailable: acc.childrenBedsAvailable || false,
          allowsAnimals: acc.allowsAnimals || false,
          foodServices: acc.foodServices || [],
          dietaryOptions: acc.dietaryOptions || [],
          generalNotes: acc.generalNotes || "", // Initialize generalNotes
          // Remove old fields if they exist in localStorage
          totalRooms: undefined,
          availableRoomTypesDescription: undefined,
          availableBedTypesDescription: undefined,
          conferenceRoomsDescription: undefined,
        })),
      }))
      initialEvents = parsedEvents
      setEvents(parsedEvents)
    } else {
      // Create demo events with comprehensive data
      const demoEvents: Event[] = [
        {
          id: "event-1",
          title: "Summer Team Retreat 2025",
          description:
            "Annual team building retreat in the mountains. Join us for hiking, team activities, and relaxation.",
          organizerId: "user-1", // Alice is organizer
          createdAt: "2025-01-15T10:00:00Z",
          dateRanges: [
            { start: "2025-07-14", end: "2025-07-17" },
            { start: "2025-07-22", end: "2025-07-24" },
          ],
          guests: [
            {
              id: "guest-1",
              name: "Alice Johnson",
              email: "alice@example.com",
              isOrganizer: true, // Alice is organizer and a guest
              isGroupAdmin: false,
              groupId: undefined,
              userId: "user-1", // Linked to Alice's user account
              preferences: {
                roomType: "single",
                bedType: "queen",
                foodPreferences: ["vegetarian"],
                childrenBeds: 0,
                animals: "",
                generalNotes: "Organizer, prefers quiet room.",
              },
              assignedRoomId: "room-1-1", // Pre-assigned for demo
              assignedBedId: "bed-1-1-1", // Pre-assigned for demo
            },
            {
              id: "guest-2",
              name: "Bob Smith",
              email: "bob@example.com",
              isOrganizer: false,
              isGroupAdmin: true,
              groupId: "group-1",
              userId: "user-2", // Linked to Bob's user account
              preferences: {
                roomType: "double",
                bedType: "king",
                foodPreferences: ["gluten-free"],
                childrenBeds: 1,
                animals: "dog",
                generalNotes: "Bringing a small dog, needs pet-friendly accommodation.",
              },
              assignedRoomId: "room-2-1", // Pre-assigned for demo
              assignedBedId: "bed-2-1-1", // Pre-assigned for demo
            },
            {
              id: "guest-3",
              name: "Carol Davis",
              email: "carol@example.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: "group-1",
              userId: "user-3", // Linked to Carol's user account
              preferences: {
                roomType: "double",
                bedType: "queen",
                foodPreferences: ["vegan"],
                childrenBeds: 0,
                animals: "",
                generalNotes: "No breakfast needed.",
              },
              assignedRoomId: "room-1-2", // Pre-assigned for demo
              assignedBedId: "bed-1-2-1", // Pre-assigned for demo
            },
            {
              id: "guest-4",
              name: "David Wilson",
              email: "david@example.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: "group-2",
              userId: undefined, // Not linked to a user account
              preferences: {
                roomType: "single",
                bedType: "double",
                foodPreferences: [],
                childrenBeds: 0,
                animals: "",
                generalNotes: "",
              },
            },
            {
              id: "guest-5",
              name: "Emma Thompson",
              email: "emma@example.com",
              isOrganizer: false,
              isGroupAdmin: true,
              groupId: "group-2",
              userId: undefined, // Not linked to a user account
              preferences: {
                roomType: "suite",
                bedType: "king",
                foodPreferences: ["lactose-free"],
                childrenBeds: 2,
                animals: "",
                generalNotes: "Needs two children's beds.",
              },
            },
            {
              id: "guest-6",
              name: "Frank Miller",
              email: "frank@example.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: undefined,
              userId: undefined, // Not linked to a user account
              preferences: {
                roomType: "double",
                bedType: "queen",
                foodPreferences: [],
                childrenBeds: 0,
                animals: "",
                generalNotes: "",
              },
            },
          ],
          groups: [
            { id: "group-1", name: "Marketing Team", adminId: "guest-2" }, // Bob is admin of Marketing Team
            { id: "group-2", name: "Engineering Team", adminId: "guest-5" }, // Emma is admin of Engineering Team
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
            {
              id: "acc-1",
              name: "Grand Mountain Hotel",
              description: "Luxury hotel with spa and mountain views",
              rooms: [
                {
                  id: "room-1-1",
                  name: "Standard Single",
                  type: "single",
                  beds: [{ id: "bed-1-1-1", type: "queen", assignedGuestId: "guest-1" }],
                  notes: "Mountain view",
                },
                {
                  id: "room-1-2",
                  name: "Deluxe Double",
                  type: "double",
                  beds: [
                    { id: "bed-1-2-1", type: "king", assignedGuestId: "guest-3" },
                    { id: "bed-1-2-2", type: "sofa", notes: "Pull-out sofa" },
                  ],
                  notes: "Lake view, includes small living area",
                },
              ],
              childrenBedsAvailable: true,
              allowsAnimals: false,
              foodServices: ["Breakfast", "Dinner", "Room Service"],
              dietaryOptions: ["Gluten-Free"],
              generalNotes: "High-speed Wi-Fi available throughout the property.",
            },
            {
              id: "acc-2",
              name: "Cozy Cabins Resort",
              description: "Rustic cabins perfect for team bonding",
              rooms: [
                {
                  id: "room-2-1",
                  name: "Cabin 5",
                  type: "family",
                  beds: [
                    { id: "bed-2-1-1", type: "double", assignedGuestId: "guest-2" },
                    { id: "bed-2-1-2", type: "bunk" },
                  ],
                  notes: "Pet-friendly cabin with a small yard.",
                },
              ],
              childrenBedsAvailable: true,
              allowsAnimals: true,
              foodServices: ["Breakfast"],
              dietaryOptions: ["Vegan"],
              generalNotes: "Located near hiking trails. Limited cell service.",
            },
            {
              id: "acc-3",
              name: "Lakeside Inn",
              description: "Charming inn with lake access and activities",
              rooms: [
                {
                  id: "room-3-1",
                  name: "Lakeview Room",
                  type: "double",
                  beds: [{ id: "bed-3-1-1", type: "queen" }],
                  notes: "Direct lake access from balcony.",
                },
              ],
              childrenBedsAvailable: false,
              allowsAnimals: false,
              foodServices: ["Breakfast", "Lunch"],
              dietaryOptions: [],
              generalNotes: "No on-site conference facilities.",
            },
          ],
          activities: [
            {
              id: "act-1",
              name: "Team Hiking",
              description: "Guided hike through scenic trails",
              date: "2025-07-15",
              time: "09:00",
              assignedGuestIds: ["guest-1", "guest-2", "guest-3"], // Example assignment
            },
            {
              id: "act-2",
              name: "BBQ Dinner",
              description: "Outdoor barbecue and team socializing",
              date: "2025-07-15",
              time: "18:00",
              assignedGuestIds: ["guest-1", "guest-2", "guest-3", "guest-4", "guest-5", "guest-6"],
            },
            {
              id: "act-3",
              name: "Workshop: Innovation",
              description: "Creative thinking and innovation workshop",
              date: "2025-07-16",
              time: "10:00",
              assignedGuestIds: ["guest-1", "guest-5"],
            },
          ],
          votes: {
            days: {
              "guest-1": { "day-1": "available", "day-2": "available", "day-3": "maybe", "day-4": "not-available" },
              "guest-2": { "day-1": "available", "day-2": "maybe", "day-3": "available", "day-4": "available" },
              "guest-3": { "day-1": "maybe", "day-2": "available", "day-3": "available", "day-4": "maybe" },
            },
            locations: {
              "guest-1": { "loc-1": "available", "loc-2": "maybe", "loc-3": "not-available" },
              "guest-2": { "loc-1": "available", "loc-2": "available", "loc-3": "maybe" },
              "guest-3": { "loc-1": "maybe", "loc-2": "available", "loc-3": "available" },
            },
            accommodations: {
              "guest-1": { "acc-1": "available", "acc-2": "maybe", "acc-3": "available" },
              "guest-2": { "acc-1": "maybe", "acc-2": "available", "acc-3": "available" },
              "guest-3": { "acc-1": "available", "acc-2": "available", "acc-3": "maybe" },
            },
          },
          votingLocked: {
            days: false,
            locations: false,
            accommodations: false,
            activities: false,
          },
          agreedDays: ["day-1", "day-2", "day-3"], // Agreed days for testing
          agreedLocations: ["loc-1"],
          agreedAccommodations: ["acc-1"],
        },
        {
          id: "event-2",
          title: "Product Launch Party",
          description: "Celebrating our new product launch with clients and team members.",
          organizerId: "user-2", // Bob is organizer
          createdAt: "2025-02-01T14:30:00Z",
          dateRanges: [{ start: "2025-08-10", end: "2025-08-10" }],
          guests: [
            {
              id: "guest-7",
              name: "Bob Smith",
              email: "bob@example.com",
              isOrganizer: true, // Bob is organizer and a guest
              isGroupAdmin: false,
              groupId: undefined,
              userId: "user-2", // Linked to Bob's user account
              preferences: {
                roomType: "single",
                bedType: "queen",
                foodPreferences: [],
                childrenBeds: 0,
                animals: "",
                generalNotes: "",
              },
            },
            {
              id: "guest-8",
              name: "Alice Johnson",
              email: "alice@example.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: "group-3",
              userId: "user-1", // Linked to Alice's user account
              preferences: {
                roomType: "single",
                bedType: "queen",
                foodPreferences: [],
                childrenBeds: 0,
                animals: "",
                generalNotes: "",
              },
            },
            {
              id: "guest-9",
              name: "Carol Davis",
              email: "carol@example.com",
              isOrganizer: false,
              isGroupAdmin: true,
              groupId: "group-3",
              userId: "user-3", // Linked to Carol's user account
              preferences: {
                roomType: "double",
                bedType: "king",
                foodPreferences: ["vegetarian"],
                childrenBeds: 0,
                animals: "",
                generalNotes: "",
              },
            },
            {
              id: "guest-10",
              name: "John Client",
              email: "john@client.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: "group-4",
              userId: undefined, // Not linked to a user account
              preferences: {
                roomType: "suite",
                bedType: "king",
                foodPreferences: [],
                childrenBeds: 0,
                animals: "",
                generalNotes: "",
              },
            },
            {
              id: "guest-11",
              name: "Sarah Partner",
              email: "sarah@partner.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: "group-4",
              userId: undefined, // Not linked to a user account
              preferences: {
                roomType: "double",
                bedType: "queen",
                foodPreferences: ["gluten-free"],
                childrenBeds: 0,
                animals: "cat",
                generalNotes: "Allergic to nuts.",
              },
            },
          ],
          groups: [
            { id: "group-3", name: "Internal Team", adminId: "guest-9" }, // Carol is admin of Internal Team
            { id: "group-4", name: "External Partners", adminId: undefined },
          ],
          proposedDays: [{ id: "day-8", date: "2025-08-10" }],
          locations: [
            { id: "loc-4", name: "Downtown Event Hall", address: "100 Main St, San Francisco, CA" },
            { id: "loc-5", name: "Rooftop Venue", address: "200 Sky Tower, San Francisco, CA" },
          ],
          accommodations: [
            {
              id: "acc-4",
              name: "City Center Hotel",
              description: "Modern hotel in the heart of downtown",
              rooms: [
                {
                  id: "room-4-1",
                  name: "Standard King",
                  type: "double",
                  beds: [{ id: "bed-4-1-1", type: "king" }],
                  notes: "City view",
                },
                {
                  id: "room-4-2",
                  name: "Executive Suite",
                  type: "suite",
                  beds: [
                    { id: "bed-4-2-1", type: "king" },
                    { id: "bed-4-2-2", type: "sofa" },
                  ],
                  notes: "Large living area, two bathrooms",
                },
              ],
              childrenBedsAvailable: true,
              allowsAnimals: false,
              foodServices: ["Breakfast", "Lunch", "Dinner"],
              dietaryOptions: ["Vegan", "Gluten-Free"],
              generalNotes: "Valet parking available.",
            },
          ],
          activities: [
            {
              id: "act-4",
              name: "Product Demo",
              description: "Live demonstration of new features",
              date: "2025-08-10",
              time: "15:00",
              assignedGuestIds: ["guest-7", "guest-8", "guest-9"],
            },
            {
              id: "act-5",
              name: "Networking Reception",
              description: "Cocktails and networking",
              date: "2025-08-10",
              time: "17:00",
              assignedGuestIds: ["guest-7", "guest-8", "guest-9", "guest-10", "guest-11"],
            },
          ],
          votes: {
            days: {
              "guest-7": { "day-8": "available" },
              "guest-8": { "day-8": "available" },
              "guest-9": { "day-8": "maybe" },
            },
            locations: {
              "guest-7": { "loc-4": "available", "loc-5": "maybe" },
              "guest-8": { "loc-4": "maybe", "loc-5": "available" },
              "guest-9": { "loc-4": "available", "loc-5": "available" },
            },
          },
          votingLocked: {
            days: true,
            locations: false,
            accommodations: false,
            activities: false,
          },
          agreedDays: ["day-8"], // Agreed day for testing
          agreedLocations: ["loc-4"],
          agreedAccommodations: ["acc-4"],
        },
        {
          id: "event-3",
          title: "Weekend Family Reunion",
          description: "Annual family gathering with activities for all ages.",
          organizerId: "user-3", // Carol is organizer
          createdAt: "2025-03-10T09:15:00Z",
          dateRanges: [{ start: "2025-09-14", end: "2025-09-15" }],
          guests: [
            {
              id: "guest-12",
              name: "Carol Davis",
              email: "carol@example.com",
              isOrganizer: true, // Carol is organizer and a guest
              isGroupAdmin: false,
              groupId: undefined,
              userId: "user-3", // Linked to Carol's user account
              preferences: {
                roomType: "double",
                bedType: "queen",
                foodPreferences: [],
                childrenBeds: 0,
                animals: "",
                generalNotes: "",
              },
            },
            {
              id: "guest-13",
              name: "Alice Johnson",
              email: "alice@example.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: undefined,
              userId: "user-1", // Linked to Alice's user account
              preferences: {
                roomType: "double",
                bedType: "queen",
                foodPreferences: [],
                childrenBeds: 0,
                animals: "",
                generalNotes: "",
              },
            },
            {
              id: "guest-14",
              name: "Bob Smith",
              email: "bob@example.com",
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: undefined,
              userId: "user-2", // Linked to Bob's user account
              preferences: {
                roomType: "single",
                bedType: "single",
                foodPreferences: ["lactose-free"],
                childrenBeds: 0,
                animals: "cat",
                generalNotes: "Allergic to dust.",
              },
            },
            {
              id: "guest-15",
              name: "Uncle Joe",
              email: undefined,
              isOrganizer: false,
              isGroupAdmin: false,
              groupId: undefined,
              userId: undefined, // Not linked to a user account
              preferences: {
                roomType: "single",
                bedType: "single",
                foodPreferences: [],
                childrenBeds: 0,
                animals: "",
                generalNotes: "Needs ground floor room.",
              },
            },
          ],
          groups: [],
          proposedDays: [
            { id: "day-9", date: "2025-09-14" },
            { id: "day-10", date: "2025-09-15" },
          ],
          locations: [{ id: "loc-6", name: "Community Center", address: "500 Community Dr, Austin, TX" }],
          accommodations: [], // No accommodations in demo for this event
          activities: [
            {
              id: "act-6",
              name: "Family Picnic",
              description: "Potluck picnic at the park",
              date: "2025-09-14",
              time: "12:00",
              assignedGuestIds: [],
            },
            {
              id: "act-7",
              name: "Board Games Night",
              description: "Evening of board games and snacks",
              date: "2025-09-16", // This date is NOT an agreed day, for testing warning
              time: "19:00",
              assignedGuestIds: [],
            },
          ],
          votes: {}, // No votes in demo for this event
          votingLocked: {
            days: false,
            locations: false,
            accommodations: false,
            activities: false,
          },
          agreedDays: ["day-9"], // Agreed day for testing
          agreedLocations: [],
          agreedAccommodations: [],
        },
      ]

      initialEvents = demoEvents
      setEvents(demoEvents)
      localStorage.setItem("event-planner-events", JSON.stringify(demoEvents))
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
      id: `user-${Date.now()}`, // Use a distinct ID format for users
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

    const newEventId = `event-${Date.now()}`
    const newEvent: Event = {
      ...eventData,
      id: newEventId,
      organizerId: user.id,
      createdAt: new Date().toISOString(),
      guests: [
        {
          id: `guest-${Date.now()}`, // Create a guest entry for the organizer
          name: user.name,
          email: user.email,
          isOrganizer: true,
          isGroupAdmin: false,
          groupId: undefined,
          userId: user.id, // Link to the organizer's user ID
          preferences: {
            roomType: "",
            bedType: "",
            childrenBeds: 0,
            animals: "",
            foodPreferences: [],
            generalNotes: "",
          },
        },
      ],
      groups: [],
      proposedDays: [],
      locations: [],
      accommodations: [], // Initialize activities as empty
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
