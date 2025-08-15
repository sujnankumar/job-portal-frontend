"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import JobFilters, { JobFiltersState } from "@/components/job-filters"
import JobListings from "@/components/job-listings"
import JobSearch from "@/components/job-search"
import { motion } from "framer-motion"

function ExpiredToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const knobTranslate = value ? 28 : 0
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="group inline-flex items-center gap-3 select-none"
      data-state={value ? 'on' : 'off'}
        aria-label={value ? 'showing expired jobs' : 'show expired jobs'}
    >
      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors hidden sm:inline">
          {value ? 'showing expired jobs' : 'show expired jobs'}
      </span>
      <div className="relative h-7 w-14 flex items-center">
        <div className={`absolute inset-0 rounded-full border transition-colors duration-300 ${value ? 'bg-accent/90 border-accent/70' : 'bg-gray-300 border-gray-300'} shadow-inner`} />
        <div className="relative h-full w-full flex items-center px-1">
          <motion.div
            initial={false}
            animate={{ x: knobTranslate }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="h-5 w-5 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-[11px] font-semibold text-accent"
          >
            {value && (
              <motion.span
                key="tick"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                ✓
              </motion.span>
            )}
          </motion.div>
        </div>
      </div>
    </button>
  )
}

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-dark-gray">Browse Jobs</h1>
        <ExpiredToggle value={showExpired} onChange={setShowExpired} />
      </div>

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
          {/* Top right controls removed; toggle moved next to heading */}
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
