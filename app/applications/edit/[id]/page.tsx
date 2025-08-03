"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import axios from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"

export default function EditApplicationPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params?.id as string

  const { user, isAuthenticated, hydrated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    // Application fields
    coverLetter: "",
    status: "",
    job_id: "",
    resume_file_id: "",
    // Personal info fields
    name: "",
    email: "",
    phone: "",
    website: "",
    linkedin: "",
    // Resume fields
    resumeUrl: "",
    // Add more fields as needed
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (!hydrated) return
    if (!user || !user.token) {
      setError("You must be logged in to edit an application.")
      setLoading(false)
      return
    }
    // Fetch application data by ID
    async function fetchData() {
      setLoading(true)
      setError("")
      try {
        if (!user || !user.token) throw new Error("Not authenticated")
        const res = await axios.get(`/ga/application/job_id/${jobId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        )
        const data = res.data.application
        setForm({
          coverLetter: data.coverLetter || "",
          status: data.status || "",
          job_id: data.job_id || "",
          resume_file_id: data.resume_file_id || "",
          name: data.personalInfo?.name || "",
          email: data.personalInfo?.email || "",
          phone: data.personalInfo?.phone || "",
          website: data.personalInfo?.website || "",
          linkedin: data.personalInfo?.linkedin || "",
          resumeUrl: data.resume?.filename || "",
          // Add more fields as needed
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (jobId) fetchData()
  }, [jobId, hydrated, user])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    if (!user || !user.token) {
      setError("You must be logged in to edit an application.")
      setLoading(false)
      return
    }
    try {
      await axios.put(
        `/applications/${jobId}`,
        form,
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` } }
      )
      router.push("/applications")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <h1 className="text-2xl font-bold mb-6">Edit Application</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cover Letter */}
        <div>
          <label htmlFor="coverLetter" className="block mb-1 font-medium">Cover Letter</label>
          <Textarea
            id="coverLetter"
            name="coverLetter"
            value={form.coverLetter}
            onChange={handleChange}
            rows={5}
          />
        </div>
        {/* Status */}
        <div>
          <label htmlFor="status" className="block mb-1 font-medium">Status</label>
          <Input
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
          />
        </div>
        {/* Job ID (read-only) */}
        <div>
          <label htmlFor="job_id" className="block mb-1 font-medium">Job ID</label>
          <Input
            id="job_id"
            name="job_id"
            value={form.job_id}
            readOnly
          />
        </div>
        {/* Resume File ID (read-only) */}
        <div>
          <label htmlFor="resume_file_id" className="block mb-1 font-medium">Resume File ID</label>
          <Input
            id="resume_file_id"
            name="resume_file_id"
            value={form.resume_file_id}
            readOnly
          />
        </div>
        {/* Personal Info */}
        <div>
          <label htmlFor="name" className="block mb-1 font-medium">Name</label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1 font-medium">Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block mb-1 font-medium">Phone</label>
          <Input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="website" className="block mb-1 font-medium">Website</label>
          <Input
            id="website"
            name="website"
            value={form.website}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="linkedin" className="block mb-1 font-medium">LinkedIn</label>
          <Input
            id="linkedin"
            name="linkedin"
            value={form.linkedin}
            onChange={handleChange}
          />
        </div>
        {/* Resume Filename (read-only) */}
        <div>
          <label htmlFor="resumeUrl" className="block mb-1 font-medium">Resume Filename</label>
          <Input
            id="resumeUrl"
            name="resumeUrl"
            value={form.resumeUrl}
            readOnly
          />
        </div>
        {/* Add more fields as needed */}
        <div className="flex gap-4 mt-6">
          <Button type="submit" className="bg-accent text-white" disabled={loading}>
            Save Changes
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
