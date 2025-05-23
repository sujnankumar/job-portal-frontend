"use client"

import { useEffect, useState } from "react"
import JobDetail from "@/components/job-detail"
import SimilarJobs from "@/components/similar-jobs"
import JobChat from "@/components/job-chat"
import api from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import React from "react"
import OnboardingMiddleware from "@/components/auth/onboarding-middleware";


export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [job, setJob] = useState<any>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const user = useAuthStore((state) => state.user)
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    const fetchJob = async () => {
      setLoading(true)
      setError("")
      try {
        console.log("Fetching job details...")
        console.log("User Token:", user?.token)
        const res = await api.get(`/job/get-job/${id}`, {
          headers: user && user.token ? { Authorization: `Bearer ${user.token}` } : {},
        })
        setJob(res.data.job)
        setIsSaved(res.data.is_saved)
        console.log("Job details:", res.data.job)
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load job.")
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated,id, user?.token])

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading job details...</div>
  }
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }
  if (!job) {
    return <div className="text-center py-8 text-gray-500">Job not found.</div>
  }

  return (
    <OnboardingMiddleware>
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <JobDetail jobId={id} jobDetails={job} is_saved={isSaved} />
          </div>
        </div>
      </div>
      <JobChat jobId={id} employerId={job.employer_id} companyName={job.company} companyLogo={job.logo} jobTitle={job.title} />
    </OnboardingMiddleware>
  )
}
