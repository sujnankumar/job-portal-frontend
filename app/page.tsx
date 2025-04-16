"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import HomePage from "@/components/home-page"

export default function Home() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "applicant") {
        router.push("/dashboard")
      } else if (user?.role === "employer") {
        router.push("/employer/dashboard")
      }
    }
  }, [isAuthenticated, user, router])

  return <HomePage />
}
