"use client"
import { useEffect, useState } from "react"
import { PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"

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
  const [isFresher, setIsFresher] = useState(() => {
    // If data indicates fresher, initialize as true
    return data && data.isFresher === true
  })
  const [experiences, setExperiences] = useState<Experience[]>(() => {
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

  // Use useEffect to initialize with one experience entry if empty and not fresher
  useEffect(() => {
    if (!isFresher && experiences.length === 0) {
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
  }, [experiences.length, isFresher])

  const user = useAuthStore((state) => state.user)
  const [profileUpdated, setProfileUpdated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Helper to collect all onboarding data for update_profile
  const getProfilePayload = () => {
    console.log("Collecting profile payload...", user?.onboarding)
    // You may need to adjust this to collect all fields from onboarding
    return {
      ...data.basicInfo,
      ...data,
      education: data.education?.education || [],
      experience: isFresher ? [] : experiences,
      skills: data.skills?.skills || [],
      onboarding: user?.onboarding || {}, // send the full onboarding object, not just boolean
    }
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    setError("")
    try {
      const payload = getProfilePayload()
      await api.put("/profile/update_profile", payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      setProfileUpdated(true)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update profile.")
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (isFresher) {
      onNext({ ...data, isFresher: true, experience: [] })
    } else {
      onNext({ ...data, isFresher: false, experience: experiences })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-dark-gray">Work Experience</h2>
        <p className="text-sm text-gray-500">Add your work experience or indicate if you are a fresher</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Switch id="fresher-switch" checked={isFresher} onCheckedChange={setIsFresher} />
        <Label htmlFor="fresher-switch">I'm a fresher (no work experience)</Label>
      </div>

      {!isFresher && experiences.map((exp, index) => (
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

      {!isFresher && (
        <Button variant="outline" size="sm" onClick={handleAddExperience} className="mt-2" type="button">
          <PlusCircle className="h-4 w-4 mr-1" /> Add Experience
        </Button>
      )}

      <div className="flex justify-end mt-6">
        {!profileUpdated ? (
          <Button onClick={handleUpdateProfile} type="button" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        ) : (
          <Button onClick={handleContinue} type="button">
            Continue to Resume Upload
          </Button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}
