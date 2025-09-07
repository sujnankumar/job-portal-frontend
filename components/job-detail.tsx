"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, IndianRupee, Clock, Briefcase, Building, Calendar, Share2, Bookmark, BookmarkCheck, X, Facebook, Twitter, Send, Copy, MessageCircle, Loader2, AlertTriangle, UserPlus, UserCheck } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import MapEmbed from "@/components/map-embed"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/axios"
import { formatDate, formatDateShort, toIST } from "@/lib/utils"

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

interface JobDetails {
  skills: string[];
  [key: string]: any;
}

export default function JobDetail({ jobId, jobDetails, is_saved }: { jobId: string; jobDetails: JobDetails; is_saved: boolean }) {
  const [isSaved, setIsSaved] = useState(is_saved)
  // Inline save/copy feedback replaced with toasts
  const [isApplied, setIsApplied] = useState(false)
  const [applicationData, setApplicationData] = useState<any>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  // copySuccess removed in favor of toast
  const [showEmployerApplyModal, setShowEmployerApplyModal] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoLoading, setLogoLoading] = useState(false)
  const [companyDetails, setCompanyDetails] = useState<any>(null)
  const [companyLoading, setCompanyLoading] = useState(false)
  // Follow state
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const user = useAuthStore((state) => state.user)
  const job = jobDetails
  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const isJobSeeker = user?.role === "applicant"
  const companyId = companyDetails?.company_id || job.company_id

  // Format salary with fallbacks: hide => "Undisclosed", missing => "Undisclosed"
  const formatSalaryDisplay = (j: any) => {
    if (j && j.show_salary === false) return "Undisclosed"
    const min = Number(j?.min_salary)
    const max = Number(j?.max_salary)
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
    const checkApplied = async () => {
      if (!user?.token) return
      try {
        const res = await api.get(`/gma/is-applied/${jobId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        setIsApplied(res.data.is_applied)
        
        // If applied, fetch application details
        if (res.data.is_applied) {
          try {
            const appRes = await api.get(`/ga/application/job_id/${jobId}`, {
              headers: { Authorization: `Bearer ${user.token}` }
            })
            // console.log("Fetched Application:", appRes.data)
            // console.log("Job Details:", job)
            setApplicationData(appRes.data)
          } catch (appErr) {
            console.error("Error fetching application details:", appErr)
          }
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    checkApplied()
  }, [jobId, user?.token])

  // Fetch company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!job.company_id) {
        setCompanyDetails(null)
        return
      }

      setCompanyLoading(true)
      try {
        const res = await api.get(`/company/${job.company_id}`)
        setCompanyDetails(res.data)
      } catch (error) {
        console.error("Failed to fetch company details:", error)
        setCompanyDetails(null)
      } finally {
        setCompanyLoading(false)
      }
    }

    fetchCompanyDetails()
  }, [job.company_id])

  // Fetch company logo
  useEffect(() => {
    const fetchCompanyLogo = async () => {
      if (!companyDetails?.logo) {
        setLogoUrl(null)
        return
      }

      setLogoLoading(true)
      try {
        const res = await api.get(`/company/logo/${companyDetails.logo}`, {
          responseType: "blob",
        })
        const url = URL.createObjectURL(res.data)
        setLogoUrl(url)
      } catch (error) {
        console.error("Failed to fetch company logo:", error)
        setLogoUrl(null)
      } finally {
        setLogoLoading(false)
      }
    }

    fetchCompanyLogo()

    // Cleanup function to revoke object URL
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl)
      }
    }
  }, [companyDetails?.logo])

  // Cleanup logo URL when component unmounts
  useEffect(() => {
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl)
      }
    }
  }, [logoUrl])

  // Check if user is following this company (reuse logic from companies/[id])
  useEffect(() => {
    const checkFollowing = async () => {
      if (!isJobSeeker || !user?.token || !companyId) return setIsFollowing(false)
      try {
        const res = await api.get("/following", { headers: { Authorization: `Bearer ${user.token}` } })
        const following = res.data?.following || []
        setIsFollowing(following.includes(companyId))
      } catch {
        setIsFollowing(false)
      }
    }
    checkFollowing()
  }, [isJobSeeker, user?.token, companyId])

  const handleFollowCompany = async () => {
    if (!isJobSeeker) return toast.error("Only job seekers can follow companies")
    if (!user?.token) return toast.error("Please login to follow companies")
    if (!companyId) return
    setFollowLoading(true)
    try {
      const response = await api.post(`/follow/${companyId}`, {}, { headers: { Authorization: `Bearer ${user.token}` } })
      setIsFollowing(true)
      toast.success(response?.data?.detail || "You are now following this company!")
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to follow company")
    } finally {
      setFollowLoading(false)
    }
  }

  const handleUnfollowCompany = async () => {
    if (!isJobSeeker) return toast.error("Only job seekers can unfollow companies")
    if (!user?.token) return toast.error("Please login to unfollow companies")
    if (!companyId) return
    setFollowLoading(true)
    try {
      const response = await api.delete(`/follow/${companyId}`, { headers: { Authorization: `Bearer ${user.token}` } })
      setIsFollowing(false)
      toast.success(response?.data?.detail || "You have unfollowed this company.")
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to unfollow company")
    } finally {
      setFollowLoading(false)
    }
  }

  const toggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation && e.stopPropagation()
    if (!user || user.role !== "applicant" || !user.token) {
      toast.error("You must be logged in as a job seeker to save jobs.")
      return
    }
    if (isSaved) {
      // Unsave job
      try {
        await api.delete(`/sj/remove-saved-job/${jobId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
  setIsSaved(false)
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
  setIsSaved(true)
  toast.success("Job saved")
    } catch (err: any) {
  toast.error(err.response?.data?.detail || "Failed to save job")
    }
  }

  const handleCopy = () => {
    if (navigator.clipboard && shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      toast.success("Link copied to clipboard")
    }
  }

  const canEditApplication = () => {
    if (!applicationData) return { canEdit: false, reason: "Application data not available" }
    // console.log("Checking application data:", applicationData.application)
    // Check if application is rejected or withdrawn
    if (applicationData.application.status === "rejected" || applicationData.application.status === "withdrawn" || applicationData.application.status === "interview") {
      return { 
        canEdit: false, 
        reason: `Cannot edit ${applicationData.application.status === "interview"?"interview scheduled":applicationData.application.status} application` 
      }
    }
    
    // Check if job deadline has passed
    const deadline = toIST(job.expires_at)
    const now = toIST(new Date())
    if (deadline < now) {
      return { 
        canEdit: false, 
        reason: "Application deadline has passed" 
      }
    }
    
    return { canEdit: true, reason: "" }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[350px] relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setShowShareModal(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4">Share Job Link</h2>
            <div className="mb-3 text-sm text-gray-700">Share this link via</div>
            <div className="flex gap-3 mb-4 justify-center">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="bg-blue-100 hover:bg-blue-200 rounded-full p-2" title="Share on Facebook">
                <Facebook className="w-5 h-5 text-blue-600" />
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="bg-blue-100 hover:bg-blue-200 rounded-full p-2" title="Share on Twitter">
                <Twitter className="w-5 h-5 text-sky-500" />
              </a>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="bg-green-100 hover:bg-green-200 rounded-full p-2" title="Share on WhatsApp">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="bg-cyan-100 hover:bg-cyan-200 rounded-full p-2" title="Share on Telegram">
                <Send className="w-5 h-5 text-cyan-600" />
              </a>
            </div>
            <div className="mb-2 text-sm text-gray-700">Or copy link</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-2 py-1 border rounded bg-gray-100 text-xs text-gray-700"
                aria-label="Job Share Link"
              />
              <button
                onClick={handleCopy}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
            </div>
            {/* copy success toast now */}
          </div>
        </div>
      )}
      {/* Job Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
            {logoLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <Image
                src={logoUrl || job.logo_url || "/company_placeholder.jpeg"}
                alt={companyDetails?.company_name || job.company || "Company logo"}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {job.title && <h1 className="text-2xl font-bold text-dark-gray mb-1">{job.title}</h1>}
            <p className="text-lg text-accent mb-1">
              {companyLoading ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading company...
                </span>
              ) : (
                companyDetails?.company_name || job.company || "Company"
              )}
            </p>
            {!companyLoading && companyDetails?.industry && (
              <p className="text-sm text-gray-500 mb-2">{companyDetails.industry}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-600 items-center">
              {job.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </div>
              )}
              <div className="flex items-center">
                <IndianRupee className="h-4 w-4 mr-1" />
                {formatSalaryDisplay(job)}
              </div>
              {job.employment_type && (
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {job.employment_type}
                </div>
              )}
              {job.posted_at && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDate(job.posted_at)}
                </div>
              )}
              {(job.status === 'expired' || (job.expires_at && new Date(job.expires_at) < new Date())) && (
                <Badge className="bg-red-500 text-white">Expired</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          {user?.role === 'employer' ? (
            <Button className="bg-gray-400 hover:bg-gray-500" type="button" onClick={() => setShowEmployerApplyModal(true)}>
              Apply Now
            </Button>
          ) : (job.status === 'expired' || (job.expires_at && new Date(job.expires_at) < new Date())) ? (
            <Button className="bg-gray-400 cursor-not-allowed" disabled>
              Application Closed
            </Button>
          ) : isApplied ? (
            <>
              <Button className="bg-gray-400 cursor-not-allowed" disabled>
                Applied
              </Button>
              <TooltipProvider>
                {(() => {
                  const editStatus = canEditApplication()
                  if (editStatus.canEdit) {
                    return (
                      <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                        Manage Application
                      </Button>
                    )
                  } else {
                    return (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button variant="outline" disabled className="cursor-not-allowed">
                              Edit Application
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{editStatus.reason}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  }
                })()}
              </TooltipProvider>
            </>
          ) : (
            <Link href={`/apply/${jobId}`}>
              <Button className="bg-accent hover:bg-accent/90">Apply Now</Button>
            </Link>
          )}

          {user?.role === 'applicant' && (
            <Button variant="outline" onClick={toggleSave}>
              {isSaved ? (
                <>
                  <BookmarkCheck className="h-4 w-4 mr-2 text-accent" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save Job
                </>
              )}
            </Button>
          )}

          <Button variant="outline" onClick={() => setShowShareModal(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
  {/* Toasts now handle save success/error messages */}
        {showEmployerApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[340px] relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                onClick={() => setShowEmployerApplyModal(false)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-3 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Action Not Allowed</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Only job seekers can apply to jobs. Employer accounts are restricted from applying.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEmployerApplyModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Content - Mobile (Tabs) */}
      <div className="md:hidden">
        <Tabs defaultValue="description" className="p-6">
          <TabsList className="mb-6">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-6">
            <div className="space-y-4">
              {job.description && (
                <div>
                  <h3 className="text-lg font-semibold text-dark-gray mb-3">Job Description</h3>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(job.description) }} />
                </div>
              )}
              
              {job.requirements && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-dark-gray mb-3">Requirements</h3>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(job.requirements) }} />
                </div>
              )}
              
              {job.skills && job.skills.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-dark-gray mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-light-gray">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-dark-gray mb-3">Job Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  {job.employment_type && (
                    <div className="flex items-start">
                      <Briefcase className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-dark-gray">Job Type</div>
                        <div className="text-gray-600">{job.employment_type}</div>
                      </div>
                    </div>
                  )}
                  {job.experience && (
                    <div className="flex items-start">
                      <Building className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-dark-gray">Experience</div>
                        <div className="text-gray-600">{job.experience}</div>
                      </div>
                    </div>
                  )}
                  {job.expires_at && (
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-dark-gray">Application Deadline</div>
                        {formatDate(job.expires_at)}
                      </div>
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-dark-gray">Location</div>
                        <div className="text-gray-600">{job.location}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                {logoLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <Image
                    src={logoUrl || job.logo_url || "/company_placeholder.jpeg"}
                    alt={companyDetails?.company_name || job.company || "Company logo"}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-dark-gray mb-1">
                  {companyDetails?.company_name || job.company || "Company"}
                </h3>
                {companyDetails?.company_id && (
                  <Link href={`/companies/${companyDetails.company_id}`} className="text-accent hover:underline text-sm">
                    View Company Profile
                  </Link>
                )}
                {companyDetails?.industry && (
                  <p className="text-sm text-gray-500 mt-1">{companyDetails.industry}</p>
                )}
                {companyDetails?.employee_count && (
                  <p className="text-sm text-gray-500">{companyDetails.employee_count} employees</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {job.benefits && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-dark-gray mb-3">Benefits & Perks</h3>
                  <p className="text-gray-700">{job.benefits}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {companyDetails?.company_id && (
                <Link href={`/companies/${companyDetails.company_id}`}>
                  <Button variant="outline">View All Jobs</Button>
                </Link>
              )}
              {isJobSeeker ? (
                <Button
                  variant={isFollowing ? "default" : "outline"}
                  onClick={isFollowing ? handleUnfollowCompany : handleFollowCompany}
                  disabled={followLoading || !companyId}
                  title={isFollowing ? "Unfollow company" : "Follow company"}
                >
                  {followLoading ? (
                    "Processing..."
                  ) : isFollowing ? (
                    <><UserCheck className="h-4 w-4 mr-2" />Following</>
                  ) : (
                    <><UserPlus className="h-4 w-4 mr-2" />Follow Company</>
                  )}
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  <UserPlus className="h-4 w-4 mr-2" />Follow Company
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="location">
            <div className="space-y-4">
              {job.location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-dark-gray">Job Location</div>
                    <div className="text-gray-600">{job.location}</div>
                  </div>
                </div>
              )}
              <div className="h-80 w-full rounded-lg overflow-hidden border border-gray-200 mt-4">
                <MapEmbed location={job.location || "NA"} />
              </div>
              <div className="mt-4">
                <p className="text-gray-700">
                  This position is {job.location && job.location.includes("Remote")
                    ? "remote with occasional visits to our office"
                    : "based in our office at"} {job.location ? job.location.replace(" (Remote)", "") : "NA"}.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Content - Desktop (Two-column layout) */}
      <div className="hidden md:flex p-6">
        <div className="flex-1 pr-6">
          {/* Left Column - Job Description */}
          <div className="space-y-6">
            {job.description && (
              <div>
                <h3 className="text-lg font-semibold text-dark-gray mb-3">Job Description</h3>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(job.description) }} />
              </div>
            )}
            
            {job.requirements && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-dark-gray mb-3">Requirements</h3>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(job.requirements) }} />
              </div>
            )}
            
            {job.skills && job.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-dark-gray mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="bg-light-gray">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-80 flex-shrink-0">
          {/* Right Column - Company Details */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                  {logoLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <Image
                      src={logoUrl || job.logo_url || "/company_placeholder.jpeg"}
                      alt={companyDetails?.company_name || job.company || "Company logo"}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-dark-gray mb-1">
                    {companyDetails?.company_name || job.company || "Company"}
                  </h3>
                  {companyDetails?.company_id && (
                    <Link href={`/companies/${companyDetails.company_id}`} className="text-accent hover:underline text-sm">
                      View Company Profile
                    </Link>
                  )}
                  {companyDetails?.industry && (
                    <p className="text-sm text-gray-500 mt-1">{companyDetails.industry}</p>
                  )}
                  {companyDetails?.employee_count && (
                    <p className="text-sm text-gray-500">{companyDetails.employee_count} employees</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {companyDetails?.company_id && (
                  <Link href={`/companies/${companyDetails.company_id}`}>
                    <Button variant="outline" className="w-full">
                      View All Jobs
                    </Button>
                  </Link>
                )}
                {isJobSeeker ? (
                  <Button
                    variant={isFollowing ? "default" : "outline"}
                    className="w-full"
                    onClick={isFollowing ? handleUnfollowCompany : handleFollowCompany}
                    disabled={followLoading || !companyId}
                    title={isFollowing ? "Unfollow company" : "Follow company"}
                  >
                    {followLoading ? (
                      "Processing..."
                    ) : isFollowing ? (
                      <><UserCheck className="h-4 w-4 mr-2" />Following</>
                    ) : (
                      <><UserPlus className="h-4 w-4 mr-2" />Follow Company</>
                    )}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    <UserPlus className="h-4 w-4 mr-2" />Follow Company
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-dark-gray mb-3">Job Details</h3>
              <div className="space-y-3">
                {job.employment_type && (
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-dark-gray">Job Type</div>
                      <div className="text-gray-600">{job.employment_type}</div>
                    </div>
                  </div>
                )}
                {job.experience && (
                  <div className="flex items-start">
                    <Building className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-dark-gray">Experience</div>
                      <div className="text-gray-600">{job.experience}</div>
                    </div>
                  </div>
                )}
                {job.expires_at && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-dark-gray">Application Deadline</div>
                      {formatDate(job.expires_at)}
                    </div>
                  </div>
                )}
                {job.posted_at && (
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-dark-gray">Posted</div>
                      <div className="text-gray-600">
                        {formatDate(job.posted_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-dark-gray mb-3">Benefits & Perks</h3>
              {job.benefits && <p className="text-gray-700">{job.benefits}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-dark-gray mb-3">Location</h3>
              {job.location && (
                <div className="flex items-start mb-3">
                  <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                  <div className="text-gray-600">{job.location}</div>
                </div>
              )}
              <div className="h-48 w-full rounded-lg overflow-hidden border border-gray-200 mb-3">
                <MapEmbed location={job.location || "NA"} />
              </div>
              <p className="text-sm text-gray-700">
                This position is {job.location && job.location.includes("Remote")
                  ? "remote with occasional visits to our office"
                  : "based in our office at"} {job.location ? job.location.replace(" (Remote)", "") : "NA"}.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-6 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">
              Job ID: {jobId} • Posted {job.posted_at ? formatDate(job.posted_at) : "NA"}
            </p>
          </div>

          <Link href={`/report-job/${jobId}`}>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              Report Job
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
