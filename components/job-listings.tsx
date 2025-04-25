"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, DollarSign, Clock, Bookmark, BookmarkCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const jobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "Tech Innovations Inc.",
    location: "San Francisco, CA (Remote)",
    salary: "$120,000 - $160,000/year",
    type: "Full-time",
    logo: "/abstract-circuit-board.png",
    posted: "2 days ago",
    tags: ["React", "TypeScript", "Next.js"],
    description:
      "We're looking for a Senior Frontend Developer to join our team. You'll be responsible for building and maintaining user interfaces for our web applications. The ideal candidate has strong experience with React, TypeScript, and modern frontend development practices.",
    isNew: true,
  },
  {
    id: "2",
    title: "Product Manager",
    company: "Growth Ventures",
    location: "New York, NY",
    salary: "$110,000 - $140,000/year",
    type: "Full-time",
    logo: "/upward-sprout.png",
    posted: "3 days ago",
    tags: ["Product Strategy", "Agile", "User Research"],
    description:
      "As a Product Manager, you will work closely with engineering, design, and business teams to define, build, and launch innovative products. You'll gather user requirements, define product vision, and prioritize features for development.",
    isNew: true,
  },
  {
    id: "3",
    title: "UX/UI Designer",
    company: "Creative Solutions",
    location: "Austin, TX (Hybrid)",
    salary: "$90,000 - $120,000/year",
    type: "Full-time",
    logo: "/abstract-geometric-logo.png",
    posted: "1 day ago",
    tags: ["Figma", "UI Design", "User Testing"],
    description:
      "We're looking for a talented UX/UI Designer to join our team. You'll be responsible for creating intuitive and engaging user experiences across our digital products. The ideal candidate has experience with design systems, user research, and creating high-fidelity prototypes.",
    isNew: true,
  },
  {
    id: "4",
    title: "Data Scientist",
    company: "DataWorks Analytics",
    location: "Remote",
    salary: "$130,000 - $180,000/year",
    type: "Full-time",
    logo: "/abstract-data-flow.png",
    posted: "5 days ago",
    tags: ["Python", "Machine Learning", "SQL"],
    description:
      "As a Data Scientist, you will develop machine learning models to solve complex business problems. You'll work with large datasets, perform exploratory data analysis, and communicate findings to stakeholders.",
    isNew: false,
  },
  {
    id: "5",
    title: "DevOps Engineer",
    company: "Cloud Systems",
    location: "Seattle, WA",
    salary: "$125,000 - $165,000/year",
    type: "Full-time",
    logo: "/abstract-cloud-network.png",
    posted: "6 days ago",
    tags: ["AWS", "Kubernetes", "CI/CD"],
    description:
      "We're seeking a DevOps Engineer to help us build and maintain our cloud infrastructure. You'll be responsible for automation, continuous integration, deployment, and monitoring of our systems and applications.",
    isNew: false,
  },
  {
    id: "6",
    title: "Marketing Specialist",
    company: "Brand Builders",
    location: "Chicago, IL (Remote)",
    salary: "$75,000 - $95,000/year",
    type: "Full-time",
    logo: "/abstract-geometric-logo.png",
    posted: "1 week ago",
    tags: ["Digital Marketing", "SEO", "Content Strategy"],
    description:
      "As a Marketing Specialist, you will develop and implement marketing strategies to promote our products and services. You'll create content, manage social media campaigns, and analyze marketing metrics to improve performance.",
    isNew: false,
  },
  {
    id: "7",
    title: "Backend Developer",
    company: "Software Solutions",
    location: "Boston, MA",
    salary: "$115,000 - $150,000/year",
    type: "Full-time",
    logo: "/abstract-software-logo.png",
    posted: "1 week ago",
    tags: ["Node.js", "MongoDB", "API Design"],
    description:
      "We're looking for a Backend Developer to design and implement server-side applications. You'll work on API development, database design, and system integration. Strong knowledge of Node.js and MongoDB is required.",
    isNew: false,
  },
  {
    id: "8",
    title: "Project Manager",
    company: "Innovative Projects",
    location: "Denver, CO (Hybrid)",
    salary: "$95,000 - $125,000/year",
    type: "Full-time",
    logo: "/placeholder.svg?height=64&width=64&query=project logo",
    posted: "2 weeks ago",
    tags: ["Project Management", "Agile", "Stakeholder Management"],
    description:
      "As a Project Manager, you'll lead cross-functional teams to deliver projects on time and within budget. You'll be responsible for planning, execution, tracking, and reporting of project activities.",
    isNew: false,
  },
  // Add advertisement after 6 jobs
  {
    id: "ad-1",
    isAd: true,
    adTitle: "Boost Your Career",
    adDescription: "Get certified in the latest technologies.",
    adImage: "/placeholder.svg?height=150&width=600&query=career education banner",
    adUrl: "/courses",
  },
]

export default function JobListings() {
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
      {jobs.map((job, index) => (
        <div key={job.id} className="relative">
          {/* Advertisement */}
          {job.isAd ? (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
              <div className="text-xs text-gray-500 mb-2">Advertisement</div>
              <a href={job.adUrl} className="block">
                <div className="text-lg font-medium text-dark-gray mb-1">{job.adTitle}</div>
                <p className="text-sm text-gray-600 mb-3">{job.adDescription}</p>
                <Image
                  src={job.adImage || "/placeholder.svg"}
                  width={600}
                  height={150}
                  alt="Advertisement"
                  className="w-full h-auto rounded-md"
                />
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Job Card Header */}
              <div
                className="p-5 cursor-pointer hover:bg-light-gray transition-colors"
                onClick={() => toggleExpand(job.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                    <Image
                      src={job.logo || "/placeholder.svg"}
                      width={48}
                      height={48}
                      alt={`${job.company} logo`}
                      className="object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium text-dark-gray">{job.title}</h3>
                          {job.isNew && <Badge className="ml-2 bg-accent text-white">New</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">{job.company}</p>
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
          )}
        </div>
      ))}
    </div>
  )
}
