"use client"

import { useState } from "react"
import { PlusCircle, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import axios from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"

interface Education {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
  current: boolean
}

interface Experience {
  id: string
  company: string
  title: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface Skill {
  id: string
  name: string
  level: string
}

interface ProfileEditorProps {
  isEditing: boolean
  setIsEditing: (val: boolean) => void
  personalInfo: any
  setPersonalInfo: (val: any) => void
  education: any[]
  setEducation: (val: any[]) => void
  experience: any[]
  setExperience: (val: any[]) => void
  skills: any[]
  setSkills: (val: any[]) => void
  onCancel: () => void
}

export default function ProfileEditor({
  isEditing,
  setIsEditing,
  personalInfo,
  setPersonalInfo,
  education,
  setEducation,
  experience,
  setExperience,
  skills,
  setSkills,
  onCancel,
}: ProfileEditorProps) {
  const { user } = useAuthStore()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Personal info validation
    if (!personalInfo.first_name?.trim()) {
      newErrors.first_name = "First name is required"
    }
    
    if (!personalInfo.last_name?.trim()) {
      newErrors.last_name = "Last name is required"
    }
    
    if (!personalInfo.email?.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
      newErrors.email = "Email is invalid"
    }
    
    if (personalInfo.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(personalInfo.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
    }
    
    if (personalInfo.website && !/^https?:\/\/[^\s]+$/.test(personalInfo.website)) {
      newErrors.website = "Please enter a valid website URL (including http:// or https://)"
    }
    
    if (personalInfo.linkedin && !/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+\/?$/.test(personalInfo.linkedin)) {
      newErrors.linkedin = "Please enter a valid LinkedIn profile URL"
    }
    
    if (personalInfo.github && !/^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9\-]+\/?$/.test(personalInfo.github)) {
      newErrors.github = "Please enter a valid GitHub profile URL"
    }
    
    // Education validation
    education.forEach((edu, index) => {
      if (edu.school?.trim() && !edu.degree?.trim()) {
        newErrors[`education_${index}_degree`] = "Degree is required when school is provided"
      }
      if (edu.degree?.trim() && !edu.school?.trim()) {
        newErrors[`education_${index}_school`] = "School is required when degree is provided"
      }
      if (edu.startDate && edu.endDate && !edu.current && new Date(edu.startDate) >= new Date(edu.endDate)) {
        newErrors[`education_${index}_endDate`] = "End date must be after start date"
      }
    })
    
    // Experience validation
    experience.forEach((exp, index) => {
      if (exp.company?.trim() && !exp.title?.trim()) {
        newErrors[`experience_${index}_title`] = "Job title is required when company is provided"
      }
      if (exp.title?.trim() && !exp.company?.trim()) {
        newErrors[`experience_${index}_company`] = "Company is required when job title is provided"
      }
      if (exp.startDate && exp.endDate && !exp.current && new Date(exp.startDate) >= new Date(exp.endDate)) {
        newErrors[`experience_${index}_endDate`] = "End date must be after start date"
      }
    })
    
    // Skills validation
    const validSkills = skills.filter(skill => skill.name?.trim())
    if (validSkills.length === 0) {
      newErrors.skills = "Please add at least one skill"
    }
    
  setErrors(newErrors)
  return { isValid: Object.keys(newErrors).length === 0, newErrors }
  }

  const handleSave = async () => {
    const { isValid, newErrors } = validateForm()
    if (!isValid) {
      const messages = Object.values(newErrors)
      messages.slice(0, 5).forEach((m, idx) => setTimeout(() => toast.error(m), idx * 60))
      if (messages.length > 5) setTimeout(() => toast.error(`${messages.length - 5} more validation errors...`), 6 * 60)
      return
    }
    
    try {
      await axios.put(
        "/profile/update_profile",
        {
          ...personalInfo,
          education,
          experience,
          skills,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )
      setIsEditing(false)
      setErrors({})
  toast.success("Profile updated successfully")
    } catch (e: any) {
  toast.error(e?.response?.data?.detail || "Failed to update profile")
    }
  }

  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        id: Date.now().toString(),
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        current: false,
      },
    ])
  }

  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        id: Date.now().toString(),
        company: "",
        title: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ])
  }

  const handleAddSkill = () => {
    setSkills([...skills, { id: Date.now().toString(), name: "", level: "Intermediate" }])
  }

  const handleRemoveEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id))
  }

  const handleRemoveExperience = (id: string) => {
    setExperience(experience.filter((exp) => exp.id !== id))
  }

  const handleRemoveSkill = (id: string) => {
    setSkills(skills.filter((skill) => skill.id !== id))
  }

  return (
    <div className="space-y-8">
      <Accordion type="multiple" defaultValue={["personal", "experience", "education", "skills"]}>
        {/* Personal Information */}
        <AccordionItem value="personal" className="border-b border-gray-200">
          <AccordionTrigger className="text-lg font-medium text-dark-gray py-4">Personal Information</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={personalInfo.first_name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, first_name: e.target.value })}
                  className="mt-1"
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={personalInfo.last_name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, last_name: e.target.value })}
                  className="mt-1"
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input
                  id="headline"
                  value={personalInfo.headline}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, headline: e.target.value })}
                  placeholder="e.g., Senior Frontend Developer with 5+ years of experience"
                  className="mt-1"
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="mt-1"
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="mt-1"
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                  placeholder="City, State"
                  className="mt-1"
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={personalInfo.website}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                  placeholder="yourwebsite.com"
                  className="mt-1"
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={personalInfo.linkedin}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/username"
                  className="mt-1"
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={personalInfo.github}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                  placeholder="github.com/username"
                  className="mt-1"
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={personalInfo.bio}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                  placeholder="Write a short bio about yourself..."
                  className="mt-1 min-h-[120px]"
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Experience */}
        <AccordionItem value="experience" className="border-b border-gray-200">
          <AccordionTrigger className="text-lg font-medium text-dark-gray py-4">Work Experience</AccordionTrigger>
          <AccordionContent>
            {experience.map((exp, index) => (
              <div key={exp.id} className="border rounded-md p-4 mb-4 bg-light-gray">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-dark-gray">{exp.title ? exp.title : `Experience #${index + 1}`}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => {
                        const newExperience = [...experience]
                        newExperience[index].company = e.target.value
                        setExperience(newExperience)
                      }}
                      className="mt-1"
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Job Title</Label>
                    <Input
                      value={exp.title}
                      onChange={(e) => {
                        const newExperience = [...experience]
                        newExperience[index].title = e.target.value
                        setExperience(newExperience)
                      }}
                      className="mt-1"
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={exp.location}
                      onChange={(e) => {
                        const newExperience = [...experience]
                        newExperience[index].location = e.target.value
                        setExperience(newExperience)
                      }}
                      placeholder="City, State or Remote"
                      className="mt-1"
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <Switch
                      id={`current-job-${exp.id}`}
                      checked={exp.current}
                      onCheckedChange={(checked) => {
                        const newExperience = [...experience]
                        newExperience[index].current = checked
                        if (checked) {
                          newExperience[index].endDate = ""
                        }
                        setExperience(newExperience)
                      }}
                    />
                    <Label htmlFor={`current-job-${exp.id}`}>I currently work here</Label>
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => {
                        const newExperience = [...experience]
                        newExperience[index].startDate = e.target.value
                        setExperience(newExperience)
                      }}
                      className="mt-1"
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => {
                        const newExperience = [...experience]
                        newExperience[index].endDate = e.target.value
                        setExperience(newExperience)
                      }}
                      disabled={exp.current || !isEditing}
                      className="mt-1"
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => {
                        const newExperience = [...experience]
                        newExperience[index].description = e.target.value
                        setExperience(newExperience)
                      }}
                      placeholder="Describe your responsibilities and achievements"
                      className="mt-1 min-h-[100px]"
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={handleAddExperience} className="mt-2">
              <PlusCircle className="h-4 w-4 mr-1" /> Add Experience
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Education */}
        <AccordionItem value="education" className="border-b border-gray-200">
          <AccordionTrigger className="text-lg font-medium text-dark-gray py-4">Education</AccordionTrigger>
          <AccordionContent>
            {education.map((edu, index) => (
              <div key={edu.id} className="border rounded-md p-4 mb-4 bg-light-gray">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-dark-gray">{edu.school ? edu.school : `Education #${index + 1}`}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEducation(edu.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>School/University</Label>
                    <Input
                      value={edu.school}
                      onChange={(e) => {
                        const newEducation = [...education]
                        newEducation[index].school = e.target.value
                        setEducation(newEducation)
                      }}
                      className="mt-1"
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => {
                        const newEducation = [...education]
                        newEducation[index].degree = e.target.value
                        setEducation(newEducation)
                      }}
                      placeholder="e.g., Bachelor's, Master's"
                      className="mt-1"
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>Field of Study</Label>
                    <Input
                      value={edu.field}
                      onChange={(e) => {
                        const newEducation = [...education]
                        newEducation[index].field = e.target.value
                        setEducation(newEducation)
                      }}
                      placeholder="e.g., Computer Science"
                      className="mt-1"
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <Switch
                      id={`current-edu-${edu.id}`}
                      checked={edu.current}
                      onCheckedChange={(checked) => {
                        const newEducation = [...education]
                        newEducation[index].current = checked
                        if (checked) {
                          newEducation[index].endDate = ""
                        }
                        setEducation(newEducation)
                      }}
                    />
                    <Label htmlFor={`current-edu-${edu.id}`}>I'm currently studying here</Label>
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={edu.startDate}
                      onChange={(e) => {
                        const newEducation = [...education]
                        newEducation[index].startDate = e.target.value
                        setEducation(newEducation)
                      }}
                      className="mt-1"
                      readOnly={!isEditing}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      value={edu.endDate}
                      onChange={(e) => {
                        const newEducation = [...education]
                        newEducation[index].endDate = e.target.value
                        setEducation(newEducation)
                      }}
                      disabled={edu.current || !isEditing}
                      className="mt-1"
                      readOnly={!isEditing}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={handleAddEducation} className="mt-2">
              <PlusCircle className="h-4 w-4 mr-1" /> Add Education
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Skills */}
        <AccordionItem value="skills" className="border-b border-gray-200">
          <AccordionTrigger className="text-lg font-medium text-dark-gray py-4">Skills</AccordionTrigger>
          <AccordionContent>
            <div className="border rounded-md p-4 bg-light-gray">
              <div className="space-y-3">
                {skills.map((skill, index) => (
                  <div key={skill.id} className="flex gap-3 items-center">
                    <div className="flex-1">
                      <Input
                        value={skill.name}
                        onChange={(e) => {
                          const newSkills = [...skills]
                          newSkills[index].name = e.target.value
                          setSkills(newSkills)
                        }}
                        placeholder="e.g., JavaScript, Project Management"
                        readOnly={!isEditing}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="w-40">
                      <Select
                        value={skill.level}
                        onValueChange={(value) => {
                          const newSkills = [...skills]
                          newSkills[index].level = value
                          setSkills(newSkills)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={handleAddSkill} className="mt-3">
                <PlusCircle className="h-4 w-4 mr-1" /> Add Skill
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        {isEditing && (
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
        )}
        <Button className="bg-accent hover:bg-accent/90" disabled={!isEditing} onClick={handleSave} type="button">
          <Save className="h-4 w-4 mr-1" /> Save Profile
        </Button>
      </div>
    </div>
  )
}
