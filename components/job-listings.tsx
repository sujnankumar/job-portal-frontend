"use client"

import React, { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { MapPin, IndianRupee, Clock, Briefcase, Building, ExternalLink, ChevronDown, ChevronUp, Eye, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
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

// Local image component that mirrors company-listings blob fetch logic
function JobLogo({ job }: { job: any }) {
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    let objectUrl: string | null = null

    const fetchLogo = async () => {
      // Determine identifier or URL to fetch
      const logoId: string | null = job?.logo ?? null
      const logoUrlStr: string | null = job?.logo_url ?? null

      if (!logoId && !logoUrlStr) {
        setLogoUrl(null)
        return
      }

      setLoading(true)
      try {
        let path = ''
        if (logoId) {
          path = `/company/logo/${logoId}`
        } else if (logoUrlStr) {
          // Try to extract the id from '/company/logo/{id}' pattern to ensure same-origin request
          const m = String(logoUrlStr).match(/\/company\/logo\/([^\/?#]+)/)
          path = m ? `/company/logo/${m[1]}` : logoUrlStr
        }
        const res = await api.get(path, { responseType: 'blob' })
        objectUrl = URL.createObjectURL(res.data)
        setLogoUrl(objectUrl)
      } catch (err) {
        // Fallback to no logo
        setLogoUrl(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLogo()

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [job?.logo, job?.logo_url])

  return (
    <>
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      ) : (
        <Image
          src={logoUrl || "/company_placeholder.jpeg"}
          width={48}
          height={48}
          alt={`${job?.company || 'Company'} logo`}
          className="w-full h-full object-contain"
        />
      )}
    </>
  )
}

interface JobListingsProps {
  filters?: JobFiltersState
  savedJobsOnly?: boolean
  showExpired?: boolean
  limit?: number // limit number of jobs shown (e.g., dashboard preview)
  hideControls?: boolean // hide pagination & page-size controls
}

export default function JobListings({ filters, savedJobsOnly = false, showExpired = false, limit, hideControls = false }: JobListingsProps) {
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [allJobs, setAllJobs] = useState<any[]>([]) // Store all fetched jobs
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const topRef = useRef<HTMLDivElement | null>(null)
  // Removed inline saveError/saveSuccess display in favor of toasts
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [pageSizeMode, setPageSizeMode] = useState<string>("10")
  const [customPageSize, setCustomPageSize] = useState<string>("")
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

  // Format salary display with sensible fallbacks
  const formatSalaryDisplay = (job: any) => {
    // If employer chose to hide salary explicitly
    if (job && job.show_salary === false) return "Undisclosed"
    const minRaw = job?.min_salary
    const maxRaw = job?.max_salary
    const min = Number(minRaw)
    const max = Number(maxRaw)
    const hasMin = Number.isFinite(min)
    const hasMax = Number.isFinite(max)
    if (!hasMin && !hasMax) return "Undisclosed"
    if (hasMin && hasMax) {
      if (min === max) return `${min.toLocaleString('en-IN')}/year`
      return `${min.toLocaleString('en-IN')} - ${max.toLocaleString('en-IN')}/year`
    }
    if (hasMin) return `${min.toLocaleString('en-IN')}/year`
    if (hasMax) return `${max.toLocaleString('en-IN')}/year`
    return "Undisclosed"
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
    if (!user || user.role !== "applicant" || !user.token) {
      toast.error("You must be logged in as a job seeker to save jobs.")
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
  toast.success("Job removed from saved jobs")
      } catch (err: any) {
  toast.error(err.response?.data?.detail || "Failed to remove saved job")
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
  toast.success("Job saved")
    } catch (err: any) {
  toast.error(err.response?.data?.detail || "Failed to save job")
    }
  }

  // Determine which jobs to display based on savedJobsOnly prop
  const jobsToDisplay = savedJobsOnly
    ? allJobs.filter((job) => savedJobs.includes(job.job_id))
    : allJobs

  // Filtering logic applied to jobsToDisplay
  const filteredJobs = jobsToDisplay.filter((job) => {
    // Exclude expired unless showExpired explicitly true
    if (!showExpired && (job.status === 'expired' || (job.expires_at && new Date(job.expires_at) < new Date()))) {
      return false
    }
    // Apply filters only if they exist
    if (filters) {
      // Job Type
      if (filters.jobTypes && filters.jobTypes.length > 0 && !filters.jobTypes.includes(job.employment_type)) return false
      // Experience
      if (filters.experienceLevels && filters.experienceLevels.length > 0 && !filters.experienceLevels.includes(job.experience_level)) return false
      // Location Type
      if (filters.locationTypes && filters.locationTypes.length > 0 && !filters.locationTypes.includes(job.location_type)) return false
      // Salary (convert to LPA). Backend strings are annual INR. Lakh = 100,000.
      // If user selects the upper bound (20), treat it as open-ended so jobs above 20 LPA are still shown.
      if (filters.salaryRange) {
        const minLpa = job.min_salary ? parseInt(job.min_salary, 10) / 100000 : 0
        const maxLpa = job.max_salary ? parseInt(job.max_salary, 10) / 100000 : minLpa
        const [selMin, selMax] = filters.salaryRange
        const openEnded = selMax === 20
        if (openEnded) {
          // Only enforce lower bound; include anything whose max salary is >= selMin
            if (maxLpa < selMin) return false
        } else {
          if (maxLpa < selMin || minLpa > selMax) return false
        }
      }
      // Location
      if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
      // Industry (robust matching). Selected industries are exact names like "Technology".
      if (filters.industries && filters.industries.length > 0) {
        const selected = filters.industries.map(i => i.toLowerCase())
        // Collect possible job industry fields
        const rawIndustries: any[] = []
        if (job.job_category) rawIndustries.push(job.job_category)

        // Normalize to flat string array
        const jobIndustryValues = rawIndustries
          .flat()
          .filter(Boolean)
          .map((v: any) => String(v).split(/[,|]/)) // split if comma or pipe separated
          .flat()
          .map(s => s.trim().toLowerCase())
          .filter(Boolean)

        if (jobIndustryValues.length === 0) return false
        const intersects = jobIndustryValues.some(iv => selected.includes(iv))
        if (!intersects) return false
      }
      // Skills
      if (filters.skills && filters.skills.length > 0 && !filters.skills.every(skill => job.skills?.includes(skill))) return false
      // Simple Search (title, company, tags) when booleanQuery not provided
      if (filters.search && filters.search.trim() !== "" && !filters.booleanQuery) {
        const searchLower = filters.search.toLowerCase()
        const haystack = [job.title, job.company, ...(job.tags || [])].filter(Boolean).map((s: string) => s.toLowerCase())
        if (!haystack.some(h => h.includes(searchLower))) return false
      }

      // Boolean search evaluation (experimental)
      if (filters.booleanQuery && filters.booleanQuery.trim()) {
        const expr = filters.booleanQuery.trim()
        // Tokenize: parentheses, AND, OR, NOT, words / quoted phrases
        const tokens = expr.match(/\(|\)|AND|OR|NOT|"[^"]+"|[^\s()]+/gi) || []
        // Build evaluation by mapping terms to booleans over extended corpus
        const textCorpus = (
          [
            job.title,
            job.company,
            job.department,
            job.description,
            job.requirements,
            job.benefits,
            job.employment_type,
            job.job_category,
            job.location,
            job.location_type,
            job.experience_level,
            job.status,
            job.visibility,
            Array.isArray(job.skills) ? job.skills.join(' ') : job.skills,
          ]
            .concat(job.tags || [])
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
        )
        // Pre-normalized variant where hyphens removed & multiple spaces collapsed
        const normalizedCorpus = textCorpus.replace(/-/g, ' ').replace(/\s+/g, ' ')
        const evalTokens = tokens.map(t => {
          const up = t.toUpperCase()
          if (up === 'AND' || up === 'OR' || up === 'NOT' || t === '(' || t === ')') return up
          const cleaned = t.replace(/^"|"$/g, '').toLowerCase()
          const cleanedNorm = cleaned.replace(/-/g, ' ').replace(/\s+/g, ' ')
          const present = textCorpus.includes(cleaned)
            || normalizedCorpus.includes(cleanedNorm)
            || (cleanedNorm !== cleaned && textCorpus.includes(cleanedNorm))
          return present ? 'true' : 'false'
        })
        // Convert NOT to unary !, AND to &&, OR to ||
        let jsExpr = evalTokens.join(' ')
          .replace(/\bNOT\b/g, '!')
          .replace(/\bAND\b/g, '&&')
          .replace(/\bOR\b/g, '||')
        // Safety: allow only true/false/!/&/|/parens/space
        if (/[^truefals!&|()\s]/i.test(jsExpr.replace(/true|false/g,''))) {
          // If expression has unknown chars, fallback to simple search fail-safe
          return false
        }
        try {
          // eslint-disable-next-line no-eval
          const result = eval(jsExpr)
          if (!result) return false
        } catch {
          return false
        }
      }
    }
    return true
  })

  // Reset to first page when filters or showExpired change
  useEffect(() => {
    setPage(1)
  }, [JSON.stringify(filters), showExpired])

  const limitedJobs = typeof limit === 'number' ? filteredJobs.slice(0, limit) : filteredJobs
  const totalJobs = limitedJobs.length
  const totalPages = Math.max(1, Math.ceil(totalJobs / pageSize))
  if (page > totalPages) {
    setPage(totalPages)
  }
  const startIdx = (page - 1) * pageSize
  const currentPageJobsSource = limitedJobs
  const currentPageJobs = hideControls ? currentPageJobsSource : currentPageJobsSource.slice(startIdx, startIdx + pageSize)

  // Smooth scroll to the very top whenever page changes
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      // Fallback for older browsers
      try { window.scrollTo(0, 0) } catch {}
    }
  }, [page])

  const changePageSize = (val: string) => {
    setPageSizeMode(val)
    if (val === 'custom') {
      // wait for user input
      return
    }
    const num = parseInt(val, 10)
    if (!isNaN(num)) {
      setPageSize(num)
      setPage(1)
    }
  }

  const applyCustomPageSize = () => {
    let num = parseInt(customPageSize, 10)
    if (isNaN(num) || num < 1) return
    if (num > 100) num = 100
    setPageSize(num)
    setPage(1)
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading jobs...</div>
  }
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div ref={topRef} aria-hidden="true" />
  {/* Toasts handle save/unsave feedback; removed inline messages */}
  {limitedJobs.length === 0 ? (
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
  <>
  {currentPageJobs.map((job, idx) => (
    <React.Fragment key={job.job_id}>
    <div className="relative">
            {/* Job Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Job Card Header */}
              <div
                className="p-5 cursor-pointer hover:bg-light-gray transition-colors"
                onClick={() => toggleExpand(job.job_id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                    <JobLogo job={job} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="font-medium text-dark-gray">{job.title}</h3>
                          {job.isNew && <Badge className="bg-accent text-white">New</Badge>}
                          {(job.status === 'expired' || (job.expires_at && new Date(job.expires_at) < new Date())) && (
                            <Badge className="bg-red-500 text-white">Expired</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{job.company}</p>
                      </div>

                      {user?.role === 'applicant' && (
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
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-y-2 gap-x-3 text-xs text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <IndianRupee className="h-3.5 w-3.5 mr-1" />
                        {formatSalaryDisplay(job)}
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
                      {user?.role === 'applicant' && (
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
                      )}
                      <Link href={`/jobs/${job.job_id}`} className="flex-1 sm:flex-initial">
                        <Button className="w-full bg-accent hover:bg-accent/90">
                          View Full Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Sponsored Ad Placeholder after every 6th job globally (only on main listings) */}
          {( ((startIdx + idx + 1) % 6) === 0 ) && !savedJobsOnly && !limit && !hideControls && (
            <div className="relative">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center flex-wrap gap-2">
                            <h3 className="font-medium text-dark-gray">Sponsored</h3>
                            <Badge className="bg-yellow-500 text-white">Ad</Badge>
                          </div>
                          <p className="text-sm text-gray-500">Promote your job or brand here</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-y-2 gap-x-3 text-xs text-gray-600">
                        <div className="flex items-center">Reach thousands of candidates on WOWR</div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">Boost visibility with sponsored placements</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </React.Fragment>
        ))}
  {!hideControls && (
  <div className="mt-6 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Per page:</span>
              <Select value={pageSizeMode} onValueChange={changePageSize}>
                <SelectTrigger className="w-[90px] h-8 text-sm" aria-label="Jobs per page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {pageSizeMode === 'custom' && (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={customPageSize}
                    onChange={(e) => setCustomPageSize(e.target.value)}
                    onBlur={applyCustomPageSize}
                    onKeyDown={(e) => { if (e.key === 'Enter') { applyCustomPageSize(); } }}
                    className="w-20 h-8 text-sm"
                    placeholder="1-100"
                    aria-label="Custom jobs per page"
                  />
                  <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={applyCustomPageSize}>Set</Button>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Showing {Math.min(startIdx + 1, totalJobs)}–{Math.min(startIdx + pageSize, totalJobs)} of {totalJobs} jobs
            </div>
            <div className="flex flex-wrap items-center gap-1" aria-label="Pagination">
              <button
                onClick={() => page > 1 && setPage(page - 1)}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-md border text-gray-600 hover:bg-light-gray disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-md border text-sm ${p === page ? 'bg-accent text-white border-accent' : 'text-gray-700 hover:bg-light-gray'}`}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => page < totalPages && setPage(page + 1)}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-md border text-gray-600 hover:bg-light-gray disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
  </div>
  )}
        </>
      )}
    </div>
  )
}
