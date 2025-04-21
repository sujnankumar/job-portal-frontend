"use client"

import type React from "react"

import { useState } from "react"
import { Search, MapPin, Briefcase } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  "All Locations",
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

export default function CompanySearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [industry, setIndustry] = useState("All Industries")
  const [location, setLocation] = useState("All Locations")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, this would trigger a search with the current filters
    console.log({ searchQuery, industry, location })
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
            <Select value={industry} onValueChange={setIndustry}>
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
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
