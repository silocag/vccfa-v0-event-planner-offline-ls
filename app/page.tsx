"use client"
import { AuthProvider } from "@/components/auth-provider"
import { Dashboard } from "@/components/dashboard"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/hooks/use-auth"
import { TooltipProvider } from "@/components/ui/tooltip" // Add this import

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return user ? <Dashboard /> : <LoginForm />
}

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        {" "}
        {/* Wrap AppContent with TooltipProvider */}
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  )
}
