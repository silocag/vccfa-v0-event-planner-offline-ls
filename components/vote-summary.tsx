"use client"

import type { Event } from "@/types/app"
import { Check, Clock, X } from "lucide-react"

interface VoteSummaryProps {
  category: string
  itemId: string
  event: Event // Pass the event object to access votes
}

export const VoteSummary = ({ category, itemId, event }: VoteSummaryProps) => {
  const categoryVotes = event.votes[category] || {}
  let available = 0,
    maybe = 0,
    notAvailable = 0

  Object.values(categoryVotes).forEach((userVotes: any) => {
    const vote = userVotes[itemId]
    if (vote === "available") available++
    else if (vote === "maybe") maybe++
    else if (vote === "not-available") notAvailable++
  })

  return (
    <div className="flex space-x-2 text-xs text-gray-600">
      <span className="flex items-center">
        <Check className="h-3 w-3 mr-1 text-green-600" />
        {available}
      </span>
      <span className="flex items-center">
        <Clock className="h-3 w-3 mr-1 text-yellow-600" />
        {maybe}
      </span>
      <span className="flex items-center">
        <X className="h-3 w-3 mr-1 text-red-600" />
        {notAvailable}
      </span>
    </div>
  )
}
