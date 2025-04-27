"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  MapPin,
  Building,
  Briefcase,
  DollarSign,
  Mail,
  Phone,
  Globe,
  Linkedin,
  AlertCircle,
  MessageSquare,
  Download,
  Trash2,
  ExternalLink,
} from "lucide-react"
import ApplicationTimeline from "@/components/application-timeline"

// Mock application data - in a real app, you would fetch this based on the ID
const mockApplication = {
  id: "app-123456",
  jobId: "job-789012",
  appliedDate: "2023-11-15T14:30:00Z",
  status: "interview", // pending, interview, accepted, rejected
  job: {
    title: "Senior Frontend Developer",
    company: "Tech Innovations Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120,000 - $160,000/year",
    logo: "/abstract-circuit-board.png",
    deadline: "2023-12-15T23:59:59Z",
  },
  resume: {
    filename: "jane-smith-resume.pdf",
    url: "#", // In a real app, this would be a URL to the actual file
    lastUpdated: "2023-11-10T09:15:00Z",
  },
  coverLetter: {
    content:
      "Dear Hiring Manager,\n\nI am writing to express my interest in the Senior Frontend Developer position at Tech Innovations Inc. With over 5 years of experience in frontend development using React, TypeScript, and modern CSS frameworks, I believe I would be a valuable addition to your team.\n\nIn my current role at Digital Solutions, I have led the development of several key projects, including a complete redesign of our customer portal which resulted in a 40% increase in user engagement. I have a strong focus on creating accessible, performant, and visually appealing user interfaces.\n\nI am particularly excited about the opportunity to work at Tech Innovations because of your commitment to pushing the boundaries of web technology and your collaborative approach to product development.\n\nThank you for considering my application. I look forward to the possibility of discussing how my skills and experience align with your needs.\n\nSincerely,\nJane Smith",
  },
  personalInfo: {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "(555) 123-4567",
    website: "janesmith.dev",
    linkedin: "linkedin.com/in/janesmith",
  },
  customMessage:
    "I'm particularly interested in this role because of the opportunity to work with cutting-edge technologies and contribute to innovative products that make a difference.",
  timeline: [
    {
      date: "2023-11-15T14:30:00Z",
      status: "applied",
      description: "Application submitted",
    },
    {
      date: "2023-11-18T10:45:00Z",
      status: "reviewed",
      description: "Application reviewed by employer",
    },
    {
      date: "2023-11-22T16:20:00Z",
      status: "interview",
      description: "Invited for an interview",
    },
  ],
  interview: {
    date: "2023-12-05T13:00:00Z",
    type: "Video Call (Zoom)",
    duration: "45 minutes",
    interviewers: ["Alex Johnson (Engineering Manager)", "Sarah Chen (Senior Developer)"],
    instructions:
      "Please prepare to discuss your experience with React and TypeScript. There will also be a short coding exercise to demonstrate problem-solving skills.",
  },
}

export default function ApplicationDetailsPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user?.role === "employer") {
      router.push("/employer/dashboard")
    } else if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, user, router])

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Format date without time
  const formatDateOnly = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending Review
          </Badge>
        )
      case "interview":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Interview Scheduled
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Accepted
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Not Selected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleWithdrawApplication = () => {
    console.log("Withdrawing application:", params.id)
    setIsWithdrawDialogOpen(false)
    // In a real app, you would make an API call here
    // Then redirect to applications list
    router.push("/applications")
  }

  return (
    <ProtectedRoute allowedRoles={["applicant"]}>
      <div className="container mx-auto max-w-5xl py-8 px-4">
        {/* Back button and title */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push("/applications")} className="mr-2 p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-dark-gray">Application Details</h1>
        </div>

        {/* Application header */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <div className="mr-4 flex-shrink-0">
                  <Image
                    src={mockApplication.job.logo || "/placeholder.svg"}
                    alt={mockApplication.job.company}
                    width={60}
                    height={60}
                    className="rounded-md"
                  />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-dark-gray">{mockApplication.job.title}</CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    {mockApplication.job.company} • {mockApplication.job.location}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                {getStatusBadge(mockApplication.status)}
                <div className="text-sm text-gray-500">Applied on {formatDateOnly(mockApplication.appliedDate)}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center bg-light-gray px-3 py-1 rounded-full">
                <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                {mockApplication.job.type}
              </div>
              <div className="flex items-center bg-light-gray px-3 py-1 rounded-full">
                <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                {mockApplication.job.salary}
              </div>
              <div className="flex items-center bg-light-gray px-3 py-1 rounded-full">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                {mockApplication.job.location}
              </div>
              <div className="flex items-center bg-light-gray px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                Deadline: {formatDateOnly(mockApplication.job.deadline)}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/jobs/${mockApplication.jobId}`)}
              className="text-gray-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Job Details
            </Button>

            <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Withdraw Application
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Application</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to withdraw your application for {mockApplication.job.title} at{" "}
                    {mockApplication.job.company}? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleWithdrawApplication}>
                    Withdraw Application
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        {/* Interview alert if applicable */}
        {mockApplication.status === "interview" && mockApplication.interview && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-800 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Upcoming Interview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Clock className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800">{formatDate(mockApplication.interview.date)}</div>
                    <div className="text-sm text-blue-700">
                      {mockApplication.interview.type} • {mockApplication.interview.duration}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Building className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800">Interviewers</div>
                    <div className="text-sm text-blue-700">{mockApplication.interview.interviewers.join(", ")}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800">Instructions</div>
                    <div className="text-sm text-blue-700">{mockApplication.interview.instructions}</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Add to Calendar
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Application details tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resume">Resume & Cover Letter</TabsTrigger>
            <TabsTrigger value="timeline">Application Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Full Name</div>
                    <div className="font-medium">{mockApplication.personalInfo.name}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {mockApplication.personalInfo.email}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {mockApplication.personalInfo.phone}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Website</div>
                    <div className="font-medium flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-400" />
                      {mockApplication.personalInfo.website}
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <div className="text-sm text-gray-500">LinkedIn</div>
                    <div className="font-medium flex items-center">
                      <Linkedin className="h-4 w-4 mr-2 text-gray-400" />
                      {mockApplication.personalInfo.linkedin}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Message */}
            {mockApplication.customMessage && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Message to the Employer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-light-gray p-4 rounded-md text-gray-700 whitespace-pre-line">
                    {mockApplication.customMessage}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Application Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-32 text-sm text-gray-500">Current Status:</div>
                    <div>{getStatusBadge(mockApplication.status)}</div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-32 text-sm text-gray-500">Applied On:</div>
                    <div className="font-medium">{formatDate(mockApplication.appliedDate)}</div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-32 text-sm text-gray-500">Last Updated:</div>
                    <div className="font-medium">
                      {formatDate(mockApplication.timeline[mockApplication.timeline.length - 1].date)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interview Details (if applicable) */}
            {mockApplication.status === "interview" && mockApplication.interview && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Interview Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-32 text-sm text-gray-500 mt-0.5">Date & Time:</div>
                      <div className="font-medium">{formatDate(mockApplication.interview.date)}</div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-32 text-sm text-gray-500 mt-0.5">Format:</div>
                      <div className="font-medium">{mockApplication.interview.type}</div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-32 text-sm text-gray-500 mt-0.5">Duration:</div>
                      <div className="font-medium">{mockApplication.interview.duration}</div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-32 text-sm text-gray-500 mt-0.5">Interviewers:</div>
                      <div>
                        {mockApplication.interview.interviewers.map((interviewer, index) => (
                          <div key={index} className="font-medium">
                            {interviewer}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start">
                      <div className="w-32 text-sm text-gray-500 mt-0.5">Instructions:</div>
                      <div className="text-gray-700">{mockApplication.interview.instructions}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Add to Calendar
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          {/* Resume & Cover Letter Tab */}
          <TabsContent value="resume" className="space-y-6">
            {/* Resume */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-light-gray p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="font-medium">{mockApplication.resume.filename}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Last updated: {formatDateOnly(mockApplication.resume.lastUpdated)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button variant="outline" size="sm" className="text-gray-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Resume
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cover Letter */}
            {mockApplication.coverLetter && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Cover Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-light-gray p-4 rounded-md text-gray-700 whitespace-pre-line">
                    {mockApplication.coverLetter.content}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ApplicationTimeline timeline={mockApplication.timeline} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap gap-3 justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="text-gray-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Recruiter
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send a message to the recruiter</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button onClick={() => router.push("/applications")} variant="outline">
            Back to Applications
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  )
}