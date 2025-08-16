"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2, MoreHorizontal, RefreshCw, Eye, Users, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface JobPostingListProps {
  onSelectJob?: (jobId: string) => void
}

export default function JobPostingList({ onSelectJob }: JobPostingListProps) {
  const { user } = useAuthStore()
  const [jobPostings, setJobPostings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [reactivateOpen, setReactivateOpen] = useState(false)
  const [jobToReactivate, setJobToReactivate] = useState<any>(null)
  const [reactivationDays, setReactivationDays] = useState<string>("15")

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user?.token) return
      setLoading(true)
      setError("")
      try {
        const res = await api.get("/emp/job_postings", {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        setJobPostings(res.data.jobPostings || [])
      } catch (err) {
        setError("Failed to load job postings.")
        setJobPostings([])
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [user])

  // Filter jobs based on search term and dropdown status (now includes deleted)
  const filteredJobs = jobPostings.filter((job) => {
    const matchesSearch = (
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const refreshJobs = async () => {
    if (!user?.token) return
    try {
      const res = await api.get("/emp/job_postings", { headers: { Authorization: `Bearer ${user.token}` } })
      setJobPostings(res.data.jobPostings || [])
    } catch (e: any) {
      // silent
    }
  }

  const openReactivateModal = (job: any) => {
    setJobToReactivate(job)
    setReactivationDays("15")
    setReactivateOpen(true)
  }

  const handleConfirmReactivate = async () => {
    if (!jobToReactivate || !user?.token) return
    const daysNum = parseInt(reactivationDays, 10)
    if (isNaN(daysNum) || daysNum <= 0) {
      toast.error("Enter a valid number of days")
      return
    }
    setActionLoading(true)
    try {
      await api.post(`/job/reactivate_job/${jobToReactivate.id}?validity_days=${daysNum}`, {}, { headers: { Authorization: `Bearer ${user.token}` } })
      toast.success(`Job reactivated for ${daysNum} days`)
      setReactivateOpen(false)
      setJobToReactivate(null)
      await refreshJobs()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || e?.message || "Failed to reactivate job")
    } finally {
      setActionLoading(false)
    }
  }

  const confirmDelete = (job: any) => {
    setJobToDelete(job)
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!jobToDelete || !user?.token) return
    setActionLoading(true)
    try {
      await api.delete(`/job/remove_job/${jobToDelete.id}`, { headers: { Authorization: `Bearer ${user.token}` } })
      toast.success("Job deleted (archived)")
      setConfirmOpen(false)
      setJobToDelete(null)
      await refreshJobs()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || e?.message || "Failed to delete job")
    } finally {
      setActionLoading(false)
    }
  }

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
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Job Listings */}
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">{error}</div>
          ) : (
            <table className="w-full">
              <thead className="bg-light-gray">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Job Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Status</th>
                  {statusFilter === 'deleted' && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Deleted</th>
                  )}
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Applications</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Views</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-gray">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
        {filteredJobs.map((job) => {
                  const daysInfo = getDaysInfo(job.expiryDate)
                  return (
          <tr key={job.id || job.job_id} className="hover:bg-light-gray">
                      <td className="px-4 py-4 text-sm">
                        <button
              onClick={() => onSelectJob?.(job.id || job.job_id)}
                          className="font-medium text-dark-gray hover:text-accent text-left"
                        >
                          {job.title}
                        </button>
                        <div className="text-xs text-gray-500">
                          Posted: {formatDate(job.postedDate)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{job.location}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{job.department}</td>
                      <td className="px-4 py-4 text-sm">
                        {job.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800 font-normal">Active ({daysInfo.days} days left)</Badge>
                        ) : job.status === 'expired' ? (
                          <Badge className="bg-red-100 text-red-800 font-normal">Expired ({daysInfo.days} days ago)</Badge>
                        ) : (
                          <Badge className="bg-gray-200 text-gray-700 font-normal">Deleted</Badge>
                        )}
                        {job.reactivated && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800 font-normal">Reactivated</Badge>
                        )}
                      </td>
                      {statusFilter === 'deleted' && (
                        <td className="px-4 py-4 text-sm text-gray-600">{job.deletedAt || '-'}</td>
                      )}
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
                              <Link href={`/employer/dashboard/jobs/${job.id || job.job_id}`} className="flex items-center w-full">
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={job.status !== 'active'}>
                              <Link aria-disabled={job.status !== 'active'} href={`/employer/dashboard/jobs/${job.id || job.job_id}/edit`} className={`flex items-center w-full ${job.status !== 'active' ? 'pointer-events-none opacity-50' : ''}`}>
                                <Edit className="mr-2 h-4 w-4" /> {job.status === 'active' ? 'Edit Job' : 'Expired'}
                              </Link>
                            </DropdownMenuItem>
                            {job.status === "expired" && statusFilter !== 'deleted' && (
                              <DropdownMenuItem onClick={() => openReactivateModal(job)} disabled={actionLoading}>
                                <button disabled={actionLoading} className="flex items-center w-full text-left">
                                  <RefreshCw className="mr-2 h-4 w-4" /> Reactivate Job
                                </button>
                              </DropdownMenuItem>
                            )}
                            {job.status !== 'deleted' && (
                              <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => confirmDelete(job)}>
                                <button className="flex items-center w-full text-left">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete Job
                                </button>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        {!loading && !error && filteredJobs.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500">No job postings found.</p>
          </div>
        )}
      </div>
      <Dialog open={confirmOpen} onOpenChange={(o) => { if (!o) { setConfirmOpen(false); setJobToDelete(null) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" /> Confirm Deletion</DialogTitle>
            <DialogDescription>
              This will permanently remove the job from active listings. All associated applications and interviews will be archived and no longer visible to candidates.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm space-y-2">
            <p><span className="font-semibold">Job:</span> {jobToDelete?.title}</p>
            <ul className="list-disc pl-5 text-gray-600 text-xs">
              <li>Job will move to internal archive (cannot be restored).</li>
              <li>Applications & interviews become read-only in archive.</li>
              <li>This action cannot be undone.</li>
            </ul>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setConfirmOpen(false); setJobToDelete(null) }} disabled={actionLoading}>Cancel</Button>
            <Button onClick={handleDelete} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">{actionLoading ? 'Deleting...' : 'Delete Job'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reactivateOpen} onOpenChange={(o) => { if (!o) { setReactivateOpen(false); setJobToReactivate(null) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reactivate Job</DialogTitle>
            <DialogDescription>
              Choose how many days this job should stay active again. Default is 15 days.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm"><span className="font-semibold">Job:</span> {jobToReactivate?.title}</div>
            <div className="grid gap-2">
              <label htmlFor="reactivationDays" className="text-xs uppercase tracking-wide text-gray-600">Validity (days)</label>
              <Input
                id="reactivationDays"
                type="number"
                min={1}
                value={reactivationDays}
                onChange={(e) => setReactivationDays(e.target.value)}
                placeholder="15"
              />
              <p className="text-[11px] text-gray-500">Enter the number of days the job should remain active (e.g. 15).</p>
            </div>
            <ul className="list-disc pl-5 text-gray-600 text-xs space-y-1">
              <li>Posted date resets to now.</li>
              <li>Previous expiry is replaced by new one.</li>
              <li>Marked with a Reactivated badge.</li>
            </ul>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { setReactivateOpen(false); setJobToReactivate(null) }} disabled={actionLoading}>Cancel</Button>
            <Button onClick={handleConfirmReactivate} disabled={actionLoading} className="bg-accent hover:bg-accent/90">{actionLoading ? 'Working...' : 'Reactivate'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
