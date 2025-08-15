"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JobCategories from "@/components/job-categories"
import FeaturedJobs from "@/components/featured-jobs"
// import SavedSearches from "@/components/saved-searches"
import ApplicationList from "@/components/application-list"
import OnboardingMiddleware from "@/components/auth/onboarding-middleware";
import JobListings from "@/components/job-listings"
import Link from "next/link"


export default function ApplicantDashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user?.role === "employer") {
      toast("Redirected", { description: "You need to login as job seeker to view that page." })
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
              {/* Limited view of saved jobs (first 5) with Show All link */}
              <div className="space-y-4">
                <JobListings savedJobsOnly={true} hideControls limit={5} filters={{
                  jobTypes: [],
                  experienceLevels: [],
                  salaryRange: [0,20],
                  location: "",
                  industries: [],
                  skills: [],
                  locationTypes: [],
                  search: "",
                  booleanQuery: ""
                }} showExpired={false} />
                <div className="flex justify-center pt-2">
                  <Link href="/saved-jobs" className="text-accent text-sm font-medium hover:underline">Show all saved jobs →</Link>
                </div>
              </div>
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
