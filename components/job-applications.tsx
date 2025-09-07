"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import { formatDate } from "@/lib/utils"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Eye,
  Phone,
  Send,
  X,
  CodeSquare,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import InterviewScheduler from "@/components/interview-scheduler"
import ResumeActions from "@/components/resume-actions"
// import EmployerJobChat from "@/components/employer-job-chat-open"

interface JobApplicationsProps {
  jobId: string
}

interface Candidate {
  id: string;
  name: string;
  avatar: string;
}

interface JobApplication {
  candidate: Candidate;
}

export default function JobApplications({ jobId }: JobApplicationsProps) {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [job, setJob] = useState<any>(null)
  const [jobApplications, setJobApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)

  // Confirmation modal states
  const [showAcceptConfirm, setShowAcceptConfirm] = useState<string | null>(null)
  const [showRejectConfirm, setShowRejectConfirm] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Multi-chat state: array of open chats with applicantId, jobId, etc.
  // const [openChats, setOpenChats] = useState<{
  //   applicantId: string,
  //   jobId: string,
  //   applicantName: string,
  //   applicantAvatar: string,
  //   jobTitle: string
  // }[]>([])

  

  const openChat = (app: JobApplication) => {
    setOpenChats((prev) =>
      prev.find((c) => c.applicantId === app.candidate.id)
        ? prev
        : [
            ...prev,
            {
              applicantId: app.candidate.id,
              jobId: job.id, // Assuming job state is populated and has an id
              applicantName: app.candidate.name,
              applicantAvatar: app.candidate.avatar,
              jobTitle: job.title, // Assuming job state is populated and has a title
            },
          ]
    )
  }

  const closeChat = (applicantId: string) => {
    setOpenChats((prev) => prev.filter((c) => c.applicantId !== applicantId))
  }

  // Accept application function
  const handleAcceptApplication = async (applicationId: string) => {
    setIsProcessing(true)
    try {
      const response = await api.post(
        `/application-management/accept/${applicationId}`,
        { message: feedbackMessage },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      )

      if (response.data.success) {
        // Update the application in the local state
        setJobApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId
              ? { ...app, status: "accepted", employer_feedback: feedbackMessage }
              : app
          )
        )

        toast({
          title: "Application Accepted",
          description: `Successfully accepted ${response.data.applicant_name}'s application.`,
          variant: "default",
        })

        // Reset states
        setShowAcceptConfirm(null)
        setFeedbackMessage("")
      }
    } catch (error: any) {
      console.error("Error accepting application:", error)
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to accept application",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Reject application function
  const handleRejectApplication = async (applicationId: string) => {
    setIsProcessing(true)
    try {
      const response = await api.post(
        `/application-management/reject/${applicationId}`,
        { 
          message: feedbackMessage,
          reason: rejectionReason 
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      )

      if (response.data.success) {
        // Update the application in the local state
        setJobApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId
              ? { 
                  ...app, 
                  status: "rejected", 
                  employer_feedback: feedbackMessage,
                  rejection_reason: rejectionReason 
                }
              : app
          )
        )

        toast({
          title: "Application Rejected",
          description: `Successfully rejected ${response.data.applicant_name}'s application.`,
          variant: "default",
        })

        // Reset states
        setShowRejectConfirm(null)
        setFeedbackMessage("")
        setRejectionReason("")
      }
    } catch (error: any) {
      console.error("Error rejecting application:", error)
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to reject application",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Add state for dialog open, resume base64, loading, and error
  const [dialogOpenMap, setDialogOpenMap] = useState<Record<string, boolean>>({})
  const [resumeBase64Map, setResumeBase64Map] = useState<Record<string, string>>({})
  const [resumeLoadingMap, setResumeLoadingMap] = useState<Record<string, boolean>>({})
  const [resumeErrorMap, setResumeErrorMap] = useState<Record<string, string>>({})
  // Track interview dialog open state per application
  const [interviewDialogOpen, setInterviewDialogOpen] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.token || !jobId) return
      setLoading(true)
      setError("")
      try {
        const res = await api.get(`/emp/job_applications/${jobId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        setJob(res.data.jobDetails)
        setJobApplications(res.data.applications)
        console.log("Application Details : ", res.data.applications)
      } catch (err) {
        setError("Failed to load job applications.")
        setJob(null)
        setJobApplications([])
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [user, jobId])

  // Filter applications based on search term and status
  const filteredApplications = jobApplications.filter((app) => {
    const matchesSearch =
      app.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidate.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "review":
        return <Badge className="bg-amber-100 text-amber-800 font-normal">Under Review</Badge>
      case "interview":
        return <Badge className="bg-blue-100 text-blue-800 font-normal">Interview Scheduled</Badge>
      case "accepted":
      case "selected":
        return <Badge className="bg-green-100 text-green-800 font-normal">
          {status === "selected" ? "Selected" : "Accepted"}
        </Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 font-normal">Rejected</Badge>
      default:
        return null
    }
  }

  // Function to fetch resume when dialog opens
  const handleDialogOpenChange = async (open: boolean, app: any) => {
    setDialogOpenMap((prev) => ({ ...prev, [app.id]: open }))
    if (open && !resumeBase64Map[app.id] && !resumeLoadingMap[app.id]) {
      setResumeLoadingMap((prev) => ({ ...prev, [app.id]: true }))
      setResumeErrorMap((prev) => ({ ...prev, [app.id]: "" }))
      try {
        const response = await api.get(`/emp/get_resume_by_user/${job.id}/${app.candidate.id}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
          responseType: "blob",
        })
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          const base64String = result.split(",")[1]
          setResumeBase64Map((prev) => ({ ...prev, [app.id]: base64String }))
        }
        reader.onerror = () => setResumeErrorMap((prev) => ({ ...prev, [app.id]: "Failed to load resume preview." }))
        reader.readAsDataURL(response.data)
      } catch (err) {
        setResumeErrorMap((prev) => ({ ...prev, [app.id]: "Failed to load resume preview." }))
      } finally {
        setResumeLoadingMap((prev) => ({ ...prev, [app.id]: false }))
      }
    }
  }

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Loading...</div>
  }
  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>
  }
  if (!job) {
    return <div className="py-8 text-center text-gray-500">Job not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-dark-gray">{job.title}</h2>
          <p className="text-gray-500">
            {job.company} • {job.location}
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-800 font-normal">
          {jobApplications.length} Application{jobApplications.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search candidates..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="review">Under Review</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="selected">Selected</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No applications found.</p>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <div key={app.id} className="border rounded-lg p-4 hover:bg-light-gray transition-colors">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={app.candidate.avatar || "/placeholder.svg"}
                      width={40}
                      height={40}
                      alt={app.candidate.name}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-dark-gray">{app.candidate.name}</h3>
                    <p className="text-sm text-gray-500">{app.candidate.email}</p>
                  </div>
                </div>

                <div className="md:ml-auto flex flex-col md:flex-row items-start md:items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      Applied: {formatDate(app.appliedDate)}
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="bg-light-gray px-2 py-1 rounded-md text-sm font-medium text-dark-gray">
                    {app.matchScore}% Match
                  </div>
                </div>
              </div>

        {app.status === "interview" && (app.interview_date || app.interviewDate) && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md text-sm flex items-center">
                  <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                  <div>
                    <span className="font-medium text-blue-700">Interview Scheduled: </span>
                    <span className="text-blue-600">
          {formatDate(app.interview_date || app.interviewDate)} at {(app.interview_time || app.interviewTime)}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Dialog onOpenChange={(open) => handleDialogOpenChange(open, app)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3.5 w-3.5 mr-1" /> View Application
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Application Details</DialogTitle>
                      <DialogDescription>
                        Application for {job.title} from {app.candidate.name}
                      </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="profile" className="mt-4">
                      <TabsList className="w-full">
                        <TabsTrigger value="profile" className="flex-1">
                          Candidate Profile
                        </TabsTrigger>
                        <TabsTrigger value="resume" className="flex-1">
                          Resume
                        </TabsTrigger>
                        <TabsTrigger value="coverLetter" className="flex-1">
                          Cover Letter
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="profile" className="p-4 border rounded-md mt-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden">
                            <Image
                              src={app.candidate.avatar || "/placeholder.svg"}
                              width={64}
                              height={64}
                              alt={app.candidate.name}
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{app.candidate.name}</h3>
                            <p className="text-gray-500">{app.candidate.location}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                              <FileText className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium">Email</p>
                              <p className="text-gray-600">{app.candidate.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                              <Phone className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium">Phone</p>
                              <p className="text-gray-600">{app.candidate.phone}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">React</Badge>
                            <Badge variant="outline">TypeScript</Badge>
                            <Badge variant="outline">JavaScript</Badge>
                            <Badge variant="outline">HTML/CSS</Badge>
                            <Badge variant="outline">Next.js</Badge>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="resume" className="p-4 border rounded-md mt-4">
                        {resumeLoadingMap[app.id] ? (
                          <div className="text-center py-8 text-gray-500">Loading resume...</div>
                        ) : resumeErrorMap[app.id] ? (
                          <div className="text-center py-8 text-red-500">{resumeErrorMap[app.id]}</div>
                        ) : resumeBase64Map[app.id] ? (
                            <div className="flex flex-col items-center justify-center">
                              {/* Try to embed PDF using <embed>. If browser doesn't support, show download link */}
                              <embed
                              src={`data:application/pdf;base64,${resumeBase64Map[app.id]}`}
                              type="application/pdf"
                              className="w-full max-w-2xl h-[500px] border rounded-lg mb-4"
                              />
                              {/* <iframe
                                src={`data:application/pdf;base64,${resumeBase64Map[app.id]}`}
                                title="Resume Preview"
                                className="w-full max-w-2xl h-[500px] border rounded-lg mb-4"
                              /> */}
                              <ResumeActions base64File={resumeBase64Map[app.id]} filename={`resume_${app.candidate.id}.pdf`} />
                            </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">Resume not available.</div>
                        )}
                      </TabsContent>
                      <TabsContent value="coverLetter" className="p-4 border rounded-md mt-4">
                        <div className="bg-light-gray p-6 rounded-lg">
                          <div className="whitespace-pre-line text-gray-700">{app.coverLetter}</div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <div className="flex justify-end gap-2 mt-4">
                      {resumeBase64Map[app.id] ? (
                        <a
                          href={`data:application/pdf;base64,${resumeBase64Map[app.id]}`}
                          download={`resume_${app.candidate.id}.pdf`}
                        >
                          <Button variant="outline">
                            <Download className="h-4 w-4 mr-1" /> Download Resume
                          </Button>
                        </a>
                      ) : (
                        <Button variant="outline" disabled>
                          <Download className="h-4 w-4 mr-1" /> Loading Resume...
                        </Button>
                      )}
                      {/* <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={() => openChat(app)}
                        disabled={openChats.some((c) => c.applicantId === app.candidate.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" /> Chat
                      </Button> */}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Schedule / Reschedule Interview (hidden if accepted/rejected/selected) */}
                {!(app.status === "accepted" || app.status === "rejected" || app.status === "selected") && (
                  <Dialog 
                    open={!!interviewDialogOpen[app.id]} 
                    onOpenChange={(open) => setInterviewDialogOpen(prev => ({ ...prev, [app.id]: open }))}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setInterviewDialogOpen(prev => ({ ...prev, [app.id]: true }))}>
                        <Calendar className="h-3.5 w-3.5 mr-1" /> {app.status === "interview" ? "Reschedule Interview" : "Schedule Interview"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{app.status === "interview" ? "Reschedule Interview" : "Schedule Interview"}</DialogTitle>
                        <DialogDescription>
                          {app.status === "interview" ? "Update the interview details" : "Schedule an interview"} with {app.candidate.name} for the {job.title} position
                        </DialogDescription>
                      </DialogHeader>
                      <InterviewScheduler 
                        candidateName={app.candidate.name} 
                        candidateId={app.candidate.id} 
                        jobId={job.id}
                        isReschedule={app.status === "interview"}
                        existingDate={(app.interview_date || app.interviewDate) || null}
                        existingTime={(app.interview_time || app.interviewTime) || null}
                        onSuccess={(data) => {
                          setJobApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "interview", interview_date: data.date, interview_time: data.startTime, interviewDate: data.date, interviewTime: data.startTime } : a))
                          setInterviewDialogOpen(prev => ({ ...prev, [app.id]: false }))
                        }}
                        onCancel={() => setInterviewDialogOpen(prev => ({ ...prev, [app.id]: false }))}
                      />
                    </DialogContent>
                  </Dialog>
                )}

                {app.status === "accepted" || app.status === "rejected" ? (
                  // Show status buttons when already processed
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`
                        ${app.status === "accepted" 
                          ? "border-green-500 text-green-700 bg-green-50" 
                          : "border-red-500 text-red-700 bg-red-50"
                        }
                      `}
                      disabled
                    >
                      {app.status === "accepted" ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Accepted
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Rejected
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  // Show action buttons for pending applications
                  <>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => setShowAcceptConfirm(app.id)}
                      disabled={isProcessing}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> Accept
                    </Button>

                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => setShowRejectConfirm(app.id)}
                      disabled={isProcessing}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                    </Button>
                  </>
                )}
                
                {/* Chat button - always available */}
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openChat(app)}
                  disabled={openChats.some((c) => c.applicantId === app.candidate.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" /> Chat
                </Button> */}
              </div>
            </div>
          ))
        )}
        
      </div>

      {/* Accept Confirmation Modal */}
      <Dialog open={!!showAcceptConfirm} onOpenChange={(open) => !open && setShowAcceptConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this application? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Message to candidate (optional)
              </label>
              <Textarea
                placeholder="Welcome to the team! We're excited to have you..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAcceptConfirm(null)
                  setFeedbackMessage("")
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => showAcceptConfirm && handleAcceptApplication(showAcceptConfirm)}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Yes, Accept"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Modal */}
      <Dialog open={!!showRejectConfirm} onOpenChange={(open) => !open && setShowRejectConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this application? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Reason for rejection (optional)
              </label>
              <Textarea
                placeholder="Position has been filled, insufficient experience, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Message to candidate (optional)
              </label>
              <Textarea
                placeholder="Thank you for your interest. We'll keep your profile on file..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectConfirm(null)
                  setFeedbackMessage("")
                  setRejectionReason("")
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={() => showRejectConfirm && handleRejectApplication(showRejectConfirm)}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Yes, Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Render all open chat modals, stacked horizontally */}
      {/* {openChats.map((chat, idx) => (
        <EmployerJobChat
          key={chat.applicantId}
          jobId={chat.jobId}
          applicantId={chat.applicantId}
          applicantName={chat.applicantName}
          applicantAvatar={chat.applicantAvatar}
          jobTitle={chat.jobTitle}
          onClose={() => closeChat(chat.applicantId)}
          // Position each modal with a horizontal offset
          style={{ right: 24 + idx * 400, bottom: 24, position: 'fixed', zIndex: 50 }}
        />
      ))} */}
    </div>
  )
}
