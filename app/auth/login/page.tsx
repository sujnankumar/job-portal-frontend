"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuthStore } from "@/store/authStore"
import type { UserRole } from "@/store/authStore"
import api from "@/lib/axios"
import { DEFAULT_USER_AVATAR } from "@/lib/placeholders"
import { toast } from "sonner"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { isAuthenticated, user, hydrated } = useAuthStore()

  // Professional illustration (replace with your own asset if needed)
  const loginImg = "/login-illustration.png"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      rememberMe: checked,
    })
  }

  const validateForm = () => {
    const validationErrors: Record<string, string> = {}
    if (!formData.email.trim()) validationErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) validationErrors.email = "Email is invalid"
    if (!formData.password) validationErrors.password = "Password is required"
    else if (formData.password.length < 6) validationErrors.password = "Password must be at least 6 characters"
    setErrors(validationErrors)
    return { isValid: Object.keys(validationErrors).length === 0, validationErrors }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isLoading) return
    const { isValid, validationErrors } = validateForm()
    if (!isValid) {
      const messages = Object.values(validationErrors)
      messages.slice(0, 4).forEach((m, idx) => setTimeout(() => toast.error(m), idx * 60))
      if (messages.length > 4) setTimeout(() => toast.error(`${messages.length - 4} more validation errors...`), 5 * 60)
      return
    }
    setIsLoading(true)
    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        remember_me: formData.rememberMe
      })
      const { access_token, token_type, onboarding } = response.data
      const userRes = await api.get("/user/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      const userData = userRes.data
      const user = {
        id: userData.user_id || userData.id || "",
        name: userData.first_name && userData.last_name
          ? `${userData.first_name} ${userData.last_name}`
          : userData.company_name || userData.name || formData.email,
        email: userData.email,
        role: userData.user_type === "employer" ? ("employer" as UserRole) : ("applicant" as UserRole),
        avatar: userData.avatar || DEFAULT_USER_AVATAR,
        onboarding: onboarding || {
          isComplete: false,
          lastStep: 0,
          startedAt: new Date().toISOString(),
        },
        token: access_token,
      }
      login(user)
      toast.success("Signed in successfully")
      if (!user.onboarding?.isComplete) {
        router.push("/onboarding");
      } else if (user.role === "applicant") {
        router.push("/dashboard");
      } else {
        router.push("/employer/dashboard");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
        err?.message ||
        "Invalid email or password"
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!hydrated) return
    if (isAuthenticated) {
      if (!user?.onboarding?.isComplete) {
        router.push("/onboarding")
      } else if (user?.role === "employer") {
        router.push("/employer/dashboard")
      } else {
        router.push("/dashboard")
      }
    }
  }, [hydrated, isAuthenticated, user, router])

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white px-4 pt-0 pb-2">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Illustration Side */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-purple-100 to-purple-200 p-10 relative">
          <div className="relative w-[320px] h-[320px] flex items-center justify-center soft-image-wrap">
            <Image
              src={loginImg}
              alt="Login"
              width={320}
              height={320}
              className="object-contain soft-blend-img"
              priority
            />
          </div>
          <h2 className="mt-8 text-2xl font-bold text-purple-700">Welcome Back!</h2>
          <p className="mt-2 text-gray-600 text-center">Sign in to access your dashboard and opportunities.</p>
        </div>
        {/* Form Side */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-dark-gray mb-2">Sign In</h1>
            <p className="text-gray-500 mb-6">Enter your credentials to continue</p>
            <form onSubmit={handleSubmit} noValidate className="space-y-4" role="form" aria-label="Login form">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
                </div>
                <Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" checked={formData.rememberMe} onCheckedChange={handleCheckboxChange} />
                <Label htmlFor="remember-me" className="text-sm font-normal">Remember me for 30 days</Label>
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-center text-sm text-gray-500">
                Don't have an account? <Link href="/auth/register" className="text-accent hover:underline">Register now</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}