"use client"
import { useEffect, useState } from "react"
import { PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuthStore } from "@/store/authStore"


interface Education {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
  current: boolean
}

interface ApplicantEducationProps {
  data: any
  onNext: (data: any) => void
}

export default function ApplicantEducation({ data, onNext }: ApplicantEducationProps) {
  // Initialize state with data from props or empty array
  const [educationList, setEducationList] = useState<Education[]>(() => {
    if (data && Array.isArray(data.education)) {
      return data.education
    }
    return []
  })
  const user = useAuthStore((state) => state.user)
  const handleAddEducation = () => {
    setEducationList([
      ...educationList,
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

  const handleRemoveEducation = (id: string) => {
    if (educationList.length > 1) {
      setEducationList(educationList.filter((edu) => edu.id !== id))
    }
  }

  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    const newEducation = [...educationList]
    newEducation[index] = { ...newEducation[index], [field]: value }

    // If current is set to true, clear the end date
    if (field === "current" && value === true) {
      newEducation[index].endDate = ""
    }

    setEducationList(newEducation)
  }

  const handleSubmit = () => {
    onNext({ ...data, education: educationList })
  }

  // Use useEffect to initialize with one education entry if empty
  useEffect(() => {
    if (educationList.length === 0) {
      setEducationList([
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
  }, [])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-dark-gray">Education</h2>
        <p className="text-sm text-gray-500">Add your educational background</p>
      </div>

      {educationList.map((edu, index) => (
        <div key={edu.id} className="border rounded-md p-4 mb-4 bg-light-gray">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-dark-gray">{edu.school ? edu.school : `Education #${index + 1}`}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveEducation(edu.id)}
              disabled={educationList.length <= 1}
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
                onChange={(e) => handleEducationChange(index, "school", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Degree</Label>
              <Input
                value={edu.degree}
                onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                placeholder="e.g., Bachelor's, Master's"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Field of Study</Label>
              <Input
                value={edu.field}
                onChange={(e) => handleEducationChange(index, "field", e.target.value)}
                placeholder="e.g., Computer Science"
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Switch
                id={`current-edu-${edu.id}`}
                checked={edu.current}
                onCheckedChange={(checked) => handleEducationChange(index, "current", checked)}
              />
              <Label htmlFor={`current-edu-${edu.id}`}>I'm currently studying here</Label>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="month"
                value={edu.startDate}
                onChange={(e) => handleEducationChange(index, "startDate", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="month"
                value={edu.endDate}
                onChange={(e) => handleEducationChange(index, "endDate", e.target.value)}
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

      <div className="flex justify-end mt-6">
        <Button onClick={handleSubmit}>Continue</Button>
      </div>
    </div>
  )
}
