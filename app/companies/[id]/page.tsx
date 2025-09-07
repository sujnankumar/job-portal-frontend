"use client" // Add use client directive

import Image from "next/image"
import Link from "next/link"
import { MapPin, Briefcase, Users, Calendar, ExternalLink, Star, Mail, Phone, Loader2, X, UserPlus, UserCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CompanyJobs from "@/components/company-jobs"
import { useState, useEffect, use as usePromise } from "react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import { DEFAULT_COMPANY_LOGO, DEFAULT_COVER_IMAGE } from "@/lib/placeholders"

// Simple markdown to HTML converter
const markdownToHtml = (markdown: string) => {
  if (!markdown) return ""
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
  benefits?: string // Updated to string since we're storing markdown
  culture?: string // Assuming culture might come from API or needs a placeholder
  company_email: string
  company_phone: string
  address?: string // Assuming address might come from API or needs a placeholder
}

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Unwrap params promise (Next.js newer behavior) using React.use
  const ensuredParams = (params as any)?.then ? (params as Promise<{ id: string }>) : Promise.resolve(params as { id: string })
  const resolvedParams = usePromise(ensuredParams)
  const companyId = resolvedParams.id
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoLoading, setLogoLoading] = useState(false)
  const [openPositions, setOpenPositions] = useState(0)
  // Follow state
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  // Rating & Review state
  // Check if user is following this company
  const user = useAuthStore((s) => s.user)
  const isJobSeeker = user?.role === "applicant" // mapping backend job_seeker ~ applicant
  const [totalRatings, setTotalRatings] = useState<number>(0)

  useEffect(() => {
    const checkFollowing = async () => {
      if (!isJobSeeker || !user?.token || !companyId) return setIsFollowing(false)
      try {
        const res = await api.get("/following", { headers: { Authorization: `Bearer ${user.token}` } })
        const following = res.data?.following || []
        setIsFollowing(following.includes(companyId))
      } catch {
        setIsFollowing(false)
      }
    }
    checkFollowing()
  }, [isJobSeeker, user?.token, companyId])
  // Follow company handler
  const handleFollowCompany = async () => {
    if (!isJobSeeker) return toast.error("Only job seekers can follow companies")
    if (!user?.token) return toast.error("Please login to follow companies")
    setFollowLoading(true)
    try {
      const response = await api.post(`/follow/${companyId}`, {}, { headers: { Authorization: `Bearer ${user.token}` } })
      setIsFollowing(true)
      toast.success(response?.data?.detail || "You are now following this company!")
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to follow company")
    } finally {
      setFollowLoading(false)
    }
  }

  // Unfollow company handler
  const handleUnfollowCompany = async () => {
    if (!isJobSeeker) return toast.error("Only job seekers can unfollow companies")
    if (!user?.token) return toast.error("Please login to unfollow companies")
    setFollowLoading(true)
    try {
      const response = await api.delete(`/follow/${companyId}`, { headers: { Authorization: `Bearer ${user.token}` } })
      setIsFollowing(false)
      toast.success(response?.data?.detail ||"You have unfollowed this company.")
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to unfollow company")
    } finally {
      setFollowLoading(false)
    }
  }
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [ratingValue, setRatingValue] = useState<number>(0)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [existingReviewRating, setExistingReviewRating] = useState<number | null>(null)
  const [reviewText, setReviewText] = useState("")
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch company data and jobs count in parallel
        const [companyResponse, jobsResponse, avgRatingResponse] = await Promise.all([
          api.get(`/company/${companyId}`),
          api.get(`/job/jobs/by_company/${companyId}`),
          api.get(`/ratings/average-rating/${companyId}`).catch(() => ({ data: { average_rating: 0 } }))
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
            rating: avgRatingResponse.data?.average_rating || 0, // use API average rating
            benefits: data.benefits || "Benefits info not available.", // Use string placeholder since benefits is now markdown
            culture: data.culture || "Culture info not available.", // Placeholder
            address: data.address || data.location, // Use location if address specific field is missing
        }
  setTotalRatings(avgRatingResponse.data?.total_ratings || 0)
        setCompany(enrichedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        console.error("Error fetching company data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (companyId) {
      fetchCompanyData()
    }
  }, [companyId])

  // Fetch company logo & whether user has rated
  useEffect(() => {
    const fetchCompanyLogo = async () => {
  if (!companyId) {
        setLogoUrl(null)
        return
      }

      setLogoLoading(true)
      try {
  const res = await api.get(`/company/logo/company/${companyId}`, {
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

    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl)
    }
  }, [companyId])

  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl)
    }
  }, [logoUrl])

  // Check if user already rated (by attempting to fetch their review list and checking company)
  useEffect(() => {
    const checkRated = async () => {
      if (!isJobSeeker || !user?.token) return
      try {
        const res = await api.get(`/review/my-reviews`, { headers: { Authorization: `Bearer ${user.token}` } })
        const reviews = res.data?.reviews || []
        const found = reviews.find((r: any) => r.company_id === companyId)
        if (found) {
          setHasRated(true)
          if (found.review_text) {
            setHasReviewed(true)
            setExistingReviewRating(found.rating)
          } else {
            setExistingReviewRating(found.rating)
          }
        }
      } catch (e) {
        // ignore
      }
    }
    checkRated()
  }, [isJobSeeker, user?.token, companyId])

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
  logo: company.logo || DEFAULT_COMPANY_LOGO, // Standardized placeholder
  coverImage: company.coverImage || DEFAULT_COVER_IMAGE, // Standardized placeholder
    description: company.description,
    industry: company.industry,
    location: company.location,
    size: company.employee_count,
    founded: parseInt(company.founded_year, 10), // Convert string year to number
    website: company.website || "#", // Use placeholder if missing
    openPositions: company.openPositions || 0, // Use placeholder if missing
    rating: company.rating || 0, // Use placeholder if missing
    benefits: company.benefits || "Benefits info not available.", // Use string placeholder since benefits is now markdown
    culture: company.culture || "N/A", // Use placeholder if missing
    contact: {
      email: company.company_email,
      phone: company.company_phone,
      address: company.address || company.location, // Use location if address specific field is missing
    },
  }

  const submitRating = async () => {
    if (!isJobSeeker) return setFeedbackMsg("Only job seekers can rate")
    if (!user?.token) return setFeedbackMsg("Please login")
    if (ratingValue < 1) return setFeedbackMsg("Select a rating")
    try {
      setSubmittingRating(true)
      setFeedbackMsg(null)
      if (hasRated) {
        await api.post(`/ratings/edit`, { company_id: displayCompany.id, rating: ratingValue }, { headers: { Authorization: `Bearer ${user.token}` } })
      } else {
        await api.post(`/ratings/rate`, { company_id: displayCompany.id, rating: ratingValue }, { headers: { Authorization: `Bearer ${user.token}` } })
        setHasRated(true)
      }
      setShowRatingModal(false)
      // Refresh average rating
      const avgRes = await api.get(`/ratings/average-rating/${displayCompany.id}`)
      setCompany((prev) => prev ? { ...prev, rating: avgRes.data?.average_rating || ratingValue } : prev)
      setTotalRatings(avgRes.data?.total_ratings || 0)
      setExistingReviewRating(ratingValue)
    } catch (e: any) {
      setFeedbackMsg(e?.response?.data?.detail || "Failed to submit rating")
    } finally {
      setSubmittingRating(false)
    }
  }

  const submitReview = async () => {
    if (!isJobSeeker) return setFeedbackMsg("Only job seekers can review")
    if (!user?.token) return setFeedbackMsg("Please login")
    if (!hasRated) {
      // open rating modal instead
      setFeedbackMsg(null)
      setShowReviewModal(false)
      setShowRatingModal(true)
      return
    }
    if (reviewText.trim().length === 0) return setFeedbackMsg("Write a review")
    try {
      setSubmittingReview(true)
      setFeedbackMsg(null)
      const payload = { company_id: displayCompany.id, rating: (ratingValue || existingReviewRating || 5), review_text: reviewText }
      if (hasReviewed) {
        await api.post(`/review/edit-review`, payload, { headers: { Authorization: `Bearer ${user.token}` } })
      } else {
        await api.post(`/review/review`, payload, { headers: { Authorization: `Bearer ${user.token}` } })
        setHasReviewed(true)
      }
      setShowReviewModal(false)
      setReviewText("")
    } catch (e: any) {
      setFeedbackMsg(e?.response?.data?.detail || "Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  const StarButton = ({ index }: { index: number }) => {
    const filled = index <= ratingValue
    return (
      <button
        type="button"
        onClick={() => setRatingValue(index)}
        className="focus:outline-none"
        aria-label={`Rate ${index} star`}
      >
        <Star className={`h-8 w-8 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      </button>
    )
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

              {displayCompany.rating > 0 && (
                <button
                  type="button"
                  onClick={() => { if (hasRated) { setShowRatingModal(true); setFeedbackMsg(null); setRatingValue(existingReviewRating || ratingValue || Math.round(displayCompany.rating)); } }}
                  className="flex items-center bg-light-gray px-3 py-1.5 rounded-full hover:ring-2 hover:ring-accent/40 transition"
                  title={hasRated ? 'Click to edit your rating' : 'Rating' }
                >
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-medium">{displayCompany.rating.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">/5</span>
                  <span className="text-gray-500 ml-2 text-sm">({totalRatings})</span>
                </button>
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
                  <div 
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(displayCompany.description) }}
                  />
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
                  <div 
                    className="text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(displayCompany.culture) }}
                  />
                </div>

                {displayCompany.benefits && typeof displayCompany.benefits === 'string' && displayCompany.benefits.trim() !== "" && displayCompany.benefits !== "Benefits info not available." && ( // Conditionally render benefits if they exist and aren't placeholder
                  <div>
                    <h3 className="text-lg font-medium text-dark-gray mb-3">Benefits & Perks</h3>
                    <div 
                      className="text-gray-700 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(displayCompany.benefits) }}
                    />
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

              {isJobSeeker && (
                <Button
                  variant={isFollowing ? "default" : "outline"}
                  className="w-full"
                  disabled={followLoading}
                  onClick={isFollowing ? handleUnfollowCompany : handleFollowCompany}
                  title={isFollowing ? "Unfollow company" : "Follow company"}
                >
                  {followLoading ? (
                    "Processing..."
                  ) : isFollowing ? (
                    <><UserCheck className="h-4 w-4 mr-2" />Following</>
                  ) : (
                    <><UserPlus className="h-4 w-4 mr-2" />Follow Company</>
                  )}
                </Button>
              )}
              {!isJobSeeker && (
                <Button variant="outline" className="w-full" disabled>
                  <UserPlus className="h-4 w-4 mr-2" />Follow Company
                </Button>
              )}

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/reviews/${displayCompany.id}`} className="w-full">
                  Read Reviews
                </Link>
              </Button>

              {isJobSeeker && (
                <>
                  <Button variant="outline" className="w-full" onClick={() => { if(!hasRated){ setShowRatingModal(true); setFeedbackMsg(null) } }} disabled={hasRated}>
                    {hasRated ? 'Rated' : 'Rate Company'}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => { 
                    if (hasRated) { 
                      setFeedbackMsg(null); 
                      // Prefill textarea with existing review if editing
                      if (hasReviewed && reviewText.trim() === "") {
                        // fetch existing review content (if not already) via my-reviews cache call
                        // Simpler: trigger fetch again quickly
                        (async () => {
                          try {
                            const res = await api.get(`/review/my-reviews`, { headers: { Authorization: `Bearer ${user?.token}` } })
                            const reviews = res.data?.reviews || []
                            const found = reviews.find((r: any) => r.company_id === companyId)
                            if (found?.review_text) {
                              setReviewText(found.review_text)
                              setRatingValue(found.rating)
                            }
                          } catch {}
                        })()
                      } else if (!hasReviewed) {
                        // ensure ratingValue prefilled from existing rating-only
                        if (existingReviewRating) setRatingValue(existingReviewRating)
                      }
                      setShowReviewModal(true); 
                    } else { 
                      setFeedbackMsg('Please rate the company before writing a review.'); 
                      setShowRatingModal(true); 
                    }
                  }}>
                    {hasReviewed ? 'Edit Review' : 'Write Review'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Similar Companies section might need its own API call or be removed if data isn't available */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-dark-gray mb-4">Similar Companies</h2>
            <div className="text-gray-500">Similar companies feature coming soon.</div>
          </div>
        </div>
      </div>

      {/* Company Jobs */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-dark-gray mb-6">Open Positions at {displayCompany.name}</h2>
  <CompanyJobs companyId={companyId} companyName={company.company_name}/> {/* Pass the actual company ID */}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button className="absolute top-3 right-3" onClick={() => setShowRatingModal(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-semibold mb-4">Rate {displayCompany.name}</h3>
            <div className="flex gap-2 mb-6">
              {[1,2,3,4,5].map(i => <StarButton key={i} index={i} />)}
            </div>
            {feedbackMsg && <div className="text-sm text-red-600 mb-3">{feedbackMsg}</div>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowRatingModal(false)}>Cancel</Button>
              <Button disabled={submittingRating} onClick={submitRating} className="bg-accent hover:bg-accent/90">
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button className="absolute top-3 right-3" onClick={() => setShowReviewModal(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-semibold mb-2">Write a Review</h3>
            <p className="text-sm text-gray-500 mb-4">Share your experience at {displayCompany.name}</p>
            <textarea
              className="w-full border rounded-md p-3 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-accent/40"
              placeholder="Write your review here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            {feedbackMsg && <div className="text-sm text-red-600 mb-3">{feedbackMsg}</div>}
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setShowReviewModal(false)}>Cancel</Button>
              <Button disabled={submittingReview} onClick={submitReview} className="bg-accent hover:bg-accent/90">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
