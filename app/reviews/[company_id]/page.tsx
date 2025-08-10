"use client"
import { useEffect, useState, use as usePromise } from 'react'
import api from '@/lib/axios'
import { Star, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const formatIST = (iso?: string) => {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      // Convert to IST offset (+5:30)
      const utc = d.getTime() + d.getTimezoneOffset() * 60000
      const istDate = new Date(utc + (5.5 * 60 * 60000))
      return istDate.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    } catch { return iso }
  }

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      setError(null)
      try {
  const res = await api.get(`/review/company/${companyId}`)
        const data = res.data?.reviews || []
        setReviews(Array.isArray(data) ? data : [])
      } catch (e: any) {
        setError(e?.response?.data?.detail || 'Failed to load reviews')
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [companyId])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark-gray">Company Reviews</h1>
        <Button variant="outline" asChild>
          <Link href={`/companies/${companyId}`}>Back to Company</Link>
        </Button>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-gray-600"><Loader2 className="h-5 w-5 animate-spin" /> Loading reviews...</div>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {!loading && reviews.length === 0 && <div className="text-gray-500">No reviews yet.</div>}
      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{r.user_name || 'Anonymous'}</div>
              <div className="flex items-center">
                {[1,2,3,4,5].map(i => <Star key={i} className={`h-4 w-4 ${i <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
              </div>
            </div>
            {r.review_text && <p className="text-gray-700 whitespace-pre-line">{r.review_text}</p>}
            <div className="text-xs text-gray-400 mt-2">{r.updated_at ? 'Updated ' + formatIST(r.updated_at) : formatIST(r.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
