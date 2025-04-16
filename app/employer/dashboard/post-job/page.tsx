"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import JobPostingForm from "@/components/job-posting-form"

export default function PostJobPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user?.role === "applicant") {
      router.push("/dashboard")
    } else if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, user, router])

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-dark-gray mb-2">Post a New Job</h1>
          <p className="text-gray-500 mb-6">Fill out the form below to create a new job posting.</p>

          <JobPostingForm />
        </div>
      </div>
    </ProtectedRoute>
  )
}
