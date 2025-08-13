"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JobCategories from "@/components/job-categories"
import FeaturedJobs from "@/components/featured-jobs"
import SavedSearches from "@/components/saved-searches"
import ApplicationList from "@/components/application-list"
import OnboardingMiddleware from "@/components/auth/onboarding-middleware";
import JobListings from "@/components/job-listings"


export default function ApplicantDashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user?.role === "employer") {
      router.push("/employer/dashboard")
    }
  }, [isAuthenticated, user, router])

  return (
    <OnboardingMiddleware>
      <ProtectedRoute allowedRoles={["applicant"]}>
        <div className="container mx-auto max-w-6xl py-8 px-4">
          <h1 className="text-3xl font-bold text-dark-gray mb-6">Welcome, {user?.name}</h1>

          <Tabs defaultValue="applications" className="bg-white rounded-xl shadow-md">
            <TabsList className="border-b w-full rounded-t-xl rounded-b-none p-0">
              <TabsTrigger
                value="applications"
                className="flex-1 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none py-3"
              >
                My Applications
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="flex-1 rounded-tr-xl rounded-tl-none rounded-bl-none rounded-br-none py-3"
              >
                Saved Jobs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="p-6">
              <ApplicationList />
            </TabsContent>

            <TabsContent value="saved" className="p-6">
              {/* Replace hardcoded text with JobListings component for saved jobs */}
              <JobListings savedJobsOnly={true} />
            </TabsContent>
          </Tabs>

          <div className="mt-8 space-y-8">
            {/* <section>
              <h2 className="text-2xl font-bold text-dark-gray mb-4">Your Saved Searches</h2>
              <SavedSearches />
            </section> */}

            <section>
              <h2 className="text-2xl font-bold text-dark-gray mb-4">Recommended Jobs</h2>
              <FeaturedJobs />
            </section>

            <section>
              <h2 className="text-2xl font-bold text-dark-gray mb-4">Browse by Category</h2>
              <JobCategories />
            </section>
          </div>
        </div>
      </ProtectedRoute>
    </OnboardingMiddleware>
  )
}
