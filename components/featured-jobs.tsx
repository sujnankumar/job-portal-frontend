import Image from "next/image"
import Link from "next/link"
import { MapPin, DollarSign, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const featuredJobs = [
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
  },
]

export default function FeaturedJobs() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {featuredJobs.map((job) => (
        <Link
          href={`/jobs/${job.id}`}
          key={job.id}
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="flex items-start gap-3">
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
              <h3 className="font-medium text-dark-gray truncate line-clamp-1">{job.title}</h3>
              <p className="text-sm text-gray-500 truncate line-clamp-1">{job.company}</p>

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
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-light-gray text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="mt-3 text-xs text-gray-500">Posted {job.posted}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
