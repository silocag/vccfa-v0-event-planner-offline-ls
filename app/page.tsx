"use client"
import { AuthProvider } from "@/components/auth-provider"
import { Dashboard } from "@/components/dashboard"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/hooks/use-auth"
import { TooltipProvider } from "@/components/ui/tooltip"
import LandingPage from "@/components/landing-page"
import { useState } from "react" // Import useState

function AppContent() {
  const { user, loading } = useAuth()
  const [showLoginForm, setShowLoginForm] = useState(false) // New state to control login form visibility

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    return <Dashboard />
  } else {
    // If not logged in, show LoginForm if showLoginForm is true, otherwise show LandingPage
    return showLoginForm ? <LoginForm /> : <LandingPage onShowLogin={() => setShowLoginForm(true)} />
  }
}

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  )
}
