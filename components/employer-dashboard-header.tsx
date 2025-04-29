import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, Settings } from "lucide-react"

interface EmployerDashboardHeaderProps {
  company: any
  jobTitle: string
}

export default function EmployerDashboardHeader({ company, jobTitle }: EmployerDashboardHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
            <Image
              src="/abstract-circuit-board.png"
              width={64}
              height={64}
              alt="Company Logo"
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dark-gray">{company?.company_name || "Company"}</h1>
            <p className="text-gray-500">{jobTitle}</p>
            {/* You can access more company fields here, e.g. */}
            {/* <p className="text-gray-400 text-sm">{company?.industry}</p> */}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/employer/dashboard/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-1" /> Settings
            </Button>
          </Link>
          <Link href="/employer/dashboard/post-job">
            <Button className="bg-accent hover:bg-accent/90">
              <PlusCircle className="h-4 w-4 mr-1" /> Post a New Job
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
