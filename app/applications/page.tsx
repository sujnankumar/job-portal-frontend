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
        <div className="container mx-auto max-w-6xl py-8 px-4">
          <h1 className="text-3xl font-bold text-dark-gray mb-6">My Applications</h1>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <ApplicationList />
          </div>
        </div>
      </ProtectedRoute>
    </OnboardingMiddleware>
  )
}