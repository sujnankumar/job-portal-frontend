"use client"

import { useAuthStore } from "@/store/authStore"
import JobListings from "@/components/job-listings"
import JobFilters from "@/components/job-filters"
import JobSearch from "@/components/job-search"

export default function JobListingsPage() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <div className="container mx-auto max-w-6xl py-10 px-4">
      <h1 className="text-3xl font-bold text-dark-gray mb-6">Browse Jobs</h1>

      {/* Search Bar */}
      <div className="mb-8">
        <JobSearch />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-1/4">
          <JobFilters />
        </div>

        {/* Job Listings */}
        <div className="w-full lg:w-3/4">
          <JobListings />
        </div>
      </div>
    </div>
  )
}
