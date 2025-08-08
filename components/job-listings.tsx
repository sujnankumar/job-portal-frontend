"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, DollarSign, Clock, Briefcase, Building, ExternalLink, ChevronDown, ChevronUp, Eye, Bookmark, BookmarkCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { cn, formatDate } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/axios"

// Simple markdown to HTML converter for display
const markdownToHtml = (markdown: string) => {
  if (!markdown) return ""
  
  return markdown
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-dark-gray mb-2 mt-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-dark-gray mb-3 mt-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-dark-gray mb-4 mt-4">$1</h1>')
    .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
    .replace(/\n\n/gim, '</p><p class="mb-3">')
    .replace(/^\n/gim, '')
    .replace(/^(?!<[h|l])/gim, '<p class="mb-3">')
    .replace(/(<li.*<\/li>)/gim, '<ul class="list-disc ml-6 mb-3">$1</ul>')
    .replace(/<\/ul>\s*<ul[^>]*>/gim, '')
}

// Function to truncate HTML content
const truncateHtml = (html: string, maxLength: number = 150) => {
  if (!html) return ""
  
  // Remove HTML tags for length calculation
  const textContent = html.replace(/<[^>]*>/g, '')
  
  if (textContent.length <= maxLength) {
    return html
  }
  
  // Truncate the text and add ellipsis
  const truncatedText = textContent.substring(0, maxLength).trim()
  return truncatedText + "..."
}

// Function to truncate markdown content
const truncateMarkdown = (markdown: string, maxLength: number = 150) => {
  if (!markdown) return ""
  
  // Convert markdown to HTML first, then truncate
  const html = markdownToHtml(markdown)
  return truncateHtml(html, maxLength)
}

import type { JobFiltersState } from "./job-filters"
import Image from "next/image"

interface JobListingsProps {
  filters?: JobFiltersState // Make filters optional
  savedJobsOnly?: boolean // Add savedJobsOnly prop
}

export default function JobListings({ filters, savedJobsOnly = false }: JobListingsProps) {
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [allJobs, setAllJobs] = useState<any[]>([]) // Store all fetched jobs
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")
  const user = useAuthStore((state) => state.user)

  // Function to truncate HTML content
  const truncateHtml = (html: string, maxLength: number = 150) => {
    if (!html) return ""
    
    // Remove HTML tags for length calculation
    const textContent = html.replace(/<[^>]*>/g, '')
    
    if (textContent.length <= maxLength) {
      return html
    }
    
    // Truncate the text and add ellipsis
    const truncatedText = textContent.substring(0, maxLength).trim()
    return truncatedText + "..."
  }

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await api.get("/job/list")
        setAllJobs(res.data) // Store all jobs
        console.log("Jobs fetched:", res.data)
      } catch (err: any) {
        setError("Failed to load jobs. Please try again later.")
      } finally {
        // Keep loading true until saved jobs are also fetched if needed
        if (!savedJobsOnly) setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user || user.role !== "applicant" || !user.token) {
        if (savedJobsOnly) setLoading(false) // Stop loading if not logged in and showing saved
        return
      }
      try {
        const res = await api.get("/sj/saved-jobs", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
        setSavedJobs((res.data.saved_jobs || []).map((job: any) => job.job_id))
      } catch (err) {
        if (savedJobsOnly) setError("Failed to load saved jobs.")
      } finally {
        if (savedJobsOnly) setLoading(false) // Stop loading after saved jobs fetch
      }
    }
    fetchSavedJobs()
  }, [user, savedJobsOnly])

  const toggleExpand = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId)
  }

  const toggleSaveJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSaveError("")
    setSaveSuccess("")
    if (!user || user.role !== "applicant" || !user.token) {
      setSaveError("You must be logged in as a job seeker to save jobs.")
      return
    }
    if (savedJobs.includes(jobId)) {
      // Unsave job
      try {
        await api.delete(`/sj/remove-saved-job/${jobId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
        setSavedJobs((prev) => prev.filter((id) => id !== jobId))
        setSaveSuccess("Job removed from saved jobs.")
      } catch (err: any) {
        setSaveError(err.response?.data?.detail || "Failed to remove saved job.")
      }
      return
    }
    // Save job
    try {
      await api.post(`/sj/save-job/${jobId}`, {}, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      setSavedJobs((prev) => [...prev, jobId])
      setSaveSuccess("Job saved successfully.")
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || "Failed to save job.")
    }
  }

  // Determine which jobs to display based on savedJobsOnly prop
  const jobsToDisplay = savedJobsOnly
    ? allJobs.filter((job) => savedJobs.includes(job.job_id))
    : allJobs

  // Filtering logic applied to jobsToDisplay
  const filteredJobs = jobsToDisplay.filter((job) => {
    // Apply filters only if they exist
    if (filters) {
      // Job Type
      if (filters.jobTypes && filters.jobTypes.length > 0 && !filters.jobTypes.includes(job.employment_type)) return false
      // Experience
      if (filters.experienceLevels && filters.experienceLevels.length > 0 && !filters.experienceLevels.includes(job.experience_level)) return false
      // Location Type
      if (filters.locationTypes && filters.locationTypes.length > 0 && !filters.locationTypes.includes(job.location_type)) return false
      // Salary
      // if (job.min_salary < filters.salaryRange[0] || job.max_salary > filters.salaryRange[1]) return false
      // Location
      if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
      // Industry
      if (filters.industries && filters.industries.length > 0 && !filters.industries.includes(job.industry)) return false
      // Skills
      if (filters.skills && filters.skills.length > 0 && !filters.skills.every(skill => job.skills?.includes(skill))) return false
      // Search (title, keywords, company)
      if (filters.search && filters.search.trim() !== "") {
        const searchLower = filters.search.toLowerCase()
        if (
          !(job.title?.toLowerCase().includes(searchLower) ||
            job.company?.toLowerCase().includes(searchLower) ||
            (job.tags && job.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))))
        ) {
          return false
        }
      }
    }
    return true
  })

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading jobs...</div>
  }
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      {saveError && <div className="text-center text-red-500 text-sm">{saveError}</div>}
      {saveSuccess && <div className="text-center text-green-600 text-sm">{saveSuccess}</div>}
      {filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <img src="/job_placeholder.jpeg" alt="No jobs" className="w-20 h-20 mb-4 opacity-60" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {savedJobsOnly ? "You haven't saved any jobs yet" : "No jobs match your criteria"}
          </h2>
          <p className="text-gray-500 text-sm mb-2">
            {savedJobsOnly ? "Start saving jobs you're interested in!" : "Try adjusting your filters or check back later."}
          </p>
        </div>
      ) : (
        filteredJobs.map((job, index) => (
          <div key={ job.job_id} className="relative">
            {/* Job Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Job Card Header */}
              <div
                className="p-5 cursor-pointer hover:bg-light-gray transition-colors"
                onClick={() => toggleExpand(job.job_id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                    <Image
                      src={job.logo_url || "/company_placeholder.jpeg"}
                      width={48}
                      height={48}
                      alt={`${job.company} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium text-dark-gray">{job.title}</h3>
                          {job.isNew && <Badge className="ml-2 bg-accent text-white">New</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">{job.company}</p>
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
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-3.5 w-3.5 mr-1" />
                        {job.min_salary} - {job.max_salary}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {job.employment_type}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(job.tags || []).slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="bg-light-gray text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {(job.tags && job.tags.length > 3) && (
                        <Badge variant="outline" className="bg-light-gray text-xs">
                          +{job.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 text-xs text-gray-500">Posted {formatDate(job.posted_at)}</div>
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
                  <div className="space-y-4">
                    {job.description && (
                      <div>
                        <h4 className="font-medium text-dark-gray mb-2">Job Description</h4>
                        <div className="text-gray-700 text-sm" dangerouslySetInnerHTML={{
                          __html: truncateMarkdown(job.description, 200)
                        }} />
                      </div>
                    )}
                    
                    {job.requirements && (
                      <div>
                        <h4 className="font-medium text-dark-gray mb-2">Requirements</h4>
                        <div className="text-gray-700 text-sm" dangerouslySetInnerHTML={{
                          __html: truncateMarkdown(job.requirements, 150)
                        }} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mt-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(job.tags || []).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="bg-white text-xs">
                          {tag}
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
                        <Button className="w-full bg-accent hover:bg-accent/90">View Full Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
