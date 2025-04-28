"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import ApplicationList from "@/components/application-list"
import OnboardingMiddleware from "@/components/auth/onboarding-middleware";

export default function ApplicationsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user?.role === "employer") {
      router.push("/employer/dashboard")
    } else if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, user, router])

  return (
    <OnboardingMiddleware>
      <ProtectedRoute allowedRoles={["applicant"]}>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-6">My Applications</h1>
          <ApplicationList />
        </div>
      </ProtectedRoute>
    </OnboardingMiddleware>
  )
}