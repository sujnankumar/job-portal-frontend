"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  FileText,
  Briefcase,
  Building,
  GraduationCap,
  Award,
} from "lucide-react"
import InterviewScheduler from "@/components/interview-scheduler"

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user?.role === "applicant") {
      router.push("/dashboard")
    } else if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, user, router])

  // In a real app, you would fetch the application details based on the id
  const application = {
    id: params.id,
    candidate: {
      id: "candidate-123", // Example ID, replace with actual data structure
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "(555) 123-4567",
      location: "San Francisco, CA",
      avatar: "/mystical-forest-spirit.png",
      website: "johnsmith.dev",
      github: "github.com/johnsmith",
    },
    job: {
      id: "job-789", // Example ID, replace with actual data structure
      title: "Senior Frontend Developer",
      location: "San Francisco, CA (Remote)",
      department: "Engineering",
      employmentType: "Full-time",
    },
    appliedDate: "2023-05-10",
    status: "review",
    resumeUrl: "#",
    coverLetter:
      "Dear Hiring Manager,\n\nI am writing to express my interest in the Senior Frontend Developer position at Tech Innovations Inc. With over 5 years of experience in frontend development using React, TypeScript, and modern JavaScript frameworks, I believe I would be a valuable addition to your team.\n\nThroughout my career, I have focused on building responsive, accessible, and performant web applications. In my current role at Digital Solutions, I have led the development of several key projects, resulting in a 40% improvement in performance metrics and a significant enhancement in user experience.\n\nI am particularly drawn to Tech Innovations Inc. because of your commitment to innovation and your focus on creating products that make a real difference. Your recent work on AI-powered accessibility tools aligns perfectly with my passion for creating inclusive web experiences.\n\nI am excited about the opportunity to bring my technical expertise and creative problem-solving skills to your team. I am confident that my experience with modern frontend technologies and my collaborative approach would make me a great fit for this role.\n\nThank you for considering my application. I look forward to the possibility of discussing how my background, skills, and experiences would benefit Tech Innovations Inc.\n\nSincerely,\nJohn Smith",
    matchScore: 92,
    skills: [
      { name: "React", level: "Expert" },
      { name: "TypeScript", level: "Expert" },
      { name: "JavaScript", level: "Expert" },
      { name: "HTML/CSS", level: "Expert" },
      { name: "Next.js", level: "Advanced" },
      { name: "Redux", level: "Advanced" },
      { name: "GraphQL", level: "Intermediate" },
      { name: "Node.js", level: "Intermediate" },
    ],
    experience: [
      {
        company: "Digital Solutions",
        title: "Senior Frontend Developer",
        location: "San Francisco, CA",
        startDate: "2021-03",
        endDate: "",
        current: true,
        description:
          "Lead frontend development for multiple projects using React, TypeScript, and Next.js. Implemented responsive designs and improved performance by 40%. Mentored junior developers and conducted code reviews.",
      },
      {
        company: "Web Innovations",
        title: "Frontend Developer",
        location: "San Francisco, CA",
        startDate: "2018-06",
        endDate: "2021-02",
        current: false,
        description:
          "Developed and maintained web applications using React and Redux. Collaborated with designers to implement UI/UX improvements. Participated in agile development processes.",
      },
    ],
    education: [
      {
        school: "University of California, Berkeley",
        degree: "Bachelor of Science",
        field: "Computer Science",
        startDate: "2014-09",
        endDate: "2018-05",
        current: false,
      },
    ],
  }

  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={application.candidate.avatar || "/placeholder.svg"}
                  width={64}
                  height={64}
                  alt={application.candidate.name}
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark-gray">{application.candidate.name}</h1>
                <p className="text-gray-500">Application for {application.job.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-amber-100 text-amber-800 font-normal">Under Review</Badge>
                  <span className="text-sm text-gray-500">
                    Applied on {new Date(application.appliedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" /> Download Resume
              </Button>
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                <CheckCircle className="h-4 w-4 mr-1" /> Accept
              </Button>
              <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="profile">
              <TabsList className="w-full border-b rounded-t-xl rounded-b-none p-0 bg-white">
                <TabsTrigger
                  value="profile"
                  className="flex-1 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none py-3"
                >
                  Candidate Profile
                </TabsTrigger>
                <TabsTrigger value="resume" className="flex-1 py-3">
                  Resume
                </TabsTrigger>
                <TabsTrigger value="coverLetter" className="flex-1 py-3">
                  Cover Letter
                </TabsTrigger>
                <TabsTrigger
                  value="interview"
                  className="flex-1 rounded-tr-xl rounded-tl-none rounded-bl-none rounded-br-none py-3"
                >
                  Schedule Interview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="bg-white rounded-b-xl shadow-sm p-6 border border-t-0">
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h2 className="text-lg font-medium text-dark-gray mb-3">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{application.candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{application.candidate.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{application.candidate.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <a href={application.candidate.website} className="text-accent hover:underline">
                          {application.candidate.website}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h2 className="text-lg font-medium text-dark-gray mb-3">Skills</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {application.skills.map((skill) => (
                        <div
                          key={skill.name}
                          className="flex justify-between items-center p-2 bg-light-gray rounded-md"
                        >
                          <span className="font-medium text-dark-gray">{skill.name}</span>
                          <Badge variant="outline" className="bg-white">
                            {skill.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <h2 className="text-lg font-medium text-dark-gray mb-3">Work Experience</h2>
                    <div className="space-y-4">
                      {application.experience.map((exp, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-4 ml-2 relative">
                          <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5" />
                          <div className="mb-1">
                            <h3 className="font-medium text-dark-gray">{exp.title}</h3>
                            <div className="flex items-center text-sm text-gray-500">
                              <Building className="h-3.5 w-3.5 mr-1" />
                              {exp.company}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              {exp.location}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              {new Date(exp.startDate).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                              })}{" "}
                              -
                              {exp.current
                                ? " Present"
                                : ` ${new Date(exp.endDate).toLocaleDateString(undefined, { year: "numeric", month: "short" })}`}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h2 className="text-lg font-medium text-dark-gray mb-3">Education</h2>
                    <div className="space-y-4">
                      {application.education.map((edu, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-4 ml-2 relative">
                          <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5" />
                          <div>
                            <h3 className="font-medium text-dark-gray">
                              {edu.degree} in {edu.field}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500">
                              <GraduationCap className="h-3.5 w-3.5 mr-1" />
                              {edu.school}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              {new Date(edu.startDate).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                              })}{" "}
                              -
                              {edu.current
                                ? " Present"
                                : ` ${new Date(edu.endDate).toLocaleDateString(undefined, { year: "numeric", month: "short" })}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="resume" className="bg-white rounded-b-xl shadow-sm p-6 border border-t-0">
                <div className="flex justify-center">
                  <div className="w-full max-w-2xl bg-light-gray p-8 rounded-lg">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-dark-gray">{application.candidate.name}</h2>
                      <p className="text-gray-600">{application.job.location}</p>
                      <div className="flex justify-center gap-3 mt-2 text-sm text-gray-500">
                        <span>{application.candidate.email}</span>
                        <span>•</span>
                        <span>{application.candidate.phone}</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-dark-gray border-b pb-1 mb-2">Summary</h3>
                      <p className="text-gray-700">
                        Experienced Frontend Developer with 5+ years of expertise in building responsive and accessible
                        web applications using React, TypeScript, and modern JavaScript frameworks. Passionate about
                        creating intuitive user interfaces and optimizing web performance.
                      </p>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-dark-gray border-b pb-1 mb-2">Experience</h3>
                      {application.experience.map((exp, index) => (
                        <div key={index} className="mb-4">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-dark-gray">{exp.title}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(exp.startDate).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                              })}{" "}
                              -
                              {exp.current
                                ? " Present"
                                : ` ${new Date(exp.endDate).toLocaleDateString(undefined, { year: "numeric", month: "short" })}`}
                            </span>
                          </div>
                          <p className="text-gray-600">
                            {exp.company}, {exp.location}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-dark-gray border-b pb-1 mb-2">Education</h3>
                      {application.education.map((edu, index) => (
                        <div key={index} className="mb-4">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-dark-gray">
                              {edu.degree} in {edu.field}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {new Date(edu.startDate).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                              })}{" "}
                              -
                              {edu.current
                                ? " Present"
                                : ` ${new Date(edu.endDate).toLocaleDateString(undefined, { year: "numeric", month: "short" })}`}
                            </span>
                          </div>
                          <p className="text-gray-600">{edu.school}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-dark-gray border-b pb-1 mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {application.skills.map((skill) => (
                          <Badge key={skill.name} variant="outline" className="bg-white">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="coverLetter" className="bg-white rounded-b-xl shadow-sm p-6 border border-t-0">
                <div className="bg-light-gray p-6 rounded-lg">
                  {/* TODO: Display cover letter content here */}
                  <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
                </div>
              </TabsContent>

              <TabsContent value="interview" className="bg-white rounded-b-xl shadow-sm p-6 border border-t-0">
                <InterviewScheduler
                  candidateName={application.candidate.name}
                  candidateId={application.candidate.id}
                  jobId={application.job.id}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-medium text-dark-gray mb-4">Job Details</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-dark-gray">{application.job.title}</h3>
                  <p className="text-sm text-gray-500">Tech Innovations Inc.</p>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {application.job.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {application.job.employmentType}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-1" />
                  {application.job.department} Department
                </div>
                <div className="pt-3 border-t">
                  <Link href={`/employer/dashboard/jobs/${application.job.title.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Job Posting
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Match Score */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-medium text-dark-gray mb-4">Candidate Match</h2>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-dark-gray">{application.matchScore}%</span>
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#eee"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f2c744"
                      strokeWidth="3"
                      strokeDasharray={`${application.matchScore}, 100`}
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  This candidate is a <span className="font-medium text-dark-gray">strong match</span> for the position
                  based on skills and experience.
                </p>
              </div>
            </div>

            {/* AI Resume Analysis */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-medium text-dark-gray">AI Resume Analysis</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-medium text-dark-gray">Key Strengths</h3>
                  <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                    <li>Strong experience with React and TypeScript</li>
                    <li>Proven track record of improving performance</li>
                    <li>Leadership experience mentoring junior developers</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-dark-gray">Potential Gaps</h3>
                  <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                    <li>Limited experience with GraphQL (Intermediate)</li>
                    <li>No mention of experience with testing frameworks</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-dark-gray">Recommendation</h3>
                  <p className="text-gray-600 mt-1">
                    This candidate shows strong potential for the role. Consider proceeding to the interview stage to
                    assess cultural fit and technical depth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
