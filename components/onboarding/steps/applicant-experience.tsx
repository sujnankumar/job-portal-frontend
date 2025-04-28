"use client"
import { useEffect, useState } from "react"
import { PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

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

interface ApplicantExperienceProps {
  data: any
  onNext: (data: any) => void
}

export default function ApplicantExperience({ data, onNext }: ApplicantExperienceProps) {
  const [experiences, setExperiences] = useState<Experience[]>(() => {
    // Safely initialize experiences array
    if (data && Array.isArray(data)) {
      return data
    } else if (data && data.experience && Array.isArray(data.experience)) {
      return data.experience
    } else {
      return []
    }
  })

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
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

  const handleRemoveExperience = (id: string) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((exp) => exp.id !== id))
    }
  }

  const handleExperienceChange = (index: number, field: keyof Experience, value: any) => {
    const newExperience = [...experiences]
    newExperience[index] = { ...newExperience[index], [field]: value }

    // If current is set to true, clear the end date
    if (field === "current" && value === true) {
      newExperience[index].endDate = ""
    }

    setExperiences(newExperience)
  }

  // Use useEffect to initialize with one experience entry if empty
  useEffect(() => {
    if (experiences.length === 0) {
      setExperiences([
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
  }, [experiences.length])

  const handleSubmit = () => {
    onNext({ experience: experiences })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-dark-gray">Work Experience</h2>
        <p className="text-sm text-gray-500">Add your work experience</p>
      </div>

      {experiences.map((exp, index) => (
        <div key={exp.id} className="border rounded-md p-4 mb-4 bg-light-gray">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-dark-gray">{exp.title ? exp.title : `Experience #${index + 1}`}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveExperience(exp.id)}
              disabled={experiences.length <= 1}
              className="text-gray-500 hover:text-red-500"
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Company</Label>
              <Input
                value={exp.company}
                onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Job Title</Label>
              <Input
                value={exp.title}
                onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={exp.location}
                onChange={(e) => handleExperienceChange(index, "location", e.target.value)}
                placeholder="City, State or Remote"
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Switch
                id={`current-job-${exp.id}`}
                checked={exp.current}
                onCheckedChange={(checked) => handleExperienceChange(index, "current", checked)}
              />
              <Label htmlFor={`current-job-${exp.id}`}>I currently work here</Label>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="month"
                value={exp.startDate}
                onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="month"
                value={exp.endDate}
                onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                disabled={exp.current}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={exp.description}
                onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
                placeholder="Describe your responsibilities and achievements"
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={handleAddExperience} className="mt-2" type="button">
        <PlusCircle className="h-4 w-4 mr-1" /> Add Experience
      </Button>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSubmit} type="button">
          Continue
        </Button>
      </div>
    </div>
  )
}
