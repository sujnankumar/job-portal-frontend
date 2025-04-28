"use client"

import { useState } from "react"
import JobFilters, { JobFiltersState } from "@/components/job-filters"
import JobListings from "@/components/job-listings"
import JobSearch from "@/components/job-search"

export default function JobListingsPage() {
  const [filters, setFilters] = useState<JobFiltersState>({
    jobTypes: [],
    experienceLevels: [],
    salaryRange: [50, 150],
    location: "",
    industries: [],
    skills: [],
  })
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("")
  const handleSearch = () => {
    // Implement search logic here
  }
  return (
    <div className="container mx-auto max-w-6xl py-10 px-4">
      <h1 className="text-3xl font-bold text-dark-gray mb-6">Browse Jobs</h1>
      <div className="mb-8">
        <JobSearch search={search} setSearch={setSearch} location={location} setLocation={setLocation} onSearch={handleSearch} />
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/4">
          <JobFilters filters={filters} setFilters={setFilters} />
        </div>
        <div className="w-full lg:w-3/4">
          <JobListings filters={{...filters, search, location}} />
        </div>
      </div>
    </div>
  )
}
