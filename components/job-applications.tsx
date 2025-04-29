"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
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
import InterviewScheduler from "@/components/interview-scheduler"
import ResumeActions from "@/components/resume-actions"

interface JobApplicationsProps {
  jobId: string
}

export default function JobApplications({ jobId }: JobApplicationsProps) {
  const { user } = useAuthStore()
  const [job, setJob] = useState<any>(null)
  const [jobApplications, setJobApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState<Record<string, boolean>>({})

  // Add state for dialog open, resume base64, loading, and error
  const [dialogOpenMap, setDialogOpenMap] = useState<Record<string, boolean>>({})
  const [resumeBase64Map, setResumeBase64Map] = useState<Record<string, string>>({})
  const [resumeLoadingMap, setResumeLoadingMap] = useState<Record<string, boolean>>({})
  const [resumeErrorMap, setResumeErrorMap] = useState<Record<string, string>>({})

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
        return <Badge className="bg-green-100 text-green-800 font-normal">Accepted</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 font-normal">Rejected</Badge>
      default:
        return null
    }
  }

  const toggleChat = (appId: string) => {
    setChatOpen((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }))
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
                      Applied: {new Date(app.appliedDate).toLocaleDateString()}
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="bg-light-gray px-2 py-1 rounded-md text-sm font-medium text-dark-gray">
                    {app.matchScore}% Match
                  </div>
                </div>
              </div>

              {app.status === "interview" && app.interviewDate && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md text-sm flex items-center">
                  <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                  <div>
                    <span className="font-medium text-blue-700">Interview Scheduled: </span>
                    <span className="text-blue-600">
                      {new Date(app.interviewDate).toLocaleDateString()} at {app.interviewTime}
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
                      <Button variant="outline" onClick={() => toggleChat(app.id)}>
                        <MessageSquare className="h-4 w-4 mr-1" /> Chat
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                      <Calendar className="h-3.5 w-3.5 mr-1" /> Schedule Interview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Schedule Interview</DialogTitle>
                      <DialogDescription>
                        Schedule an interview with {app.candidate.name} for the {job.title} position
                      </DialogDescription>
                    </DialogHeader>
                    <InterviewScheduler candidateName={app.candidate.name} candidateId={app.candidate.id} jobId={job.id} />
                  </DialogContent>
                </Dialog>

                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Accept
                </Button>

                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                  <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                </Button>

                <Button variant="outline" size="sm" className="ml-auto" onClick={() => toggleChat(app.id)}>
                  <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat
                </Button>
              </div>

              <Dialog open={chatOpen[app.id]} onOpenChange={() => toggleChat(app.id)}>
                <DialogTrigger asChild>
                  {/* <Button variant="outline" size="sm" className="ml-auto">
                    <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat
                  </Button> */}
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-dark-gray">Chat with {app.candidate.name}</h4>
                    </div>
                    <div className="h-48 overflow-y-auto border rounded-md p-3 mb-3 bg-light-gray">
                      <div className="flex justify-start mb-2">
                        <div className="bg-white rounded-lg p-2 max-w-[80%] shadow-sm">
                          <p className="text-sm">
                            Hello! Thanks for your application. Do you have any questions about the role?
                          </p>
                          <p className="text-xs text-gray-500 mt-1">10:30 AM</p>
                        </div>
                      </div>
                      <div className="flex justify-end mb-2">
                        <div className="bg-accent text-white rounded-lg p-2 max-w-[80%] shadow-sm">
                          <p className="text-sm">
                            Hi! Yes, I was wondering about the tech stack you're currently using and the team structure.
                          </p>
                          <p className="text-xs text-white/70 mt-1">10:32 AM</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white rounded-lg p-2 max-w-[80%] shadow-sm">
                          <p className="text-sm">
                            We're using React, TypeScript, and Next.js for frontend, with Node.js and PostgreSQL for
                            backend. The team consists of 5 frontend devs, 4 backend devs, 2 designers, and a product
                            manager.
                          </p>
                          <p className="text-xs text-gray-500 mt-1">10:35 AM</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Type a message..." className="flex-1" />
                      <Button className="bg-accent hover:bg-accent/90">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
