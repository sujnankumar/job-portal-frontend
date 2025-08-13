"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, IndianRupee, Clock, Bookmark, BookmarkCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatDate } from "@/lib/utils"
import api from "@/lib/axios"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"

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
  department?: string
  experience_level?: string
  job_category?: string
  application_deadline?: string
}

  // Simple markdown -> HTML (mirrors job-detail implementation for consistency)
  const markdownToHtml = (markdown: string) => {
    if (!markdown) return ""
    return markdown
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-dark-gray mb-2 mt-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-dark-gray mb-3 mt-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-dark-gray mb-4 mt-4">$1</h1>')
      .replace(/^[*|-] (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/\n\n/gim, '</p><p class="mb-3">')
      .replace(/^\n/gim, '')
      .replace(/^(?!<[h|l])/gim, '<p class="mb-3">')
      .replace(/(<li.*<\/li>)/gim, '<ul class="list-disc ml-6 mb-3">$1</ul>')
      .replace(/<\/ul>\s*<ul[^>]*>/gim, '')
  }

  // Truncate markdown to a plain-text preview then wrap; keeps existing full markdown for job-detail page only
  const truncatedMarkdownHtml = (markdown: string, limit = 400) => {
    if (!markdown) return ""
    // Strip code blocks first
    let plain = markdown.replace(/```[\s\S]*?```/g, '')
    // Remove markdown syntax characters
    plain = plain
      .replace(/\r/g, '')
      .replace(/\n+/g, ' ') // collapse newlines
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
      .replace(/\[[^\]]+\]\([^)]*\)/g, (m) => m.replace(/\[[^\]]+\]\(([^)]*)\)/, '$1')) // links -> text
      .replace(/[#>*_`~-]/g, '')
      .trim()
    if (plain.length <= limit) {
      return markdownToHtml(markdown)
    }
    const sliced = plain.slice(0, limit).trimEnd()
    return `<p class=\"mb-3\">${sliced}...</p>`
  }

export default function CompanyJobs({ companyId, companyName }: { companyId: string, companyName: string }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get(`/job/jobs/by_company/${companyId}`)
        console.log("Fetched jobs:", response.data)
        // Handle the response structure with jobs array
        if (response.data && response.data.jobs) {
          setJobs(response.data.jobs)
        } else {
          setJobs([])
        }
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

  const toggleSaveJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user || user.role !== 'applicant' || !user.token) {
      toast.error('Login as a job seeker to save jobs')
      return
    }
    const isSaved = savedJobs.includes(jobId)
    // Optimistic update
    setSavedJobs((prev) => isSaved ? prev.filter((id) => id !== jobId) : [jobId, ...prev])
    try {
      if (isSaved) {
        await api.delete(`/sj/remove-saved-job/${jobId}`, { headers: { Authorization: `Bearer ${user.token}` } })
        toast.success('Removed from saved jobs')
      } else {
        await api.post(`/sj/save-job/${jobId}`, {}, { headers: { Authorization: `Bearer ${user.token}` } })
        toast.success('Job saved')
      }
    } catch (err: any) {
      // Revert optimistic update on failure
      setSavedJobs((prev) => isSaved ? [jobId, ...prev] : prev.filter(id => id !== jobId))
      toast.error(err?.response?.data?.detail || 'Action failed')
    }
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
                <div className="flex-1">
                  <h3 className="font-medium text-dark-gray">{job.title}</h3>
                  {job.department && (
                    <p className="text-sm text-gray-500 mt-1">{job.department}</p>
                  )}
                </div>

                <button
                  onClick={(e) => toggleSaveJob(job.job_id, e)}
                  className="text-gray-400 hover:text-accent ml-4"
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
                  <IndianRupee className="h-3.5 w-3.5 mr-1" />
                  {job.show_salary && job.min_salary && job.max_salary
                    ? (job.min_salary === job.max_salary ? 
                        `${parseInt(job.min_salary).toLocaleString('en-IN')}/year` : 
                        `${parseInt(job.min_salary).toLocaleString('en-IN')} - ${parseInt(job.max_salary).toLocaleString('en-IN')}/year`)
                    : "Salary not disclosed"}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {job.employment_type}
                </div>
                {job.experience_level && (
                  <div className="flex items-center">
                    <span className="text-xs">📋 {job.experience_level}</span>
                  </div>
                )}
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

              <div className="mt-3 text-xs text-gray-500 flex justify-between items-center">
                <span>Posted on {formatDate(job.posted_at)}</span>
                {job.application_deadline && (
                  <span className="text-red-600 font-medium">
                    Deadline: {formatDate(job.application_deadline)}
                  </span>
                )}
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
              <div className="text-gray-700 mb-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: truncatedMarkdownHtml(job.description) }} />

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
        <Button
          variant="outline"
          onClick={() => {
            if (jobs.length > 0) {
              window.location.href = `/jobs?search=${companyName}`;
            }
          }}
        >
          View All Jobs
        </Button>
      </div>
    </div>
  )
}