"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/protected-route"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Edit, Save } from "lucide-react"

// simple markdown converter reused from posting form
const markdownToHtml = (markdown: string) => {
  return (markdown || "")
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

const htmlToMarkdown = (html: string): string => {
  if (!html) return ""
  if (!html.includes('<')) return html
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1')
    .replace(/<ul[^>]*>|<\/ul>/gi, '')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\n\n\n+/g, '\n\n')
    .trim()
}

export default function EditJobPage() {
  const params = useParams<{ jobId: string }>()
  const jobId = params?.jobId
  const router = useRouter()
  const { user } = useAuthStore()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("details")
  const [showDescPreview, setShowDescPreview] = useState(false)
  const [showReqPreview, setShowReqPreview] = useState(false)
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    locationType: "On-site",
    employmentType: "Full-time",
    minSalary: "",
    maxSalary: "",
  singleSalary: "",
  salaryMode: "range", // 'range' | 'single'
    showSalary: true,
    description: "",
    requirements: "",
    benefits: "",
    applicationDeadline: "",
    skills: [""],
    experienceLevel: "",
    jobCategory: "",
    visibility: "public"
  })
  const [errors, setErrors] = useState<Record<string,string>>({})
  const disabled = job && job.status !== 'active'

  useEffect(() => {
    const fetchJob = async () => {
      if (!user?.token || !jobId) return
      setLoading(true)
      setError("")
      try {
        const res = await api.get(`/job/get-job/${jobId}`, { headers: { Authorization: `Bearer ${user.token}` } })
        const j = res.data.job
        setJob(j)
        setForm({
          title: j.title || "",
          department: j.department || "",
          location: j.location || "",
          locationType: j.location_type || "On-site",
          employmentType: j.employment_type || "Full-time",
          minSalary: j.min_salary || "",
          maxSalary: j.max_salary || "",
          singleSalary: j.min_salary && j.max_salary && j.min_salary === j.max_salary ? j.min_salary : "",
          salaryMode: (j.min_salary && j.max_salary && j.min_salary === j.max_salary) ? 'single' : 'range',
          showSalary: !!j.show_salary,
          description: j.description || "",
          requirements: j.requirements || "",
          benefits: j.benefits || "",
          applicationDeadline: j.expires_at ? j.expires_at.substring(0,10) : "",
          skills: (j.skills && j.skills.length ? j.skills : [""]),
          experienceLevel: j.experience_level || "",
          jobCategory: j.job_category || "",
          visibility: j.visibility || "public"
        })
      } catch (e: any) {
        setError(e?.response?.data?.detail || "Failed to load job")
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [user?.token, jobId])
  const setField = (name: string, value: any) => setForm(p => ({ ...p, [name]: value }))
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setField(name as any, value)
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
  }
  const handleSkillChange = (i: number, value: string) => {
    setForm(p => ({ ...p, skills: p.skills.map((s, idx) => idx === i ? value : s) }))
  }
  const addSkill = () => setForm(p => ({ ...p, skills: [...p.skills, ""] }))
  const removeSkill = (i: number) => setForm(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }))

  const validate = () => {
    const errs: Record<string,string> = {}
    if (!form.title.trim()) errs.title = 'Title required'
    if (!form.department.trim()) errs.department = 'Department required'
    if (!form.location.trim()) errs.location = 'Location required'
    if (!form.description.trim() || form.description.trim().length < 30) errs.description = 'Description min 30 chars'
    if (!form.requirements.trim() || form.requirements.trim().length < 20) errs.requirements = 'Requirements min 20 chars'
    if (!form.experienceLevel) errs.experienceLevel = 'Experience level required'
    if (!form.jobCategory) errs.jobCategory = 'Job category required'
    if (form.showSalary) {
      if (form.salaryMode === 'range') {
        if (!form.minSalary) errs.minSalary = 'Min salary required'
        if (!form.maxSalary) errs.maxSalary = 'Max salary required'
      } else {
        if (!form.singleSalary) errs.singleSalary = 'Salary required'
      }
    }
    const validSkills = form.skills.filter(s => s.trim())
    if (!validSkills.length) errs.skills = 'At least one skill'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (disabled) return
    if (!validate()) return
    setSaving(true)
    try {
      const isSingle = form.showSalary && form.salaryMode === 'single'
      const payload = {
        title: form.title,
        department: form.department,
        location: form.location,
        location_type: form.locationType,
        employment_type: form.employmentType,
        min_salary: form.showSalary ? (isSingle ? form.singleSalary : form.minSalary) : undefined,
        max_salary: form.showSalary ? (isSingle ? form.singleSalary : form.maxSalary) : undefined,
        show_salary: form.showSalary,
        description: htmlToMarkdown(form.description),
        requirements: htmlToMarkdown(form.requirements),
        benefits: form.benefits,
        skills: form.skills.filter(s => s.trim()),
        experience_level: form.experienceLevel,
        job_category: form.jobCategory,
        visibility: form.visibility,
      }
      await api.put(`/job/update_job/${jobId}`, payload, { headers: { Authorization: `Bearer ${user?.token}` } })
      router.push(`/employer/dashboard/jobs/${jobId}`)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Update failed')
    } finally { setSaving(false) }
  }

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push(`/employer/dashboard/jobs/${jobId}`)}>← Back</Button>
        {loading && <div className="py-16 text-center text-gray-500">Loading...</div>}
        {error && !loading && <div className="py-8 text-center text-red-500">{error}</div>}
        {!loading && !error && job && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm space-y-8">
            {disabled && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">This job is expired and cannot be edited.</div>}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full border-b rounded-none bg-light-gray">
                <TabsTrigger value="details" className="flex-1">Job Details</TabsTrigger>
                <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
                <TabsTrigger value="requirements" className="flex-1">Requirements & Benefits</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="pt-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" name="title" value={form.title} onChange={handleChange} disabled={disabled} />
                    {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input id="department" name="department" value={form.department} onChange={handleChange} disabled={disabled} />
                    {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" name="location" value={form.location} onChange={handleChange} disabled={disabled} />
                    {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Location Type *</Label>
                    <Select value={form.locationType} onValueChange={(v) => setField('locationType', v)} disabled={disabled}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="On-site">On-site</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Employment Type *</Label>
                    <Select value={form.employmentType} onValueChange={(v) => setField('employmentType', v)} disabled={disabled}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Temporary">Temporary</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Level *</Label>
                    <Select value={form.experienceLevel} onValueChange={(v) => setField('experienceLevel', v)} disabled={disabled}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entry Level">Entry Level</SelectItem>
                        <SelectItem value="Mid Level">Mid Level</SelectItem>
                        <SelectItem value="Senior Level">Senior Level</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.experienceLevel && <p className="text-xs text-red-500">{errors.experienceLevel}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Job Category *</Label>
                    <Select value={form.jobCategory} onValueChange={(v) => setField('jobCategory', v)} disabled={disabled}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Logistics">Logistics</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.jobCategory && <p className="text-xs text-red-500">{errors.jobCategory}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <Select value={form.visibility} onValueChange={(v) => setField('visibility', v)} disabled={disabled}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Application Deadline</Label>
                    <Input type="date" value={form.applicationDeadline} onChange={(e)=>setField('applicationDeadline', e.target.value)} disabled={disabled} />
                  </div>
                  <div className="space-y-2">
                    <Label>Show Salary</Label>
                    <div className="flex items-center gap-3">
                      <Switch checked={form.showSalary} onCheckedChange={(c)=>setField('showSalary', !!c)} disabled={disabled} />
                      <span className="text-sm text-gray-600">Display range publicly</span>
                    </div>
                  </div>
                    {form.showSalary && (
                      <div className="space-y-2">
                        <Label>Salary Mode</Label>
                        <Select value={form.salaryMode} onValueChange={(v)=> setForm(p=> ({...p, salaryMode: v, ...(v==='single'? {minSalary:'', maxSalary:''}: {singleSalary:''}) }))} disabled={disabled}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="range">Range</SelectItem>
                            <SelectItem value="single">Single</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  <div className="space-y-2">
                    <Label>Min Salary</Label>
                      {form.salaryMode === 'range' ? (
                        <>
                          <Input type="number" value={form.minSalary} onChange={handleChange} name="minSalary" disabled={disabled || !form.showSalary} />
                          {errors.minSalary && <p className="text-xs text-red-500">{errors.minSalary}</p>}
                        </>
                      ) : (
                        <>
                          <Input type="number" value={form.singleSalary} onChange={handleChange} name="singleSalary" disabled={disabled || !form.showSalary} />
                          {errors.singleSalary && <p className="text-xs text-red-500">{errors.singleSalary}</p>}
                        </>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label>Max Salary</Label>
                      {form.salaryMode === 'range' ? (
                        <>
                          <Input type="number" value={form.maxSalary} onChange={handleChange} name="maxSalary" disabled={disabled || !form.showSalary} />
                          {errors.maxSalary && <p className="text-xs text-red-500">{errors.maxSalary}</p>}
                        </>
                      ) : (
                        <p className="text-xs text-gray-500 pt-2">Single salary selected (max = min)</p>
                      )}
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Label className="font-medium">Skills *</Label>
                  <div className="space-y-3 mt-2">
                    {form.skills.map((s, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={s} disabled={disabled} onChange={(e)=>handleSkillChange(i, e.target.value)} placeholder={`Skill ${i+1}`} />
                        {form.skills.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={()=>removeSkill(i)} disabled={disabled}>✕</Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addSkill} disabled={disabled}>Add Skill</Button>
                    {errors.skills && <p className="text-xs text-red-500">{errors.skills}</p>}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="description" className="pt-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Job Description *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={()=>setShowDescPreview(p=>!p)} className="text-xs">
                      {showDescPreview ? <><Edit className="h-3 w-3 mr-1" /> Edit</> : <><Eye className="h-3 w-3 mr-1" /> Preview</>}
                    </Button>
                  </div>
                  {!showDescPreview ? (
                    <Textarea name="description" value={form.description} onChange={handleChange} disabled={disabled} rows={12} className="font-mono text-xs" />
                  ) : (
                    <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] prose" dangerouslySetInnerHTML={{ __html: markdownToHtml(form.description) }} />
                  )}
                  {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                </div>
              </TabsContent>
              <TabsContent value="requirements" className="pt-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Requirements *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={()=>setShowReqPreview(p=>!p)} className="text-xs">
                      {showReqPreview ? <><Edit className="h-3 w-3 mr-1" /> Edit</> : <><Eye className="h-3 w-3 mr-1" /> Preview</>}
                    </Button>
                  </div>
                  {!showReqPreview ? (
                    <Textarea name="requirements" value={form.requirements} onChange={handleChange} disabled={disabled} rows={12} className="font-mono text-xs" />
                  ) : (
                    <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] prose" dangerouslySetInnerHTML={{ __html: markdownToHtml(form.requirements) }} />
                  )}
                  {errors.requirements && <p className="text-xs text-red-500">{errors.requirements}</p>}
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <Label>Benefits</Label>
                  <Textarea name="benefits" value={form.benefits} onChange={handleChange} disabled={disabled} rows={6} />
                </div>
              </TabsContent>
            </Tabs>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={()=>router.push(`/employer/dashboard/jobs/${jobId}`)}>Cancel</Button>
              <Button type="submit" disabled={saving || disabled} className="bg-accent hover:bg-accent/90">
                <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </ProtectedRoute>
  )
}
