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

export default function ProfileEditor() {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "Jane",
    lastName: "Smith",
    headline: "Senior Frontend Developer",
    email: "jane.smith@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    website: "janesmith.dev",
    linkedin: "linkedin.com/in/janesmith",
    github: "github.com/janesmith",
    bio: "Passionate frontend developer with 5+ years of experience building responsive and accessible web applications. Specialized in React, TypeScript, and modern frontend frameworks.",
  })

  const [education, setEducation] = useState<Education[]>([
    {
      id: "1",
      school: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2014-09",
      endDate: "2018-05",
      current: false,
    },
    {
      id: "2",
      school: "Stanford University",
      degree: "Master of Science",
      field: "Human-Computer Interaction",
      startDate: "2018-09",
      endDate: "2020-05",
      current: false,
    },
  ])

  const [experience, setExperience] = useState<Experience[]>([
    {
      id: "1",
      company: "Tech Innovations Inc.",
      title: "Senior Frontend Developer",
      location: "San Francisco, CA",
      startDate: "2022-03",
      endDate: "",
      current: true,
      description:
        "Lead frontend development for multiple projects using React, TypeScript, and Next.js. Implemented responsive designs and improved performance by 40%. Mentored junior developers and conducted code reviews.",
    },
    {
      id: "2",
      company: "Digital Solutions",
      title: "Frontend Developer",
      location: "San Francisco, CA",
      startDate: "2020-06",
      endDate: "2022-02",
      current: false,
      description:
        "Developed and maintained web applications using React and Redux. Collaborated with designers to implement UI/UX improvements. Participated in agile development processes.",
    },
  ])

  const [skills, setSkills] = useState<Skill[]>([
    { id: "1", name: "React", level: "Expert" },
    { id: "2", name: "TypeScript", level: "Expert" },
    { id: "3", name: "Next.js", level: "Advanced" },
    { id: "4", name: "CSS/Tailwind", level: "Expert" },
    { id: "5", name: "JavaScript", level: "Expert" },
    { id: "6", name: "Redux", level: "Advanced" },
    { id: "7", name: "GraphQL", level: "Intermediate" },
    { id: "8", name: "Node.js", level: "Intermediate" },
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
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                  className="mt-1"
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
                      disabled={exp.current}
                      className="mt-1"
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
                      disabled={edu.current}
                      className="mt-1"
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
      <div className="flex justify-end">
        <Button className="bg-accent hover:bg-accent/90">
          <Save className="h-4 w-4 mr-1" /> Save Profile
        </Button>
      </div>
    </div>
  )
}
