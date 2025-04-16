import { CalendarCheck, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const walkInJobs = [
  {
    id: "1",
    company: "Tech Solutions Inc.",
    position: "Software Developer",
    location: "New York, NY",
    date: "May 25, 2023",
    time: "10:00 AM - 4:00 PM",
    slots: "Limited spots",
  },
  {
    id: "2",
    company: "Global Finance",
    position: "Financial Analyst",
    location: "Chicago, IL",
    date: "May 27, 2023",
    time: "9:00 AM - 2:00 PM",
    slots: "Open registration",
  },
  {
    id: "3",
    company: "Creative Media Agency",
    position: "Graphic Designer",
    location: "Los Angeles, CA",
    date: "May 30, 2023",
    time: "11:00 AM - 5:00 PM",
    slots: "Few spots left",
  },
]

export default function WalkInJobs() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-dark-gray">Upcoming Walk-in Interviews</h3>
          </div>
          <Link href="/walk-in-jobs">
            <Button variant="ghost" size="sm" className="text-accent">
              View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {walkInJobs.map((job) => (
          <div key={job.id} className="p-4 hover:bg-light-gray transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-medium text-dark-gray">{job.position}</h4>
                <p className="text-sm text-gray-500">{job.company}</p>
                <div className="mt-1 flex items-center text-xs text-gray-600">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {job.location}
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-sm font-medium text-dark-gray">{job.date}</div>
                <div className="text-xs text-gray-500">{job.time}</div>
                <Badge className="mt-1 bg-accent text-white">{job.slots}</Badge>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <Link href={`/walk-in/${job.id}`}>
                <Button size="sm" variant="outline">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
