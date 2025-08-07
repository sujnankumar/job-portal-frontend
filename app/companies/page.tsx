"use client"

import type { Metadata } from "next"
import { useState } from "react"
import CompanySearch from "@/components/company-search"
import CompanyListings from "@/components/company-listings"
import { Separator } from "@/components/ui/separator"

export interface SearchFilters {
  searchQuery: string
  industry: string
  location: string
}

export default function CompaniesPage() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchQuery: "",
    industry: "All Industries",
    location: ""
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-gray mb-2">Companies</h1>
        <p className="text-gray-600">
          Discover great places to work. Browse company profiles, reviews, and open positions.
        </p>
      </div>

      <CompanySearch 
        searchFilters={searchFilters}
        onSearchFiltersChange={setSearchFilters}
      />
      <Separator className="my-6" />
      <CompanyListings searchFilters={searchFilters} />
    </div>
  )
}
