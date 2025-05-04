"use client"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/axios"
import { Calendar, Clock, User, Video, Briefcase } from "lucide-react"

type Interview = {
  id: string;
  applicant_name?: string;
  candidate_id: string;
  scheduled_time: string;
  status: string;
  zoom_link?: string;
};

export default function EmployerInterviewsPage() {
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<any[]>([])

  useEffect(() => {
    if (!user?.token) return
    api.get("/interview/employer", { headers: { Authorization: `Bearer ${user.token}` } })
      .then(res => setJobs(res.data))
  }, [user?.token])

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-accent">
        <Briefcase className="h-8 w-8" /> Scheduled Interviews for Your Jobs
      </h1>
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Briefcase className="h-12 w-12 mb-4" />
          <div className="text-lg font-medium">No jobs with scheduled interviews.</div>
        </div>
      ) : (
        jobs.map(job => (
          <div key={job.job_id} className="mb-10 p-6 rounded-2xl border bg-white shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 text-dark-gray">
              <Briefcase className="h-5 w-5 text-accent" /> {job.title || job.job_id}
            </h2>
            {(!job.interviews || job.interviews.length === 0) ? (
              <div className="text-gray-500 mb-4">No interviews scheduled for this job.</div>
            ) : (
              <ul className="space-y-4">
                {job.interviews.map((interview: Interview) => (
                  <li key={interview.id} className="p-5 border rounded-xl bg-light-gray/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-dark-gray">{interview.applicant_name || interview.candidate_id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                        <Clock className="h-4 w-4 text-accent" />
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
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  )
}
