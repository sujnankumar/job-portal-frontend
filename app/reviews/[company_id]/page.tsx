"use client"
import { useEffect, useState, use as usePromise } from 'react'
import api from '@/lib/axios'
import { Star, Loader2, Pencil, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

interface ReviewItem {
  _id: string
  user_id: string
  company_id: string
  rating: number
  review_text: string
  created_at?: string
  updated_at?: string
  user_name?: string
}

export default function ReviewsListingPage({ params }: { params: Promise<{ company_id: string }> | { company_id: string } }) {
  const ensuredParams = (params as any)?.then ? (params as Promise<{ company_id: string }>) : Promise.resolve(params as { company_id: string })
  const resolvedParams = usePromise(ensuredParams)
  const companyId = resolvedParams.company_id
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [average, setAverage] = useState<number>(0)
  const [totalRaters, setTotalRaters] = useState<number>(0)
  const [textualCount, setTextualCount] = useState<number>(0)
  const { user, isAuthenticated, hydrated } = useAuthStore()
  const [myReview, setMyReview] = useState<ReviewItem | null>(null)
  const [showRateModal, setShowRateModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [pendingRating, setPendingRating] = useState<number | null>(null)
  const [reviewTextDraft, setReviewTextDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const formatIST = (iso?: string) => {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })
    } catch { return iso }
  }

  useEffect(() => {
    if(!hydrated) return // wait for auth store hydration
    const fetchReviews = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/review/company/${companyId}`)
        const data = res.data?.reviews || []
        setReviews(Array.isArray(data) ? data : [])
        if(res.data){
          setAverage(res.data.average_rating || 0)
          setTotalRaters(res.data.total_raters || 0)
          setTextualCount(res.data.count || 0)
        }
        if(isAuthenticated && user?.id){
          const mine = data.find((r:ReviewItem)=> r.user_id === user.id)
          setMyReview(mine || null)
        } else {
          setMyReview(null)
        }
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load reviews')
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [companyId, hydrated, isAuthenticated, user?.id])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark-gray">Company Reviews</h1>
        <Button variant="outline" asChild>
          <Link href={`/companies/${companyId}`}>Back to Company</Link>
        </Button>
      </div>
      {/* Summary */}
      {!loading && totalRaters > 0 && (
        <div className="mb-6 bg-white rounded-lg border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
          <div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Overall Rating</div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center">
                {[1,2,3,4,5].map(i => {
                  const full = Math.floor(average)
                  const fraction = average - full
                  let fillPercent = 0
                  if(i <= full) fillPercent = 100
                  else if(i === full + 1) fillPercent = Math.round(fraction * 100)
                  return (
                    <div key={i} className="relative h-5 w-5 mr-0.5">
                      <Star className="h-5 w-5 text-gray-300" />
                      <div className="absolute inset-0 overflow-hidden" style={{width: fillPercent+"%"}}>
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
              <span className="text-lg font-semibold">{average.toFixed(2)}</span>
              <span className="text-sm text-gray-500">({totalRaters} {totalRaters===1?'rating':'ratings'})</span>
              <span className="text-sm text-gray-400">• {textualCount} {textualCount===1?'review':'reviews'}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">Only textual reviews are listed below.</div>
          <div className="flex gap-2">
            {isAuthenticated && user?.role === 'applicant' && (
              myReview ? (
                <Button size="sm" variant="outline" onClick={()=>{
                  setPendingRating(myReview.rating)
                  setReviewTextDraft(myReview.review_text)
                  setShowReviewModal(true)
                }} className="flex items-center gap-1">
                  <Pencil className="h-4 w-4" /> Edit Your Review
                </Button>
              ) : (
                <Button size="sm" onClick={()=>{setPendingRating(null); setReviewTextDraft(''); setShowRateModal(true)}} className="flex items-center gap-1 bg-accent">
                  <Plus className="h-4 w-4" /> Write a Review
                </Button>
              )
            )}
          </div>
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-2 text-gray-600"><Loader2 className="h-5 w-5 animate-spin" /> Loading reviews...</div>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {!loading && reviews.length === 0 && <div className="text-gray-500">No reviews yet.</div>}
      {/* My Review prioritized */}
      <div className="space-y-4">
        {myReview && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-accent/40">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium flex items-center gap-2"><span className="px-2 py-0.5 text-[10px] uppercase tracking-wide bg-accent text-white rounded">Your Review</span>{myReview.user_name || 'You'}</div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1,2,3,4,5].map(i => <Star key={i} className={`h-4 w-4 ${i <= myReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                </div>
                <span className="text-xs text-gray-600 font-medium">{myReview.rating}/5</span>
              </div>
            </div>
            {myReview.review_text && <p className="text-gray-700 whitespace-pre-line">{myReview.review_text}</p>}
            <div className="text-xs text-gray-400 mt-2">{myReview.updated_at ? 'Updated ' + formatIST(myReview.updated_at) : formatIST(myReview.created_at)}</div>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={()=>{setPendingRating(myReview.rating); setReviewTextDraft(myReview.review_text); setShowReviewModal(true)}} className="flex items-center gap-1"><Pencil className="h-4 w-4"/>Edit</Button>
            </div>
          </div>
        )}
        {reviews.filter(r=> !myReview || r._id !== myReview._id).map(r => (
          <div key={r._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{r.user_name || 'Anonymous'}</div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1,2,3,4,5].map(i => <Star key={i} className={`h-4 w-4 ${i <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                </div>
                <span className="text-xs text-gray-600 font-medium">{r.rating}/5</span>
              </div>
            </div>
            {r.review_text && <p className="text-gray-700 whitespace-pre-line">{r.review_text}</p>}
            <div className="text-xs text-gray-400 mt-2">{r.updated_at ? 'Updated ' + formatIST(r.updated_at) : formatIST(r.created_at)}</div>
          </div>
        ))}
      </div>

      {/* Rate Modal */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Rate this Company</h2>
            <div className="flex items-center mb-6">
              {[1,2,3,4,5].map(i => {
                const active = (pendingRating || 0) >= i
                return (
                  <button key={i} onClick={()=>setPendingRating(i)} className="focus:outline-none" aria-label={`Rate ${i} star`}>
                    <Star className={`h-8 w-8 ${active? 'text-yellow-400 fill-yellow-400':'text-gray-300'}`}/>
                  </button>
                )
              })}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={()=>{setShowRateModal(false); setPendingRating(null)}}>Cancel</Button>
              <Button disabled={!pendingRating} onClick={()=>{setShowRateModal(false); setShowReviewModal(true)}} className="bg-accent" >Continue</Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal (Create/Edit) */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-2">{myReview ? 'Edit Your Review' : 'Write a Review'}</h2>
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Rating:</span>
                <div className="flex items-center">
                  {[1,2,3,4,5].map(i => {
                    const active = (pendingRating || 0) >= i
                    return (
                      <button key={i} type="button" onClick={()=>setPendingRating(i)} className="focus:outline-none" aria-label={`Set rating ${i}`}>
                        <Star className={`h-7 w-7 ${active? 'text-yellow-400 fill-yellow-400':'text-gray-300'}`} />
                      </button>
                    )
                  })}
                </div>
                <span className="text-xs text-gray-600 font-medium">{pendingRating || 0}/5</span>
              </div>
            </div>
            <textarea
              className="w-full border rounded p-3 h-40 text-sm focus:outline-accent"
              placeholder="Share your experience (optional, but helps others)"
              value={reviewTextDraft}
              onChange={e=>setReviewTextDraft(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={()=>{setShowReviewModal(false); if(!myReview){setPendingRating(null); setReviewTextDraft('')}}}>Cancel</Button>
              <Button disabled={!pendingRating || submitting} onClick={async()=>{
                if(!pendingRating) return
                setSubmitting(true)
                try {
                  if(myReview){
                    await api.post('/review/edit-review', { company_id: companyId, rating: pendingRating, review_text: reviewTextDraft }, { headers: user?.token ? { Authorization: `Bearer ${user.token}` }: undefined })
                  } else {
                    await api.post('/review/review', { company_id: companyId, rating: pendingRating, review_text: reviewTextDraft }, { headers: user?.token ? { Authorization: `Bearer ${user.token}` }: undefined })
                  }
                  // Refresh list
                  const updated = await api.get(`/review/company/${companyId}`)
                  const data2 = updated.data?.reviews || []
                  setReviews(Array.isArray(data2)? data2: [])
                  setAverage(updated.data?.average_rating || 0)
                  setTotalRaters(updated.data?.total_raters || 0)
                  setTextualCount(updated.data?.count || 0)
                  const mine2 = data2.find((r:ReviewItem)=> r.user_id === user?.id)
                  setMyReview(mine2 || null)
                  setShowReviewModal(false)
                } catch(e){
                  console.error(e)
                } finally { setSubmitting(false) }
              }} className="bg-accent">{submitting? 'Saving...': myReview? 'Save Changes':'Submit Review'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
