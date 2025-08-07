"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Upload, Save, Plus, Trash2, Eye, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import api from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"

export default function JobPostingForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    locationType: "On-site",
    employmentType: "Full-time",
    minSalary: "",
    maxSalary: "",
    showSalary: true,
    description: "",
    requirements: "",
    benefits: "",
    applicationDeadline: "",
    skills: ["", "", ""],
    experienceLevel: "",
    jobCategory: "",
  })
  const loginUser = useAuthStore((state) => state.user)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDescriptionPreview, setShowDescriptionPreview] = useState(false)
  const [showRequirementsPreview, setShowRequirementsPreview] = useState(false)

  // Simple markdown to HTML converter
  const markdownToHtml = (markdown: string) => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-dark-gray mb-2 mt-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-dark-gray mb-3 mt-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-dark-gray mb-4 mt-4">$1</h1>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/\n\n/gim, '</p><p class="mb-3">')
      .replace(/^\n/gim, '')
      .replace(/^(?!<[h|l])/gim, '<p class="mb-3">')
      .replace(/(<li.*<\/li>)/gim, '<ul class="list-disc ml-6 mb-3">$1</ul>')
      .replace(/<\/ul>\s*<ul[^>]*>/gim, '')
  }

  const handleNext = () => {
    if (activeTab === "details") {
      setActiveTab("description")
    } else if (activeTab === "description") {
      setActiveTab("requirements")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...formData.skills]
    updatedSkills[index] = value
    setFormData({
      ...formData,
      skills: updatedSkills,
    })
  }

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, ""],
    })
  }

  const removeSkill = (index: number) => {
    const updatedSkills = [...formData.skills]
    updatedSkills.splice(index, 1)
    setFormData({
      ...formData,
      skills: updatedSkills,
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Required fields validation
    if (!formData.title.trim()) {
      newErrors.title = "Job title is required"
    }
    
    if (!formData.department.trim()) {
      newErrors.department = "Department is required"
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Job description is required"
    } else if (formData.description.trim().length < 50) {
      newErrors.description = "Job description must be at least 50 characters"
    }
    
    if (!formData.requirements.trim()) {
      newErrors.requirements = "Requirements are required"
    } else if (formData.requirements.trim().length < 30) {
      newErrors.requirements = "Requirements must be at least 30 characters"
    }
    
    if (!formData.experienceLevel) {
      newErrors.experienceLevel = "Experience level is required"
    }
    
    if (!formData.jobCategory) {
      newErrors.jobCategory = "Job category is required"
    }
    
    // Skills validation
    const validSkills = formData.skills.filter(skill => skill.trim() !== "")
    if (validSkills.length === 0) {
      newErrors.skills = "At least one skill is required"
    }
    
    // Salary validation
    if (formData.showSalary) {
      if (!formData.minSalary || isNaN(Number(formData.minSalary))) {
        newErrors.minSalary = "Valid minimum salary is required"
      }
      if (!formData.maxSalary || isNaN(Number(formData.maxSalary))) {
        newErrors.maxSalary = "Valid maximum salary is required"
      }
      if (formData.minSalary && formData.maxSalary && Number(formData.minSalary) >= Number(formData.maxSalary)) {
        newErrors.maxSalary = "Maximum salary must be greater than minimum salary"
      }
    }
    
    // Application deadline validation
    if (formData.applicationDeadline) {
      const deadlineDate = new Date(formData.applicationDeadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (deadlineDate < today) {
        newErrors.applicationDeadline = "Application deadline cannot be in the past"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    try {
      const token = loginUser?.token
      if (!token) {
        setError("You must be logged in as an employer to post a job.")
        setIsLoading(false)
        return
      }
      const payload = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        location_type: formData.locationType,
        employment_type: formData.employmentType,
        min_salary: formData.showSalary ? formData.minSalary : undefined,
        max_salary: formData.showSalary ? formData.maxSalary : undefined,
        show_salary: formData.showSalary,
        description: markdownToHtml(formData.description), // Convert markdown to HTML
        requirements: markdownToHtml(formData.requirements), // Convert markdown to HTML
        benefits: formData.benefits,
        application_deadline: formData.applicationDeadline,
        skills: formData.skills.filter((s) => s.trim() !== ""),
        auto_expire: true,
        validity_days: 30,
        experience_level: formData.experienceLevel,
        job_category: formData.jobCategory,
      }
      const res = await api.post("/job/post_job", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setSuccess("Job posted successfully!")
      setTimeout(() => {
        router.push("/employer/dashboard")
      }, 1200)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to post job. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border-b rounded-t-xl rounded-b-none p-0 bg-light-gray">
          <TabsTrigger
            value="details"
            className="flex-1 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none py-3"
          >
            Job Details
          </TabsTrigger>
          <TabsTrigger value="description" className="flex-1 py-3">
            Description
          </TabsTrigger>
          <TabsTrigger
            value="requirements"
            className="flex-1 rounded-tr-xl rounded-tl-none rounded-bl-none rounded-br-none py-3"
          >
            Requirements & Benefits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="pt-6 space-y-6">
          {/* Basic Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Developer"
                required
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-red-500">*</span>
              </Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Engineering, Marketing, Sales"
                required
              />
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
                required
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationType">
                Location Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.locationType}
                onValueChange={(value) => handleSelectChange("locationType", value)}
              >
                <SelectTrigger id="locationType">
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On-site">On-site</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentType">
                Employment Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value) => handleSelectChange("employmentType", value)}
              >
                <SelectTrigger id="employmentType">
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
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
              <Label htmlFor="experienceLevel">
                Experience Level <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) => handleSelectChange("experienceLevel", value)}
              >
                <SelectTrigger id="experienceLevel">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry Level">Entry Level</SelectItem>
                  <SelectItem value="Mid Level">Mid Level</SelectItem>
                  <SelectItem value="Senior Level">Senior Level</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                </SelectContent>
              </Select>
              {errors.experienceLevel && <p className="text-red-500 text-xs mt-1">{errors.experienceLevel}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobCategory">
                Job Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.jobCategory}
                onValueChange={(value) => handleSelectChange("jobCategory", value)}
              >
                <SelectTrigger id="jobCategory">
                  <SelectValue placeholder="Select job category" />
                </SelectTrigger>
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
              {errors.jobCategory && <p className="text-red-500 text-xs mt-1">{errors.jobCategory}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationDeadline">Application Deadline</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="applicationDeadline"
                  name="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  className="pl-9"
                />
                {errors.applicationDeadline && <p className="text-red-500 text-xs mt-1">{errors.applicationDeadline}</p>}
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor="showSalary" className="font-medium">
                Salary Information
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showSalary"
                  checked={formData.showSalary}
                  onCheckedChange={(checked) => handleSwitchChange("showSalary", checked)}
                />
                <Label htmlFor="showSalary" className="font-normal">
                  Display salary range on job posting
                </Label>
              </div>
            </div>

            <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", !formData.showSalary && "opacity-50")}>
              <div className="space-y-2">
                <Label htmlFor="minSalary">Minimum Salary (USD)</Label>
                <Input
                  id="minSalary"
                  name="minSalary"
                  type="number"
                  value={formData.minSalary}
                  onChange={handleChange}
                  placeholder="e.g. 80000"
                  disabled={!formData.showSalary}
                />
                {errors.minSalary && <p className="text-red-500 text-xs mt-1">{errors.minSalary}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxSalary">Maximum Salary (USD)</Label>
                <Input
                  id="maxSalary"
                  name="maxSalary"
                  type="number"
                  value={formData.maxSalary}
                  onChange={handleChange}
                  placeholder="e.g. 120000"
                  disabled={!formData.showSalary}
                />
                {errors.maxSalary && <p className="text-red-500 text-xs mt-1">{errors.maxSalary}</p>}
              </div>
            </div>
          </div>

          {/* Auto-Expiry */}
          <div className="pt-4 border-t">
            <div>
              <Label className="font-medium">Auto-Expiry</Label>
              <p className="text-sm text-gray-500 mt-1">
                Job posting will be automatically removed after 30 days to keep listings fresh and relevant.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="description" className="pt-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">
                Job Description <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDescriptionPreview(!showDescriptionPreview)}
                  className="text-xs"
                >
                  {showDescriptionPreview ? (
                    <>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" /> Preview
                    </>
                  )}
                </Button>
              </div>
            </div>

            {!showDescriptionPreview ? (
              <>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={`Describe the role, responsibilities, and what a typical day looks like...

You can use markdown formatting:
# Main Heading
## Section Heading  
### Sub Heading
**Bold text**
*Italic text*
- Bullet point
- Another bullet point

Example:
## About the Role
We are looking for a **Senior Frontend Developer** to join our team.

### Responsibilities:
- Develop user-facing features
- Optimize applications for speed
- Collaborate with backend developers`}
                  className="min-h-[300px] font-mono text-sm"
                  required
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
                  <p className="font-semibold mb-2">Markdown Guide:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><code># Heading 1</code></p>
                      <p><code>## Heading 2</code></p>
                      <p><code>### Heading 3</code></p>
                      <p><code>**Bold text**</code></p>
                    </div>
                    <div>
                      <p><code>*Italic text*</code></p>
                      <p><code>- Bullet point</code></p>
                      <p><code>* Bullet point</code></p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px]">
                <p className="text-sm text-gray-600 mb-3 border-b pb-2">Preview:</p>
                <div 
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(formData.description) }}
                />
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label className="font-medium">
              Required Skills <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-3">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder={`Skill ${index + 1}, e.g. React, Project Management`}
                  />
                  {formData.skills.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSkill(index)}
                      className="h-10 w-10 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                <Plus className="h-4 w-4 mr-1" /> Add Skill
              </Button>
              {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="pt-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="requirements">
                Requirements <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRequirementsPreview(!showRequirementsPreview)}
                  className="text-xs"
                >
                  {showRequirementsPreview ? (
                    <>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" /> Preview
                    </>
                  )}
                </Button>
              </div>
            </div>

            {!showRequirementsPreview ? (
              <>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder={`List qualifications, experience, education, and other requirements...

You can use markdown formatting:

## Required Qualifications:
- Bachelor's degree in Computer Science
- **3+ years** of experience with React
- Experience with *TypeScript*

## Preferred Qualifications:
- Experience with Next.js
- Knowledge of GraphQL`}
                  className="min-h-[300px] font-mono text-sm"
                  required
                />
                {errors.requirements && <p className="text-red-500 text-xs mt-1">{errors.requirements}</p>}
                <p className="text-xs text-gray-500">
                  Tip: Use markdown formatting for better readability. Use bullet points (-) for lists and **bold** for emphasis.
                </p>
              </>
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px]">
                <p className="text-sm text-gray-600 mb-3 border-b pb-2">Preview:</p>
                <div 
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(formData.requirements) }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits and Perks</Label>
            <Textarea
              id="benefits"
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              placeholder="List benefits, perks, and other incentives..."
              className="min-h-[200px]"
            />
          </div>
        </TabsContent>
      </Tabs>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => router.push("/employer/dashboard")}>
          Cancel
        </Button>
        {activeTab === "requirements" ? (
          <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isLoading}>
            <Save className="h-4 w-4 mr-1" /> {isLoading ? "Posting..." : "Post Job"}
          </Button>
        ) : (
          <Button type="button" onClick={handleNext} className="bg-accent hover:bg-accent/90">
            Next
          </Button>
        )}
      </div>
    </form>
  )
}
