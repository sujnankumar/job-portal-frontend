"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import OnboardingForm from "@/components/onboarding/onboarding-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { UserRole } from "@/store/authStore"

export default function OnboardingPage() {
  const { user, isAuthenticated, updateOnboardingStatus } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else {
      const startedAt = user?.onboarding?.startedAt ? new Date(user.onboarding.startedAt) : null
      const now = new Date()

      if (startedAt && now.getTime() - startedAt.getTime() > 24 * 60 * 60 * 1000) {
        setSessionExpired(true)
      }

      setIsLoading(false)
    }
  }, [isAuthenticated, router, user])

  const handleRestartOnboarding = () => {
    updateOnboardingStatus({
      lastStep: 0,
      startedAt: new Date().toISOString(),
      formData: {},
    })
    setSessionExpired(false)
  }

  const handleGoBack = () => {
    router.push("/dashboard")
  }

  console.log(user, "user role")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (sessionExpired) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-dark-gray mb-4">Onboarding Session Expired</h1>
          <p className="text-gray-500 mb-6">
            Your onboarding session has expired. Would you like to restart the onboarding process or return to the
            dashboard?
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
            </Button>
            <Button onClick={handleRestartOnboarding}>Restart Onboarding</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["applicant", "employer"]}>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark-gray">Complete Your Profile</h1>
          <p className="text-gray-500 mt-2">
            Help us personalize your experience by providing some additional information
          </p>
        </div>

        <OnboardingForm userRole={user?.role || "applicant"} />
      </div>
    </ProtectedRoute>
  )
}