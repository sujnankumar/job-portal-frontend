"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import type { UserRole } from "@/store/authStore"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    // If roles are specified and user's role is not included, redirect to appropriate dashboard
    if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
      if (user.role === "applicant") {
        router.push("/dashboard")
      } else if (user.role === "employer") {
        router.push("/employer/dashboard")
      }
    }
  }, [isAuthenticated, user, router, allowedRoles, pathname])

  // If authenticated and role is allowed (or no specific roles required), render children
  if (isAuthenticated && (!allowedRoles || (user?.role && allowedRoles.includes(user.role)))) {
    return <>{children}</>
  }

  // Return null while redirecting
  return null
}
