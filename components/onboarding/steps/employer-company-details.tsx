"use client"

import type React from "react"

import { useState, useRef } from "react" // Add useRef
import { FileUp, File, X, CheckCircle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface CompanyDetailsData {
  description: string
  foundedYear: string
  companySize: string
  industry: string
  website: string
  companyEmail: string // Added email
  companyPhone: string
  culture?: string // New optional field
  benefits?: string // New optional field
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
    companyEmail: data?.companyEmail || "", // Added email state
    companyPhone: data?.companyPhone || "", // Added phone state
    culture: data?.culture || "", // New optional field
    benefits: data?.benefits || "", // New optional field
    logo: data?.logo || null,
  })
  const [dragActive, setDragActive] = useState(false)
  const [showDescriptionPreview, setShowDescriptionPreview] = useState(false)
  const [showCulturePreview, setShowCulturePreview] = useState(false)
  const [showBenefitsPreview, setShowBenefitsPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null) // Add ref for file input

  // Simple markdown to HTML converter for preview
  const markdownToHtml = (markdown: string) => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-dark-gray mb-2 mt-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-dark-gray mb-3 mt-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-dark-gray mb-4 mt-4">$1</h1>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/\n\n/gim, '</p><p class="mb-3">')
      .replace(/^\n/gim, '')
      .replace(/^(?!<[h|l])/gim, '<p class="mb-3">')
      .replace(/(<li.*<\/li>)/gim, '<ul class="list-disc ml-6 mb-3">$1</ul>')
      .replace(/<\/ul>\s*<ul[^>]*>/gim, '')
  }

  // Convert HTML back to markdown to ensure we always store markdown
  const htmlToMarkdown = (html: string) => {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gim, '# $1')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gim, '## $1') 
      .replace(/<h3[^>]*>(.*?)<\/h3>/gim, '### $1')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gim, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gim, '*$1*')
      .replace(/<li[^>]*>(.*?)<\/li>/gim, '- $1')
      .replace(/<ul[^>]*>|<\/ul>/gim, '')
      .replace(/<p[^>]*>(.*?)<\/p>/gim, '$1\n\n')
      .replace(/<br\s*\/?>/gim, '\n')
      .replace(/&nbsp;/gim, ' ')
      .replace(/&amp;/gim, '&')
      .replace(/&lt;/gim, '<')
      .replace(/&gt;/gim, '>')
      .replace(/&quot;/gim, '"')
      .replace(/&#39;/gim, "'")
      .trim()
  }

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
    // Ensure all text fields are stored as markdown by converting any HTML back to markdown
    const cleanedData = {
      ...formData,
      description: htmlToMarkdown(formData.description),
      culture: formData.culture ? htmlToMarkdown(formData.culture) : formData.culture,
      benefits: formData.benefits ? htmlToMarkdown(formData.benefits) : formData.benefits,
    }
    onNext(cleanedData)
  }

  const handleButtonClick = () => {
    // Programmatically click the hidden file input
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-dark-gray">Company Details</h2>
        <p className="text-sm text-gray-500">Tell us more about your company</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="description">Company Description <span className="text-red-500">*</span></Label>
          <p className="text-xs text-gray-500 mb-2">
            You can use markdown formatting:
            <strong> **bold** </strong>, <em> *italic* </em>, 
            <strong> # Header </strong>, <strong> - List items </strong>
          </p>
          <Tabs defaultValue="write" className="mt-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="write" className="mt-2">
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your company, mission, and values...&#10;&#10;Example:&#10;## About Us&#10;We are a **leading tech company** focused on innovation.&#10;&#10;### Our Mission&#10;- Transform the industry&#10;- Deliver exceptional value&#10;- Foster innovation"
                value={formData.description}
                onChange={handleChange}
                className="min-h-[120px] font-mono text-sm"
              />
              <div className="mt-2 text-xs text-gray-500">
                <p className="font-semibold mb-2">Markdown Guide:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong># Large Header</strong></p>
                    <p><strong>## Medium Header</strong></p>
                    <p><strong>### Small Header</strong></p>
                  </div>
                  <div>
                    <p><strong>**Bold Text**</strong></p>
                    <p><strong>*Italic Text*</strong></p>
                    <p><strong>- List Item</strong></p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="mt-2">
              <div 
                className="min-h-[120px] p-3 border rounded-md bg-gray-50 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(formData.description) }}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Label htmlFor="foundedYear">Founded Year <span className="text-red-500">*</span></Label>
          <Input
            id="foundedYear"
            name="foundedYear"
            type="number"
            placeholder="e.g., 2010"
            value={formData.foundedYear}
            onChange={handleChange}
            className="mt-1"
            min={1900}
            max={new Date().getFullYear()}
            defaultValue={2025}
          />
        </div>

        <div>
          <Label htmlFor="companySize">Company Size <span className="text-red-500">*</span></Label>
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
          <Label htmlFor="industry">Industry <span className="text-red-500">*</span></Label>
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

        {/* Added Email Input */}
        <div>
          <Label htmlFor="companyEmail">Company Email <span className="text-red-500">*</span></Label>
          <Input
            id="companyEmail"
            name="companyEmail"
            type="email"
            placeholder="e.g., contact@company.com"
            value={formData.companyEmail}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        {/* Added Phone Input */}
        <div>
          <Label htmlFor="companyPhone">Company Contact Phone <span className="text-red-500">*</span></Label>
          <Input
            id="companyPhone"
            name="companyPhone"
            type="tel"
            placeholder="e.g., +1 123 456 7890"
            value={formData.companyPhone}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        {/* New Culture Field */}
        <div className="md:col-span-2">
          <Label htmlFor="culture">Company Culture (Optional)</Label>
          <p className="text-xs text-gray-500 mb-2">
            Describe your company culture, values, and work environment. Supports markdown formatting.
          </p>
          <Tabs defaultValue="write" className="mt-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="write" className="mt-2">
              <Textarea
                id="culture"
                name="culture"
                placeholder="Tell candidates about your company culture...&#10;&#10;Example:&#10;## Our Values&#10;- **Innovation** - We embrace new ideas&#10;- **Collaboration** - We work better together&#10;- **Growth** - Continuous learning and development"
                value={formData.culture}
                onChange={handleChange}
                className="min-h-[100px] font-mono text-sm"
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-2">
              <div 
                className="min-h-[100px] p-3 border rounded-md bg-gray-50 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(formData.culture || "No culture information provided.") }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* New Benefits Field */}
        <div className="md:col-span-2">
          <Label htmlFor="benefits">Employee Benefits (Optional)</Label>
          <p className="text-xs text-gray-500 mb-2">
            List the benefits and perks you offer to employees. Supports markdown formatting.
          </p>
          <Tabs defaultValue="write" className="mt-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="write" className="mt-2">
              <Textarea
                id="benefits"
                name="benefits"
                placeholder="List your employee benefits...&#10;&#10;Example:&#10;## Benefits Package&#10;- **Health Insurance** - Comprehensive medical coverage&#10;- **Flexible Hours** - Work-life balance&#10;- **Professional Development** - Training and conferences&#10;- **Stock Options** - Equity participation"
                value={formData.benefits}
                onChange={handleChange}
                className="min-h-[100px] font-mono text-sm"
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-2">
              <div 
                className="min-h-[100px] p-3 border rounded-md bg-gray-50 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(formData.benefits || "No benefits information provided.") }}
              />
            </TabsContent>
          </Tabs>
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
                {/* Trigger file input click via ref */}
                <Button
                  type="button" // Add type="button" back to prevent form submission
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleButtonClick} // Add onClick handler
                >
                  Choose File
                </Button>
                <input
                  id="logo-upload"
                  ref={fileInputRef} // Assign ref
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
