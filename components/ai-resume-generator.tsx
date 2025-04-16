"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Download, Copy, RefreshCw, FileText } from "lucide-react"

export default function AIResumeGenerator() {
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    experience: "3-5",
    skills: "",
    education: "",
    style: "professional",
  })

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

  const handleGenerate = () => {
    setGenerating(true)
    // Simulate AI generation with a timeout
    setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
    }, 2000)
  }

  const handleRegenerate = () => {
    setGenerating(true)
    // Simulate AI regeneration with a timeout
    setTimeout(() => {
      setGenerating(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-medium text-dark-gray">AI Resume Generator</h2>
      </div>

      <Tabs defaultValue="input">
        <TabsList className="w-full border-b rounded-t-xl rounded-b-none p-0 bg-light-gray">
          <TabsTrigger
            value="input"
            className="flex-1 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none py-3"
          >
            Input Details
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="flex-1 rounded-tr-xl rounded-tl-none rounded-bl-none rounded-br-none py-3"
            disabled={!generated}
          >
            Resume Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="pt-4 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">
                Target Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Developer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">
                Job Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                placeholder="Paste the job description here to optimize your resume for this specific role..."
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Select value={formData.experience} onValueChange={(value) => handleSelectChange("experience", value)}>
                  <SelectTrigger id="experience">
                    <SelectValue placeholder="Select years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-2">0-2 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Resume Style</Label>
                <Select value={formData.style} onValueChange={(value) => handleSelectChange("style", value)}>
                  <SelectTrigger id="style">
                    <SelectValue placeholder="Select resume style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Key Skills</Label>
              <Textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="List your key skills, separated by commas (e.g. React, TypeScript, UI/UX Design)"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Textarea
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="List your educational background (e.g. Bachelor's in Computer Science, University of California)"
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={generating || !formData.jobTitle || !formData.jobDescription}
              className="bg-accent hover:bg-accent/90"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" /> Generate Resume
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="pt-4 space-y-6">
          <div className="bg-white border rounded-lg p-8 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-dark-gray">Jane Smith</h2>
              <p className="text-gray-600">Senior Frontend Developer</p>
              <div className="flex justify-center gap-3 mt-2 text-sm text-gray-500">
                <span>jane.smith@example.com</span>
                <span>•</span>
                <span>(555) 123-4567</span>
                <span>•</span>
                <span>San Francisco, CA</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-dark-gray border-b pb-1 mb-2">Professional Summary</h3>
              <p className="text-gray-700">
                Results-driven Senior Frontend Developer with 5+ years of experience building responsive and accessible
                web applications. Specialized in React, TypeScript, and modern JavaScript frameworks with a strong focus
                on performance optimization and user experience. Seeking to leverage my technical expertise and
                leadership skills as a Senior Frontend Developer at Tech Innovations Inc.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-dark-gray border-b pb-1 mb-2">Work Experience</h3>
              <div className="mb-4">
                <div className="flex justify-between">
                  <h4 className="font-medium text-dark-gray">Senior Frontend Developer</h4>
                  <span className="text-sm text-gray-500">March 2021 - Present</span>
                </div>
                <p className="text-gray-600">Digital Solutions, San Francisco, CA</p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  <li>
                    Led frontend development for multiple projects using React, TypeScript, and Next.js, resulting in a
                    40% improvement in performance metrics
                  </li>
                  <li>
                    Implemented responsive designs and accessibility improvements that increased mobile user engagement
                    by 35%
                  </li>
                  <li>Mentored junior developers and conducted code reviews, improving team productivity by 25%</li>
                  <li>
                    Collaborated with UX/UI designers to implement intuitive user interfaces that received positive
                    feedback from 90% of users
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex justify-between">
                  <h4 className="font-medium text-dark-gray">Frontend Developer</h4>
                  <span className="text-sm text-gray-500">June 2018 - February 2021</span>
                </div>
                <p className="text-gray-600">Web Innovations, San Francisco, CA</p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                  <li>
                    Developed and maintained web applications using React and Redux, serving over 100,000 monthly active
                    users
                  </li>
                  <li>
                    Collaborated with designers to implement UI/UX improvements that increased user retention by 20%
                  </li>
                  <li>Participated in agile development processes, consistently meeting sprint goals and deadlines</li>
                  <li>Optimized application performance by implementing code splitting and lazy loading techniques</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-dark-gray border-b pb-1 mb-2">Skills</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <ul className="list-disc list-inside text-gray-700">
                  <li>React & React Hooks</li>
                  <li>TypeScript / JavaScript (ES6+)</li>
                  <li>Next.js</li>
                  <li>Redux / Context API</li>
                </ul>
                <ul className="list-disc list-inside text-gray-700">
                  <li>HTML5 / CSS3 / Tailwind CSS</li>
                  <li>Responsive Web Design</li>
                  <li>Web Accessibility (WCAG)</li>
                  <li>Performance Optimization</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-dark-gray border-b pb-1 mb-2">Education</h3>
              <div>
                <div className="flex justify-between">
                  <h4 className="font-medium text-dark-gray">Bachelor of Science in Computer Science</h4>
                  <span className="text-sm text-gray-500">2014 - 2018</span>
                </div>
                <p className="text-gray-600">University of California, Berkeley</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={handleRegenerate}>
              <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
            </Button>
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-1" /> Copy to Clipboard
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button className="bg-accent hover:bg-accent/90">
              <Download className="h-4 w-4 mr-1" /> Download PDF
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-light-cream p-4 rounded-md">
        <h3 className="font-medium text-dark-gray flex items-center">
          <Sparkles className="h-4 w-4 mr-1 text-accent" /> How it works
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Our AI analyzes the job description and your skills to create a tailored resume that highlights your most
          relevant experience. The generated resume is optimized for both human recruiters and Applicant Tracking
          Systems (ATS).
        </p>
      </div>
    </div>
  )
}
