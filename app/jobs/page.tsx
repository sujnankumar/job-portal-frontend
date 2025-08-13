"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import JobFilters, { JobFiltersState } from "@/components/job-filters"
import JobListings from "@/components/job-listings"
import JobSearch from "@/components/job-search"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { console } from "inspector"

export default function JobListingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // 1) Read initial values from URL
  const initialSearch   = searchParams.get("search")   ?? ""
  const initialLocation = searchParams.get("location") ?? ""
  const initialJobTypes = searchParams.getAll("jobType")
  const initialIndustry = searchParams.get("industry")
  const initialBoolean = searchParams.get("boolean") || ""
  
  // 2) Local state for inputs & filters
  const [search, setSearch]     = useState(initialSearch)
  const [location, setLocation] = useState(initialLocation)
  const [filters, setFilters]   = useState<JobFiltersState>({
    jobTypes: initialJobTypes,
    experienceLevels: [],
  // salaryRange expressed in LPA (Lakhs Per Annum) 0-20
  salaryRange: [0, 20],
    location: initialLocation,
  industries: initialIndustry ? [initialIndustry] : [],
    skills: [],
    booleanQuery: initialBoolean,
  })
  const initialShowExpired = searchParams.get("showExpired") === "1"
  const [showExpired, setShowExpired] = useState(initialShowExpired)

  
  // 3) Keep input-fields in sync if the user hits back/forward
  useEffect(() => {
    const s = searchParams.get("search") ?? ""
    const l = searchParams.get("location") ?? ""
    setSearch(s)
    setLocation(l)
    setFilters(f => ({ ...f, location: l }))
  }, [searchParams])

  // 4) Whenever “Search” is clicked in the JobSearch component…
  const pushParams = (overrides: Record<string, any> = {}) => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (location) params.set("location", location)
  if (showExpired) params.set("showExpired", "1")
  // Persist first selected industry (could extend to multiple later)
  if (filters.industries.length > 0) params.set('industry', filters.industries[0])
  if (filters.booleanQuery && filters.booleanQuery.trim()) params.set('boolean', filters.booleanQuery.trim())
  // pagination now internal to JobListings; omit page & pageSize from URL
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return
      params.set(k, String(v))
    })
    router.push(`/jobs?${params.toString()}`)
  }
  const handleSearch = () => {
    // reset to page 1 when searching
  pushParams()
  }

  // Sync URL when key pagination state changes
  useEffect(() => {
    pushParams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExpired])

  // Sync industry selection to URL when it changes (first selected only for now)
  useEffect(() => {
    pushParams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.industries])

  // Keep industries in sync with URL (handles client-side nav between categories)
  useEffect(() => {
    const ind = searchParams.get('industry')
    setFilters(prev => {
      if (ind && (prev.industries.length === 0 || prev.industries[0] !== ind)) {
        return { ...prev, industries: [ind] }
      }
      if (!ind && prev.industries.length > 0) {
        return { ...prev, industries: [] }
      }
      return prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

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
        <div className="w-full lg:w-3/4 space-y-4">
          <div className="flex items-center gap-4 justify-end pr-1 flex-wrap">
            <div className="flex items-center gap-2">
              <Switch id="show-expired" checked={showExpired} onCheckedChange={(v) => { setShowExpired(v); }} />
            <Label htmlFor="show-expired" className="text-sm text-gray-600 cursor-pointer">
              Show expired jobs
            </Label>
            </div>
            {/* Per-page selector removed: handled inside JobListings bottom controls */}
          </div>
          <JobListings
            filters={{ ...filters, search, location }}
            showExpired={showExpired}
            // key props to force internal pagination reset when external changes
          />
        </div>
      </div>
    </div>
  )
}
