"use client"

import { useState } from "react"
import { PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export default function ResumeBuilder() {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
  })

  const [education, setEducation] = useState<Education[]>([
    {
      id: "1",
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      current: false,
    },
  ])

  const [experience, setExperience] = useState<Experience[]>([
    {
      id: "1",
      company: "",
      title: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ])

  const [skills, setSkills] = useState<Skill[]>([
    { id: "1", name: "", level: "Intermediate" },
    { id: "2", name: "", level: "Intermediate" },
    { id: "3", name: "", level: "Intermediate" },
  ])

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
    if (education.length > 1) {
      setEducation(education.filter((edu) => edu.id !== id))
    }
  }

  const handleRemoveExperience = (id: string) => {
    if (experience.length > 1) {
      setExperience(experience.filter((exp) => exp.id !== id))
    }
  }

  const handleRemoveSkill = (id: string) => {
    if (skills.length > 1) {
      setSkills(skills.filter((skill) => skill.id !== id))
    }
  }

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <div>
        <h3 className="font-medium text-dark-gray mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-dark-gray">First Name</label>
            <Input
              value={personalInfo.firstName}
              onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dark-gray">Last Name</label>
            <Input
              value={personalInfo.lastName}
              onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dark-gray">Email</label>
            <Input
              type="email"
              value={personalInfo.email}
              onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dark-gray">Phone</label>
            <Input
              type="tel"
              value={personalInfo.phone}
              onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dark-gray">Location</label>
            <Input
              value={personalInfo.location}
              onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
              placeholder="City, State"
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-dark-gray">Professional Headline</label>
            <Input
              value={personalInfo.headline}
              onChange={(e) => setPersonalInfo({ ...personalInfo, headline: e.target.value })}
              placeholder="e.g., Senior Frontend Developer with 5+ years of experience"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Education */}
      <div>
        <h3 className="font-medium text-dark-gray mb-4">Education</h3>
        {education.map((edu, index) => (
          <div key={edu.id} className="border rounded-md p-4 mb-4 bg-light-gray">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-dark-gray">Education #{index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveEducation(edu.id)}
                disabled={education.length <= 1}
                className="text-gray-500 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-dark-gray">School/University</label>
                <Input
                  value={edu.school}
                  onChange={(e) => {
                    const newEducation = [...education]
                    newEducation[index].school = e.target.value
                    setEducation(newEducation)
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray">Degree</label>
                <Input
                  value={edu.degree}
                  onChange={(e) => {
                    const newEducation = [...education]
                    newEducation[index].degree = e.target.value
                    setEducation(newEducation)
                  }}
                  placeholder="e.g., Bachelor's, Master's"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray">Field of Study</label>
                <Input
                  value={edu.field}
                  onChange={(e) => {
                    const newEducation = [...education]
                    newEducation[index].field = e.target.value
                    setEducation(newEducation)
                  }}
                  placeholder="e.g., Computer Science"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-dark-gray">Start Date</label>
                  <Input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => {
                      const newEducation = [...education]
                      newEducation[index].startDate = e.target.value
                      setEducation(newEducation)
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray">End Date</label>
                  <Input
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => {
                      const newEducation = [...education]
                      newEducation[index].endDate = e.target.value
                      setEducation(newEducation)
                    }}
                    disabled={edu.current}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={handleAddEducation} className="mt-2">
          <PlusCircle className="h-4 w-4 mr-1" /> Add Education
        </Button>
      </div>

      {/* Experience */}
      <div>
        <h3 className="font-medium text-dark-gray mb-4">Work Experience</h3>
        {experience.map((exp, index) => (
          <div key={exp.id} className="border rounded-md p-4 mb-4 bg-light-gray">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-dark-gray">Experience #{index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveExperience(exp.id)}
                disabled={experience.length <= 1}
                className="text-gray-500 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-dark-gray">Company</label>
                <Input
                  value={exp.company}
                  onChange={(e) => {
                    const newExperience = [...experience]
                    newExperience[index].company = e.target.value
                    setExperience(newExperience)
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray">Job Title</label>
                <Input
                  value={exp.title}
                  onChange={(e) => {
                    const newExperience = [...experience]
                    newExperience[index].title = e.target.value
                    setExperience(newExperience)
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray">Location</label>
                <Input
                  value={exp.location}
                  onChange={(e) => {
                    const newExperience = [...experience]
                    newExperience[index].location = e.target.value
                    setExperience(newExperience)
                  }}
                  placeholder="City, State or Remote"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-dark-gray">Start Date</label>
                  <Input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => {
                      const newExperience = [...experience]
                      newExperience[index].startDate = e.target.value
                      setExperience(newExperience)
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray">End Date</label>
                  <Input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => {
                      const newExperience = [...experience]
                      newExperience[index].endDate = e.target.value
                      setExperience(newExperience)
                    }}
                    disabled={exp.current}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-dark-gray">Description</label>
                <Textarea
                  value={exp.description}
                  onChange={(e) => {
                    const newExperience = [...experience]
                    newExperience[index].description = e.target.value
                    setExperience(newExperience)
                  }}
                  placeholder="Describe your responsibilities and achievements"
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={handleAddExperience} className="mt-2">
          <PlusCircle className="h-4 w-4 mr-1" /> Add Experience
        </Button>
      </div>

      {/* Skills */}
      <div>
        <h3 className="font-medium text-dark-gray mb-4">Skills</h3>
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
                  disabled={skills.length <= 1}
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
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" className="sm:w-auto">
          Cancel
        </Button>
        <Button className="bg-accent hover:bg-accent/90 sm:w-auto">Generate Resume</Button>
      </div>
    </div>
  )
}
