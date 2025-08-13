"use client" // Add use client directive

import Image from "next/image"
import Link from "next/link"
import { MapPin, Briefcase, Users, Calendar, ExternalLink, Star, Mail, Phone, Loader2, Edit, Upload, X, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CompanyJobs from "@/components/company-jobs"
import { useState, useEffect, useRef } from "react" // Import hooks
import api from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"

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

export default function CompanyDetailsPage() {
    const { user, isAuthenticated } = useAuthStore()

  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoLoading, setLogoLoading] = useState(false)
  
  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editFormData, setEditFormData] = useState({
    company_name: "",
    company_email: "",
    company_phone: "",
    description: "",
    culture: "",
    benefits: "",
    founded_year: "",
    employee_count: "",
    location: "",
    industry: ""
  })
  const [newLogo, setNewLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isFormValid, setIsFormValid] = useState(false)
  
  // Markdown preview states
  const [showDescriptionPreview, setShowDescriptionPreview] = useState(false)
  const [showCulturePreview, setShowCulturePreview] = useState(false)
  const [showBenefitsPreview, setShowBenefitsPreview] = useState(false)

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true)
      setError(null)
      if (!user?.token) return
      try {
        console.log(user.token)
        const response = await api.get(`/company/details`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
        if (!response.data) {
          throw new Error("Failed to fetch company data")
        }
        const data: CompanyData = await response.data

        // Add placeholder/default values for fields not present in the API response
        const enrichedData: CompanyData = {
          ...data,
          coverImage: data.coverImage || "/san-francisco-street-grid.png", // Placeholder
          website: data.website || "#", // Placeholder or fetch logic
          openPositions: data.openPositions || 0, // Placeholder or fetch logic
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
    fetchCompanyData()
  }, [isAuthenticated, user])

  // Fetch company logo
  useEffect(() => {
    const fetchCompanyLogo = async () => {
      if (!company?.company_id) {
        setLogoUrl(null)
        return
      }

      setLogoLoading(true)
      try {
        const res = await api.get(`/company/logo/company/${company.company_id}`, {
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
  }, [company?.company_id])

  // Cleanup logo URL when component unmounts
  useEffect(() => {
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl)
      }
    }
  }, [logoUrl])

  // Validation functions
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "company_name":
        if (!value.trim()) return "Company name is required"
        if (value.trim().length < 2) return "Company name must be at least 2 characters"
        if (value.trim().length > 100) return "Company name must be less than 100 characters"
        return ""
      
      case "company_email":
        if (!value.trim()) return "Company email is required"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Please enter a valid email address"
        return ""
      
      case "company_phone":
        if (!value.trim()) return "Company phone is required"
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""))) return "Please enter a valid phone number"
        return ""
      
      case "description":
        if (!value.trim()) return "Company description is required"
        if (value.trim().length < 50) return "Description must be at least 50 characters"
        if (value.trim().length > 5000) return "Description must be less than 5000 characters"
        return ""
      
      case "culture":
        if (value.trim() && value.trim().length < 20) return "Culture description must be at least 20 characters"
        if (value.trim().length > 3000) return "Culture description must be less than 3000 characters"
        return ""
      
      case "benefits":
        if (value.trim() && value.trim().length < 20) return "Benefits description must be at least 20 characters"
        if (value.trim().length > 3000) return "Benefits description must be less than 3000 characters"
        return ""
      
      case "founded_year":
        if (!value.trim()) return "Founded year is required"
        const year = parseInt(value)
        const currentYear = new Date().getFullYear()
        if (isNaN(year) || year < 1800 || year > currentYear) {
          return `Please enter a valid year between 1800 and ${currentYear}`
        }
        return ""
      
      case "location":
        if (!value.trim()) return "Location is required"
        if (value.trim().length < 2) return "Location must be at least 2 characters"
        if (value.trim().length > 100) return "Location must be less than 100 characters"
        return ""
      
      case "industry":
        if (!value.trim()) return "Industry is required"
        return ""
      
      case "employee_count":
        if (!value.trim()) return "Employee count is required"
        return ""
      
      default:
        return ""
    }
  }

  const validateForm = (formData: typeof editFormData): Record<string, string> => {
    const errors: Record<string, string> = {}
    
    Object.entries(formData).forEach(([field, value]) => {
      const error = validateField(field, value)
      if (error) {
        errors[field] = error
      }
    })
    
    return errors
  }

  const validateLogo = (file: File): string => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    
    if (file.size > maxSize) {
      return "Logo file size must be less than 5MB"
    }
    
    if (!allowedTypes.includes(file.type)) {
      return "Logo must be a valid image file (JPEG, PNG, GIF, or WebP)"
    }
    
    return ""
  }

  // Helper function to convert HTML back to markdown (basic conversion)
  const htmlToMarkdown = (html: string): string => {
    if (!html) return ""
    
    // If it doesn't contain HTML tags, assume it's already markdown
    if (!html.includes('<') && !html.includes('>')) {
      return html
    }
    
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1')
      .replace(/<ul[^>]*>|<\/ul>/gi, '')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/\n\n\n+/g, '\n\n')
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .trim()
  }
  const markdownToHtml = (markdown: string) => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-dark-gray mb-2 mt-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-dark-gray mb-3 mt-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-dark-gray mb-4 mt-4">$1</h1>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/\n\n/gim, '</p><p class="mb-3">')
      .replace(/^\n/gim, '')
      .replace(/^(?!<[h|l])/gim, '<p class="mb-3">')
      .replace(/(<li.*<\/li>)/gim, '<ul class="list-disc ml-6 mb-3">$1</ul>')
      .replace(/<\/ul>\s*<ul[^>]*>/gim, '')
  }

  // Open edit modal and populate form data
  const openEditModal = () => {
    if (company) {
      setEditFormData({
        company_name: company.company_name,
        company_email: company.company_email,
        company_phone: company.company_phone,
        description: htmlToMarkdown(company.description || ""),
        culture: htmlToMarkdown(company.culture || ""),
        benefits: Array.isArray(company.benefits) 
          ? company.benefits.join('\n') 
          : htmlToMarkdown(company.benefits || ""),
        founded_year: company.founded_year,
        employee_count: company.employee_count,
        location: company.location,
        industry: company.industry
      })
    }
    setValidationErrors({})
    setIsFormValid(true)
    setIsEditModalOpen(true)
  }

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewLogo(file)
      const previewUrl = URL.createObjectURL(file)
      setLogoPreview(previewUrl)
    }
  }

  // Handle form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.token) return

    // Validate form before submission
    const formErrors = validateForm(editFormData)
    if (Object.keys(formErrors).length > 0) {
      setValidationErrors(formErrors)
      setIsFormValid(false)
      return
    }

    // Validate logo if uploaded
    if (newLogo) {
      const logoError = validateLogo(newLogo)
      if (logoError) {
        setValidationErrors(prev => ({ ...prev, logo: logoError }))
        return
      }
    }

    setEditLoading(true)
    try {
      const formData = new FormData()
      
      // Add form fields (store as markdown, don't convert to HTML)
      Object.entries(editFormData).forEach(([key, value]) => {
        if (value.trim() !== "") {
          formData.append(key, value)  // Store raw markdown
        }
      })

      // Add logo if selected
      if (newLogo) {
        formData.append("logo", newLogo)
      }

      const response = await api.put("/company/edit", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data"
        }
      })

      if (response.status === 200) {
        // Backend returns {msg: "Company updated", data: company_object}
        // So we need to use response.data.data for the actual company data
        if (response.data && response.data.data) {
          const data: CompanyData = response.data.data
          
          // Add placeholder/default values for fields not present in the API response
          const enrichedData: CompanyData = {
            ...data,
            coverImage: data.coverImage || "/san-francisco-street-grid.png",
            website: data.website || "#",
            openPositions: data.openPositions || 0,
            rating: data.rating || 0,
            benefits: data.benefits || [
              "Benefit info not available",
            ],
            culture: data.culture || "Culture info not available.",
            address: data.address || data.location,
          }
          setCompany(enrichedData)
        } else {
          // Fallback: refetch company data if response structure is unexpected
          try {
            const refreshResponse = await api.get(`/company/details`, {
              headers: { Authorization: `Bearer ${user.token}` },
            });
            
            if (refreshResponse.data) {
              const data: CompanyData = refreshResponse.data
              
              // Add placeholder/default values for fields not present in the API response
              const enrichedData: CompanyData = {
                ...data,
                coverImage: data.coverImage || "/san-francisco-street-grid.png",
                website: data.website || "#",
                openPositions: data.openPositions || 0,
                rating: data.rating || 0,
                benefits: data.benefits || [
                  "Benefit info not available",
                ],
                culture: data.culture || "Culture info not available.",
                address: data.address || data.location,
              }
              setCompany(enrichedData)
            }
          } catch (refreshError) {
            console.error("Error refreshing company data:", refreshError)
            // Last resort: reload the page
            window.location.reload()
          }
        }
        
        setIsEditModalOpen(false)
        setNewLogo(null)
        setLogoPreview(null)
        
        // Refresh logo if it was updated
        if (newLogo) {
          // Force refresh of logo URL
          if (logoUrl) {
            URL.revokeObjectURL(logoUrl)
            setLogoUrl(null)
          }
        }
      }
    } catch (err: any) {
      console.error("Error updating company:", err)
      alert(err.response?.data?.detail || "Failed to update company details")
    } finally {
      setEditLoading(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Validate the specific field
    const error = validateField(field, value)
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }))
    
    // Check overall form validity
    const updatedData = { ...editFormData, [field]: value }
    const formErrors = validateForm(updatedData)
    setIsFormValid(Object.keys(formErrors).length === 0)
  }

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
    description: company.description ? markdownToHtml(company.description) : null,
    industry: company.industry,
    location: company.location,
    size: company.employee_count,
    founded: parseInt(company.founded_year, 10), // Convert string year to number
    website: company.website || "#", // Use placeholder if missing
    openPositions: company.openPositions || 0, // Use placeholder if missing
    rating: company.rating || 0, // Use placeholder if missing
    benefits: company.benefits ? 
      (Array.isArray(company.benefits) 
        ? markdownToHtml(company.benefits.join('\n')) 
        : markdownToHtml(company.benefits)
      ) : null,
    culture: company.culture ? markdownToHtml(company.culture) : null,
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
                  {/* Render markdown as HTML */}
                  {displayCompany.description ? (
                    <div dangerouslySetInnerHTML={{ __html: displayCompany.description }}></div>
                  ) : (
                    <p className="text-gray-500 italic">No description available.</p>
                  )}
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
                  {displayCompany.culture ? (
                    <div 
                      className="prose max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: displayCompany.culture }}
                    />
                  ) : (
                    <p className="text-gray-500 italic">No culture information available.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-dark-gray mb-3">Benefits & Perks</h3>
                  {displayCompany.benefits ? (
                    <div 
                      className="prose max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: displayCompany.benefits }}
                    />
                  ) : (
                    <p className="text-gray-500 italic">No benefits information available.</p>
                  )}
                </div>
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
                <Link href={`/jobs?company=${displayCompany.id}`} className="w-full">
                  View All Jobs ({displayCompany.openPositions})
                </Link>
              </Button>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={openEditModal}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Company Details
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
        <CompanyJobs companyId={company.company_id} companyName={company.company_name} /> {/* Pass the actual company ID and name */}
      </div>

      {/* Edit Company Details Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2 text-blue-600" />
              Edit Company Details
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-6 mt-4">
            {/* Company Logo */}
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                  {logoPreview ? (
                    <Image 
                      src={logoPreview} 
                      alt="Logo preview" 
                      width={60} 
                      height={60} 
                      className="w-full h-full object-cover" 
                    />
                  ) : logoUrl ? (
                    <Image 
                      src={logoUrl} 
                      alt="Current logo" 
                      width={60} 
                      height={60} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <Upload className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    aria-label="Upload company logo"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                  </Button>
                </div>
                {logoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNewLogo(null)
                      setLogoPreview(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {validationErrors.logo && (
                <p className="text-sm text-red-500">{validationErrors.logo}</p>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={editFormData.company_name}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                  placeholder="Enter company name"
                  className={validationErrors.company_name ? "border-red-500" : ""}
                />
                {validationErrors.company_name && (
                  <p className="text-sm text-red-500">{validationErrors.company_name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_email">Company Email</Label>
                <Input
                  id="company_email"
                  type="email"
                  value={editFormData.company_email}
                  onChange={(e) => handleInputChange("company_email", e.target.value)}
                  placeholder="Enter company email"
                  className={validationErrors.company_email ? "border-red-500" : ""}
                />
                {validationErrors.company_email && (
                  <p className="text-sm text-red-500">{validationErrors.company_email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_phone">Company Phone</Label>
                <Input
                  id="company_phone"
                  value={editFormData.company_phone}
                  onChange={(e) => handleInputChange("company_phone", e.target.value)}
                  placeholder="Enter company phone"
                  className={validationErrors.company_phone ? "border-red-500" : ""}
                />
                {validationErrors.company_phone && (
                  <p className="text-sm text-red-500">{validationErrors.company_phone}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editFormData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Enter company location"
                  className={validationErrors.location ? "border-red-500" : ""}
                />
                {validationErrors.location && (
                  <p className="text-sm text-red-500">{validationErrors.location}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={editFormData.industry}
                  onValueChange={(value) => handleInputChange("industry", value)}
                >
                  <SelectTrigger className={validationErrors.industry ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="media">Media & Entertainment</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="nonprofit">Non-profit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.industry && (
                  <p className="text-sm text-red-500">{validationErrors.industry}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="founded_year">Founded Year</Label>
                <Input
                  id="founded_year"
                  value={editFormData.founded_year}
                  onChange={(e) => handleInputChange("founded_year", e.target.value)}
                  placeholder="Enter founded year"
                  className={validationErrors.founded_year ? "border-red-500" : ""}
                />
                {validationErrors.founded_year && (
                  <p className="text-sm text-red-500">{validationErrors.founded_year}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employee_count">Employee Count</Label>
                <Select
                  value={editFormData.employee_count}
                  onValueChange={(value) => handleInputChange("employee_count", value)}
                >
                  <SelectTrigger className={validationErrors.employee_count ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select employee count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="501-1000">501-1000</SelectItem>
                    <SelectItem value="1001-5000">1001-5000</SelectItem>
                    <SelectItem value="5000+">5000+</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.employee_count && (
                  <p className="text-sm text-red-500">{validationErrors.employee_count}</p>
                )}
              </div>
            </div>

            {/* Company Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Company Description <span className="text-red-500">*</span></Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDescriptionPreview(!showDescriptionPreview)}
                  className="text-xs"
                >
                  {showDescriptionPreview ? (
                    <>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" /> Preview
                    </>
                  )}
                </Button>
              </div>

              {!showDescriptionPreview ? (
                <>
                  <Textarea
                    id="description"
                    value={editFormData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder={`Describe your company, mission, and values...

You can use markdown formatting:
# Main Heading
## Section Heading  
### Sub Heading
**Bold text**
*Italic text*
- Bullet point
- Another bullet point

Example:
## About Us
We are a **leading technology company** focused on innovation.

### Our Mission:
- Deliver exceptional products
- Foster innovation and creativity
- Make a positive impact`}
                    rows={8}
                    className={`min-h-[200px] font-mono text-sm ${validationErrors.description ? "border-red-500" : ""}`}
                  />
                  {validationErrors.description && (
                    <p className="text-sm text-red-500">{validationErrors.description}</p>
                  )}
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
                    <p className="font-semibold mb-2">Markdown Guide:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p><code># Heading 1</code></p>
                        <p><code>## Heading 2</code></p>
                        <p><code>### Heading 3</code></p>
                        <p><code>**Bold text**</code></p>
                      </div>
                      <div>
                        <p><code>*Italic text*</code></p>
                        <p><code>- Bullet point</code></p>
                        <p><code>* Bullet point</code></p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                  <p className="text-sm text-gray-600 mb-3 border-b pb-2">Preview:</p>
                  <div 
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(editFormData.description) }}
                  />
                </div>
              )}
            </div>

            {/* Company Culture */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="culture">Company Culture</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCulturePreview(!showCulturePreview)}
                  className="text-xs"
                >
                  {showCulturePreview ? (
                    <>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" /> Preview
                    </>
                  )}
                </Button>
              </div>

              {!showCulturePreview ? (
                <>
                  <Textarea
                    id="culture"
                    value={editFormData.culture}
                    onChange={(e) => handleInputChange("culture", e.target.value)}
                    placeholder={`Describe your company culture, values, and work environment...

You can use markdown formatting:
## Our Culture
We believe in **collaboration** and *innovation*.

### Core Values:
- Integrity and transparency
- Continuous learning
- Work-life balance
- Diversity and inclusion`}
                    rows={6}
                    className={`min-h-[150px] font-mono text-sm ${validationErrors.culture ? "border-red-500" : ""}`}
                  />
                  {validationErrors.culture && (
                    <p className="text-sm text-red-500">{validationErrors.culture}</p>
                  )}
                </>
              ) : (
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[150px]">
                  <p className="text-sm text-gray-600 mb-3 border-b pb-2">Preview:</p>
                  <div 
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(editFormData.culture) }}
                  />
                </div>
              )}
            </div>

            {/* Company Benefits */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="benefits">Benefits & Perks</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBenefitsPreview(!showBenefitsPreview)}
                  className="text-xs"
                >
                  {showBenefitsPreview ? (
                    <>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" /> Preview
                    </>
                  )}
                </Button>
              </div>

              {!showBenefitsPreview ? (
                <>
                  <Textarea
                    id="benefits"
                    value={editFormData.benefits}
                    onChange={(e) => handleInputChange("benefits", e.target.value)}
                    placeholder={`List the benefits and perks your company offers...

You can use markdown formatting:
## Benefits Package
We offer **comprehensive benefits** to support our employees.

### Health & Wellness:
- Medical, dental, and vision insurance
- Mental health support
- Gym membership reimbursement

### Time Off:
- Flexible PTO policy
- Paid holidays
- Parental leave`}
                    rows={6}
                    className={`min-h-[150px] font-mono text-sm ${validationErrors.benefits ? "border-red-500" : ""}`}
                  />
                  {validationErrors.benefits && (
                    <p className="text-sm text-red-500">{validationErrors.benefits}</p>
                  )}
                </>
              ) : (
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[150px]">
                  <p className="text-sm text-gray-600 mb-3 border-b pb-2">Preview:</p>
                  <div 
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(editFormData.benefits) }}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setNewLogo(null)
                  setLogoPreview(null)
                }}
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editLoading || !isFormValid}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {editLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Company Details"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
