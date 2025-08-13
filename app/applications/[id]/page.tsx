"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function DeprecatedApplicationDetails() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login')
      return
    }
    if (user?.role === 'employer') router.replace('/employer/dashboard')
    else router.replace('/dashboard')
  }, [isAuthenticated, user, router])

  return <div className="py-24 text-center text-gray-500">Redirecting...</div>
}