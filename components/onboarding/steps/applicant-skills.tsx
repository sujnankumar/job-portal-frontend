"use client"
import { PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

interface Skill {
  id: string
  name: string
  level: string
}

interface ApplicantSkillsProps {
  data: any
  onNext: (data: any) => void
}

export default function ApplicantSkills({ data, onNext }: ApplicantSkillsProps) {
  const [skills, setSkills] = useState<Skill[]>(() => {
    // Initialize with data.skills if it exists and is an array, otherwise empty array
    return Array.isArray(data?.skills) ? data.skills : []
  })

  // Use useEffect to initialize with one skill if empty
  useEffect(() => {
    if (skills.length === 0) {
      setSkills([{ id: Date.now().toString(), name: "", level: "Intermediate" }])
    }
  }, [skills.length])

  const handleAddSkill = () => {
    setSkills([...skills, { id: Date.now().toString(), name: "", level: "Intermediate" }])
  }

  const handleRemoveSkill = (id: string) => {
    if (skills.length > 1) {
      setSkills(skills.filter((skill) => skill.id !== id))
    }
  }

  const handleSkillChange = (index: number, field: keyof Skill, value: string) => {
    const newSkills = [...skills]
    newSkills[index] = { ...newSkills[index], [field]: value }
    setSkills(newSkills)
  }

  const handleSubmit = () => {
    onNext({ skills })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-dark-gray">Skills</h2>
        <p className="text-sm text-gray-500">Add your professional skills and proficiency levels</p>
      </div>

      <div className="border rounded-md p-4 bg-light-gray">
        <div className="space-y-3">
          {skills.map((skill, index) => (
            <div key={skill.id} className="flex gap-3 items-center">
              <div className="flex-1">
                <Input
                  value={skill.name}
                  onChange={(e) => handleSkillChange(index, "name", e.target.value)}
                  placeholder="e.g., JavaScript, Project Management"
                />
              </div>
              <div className="w-40">
                <Select value={skill.level} onValueChange={(value) => handleSkillChange(index, "level", value)}>
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

      <Button onClick={handleSubmit} className="w-full">
        Continue
      </Button>
    </div>
  )
}
