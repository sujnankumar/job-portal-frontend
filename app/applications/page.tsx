"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ApplicationList from "@/components/application-list"

export default function ApplicationTrackerPage() {
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
    <ProtectedRoute allowedRoles={["applicant"]}>
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <h1 className="text-3xl font-bold text-dark-gray mb-6">Application Tracker</h1>

        <Tabs defaultValue="active" className="bg-white rounded-xl shadow-md">
          <TabsList className="border-b w-full rounded-t-xl rounded-b-none p-0">
            <TabsTrigger
              value="active"
              className="flex-1 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none py-3"
            >
              Active Applications
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 rounded-tr-xl rounded-tl-none rounded-bl-none rounded-br-none py-3"
            >
              Application History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="p-6">
            <ApplicationList status="active" />
          </TabsContent>

          <TabsContent value="history" className="p-6">
            <ApplicationList status="history" />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
