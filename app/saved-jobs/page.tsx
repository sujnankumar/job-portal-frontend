"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import OnboardingMiddleware from "@/components/auth/onboarding-middleware"
import JobListings from "@/components/job-listings"
import { motion } from "framer-motion"
import type { JobFiltersState } from "@/components/job-filters"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

function ExpiredToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  // Stable sizes (track 56x28, knob 20x20) with inner horizontal padding 4px
  const knobTranslate = value ? 28 : 0 // (56 - 8 padding - 20 knob)
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="group inline-flex items-center gap-3 select-none"
      data-state={value ? 'on' : 'off'}
        aria-label={value ? 'showing expired jobs' : 'show expired jobs'}
    >
      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
          {value ? 'showing expired jobs' : 'show expired jobs'}
      </span>
      <div className="relative h-7 w-14 flex items-center">
        <div
          className={`absolute inset-0 rounded-full border transition-colors duration-300 ${
            value ? 'bg-accent/90 border-accent/70' : 'bg-gray-300 border-gray-300'
          } shadow-inner overflow-hidden`}
        />
        <div className="relative h-full w-full flex items-center px-1">
          <motion.div
            initial={false}
            animate={{ x: knobTranslate }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="h-5 w-5 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-[11px] font-semibold text-accent"
          >
            {value && (
              <motion.span
                key="tick"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                ✓
              </motion.span>
            )}
          </motion.div>
        </div>
        <span className="absolute inset-0 rounded-full pointer-events-none group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent" />
      </div>
    </button>
  )
}

export default function SavedJobsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const [showExpired, setShowExpired] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  // If an employer somehow lands here, redirect them to their dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === "employer") {
      router.replace("/employer/dashboard")
    }
  }, [isAuthenticated, user, router])

  // Memoize filters so JobListings only re-renders for meaningful search changes
  const filters: JobFiltersState = useMemo(() => ({
    jobTypes: [],
    experienceLevels: [],
    salaryRange: [0, 20],
    location: "",
    industries: [],
    skills: [],
    locationTypes: [],
    search: searchTerm.trim(),
    booleanQuery: "",
  }), [searchTerm])

  return (
    <OnboardingMiddleware>
      <ProtectedRoute allowedRoles={["applicant"]}>
        <div className="container mx-auto max-w-6xl py-8 px-4">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-3xl font-bold text-dark-gray">Saved Jobs</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search saved jobs..."
                    className="pl-9 h-10 text-sm"
                    aria-label="Search saved jobs"
                  />
                </div>
                <ExpiredToggle value={showExpired} onChange={setShowExpired} />
              </div>
            </div>
          </div>
          <JobListings savedJobsOnly={true} showExpired={showExpired} filters={filters} />
        </div>
      </ProtectedRoute>
    </OnboardingMiddleware>
  )
}
