"use client" // Add use client directive

import Image from "next/image"
import Link from "next/link"
import { MapPin, Briefcase, Users, Calendar, ExternalLink, Star, Mail, Phone, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CompanyJobs from "@/components/company-jobs"
import { useState, useEffect } from "react" // Import hooks
import api from "@/lib/axios"

// Define an interface for the company data from the API
interface CompanyData {
  company_id: string
  company_name: string
  logo: string | null
  coverImage?: string // Assuming cover image might come from API or needs a placeholder
  description: string
  industry: string
  location: string
  employee_count: string
  founded_year: string
  website?: string // Assuming website might come from API or needs a placeholder
  openPositions?: number // Assuming this might be calculated or fetched separately
  rating?: number // Assuming rating might come from API or needs a placeholder
  benefits?: string[] // Assuming benefits might come from API or needs a placeholder
  culture?: string // Assuming culture might come from API or needs a placeholder
  company_email: string
  company_phone: string
  address?: string // Assuming address might come from API or needs a placeholder
}

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoLoading, setLogoLoading] = useState(false)
  const [openPositions, setOpenPositions] = useState(0)

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch company data and jobs count in parallel
        const [companyResponse, jobsResponse] = await Promise.all([
          api.get(`/company/${params.id}`),
          api.get(`/job/jobs/by_company/${params.id}`)
        ])
        
        if (!companyResponse.data) {
          throw new Error("Failed to fetch company data")
        }
        
        const data: CompanyData = companyResponse.data
        const jobsCount = jobsResponse.data?.jobs?.length || 0
        setOpenPositions(jobsCount)

        // Add placeholder/default values for fields not present in the API response
        const enrichedData: CompanyData = {
          ...data,
          coverImage: data.coverImage || "/san-francisco-street-grid.png", // Placeholder
          website: data.website || "#", // Placeholder or fetch logic
          openPositions: jobsCount, // Use actual count from jobs API
          rating: data.rating || 0, // Placeholder or fetch logic
          benefits: data.benefits || [
            "Benefit info not available", // Placeholder
          ],
          culture: data.culture || "Culture info not available.", // Placeholder
          address: data.address || data.location, // Use location if address specific field is missing
        }
        setCompany(enrichedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        console.error("Error fetching company data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCompanyData()
    }
  }, [params.id])

  // Fetch company logo
  useEffect(() => {
    const fetchCompanyLogo = async () => {
      if (!params.id) {
        setLogoUrl(null)
        return
      }

      setLogoLoading(true)
      try {
        const res = await api.get(`/company/logo/company/${params.id}`, {
          responseType: "blob",
        })
        const url = URL.createObjectURL(res.data)
        setLogoUrl(url)
      } catch (error) {
        console.error("Failed to fetch company logo:", error)
        setLogoUrl(null)
      } finally {
        setLogoLoading(false)
      }
    }

    fetchCompanyLogo()

    // Cleanup function to revoke object URL
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl)
      }
    }
  }, [params.id])

  // Cleanup logo URL when component unmounts
  useEffect(() => {
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl)
      }
    }
  }, [logoUrl])

  if (loading) {
    return <div className="container mx-auto py-8 px-4 text-center">Loading company details...</div>
  }

  if (error) {
    return <div className="container mx-auto py-8 px-4 text-center text-red-600">Error: {error}</div>
  }

  if (!company) {
    return <div className="container mx-auto py-8 px-4 text-center">Company not found.</div>
  }

  // Map API data to component props
  const displayCompany = {
    id: company.company_id,
    name: company.company_name,
    logo: company.logo || "/placeholder.svg", // Use placeholder if logo is null
    coverImage: company.coverImage || "/placeholder.svg", // Use placeholder
    description: company.description,
    industry: company.industry,
    location: company.location,
    size: company.employee_count,
    founded: parseInt(company.founded_year, 10), // Convert string year to number
    website: company.website || "#", // Use placeholder if missing
    openPositions: company.openPositions || 0, // Use placeholder if missing
    rating: company.rating || 0, // Use placeholder if missing
    benefits: company.benefits || [], // Use empty array if missing
    culture: company.culture || "N/A", // Use placeholder if missing
    contact: {
      email: company.company_email,
      phone: company.company_phone,
      address: company.address || company.location, // Use location if address specific field is missing
    },
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Company Header */}
      <div className="relative mb-8">
        <div className="h-48 w-full rounded-xl overflow-hidden bg-light-gray">
          <Image
            src={displayCompany.coverImage} // Use fetched data
            alt={`${displayCompany.name} cover`}
            width={1200}
            height={300}
            className="w-full h-full object-cover"
            priority // Add priority for LCP image
          />
        </div>

        <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center p-2">
          {logoLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          ) : (
            <Image
              src={logoUrl || displayCompany.logo} // Use fetched logo or fallback to API data
              alt={`${displayCompany.name} logo`}
              width={80}
              height={80}
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </div>
      </div>

      {/* Company Info */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-dark-gray">{displayCompany.name}</h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {displayCompany.location}
                </div>
              </div>

              {displayCompany.rating > 0 && ( // Conditionally render rating if available
                <div className="flex items-center bg-light-gray px-3 py-1.5 rounded-full">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-medium">{displayCompany.rating.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">/5</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <div className="flex items-center text-gray-600">
                <Briefcase className="h-4 w-4 mr-1" />
                {displayCompany.industry}
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {displayCompany.size}
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                Founded {displayCompany.founded}
              </div>
              {displayCompany.openPositions > 0 && ( // Conditionally render open positions badge
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-light-gray">
                    {displayCompany.openPositions} open positions
                  </Badge>
                </div>
              )}
            </div>

            <Tabs defaultValue="about">
              <TabsList className="mb-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="culture">Culture & Benefits</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4">
                <div className="prose max-w-none text-gray-700">
                  {/* Handle potential multiple paragraphs in description */}
                  {displayCompany.description.split("\n").map((paragraph, index) => (
                    paragraph.trim() && <p key={index}>{paragraph}</p>
                  ))}
                </div>

                {displayCompany.website && displayCompany.website !== "#" && ( // Conditionally render website button
                  <div className="flex mt-4">
                    <Button asChild variant="outline" size="sm">
                      <a href={displayCompany.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="culture" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-dark-gray mb-3">Company Culture</h3>
                  <p className="text-gray-700">{displayCompany.culture}</p>
                </div>

                {displayCompany.benefits && displayCompany.benefits.length > 0 && ( // Conditionally render benefits
                  <div>
                    <h3 className="text-lg font-medium text-dark-gray mb-3">Benefits & Perks</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {displayCompany.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent mr-2"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-light-gray rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <h3 className="font-medium">Email</h3>
                    </div>
                    <a href={`mailto:${displayCompany.contact.email}`} className="text-accent hover:underline break-all">
                      {displayCompany.contact.email}
                    </a>
                  </div>

                  <div className="bg-light-gray rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <h3 className="font-medium">Phone</h3>
                    </div>
                    <a href={`tel:${displayCompany.contact.phone}`} className="text-accent hover:underline">
                      {displayCompany.contact.phone}
                    </a>
                  </div>

                  <div className="bg-light-gray rounded-lg p-4 md:col-span-2">
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <h3 className="font-medium">Address</h3>
                    </div>
                    <p>{displayCompany.contact.address}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold text-dark-gray mb-4">Quick Actions</h2>

            <div className="space-y-3">
              <Button className="w-full bg-accent hover:bg-accent/90" asChild>
                <Link href={`/jobs?search=${encodeURIComponent(displayCompany.name)}`} className="w-full">
                  View All Jobs ({openPositions})
                </Link>
              </Button>

              <Button variant="outline" className="w-full">
                Follow Company {/* Add follow functionality later */}
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/companies/${displayCompany.id}/reviews`} className="w-full">
                  Read Reviews {/* Add review functionality later */}
                </Link>
              </Button>
            </div>
          </div>

          {/* Similar Companies section might need its own API call or be removed if data isn't available */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-dark-gray mb-4">Similar Companies</h2>
            {/* Replace mock similar companies with actual data fetching or remove */}
            <div className="text-gray-500">Similar companies feature coming soon.</div>
          </div>
        </div>
      </div>

      {/* Company Jobs */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-dark-gray mb-6">Open Positions at {displayCompany.name}</h2>
        <CompanyJobs companyId={params.id} companyName={company.company_name}/> {/* Pass the actual company ID */}
      </div>
    </div>
  )
}
