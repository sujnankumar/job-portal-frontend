"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, DollarSign, Clock, Briefcase, Building, Calendar, Share2, Bookmark, BookmarkCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import MapEmbed from "@/components/map-embed"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/axios"


interface JobDetails {
  skills: string[];
  // benefits?: string[]; // Explicitly define the type for benefits
  [key: string]: any; // Add other properties as needed
}

export default function JobDetail({ jobId, jobDetails, is_saved }: { jobId: string; jobDetails: JobDetails; is_saved: boolean }) {
  const [isSaved, setIsSaved] = useState(is_saved)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")
  const [isApplied, setIsApplied] = useState(false)
  const user = useAuthStore((state) => state.user)
  const job = jobDetails

  useEffect(() => {
    const checkApplied = async () => {
      if (!user?.token) return
      try {
        const res = await api.get(`/gma/is-applied/${jobId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        setIsApplied(res.data.is_applied)
      } catch (err) {
        // Optionally handle error
      }
    }
    checkApplied()
  }, [jobId, user?.token])

  const toggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation && e.stopPropagation()
    setSaveError("")
    setSaveSuccess("")
    if (!user || user.role !== "applicant" || !user.token) {
      setSaveError("You must be logged in as a job seeker to save jobs.")
      return
    }
    if (isSaved) {
      // Unsave job
      try {
        await api.delete(`/jobs/remove-saved-job/${jobId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
        setIsSaved(false)
        setSaveSuccess("Job removed from saved jobs.")
      } catch (err: any) {
        setSaveError(err.response?.data?.detail || "Failed to remove saved job.")
      }
      return
    }
    // Save job
    try {
      await api.post(`/jobs/save-job/${jobId}`, {}, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      setIsSaved(true)
      setSaveSuccess("Job saved successfully.")
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || "Failed to save job.")
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Job Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
            <Image
              src={job.logo || "/placeholder.svg"}
              alt={job.company_details?.company_name || "Company logo"}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            {job.title && <h1 className="text-2xl font-bold text-dark-gray mb-1">{job.title}</h1>}
            {job.company_details?.company_name && <span className="text-accent">{job.company_details.company_name}</span>}
            <div className="mt-3 flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-600">
              {job.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </div>
              )}
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                {job.min_salary && job.max_salary ? `${job.min_salary}-${job.max_salary}` : "NA"}
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
                  {new Date(job.posted_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          {isApplied ? (
            <>
              <Button className="bg-gray-400 cursor-not-allowed" disabled>
                Applied
              </Button>
              <Link href={`/applications/edit/${jobId}`}>
                <Button variant="outline">Edit Application</Button>
              </Link>
            </>
          ) : (
            <Link href={`/apply/${jobId}`}>
              <Button className="bg-accent hover:bg-accent/90">Apply Now</Button>
            </Link>
          )}

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

          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
        {saveError && <div className="text-red-500 text-sm mt-2">{saveError}</div>}
        {saveSuccess && <div className="text-green-600 text-sm mt-2">{saveSuccess}</div>}
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
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.description }} />
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
                        {new Date(job.expires_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
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
                <Image
                  src={job.logo || "/placeholder.svg"}
                  alt={job.company_details?.company_name || "Company logo"}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>

              <div>
                {job.company_details?.company_name && (
                  <h3 className="text-xl font-semibold text-dark-gray mb-1">{job.company_details.company_name}</h3>
                )}
                {job.company_details?.company_id && (
                  <Link href={`/companies/${job.company_details.company_id}`} className="text-accent hover:underline text-sm">
                    View Company Profile
                  </Link>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {job.company_details?.description && <p className="text-gray-700">{job.company_details?.description}</p>}
              {job.benefits && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-dark-gray mb-3">Benefits & Perks</h3>
                  <p className="text-gray-700">{job.benefits}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {job.company_details?.company_id && (
                <Link href={`/companies/${job.company_details.company_id}`}>
                  <Button variant="outline">View All Jobs</Button>
                </Link>
              )}
              <Button variant="outline">Follow Company</Button>
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
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.description }} />
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
                  <Image
                    src={job.logo || "/placeholder.svg"}
                    alt={job.company_details?.company_name || "Company logo"}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>

                <div>
                  {job.company_details?.company_name && (
                    <h3 className="text-xl font-semibold text-dark-gray mb-1">{job.company_details.company_name}</h3>
                  )}
                  {job.company_details?.company_id && (
                    <Link href={`/companies/${job.company_details.company_id}`} className="text-accent hover:underline text-sm">
                      View Company Profile
                    </Link>
                  )}
                </div>
              </div>

              {job.company_details?.description && <p className="text-gray-700 mb-4">{job.company_details.description}</p>}
              <div className="flex flex-col gap-2">
                {job.company_details?.company_id && (
                  <Link href={`/companies/${job.company_details.company_id}`}>
                    <Button variant="outline" className="w-full">
                      View All Jobs
                    </Button>
                  </Link>
                )}
                <Button variant="outline" className="w-full">
                  Follow Company
                </Button>
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
                      {new Date(job.expires_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                )}
                {job.posted_at && (
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-dark-gray">Posted</div>
                      <div className="text-gray-600">
                        {new Date(job.posted_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
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
              Job ID: {jobId} • Posted {job.posted_at ? new Date(job.posted_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }) : "NA"}
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
