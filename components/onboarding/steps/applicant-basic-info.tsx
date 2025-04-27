"use client"

import type React from "react"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface BasicInfoData {
  headline: string
  phone: string
  location: string
  website: string
  linkedin: string
  github: string
  bio: string
}

interface ApplicantBasicInfoProps {
  data: any
  onNext: (data: BasicInfoData) => void
}

export default function ApplicantBasicInfo({ data, onNext }: ApplicantBasicInfoProps) {
  const [formData, setFormData] = useState<BasicInfoData>({
    headline: data?.headline || "",
    phone: data?.phone || "",
    location: data?.location || "",
    website: data?.website || "",
    linkedin: data?.linkedin || "",
    github: data?.github || "",
    bio: data?.bio || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-dark-gray">Basic Information</h2>
        <p className="text-sm text-gray-500">Let's start with some basic information about you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="headline">Professional Headline</Label>
          <Input
            id="headline"
            name="headline"
            placeholder="e.g., Senior Frontend Developer with 5+ years of experience"
            value={formData.headline}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
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
          <Label htmlFor="location">Location</Label>
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
          <Label htmlFor="website">Personal Website</Label>
          <Input
            id="website"
            name="website"
            placeholder="https://yourwebsite.com"
            value={formData.website}
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

        <div>
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            name="github"
            placeholder="github.com/username"
            value={formData.github}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="bio">Professional Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Write a short bio about yourself..."
            value={formData.bio}
            onChange={handleChange}
            className="mt-1 min-h-[120px]"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  )
}
