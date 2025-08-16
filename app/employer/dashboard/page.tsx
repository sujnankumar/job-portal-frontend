"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import { toast } from "sonner"
import EmployerDashboardHeader from "@/components/employer-dashboard-header"
import JobPostingList from "@/components/job-posting-list"
import JobApplications from "@/components/job-applications"
import EmployerStats from "@/components/employer-stats"
import api from "@/lib/axios"

export default function EmployerDashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user?.role === "applicant") {
      toast("Redirected", { description: "You need to login as employer to view that page." })
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!user?.token) return
      try {
        const res = await api.get("/emp/company_details", {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        setCompany(res.data)
      } catch (err) {
        setCompany(null)
      } finally {
        setLoading(false)
      }
    }
    if (isAuthenticated && user?.role === "employer") {
      fetchCompanyDetails()
    }
  }, [isAuthenticated, user])

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <EmployerDashboardHeader company={company} jobTitle={company?.job_title || "Job Title"} />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <EmployerStats />
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border">
          {selectedJobId ? (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedJobId(null)}
                className="text-accent hover:text-accent/90 font-medium flex items-center"
              >
                ← Back to All Jobs
              </button>
              <JobApplications jobId={selectedJobId} />
            </div>
          ) : (
            <JobPostingList onSelectJob={setSelectedJobId} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
