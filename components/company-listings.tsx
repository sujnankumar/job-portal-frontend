"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Briefcase, Users, ExternalLink, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Mock data for companies
const companies = [
  {
    id: "1",
    name: "Tech Innovations Inc.",
    logo: "/abstract-circuit-board.png",
    description: "A leading technology company focused on innovative solutions for businesses and consumers.",
    industry: "Technology",
    location: "San Francisco, CA",
    size: "1000-5000 employees",
    founded: 2010,
    website: "https://example.com",
    openPositions: 12,
    rating: 4.5,
    featured: true,
  },
  {
    id: "2",
    name: "Growth Ventures",
    logo: "/upward-sprout.png",
    description: "A venture capital firm investing in early-stage startups with high growth potential.",
    industry: "Finance",
    location: "New York, NY",
    size: "50-200 employees",
    founded: 2015,
    website: "https://example.com",
    openPositions: 5,
    rating: 4.2,
    featured: true,
  },
  {
    id: "3",
    name: "Creative Solutions",
    logo: "/abstract-geometric-logo.png",
    description: "A creative agency specializing in branding, design, and digital marketing.",
    industry: "Media",
    location: "Austin, TX",
    size: "200-500 employees",
    founded: 2008,
    website: "https://example.com",
    openPositions: 8,
    rating: 4.0,
    featured: false,
  },
  {
    id: "4",
    name: "DataWorks Analytics",
    logo: "/abstract-data-flow.png",
    description: "A data analytics company helping businesses make data-driven decisions.",
    industry: "Technology",
    location: "Remote",
    size: "500-1000 employees",
    founded: 2012,
    website: "https://example.com",
    openPositions: 15,
    rating: 4.7,
    featured: false,
  },
  {
    id: "5",
    name: "Cloud Systems",
    logo: "/abstract-cloud-network.png",
    description: "A cloud infrastructure provider offering scalable solutions for businesses of all sizes.",
    industry: "Technology",
    location: "Seattle, WA",
    size: "1000-5000 employees",
    founded: 2011,
    website: "https://example.com",
    openPositions: 20,
    rating: 4.3,
    featured: false,
  },
  {
    id: "6",
    name: "Brand Builders",
    logo: "/abstract-geometric-logo.png",
    description: "A marketing agency specializing in brand development and digital marketing strategies.",
    industry: "Media",
    location: "Chicago, IL",
    size: "50-200 employees",
    founded: 2014,
    website: "https://example.com",
    openPositions: 6,
    rating: 3.9,
    featured: false,
  },
]

export default function CompanyListings() {
  const [view, setView] = useState<"grid" | "list">("grid")

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-dark-gray">Showing {companies.length} companies</h2>

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
          view === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1",
        )}
      >
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} view={view} />
        ))}
      </div>
    </div>
  )
}

interface CompanyCardProps {
  company: (typeof companies)[0]
  view: "grid" | "list"
}

function CompanyCard({ company, view }: CompanyCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md",
        company.featured && "ring-2 ring-accent",
      )}
    >
      <div className={cn("p-4", view === "list" && "flex items-start gap-4")}>
        <div className={cn(view === "list" && "flex-shrink-0")}>
          <div className="relative w-16 h-16 mb-4 bg-light-gray rounded-md overflow-hidden border border-gray-200">
            <Image
              src={company.logo || "/placeholder.svg"}
              alt={`${company.name} logo`}
              fill
              className="object-contain p-2"
            />
          </div>

          {company.featured && view === "grid" && <Badge className="mb-4 bg-accent text-white">Featured</Badge>}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-dark-gray text-lg">{company.name}</h3>
                {company.featured && view === "list" && <Badge className="bg-accent text-white">Featured</Badge>}
              </div>

              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {company.location}
              </div>
            </div>

            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm font-medium">{company.rating}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{company.description}</p>

          <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-gray-600 mb-4">
            <div className="flex items-center">
              <Briefcase className="h-3.5 w-3.5 mr-1" />
              {company.industry}
            </div>
            <div className="flex items-center">
              <Users className="h-3.5 w-3.5 mr-1" />
              {company.size}
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="bg-light-gray">
                {company.openPositions} open positions
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <Link href={`/companies/${company.id}`}>View Profile</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <Link href={`/jobs?company=${company.id}`}>See Jobs</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-gray-500 w-full sm:w-auto">
              <a href={company.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Website
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
