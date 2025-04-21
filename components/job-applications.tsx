"use client"

import { useState } from "react"
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

// Mock data for job details
const jobDetails = {
  "1": {
    id: "1",
    title: "Senior Frontend Developer",
    location: "San Francisco, CA (Remote)",
    department: "Engineering",
    company: "Tech Innovations Inc.",
    companyLogo: "/abstract-geometric-logo.png",
  },
  "2": {
    id: "2",
    title: "UX/UI Designer",
    location: "Austin, TX (Hybrid)",
    department: "Design",
    company: "Design Solutions",
    companyLogo: "/abstract-geometric-logo.png",
  },
  "3": {
    id: "3",
    title: "Product Manager",
    location: "New York, NY",
    department: "Product",
    company: "Product Ventures",
    companyLogo: "/abstract-geometric-logo.png",
  },
  "4": {
    id: "4",
    title: "Data Scientist",
    location: "Remote",
    department: "Data",
    company: "Data Insights",
    companyLogo: "/abstract-geometric-logo.png",
  },
  "5": {
    id: "5",
    title: "DevOps Engineer",
    location: "Seattle, WA",
    department: "Engineering",
    company: "Cloud Systems",
    companyLogo: "/abstract-geometric-logo.png",
  },
}

// Mock data for applications
const applications = {
  "1": [
    {
      id: "101",
      candidate: {
        id: "c1",
        name: "John Smith",
        email: "john.smith@example.com",
        avatar: "/mystical-forest-spirit.png",
        phone: "(555) 123-4567",
        location: "San Francisco, CA",
      },
      appliedDate: "2023-05-10",
      status: "review",
      resumeUrl: "#",
      coverLetter:
        "Dear Hiring Manager,\n\nI am writing to express my interest in the Senior Frontend Developer position at Tech Innovations Inc. With over 5 years of experience in frontend development using React, TypeScript, and modern JavaScript frameworks, I believe I would be a valuable addition to your team.\n\nThroughout my career, I have focused on building responsive, accessible, and performant web applications. In my current role at Digital Solutions, I have led the development of several key projects, resulting in a 40% improvement in performance metrics and a significant enhancement in user experience.\n\nI am particularly drawn to Tech Innovations Inc. because of your commitment to innovation and your focus on creating products that make a real difference. Your recent work on AI-powered accessibility tools aligns perfectly with my passion for creating inclusive web experiences.\n\nI am excited about the opportunity to bring my technical expertise and creative problem-solving skills to your team. I am confident that my experience with modern frontend technologies and my collaborative approach would make me a great fit for this role.\n\nThank you for considering my application. I look forward to the possibility of discussing how my background, skills, and experiences would benefit Tech Innovations Inc.\n\nSincerely,\nJohn Smith",
      matchScore: 92,
    },
    {
      id: "102",
      candidate: {
        id: "c2",
        name: "Emily Johnson",
        email: "emily.johnson@example.com",
        avatar: "/mystical-forest-spirit.png",
        phone: "(555) 234-5678",
        location: "Oakland, CA",
      },
      appliedDate: "2023-05-08",
      status: "interview",
      resumeUrl: "#",
      coverLetter: "I am interested in this position...",
      matchScore: 88,
      interviewDate: "2023-05-18",
      interviewTime: "2:00 PM EST",
    },
    {
      id: "103",
      candidate: {
        id: "c3",
        name: "Michael Brown",
        email: "michael.brown@example.com",
        avatar: "/mystical-forest-spirit.png",
        phone: "(555) 345-6789",
        location: "San Jose, CA",
      },
      appliedDate: "2023-05-05",
      status: "review",
      resumeUrl: "#",
      coverLetter: "I am interested in this position...",
      matchScore: 75,
    },
    {
      id: "104",
      candidate: {
        id: "c4",
        name: "Sarah Wilson",
        email: "sarah.wilson@example.com",
        avatar: "/mystical-forest-spirit.png",
        phone: "(555) 456-7890",
        location: "Palo Alto, CA",
      },
      appliedDate: "2023-05-12",
      status: "accepted",
      resumeUrl: "#",
      coverLetter: "I am interested in this position...",
      matchScore: 95,
    },
    {
      id: "105",
      candidate: {
        id: "c5",
        name: "David Lee",
        email: "david.lee@example.com",
        avatar: "/mystical-forest-spirit.png",
        phone: "(555) 567-8901",
        location: "Mountain View, CA",
      },
      appliedDate: "2023-05-15",
      status: "rejected",
      resumeUrl: "#",
      coverLetter: "I am interested in this position...",
      matchScore: 65,
    },
  ],
  "2": [
    {
      id: "201",
      candidate: {
        id: "c6",
        name: "Jessica Miller",
        email: "jessica.miller@example.com",
        avatar: "/mystical-forest-spirit.png",
        phone: "(555) 678-9012",
        location: "Austin, TX",
      },
      appliedDate: "2023-05-11",
      status: "review",
      resumeUrl: "#",
      coverLetter: "I am interested in this position...",
      matchScore: 89,
    },
    {
      id: "202",
      candidate: {
        id: "c7",
        name: "Robert Taylor",
        email: "robert.taylor@example.com",
        avatar: "/mystical-forest-spirit.png",
        phone: "(555) 789-0123",
        location: "Dallas, TX",
      },
      appliedDate: "2023-05-09",
      status: "interview",
      resumeUrl: "#",
      coverLetter: "I am interested in this position...",
      matchScore: 82,
      interviewDate: "2023-05-19",
      interviewTime: "3:00 PM CST",
    },
  ],
  "3": [
    {
      id: "301",
      candidate: {
        id: "c8",
        name: "Amanda Clark",
        email: "amanda.clark@example.com",
        avatar: "/mystical-forest-spirit.png",
        phone: "(555) 890-1234",
        location: "New York, NY",
      },
      appliedDate: "2023-05-12",
      status: "review",
      resumeUrl: "#",
      coverLetter: "I am interested in this position...",
      matchScore: 91,
    },
  ],
  "4": [
    {
      id: "401",
      candidate: {
        id: "c9",
        name: "Daniel White",
        email: "daniel.white@example.com",
        avatar: "/mystical-forest-spirit.png",
        phone: "(555) 901-2345",
        location: "Chicago, IL",
      },
      appliedDate: "2023-05-14",
      status: "review",
      resumeUrl: "#",
      coverLetter: "I am interested in this position...",
      matchScore: 87,
    },
  ],
  "5": [
    {
      id: "501",
      candidate: {
        id: "c10",
        name: "Jennifer Harris",
        email: "jennifer.harris@example.com",
        avatar: "/mystical-forest-spirit.png",
        phone: "(555) 012-3456",
        location: "Seattle, WA",
      },
      appliedDate: "2023-05-16",
      status: "review",
      resumeUrl: "#",
      coverLetter: "I am interested in this position...",
      matchScore: 84,
    },
  ],
}

interface JobApplicationsProps {
  jobId: string
}

export default function JobApplications({ jobId }: JobApplicationsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState<Record<string, boolean>>({})

  const job = jobDetails[jobId as keyof typeof jobDetails]
  const jobApplications = applications[jobId as keyof typeof applications] || []

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
                <Dialog>
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
                        <div className="flex justify-center">
                          <div className="w-full max-w-2xl bg-light-gray p-8 rounded-lg">
                            <div className="text-center mb-6">
                              <h2 className="text-2xl font-bold text-dark-gray">{app.candidate.name}</h2>
                              <p className="text-gray-600">{app.candidate.location}</p>
                              <div className="flex justify-center gap-3 mt-2 text-sm text-gray-500">
                                <span>{app.candidate.email}</span>
                                <span>•</span>
                                <span>{app.candidate.phone}</span>
                              </div>
                            </div>
                            <div className="mb-6">
                              <h3 className="text-lg font-bold text-dark-gray border-b pb-1 mb-2">Summary</h3>
                              <p className="text-gray-700">
                                Experienced Frontend Developer with 5+ years of expertise in building responsive and
                                accessible web applications using React, TypeScript, and modern JavaScript frameworks.
                              </p>
                            </div>
                            <div className="mb-6">
                              <h3 className="text-lg font-bold text-dark-gray border-b pb-1 mb-2">Experience</h3>
                              <div className="mb-4">
                                <div className="flex justify-between">
                                  <h4 className="font-medium text-dark-gray">Senior Frontend Developer</h4>
                                  <span className="text-sm text-gray-500">Mar 2021 - Present</span>
                                </div>
                                <p className="text-gray-600">Digital Solutions, San Francisco, CA</p>
                                <p className="text-sm text-gray-700 mt-1">
                                  Led frontend development for multiple projects using React, TypeScript, and Next.js.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="coverLetter" className="p-4 border rounded-md mt-4">
                        <div className="bg-light-gray p-6 rounded-lg">
                          <div className="whitespace-pre-line text-gray-700">{app.coverLetter}</div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline">Download Resume</Button>
                      <Button variant="outline" onClick={() => toggleChat(app.id)}>
                        <MessageSquare className="h-4 w-4 mr-1" /> Chat
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5 mr-1" /> Resume
                </Button>

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
                    <InterviewScheduler candidateName={app.candidate.name} />
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

              {chatOpen[app.id] && (
                <div className="mt-4 border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-dark-gray">Chat with {app.candidate.name}</h4>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleChat(app.id)}>
                      <X className="h-4 w-4" />
                    </Button>
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
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
