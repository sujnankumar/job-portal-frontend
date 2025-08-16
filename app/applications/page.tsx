"use client"

import ProtectedRoute from "@/components/auth/protected-route"
import OnboardingMiddleware from "@/components/auth/onboarding-middleware"
import ApplicationList from "@/components/application-list"

export default function ApplicationsPage() {
  return (
    <OnboardingMiddleware>
      <ProtectedRoute allowedRoles={["applicant"]}>
        <div className="container mx-auto max-w-5xl py-8 px-4">
          <h1 className="text-2xl font-bold text-dark-gray mb-4">My Applications</h1>
          <ApplicationList />
        </div>
      </ProtectedRoute>
    </OnboardingMiddleware>
  )
}