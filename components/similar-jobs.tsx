import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const similarJobs = [
  {
    id: "101",
    title: "Frontend Developer",
    company: "Digital Creations",
    location: "San Francisco, CA",
  },
  {
    id: "102",
    title: "Senior React Developer",
    company: "Web Solutions",
    location: "Remote",
  },
  {
    id: "103",
    title: "Full Stack Engineer",
    company: "TechStart",
    location: "New York, NY",
  },
]

export default function SimilarJobs() {
  return (
    <div className="space-y-3">
      {similarJobs.map((job) => (
        <Link
          key={job.id}
          href={`/jobs/${job.id}`}
          className="block p-3 border border-gray-100 rounded-md hover:bg-light-gray transition-colors"
        >
          <h4 className="font-medium text-dark-gray">{job.title}</h4>
          <p className="text-sm text-gray-500">{job.company}</p>
          <p className="text-xs text-gray-500 mt-1">{job.location}</p>
        </Link>
      ))}
      <div className="pt-2">
        <Link href="/jobs?similar=frontend">
          <Button variant="ghost" size="sm" className="w-full text-accent">
            View all similar jobs <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
