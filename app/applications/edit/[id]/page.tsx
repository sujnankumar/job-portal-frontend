"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Calendar, Clock, ArrowLeft } from "lucide-react"
import axios from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"

export default function EditApplicationPage() {
  const router = useRouter()
  const params = useParams()
  const paramId = params?.id as string // Could be application ID or job ID

  const { user, isAuthenticated, hydrated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [application, setApplication] = useState<any>(null)
  const [actualApplicationId, setActualApplicationId] = useState<string>(paramId) // Track actual application ID
  const [form, setForm] = useState({
    cover_letter: "",
    linked_in: "",
    portfolio: ""
  })
  const [resume, setResume] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!hydrated) return
    if (!user || !user.token) {
      setError("You must be logged in to edit an application.")
      setLoading(false)
      return
    }
    
    // Fetch application data for editing
    async function fetchData() {
      setLoading(true)
      setError("")
      try {
        if (!user || !user.token) throw new Error("Not authenticated")
        
        let res;
        // First, try to get by application ID
        try {
          res = await axios.get(`/application/application_for_edit/${paramId}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          })
        } catch (err: any) {
          // If that fails, try to get by job ID using the new route
          if (err.response?.status === 404 || err.response?.status === 400) {
            res = await axios.get(`/application/application_for_edit_by_job/${paramId}`, {
              headers: { Authorization: `Bearer ${user.token}` }
            })
            // If we got the application by job ID, we need to extract the application ID for future API calls
            if (res.data?.application?.application_id) {
              // Update the URL to use the application ID instead of job ID
              const appId = res.data.application.application_id
              router.replace(`/applications/edit/${appId}`)
              // Update our local applicationId for the edit API call
              setActualApplicationId(appId)
            }
          } else {
            throw err
          }
        }
        
        const data = res.data.application
        setApplication(data)
        setForm({
          cover_letter: data.cover_letter || "",
          linked_in: data.linked_in || "",
          portfolio: data.portfolio || ""
        })
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load application data")
      } finally {
        setLoading(false)
      }
    }
    
    if (paramId) fetchData()
  }, [paramId, hydrated, user])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, resume: "Please upload a PDF or Word document" })
        return
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, resume: "File size must be less than 5MB" })
        return
      }
      setResume(file)
      setErrors({ ...errors, resume: "" })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!form.cover_letter?.trim()) {
      newErrors.cover_letter = "Cover letter is required"
    } else if (form.cover_letter.trim().length < 50) {
      newErrors.cover_letter = "Cover letter must be at least 50 characters"
    }
    
    if (form.linked_in && !/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+\/?$/.test(form.linked_in)) {
      newErrors.linked_in = "Please enter a valid LinkedIn profile URL"
    }
    
    if (form.portfolio && !/^https?:\/\/[^\s]+$/.test(form.portfolio)) {
      newErrors.portfolio = "Please enter a valid portfolio URL (including http:// or https://)"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    if (!validateForm()) {
      return
    }
    
    setSubmitting(true)
    if (!user || !user.token) {
      setError("You must be logged in to edit an application.")
      setSubmitting(false)
      return
    }
    
    try {
      const formData = new FormData()
      
      // Add form fields
      if (form.cover_letter) formData.append('cover_letter', form.cover_letter)
      if (form.linked_in) formData.append('linked_in', form.linked_in)
      if (form.portfolio) formData.append('portfolio', form.portfolio)
      
      // Add resume file if selected
      if (resume) {
        formData.append('resume', resume)
      }
      
      await axios.put(
        `/application/edit_application/${actualApplicationId}`,
        formData,
        { 
          headers: { 
            "Content-Type": "multipart/form-data", 
            Authorization: `Bearer ${user.token}` 
          } 
        }
      )
      
      setSuccess("Application updated successfully!")
      setTimeout(() => {
        router.push("/applications")
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update application")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["applicant"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error && !application) {
    return (
      <ProtectedRoute allowedRoles={["applicant"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="text-red-500 mb-4">
                <FileText className="h-12 w-12 mx-auto mb-2" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Application</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.push("/applications")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["applicant"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-4xl py-8 px-4">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/applications")}
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
            
            <div className="flex items-center gap-4 mb-2">
              <FileText className="h-8 w-8 text-accent" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Application</h1>
                {application && (
                  <p className="text-gray-600">
                    Application for: <span className="font-medium">{application.job_title}</span>
                  </p>
                )}
              </div>
            </div>
            
            {application?.job_deadline && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                <Calendar className="h-4 w-4" />
                <span>
                  Application deadline: {new Date(application.job_deadline).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Application Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cover Letter */}
                <div className="space-y-2">
                  <Label htmlFor="cover_letter" className="text-sm font-medium text-gray-700">
                    Cover Letter *
                  </Label>
                  <Textarea
                    id="cover_letter"
                    name="cover_letter"
                    value={form.cover_letter}
                    onChange={handleChange}
                    rows={6}
                    className="resize-none"
                    placeholder="Write a compelling cover letter that highlights your qualifications..."
                  />
                  {errors.cover_letter && (
                    <p className="text-red-500 text-xs mt-1">{errors.cover_letter}</p>
                  )}
                </div>

                {/* LinkedIn Profile */}
                <div className="space-y-2">
                  <Label htmlFor="linked_in" className="text-sm font-medium text-gray-700">
                    LinkedIn Profile
                  </Label>
                  <Input
                    id="linked_in"
                    name="linked_in"
                    type="url"
                    value={form.linked_in}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.linked_in && (
                    <p className="text-red-500 text-xs mt-1">{errors.linked_in}</p>
                  )}
                </div>

                {/* Portfolio */}
                <div className="space-y-2">
                  <Label htmlFor="portfolio" className="text-sm font-medium text-gray-700">
                    Portfolio Website
                  </Label>
                  <Input
                    id="portfolio"
                    name="portfolio"
                    type="url"
                    value={form.portfolio}
                    onChange={handleChange}
                    placeholder="https://your-portfolio.com"
                  />
                  {errors.portfolio && (
                    <p className="text-red-500 text-xs mt-1">{errors.portfolio}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resume Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Resume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Resume */}
                {application?.resume_filename && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Current Resume:</p>
                        <p className="text-sm text-gray-600">{application.resume_filename}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload New Resume */}
                <div className="space-y-2">
                  <Label htmlFor="resume" className="text-sm font-medium text-gray-700">
                    Upload New Resume (Optional)
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:bg-accent/90"
                      />
                    </div>
                    {resume && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Upload className="h-4 w-4" />
                        {resume.name}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Supported formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                  {errors.resume && (
                    <p className="text-red-500 text-xs mt-1">{errors.resume}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Application Status Info */}
            {application && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Application Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <p className="text-sm text-gray-900 capitalize">{application.status}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Applied On</Label>
                      <p className="text-sm text-gray-900">
                        {application.applied_at ? new Date(application.applied_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }) : "N/A"}
                      </p>
                    </div>
                    {application.updated_at && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                        <p className="text-sm text-gray-900">
                          {new Date(application.updated_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                className="bg-accent hover:bg-accent/90 text-white" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Application"
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/applications")}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
