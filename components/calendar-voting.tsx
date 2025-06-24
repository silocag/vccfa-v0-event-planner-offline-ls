"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import type { Event, ProposedDay, Guest, UserRole } from "@/types/app"
import {
  Calendar,
  Lock,
  Unlock,
  Check,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trash,
  CheckCircle2,
  Users,
} from "lucide-react"
import { VoteSummary } from "./vote-summary"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface CalendarVotingProps {
  event: Event
  userRole: UserRole
}

export function CalendarVoting({ event, userRole }: CalendarVotingProps) {
  const { user, updateEvent } = useAuth()
  const [selectedVoterGuestId, setSelectedVoterGuestId] = useState<string | null>(null)

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const votersForSelection: Guest[] = useMemo(() => {
    if (!user || !event?.guests) return []

    const currentUserGuestEntry = event.guests.find((guest) => guest.userId === user.id)

    if (userRole === "Organizer") {
      return event.guests // Organizer can vote for any guest in the event
    } else if (userRole === "Group Admin") {
      if (currentUserGuestEntry && currentUserGuestEntry.groupId) {
        // Group Admin can vote for any guest in their group
        return event.guests.filter((guest) => guest.groupId === currentUserGuestEntry.groupId)
      }
      return currentUserGuestEntry ? [currentUserGuestEntry] : []
    } else {
      // Regular Guest can only vote for themselves
      return currentUserGuestEntry ? [currentUserGuestEntry] : []
    }
  }, [user, userRole, event?.guests])

  useEffect(() => {
    if (!user || !event?.guests) {
      setSelectedVoterGuestId(null)
      return
    }
    const currentUserGuestEntry = event.guests.find((guest) => guest.userId === user.id)

    if (userRole === "Organizer") {
      if (currentUserGuestEntry) {
        setSelectedVoterGuestId(currentUserGuestEntry.id)
      } else if (votersForSelection.length > 0) {
        setSelectedVoterGuestId(votersForSelection[0].id)
      } else {
        setSelectedVoterGuestId(null)
      }
    } else if (userRole === "Group Admin") {
      if (currentUserGuestEntry && votersForSelection.some((g) => g.id === currentUserGuestEntry.id)) {
        setSelectedVoterGuestId(currentUserGuestEntry.id)
      } else if (votersForSelection.length > 0) {
        setSelectedVoterGuestId(votersForSelection[0].id)
      } else {
        setSelectedVoterGuestId(null)
      }
    } else {
      if (currentUserGuestEntry) {
        setSelectedVoterGuestId(currentUserGuestEntry.id)
      } else {
        setSelectedVoterGuestId(null)
      }
    }
  }, [user, event?.guests, userRole, votersForSelection])

  useEffect(() => {
    if (event.proposedDays.length > 0) {
      const earliestDay = event.proposedDays.reduce((min, day) => (new Date(day.date) < new Date(min.date) ? day : min))
      const date = new Date(earliestDay.date)
      setCurrentMonth(date.getMonth())
      setCurrentYear(date.getFullYear())
    } else {
      const today = new Date()
      setCurrentMonth(today.getMonth())
      setCurrentYear(today.getFullYear())
    }
  }, [event.proposedDays])

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1)
    const days = []
    const firstDayIndex = date.getDay()
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null)
    }
    while (date.getMonth() === month) {
      const yearStr = date.getFullYear()
      const monthStr = (date.getMonth() + 1).toString().padStart(2, "0")
      const dayStr = date.getDate().toString().padStart(2, "0")
      days.push({
        dayOfMonth: date.getDate(),
        dateString: `${yearStr}-${monthStr}-${dayStr}`,
        isCurrentMonth: true,
      })
      date.setDate(date.getDate() + 1)
    }
    return days
  }

  const calendarDays = getDaysInMonth(currentYear, currentMonth)

  const prevMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 0) {
        setCurrentYear((prevYear) => prevYear - 1)
        return 11
      }
      return prevMonth - 1
    })
  }

  const nextMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 11) {
        setCurrentYear((prevYear) => prevYear + 1)
        return 0
      }
      return prevMonth + 1
    })
  }

  const canManage = userRole === "Organizer"

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

  const addProposedDay = (dateString: string) => {
    if (!canManage) return
    const newDay: ProposedDay = { id: `day-${Date.now()}`, date: dateString }
    updateEvent(event.id, { proposedDays: [...event.proposedDays, newDay] })
  }

  const removeProposedDay = (dayId: string) => {
    if (!canManage) return
    const updatedProposedDays = event.proposedDays.filter((day) => day.id !== dayId)
    const updatedVotes = { ...event.votes }
    if (updatedVotes.days) {
      Object.keys(updatedVotes.days).forEach((guestId) => {
        if (updatedVotes.days[guestId]) {
          delete updatedVotes.days[guestId][dayId]
        }
      })
    }
    const updatedAgreedDays = (event.agreedDays ?? []).filter((id) => id !== dayId)
    updateEvent(event.id, {
      proposedDays: updatedProposedDays,
      votes: updatedVotes,
      agreedDays: updatedAgreedDays,
    })
  }

  const toggleAgreedDay = (dayId: string) => {
    if (!canManage) return
    const isAgreed = event.agreedDays.includes(dayId)
    const updatedAgreedDays = isAgreed ? event.agreedDays.filter((id) => id !== dayId) : [...event.agreedDays, dayId]
    updateEvent(event.id, { agreedDays: updatedAgreedDays })
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

  const showVoterSelection = userRole === "Organizer" || userRole === "Group Admin"

  return (
    <div className="space-y-6">
      {showVoterSelection && votersForSelection.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Voting As
            </CardTitle>
            <CardDescription>
              {userRole === "Guest" && votersForSelection.length === 1 && votersForSelection[0].userId === user?.id
                ? "You are voting as yourself."
                : "Select which guest you are voting for."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userRole === "Guest" && votersForSelection.length === 1 && votersForSelection[0].userId === user?.id ? (
              <p className="font-medium">{votersForSelection[0].name} (Guest)</p>
            ) : (
              <Select
                value={selectedVoterGuestId ?? ""}
                onValueChange={setSelectedVoterGuestId}
                disabled={votersForSelection.length <= 1 && userRole === "Guest"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a guest to vote as" />
                </SelectTrigger>
                <SelectContent>
                  {votersForSelection.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.name} (Guest)
                      {guest.email ? ` - ${guest.email}` : ""}
                      {guest.userId === user?.id ? " (You)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Proposed Days
                {event.votingLocked.days && <Lock className="h-4 w-4 ml-2 text-gray-500" />}
              </CardTitle>
              <CardDescription>Vote on which days work best for the event</CardDescription>
            </div>
            {canManage && (
              <Button variant="outline" size="sm" onClick={() => toggleVotingLock("days")}>
                {event.votingLocked.days ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <Button variant="ghost" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {new Date(currentYear, currentMonth).toLocaleString("default", { month: "long", year: "numeric" })}
              </h3>
              <Button variant="ghost" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} className="border rounded-md h-36 bg-gray-100"></div>

                const proposedDay = event.proposedDays.find((d) => d.date === day.dateString)
                const guestVote = proposedDay ? getGuestVote("days", proposedDay.id) : null
                const isLockedForCategory = event.votingLocked.days
                const voteButtonsDisabled = !selectedVoterGuestId || (isLockedForCategory && userRole !== "Organizer")

                let cellClasses =
                  "p-2 rounded-md flex flex-col items-center justify-between text-sm relative border h-36"
                cellClasses += day.isCurrentMonth ? " text-gray-900 bg-white" : " text-gray-400 bg-gray-50"

                if (canManage && !proposedDay && day.isCurrentMonth) {
                  cellClasses += " cursor-pointer hover:bg-blue-50"
                }

                return (
                  <div
                    key={day.dateString || `day-${index}`}
                    className={cellClasses}
                    onClick={() => canManage && !proposedDay && day.isCurrentMonth && addProposedDay(day.dateString)}
                  >
                    <div className="w-full flex justify-between items-start">
                      {(event.agreedDays ?? []).includes(proposedDay?.id ?? "") && (
                        <Badge variant="default" className="text-xs p-1 bg-green-500 text-white absolute top-1 left-1">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        </Badge>
                      )}
                      <span
                        className={`font-bold text-base ml-auto ${proposedDay && guestVote === "available" ? "text-green-700" : proposedDay && guestVote === "maybe" ? "text-yellow-700" : proposedDay && guestVote === "not-available" ? "text-red-700" : ""}`}
                      >
                        {day.dayOfMonth}
                      </span>
                    </div>

                    {proposedDay && (
                      <div className="flex-grow flex flex-col items-center justify-center w-full space-y-1.5">
                        <div className="flex space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant={guestVote === "available" ? "default" : "outline"}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    vote("days", proposedDay.id, "available")
                                  }}
                                  className="h-7 w-7 p-0 bg-green-100 hover:bg-green-200 text-green-700 data-[state=active]:bg-green-500 data-[state=active]:text-white"
                                  data-state={guestVote === "available" ? "active" : "inactive"}
                                  disabled={voteButtonsDisabled}
                                >
                                  <Check className="h-4 w-4" />
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
                                  size="icon"
                                  variant={guestVote === "maybe" ? "default" : "outline"}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    vote("days", proposedDay.id, "maybe")
                                  }}
                                  className="h-7 w-7 p-0 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
                                  data-state={guestVote === "maybe" ? "active" : "inactive"}
                                  disabled={voteButtonsDisabled}
                                >
                                  <Clock className="h-4 w-4" />
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
                                  size="icon"
                                  variant={guestVote === "not-available" ? "default" : "outline"}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    vote("days", proposedDay.id, "not-available")
                                  }}
                                  className="h-7 w-7 p-0 bg-red-100 hover:bg-red-200 text-red-700 data-[state=active]:bg-red-500 data-[state=active]:text-white"
                                  data-state={guestVote === "not-available" ? "active" : "inactive"}
                                  disabled={voteButtonsDisabled}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Vote Not Available</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {isLockedForCategory && userRole !== "Organizer" && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Locked
                          </Badge>
                        )}
                        <VoteSummary category="days" itemId={proposedDay.id} event={event} />
                      </div>
                    )}

                    {canManage && proposedDay && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute bottom-1 right-1 h-6 w-6 text-red-500 hover:text-red-600 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove {new Date(proposedDay.date).toLocaleDateString()}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the day and all its votes. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeProposedDay(proposedDay.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {canManage && !proposedDay && day.isCurrentMonth && (
                      <Button
                        size="xs"
                        variant="outline"
                        className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs p-1 h-auto leading-tight"
                        onClick={(e) => {
                          e.stopPropagation()
                          addProposedDay(day.dateString)
                        }}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              {canManage
                ? "Click empty cells to add days. Use buttons to vote or manage proposed days."
                : "Use buttons on proposed days to cast your vote."}
            </p>
          </div>

          {event.proposedDays.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-md font-semibold mb-3">Summary List of Proposed Days</h4>
              <div className="space-y-3">
                {event.proposedDays
                  .slice()
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((day) => (
                    <div key={day.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                      <div>
                        <p className="font-medium flex items-center">
                          {new Date(day.date).toLocaleDateString()}
                          {(event.agreedDays ?? []).includes(day.id) && (
                            <Badge variant="default" className="ml-2 bg-green-500 text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Agreed
                            </Badge>
                          )}
                        </p>
                        <VoteSummary category="days" itemId={day.id} event={event} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <ListVoteButtons category="days" itemId={day.id} />
                        {canManage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAgreedDay(day.id)}
                            className={`px-2 ${(event.agreedDays ?? []).includes(day.id) ? "bg-green-500 text-white hover:bg-green-600" : "text-green-600 hover:bg-green-50"}`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="sr-only">
                              {(event.agreedDays ?? []).includes(day.id) ? "Unmark as Agreed" : "Mark as Agreed"}
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
