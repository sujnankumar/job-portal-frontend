"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, DollarSign, Clock, Bookmark, BookmarkCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import api from "@/lib/axios"

interface Job {
  job_id: string
  title: string
  location: string
  location_type: string
  employment_type: string
  min_salary: string
  max_salary: string
  show_salary: boolean
  description: string
  skills: string[]
  posted_at: string
}

export default function CompanyJobs({ companyId }: { companyId: string }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get(`/job/company/${companyId}`)
        console.log("Fetched jobs:", response.data)
        setJobs(response.data)
      } catch (err) {
        setError("Failed to fetch jobs.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [companyId])

  const toggleExpand = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId)
  }

  const toggleSaveJob = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
  }

  if (loading) {
    return <div>Loading jobs...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (jobs.length === 0) {
    return <div>No jobs found for this company.</div>
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job.job_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Job Card Header */}
          <div
            className="p-5 cursor-pointer hover:bg-light-gray transition-colors"
            onClick={() => toggleExpand(job.job_id)}
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-dark-gray">{job.title}</h3>
                </div>

                <button
                  onClick={(e) => toggleSaveJob(job.job_id, e)}
                  className="text-gray-400 hover:text-accent"
                  aria-label={savedJobs.includes(job.job_id) ? "Unsave job" : "Save job"}
                >
                  {savedJobs.includes(job.job_id) ? (
                    <BookmarkCheck className="h-5 w-5 text-accent" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-y-2 gap-x-3 text-xs text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {job.location} ({job.location_type})
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-3.5 w-3.5 mr-1" />
                  {job.show_salary
                    ? `$${job.min_salary} - $${job.max_salary}`
                    : "Salary not disclosed"}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {job.employment_type}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="outline" className="bg-light-gray text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 3 && (
                  <Badge variant="outline" className="bg-light-gray text-xs">
                    +{job.skills.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Posted on {new Date(job.posted_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Expanded Job Details */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              expandedJob === job.job_id ? "max-h-96" : "max-h-0",
            )}
          >
            <div className="border-t border-gray-100 p-5 bg-light-gray">
              <div className="text-gray-700 mb-4">{job.description}</div>

              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="bg-white text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-initial"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSaveJob(job.job_id, e)
                    }}
                  >
                    {savedJobs.includes(job.job_id) ? "Saved" : "Save"}
                  </Button>
                  <Link href={`/jobs/${job.job_id}`} className="flex-1 sm:flex-initial">
                    <Button className="w-full bg-accent hover:bg-accent/90">View Job</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-8">
        <Button variant="outline">View All Jobs</Button>
      </div>
    </div>
  )
}