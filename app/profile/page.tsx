"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileEditor from "@/components/profile-editor"
import PrivacySettings from "@/components/privacy-settings"
import ProfileHeader from "@/components/profile-header"
import React from "react"
import ResumeBuilder from "@/components/resume-builder"

export default function ProfilePage() {
  const { user, isAuthenticated, hydrated } = useAuthStore()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  // Profile data state in parent
  const [personalInfo, setPersonalInfo] = useState({
    first_name: "",
    last_name: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    bio: "",
  })
  const [education, setEducation] = useState<any[]>([])
  const [experience, setExperience] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])

  // Store originals for cancel
  const [originalPersonalInfo, setOriginalPersonalInfo] = useState(personalInfo)
  const [originalEducation, setOriginalEducation] = useState(education)
  const [originalExperience, setOriginalExperience] = useState(experience)
  const [originalSkills, setOriginalSkills] = useState(skills)

  // // Only run effects and render after hydrated
  // useEffect(() => {
  //   if (!hydrated) return
  //   if (isAuthenticated && user?.role === "employer") {
  //     router.push("/employer/dashboard")
  //   } else if (!isAuthenticated) {
  //     router.push("/auth/login")
  //   }
  // }, [hydrated, isAuthenticated, user, router])

  useEffect(() => {
    if (!hydrated) return
    async function fetchUser() {
      try {
        const res = await axios.get("/user/me", {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        })
        const data = res.data || {}
        setPersonalInfo({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          headline: data.headline || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          website: data.website || "",
          linkedin: data.linkedin || "",
          github: data.github || "",
          bio: data.bio || "",
        })
        setEducation(data.education || [])
        setExperience(data.experience || [])
        setSkills(data.skills || [])
      } catch (e) {
        // fallback: leave fields blank
      }
    }
    fetchUser()
  }, [hydrated])

  // When entering edit mode, store originals
  useEffect(() => {
    if (isEditing) {
      setOriginalPersonalInfo(personalInfo)
      setOriginalEducation(education)
      setOriginalExperience(experience)
      setOriginalSkills(skills)
    }
  }, [isEditing])

  // Cancel handler
  const handleCancel = () => {
    setPersonalInfo(originalPersonalInfo)
    setEducation(originalEducation)
    setExperience(originalExperience)
    setSkills(originalSkills)
    setIsEditing(false)
  }

  if (!hydrated) return null

  return (
    <ProtectedRoute allowedRoles={["applicant"]}>
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <ProfileHeader isEditing={isEditing} setIsEditing={setIsEditing} personalInfo={personalInfo} education={education} experience={experience} skills={skills} />
        <Tabs defaultValue="profile" className="mt-6">
          <TabsList className="w-full border-b rounded-t-xl rounded-b-none p-0 bg-white">
            <TabsTrigger
              value="profile"
              className="flex-1 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none py-3"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="resume"
              className="flex-1 py-3"
            >
              Resume
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="flex-1 rounded-tr-xl rounded-tl-none rounded-bl-none rounded-br-none py-3"
            >
              Privacy Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="bg-white rounded-b-xl shadow-sm p-6 border border-t-0">
            <ProfileEditor
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              personalInfo={personalInfo}
              setPersonalInfo={setPersonalInfo}
              education={education}
              setEducation={setEducation}
              experience={experience}
              setExperience={setExperience}
              skills={skills}
              setSkills={setSkills}
              onCancel={handleCancel}
            />
          </TabsContent>
          <TabsContent value="resume" className="bg-white rounded-b-xl shadow-sm p-6 border border-t-0">
            {/* ResumeBuilder now available in profile page */}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-bold mb-4 text-dark-gray">Resume Builder</h2>
              <p className="mb-6 text-gray-600">Generate and download your resume using AI. Your resume will be saved to your profile for easy access.</p>
              <div className="bg-light-gray rounded-xl p-6">
                <React.Suspense fallback={<div>Loading Resume Builder...</div>}>
                  <ResumeBuilder />
                </React.Suspense>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="privacy" className="bg-white rounded-b-xl shadow-sm p-6 border border-t-0">
            <PrivacySettings />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
