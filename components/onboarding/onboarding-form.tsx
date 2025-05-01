"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import ApplicantBasicInfo from "./steps/applicant-basic-info"
import ApplicantSkills from "./steps/applicant-skills"
import ApplicantEducation from "./steps/applicant-education"
import ApplicantExperience from "./steps/applicant-experience"
import ApplicantResume from "./steps/applicant-resume"
import EmployerBasicInfo from "./steps/employer-basic-info"
import EmployerCompanyDetails from "./steps/employer-company-details"
import api from "@/lib/axios"

interface OnboardingFormProps {
  userRole: "applicant" | "employer" | null
}

type Step = { name: string; component: React.FC<any>; key: string }

export default function OnboardingForm({ userRole }: OnboardingFormProps) {
  const router = useRouter()
  const {
    updateOnboardingStatus,
    updateOnboardingData,
    updateValidationStatus,
    completeOnboarding,
    user,
  } = useAuthStore()

  const [formData, setFormData] = useState<any>(user?.onboarding?.formData || {})
  const [currentStep, setCurrentStep] = useState(user?.onboarding?.lastStep || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Helper to derive steps based on role and data
  const computeSteps = (role: string | null, data: any): Step[] => {
    if (role === "applicant") {
      return [
        { name: "Basic Info", component: ApplicantBasicInfo, key: "basicInfo" },
        { name: "Skills", component: ApplicantSkills, key: "skills" },
        { name: "Education", component: ApplicantEducation, key: "education" },
        { name: "Experience", component: ApplicantExperience, key: "experience" },
        { name: "Resume", component: ApplicantResume, key: "resume" },
      ]
    } else {
      const base: Step[] = [
        { name: "Basic Info", component: EmployerBasicInfo, key: "basicInfo" },
      ]
      return data.isNewCompany
        ? [...base, { name: "Company Details", component: EmployerCompanyDetails, key: "companyDetails" }]
        : base
    }
  }

  // Memorize steps for rendering
  const steps = useMemo(() => computeSteps(userRole, formData), [userRole, formData.isNewCompany])

  // Load validation errors from store
  useEffect(() => {
    if (user?.onboarding?.validationMessages) {
      const errors = Object.values(user.onboarding.validationMessages)
      setValidationErrors(errors as string[])
    }
  }, [user?.onboarding?.validationMessages])

  const CurrentStepComponent = steps[currentStep]?.component
  const currentStepKey = steps[currentStep]?.key

  const validateCurrentStep = (stepData: any): boolean => {
    let isValid = true
    const errors: string[] = []

    if (currentStepKey === "basicInfo") {
      if (userRole === "employer" && !stepData.jobPosition?.trim()) {
        isValid = false
        errors.push("Please provide a Job Position")
      }
      if (userRole === "applicant" && !stepData.headline?.trim()) {
        isValid = false
        errors.push("Please provide a Headline")
      }
      if (!stepData.bio?.trim()) {
        isValid = false
        if (userRole === "employer") {
          errors.push("Please provide your Role Description")
        } else {
          errors.push("Please provide a Professional Bio")
        }
      }
    }

    if (currentStepKey === "skills" && Array.isArray(stepData.skills)) {
      const hasValidSkill = stepData.skills.some(
        (skill: any) => skill.name?.trim()
      )
      if (!hasValidSkill) {
        isValid = false
        errors.push("Please add at least one skill")
      }
    }

    if (currentStepKey === "education" && Array.isArray(stepData.education)) {
      const hasValidEducation = stepData.education.some(
        (edu: any) => edu.school?.trim() && edu.degree?.trim()
      )
      if (!hasValidEducation) {
        isValid = false
        errors.push(
          "Please add at least one education entry with school and degree"
        )
      }
    }

    if (currentStepKey === "experience") {
      if (stepData.isFresher) {
        // valid
      } else if (Array.isArray(stepData.experience)) {
        const hasValidExperience = stepData.experience.some(
          (exp: any) => exp.company?.trim() && exp.title?.trim()
        )
        if (!hasValidExperience) {
          isValid = false
          errors.push(
            "Please add at least one work experience with company and job title or mark as fresher"
          )
        }
      } else {
        isValid = false
      }
    }

    updateValidationStatus(
      currentStepKey,
      isValid,
      isValid ? "" : errors[0]
    )
    setValidationErrors(errors)

    return isValid
  }

  const handleNext = (stepData: any) => {
    // Merge new data, update state & store
    const updatedData = { ...formData, ...stepData }
    setFormData(updatedData)
    updateOnboardingData(updatedData)

    // Recompute steps based on updated data
    const updatedSteps = computeSteps(userRole, updatedData)

    // Validate before moving on
    const isValid = validateCurrentStep(stepData)
    if (!isValid) return

    if (currentStep < updatedSteps.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      updateOnboardingStatus({ lastStep: nextStep })
    } else {
      handleSubmit(updatedData)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      updateOnboardingStatus({ lastStep: prevStep })
    }
  }

  const handleSubmit = async (finalData: any) => {
    setIsSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 1500))
      let logoFileId = null
      let logoFile = null
      if (userRole === "employer" && finalData.logo && finalData.logo instanceof File) {
        logoFile = finalData.logo
      }
      let dataToSend = { ...finalData }
      if (logoFile) {
        // Upload logo first
        const logoForm = new FormData()
        logoForm.append("file", logoFile)
        const logoRes = await api.post("/auth/onboarding/logo", logoForm, {
          headers: { Authorization: `Bearer ${user?.token}` ,
                    "Content-Type": "multipart/form-data"}
        })
        logoFileId = logoRes.data.logo_file_id
        // Remove logo file from data, add logo_file_id
        dataToSend = {
          ...finalData,
          companyDetails: { ...finalData.companyDetails },
        }
        delete dataToSend.companyDetails.logo
        dataToSend.companyDetails.logo_file_id = logoFileId
      }
      // Flatten companyDetails into root for backend compatibility
      if (dataToSend.companyDetails) {
        dataToSend = { ...dataToSend, ...dataToSend.companyDetails }
        delete dataToSend.companyDetails
      }
      if (user) {
        console.log(dataToSend)
        const response = await api.post(
          "/auth/onboarding",
          dataToSend,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
        )
        if (!response.data) throw new Error("Failed to complete onboarding")
        completeOnboarding()
        console.log("Onboarding completed:", response.data)
      } else {
        router.push("/auth/login")
      }
      const redirect = userRole === "applicant" ? "/dashboard" : "/employer/dashboard"
      router.push(redirect)
    } catch (err) {
      console.error(err)
      setValidationErrors([
        "There was an error submitting your information. Please try again.",
      ])
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm">
            <span>
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.name}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {CurrentStepComponent && (
          <>
            
            <CurrentStepComponent onNext={handleNext} data={formData} />
            
          </>
        )}
          <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
            >
              Back
            </Button>
      </div>
    </div>
  )
}
