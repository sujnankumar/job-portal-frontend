"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MapPin, Clock, Briefcase, Building, Calendar, Edit } from "lucide-react"
import ProtectedRoute from "@/components/auth/protected-route"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/axios"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

// minimal markdown converter (same style as public job-detail)
const markdownToHtml = (md: string) => {
  if (!md) return ""
  return md
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-dark-gray mb-2 mt-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-dark-gray mb-3 mt-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-dark-gray mb-4 mt-4">$1</h1>')
    .replace(/^[*-] (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
    .replace(/\n\n/gim, '</p><p class="mb-3">')
    .replace(/^\n/gim, '')
    .replace(/^(?!<[h|l])/gim, '<p class="mb-3">')
    .replace(/(<li.*<\/li>)/gim, '<ul class="list-disc ml-6 mb-3">$1</ul>')
    .replace(/<\/ul>\s*<ul[^>]*>/gim, '')
}

export default function EmployerJobDetailsPage() {
  const params = useParams<{ jobId: string }>()
  const jobId = params?.jobId
  const router = useRouter()
  const { user } = useAuthStore()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchJob = async () => {
      if (!user?.token || !jobId) return
      setLoading(true)
      setError("")
      try {
        const res = await api.get(`/job/get-job/${jobId}`, { headers: { Authorization: `Bearer ${user.token}` } })
        setJob(res.data.job)
      } catch (e: any) {
        setError(e?.response?.data?.detail || "Failed to load job")
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [user?.token, jobId])

  const expired = job && (job.status === 'expired' || (job.expires_at && new Date(job.expires_at) < new Date()))

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/employer/dashboard")}>← Back to Dashboard</Button>
        {loading && <div className="py-16 text-center text-gray-500">Loading...</div>}
        {error && !loading && <div className="py-16 text-center text-red-500">{error}</div>}
        {job && !loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-dark-gray mb-2">{job.title}</h1>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600 mb-3">
                  {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>}
                  {job.employment_type && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.employment_type}</span>}
                  {job.experience_level && <span className="flex items-center gap-1"><Building className="h-4 w-4" />{job.experience_level}</span>}
                  {job.posted_at && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDate(job.posted_at)}</span>}
                  {job.expires_at && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Deadline {formatDate(job.expires_at)}</span>}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {job.show_salary && job.min_salary && job.max_salary && (
                    <Badge variant="outline" className="bg-light-gray">
                      {(() => {
                        const min = parseInt(job.min_salary)
                        const max = parseInt(job.max_salary)
                        const fmt = (n:number) => n.toLocaleString('en-IN')
                        return min === max ? `₹ ${fmt(min)}/year` : `₹ ${fmt(min)} - ${fmt(max)}/year`
                      })()}
                    </Badge>
                  )}
                  <Badge className={expired ? 'bg-red-500' : 'bg-green-500'}>{expired ? 'Expired' : 'Active'}</Badge>
                  <Badge variant="outline" className="uppercase">{job.visibility}</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push(`/employer/dashboard/jobs/${jobId}/edit`)} disabled={expired}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Job
                </Button>
                {expired && <span className="text-xs text-red-500">Cannot edit expired</span>}
              </div>
            </div>

            <div className="hidden md:flex p-6">
              <div className="flex-1 pr-6 space-y-8">
                {job.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-dark-gray mb-3">Job Description</h3>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(job.description) }} />
                  </div>
                )}
                {job.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-dark-gray mb-3">Requirements</h3>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(job.requirements) }} />
                  </div>
                )}
                {job.benefits && (
                  <div>
                    <h3 className="text-lg font-semibold text-dark-gray mb-3">Benefits & Perks</h3>
                    <p className="text-gray-700 whitespace-pre-line">{job.benefits}</p>
                  </div>
                )}
                {job.skills?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-dark-gray mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((s: string) => <Badge key={s} variant="outline" className="bg-light-gray">{s}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
              <div className="w-80 flex-shrink-0 space-y-6">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-dark-gray">Job Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2"><Briefcase className="h-4 w-4 mt-0.5 text-gray-400" /><div><div className="font-medium">Type</div><div className="text-gray-600">{job.employment_type || 'NA'}</div></div></div>
                      <div className="flex items-start gap-2"><Building className="h-4 w-4 mt-0.5 text-gray-400" /><div><div className="font-medium">Experience</div><div className="text-gray-600">{job.experience_level || 'NA'}</div></div></div>
                      <div className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-gray-400" /><div><div className="font-medium">Location</div><div className="text-gray-600">{job.location || 'NA'}</div></div></div>
                      <div className="flex items-start gap-2"><Calendar className="h-4 w-4 mt-0.5 text-gray-400" /><div><div className="font-medium">Deadline</div><div className="text-gray-600">{job.expires_at ? formatDate(job.expires_at) : 'NA'}</div></div></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile simple stacking */}
            <div className="md:hidden p-6 space-y-8">
              {job.description && <div><h3 className="text-lg font-semibold mb-3">Job Description</h3><div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(job.description) }} /></div>}
              {job.requirements && <div><h3 className="text-lg font-semibold mb-3">Requirements</h3><div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(job.requirements) }} /></div>}
              {job.benefits && <div><h3 className="text-lg font-semibold mb-3">Benefits & Perks</h3><p className="text-gray-700 whitespace-pre-line">{job.benefits}</p></div>}
              {job.skills?.length > 0 && <div><h3 className="text-lg font-semibold mb-3">Skills</h3><div className="flex flex-wrap gap-2">{job.skills.map((s: string) => <Badge key={s} variant="outline" className="bg-light-gray">{s}</Badge>)}</div></div>}
            </div>

            <div className="p-6 border-t text-xs text-gray-500 flex justify-between">
              <span>Job ID: {job.job_id}</span>
              <span>Visibility: {job.visibility}</span>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
