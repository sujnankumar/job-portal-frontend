"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"

// Paths exempt from onboarding enforcement
const EXEMPT_PATHS = [
  "/onboarding",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
]

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
      toast.warning("Onboarding required", {
        description: "Complete onboarding to access the dashboard.",
        duration: 5000,
      })
      router.push("/onboarding")
    }
  }, [isAuthenticated, user, router, pathname])

  return <>{children}</>
}