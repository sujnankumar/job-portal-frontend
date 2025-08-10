"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Briefcase, Users, ExternalLink, Star, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import api from "@/lib/axios"

export interface SearchFilters {
  searchQuery: string
  industry: string
  location: string
}

interface Company {
  company_id: string
  company_name: string
  company_email?: string
  company_phone?: string
  description?: string
  founded_year?: string
  employee_count?: string
  location?: string
  industry?: string
  logo?: string
  created_at?: string
  average_rating?: number
  total_raters?: number
}

interface CompanyListingsProps {
  searchFilters: SearchFilters
}

export default function CompanyListings({ searchFilters }: CompanyListingsProps) {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await api.get("/company/all")
        let baseCompanies: Company[] = res.data
        // Fetch ratings for each company (N+1). For many companies consider backend aggregation.
        try {
          const ratingResults = await Promise.allSettled(
            baseCompanies.map(c => api.get(`/review/company/${c.company_id}`))
          )
          const withRatings = baseCompanies.map((c, idx) => {
            const r = ratingResults[idx]
            if (r.status === 'fulfilled') {
              const data = r.value.data || {}
              const total = Number(data.total_raters) || 0
              const avg = typeof data.average_rating === 'number' ? data.average_rating : Number(data.average_rating)
              if (total <= 0 || !avg || avg <= 0) {
                return { ...c, total_raters: 0 }
              }
              return { ...c, average_rating: avg, total_raters: total }
            }
            return c
          })
          baseCompanies = withRatings
        } catch (ratingErr) {
          console.warn('Failed to fetch some company ratings', ratingErr)
        }
        setAllCompanies(baseCompanies)
        setFilteredCompanies(baseCompanies)
      } catch (err: any) {
        setError("Failed to load companies. Please try again later.")
        console.error("Error fetching companies:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  // Filter companies based on search criteria
  useEffect(() => {
    let filtered = allCompanies

    // Search by company name
    if (searchFilters.searchQuery.trim()) {
      const q = searchFilters.searchQuery.toLowerCase()
      filtered = filtered.filter(c => c.company_name.toLowerCase().includes(q))
    }

    // Industry filter
    if (searchFilters.industry && searchFilters.industry !== "All Industries") {
      const ind = searchFilters.industry.toLowerCase()
      filtered = filtered.filter(c => c.industry?.toLowerCase() === ind)
    }

    // Location filter (substring match)
    if (searchFilters.location.trim()) {
      const loc = searchFilters.location.toLowerCase()
      filtered = filtered.filter(c => c.location?.toLowerCase().includes(loc))
    }

    setFilteredCompanies(filtered)
  }, [allCompanies, searchFilters])
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-red-500 text-center">
          <p className="text-lg font-medium mb-2">Error Loading Companies</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (filteredCompanies.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 mb-2">
            {allCompanies.length === 0 ? "No Companies Found" : "No companies match your search"}
          </p>
          <p className="text-sm text-gray-500">
            {allCompanies.length === 0 
              ? "There are no companies available at the moment."
              : "Try adjusting your search filters to find more companies."
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-dark-gray">Showing {filteredCompanies.length} companies</h2>

        <Tabs defaultValue="grid" className="w-auto" onValueChange={(v) => setView(v as "grid" | "list")}>
          <TabsList className="grid w-[180px] grid-cols-2">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div
        className={cn(
          "grid gap-6",
          view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1",
        )}
      >
        {filteredCompanies.map((company) => (
          <CompanyCard key={company.company_id} company={company} view={view} />
        ))}
      </div>
    </div>
  )
}

interface CompanyCardProps {
  company: Company
  view: "grid" | "list"
}

function CompanyCard({ company, view }: CompanyCardProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoLoading, setLogoLoading] = useState(false)

  useEffect(() => {
    const fetchCompanyLogo = async () => {
      if (!company.logo) {
        setLogoUrl(null)
        return
      }

      setLogoLoading(true)
      try {
        const res = await api.get(`/company/logo/${company.logo}`, {
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

    // Cleanup function
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl)
      }
    }
  }, [company.logo])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
      <div className={cn("p-4", view === "list" ? "flex items-start gap-4" : "")}>
        {/* Logo Section */}
        <div className={cn("flex justify-center", view === "list" && "flex-shrink-0")}>
          <div className="relative w-16 h-16 bg-light-gray rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
            {logoLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            ) : (
              <Image
                src={logoUrl || "/company_placeholder.jpeg"}
                alt={`${company.company_name} logo`}
                fill
                className="object-cover"
                sizes="64px"
              />
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className={cn("flex-1 min-w-0", view === "grid" && "mt-4")}>
          <div className={cn(
            "flex items-start justify-between mb-2",
            view === "grid" && "flex-col items-center"
          )}>
            <div className={cn(
              "flex-1 min-w-0",
              view === "grid" && "w-full"
            )}>
              <div className={cn(
                "flex items-center gap-2 mb-1",
                view === "grid" && "justify-center"
              )}>
                <h3 className={cn(
                  "font-semibold text-dark-gray truncate",
                  view === "grid" ? "text-lg text-center" : "text-lg"
                )}>
                  {company.company_name}
                </h3>
              </div>

              <div className={cn(
                "flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500",
                view === "grid" && "justify-center"
              )}>
                {company.location && (
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    <span className="truncate">{company.location}</span>
                  </div>
                )}
                {company.industry && (
                  <div className="flex items-center">
                    <Briefcase className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    <span className="capitalize">{company.industry}</span>
                  </div>
                )}
                {typeof company.average_rating === 'number' && company.average_rating > 0 && company.total_raters && company.total_raters > 0 && (
                  <div className="flex items-center" title={`Rating ${Number(company.average_rating).toFixed(2)} from ${company.total_raters} ratings`}>
                    <Star className="h-3.5 w-3.5 mr-1 text-yellow-500 fill-yellow-500" />
                    <span>{Number(company.average_rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Description removed per requirements */}

          <div className={cn(
            "flex flex-wrap gap-2 mb-4",
            view === "grid" && "justify-center"
          )}>
            {company.employee_count && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                <Users className="h-3 w-3 mr-1" />
                {company.employee_count}
              </Badge>
            )}
            {company.founded_year && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                Est. {company.founded_year}
              </Badge>
            )}
          </div>

          <div className={cn(
            "flex gap-2",
            view === "grid" ? "flex-col" : "flex-row"
          )}>
            <Button asChild variant="outline" size="sm" className={cn(
              view === "grid" ? "w-full" : "flex-1"
            )}>
              <Link href={`/companies/${company.company_id}`}>View Profile</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className={cn(
              view === "grid" ? "w-full" : "flex-1"
            )}>
              <Link href={`/jobs?search=${encodeURIComponent(company.company_name)}`}>See Jobs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
