"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, Download, CheckCircle, XCircle, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, formatDateTime } from "@/lib/utils"

// Mock data for applications
const applications = [
  {
    id: "1",
    candidate: {
      name: "John Smith",
      email: "john.smith@example.com",
      avatar: "/mystical-forest-spirit.png",
    },
    job: {
      title: "Senior Frontend Developer",
      location: "San Francisco, CA (Remote)",
    },
    appliedDate: "2023-05-10",
    status: "review",
    resumeUrl: "#",
    matchScore: 92,
  },
  {
    id: "2",
    candidate: {
      name: "Emily Johnson",
      email: "emily.johnson@example.com",
      avatar: "/mystical-forest-spirit.png",
    },
    job: {
      title: "UX/UI Designer",
      location: "Austin, TX (Hybrid)",
    },
    appliedDate: "2023-05-08",
    status: "interview",
    resumeUrl: "#",
    matchScore: 88,
    interviewDate: "2023-05-18",
    interviewTime: "2:00 PM EST",
  },
  {
    id: "3",
    candidate: {
      name: "Michael Brown",
      email: "michael.brown@example.com",
      avatar: "/mystical-forest-spirit.png",
    },
    job: {
      title: "Product Manager",
      location: "New York, NY",
    },
    appliedDate: "2023-05-05",
    status: "review",
    resumeUrl: "#",
    matchScore: 75,
  },
  {
    id: "4",
    candidate: {
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      avatar: "/mystical-forest-spirit.png",
    },
    job: {
      title: "Data Scientist",
      location: "Remote",
    },
    appliedDate: "2023-05-12",
    status: "accepted",
    resumeUrl: "#",
    matchScore: 95,
  },
  {
    id: "5",
    candidate: {
      name: "David Lee",
      email: "david.lee@example.com",
      avatar: "/mystical-forest-spirit.png",
    },
    job: {
      title: "DevOps Engineer",
      location: "Seattle, WA",
    },
    appliedDate: "2023-05-15",
    status: "rejected",
    resumeUrl: "#",
    matchScore: 65,
  },
]

export default function ApplicationsOverview() {
  const [searchTerm, setSearchTerm] = useState("")
  const [jobFilter, setJobFilter] = useState("all")

  // Filter applications based on search term and job
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesJob = jobFilter === "all" || app.job.title.includes(jobFilter)

    return matchesSearch && matchesJob
  })

  // Group applications by status
  const reviewApplications = filteredApplications.filter((app) => app.status === "review")
  const interviewApplications = filteredApplications.filter((app) => app.status === "interview")
  const acceptedApplications = filteredApplications.filter((app) => app.status === "accepted")
  const rejectedApplications = filteredApplications.filter((app) => app.status === "rejected")

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

  return (
    <div className="space-y-6">
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
        <div className="w-full md:w-64">
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
              <SelectItem value="UX/UI Designer">UX/UI Designer</SelectItem>
              <SelectItem value="Product Manager">Product Manager</SelectItem>
              <SelectItem value="Data Scientist">Data Scientist</SelectItem>
              <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="w-full border-b rounded-t-xl rounded-b-none p-0 bg-light-gray">
          <TabsTrigger value="all" className="flex-1 py-2">
            All ({filteredApplications.length})
          </TabsTrigger>
          <TabsTrigger value="review" className="flex-1 py-2">
            Review ({reviewApplications.length})
          </TabsTrigger>
          <TabsTrigger value="interview" className="flex-1 py-2">
            Interview ({interviewApplications.length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex-1 py-2">
            Accepted ({acceptedApplications.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex-1 py-2">
            Rejected ({rejectedApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="pt-4">
          <ApplicationList applications={filteredApplications} getStatusBadge={getStatusBadge} />
        </TabsContent>

        <TabsContent value="review" className="pt-4">
          <ApplicationList applications={reviewApplications} getStatusBadge={getStatusBadge} />
        </TabsContent>

        <TabsContent value="interview" className="pt-4">
          <ApplicationList applications={interviewApplications} getStatusBadge={getStatusBadge} />
        </TabsContent>

        <TabsContent value="accepted" className="pt-4">
          <ApplicationList applications={acceptedApplications} getStatusBadge={getStatusBadge} />
        </TabsContent>

        <TabsContent value="rejected" className="pt-4">
          <ApplicationList applications={rejectedApplications} getStatusBadge={getStatusBadge} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ApplicationListProps {
  applications: any[]
  getStatusBadge: (status: string) => React.ReactNode
}

function ApplicationList({ applications, getStatusBadge }: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No applications found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
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
                <div className="text-sm font-medium text-dark-gray">{app.job.title}</div>
                <div className="text-xs text-gray-500">{app.job.location}</div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="text-xs text-gray-500">Applied: {formatDate(app.appliedDate)}</div>
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
                  {formatDate(app.interviewDate)} at {app.interviewTime}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/employer/dashboard/applications/${app.id}`}>
              <Button variant="outline" size="sm">
                View Application
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5 mr-1" /> Resume
            </Button>

            {app.status === "review" && (
              <>
                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Accept
                </Button>
                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                  <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                </Button>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Calendar className="h-3.5 w-3.5 mr-1" /> Schedule Interview
                </Button>
              </>
            )}

            {app.status === "interview" && (
              <>
                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Accept
                </Button>
                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                  <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                </Button>
                <Button size="sm" variant="outline">
                  <Clock className="h-3.5 w-3.5 mr-1" /> Reschedule
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
