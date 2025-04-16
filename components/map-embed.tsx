"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface MapEmbedProps {
  address?: string
  height?: number
  width?: string
  zoom?: number
  showSearch?: boolean
}

export default function MapEmbed({
  address = "San Francisco, CA",
  height = 400,
  width = "100%",
  zoom = 13,
  showSearch = true,
}: MapEmbedProps) {
  const [searchAddress, setSearchAddress] = useState(address)
  const [currentAddress, setCurrentAddress] = useState(address)
  const [isLoading, setIsLoading] = useState(false)

  // Mock function to simulate geocoding
  const handleSearch = () => {
    setIsLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      setCurrentAddress(searchAddress)
      setIsLoading(false)
    }, 1000)
  }

  // Handle enter key press in search input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Generate a static map URL (in a real app, you would use Google Maps or Mapbox API)
  const getMapUrl = () => {
    // For this mock, we're using a placeholder image
    // In a real app, you would use something like:
    // `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(currentAddress)}&zoom=${zoom}&size=600x400&key=YOUR_API_KEY`
    return `/san-francisco-street-grid.png`
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {showSearch && (
        <div className="p-3 bg-white border-b">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search for a location"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading} className="bg-accent hover:bg-accent/90">
              {isLoading ? "Searching..." : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      <div className="relative" style={{ height, width }}>
        {/* Static map image */}
        <div className="absolute inset-0 bg-light-gray">
          <img
            src={getMapUrl() || "/placeholder.svg"}
            alt={`Map of ${currentAddress}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Map pin */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <MapPin className="h-8 w-8 text-accent" />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-accent rounded-full" />
          </div>
        </div>

        {/* Location label */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md text-sm font-medium">
          {currentAddress}
        </div>

        {/* Attribution (required for most map services) */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-600 bg-white/80 px-1 rounded">Map data © 2023</div>
      </div>
    </div>
  )
}
