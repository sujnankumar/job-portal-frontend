"use client"

import type React from "react"
import { useEffect } from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuthStore } from "@/store/authStore"
import type { UserRole } from "@/store/authStore"
import api from "@/lib/axios"

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [role, setRole] = useState<UserRole>("applicant")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { isAuthenticated, user, hydrated } = useAuthStore()

  const handleRoleChange = (value: string) => {
    if (role === "applicant") {
      setRole("employer")
    } else {
      setRole("applicant")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      rememberMe: checked,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Call the backend login API
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        remember_me: formData.rememberMe
      })
      const { access_token, token_type, onboarding } = response.data
      console.log("Type of access token:", token_type)

      // Optionally, fetch user profile info after login
      const userRes = await api.get("/user/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      const userData = userRes.data

      // Compose user object for the store
      const user = {
        id: userData.user_id || userData.id || "",
        name: userData.first_name && userData.last_name
          ? `${userData.first_name} ${userData.last_name}`
          : userData.company_name || userData.name || formData.email,
        email: userData.email,
        role: userData.user_type === "employer" ? "employer" as UserRole : "applicant" as UserRole,
        avatar: userData.avatar || (userData.user_type === "employer"
          ? "/abstract-circuit-board.png"
          : "/mystical-forest-spirit.png"),
        onboarding: onboarding || {
          isComplete: false,
          lastStep: 0,
          startedAt: new Date().toISOString(),
        },
        token: access_token,
      }

      login(user)

      // Redirect based on role
      if (!user.onboarding?.isComplete) {
        router.push("/onboarding");
      } else if (user.role === "applicant") {
        router.push("/dashboard");
      } else {
        router.push("/employer/dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.message ||
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
    <div className="container mx-auto max-w-md py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-dark-gray">Welcome Back</h1>
        <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <Tabs defaultValue="applicant" onValueChange={handleRoleChange}>
          <TabsList className="w-full border-b rounded-t-xl rounded-b-none p-0">
            <TabsTrigger
              value="applicant"
              className="flex-1 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none py-3"
            >
              Job Seeker
            </TabsTrigger>
            <TabsTrigger
              value="employer"
              className="flex-1 rounded-tr-xl rounded-tl-none rounded-bl-none rounded-br-none py-3"
            >
              Employer
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={role === "applicant" ? "you@example.com" : "company@example.com"}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-accent hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" checked={formData.rememberMe} onCheckedChange={handleCheckboxChange} />
                <Label htmlFor="remember-me" className="text-sm font-normal">
                  Remember me for 30 days
                </Label>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-accent hover:underline">
                  Register now
                </Link>
              </div>
            </form>
          </div>
        </Tabs>
      </div>
    </div>
  )
}