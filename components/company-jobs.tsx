"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { MapPin, DollarSign, Clock, Bookmark, BookmarkCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Mock data for company jobs
const companyJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    location: "San Francisco, CA (Remote)",
    salary: "$120,000 - $160,000/year",
    type: "Full-time",
    posted: "2 days ago",
    tags: ["React", "TypeScript", "Next.js"],
    description:
      "We're looking for a Senior Frontend Developer to join our team. You'll be responsible for building and maintaining user interfaces for our web applications. The ideal candidate has strong experience with React, TypeScript, and modern frontend development practices.",
    isNew: true,
  },
  {
    id: "2",
    title: "Backend Engineer",
    location: "San Francisco, CA",
    salary: "$130,000 - $170,000/year",
    type: "Full-time",
    posted: "1 week ago",
    tags: ["Node.js", "Python", "AWS", "Microservices"],
    description:
      "We're seeking a Backend Engineer to design, develop, and maintain our server-side applications. You'll work on API development, database design, and system integration. Strong knowledge of Node.js, Python, and AWS is required.",
    isNew: false,
  },
  {
    id: "3",
    title: "Product Designer",
    location: "San Francisco, CA (Hybrid)",
    salary: "$100,000 - $140,000/year",
    type: "Full-time",
    posted: "3 days ago",
    tags: ["UI/UX", "Figma", "Design Systems"],
    description:
      "We're looking for a Product Designer to create intuitive and engaging user experiences across our digital products. You'll be responsible for the entire design process from research to implementation. Experience with design systems and Figma is required.",
    isNew: true,
  },
  {
    id: "4",
    title: "DevOps Engineer",
    location: "Remote",
    salary: "$125,000 - $165,000/year",
    type: "Full-time",
    posted: "2 weeks ago",
    tags: ["Kubernetes", "Docker", "CI/CD", "Terraform"],
    description:
      "We're seeking a DevOps Engineer to help us build and maintain our cloud infrastructure. You'll be responsible for automation, continuous integration, deployment, and monitoring of our systems and applications.",
    isNew: false,
  },
]

export default function CompanyJobs({ companyId }: { companyId: string }) {
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [savedJobs, setSavedJobs] = useState<string[]>([])

  const toggleExpand = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId)
  }

  const toggleSaveJob = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
  }

  return (
    <div className="space-y-4">
      {companyJobs.map((job) => (
        <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Job Card Header */}
          <div
            className="p-5 cursor-pointer hover:bg-light-gray transition-colors"
            onClick={() => toggleExpand(job.id)}
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium text-dark-gray">{job.title}</h3>
                    {job.isNew && <Badge className="ml-2 bg-accent text-white">New</Badge>}
                  </div>
                </div>

                <button
                  onClick={(e) => toggleSaveJob(job.id, e)}
                  className="text-gray-400 hover:text-accent"
                  aria-label={savedJobs.includes(job.id) ? "Unsave job" : "Save job"}
                >
                  {savedJobs.includes(job.id) ? (
                    <BookmarkCheck className="h-5 w-5 text-accent" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-y-2 gap-x-3 text-xs text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-3.5 w-3.5 mr-1" />
                  {job.salary}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {job.type}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-light-gray text-xs">
                    {tag}
                  </Badge>
                ))}
                {job.tags.length > 3 && (
                  <Badge variant="outline" className="bg-light-gray text-xs">
                    +{job.tags.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500">Posted {job.posted}</div>
            </div>
          </div>

          {/* Expanded Job Details */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              expandedJob === job.id ? "max-h-96" : "max-h-0",
            )}
          >
            <div className="border-t border-gray-100 p-5 bg-light-gray">
              <div className="text-gray-700 mb-4">{job.description}</div>

              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="flex flex-wrap gap-1.5">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-white text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-initial"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSaveJob(job.id, e)
                    }}
                  >
                    {savedJobs.includes(job.id) ? "Saved" : "Save"}
                  </Button>
                  <Link href={`/jobs/${job.id}`} className="flex-1 sm:flex-initial">
                    <Button className="w-full bg-accent hover:bg-accent/90">View Job</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-8">
        <Button variant="outline">View All Jobs</Button>
      </div>
    </div>
  )
}
