"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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

export default function RegisterPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const searchParams = useSearchParams()
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
  const { isAuthenticated, user, hydrated } = useAuthStore()

  // Professional images (replace with your own assets if needed)
  const seekerImg = "/job-seeker-illustration.png"
  const employerImg = "/employer-illustration.png"

  // Initialize role from query param if present
  useEffect(() => {
    const qp = (searchParams?.get("role") || "").toLowerCase()
    if (qp === "employer" && role !== "employer") setRole("employer")
    if (["applicant", "job_seeker", "seeker"].includes(qp) && role !== "applicant") setRole("applicant")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Toggle role + reflect in URL for shareable deep link
  const handleRoleChange = (r: UserRole) => {
    if (r === role) return
    setRole(r)
    try {
      const params = new URLSearchParams(window.location.search)
      params.set("role", r === "applicant" ? "applicant" : "employer")
      const newUrl = `${window.location.pathname}?${params.toString()}`
      // shallow replace so back button isn't polluted
      router.replace(newUrl)
    } catch {}
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error when field is edited
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
      agreeTerms: checked,
    })
    // Clear error when checkbox is checked
    if (errors.agreeTerms) {
      setErrors({
        ...errors,
        agreeTerms: "",
      })
    }
  }

  const validateForm = () => {
    const validationErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) validationErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) validationErrors.lastName = "Last name is required"
    if (!formData.email.trim()) validationErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) validationErrors.email = "Email is invalid"
    if (!formData.password) validationErrors.password = "Password is required"
    else if (formData.password.length < 8) validationErrors.password = "Password must be at least 8 characters"
    if (formData.password !== formData.confirmPassword) validationErrors.confirmPassword = "Passwords do not match"
    if (!formData.agreeTerms) validationErrors.agreeTerms = "You must agree to the terms and conditions"
    setErrors(validationErrors)
    return { isValid: Object.keys(validationErrors).length === 0, validationErrors }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isLoading) return
    const { isValid, validationErrors } = validateForm()
    if (!isValid) {
      // Show each validation error as a toast (limit to first 4 to avoid spam)
      const messages = Object.values(validationErrors)
      messages.slice(0, 4).forEach((m, idx) => {
        // slight stagger to ensure ordering
        setTimeout(() => toast.error(m), idx * 60)
      })
      if (messages.length > 4) {
        setTimeout(() => toast.error(`${messages.length - 4} more validation errors...`), 5 * 60)
      }
      return
    }
    setIsLoading(true)
    try {
      let payload: any
      console.log("Role:", role)
      if (role === "applicant") {
        payload = {
          user_type: "job_seeker",
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
        }
      } else {
        payload = {
          user_type: "employer",
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
        }
      }
  // Register user
  await api.post("/auth/register", payload)
  toast.success("Account created successfully. Logging you in...")
      // Immediately log in the user
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        remember_me: true,
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
      // Defer navigation to next tick so Zustand state is committed before route change
      const target = !user.onboarding?.isComplete
        ? "/onboarding"
        : user.role === "employer" ? "/employer/dashboard" : "/dashboard"
      setTimeout(() => {
        try { router.replace(target) } catch {}
      }, 0)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user) return
    // Secondary safety navigation in case initial deferred redirect missed
    const expected = !user.onboarding?.isComplete
      ? "/onboarding"
      : user.role === "employer" ? "/employer/dashboard" : "/dashboard"
    // Avoid redundant navigation if already there
    if (window.location.pathname !== expected) {
      router.replace(expected)
    }
  }, [hydrated, isAuthenticated, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left or Right Image depending on role */}
        {role === "applicant" ? (
          <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-purple-100 to-purple-200 p-10 relative">
            {/* Blended illustration for job-seeker */}
            <div className="relative w-[320px] h-[320px] flex items-center justify-center soft-image-wrap">
              <Image
                src={seekerImg}
                alt="Job Seeker"
                width={320}
                height={320}
                className="object-contain soft-blend-img"
              />
            </div>
            <h2 className="mt-8 text-2xl font-bold text-purple-700">Find Your Dream Job</h2>
            <p className="mt-2 text-gray-600 text-center">Join thousands of job seekers landing their next opportunity.</p>
            <div className="mt-8">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleRoleChange("employer")}
                className="bg-white/70 backdrop-blur-sm hover:bg-white shadow-sm"
              >
                I'm an Employer
              </Button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-purple-100 to-purple-200 p-10 order-2 relative">
            {/* Blended illustration for employer */}
            <div className="relative w-[320px] h-[320px] flex items-center justify-center soft-image-wrap">
              <Image
                src={employerImg}
                alt="Employer"
                width={320}
                height={320}
                className="object-contain soft-blend-img"
              />
            </div>
            <h2 className="mt-8 text-2xl font-bold text-purple-700">Hire Top Talent</h2>
            <p className="mt-2 text-gray-600 text-center">Post jobs, manage applications, and grow your team with ease.</p>
            <div className="mt-8">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleRoleChange("applicant")}
                className="bg-white/70 backdrop-blur-sm hover:bg-white shadow-sm"
              >
                I'm a Job Seeker
              </Button>
            </div>
          </div>
        )}

        {/* Form Side */}
        <div className={`flex-1 flex flex-col justify-center items-center p-8 md:p-12 ${role === "applicant" ? "order-2" : "order-1"}`}>
          <div className="w-full max-w-md">
            <div className="mb-6 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-dark-gray">Register as {role === "applicant" ? "Job Seeker" : "Employer"}</h1>
                {/* Mobile role switch link */}
                <button
                  type="button"
                  onClick={() => handleRoleChange(role === "applicant" ? "employer" : "applicant")}
                  className="md:hidden text-xs text-accent underline font-medium"
                >
                  I'm a {role === "applicant" ? "Employer" : "Job Seeker"}
                </button>
              </div>
              <p className="text-gray-500 text-sm md:text-base">
                {role === "applicant"
                  ? "100% free. Apply, track applications & use resume tools at no cost."
                  : "First 5 job posts free. Upgrade only when you need more reach."}
              </p>
            </div>
            <form onSubmit={handleSubmit} noValidate className="space-y-4" role="form" aria-label="Registration form">
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
                <Label htmlFor="email">Email {role === "employer" && <span className="text-xs font-normal text-gray-400">(work)</span>}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={role === "applicant" ? "you@example.com" : "talent@yourcompany.com"}
                  value={formData.email}
                  onChange={handleChange}
                  aria-describedby="email-hint"
                />
                <p id="email-hint" className="text-[11px] text-gray-400 mt-1">
                  {role === "applicant" ? "Use a personal email you can access for updates." : "Use a company / role-based email for trust."}
                </p>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="agree-terms" checked={formData.agreeTerms} onCheckedChange={handleCheckboxChange} className="mt-1" />
                <div>
                  <Label htmlFor="agree-terms" className="text-sm font-normal">
                    I agree to the <Link href="/terms" className="text-accent hover:underline">Terms &amp; Privacy Policy</Link>
                  </Label>
                  {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>}
                </div>
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? (role === "applicant" ? "Creating Job Seeker Account..." : "Creating Employer Account...") : (role === "applicant" ? "Create Job Seeker Account" : "Create Employer Account")}
              </Button>
              <div className="text-center text-sm text-gray-500">
                Already have an account? <Link href="/auth/login" className="text-accent hover:underline">Sign in</Link>
              </div>
              <div className="text-[11px] text-gray-400 text-center mt-2">
                {role === "applicant" ? "You can switch to an employer account later if you start hiring." : "Employer accounts can also create a separate seeker profile if applying."}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}