"use client"

import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MapPin, Building, DollarSign, Clock, Calendar, Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SimilarJobs from "@/components/similar-jobs"
import { useState } from "react"

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    router.push(`/apply/${params.id}`)
  }

  const toggleSaveJob = () => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    setIsSaved(!isSaved)
  }

  // Note: In a real app, you would fetch the job details based on the id

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-16 h-16 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                <Image
                  src="/abstract-geometric-logo.png"
                  width={64}
                  height={64}
                  alt="Company Logo"
                  className="object-contain"
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h1 className="text-2xl font-bold text-dark-gray">Senior Frontend Developer</h1>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={toggleSaveJob}>
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 mr-1 text-accent" /> Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4 mr-1" /> Save
                        </>
                      )}
                    </Button>
                    <Button className="bg-accent hover:bg-accent/90" size="sm" onClick={handleApplyClick}>
                      Apply Now
                    </Button>
                  </div>
                </div>

                <div className="mt-2">
                  <h2 className="text-lg font-medium text-dark-gray">Tech Innovations Inc.</h2>
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    San Francisco, CA (Remote)
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    $120,000 - $160,000/year
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    Full-time
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    Posted 3 days ago
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Content */}
          <Tabs defaultValue="details" className="bg-white rounded-xl shadow-md">
            <TabsList className="border-b w-full rounded-t-xl rounded-b-none p-0">
              <TabsTrigger
                value="details"
                className="flex-1 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none py-3"
              >
                Job Details
              </TabsTrigger>
              <TabsTrigger value="company" className="flex-1 rounded-none py-3">
                Company
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="flex-1 rounded-tr-xl rounded-tl-none rounded-bl-none rounded-br-none py-3"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-dark-gray mb-3">Job Description</h3>
                <p className="text-gray-700">
                  We're looking for a Senior Frontend Developer to join our team. You'll be responsible for building and
                  maintaining user interfaces for our web applications. The ideal candidate has strong experience with
                  React, TypeScript, and modern frontend development practices.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-gray mb-3">Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Develop and maintain complex frontend features using React and TypeScript</li>
                  <li>Work closely with designers, product managers, and backend developers</li>
                  <li>Write clean, maintainable, and testable code</li>
                  <li>Participate in code reviews and mentor junior developers</li>
                  <li>Contribute to architectural decisions and technical planning</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-gray mb-3">Requirements</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>5+ years of experience in frontend development</li>
                  <li>Strong knowledge of React, TypeScript, and modern JavaScript</li>
                  <li>Experience with state management libraries like Redux or Context API</li>
                  <li>Familiarity with modern build tools like Webpack, Vite, or Next.js</li>
                  <li>Understanding of web accessibility standards</li>
                  <li>Bachelor's degree in Computer Science or related field (or equivalent experience)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-gray mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-light-gray">
                    React
                  </Badge>
                  <Badge variant="outline" className="bg-light-gray">
                    TypeScript
                  </Badge>
                  <Badge variant="outline" className="bg-light-gray">
                    JavaScript
                  </Badge>
                  <Badge variant="outline" className="bg-light-gray">
                    HTML/CSS
                  </Badge>
                  <Badge variant="outline" className="bg-light-gray">
                    Redux
                  </Badge>
                  <Badge variant="outline" className="bg-light-gray">
                    Next.js
                  </Badge>
                  <Badge variant="outline" className="bg-light-gray">
                    Git
                  </Badge>
                  <Badge variant="outline" className="bg-light-gray">
                    UI/UX
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-gray mb-3">Benefits</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Competitive salary and equity</li>
                  <li>Medical, dental, and vision insurance</li>
                  <li>401(k) matching</li>
                  <li>Remote work flexibility</li>
                  <li>Unlimited PTO</li>
                  <li>Professional development budget</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full bg-accent hover:bg-accent/90" onClick={handleApplyClick}>
                  Apply Now
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="company" className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                  <Image
                    src="/abstract-geometric-logo.png"
                    width={80}
                    height={80}
                    alt="Company Logo"
                    className="object-contain"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-dark-gray">Tech Innovations Inc.</h3>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Building className="h-4 w-4 mr-1" />
                    Technology • 500-1000 employees
                  </p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    San Francisco, CA (Headquarters)
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm">
                      Follow Company
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-gray mb-3">About</h3>
                <p className="text-gray-700">
                  Tech Innovations Inc. is a leading technology company specializing in artificial intelligence and
                  machine learning solutions. Founded in 2012, we've been at the forefront of developing cutting-edge
                  technology that helps businesses automate processes and gain insights from their data.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-gray mb-3">Culture & Values</h3>
                <p className="text-gray-700 mb-3">
                  We believe in fostering a collaborative and inclusive environment where innovation thrives. Our core
                  values include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Innovation and creativity</li>
                  <li>Collaboration and teamwork</li>
                  <li>Continuous learning</li>
                  <li>Customer-focused solutions</li>
                  <li>Work-life balance</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="p-6">
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold text-dark-gray mb-2">Company Reviews</h3>
                <p className="text-gray-600 mb-4">
                  See what current and former employees have to say about working at Tech Innovations Inc.
                </p>
                <Button variant="outline" onClick={() => !isAuthenticated && router.push("/auth/login")}>
                  {isAuthenticated ? "Write a Review" : "Sign in to view reviews"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Card */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-dark-gray mb-4">About the company</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                <Image
                  src="/abstract-geometric-logo.png"
                  width={48}
                  height={48}
                  alt="Company Logo"
                  className="object-contain"
                />
              </div>
              <div>
                <h4 className="font-medium text-dark-gray">Tech Innovations Inc.</h4>
                <p className="text-sm text-gray-600">Technology</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Company size</span>
                <span className="text-dark-gray">500-1000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Founded</span>
                <span className="text-dark-gray">2012</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type</span>
                <span className="text-dark-gray">Private</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full">
                View company profile
              </Button>
            </div>
          </div>

          {/* Job Location Map */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-dark-gray mb-4">Job Location</h3>
            <div className="aspect-[4/3] bg-light-gray rounded-md overflow-hidden mb-3">
              <Image
                src="/san-francisco-street-grid.png"
                width={320}
                height={240}
                alt="Job Location Map"
                className="object-cover w-full h-full"
              />
            </div>
            <p className="text-dark-gray font-medium">San Francisco, CA</p>
            <p className="text-sm text-gray-600">Remote work available</p>
          </div>

          {/* Similar Jobs */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-dark-gray mb-4">Similar Jobs</h3>
            <SimilarJobs />
          </div>
        </div>
      </div>
    </div>
  )
}
