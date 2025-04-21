"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2, MoreHorizontal, RefreshCw, Eye, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for job postings
const jobPostings = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    location: "San Francisco, CA (Remote)",
    department: "Engineering",
    postedDate: "2023-05-01",
    expiryDate: "2023-05-16", // Expired
    status: "expired",
    applications: 24,
    views: 342,
  },
  {
    id: "2",
    title: "UX/UI Designer",
    location: "Austin, TX (Hybrid)",
    department: "Design",
    postedDate: "2023-05-05",
    expiryDate: "2023-05-20", // Expired
    status: "expired",
    applications: 18,
    views: 256,
  },
  {
    id: "3",
    title: "Product Manager",
    location: "New York, NY",
    department: "Product",
    postedDate: "2023-05-10",
    expiryDate: "2023-05-25", // Active
    status: "active",
    applications: 12,
    views: 189,
  },
  {
    id: "4",
    title: "Data Scientist",
    location: "Remote",
    department: "Data",
    postedDate: "2023-05-12",
    expiryDate: "2023-05-27", // Active
    status: "active",
    applications: 8,
    views: 145,
  },
  {
    id: "5",
    title: "DevOps Engineer",
    location: "Seattle, WA",
    department: "Engineering",
    postedDate: "2023-05-15",
    expiryDate: "2023-05-30", // Active
    status: "active",
    applications: 5,
    views: 98,
  },
]

interface JobPostingListProps {
  onSelectJob?: (jobId: string) => void
}

export default function JobPostingList({ onSelectJob }: JobPostingListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filter jobs based on search term and status
  const filteredJobs = jobPostings.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || job.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Function to calculate days left or days expired
  const getDaysInfo = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { days: Math.abs(diffDays), isExpired: true }
    }
    return { days: diffDays, isExpired: false }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-dark-gray">Posted Jobs</h2>
        <Link href="/employer/dashboard/post-job">
          <Button className="bg-accent hover:bg-accent/90">Post New Job</Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search jobs..."
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
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Job Listings */}
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-gray">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Job Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Department</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Applications</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Views</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredJobs.map((job) => {
                const daysInfo = getDaysInfo(job.expiryDate)
                return (
                  <tr key={job.id} className="hover:bg-light-gray">
                    <td className="px-4 py-4 text-sm">
                      <button
                        onClick={() => onSelectJob?.(job.id)}
                        className="font-medium text-dark-gray hover:text-accent text-left"
                      >
                        {job.title}
                      </button>
                      <div className="text-xs text-gray-500">
                        Posted: {new Date(job.postedDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{job.location}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{job.department}</td>
                    <td className="px-4 py-4 text-sm">
                      {job.status === "active" ? (
                        <Badge className="bg-green-100 text-green-800 font-normal">
                          Active ({daysInfo.days} days left)
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 font-normal">
                          Expired ({daysInfo.days} days ago)
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <button
                        onClick={() => onSelectJob?.(job.id)}
                        className="flex items-center text-gray-600 hover:text-accent"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        {job.applications}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{job.views}</td>
                    <td className="px-4 py-4 text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Link href={`/employer/dashboard/jobs/${job.id}`} className="flex items-center w-full">
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/employer/dashboard/jobs/${job.id}/edit`} className="flex items-center w-full">
                              <Edit className="mr-2 h-4 w-4" /> Edit Job
                            </Link>
                          </DropdownMenuItem>
                          {job.status === "expired" && (
                            <DropdownMenuItem>
                              <button className="flex items-center w-full text-left">
                                <RefreshCw className="mr-2 h-4 w-4" /> Reactivate Job
                              </button>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-500 focus:text-red-500">
                            <button className="flex items-center w-full text-left">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Job
                            </button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500">No job postings found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
