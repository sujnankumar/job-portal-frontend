"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { PlusCircle, Trash2, FileDown, Stars, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Education {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
  current: boolean
}

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

interface Skill {
  id: string
  name: string
  level: string
}

interface Certification {
  id: string
  name: string
  issuer: string
}

// --- AI content & preview types ---
interface AIExperience {
  company: string
  role: string
  period: string
  description: string[]
}

interface AIEducation {
  institution: string
  degree: string
  period: string
}

interface AIProject {
  name: string
  description: string
}

interface Project {
  id: string
  name: string
  description: string
}

interface AICertification {
  name: string
  issuer: string
}

interface AIContent {
  summary: string
  experience: AIExperience[]
  skills: string[]
  education: AIEducation[]
  projects: AIProject[]
  certifications: AICertification[]
}

type ResumePreviewData = {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  address: string
  profileImage?: string | null
  aiContent: AIContent | null
  userSkills: string[]
  userCertifications: Certification[]
  userProjects: Project[]
}

declare global {
  interface Window {
    jspdf?: any
    html2canvas?: any
  }
}

// --- Gemini API helper ---
async function generateContentWithGemini(userInput: {
  fullName: string
  email: string
  phone: string
  address: string
  jobTitle: string
  skills: string
  experience: string
  education: string
  projects: string
  certifications: string
}): Promise<AIContent> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`

  const prompt = `
    Based on the following resume details, generate a professional resume.
    - Full Name: ${userInput.fullName}
    - Email: ${userInput.email}
    - Phone: ${userInput.phone}
    - Address: ${userInput.address}
    - Job Title: ${userInput.jobTitle}
    - Skills: ${userInput.skills}
    - Experience: ${userInput.experience}
    - Education: ${userInput.education}
    - Projects: ${userInput.projects}
    - Certifications: ${userInput.certifications}

    Tasks:
    1. Create a compelling professional summary (2-3 sentences).
    2. Rewrite the work experience descriptions to be more impactful, using action verbs. Focus on achievements rather than just duties. Format each as a bullet point list (3-4 points per job).
    3. Generate a list of 5-7 relevant technical or soft skills based on the provided job title and experience.
    4. Format the education section clearly.
    5. Format the projects section with a name and a brief, impactful description for each project.
    6. Format the certifications section with the name of the certification and the issuing body/year.
  `

  const schema = {
    type: "OBJECT",
    properties: {
      summary: { type: "STRING" },
      experience: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            company: { type: "STRING" },
            role: { type: "STRING" },
            period: { type: "STRING" },
            description: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["company", "role", "period", "description"],
        },
      },
      skills: { type: "ARRAY", items: { type: "STRING" } },
      education: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            institution: { type: "STRING" },
            degree: { type: "STRING" },
            period: { type: "STRING" },
          },
          required: ["institution", "degree", "period"],
        },
      },
      projects: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            description: { type: "STRING" },
          },
          required: ["name", "description"],
        },
      },
      certifications: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            issuer: { type: "STRING" },
          },
          required: ["name", "issuer"],
        },
      },
    },
  // Make experience optional to support freshers
  required: ["summary", "skills", "education", "projects", "certifications"],
  } as const

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  }

  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable")
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`API request failed with status ${response.status}: ${errorBody}`)
  }

  const result = await response.json()
  const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!jsonText) throw new Error("Invalid response from AI provider")
  return JSON.parse(jsonText) as AIContent
}

// --- Preview template: styled to match app ---
const TemplateModern = React.forwardRef<HTMLDivElement, { data: ResumePreviewData }>(({ data }, ref) => (
  <div ref={ref} className="p-8 bg-white text-dark-gray text-sm w-[210mm] min-h-[297mm] mx-auto">
    <header className="flex items-start justify-between border-b-2 border-accent pb-4 mb-6">
      <div className="flex items-center gap-6">
        {data.profileImage && (
          <img src={data.profileImage} alt="Profile" className="h-20 w-20 object-cover rounded-full border" />
        )}
        <div>
          <h1 className="text-3xl font-bold text-dark-gray">{data.fullName || "Your Name"}</h1>
          <p className="text-base text-gray-600">{data.jobTitle || "Your Job Title"}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
            <span>{data.email || "your.email@example.com"}</span>
            <span>{data.phone || "(123) 456-7890"}</span>
            <span>{data.address || "City, State"}</span>
          </div>
        </div>
      </div>
    </header>

    <section className="mb-6">
      <h2 className="text-lg font-semibold text-dark-gray border-b border-gray-200 pb-1 mb-2">Professional Summary</h2>
      <p className="text-gray-700 leading-relaxed">{data.aiContent?.summary || "AI generated summary will appear here."}</p>
    </section>

    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-2">
        {data.aiContent?.experience && data.aiContent.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-dark-gray border-b border-gray-200 pb-1 mb-2">Work Experience</h2>
            {data.aiContent.experience.map((job, index) => (
              <div key={index} className="mb-4">
                <h3 className="font-semibold text-gray-900">{job.role}</h3>
                <div className="flex justify-between text-xs text-gray-600 italic mb-1">
                  <span>{job.company}</span>
                  <span>{job.period}</span>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {job.description?.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {data.userProjects && data.userProjects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-dark-gray border-b border-gray-200 pb-1 mb-2">Projects</h2>
              {(data.aiContent?.projects && data.aiContent.projects.length > 0
                ? data.aiContent.projects.map((project, index) => (
                    <div key={index} className="mb-3">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <p className="text-gray-700 text-sm">{project.description}</p>
                    </div>
                  ))
                : data.userProjects.map((project, index) => (
                    <div key={index} className="mb-3">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <p className="text-gray-700 text-sm">{project.description}</p>
                    </div>
                  ))
              )}
          </section>
        )}

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-dark-gray border-b border-gray-200 pb-1 mb-2">Education</h2>
          {data.aiContent?.education?.map((edu, index) => (
            <div key={index} className="mb-2">
              <h3 className="font-medium text-gray-900">{edu.institution}</h3>
              <p className="text-gray-700">{edu.degree}</p>
              <p className="text-xs text-gray-600 italic">{edu.period}</p>
            </div>
          ))}
        </section>
      </div>

      <aside className="col-span-1">
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-dark-gray border-b border-gray-200 pb-1 mb-2">Skills</h2>
          <ul className="flex flex-wrap gap-2">
            {data.userSkills?.map((skill, index) => (
              <li key={index} className="bg-light-gray text-dark-gray text-xs font-medium px-2.5 py-0.5 rounded-full border">
                {skill}
              </li>
            ))}
          </ul>
        </section>

        {data.userCertifications && data.userCertifications.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-dark-gray border-b border-gray-200 pb-1 mb-2">Certifications</h2>
            {data.userCertifications.map((cert, index) => (
              <div key={index} className="mb-2">
                <h3 className="font-medium text-gray-800 text-sm">{cert.name}</h3>
                <p className="text-xs text-gray-600 italic">{cert.issuer}</p>
              </div>
            ))}
          </section>
        )}
      </aside>
    </div>
  </div>
))

// Classic resume template
const TemplateClassic = React.forwardRef<HTMLDivElement, { data: ResumePreviewData }>(({ data }, ref) => (
  <div ref={ref} className="p-10 bg-white text-gray-900 font-serif text-base w-[210mm] min-h-[297mm]">
    <div className="text-center mb-8">
      {data.profileImage && (
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-300 mx-auto mb-4">
          <img src={data.profileImage} alt="Profile" className="w-full h-full object-cover" />
        </div>
      )}
      <h1 className="text-5xl font-extrabold tracking-widest">{data.fullName || "YOUR NAME"}</h1>
      <p className="text-xl mt-2">{data.jobTitle || "Your Job Title"}</p>
      <div className="flex justify-center space-x-4 text-sm mt-3 text-gray-700">
        <span>{data.email || "your.email@example.com"}</span>
        <span>&bull;</span>
        <span>{data.phone || "(123) 456-7890"}</span>
        <span>&bull;</span>
        <span>{data.address || "City, State"}</span>
      </div>
    </div>
    {data.aiContent?.summary && (
      <div className="border-t-2 border-black pt-4 mb-6">
        <h2 className="text-lg font-bold tracking-wider uppercase mb-2">Summary</h2>
        <p className="text-justify leading-snug">{data.aiContent.summary}</p>
      </div>
    )}
    {data.aiContent?.experience && data.aiContent.experience.length > 0 && (
      <div className="border-t-2 border-black pt-4 mb-6">
        <h2 className="text-lg font-bold tracking-wider uppercase mb-3">Experience</h2>
        {data.aiContent.experience.map((job, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-md font-bold">{job.role}</h3>
              <p className="text-sm font-light">{job.period}</p>
            </div>
            <p className="text-md italic mb-1">{job.company}</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {job.description.map((point, i) => <li key={i}>{point}</li>)}
            </ul>
          </div>
        ))}
      </div>
    )}
    {data.aiContent?.projects && data.aiContent.projects.length > 0 && (
      <div className="border-t-2 border-black pt-4 mb-6">
        <h2 className="text-lg font-bold tracking-wider uppercase mb-3">Projects</h2>
        {data.aiContent.projects.map((project, index) => (
          <div key={index} className="mb-3">
            <h3 className="text-md font-bold">{project.name}</h3>
            <p className="text-sm">{project.description}</p>
          </div>
        ))}
      </div>
    )}
    {data.aiContent?.education && data.aiContent.education.length > 0 && (
      <div className="border-t-2 border-black pt-4 mb-6">
        <h2 className="text-lg font-bold tracking-wider uppercase mb-3">Education</h2>
        {data.aiContent.education.map((edu, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between items-baseline">
              <h3 className="text-md font-bold">{edu.institution}</h3>
              <p className="text-sm font-light">{edu.period}</p>
            </div>
            <p className="text-md italic">{edu.degree}</p>
          </div>
        ))}
      </div>
    )}
    {data.aiContent?.certifications && data.aiContent.certifications.length > 0 && (
      <div className="border-t-2 border-black pt-4 mb-6">
        <h2 className="text-lg font-bold tracking-wider uppercase mb-3">Certifications</h2>
        {data.aiContent.certifications.map((cert, index) => (
          <div key={index} className="mb-2">
            <h3 className="text-md font-bold">{cert.name}</h3>
            <p className="text-md italic">{cert.issuer}</p>
          </div>
        ))}
      </div>
    )}
    {data.aiContent?.skills && data.aiContent.skills.length > 0 && (
      <div className="border-t-2 border-black pt-4">
        <h2 className="text-lg font-bold tracking-wider uppercase mb-3">Skills</h2>
        <p className="text-sm">{data.aiContent.skills.join(' • ')}</p>
      </div>
    )}
  </div>
))

export default function ResumeBuilder() {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
  })

  const [education, setEducation] = useState<Education[]>([
    {
      id: "1",
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      current: false,
    },
  ])

  const [experience, setExperience] = useState<Experience[]>([
    {
      id: "1",
      company: "",
      title: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ])

  const [skills, setSkills] = useState<Skill[]>([
    { id: "1", name: "", level: "Intermediate" },
    { id: "2", name: "", level: "Intermediate" },
    { id: "3", name: "", level: "Intermediate" },
  ])

  // AI & preview state
  const [projects, setProjects] = useState<Project[]>([])
  const [isFresher, setIsFresher] = useState(false)
  const handleAddProject = () => {
    setProjects([
      ...projects,
      { id: Date.now().toString(), name: "", description: "" },
    ])
  }

  const handleRemoveProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id))
  }
  const [certifications, setCertifications] = useState<Certification[]>([])
  const handleAddCertification = () => {
    setCertifications([
      ...certifications,
      { id: Date.now().toString(), name: "", issuer: "" },
    ])
  }

  const handleRemoveCertification = (id: string) => {
    setCertifications(certifications.filter((c) => c.id !== id))
  }
  const [aiContent, setAiContent] = useState<AIContent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState("")
  const resumeRef = useRef<HTMLDivElement | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic'>('modern')

  // Load PDF libs
  useEffect(() => {
    const addScript = (src: string) => {
      if (document.querySelector(`script[src="${src}"]`)) return
      const s = document.createElement("script")
      s.src = src
      s.async = true
      document.body.appendChild(s)
    }
    addScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
    addScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js")
  }, [])

  const formatPeriod = (start?: string, end?: string, current?: boolean) => {
    if (!start && !end) return ""
    const s = start ? new Date(start + "-01").toLocaleString(undefined, { month: "short", year: "numeric" }) : ""
    const e = current ? "Present" : end ? new Date(end + "-01").toLocaleString(undefined, { month: "short", year: "numeric" }) : ""
    return [s, e].filter(Boolean).join(" - ")
  }

  const buildUserInput = () => {
    const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
    const address = personalInfo.location
    const educationStr = education
      .filter((e) => e.school || e.degree || e.field)
      .map((e) => `${e.degree ? e.degree + " in " : ""}${e.field || ""}${e.degree || e.field ? " at " : ""}${e.school || ""} (${formatPeriod(e.startDate, e.endDate, e.current)})`)
      .join(" | ")
    const experienceItems = isFresher ? [] : experience.filter((x) => x.company || x.title || x.description)
    const experienceStr = experienceItems
      .map((x) => `${x.title || "Role"} at ${x.company || "Company"}${x.location ? `, ${x.location}` : ""} (${formatPeriod(x.startDate, x.endDate, x.current)}) - ${x.description || ""}`)
      .join(" | ")
    const skillsStr = skills
      .filter((s) => s.name)
      .map((s) => (s.level ? `${s.name} (${s.level})` : s.name))
      .join(", ")

    const certificationsStr = certifications
      .filter((c) => c.name || c.issuer)
      .map((c) => `${c.name}${c.issuer ? ` (${c.issuer})` : ""}`)
      .join(" | ")

    const projectsStr = projects
      .filter((p) => p.name || p.description)
      .map((p) => `${p.name}${p.description ? `: ${p.description}` : ""}`)
      .join(" | ")

    return {
      fullName,
      email: personalInfo.email,
      phone: personalInfo.phone,
      address,
      jobTitle: personalInfo.headline,
      skills: skillsStr,
      experience: experienceItems.length ? experienceStr : "Fresher with no formal work experience",
      education: educationStr,
      projects: projectsStr,
      certifications: certificationsStr,
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError("")
    setAiContent(null)
    try {
      const input = buildUserInput()
      const generated = await generateContentWithGemini(input)
      setAiContent(generated)
    } catch (e: any) {
      setError(e?.message || "Failed to generate content. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!window.jspdf || !window.html2canvas) {
      setError("PDF libraries are loading. Please try again in a moment.")
      return
    }
    if (!resumeRef.current) return
    setIsDownloading(true)
    const { jsPDF } = window.jspdf
    const html2canvas = window.html2canvas
    try {
      const canvas = await html2canvas(resumeRef.current, { scale: 2, useCORS: true, logging: false, allowTaint: true })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const ratio = canvas.width / canvas.height
      const imgWidth = pdfWidth
      const imgHeight = imgWidth / ratio
      let heightLeft = imgHeight
      let position = 0
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }
      const name = `${personalInfo.firstName || "resume"}_${personalInfo.lastName || ""}`.trim()
      pdf.save(`${name || "resume"}.pdf`)
    } catch (err) {
      console.error("Error generating PDF:", err)
      setError("Could not generate PDF. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleAddEducation = () => {
    setEducation([
      ...education,
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

  const handleAddExperience = () => {
    setExperience([
      ...experience,
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

  const handleAddSkill = () => {
    setSkills([...skills, { id: Date.now().toString(), name: "", level: "Intermediate" }])
  }

  const handleRemoveEducation = (id: string) => {
    if (education.length > 1) {
      setEducation(education.filter((edu) => edu.id !== id))
    }
  }

  const handleRemoveExperience = (id: string) => {
    if (experience.length > 1) {
      setExperience(experience.filter((exp) => exp.id !== id))
    }
  }

  const handleRemoveSkill = (id: string) => {
    if (skills.length > 1) {
      setSkills(skills.filter((skill) => skill.id !== id))
    }
  }

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <div>
        <h3 className="font-medium text-dark-gray mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 mb-6">
            <label className="text-sm font-medium text-dark-gray mb-2 block">Profile Photo (optional)</label>
            <div
              className="relative flex flex-col items-center justify-center border-2 border-dashed border-accent rounded-lg p-4 bg-light-gray cursor-pointer transition hover:border-accent/80"
              onClick={() => document.getElementById('profile-upload')?.click()}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={e => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setProfileImage(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile Preview" className="h-20 w-20 object-cover rounded-full border mb-2" />
              ) : (
                <div className="flex flex-col items-center justify-center h-20 w-20 rounded-full bg-gray-200 border mb-2">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </div>
              )}
              <span className="text-xs text-gray-500">Click or drag & drop to upload</span>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setProfileImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setProfileImage(null);
                  }
                }}
              />
              {profileImage && (
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-white border border-gray-300 rounded-full p-1 text-xs text-gray-500 hover:text-red-500"
                  onClick={e => { e.stopPropagation(); setProfileImage(null); }}
                >Remove</button>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-dark-gray">First Name</label>
            <Input
              value={personalInfo.firstName}
              onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dark-gray">Last Name</label>
            <Input
              value={personalInfo.lastName}
              onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dark-gray">Email</label>
            <Input
              type="email"
              value={personalInfo.email}
              onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dark-gray">Phone</label>
            <Input
              type="tel"
              value={personalInfo.phone}
              onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dark-gray">Location</label>
            <Input
              value={personalInfo.location}
              onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
              placeholder="City, State"
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-dark-gray">Professional Headline</label>
            <Input
              value={personalInfo.headline}
              onChange={(e) => setPersonalInfo({ ...personalInfo, headline: e.target.value })}
              placeholder="e.g., Senior Frontend Developer with 5+ years of experience"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Education */}
      <div>
        <h3 className="font-medium text-dark-gray mb-4">Education</h3>
        {education.map((edu, index) => (
          <div key={edu.id} className="border rounded-md p-4 mb-4 bg-light-gray">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-dark-gray">Education #{index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveEducation(edu.id)}
                disabled={education.length <= 1}
                className="text-gray-500 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-dark-gray">School/University</label>
                <Input
                  value={edu.school}
                  onChange={(e) => {
                    const newEducation = [...education]
                    newEducation[index].school = e.target.value
                    setEducation(newEducation)
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray">Degree</label>
                <Input
                  value={edu.degree}
                  onChange={(e) => {
                    const newEducation = [...education]
                    newEducation[index].degree = e.target.value
                    setEducation(newEducation)
                  }}
                  placeholder="e.g., Bachelor's, Master's"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-dark-gray">Field of Study</label>
                <Input
                  value={edu.field}
                  onChange={(e) => {
                    const newEducation = [...education]
                    newEducation[index].field = e.target.value
                    setEducation(newEducation)
                  }}
                  placeholder="e.g., Computer Science"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-dark-gray">Start Date</label>
                  <Input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => {
                      const newEducation = [...education]
                      newEducation[index].startDate = e.target.value
                      setEducation(newEducation)
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-gray">End Date</label>
                  <Input
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => {
                      const newEducation = [...education]
                      newEducation[index].endDate = e.target.value
                      setEducation(newEducation)
                    }}
                    disabled={edu.current}
                    className="mt-1"
                  />
                </div>
                  <div className="col-span-2 flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={edu.current}
                      onChange={e => {
                        const newEducation = [...education]
                        newEducation[index].current = e.target.checked
                        if (e.target.checked) newEducation[index].endDate = ""
                        setEducation(newEducation)
                      }}
                      className="accent-accent mr-2"
                    />
                    <span className="text-xs text-gray-500">Currently studying here</span>
                  </div>
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={handleAddEducation} className="mt-2">
          <PlusCircle className="h-4 w-4 mr-1" /> Add Education
        </Button>
      </div>

      {/* Experience (optional, hidden if fresher) */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-medium text-dark-gray">Work Experience</h3>
          <label className="flex items-center gap-1 text-xs text-gray-500">
            <input type="checkbox" checked={isFresher} onChange={e => setIsFresher(e.target.checked)} className="accent-accent" />
            Fresher (no experience)
          </label>
        </div>
        {!isFresher && (
          <>
            {experience.map((exp, index) => (
              <div key={exp.id} className="border rounded-md p-4 mb-4 bg-light-gray">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-dark-gray">Experience #{index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveExperience(exp.id)}
                    disabled={experience.length <= 1}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-dark-gray">Company</label>
                    <Input
                      value={exp.company}
                      onChange={(e) => {
                        const newExperience = [...experience]
                        newExperience[index].company = e.target.value
                        setExperience(newExperience)
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-gray">Job Title</label>
                    <Input
                      value={exp.title}
                      onChange={(e) => {
                        const newExperience = [...experience]
                        newExperience[index].title = e.target.value
                        setExperience(newExperience)
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-gray">Location</label>
                    <Input
                      value={exp.location}
                      onChange={(e) => {
                        const newExperience = [...experience]
                        newExperience[index].location = e.target.value
                        setExperience(newExperience)
                      }}
                      placeholder="City, State or Remote"
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium text-dark-gray">Start Date</label>
                      <Input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => {
                          const newExperience = [...experience]
                          newExperience[index].startDate = e.target.value
                          setExperience(newExperience)
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-dark-gray">End Date</label>
                      <Input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => {
                          const newExperience = [...experience]
                          newExperience[index].endDate = e.target.value
                          setExperience(newExperience)
                        }}
                        disabled={exp.current}
                        className="mt-1"
                      />
                    </div>
                      <div className="col-span-2 flex items-center mt-2">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={e => {
                            const newExperience = [...experience]
                            newExperience[index].current = e.target.checked
                            if (e.target.checked) newExperience[index].endDate = ""
                            setExperience(newExperience)
                          }}
                          className="accent-accent mr-2"
                        />
                        <span className="text-xs text-gray-500">Currently working here</span>
                      </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-dark-gray">Description</label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => {
                        const newExperience = [...experience]
                        newExperience[index].description = e.target.value
                        setExperience(newExperience)
                      }}
                      placeholder="Describe your responsibilities and achievements"
                      className="mt-1 min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={handleAddExperience} className="mt-2">
              <PlusCircle className="h-4 w-4 mr-1" /> Add Experience
            </Button>
          </>
        )}
      </div>
      {/* Projects (optional) */}
      <div>
        <h3 className="font-medium text-dark-gray mb-4">Projects</h3>
        <div className="border rounded-md p-4 bg-light-gray">
          <div className="space-y-3">
            {projects.map((project, index) => (
              <div key={project.id} className="flex gap-3 items-center">
                <div className="flex-1">
                  <Input
                    value={project.name}
                    onChange={(e) => {
                      const newProjects = [...projects]
                      newProjects[index].name = e.target.value
                      setProjects(newProjects)
                    }}
                    placeholder="Project name (e.g., Portfolio Website)"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={project.description}
                    onChange={(e) => {
                      const newProjects = [...projects]
                      newProjects[index].description = e.target.value
                      setProjects(newProjects)
                    }}
                    placeholder="Short description (e.g., Built with React and Node.js)"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveProject(project.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleAddProject} className="mt-3">
            <PlusCircle className="h-4 w-4 mr-1" /> Add Project
          </Button>
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="font-medium text-dark-gray mb-4">Skills</h3>
        <div className="border rounded-md p-4 bg-light-gray">
          <div className="space-y-3">
            {skills.map((skill, index) => (
              <div key={skill.id} className="flex gap-3 items-center">
                <div className="flex-1">
                  <Input
                    value={skill.name}
                    onChange={(e) => {
                      const newSkills = [...skills]
                      newSkills[index].name = e.target.value
                      setSkills(newSkills)
                    }}
                    placeholder="e.g., JavaScript, Project Management"
                  />
                </div>
                <div className="w-40">
                  <Select
                    value={skill.level}
                    onValueChange={(value) => {
                      const newSkills = [...skills]
                      newSkills[index].level = value
                      setSkills(newSkills)
                    }}
                  >
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
      </div>

      {/* Certifications (optional) */}
      <div>
        <h3 className="font-medium text-dark-gray mb-4">Certifications</h3>
        <div className="border rounded-md p-4 bg-light-gray">
          <div className="space-y-3">
            {certifications.map((cert, index) => (
              <div key={cert.id} className="flex gap-3 items-center">
                <div className="flex-1">
                  <Input
                    value={cert.name}
                    onChange={(e) => {
                      const newCerts = [...certifications]
                      newCerts[index].name = e.target.value
                      setCertifications(newCerts)
                    }}
                    placeholder="Certification name (e.g., AWS Certified Developer)"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={cert.issuer}
                    onChange={(e) => {
                      const newCerts = [...certifications]
                      newCerts[index].issuer = e.target.value
                      setCertifications(newCerts)
                    }}
                    placeholder="Issuing body/year (e.g., Amazon, 2024)"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCertification(cert.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleAddCertification} className="mt-3">
            <PlusCircle className="h-4 w-4 mr-1" /> Add Certification
          </Button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" className="sm:w-auto">
          Cancel
        </Button>
        <Button onClick={handleGenerate} disabled={isGenerating} className="bg-accent hover:bg-accent/90 sm:w-auto">
          {isGenerating ? (
            <span className="flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" /> Generating…</span>
          ) : (
            <span className="flex items-center gap-2"><Stars className="h-4 w-4" /> Generate with AI</span>
          )}
        </Button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {/* Preview & Download */}
      <div className="space-y-4">
        <h3 className="font-medium text-dark-gray">Resume Preview</h3>
        <div className="border rounded-md bg-light-gray p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              Template:
              <button onClick={() => setSelectedTemplate('modern')} className={`px-3 py-1 text-sm rounded-full ${selectedTemplate === 'modern' ? 'bg-accent text-white' : 'bg-gray-200'}`}>Modern</button>
              <button onClick={() => setSelectedTemplate('classic')} className={`px-3 py-1 text-sm rounded-full ${selectedTemplate === 'classic' ? 'bg-accent text-white' : 'bg-gray-200'}`}>Classic</button>
            </div>
            <Button onClick={handleDownloadPdf} disabled={!aiContent || isDownloading} className="bg-green-600 hover:bg-green-600/90">
              {isDownloading ? (
                <span className="flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" /> Preparing PDF…</span>
              ) : (
                <span className="flex items-center gap-2"><FileDown className="h-4 w-4" /> Download PDF</span>
              )}
            </Button>
          </div>
          <div className="bg-white p-4 overflow-x-auto">
            <div className="mx-auto w-[210mm]">
              {selectedTemplate === 'modern' ? (
                <TemplateModern
                  ref={resumeRef}
                  data={{
                    fullName: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
                    jobTitle: personalInfo.headline,
                    email: personalInfo.email,
                    phone: personalInfo.phone,
                    address: personalInfo.location,
                    profileImage,
                    aiContent,
                    userSkills: skills.filter(s => s.name).map(s => s.name),
                    userCertifications: certifications.filter(c => c.name || c.issuer),
                    userProjects: projects.filter(p => p.name || p.description),
                  }}
                />
              ) : (
                <TemplateClassic
                  ref={resumeRef}
                  data={{
                    fullName: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
                    jobTitle: personalInfo.headline,
                    email: personalInfo.email,
                    phone: personalInfo.phone,
                    address: personalInfo.location,
                    profileImage,
                    aiContent,
                    userSkills: skills.filter(s => s.name).map(s => s.name),
                    userCertifications: certifications.filter(c => c.name || c.issuer),
                    userProjects: projects.filter(p => p.name || p.description),
                  }}
                />
              )}
            </div>
          </div>
          {!aiContent && (
            <div className="text-center text-sm text-gray-500 mt-2">Fill the form and click "Generate with AI" to see a live preview here.</div>
          )}
        </div>
      </div>
    </div>
  )
}
