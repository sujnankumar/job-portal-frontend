"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileEditor from "@/components/profile-editor"
import PrivacySettings from "@/components/privacy-settings"
import ProfileHeader from "@/components/profile-header"

export default function ProfilePage() {
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
        <ProfileHeader />

        <Tabs defaultValue="profile" className="mt-6">
          <TabsList className="w-full border-b rounded-t-xl rounded-b-none p-0 bg-white">
            <TabsTrigger
              value="profile"
              className="flex-1 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none py-3"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="flex-1 rounded-tr-xl rounded-tl-none rounded-bl-none rounded-br-none py-3"
            >
              Privacy Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="bg-white rounded-b-xl shadow-sm p-6 border border-t-0">
            <ProfileEditor />
          </TabsContent>

          <TabsContent value="privacy" className="bg-white rounded-b-xl shadow-sm p-6 border border-t-0">
            <PrivacySettings />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
