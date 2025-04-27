"use client"

import type React from "react"
import { useState } from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle } from "lucide-react"

// Mock company data - in a real app, this would come from an API
const MOCK_COMPANIES = [
  { id: "1", name: "Acme Corporation" },
  { id: "2", name: "Globex Industries" },
  { id: "3", name: "Initech" },
  { id: "4", name: "Umbrella Corporation" },
  { id: "5", name: "Stark Industries" },
]

interface BasicInfoData {
  headline: string
  phone: string
  location: string
  website: string
  linkedin: string
  github: string
  bio: string
  companyId: string
  companyName: string
  isNewCompany: boolean
}

interface EmployerBasicInfoProps {
  data: any
  onNext: (data: BasicInfoData) => void
}

export default function EmployerBasicInfo({ data = {}, onNext }: EmployerBasicInfoProps) {
  // Initialize data with default values if not provided
  const [formData, setFormData] = useState<BasicInfoData>({
    headline: data.headline || "",
    phone: data.phone || "",
    location: data.location || "",
    website: data.website || "",
    linkedin: data.linkedin || "",
    github: data.github || "",
    bio: data.bio || "",
    companyId: data.companyId || "",
    companyName: data.companyName || "",
    isNewCompany: data.isNewCompany || false,
  })

  // Update the handleChange function to use local state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle company selection
  const handleCompanySelect = (value: string) => {
    if (value === "new") {
      setFormData({
        ...formData,
        companyId: "",
        isNewCompany: true,
      })
    } else {
      const selectedCompany = MOCK_COMPANIES.find((company) => company.id === value)
      setFormData({
        ...formData,
        companyId: value,
        companyName: selectedCompany?.name || "",
        isNewCompany: false,
      })
    }
  }

  // Handle new company name change
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      companyName: e.target.value,
    })
  }

  // Add a submit handler to pass data to parent
  const handleSubmit = () => {
    onNext(formData)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-dark-gray">Contact Information</h2>
        <p className="text-sm text-gray-500">
          Let's start with some basic information about you as the company representative
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Select value={formData.isNewCompany ? "new" : formData.companyId} onValueChange={handleCompanySelect}>
            <SelectTrigger id="company">
              <SelectValue placeholder="Select your company" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_COMPANIES.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
              <SelectItem value="new" className="text-accent font-medium">
                <div className="flex items-center">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add a new company
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.isNewCompany && (
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={handleCompanyNameChange}
              className="mt-1"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="headline">Your Job Title</Label>
          <Input
            id="headline"
            name="headline"
            placeholder="e.g., HR Manager, Talent Acquisition Specialist"
            value={formData.headline}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Business Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="location">Office Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="City, State"
            value={formData.location}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            name="linkedin"
            placeholder="linkedin.com/in/username"
            value={formData.linkedin}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="bio">Your Role Description</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Briefly describe your role in the hiring process..."
            value={formData.bio}
            onChange={handleChange}
            className="mt-1 min-h-[120px]"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSubmit}>Continue</Button>
      </div>
    </div>
  )
}
