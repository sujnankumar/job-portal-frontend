"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Search, ChevronRight, CalendarIcon } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

// Mock applications data
const mockApplications = [
  {
    id: "app-123456",
    jobId: "job-789012",
    jobTitle: "Senior Frontend Developer",
    company: "Tech Innovations Inc.",
    location: "San Francisco, CA",
    appliedDate: "2023-11-15T14:30:00Z",
    status: "interview", // pending, interview, accepted, rejected
    logo: "/abstract-circuit-board.png",
    interviewDate: "2023-12-05T13:00:00Z",
  },
  {
    id: "app-234567",
    jobId: "job-890123",
    jobTitle: "UX/UI Designer",
    company: "Creative Solutions",
    location: "Remote",
    appliedDate: "2023-11-10T09:15:00Z",
    status: "pending",
    logo: "/abstract-geometric-logo.png",
  },
  {
    id: "app-345678",
    jobId: "job-901234",
    jobTitle: "Full Stack Developer",
    company: "Global Tech",
    location: "New York, NY",
    appliedDate: "2023-11-05T11:45:00Z",
    status: "rejected",
    logo: "/abstract-data-flow.png",
    feedback: "We were looking for someone with more experience in backend development.",
  },
  {
    id: "app-456789",
    jobId: "job-012345",
    jobTitle: "Product Manager",
    company: "Innovative Products Inc.",
    location: "Austin, TX",
    appliedDate: "2023-11-01T10:30:00Z",
    status: "accepted",
    logo: "/abstract-software-logo.png",
    offerDetails: {
      salary: "$130,000/year",
      startDate: "2024-01-15T00:00:00Z",
      benefits: "Health insurance, 401(k), unlimited PTO",
    },
  },
]

export default function ApplicationList() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)

  // Filter applications based on search query and filters
  const filteredApplications = mockApplications.filter((app) => {
    // Search filter
    const matchesSearch =
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    // Date filter
    const matchesDate = !dateFilter || new Date(app.appliedDate).toDateString() === dateFilter.toDateString()

    return matchesSearch && matchesStatus && matchesDate
  })

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by job title or company"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="interview">Interview Scheduled</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Not Selected</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Applications List */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active">Active Applications</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="text-gray-400 mb-2">No applications found</div>
                <p className="text-sm text-gray-500 max-w-md">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((app) => (
              <Card
                key={app.id}
                className="overflow-hidden hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => router.push(`/applications/${app.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <div className="mr-4 flex-shrink-0">
                      <Image
                        src={app.logo || "/placeholder.svg"}
                        alt={app.company}
                        width={50}
                        height={50}
                        className="rounded-md"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-dark-gray truncate">{app.jobTitle}</h3>
                      <p className="text-gray-600 text-sm">
                        {app.company} • {app.location}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Applied on {formatDate(app.appliedDate)}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2">
                      {getStatusBadge(app.status)}
                      {app.status === "interview" && app.interviewDate && (
                        <div className="flex items-center text-xs text-blue-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          Interview: {formatDate(app.interviewDate)}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 ml-2 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="text-gray-400 mb-2">No archived applications</div>
              <p className="text-sm text-gray-500 max-w-md">When you archive applications, they will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}