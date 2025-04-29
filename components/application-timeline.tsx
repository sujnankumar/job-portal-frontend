import { CheckCircle, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react"

interface TimelineEvent {
  date: string
  status: string
  description: string
}

interface ApplicationTimelineProps {
  timeline: TimelineEvent[]
}

export default function ApplicationTimeline({ timeline }: ApplicationTimelineProps) {
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

  // Get icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "applied":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "reviewed":
        return <CheckCircle className="h-5 w-5 text-yellow-500" />
      case "interview":
        return <AlertCircle className="h-5 w-5 text-purple-500" />
      case "accepted":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {timeline?.map((event, index) => (
        <div key={index} className="relative pl-8">
          {/* Connector line */}
          {index < timeline?.length - 1 && (
            <div className="absolute left-[10px] top-[24px] bottom-[-24px] w-[2px] bg-gray-200"></div>
          )}

          {/* Event dot */}
          <div className="absolute left-0 top-0 rounded-full bg-white p-[2px] border-2 border-gray-200">
            {getStatusIcon(event?.status)}
          </div>

          {/* Event content */}
          <div>
            <div className="font-medium">{event?.description}</div>
            <div className="text-sm text-gray-500">{formatDate(event?.date)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}