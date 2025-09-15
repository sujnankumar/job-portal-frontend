"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthStore } from "@/store/authStore"
import type { UserRole } from "@/store/authStore"
import api from "@/lib/axios"
import { DEFAULT_USER_AVATAR } from "@/lib/placeholders"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore((s) => s.login)
  const { isAuthenticated, user, hydrated } = useAuthStore()

  const [role, setRole] = useState<UserRole>("applicant")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Initialize role from query string once
  useEffect(() => {
    const qp = (searchParams?.get("role") || "").toLowerCase()
    if (qp === "employer") setRole("employer")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRoleChange = (value: string) => {
    const r = value === "employer" ? "employer" : "applicant"
    if (r === role) return
    setRole(r)
    try {
      const params = new URLSearchParams(window.location.search)
      params.set("role", r)
      router.replace(`${window.location.pathname}?${params.toString()}`)
    } catch {}
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: "" })
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, agreeTerms: checked })
    if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: "" })
  }

  const validateForm = () => {
    const v: Record<string, string> = {}
    if (!formData.firstName.trim()) v.firstName = "First name is required"
    if (!formData.lastName.trim()) v.lastName = "Last name is required"
    if (!formData.email.trim()) v.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) v.email = "Email is invalid"
    if (!formData.password) v.password = "Password is required"
    else if (formData.password.length < 8) v.password = "Password must be at least 8 characters"
    if (formData.password !== formData.confirmPassword) v.confirmPassword = "Passwords do not match"
    if (!formData.agreeTerms) v.agreeTerms = "You must agree to the terms"
    setErrors(v)
    return { isValid: Object.keys(v).length === 0, v }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    const { isValid, v } = validateForm()
    if (!isValid) {
      const msgs = Object.values(v)
      msgs.slice(0, 4).forEach((m, i) => setTimeout(() => toast.error(m), i * 50))
      if (msgs.length > 4) setTimeout(() => toast.error(`${msgs.length - 4} more validation errors...`), 250)
      return
    }
    setIsLoading(true)
    try {
      const payload = {
        user_type: role === "employer" ? "employer" : "job_seeker",
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
      }
      await api.post("/auth/register", payload)
      toast.success("Account created. Logging you in...")
      const loginRes = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        remember_me: true,
      })
      const { access_token, onboarding } = loginRes.data
      const meRes = await api.get("/user/me", { headers: { Authorization: `Bearer ${access_token}` } })
      const ud = meRes.data
      const newUser = {
        id: ud.user_id || ud.id || "",
        name: ud.first_name && ud.last_name ? `${ud.first_name} ${ud.last_name}` : ud.company_name || ud.name || formData.email,
        email: ud.email,
        role: ud.user_type === "employer" ? ("employer" as UserRole) : ("applicant" as UserRole),
        avatar: ud.avatar || DEFAULT_USER_AVATAR,
        onboarding: onboarding || { isComplete: false, lastStep: 0, startedAt: new Date().toISOString() },
        token: access_token,
      }
      login(newUser)
      const target = !newUser.onboarding?.isComplete
        ? "/onboarding"
        : newUser.role === "employer" ? "/employer/dashboard" : "/dashboard"
      router.replace(target)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user) return
    const target = !user.onboarding?.isComplete
      ? "/onboarding"
      : user.role === "employer" ? "/employer/dashboard" : "/dashboard"
    if (window.location.pathname !== target) router.replace(target)
  }, [hydrated, isAuthenticated, user, router])

  return (
    <div className="container mx-auto max-w-md py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-dark-gray">Create an Account</h1>
        <p className="text-gray-500 mt-2">Join our platform to find your dream job</p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
  <Tabs defaultValue={role as string} onValueChange={handleRoleChange}>
          <TabsList className="w-full border-b rounded-t-xl rounded-b-none p-0">
            <TabsTrigger value="applicant" className="flex-1 rounded-tl-xl rounded-tr-none py-3">Job Seeker</TabsTrigger>
            <TabsTrigger value="employer" className="flex-1 rounded-tr-xl rounded-tl-none py-3">Employer</TabsTrigger>
          </TabsList>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder={role === "applicant" ? "you@example.com" : "company@example.com"} value={formData.email} onChange={handleChange} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirm(p => !p)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="agree-terms" checked={formData.agreeTerms} onCheckedChange={handleCheckboxChange} className="mt-1" />
                <div>
                  <Label htmlFor="agree-terms" className="text-sm font-normal">
                    I agree to the <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
                  </Label>
                  {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center text-sm text-gray-500">
                Already have an account? {" "}
                <Link href="/auth/login" className="text-accent hover:underline">Sign in</Link>
              </div>
            </form>
          </div>
        </Tabs>
      </div>
    </div>
  )
}