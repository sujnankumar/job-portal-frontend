"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, DollarSign, Clock, Briefcase, Building, Calendar, Share2, Bookmark, BookmarkCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import MapEmbed from "@/components/map-embed"

// Mock job data
const job = {
  id: "1",
  title: "Senior Frontend Developer",
  company: "Tech Innovations Inc.",
  companyId: "1",
  location: "San Francisco, CA (Remote)",
  salary: "$120,000 - $160,000/year",
  type: "Full-time",
  experience: "5+ years",
  education: "Bachelor's degree in Computer Science or related field",
  logo: "/abstract-circuit-board.png",
  posted: "2 days ago",
  deadline: "August 15, 2023",
  tags: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux", "GraphQL"],
  description: `
    <p>Tech Innovations Inc. is looking for a Senior Frontend Developer to join our growing team. You'll be responsible for building and maintaining user interfaces for our web applications, working closely with designers, backend developers, and product managers to deliver exceptional user experiences.</p>
    
    <h3>Responsibilities:</h3>
    <ul>
      <li>Develop and maintain responsive web applications using React, TypeScript, and Next.js</li>
      <li>Collaborate with designers to implement UI/UX designs with pixel-perfect accuracy</li>
      <li>Write clean, maintainable, and well-documented code</li>
      <li>Optimize applications for maximum speed and scalability</li>
      <li>Participate in code reviews and contribute to technical discussions</li>
      <li>Mentor junior developers and share knowledge with the team</li>
      <li>Stay up-to-date with emerging trends and technologies in frontend development</li>
    </ul>
    
    <h3>Requirements:</h3>
    <ul>
      <li>5+ years of experience in frontend development</li>
      <li>Strong proficiency in React, TypeScript, and modern JavaScript</li>
      <li>Experience with Next.js, Tailwind CSS, and state management libraries (Redux, Zustand, etc.)</li>
      <li>Solid understanding of responsive design principles and cross-browser compatibility</li>
      <li>Familiarity with RESTful APIs and GraphQL</li>
      <li>Experience with version control systems (Git)</li>
      <li>Strong problem-solving skills and attention to detail</li>
      <li>Excellent communication and collaboration skills</li>
      <li>Bachelor's degree in Computer Science or related field (or equivalent experience)</li>
    </ul>
    
    <h3>Benefits:</h3>
    <ul>
      <li>Competitive salary and equity package</li>
      <li>Comprehensive health, dental, and vision insurance</li>
      <li>401(k) matching</li>
      <li>Flexible work arrangements (remote with occasional on-site meetings)</li>
      <li>Professional development budget</li>
      <li>Generous paid time off</li>
      <li>Home office stipend</li>
      <li>Regular team events and retreats</li>
    </ul>
    
    <p>Tech Innovations Inc. is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees. We do not discriminate on the basis of race, color, religion, gender, sexual orientation, national origin, disability, age, or veteran status.</p>
  `,
  companyDescription:
    "Tech Innovations Inc. is a leading technology company focused on developing cutting-edge software solutions for businesses of all sizes. Founded in 2010, we've grown from a small startup to a global enterprise with offices in major tech hubs around the world.",
  benefits: [
    "Competitive salary and equity",
    "Health, dental, and vision insurance",
    "401(k) matching",
    "Flexible work arrangements",
    "Professional development budget",
    "Generous paid time off",
  ],
  skills: [
    "React",
    "TypeScript",
    "Next.js",
    "Tailwind CSS",
    "Redux",
    "GraphQL",
    "Responsive Design",
    "Performance Optimization",
    "Cross-browser Compatibility",
    "Git",
  ],
}

export default function JobDetail({ jobId }: { jobId: string }) {
  const [isSaved, setIsSaved] = useState(false)

  const toggleSave = () => {
    setIsSaved(!isSaved)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Job Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
            <Image
              src={job.logo || "/placeholder.svg"}
              alt={`${job.company} logo`}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-dark-gray mb-1">{job.title}</h1>

            <Link href={`/companies/${job.companyId}`} className="text-accent hover:underline">
              {job.company}
            </Link>

            <div className="mt-3 flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                {job.salary}
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                {job.type}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Posted {job.posted}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link href={`/apply/${jobId}`}>
            <Button className="bg-accent hover:bg-accent/90">Apply Now</Button>
          </Link>

          <Button variant="outline" onClick={toggleSave}>
            {isSaved ? (
              <>
                <BookmarkCheck className="h-4 w-4 mr-2 text-accent" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4 mr-2" />
                Save Job
              </>
            )}
          </Button>

          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Job Content */}
      <Tabs defaultValue="description" className="p-6">
        <TabsList className="mb-6">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-6">
          <div className="space-y-4">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.description }} />

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-dark-gray mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="bg-light-gray">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-dark-gray mb-3">Job Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-dark-gray">Job Type</div>
                    <div className="text-gray-600">{job.type}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Building className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-dark-gray">Experience</div>
                    <div className="text-gray-600">{job.experience}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-dark-gray">Application Deadline</div>
                    <div className="text-gray-600">{job.deadline}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-dark-gray">Location</div>
                    <div className="text-gray-600">{job.location}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">
                Job ID: {jobId} • Posted {job.posted}
              </p>
            </div>

            <Link href={`/report-job/${jobId}`}>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                Report Job
              </Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
              <Image
                src={job.logo || "/placeholder.svg"}
                alt={`${job.company} logo`}
                width={64}
                height={64}
                className="object-contain"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-dark-gray mb-1">{job.company}</h3>
              <Link href={`/companies/${job.companyId}`} className="text-accent hover:underline text-sm">
                View Company Profile
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700">{job.companyDescription}</p>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-dark-gray mb-3">Benefits & Perks</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent mr-2"></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link href={`/companies/${job.companyId}`}>
              <Button variant="outline">View All Jobs</Button>
            </Link>

            <Button variant="outline">Follow Company</Button>
          </div>
        </TabsContent>

        <TabsContent value="location">
          <div className="space-y-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium text-dark-gray">Job Location</div>
                <div className="text-gray-600">{job.location}</div>
              </div>
            </div>

            <div className="h-80 w-full rounded-lg overflow-hidden border border-gray-200 mt-4">
              <MapEmbed location={job.location} />
            </div>

            <div className="mt-4">
              <p className="text-gray-700">
                This position is{" "}
                {job.location.includes("Remote")
                  ? "remote with occasional visits to our office"
                  : "based in our office at"}{" "}
                {job.location.replace(" (Remote)", "")}.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
