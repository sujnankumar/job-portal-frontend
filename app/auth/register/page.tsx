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

export default function RegisterPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
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

  // Toggle role
  const handleRoleChange = (r: UserRole) => setRole(r)

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
            <div className="relative w-[320px] h-[320px] flex items-center justify-center">
              <Image
                src={seekerImg}
                alt="Job Seeker"
                width={320}
                height={320}
                className="object-contain rounded-2xl shadow-xl"
                style={{ zIndex: 2 }}
              />
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{
                  background: "radial-gradient(circle at 60% 60%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 60%, rgba(255,255,255,0) 100%)",
                  zIndex: 3,
                  mixBlendMode: "lighten",
                  filter: "blur(2px)"
                }}
              />
            </div>
            <h2 className="mt-8 text-2xl font-bold text-purple-700">Find Your Dream Job</h2>
            <p className="mt-2 text-gray-600 text-center">Join thousands of job seekers landing their next opportunity.</p>
            <div className="mt-8 flex gap-2">
              <Button variant="ghost" onClick={() => handleRoleChange("employer")}>I'm an Employer</Button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-purple-100 to-purple-200 p-10 order-2 relative">
            {/* Blended illustration for employer */}
            <div className="relative w-[320px] h-[320px] flex items-center justify-center">
              <Image
                src={employerImg}
                alt="Employer"
                width={320}
                height={320}
                className="object-contain rounded-2xl shadow-xl"
                style={{ zIndex: 2 }}
              />
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{
                  background: "radial-gradient(circle at 60% 60%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 60%, rgba(255,255,255,0) 100%)",
                  zIndex: 3,
                  mixBlendMode: "lighten",
                  filter: "blur(2px)"
                }}
              />
            </div>
            <h2 className="mt-8 text-2xl font-bold text-purple-700">Hire Top Talent</h2>
            <p className="mt-2 text-gray-600 text-center">Post jobs, manage applications, and grow your team with ease.</p>
            <div className="mt-8 flex gap-2">
              <Button variant="ghost" onClick={() => handleRoleChange("applicant")}>I'm a Job Seeker</Button>
            </div>
          </div>
        )}

        {/* Form Side */}
        <div className={`flex-1 flex flex-col justify-center items-center p-8 md:p-12 ${role === "applicant" ? "order-2" : "order-1"}`}>
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-dark-gray mb-2">Create an Account</h1>
            <p className="text-gray-500 mb-6">{role === "applicant" ? "Join our platform to find your dream job" : "Start hiring with the best job portal"}</p>
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
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder={role === "applicant" ? "you@example.com" : "company@example.com"} value={formData.email} onChange={handleChange} />
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
                    I agree to the <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
                  </Label>
                  {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>}
                </div>
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              <div className="text-center text-sm text-gray-500">
                Already have an account? <Link href="/auth/login" className="text-accent hover:underline">Sign in</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}