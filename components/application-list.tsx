"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon, Clock, Search, ChevronRight, Calendar, Loader2 } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import api from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"

interface Application {
  id: string
  jobTitle: string
  company: string
  companyId: string
  logo: string | null
  location: string
  appliedDate: string
  status: string
  interviewDate?: string
}

interface ApplicationWithLogo extends Application {
  logoUrl?: string | null
  logoLoading?: boolean
}

export default function ApplicationList() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [applications, setApplications] = useState<ApplicationWithLogo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const response = await api.get("/gma/applications/my-applications", {
        headers: user && user.token ? { Authorization: `Bearer ${user.token}` } : {},
      })

      console.log(response.data) // Debugging line
      
      if (response.data && response.data.applications) {
        const appsWithLogos = await Promise.all(
          response.data.applications.map(async (app: Application) => {
            const appWithLogo: ApplicationWithLogo = { 
              ...app, 
              logoUrl: null, 
              logoLoading: false 
            }
            
            // Fetch company logo if available
            if (app.logo) {
              try {
                appWithLogo.logoLoading = true
                const logoResponse = await api.get(`/company/logo/${app.logo}`, {
                  responseType: "blob",
                })
                const logoUrl = URL.createObjectURL(logoResponse.data)
                appWithLogo.logoUrl = logoUrl
              } catch (logoError) {
                console.error("Failed to fetch logo for company:", app.companyId, logoError)
                appWithLogo.logoUrl = null
              } finally {
                appWithLogo.logoLoading = false
              }
            }
            
            return appWithLogo
          })
        )
        setApplications(appsWithLogos)
      } else {
        throw new Error("Invalid response structure")
      }
    } catch (err: any) {
      console.error("Error fetching applications:", err)
      setError("Failed to load applications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.token) {
      fetchApplications()
    } else {
      setLoading(false)
      setError("You must be logged in to view applications.")
    }

    // Cleanup function to revoke object URLs
    return () => {
      applications.forEach(app => {
        if (app.logoUrl) {
          URL.revokeObjectURL(app.logoUrl)
        }
      })
    }
  }, [user])

  // Filter logic
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    const matchesDate = !dateFilter || new Date(app.appliedDate).toDateString() === dateFilter.toDateString()

    return matchesSearch && matchesStatus && matchesDate
  })

  // Utilities
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

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

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-semibold text-dark-gray mb-4">Track Your Applications</h2>
        
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
      </div>

      {/* Applications Section */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-50">
          <TabsTrigger value="active" className="data-[state=active]:bg-white">
            Active Applications
          </TabsTrigger>
          <TabsTrigger value="archived" className="data-[state=active]:bg-white">
            Archived
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-400 mb-2 text-lg font-medium">No applications found</div>
                <p className="text-sm text-gray-500 max-w-md">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <Card
                  key={app.id}
                  className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-gray-300"
                  onClick={() => router.push(`/applications/${app.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <div className="mr-4 flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border overflow-hidden">
                          {app.logoLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : (
                            <Image
                              src={app.logoUrl || "/company_placeholder.jpeg"}
                              alt={app.company}
                              width={48}
                              height={48}
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
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
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <div className="bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-gray-400 mb-2 text-lg font-medium">No archived applications</div>
              <p className="text-sm text-gray-500 max-w-md">
                When you archive applications, they will appear here.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}