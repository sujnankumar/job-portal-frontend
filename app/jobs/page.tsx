"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import JobFilters, { JobFiltersState } from "@/components/job-filters"
import JobListings from "@/components/job-listings"
import JobSearch from "@/components/job-search"
import { console } from "inspector"

export default function JobListingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // 1) Read initial values from URL
  const initialSearch   = searchParams.get("search")   ?? ""
  const initialLocation = searchParams.get("location") ?? ""
  const initialJobTypes = searchParams.getAll("jobType")
  
  // 2) Local state for inputs & filters
  const [search, setSearch]     = useState(initialSearch)
  const [location, setLocation] = useState(initialLocation)
  const [filters, setFilters]   = useState<JobFiltersState>({
    jobTypes: initialJobTypes,
    experienceLevels: [],
    salaryRange: [50, 150],
    location: initialLocation,
    industries: [],
    skills: [],
  })

  
  // 3) Keep input-fields in sync if the user hits back/forward
  useEffect(() => {
    const s = searchParams.get("search") ?? ""
    const l = searchParams.get("location") ?? ""
    setSearch(s)
    setLocation(l)
    setFilters(f => ({ ...f, location: l }))
  }, [searchParams])

  // 4) Whenever “Search” is clicked in the JobSearch component…
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search)   params.set("search", search)
    if (location) params.set("location", location)
    
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <div className="container mx-auto max-w-6xl py-10 px-4">
      <h1 className="text-3xl font-bold text-dark-gray mb-6">Browse Jobs</h1>

      {/* Pass down exactly the same props you already had */}
      <div className="mb-8">
        <JobSearch
          search={search}
          setSearch={setSearch}
          location={location}
          setLocation={setLocation}
          onSearch={handleSearch}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/4">
          <JobFilters filters={filters} setFilters={setFilters} />
        </div>
        <div className="w-full lg:w-3/4">
          <JobListings filters={{ ...filters, search, location }} />
        </div>
      </div>
    </div>
  )
}
