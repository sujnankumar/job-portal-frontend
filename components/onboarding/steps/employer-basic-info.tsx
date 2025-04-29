"use client"

import type React from "react"
import { useState, useEffect } from "react" // Import useEffect
import api from "@/lib/axios" // Import your configured axios instance

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Loader2 } from "lucide-react" // Import Loader2 for loading state

interface Company {
  company_id: string; // Or number
  company_name: string;
}

interface BasicInfoData {
  jobPosition: string
  businessPhone: string // Added phone
  businessEmail: string // Added email
  location: string
  website: string
  linkedin: string
  github: string
  bio: string
  companyId: string
  companyName: string
  isNewCompany: boolean
}

interface EmployerBasicInfoProps {
  data: any
  onNext: (data: BasicInfoData) => void
}

export default function EmployerBasicInfo({ data = {}, onNext }: EmployerBasicInfoProps) {
  // Initialize data with default values if not provided
  const [formData, setFormData] = useState<BasicInfoData>({
    jobPosition: data.jobPosition || "",
    businessPhone: data?.businessPhone || "",
    businessEmail: data?.businessEmail || "",
    location: data.location || "",
    website: data.website || "",
    linkedin: data.linkedin || "",
    github: data.github || "",
    bio: data.bio || "",
    companyId: data.companyId || "",
    companyName: data.companyName || "",
    isNewCompany: data.isNewCompany || false,
  })

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [companyError, setCompanyError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      setCompanyError(null);
      try {
        // *** Replace with your actual API endpoint for fetching companies ***
        const response = await api.get("/company/all"); // Example endpoint
        if (Array.isArray(response.data)) {
          setCompanies(response.data);
        } else {
          // Adjust based on your API response structure, e.g., response.data.companies
          console.error("Unexpected company data structure:", response.data);
          setCompanyError("Failed to load company list.");
          setCompanies([]);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanyError("Could not fetch company list. Please try again later.");
        setCompanies([]);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []); // Empty dependency array ensures this runs only once

  // Update the handleChange function to use local state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle company selection
  const handleCompanySelect = (value: string) => {
    if (value === "new") {
      setFormData({
        ...formData,
        companyId: "",
        companyName: "", // Reset company name when selecting 'new'
        isNewCompany: true,
      })
    } else {
      // Find company from the fetched list, ensuring type consistency for comparison
      const selectedCompany = companies.find((company) => String(company.company_id) === value)
      setFormData({
        ...formData,
        companyId: value,
        companyName: selectedCompany?.company_name || "", // Use fetched name
        isNewCompany: false,
      })
    }
  }

  // Handle new company name change
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      companyName: e.target.value,
    })
  }

  // Add a submit handler to pass data to parent
  const handleSubmit = () => {
    onNext(formData)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-dark-gray">Contact Information</h2>
        <p className="text-sm text-gray-500">
          Let's start with some basic information about you as the company representative
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
          {/* Handle loading and error states for the Select */}
          {isLoadingCompanies ? (
            <div className="flex items-center justify-center h-10 border rounded-md bg-gray-50">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : companyError ? (
            <div className="text-red-600 text-sm border border-red-200 p-2 rounded-md bg-red-50">
              {companyError}
            </div>
          ) : (
            <Select
              value={formData.isNewCompany ? "new" : formData.companyId}
              onValueChange={handleCompanySelect}
              disabled={isLoadingCompanies || !!companyError} // Disable if loading or error
            >
              <SelectTrigger id="company">
                <SelectValue placeholder="Select your company" />
              </SelectTrigger>
              <SelectContent>
                {/* Map over fetched companies */}
                {companies.map((company) => (
                  <SelectItem key={company.company_id} value={String(company.company_id)}> {/* Ensure value is string */}
                    {company.company_name}
                  </SelectItem>
                ))}
                <SelectItem value="new" className="text-accent font-medium">
                  <div className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add a new company
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {formData.isNewCompany && (
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Enter your company name"
              value={formData.companyName}
              onChange={handleCompanyNameChange}
              className="mt-1"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="jobPosition">
            Your Job Position <span className="text-red-500">*</span>
          </Label>
          <Input
            id="jobPosition"
            name="jobPosition"
            placeholder="e.g., HR Manager, Talent Acquisition Specialist"
            value={formData.jobPosition}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="businessPhone">Business Phone <span className="text-red-500">*</span></Label>
          <Input
            id="businessPhone"
            name="businessPhone"
            type="tel"
            placeholder="(555) 123-4567"
            value={formData.businessPhone}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="businessEmail">Contact Email <span className="text-red-500">*</span></Label>
          <Input
            id="businessEmail"
            name="businessEmail"
            type="email"
            placeholder="e.g., contact@company.com"
            value={formData.businessEmail}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="location">Office Location <span className="text-red-500">*</span></Label>
          <Input
            id="location"
            name="location"
            placeholder="City, State"
            value={formData.location}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            name="linkedin"
            placeholder="linkedin.com/in/username"
            value={formData.linkedin}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="bio">Your Role Description <span className="text-red-500">*</span></Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Briefly describe your role in the hiring process..."
            value={formData.bio}
            onChange={handleChange}
            className="mt-1 min-h-[120px]"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSubmit}>Continue</Button>
      </div>
    </div>
  )
}