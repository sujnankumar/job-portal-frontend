"use client"

import type React from "react"

import { useState } from "react"
import { FileUp, File, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface CompanyDetailsData {
  description: string
  foundedYear: string
  companySize: string
  industry: string
  website: string
  logo: File | null
}

interface EmployerCompanyDetailsProps {
  data: any
  onNext: (data: CompanyDetailsData) => void
}

export default function EmployerCompanyDetails({ data, onNext }: EmployerCompanyDetailsProps) {
  const [formData, setFormData] = useState<CompanyDetailsData>({
    description: data?.description || "",
    foundedYear: data?.foundedYear || "",
    companySize: data?.companySize || "",
    industry: data?.industry || "",
    website: data?.website || "",
    logo: data?.logo || null,
  })
  const [dragActive, setDragActive] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (isValidFile(file)) {
        setFormData({
          ...formData,
          logo: file,
        })
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (isValidFile(file)) {
        setFormData({
          ...formData,
          logo: file,
        })
      }
    }
  }

  const handleRemoveFile = () => {
    setFormData({
      ...formData,
      logo: null,
    })
  }

  const isValidFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/svg+xml"]
    const maxSize = 2 * 1024 * 1024 // 2MB

    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a JPG, PNG, or SVG file.")
      return false
    }

    if (file.size > maxSize) {
      alert("File is too large. Maximum size is 2MB.")
      return false
    }

    return true
  }

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return size + " bytes"
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + " KB"
    } else {
      return (size / (1024 * 1024)).toFixed(1) + " MB"
    }
  }

  const handleSubmit = () => {
    onNext(formData)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-dark-gray">Company Details</h2>
        <p className="text-sm text-gray-500">Tell us more about your company</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="description">Company Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe your company, mission, and culture..."
            value={formData.description}
            onChange={handleChange}
            className="mt-1 min-h-[120px]"
          />
        </div>

        <div>
          <Label htmlFor="foundedYear">Founded Year</Label>
          <Input
            id="foundedYear"
            name="foundedYear"
            type="number"
            placeholder="e.g., 2010"
            value={formData.foundedYear}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="companySize">Company Size</Label>
          <Select value={formData.companySize} onValueChange={(value) => handleSelectChange("companySize", value)}>
            <SelectTrigger id="companySize">
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="501-1000">501-1000 employees</SelectItem>
              <SelectItem value="1001+">1001+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="industry">Industry</Label>
          <Select value={formData.industry} onValueChange={(value) => handleSelectChange("industry", value)}>
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="website">Company Website</Label>
          <Input
            id="website"
            name="website"
            placeholder="https://yourcompany.com"
            value={formData.website}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2 mt-4">
          <Label className="mb-2 block">Company Logo</Label>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center",
              dragActive
                ? "border-primary bg-primary/5"
                : formData.logo
                  ? "border-gray-200 bg-light-gray"
                  : "border-primary bg-light-cream",
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <FileUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-dark-gray mb-1">
                {formData.logo ? "Upload a different logo" : "Upload your company logo"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">Supported formats: JPG, PNG, SVG (Max 2MB)</p>
              <label htmlFor="logo-upload">
                <Button className="bg-primary hover:bg-primary/90" type="button">
                  Choose File
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.svg"
                  onChange={handleFileChange}
                />
              </label>
              <p className="text-xs text-gray-500 mt-3">or drag and drop your file here</p>
            </div>
          </div>

          {formData.logo && (
            <div className="mt-4 flex items-center justify-between border rounded-md p-3 bg-white">
              <div className="flex items-center">
                <div className="h-10 w-10 flex items-center justify-center bg-light-gray rounded-md">
                  <File className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-dark-gray">{formData.logo.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(formData.logo.size)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={handleSubmit} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  )
}
