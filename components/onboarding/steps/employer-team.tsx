"use client"
import { PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"

interface TeamMember {
  id: string
  name: string
  position: string
  email: string
}

interface EmployerTeamProps {
  data: any
  onNext: (data: any) => void
}

export default function EmployerTeam({ data, onNext }: EmployerTeamProps) {
  // Initialize team members state with default empty array
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    // If data.teamMembers exists and is an array, use it; otherwise, use empty array
    return Array.isArray(data?.teamMembers) ? data.teamMembers : []
  })

  const handleAddTeamMember = () => {
    setTeamMembers([
      ...teamMembers,
      {
        id: Date.now().toString(),
        name: "",
        position: "",
        email: "",
      },
    ])
  }

  const handleRemoveTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id))
  }

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const newTeam = [...teamMembers]
    newTeam[index] = { ...newTeam[index], [field]: value }
    setTeamMembers(newTeam)
  }

  const handleSubmit = () => {
    onNext({ teamMembers })
  }

  // Add this useEffect hook to ensure we have at least one team member
  useEffect(() => {
    if (teamMembers.length === 0) {
      handleAddTeamMember()
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-dark-gray">Hiring Team</h2>
        <p className="text-sm text-gray-500">Add team members who will be involved in the hiring process</p>
      </div>

      {teamMembers.map((member, index) => (
        <div key={member.id} className="border rounded-md p-4 mb-4 bg-light-gray">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-dark-gray">{member.name ? member.name : `Team Member #${index + 1}`}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveTeamMember(member.id)}
              className="text-gray-500 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={member.name}
                onChange={(e) => handleTeamMemberChange(index, "name", e.target.value)}
                placeholder="Full Name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Position</Label>
              <Input
                value={member.position}
                onChange={(e) => handleTeamMemberChange(index, "position", e.target.value)}
                placeholder="e.g., HR Manager, Technical Interviewer"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={member.email}
                onChange={(e) => handleTeamMemberChange(index, "email", e.target.value)}
                placeholder="email@company.com"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={handleAddTeamMember} className="mt-2">
        <PlusCircle className="h-4 w-4 mr-1" /> Add Team Member
      </Button>

      <div className="bg-light-cream p-4 rounded-md border border-primary/20">
        <h3 className="font-medium text-dark-gray mb-2">Team Collaboration Benefits</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
          <li>Team members will receive notifications about new applications</li>
          <li>Collaborate on candidate evaluations and feedback</li>
          <li>Schedule interviews with candidates more efficiently</li>
          <li>Share notes and ratings on potential hires</li>
        </ul>
      </div>

      <div className="mt-6">
        <Button onClick={handleSubmit} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  )
}
