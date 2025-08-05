"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Info, Settings, Loader2 } from "lucide-react"
import api from "@/lib/axios"

interface EmployerDashboardHeaderProps {
  company: any
  jobTitle: string
}

export default function EmployerDashboardHeader({ company, jobTitle }: EmployerDashboardHeaderProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoLoading, setLogoLoading] = useState(false)

  // Fetch company logo
  useEffect(() => {
    const fetchCompanyLogo = async () => {
      if (!company?.company_id) {
        setLogoUrl(null)
        return
      }

      setLogoLoading(true)
      try {
        const res = await api.get(`/company/logo/company/${company.company_id}`, {
          responseType: "blob",
        })
        const url = URL.createObjectURL(res.data)
        setLogoUrl(url)
      } catch (error) {
        console.error("Failed to fetch company logo:", error)
        setLogoUrl(null)
      } finally {
        setLogoLoading(false)
      }
    }

    fetchCompanyLogo()

    // Cleanup function to revoke object URL
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl)
      }
    }
  }, [company?.company_id])

  // Cleanup logo URL when component unmounts
  useEffect(() => {
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl)
      }
    }
  }, [logoUrl])
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
            {logoLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <Image
                src={logoUrl || "/abstract-circuit-board.png"}
                width={64}
                height={64}
                alt="Company Logo"
                className="w-full h-full object-cover"
              />
            )}
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
          <Link href="/company">
            <Button className="bg-accent hover:bg-accent/90">
              <Info className="h-4 w-4 mr-1" /> Company Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
