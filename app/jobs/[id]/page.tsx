import type { Metadata } from "next"
import JobDetail from "@/components/job-detail"
import SimilarJobs from "@/components/similar-jobs"
import JobChat from "@/components/job-chat"

export const metadata: Metadata = {
  title: "Job Detail | JobPortal",
  description: "View job details and apply",
}

// Mock job data
const job = {
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
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <JobDetail jobId={params.id} />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Similar Jobs</h2>
          <SimilarJobs jobId={params.id} />
        </div>
      </div>

      <JobChat jobId={params.id} companyName={job.company} companyLogo={job.logo} jobTitle={job.title} />
    </>
  )
}
