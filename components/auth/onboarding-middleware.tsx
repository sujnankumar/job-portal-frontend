"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { toast } from "@/components/ui/use-toast"

// Paths that are exempt from onboarding redirection
const EXEMPT_PATHS = ["/onboarding", "/auth/login", "/auth/register", "/auth/forgot-password"]

export default function OnboardingMiddleware({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only check if user is authenticated
    if (!isAuthenticated || !user) return

    // Check if current path is exempt
    const isExemptPath = EXEMPT_PATHS.some((path) => pathname.startsWith(path))
    if (isExemptPath) return

    // If onboarding is not complete, redirect to onboarding
    if (!user.onboarding?.isComplete) {
      // Show toast notification to inform the user
      toast({
        title: "Complete your profile",
        description: "Please complete your profile to access all features.",
        duration: 5000,
      })

      console.log("Redirecting to onboarding page - onboarding not complete")
      router.push("/onboarding")
    }
  }, [isAuthenticated, user, router, pathname])

  return <>{children}</>
}