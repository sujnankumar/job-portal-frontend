import Image from "next/image"
import Link from "next/link"
import { MapPin, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/axios"

interface ApplicationProps {
  status: "active" | "history"
}

export default function ApplicationList({ status }: ApplicationProps) {
  const [activeApplications, setActiveApplications] = useState<any[]>([])
  const [applicationHistory, setApplicationHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const user = useAuthStore((state) => state.user)
  const hydrated = useAuthStore((state) => state.hydrated)

  useEffect(() => {
    if (!user?.token || !hydrated) return
    setLoading(true)
    if (status === "active") {
      const fetchActiveApplications = async () => {
        try {
          const res = await api.get("/gma/applications/active", {
            headers: { Authorization: `Bearer ${user.token}` }
          })
          setActiveApplications(res.data.active_applications || [])
        } catch (err) {
          setActiveApplications([])
        } finally {
          setLoading(false)
        }
      }
      fetchActiveApplications()
    } else if (status === "history") {
      const fetchApplicationHistory = async () => {
        try {
          const res = await api.get("/gma/applications/my-applications", {
            headers: { Authorization: `Bearer ${user.token}` }
          })
          setApplicationHistory(res.data.applications || [])
        } catch (err) {
          setApplicationHistory([])
        } finally {
          setLoading(false)
        }
      }
      fetchApplicationHistory()
    }
  }, [status, user?.token, hydrated])

  // Status color mapping
  const statusColor = (status: string) => {
    switch (status) {
      case "Under Review":
        return "bg-amber-100 text-amber-800"
      case "Shortlisted":
        return "bg-blue-100 text-blue-800"
      case "Interview Scheduled":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      case "Offer Accepted":
        return "bg-green-100 text-green-800"
      case "Withdrawn":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const applications = status === "active" ? activeApplications : applicationHistory

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-gray-500 text-lg">Loading...</span>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-dark-gray mb-2">No applications found</h3>
        <p className="text-gray-500 mb-6">
          {status === "active"
            ? "You don't have any active job applications at the moment."
            : "Your application history is empty."}
        </p>
        <Link href="/jobs">
          <Button className="bg-accent hover:bg-accent/90">Browse Jobs</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div key={app.id || app.job_id} className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-12 h-12 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
              <Image
                src={app.logo || "/placeholder.svg"}
                width={48}
                height={48}
                alt={`${app.company} logo`}
                className="object-contain"
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <h3 className="font-medium text-dark-gray">{app.jobTitle}</h3>
                  <p className="text-sm text-gray-500">{app.company}</p>
                </div>
                <Badge className={cn("font-normal", statusColor(app.status))}>{app.status}</Badge>
              </div>

              <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                <div className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {app.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Applied on {app.appliedDate}
                </div>
              </div>

              {/* Interview details */}
              {"interviewDate" in app && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md text-sm">
                  <p className="font-medium text-blue-700">Interview Scheduled</p>
                  <p className="text-blue-600">
                    {app.interviewDate} at {app.interviewTime}
                  </p>
                </div>
              )}

              {/* Rejection feedback */}
              {"feedback" in app && (
                <div className="mt-3 p-3 bg-red-50 rounded-md text-sm">
                  <p className="font-medium text-red-700">Feedback</p>
                  <p className="text-red-600">{app.feedback}</p>
                </div>
              )}

              {/* Withdrawal reason */}
              {"reason" in app && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm">
                  <p className="font-medium text-gray-700">Reason for withdrawal</p>
                  <p className="text-gray-600">{app.reason}</p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/jobs/${app.job_id}`}>
                  <Button variant="outline" size="sm" className="h-8">
                    View Job
                  </Button>
                </Link>
                <Link href={`/applications/${app.id}`}>
                  <Button variant="outline" size="sm" className="h-8">
                    View Application
                  </Button>
                </Link>
                {status === "active" && app.status !== "Interview Scheduled" && (
                  <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                    Withdraw
                  </Button>
                )}
                {app.status === "Interview Scheduled" && (
                  <Button variant="outline" size="sm" className="h-8 text-blue-500 hover:text-blue-700">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    Add to Calendar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
