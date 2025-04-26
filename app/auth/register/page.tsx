"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/store/authStore"
import type { UserRole } from "@/store/authStore"
import api from "@/lib/axios"

export default function RegisterPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [role, setRole] = useState<UserRole>("applicant")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [applicantForm, setApplicantForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })

  const [employerForm, setEmployerForm] = useState({
    companyName: "",
    industry: "",
    website: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })

  const handleRoleChange = (value: string) => {
    setRole(value as UserRole)
  }

  const handleApplicantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setApplicantForm({
      ...applicantForm,
      [name]: value,
    })
  }

  const handleEmployerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmployerForm({
      ...employerForm,
      [name]: value,
    })
  }

  const handleApplicantCheckboxChange = (checked: boolean) => {
    setApplicantForm({
      ...applicantForm,
      agreeTerms: checked,
    })
  }

  const handleEmployerCheckboxChange = (checked: boolean) => {
    setEmployerForm({
      ...employerForm,
      agreeTerms: checked,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setEmployerForm({
      ...employerForm,
      [name]: value,
    })
  }

  const handleApplicantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (applicantForm.password !== applicantForm.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
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
      login({
        id: user.user_id,
        name: user.first_name + " " + user.last_name,
        email: user.email,
        role: (user.user_type === "job_seeker") ? "applicant" : "employer",
        avatar: "/mystical-forest-spirit.png",
      })
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmployerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (employerForm.password !== employerForm.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const res = await api.post("/auth/register", {
        user_type: "employer",
        first_name: employerForm.firstName,
        last_name: employerForm.lastName,
        email: employerForm.email,
        password: employerForm.password,
        company_name: employerForm.companyName,
        industry: employerForm.industry,
        website: employerForm.website,
        job_title: employerForm.jobTitle,
      })
      const user = res.data
      console.log(res.data)
      login({
        id: user.user_id,
        name: user.company_name,
        email: user.email,
        role: "employer",
        avatar: "/abstract-circuit-board.png",
      })
      router.push("/employer/dashboard")
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
        <p className="text-gray-500 mt-2">Join our community and start your journey</p>
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

          <TabsContent value="applicant" className="p-6">
            <form onSubmit={handleApplicantSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={applicantForm.firstName}
                    onChange={handleApplicantChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={applicantForm.lastName}
                    onChange={handleApplicantChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={applicantForm.email}
                  onChange={handleApplicantChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={applicantForm.password}
                  onChange={handleApplicantChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={applicantForm.confirmPassword}
                  onChange={handleApplicantChange}
                  required
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={applicantForm.agreeTerms}
                  onCheckedChange={handleApplicantCheckboxChange}
                  className="mt-1"
                />
                <Label htmlFor="agreeTerms" className="text-sm font-normal">
                  I agree to the{" "}
                  <Link href="/terms" className="text-accent hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90"
                disabled={isLoading || !applicantForm.agreeTerms}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-accent hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="employer" className="p-6">
            <form onSubmit={handleEmployerSubmit} className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium text-dark-gray">Company Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Your Company Name"
                    value={employerForm.companyName}
                    onChange={handleEmployerChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={employerForm.industry}
                    onValueChange={(value) => handleSelectChange("industry", value)}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Company Website</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://yourcompany.com"
                    value={employerForm.website}
                    onChange={handleEmployerChange}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-dark-gray">Contact Person</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="First Name"
                      value={employerForm.firstName}
                      onChange={handleEmployerChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Last Name"
                      value={employerForm.lastName}
                      onChange={handleEmployerChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    placeholder="Your Position"
                    value={employerForm.jobTitle}
                    onChange={handleEmployerChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@yourcompany.com"
                    value={employerForm.email}
                    onChange={handleEmployerChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-dark-gray">Account Security</h3>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={employerForm.password}
                    onChange={handleEmployerChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={employerForm.confirmPassword}
                    onChange={handleEmployerChange}
                    required
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="agreeTerms"
                  checked={employerForm.agreeTerms}
                  onCheckedChange={handleEmployerCheckboxChange}
                  className="mt-1"
                />
                <Label htmlFor="agreeTerms" className="text-sm font-normal">
                  I agree to the{" "}
                  <Link href="/terms" className="text-accent hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90"
                disabled={isLoading || !employerForm.agreeTerms}
              >
                {isLoading ? "Creating Account..." : "Create Employer Account"}
              </Button>

              <div className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-accent hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
