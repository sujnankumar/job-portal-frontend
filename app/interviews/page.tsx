"use client"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/axios"
import { Calendar, Clock, User, Video } from "lucide-react"

export default function MyInterviewsPage() {
  const { user } = useAuthStore()
  const [interviews, setInterviews] = useState<any[]>([])

  useEffect(() => {
    if (!user?.token) return
    api.get("/interview/applicant", { headers: { Authorization: `Bearer ${user.token}` } })
      .then(res => setInterviews(res.data))
  }, [user?.token])

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-accent">
        <Calendar className="h-8 w-8" /> My Scheduled Interviews
      </h1>
      {interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Calendar className="h-12 w-12 mb-4" />
          <div className="text-lg font-medium">No interviews scheduled</div>
          <div className="text-sm mt-1">You'll see your upcoming interviews here.</div>
        </div>
      ) : (
        <ul className="space-y-6">
          {interviews.map(interview => (
            <li key={interview.id} className="p-6 rounded-2xl border shadow bg-white hover:shadow-lg transition group">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-accent" />
                    <span className="font-semibold text-lg text-dark-gray">{interview.job_title || interview.job_id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>{new Date(interview.scheduled_time).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Calendar className="h-4 w-4 text-red-300" />
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${interview.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{interview.status}</span>
                  </div>
                  {interview.zoom_link && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                      <Video className="h-4 w-4 text-purple-500" />
                      <a href={interview.zoom_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Join Interview</a>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
