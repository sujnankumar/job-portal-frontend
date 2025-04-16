"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EmployerDashboardHeader from "@/components/employer-dashboard-header"
import JobPostingList from "@/components/job-posting-list"
import ApplicationsOverview from "@/components/applications-overview"
import EmployerStats from "@/components/employer-stats"

export default function EmployerDashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user?.role === "applicant") {
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, router])

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <EmployerDashboardHeader />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <EmployerStats />
        </div>

        <Tabs defaultValue="jobs" className="mt-8">
          <TabsList className="w-full border-b rounded-t-xl rounded-b-none p-0 bg-white">
            <TabsTrigger
              value="jobs"
              className="flex-1 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none py-3"
            >
              Posted Jobs
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="flex-1 rounded-tr-xl rounded-tl-none rounded-bl-none rounded-br-none py-3"
            >
              Applications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="bg-white rounded-b-xl shadow-sm p-6 border border-t-0">
            <JobPostingList />
          </TabsContent>

          <TabsContent value="applications" className="bg-white rounded-b-xl shadow-sm p-6 border border-t-0">
            <ApplicationsOverview />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
