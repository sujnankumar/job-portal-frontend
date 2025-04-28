"use client"

import type React from "react"

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

export default function RegisterPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [role, setRole] = useState<UserRole>("applicant")
  const [formData, setFormData] = useState({
    name: "",
    firstName: "",
    lastName: "",
    jobPosition: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleRoleChange = (value: string) => {
    setRole(value as UserRole)
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
    const newErrors: Record<string, string> = {}

    if (role === "applicant") {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required"
      }
    } else {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required"
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required"
      }
      if (!formData.jobPosition.trim()) {
        newErrors.jobPosition = "Job position is required"
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    try {
      const res = await api.post("/auth/register", {
        user_type: "job_seeker",
        first_name: applicantForm.firstName,
        last_name: applicantForm.lastName,
        email: applicantForm.email,
        password: applicantForm.password,
      })
      const user = res.data
      console.log(res.data)
      // login({
      //   id: user.user_id,
      //   name: user.first_name + " " + user.last_name,
      //   email: user.email,
      //   role: (user.user_type === "job_seeker") ? "applicant" : "employer",
      //   avatar: "/mystical-forest-spirit.png",
      // })
      router.push("/auth/login")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // In a real app, you would make an API call to register
      // For now, we'll simulate a successful registration
      setTimeout(() => {
        // Mock user data
        const user = {
          id: "1",
          name: role === "applicant" ? formData.name : `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          role: role,
          jobPosition: role === "employer" ? formData.jobPosition : undefined,
          avatar: role === "applicant" ? "/mystical-forest-spirit.png" : "/abstract-circuit-board.png",
          onboarding: {
            isComplete: false, // Default to incomplete
            lastStep: 0,
            startedAt: new Date().toISOString(),
          },
        }

        login(user)

        // Redirect to onboarding
        router.push("/onboarding")

        setIsLoading(false)
      }, 1000)
    } catch (err) {
      console.error("Registration error:", err)
      setErrors({
        form: "An error occurred during registration. Please try again.",
      })
      const user = res.data
      console.log(res.data)
      // login({
      //   id: user.user_id,
      //   name: user.company_name,
      //   email: user.email,
      //   role: "employer",
      //   avatar: "/abstract-circuit-board.png",
      // })
      router.push("/auth/login")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-dark-gray">Create an Account</h1>
        <p className="text-gray-500 mt-2">Join our platform to find your dream job</p>
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
              {role === "applicant" ? (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobPosition">Job Position</Label>
                    <Input
                      id="jobPosition"
                      name="jobPosition"
                      placeholder="HR Manager"
                      value={formData.jobPosition}
                      onChange={handleChange}
                    />
                    {errors.jobPosition && <p className="text-red-500 text-xs mt-1">{errors.jobPosition}</p>}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={role === "applicant" ? "you@example.com" : "company@example.com"}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agree-terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={handleCheckboxChange}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="agree-terms" className="text-sm font-normal">
                    I agree to the{" "}
                    <Link href="/terms" className="text-accent hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-accent hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                  {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>}
                </div>
              </div>

              {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-accent hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </Tabs>
      </div>
    </div>
  )
}