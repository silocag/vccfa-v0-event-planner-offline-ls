"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  UsersIcon,
  BedDoubleIcon,
  PartyPopperIcon,
  Share2Icon,
  WifiOffIcon,
  LogInIcon,
  PlusCircleIcon,
  SettingsIcon,
  CheckCircleIcon,
  BarChartIcon,
} from "lucide-react"
import Image from "next/image"

interface LandingPageProps {
  onShowLogin: () => void
}

export default function LandingPage({ onShowLogin }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with Login Button */}
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between bg-white border-b">
        <Link className="flex items-center justify-center" href="#">
          <PartyPopperIcon className="h-6 w-6 text-purple-600 mr-2" />
          <span className="text-lg font-semibold text-gray-900">EventPlanner</span>
        </Link>
        <Button onClick={onShowLogin} variant="ghost" className="text-purple-600 hover:bg-purple-50">
          Login
        </Button>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Plan Your Perfect Event, Together.
                </h1>
                <p className="max-w-[600px] text-gray-200 md:text-xl">
                  EventPlanner is a collaborative, offline-first tool designed to help groups organize events
                  seamlessly.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild className="bg-white text-purple-700 hover:bg-gray-100">
                  <Link href="#features">Explore Features</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-700"
                >
                  <Link href="#">Try Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  EventPlanner offers a comprehensive suite of tools to make group event planning effortless.
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Feature: User Authentication */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <LogInIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <CardTitle>User Authentication</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-gray-500 mb-4">
                      Secure login and registration, with a convenient quick demo login for prototyping.
                    </p>
                    <Image
                      alt="User Authentication Screenshot"
                      className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                      height="200"
                      src="/placeholder.svg?height=200&width=350"
                      width="350"
                    />
                  </CardContent>
                </Card>

                {/* Feature: Event Management */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <PlusCircleIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <CardTitle>Event Management</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-gray-500 mb-4">
                      Create new events with titles, descriptions, and flexible date ranges.
                    </p>
                    <Image
                      alt="Event Management Screenshot"
                      className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                      height="200"
                      src="/placeholder.svg?height=200&width=350"
                      width="350"
                    />
                  </CardContent>
                </Card>

                {/* Feature: Guest & Group Management */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <UsersIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <CardTitle>Guest & Group Management</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-gray-500 mb-4">
                      Add, remove, and rename guests. Organize guests into custom groups and assign roles.
                    </p>
                    <Image
                      alt="Guest Management Screenshot"
                      className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                      height="200"
                      src="/placeholder.svg?height=200&width=350"
                      width="350"
                    />
                  </CardContent>
                </Card>

                {/* Feature: Guest Preferences */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <SettingsIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <CardTitle>Guest Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-gray-500 mb-4">
                      Capture detailed guest preferences including room/bed types, food, and notes.
                    </p>
                    <Image
                      alt="Guest Preferences Screenshot"
                      className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                      height="200"
                      src="/placeholder.svg?height=200&width=350"
                      width="350"
                    />
                  </CardContent>
                </Card>

                {/* Feature: Collaborative Voting */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <CheckCircleIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <CardTitle>Collaborative Voting</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-gray-500 mb-4">
                      Propose and vote on preferred days, locations, and accommodations with vote summaries.
                    </p>
                    <Image
                      alt="Collaborative Voting Screenshot"
                      className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                      height="200"
                      src="/placeholder.svg?height=200&width=350"
                      width="350"
                    />
                  </CardContent>
                </Card>

                {/* Feature: Accommodation Planning */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <BedDoubleIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <CardTitle>Accommodation Planning</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-gray-500 mb-4">
                      Define accommodation options, rooms, beds, and assign guests with drag-and-drop.
                    </p>
                    <Image
                      alt="Accommodation Planning Screenshot"
                      className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                      height="200"
                      src="/placeholder.svg?height=200&width=350"
                      width="350"
                    />
                  </CardContent>
                </Card>

                {/* Feature: Activity Planning */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <PartyPopperIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <CardTitle>Activity Planning</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-gray-500 mb-4">
                      Add, edit, and delete event activities with dates, times, and guest assignments.
                    </p>
                    <Image
                      alt="Activity Planning Screenshot"
                      className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                      height="200"
                      src="/placeholder.svg?height=200&width=350"
                      width="350"
                    />
                  </CardContent>
                </Card>

                {/* Feature: Event Overview */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <BarChartIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <CardTitle>Event Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-gray-500 mb-4">
                      A dashboard providing a quick summary of event details, agreed items, and counts.
                    </p>
                    <Image
                      alt="Event Overview Screenshot"
                      className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                      height="200"
                      src="/placeholder.svg?height=200&width=350"
                      width="350"
                    />
                  </CardContent>
                </Card>

                {/* Feature: Share Event */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <Share2Icon className="h-8 w-8 text-purple-600 mb-2" />
                    <CardTitle>Share Event</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-gray-500 mb-4">
                      Easily share event links with guests for seamless collaboration.
                    </p>
                    <Image
                      alt="Share Event Screenshot"
                      className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                      height="200"
                      src="/placeholder.svg?height=200&width=350"
                      width="350"
                    />
                  </CardContent>
                </Card>

                {/* Feature: Offline-First */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <WifiOffIcon className="h-8 w-8 text-purple-600 mb-2" />
                    <CardTitle>Offline-First</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-gray-500 mb-4">
                      Data is persisted locally using localStorage, ensuring a smooth experience even without an
                      internet connection.
                    </p>
                    <Image
                      alt="Offline-First Screenshot"
                      className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                      height="200"
                      src="/placeholder.svg?height=200&width=350"
                      width="350"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Future Steps / Call to Action */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Ready to Plan Your Next Event?
            </h2>
            <p className="max-w-[800px] mx-auto text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-8">
              EventPlanner is continuously evolving. We plan to integrate robust authentication and persistence
              solutions like Supabase, Neon, or Upstash, and explore AI features for even smarter planning.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row justify-center">
              <Button onClick={onShowLogin} className="bg-purple-600 text-white hover:bg-purple-700">
                Get Started Now
              </Button>
              <Button asChild variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-100">
                <Link href="#">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-gray-500">&copy; 2024 EventPlanner. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy Policy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
        </nav>
      </footer>
    </div>
  )
}
