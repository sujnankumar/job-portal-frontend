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
import { Calendar, Upload, Save, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import api from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"

export default function JobPostingForm() {
  const router = useRouter()
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
    companyLogo: null,
    skills: ["", "", ""],
    autoExpire: true,
    experienceLevel: "",
    jobCategory: "",
  })
  const loginUser = useAuthStore((state) => state.user)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
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
        description: formData.description,
        requirements: formData.requirements,
        benefits: formData.benefits,
        application_deadline: formData.applicationDeadline,
        skills: formData.skills.filter((s) => s.trim() !== ""),
        auto_expire: formData.autoExpire,
        validity_days: formData.autoExpire ? 15 : undefined,
        experience_level: formData.experienceLevel,
        job_category: formData.jobCategory,
        // company_logo: formData.companyLogo, // handle file upload separately if needed
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
      <Tabs defaultValue="details">
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
              </div>
            </div>
          </div>

          {/* Company Logo */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="font-medium">Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
                {formData.companyLogo ? (
                  <Image
                    src="/abstract-circuit-board.png"
                    width={64}
                    height={64}
                    alt="Company Logo"
                    className="object-contain"
                  />
                ) : (
                  <Upload className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <Button type="button" variant="outline" className="mb-2">
                  <Upload className="h-4 w-4 mr-1" /> Upload Logo
                </Button>
                <p className="text-xs text-gray-500">
                  Recommended size: 200x200px. Max file size: 2MB. Supported formats: PNG, JPG, SVG.
                </p>
              </div>
            </div>
          </div>

          {/* Auto-Expiry */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label htmlFor="autoExpire" className="font-medium">
                Auto-Expiry
              </Label>
              <p className="text-sm text-gray-500">Automatically remove job posting after 15 days</p>
            </div>
            <Switch
              id="autoExpire"
              checked={formData.autoExpire}
              onCheckedChange={(checked) => handleSwitchChange("autoExpire", checked)}
            />
          </div>
        </TabsContent>

        <TabsContent value="description" className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">
              Job Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what a typical day looks like..."
              className="min-h-[200px]"
              required
            />
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
            </div>
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="requirements">
              Requirements <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="List qualifications, experience, education, and other requirements..."
              className="min-h-[200px]"
              required
            />
            <p className="text-xs text-gray-500">
              Tip: Use bullet points for better readability. Start each point on a new line with a dash (-).
            </p>
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
        <Button type="button" variant="outline" onClick={() => router.push("/employer/dashboard")}>Cancel</Button>
        <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isLoading}>
          <Save className="h-4 w-4 mr-1" /> {isLoading ? "Posting..." : "Post Job"}
        </Button>
      </div>
    </form>
  )
}
