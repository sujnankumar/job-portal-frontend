"use client"

import type React from "react"

import { Search, MapPin, Briefcase } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface SearchFilters {
  searchQuery: string
  industry: string
  location: string
}

interface CompanySearchProps {
  searchFilters: SearchFilters
  onSearchFiltersChange: (filters: SearchFilters) => void
}

const industries = [
  "All Industries",
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Media",
  "Hospitality",
  "Construction",
]

const locations = [
  "Remote",
  "San Francisco, CA",
  "New York, NY",
  "Austin, TX",
  "Seattle, WA",
  "Chicago, IL",
  "Boston, MA",
  "Los Angeles, CA",
  "Denver, CO",
]

export default function CompanySearch({ searchFilters, onSearchFiltersChange }: CompanySearchProps) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search filters are already updated in real-time, so just prevent form submission
  }

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onSearchFiltersChange({ ...searchFilters, ...updates })
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-dark-gray mb-4">Find Companies</h2>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Company name"
              className="pl-10"
              value={searchFilters.searchQuery}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            />
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
            <Select value={searchFilters.industry} onValueChange={(value) => updateFilters({ industry: value })}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Location (e.g., Remote, New York, CA)"
              className="pl-10"
              value={searchFilters.location}
              onChange={(e) => updateFilters({ location: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-accent hover:bg-accent/90">
            Search Companies
          </Button>
        </div>
      </form>
    </div>
  )
}
