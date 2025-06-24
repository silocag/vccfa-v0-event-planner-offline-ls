export interface User {
  id: string
  name: string
  email: string
  password: string
}

export interface DateRange {
  start: string
  end: string
}

export interface Guest {
  id: string
  name: string
  email?: string
  isOrganizer: boolean
  isGroupAdmin: boolean
  groupId?: string
  userId?: string // New: Link to a User if this guest is also a registered user
  preferences: {
    roomType: "single" | "double" | "suite" | ""
    bedType: "single" | "double" | "queen" | "king" | "" | "bunk" | "sofa" | "other"
    childrenBeds: number
    animals: string // e.g., "dog, cat"
    foodPreferences: string[] // e.g., ["vegetarian", "vegan", "lactose-free"]
    generalNotes: string
  }
  assignedRoomId?: string // New: ID of the room the guest is assigned to
  assignedBedId?: string // New: ID of the bed the guest is assigned to
}

export interface Group {
  id: string
  name: string
  adminId?: string
}

export interface ProposedDay {
  id: string
  date: string
  // isAvailable: boolean // Removed as availability is now determined by voting
}

export interface Location {
  id: string
  name: string
  address?: string
}

export interface Bed {
  id: string
  type: "single" | "double" | "queen" | "king" | "bunk" | "sofa" | "other" | ""
  notes?: string // e.g., "pull-out sofa", "crib available"
  assignedGuestIds?: string[] // Changed to array for multiple guests on double beds
}

export interface Room {
  id: string
  name?: string // e.g., "Room 101", "Suite A"
  type: "single" | "double" | "suite" | "family" | "other" | "" // Room type
  beds: Bed[]
  notes?: string // General notes for the room
}

export interface Accommodation {
  id: string
  name: string
  description?: string
  rooms: Room[] // Granular room definition
  childrenBedsAvailable?: boolean // Still at accommodation level for general availability
  allowsAnimals?: boolean // Still at accommodation level for general policy
  foodServices?: string[] // e.g., ["Breakfast", "Lunch", "Dinner", "Room Service"]
  dietaryOptions?: string[] // e.g., ["Vegan", "Gluten-Free", "Halal"]
  generalNotes?: string // New: General notes for the accommodation
}

export interface Activity {
  id: string
  name: string
  description?: string
  date: string
  time: string
  assignedGuestIds: string[] // New: Array of guest IDs assigned to this activity
}

export interface Event {
  id: string
  title: string
  description?: string
  organizerId: string
  createdAt: string
  dateRanges: DateRange[]
  guests: Guest[]
  groups: Group[]
  proposedDays: ProposedDay[]
  locations: Location[]
  accommodations: Accommodation[]
  activities: Activity[]
  votes: {
    [category: string]: {
      [guestId: string]: {
        [itemId: string]: "available" | "maybe" | "not-available"
      }
    }
  }
  votingLocked: {
    days: boolean
    locations: boolean
    accommodations: boolean
    activities: boolean
  }
  agreedDays: string[]
  agreedLocations: string[]
  agreedAccommodations: string[]
  generalNotes?: string
}

export type UserRole = "Organizer" | "Guest" | "Group Admin"
