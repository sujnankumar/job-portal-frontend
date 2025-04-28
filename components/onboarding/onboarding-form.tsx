"use client"

import { useState, useMemo, useEffect } from "react"
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
import EmployerTeam from "./steps/employer-team"

interface OnboardingFormProps {
  userRole: "applicant" | "employer" | null
}

export default function OnboardingForm({ userRole }: OnboardingFormProps) {
  const router = useRouter()
  const { updateOnboardingStatus, updateOnboardingData, updateValidationStatus, completeOnboarding, user } =
    useAuthStore()

  // Initialize form data from persisted state
  const [formData, setFormData] = useState<any>(user?.onboarding?.formData || {})
  const [currentStep, setCurrentStep] = useState(user?.onboarding?.lastStep || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Define steps based on user role and form data
  const steps = useMemo(() => {
    if (userRole === "applicant") {
      return [
        { name: "Basic Info", component: ApplicantBasicInfo, key: "basicInfo" },
        { name: "Skills", component: ApplicantSkills, key: "skills" },
        { name: "Education", component: ApplicantEducation, key: "education" },
        { name: "Experience", component: ApplicantExperience, key: "experience" },
        { name: "Resume", component: ApplicantResume, key: "resume" },
      ]
    } else {
      // For employers, conditionally include company details step
      const baseSteps = [
        { name: "Basic Info", component: EmployerBasicInfo, key: "basicInfo" },
        { name: "Team", component: EmployerTeam, key: "team" },
      ]

      // Only include company details step if creating a new company
      if (formData.isNewCompany) {
        return [
          baseSteps[0],
          { name: "Company Details", component: EmployerCompanyDetails, key: "companyDetails" },
          baseSteps[1],
        ]
      }

      return baseSteps
    }
  }, [userRole, formData.isNewCompany])

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

    // Basic validation based on step type
    if (currentStepKey === "basicInfo") {
      if (!stepData.headline || stepData.headline.trim() === "") {
        isValid = false
        errors.push("Please provide a professional headline")
      }

      if (
        userRole === "employer" &&
        stepData.isNewCompany &&
        (!stepData.companyName || stepData.companyName.trim() === "")
      ) {
        isValid = false
        errors.push("Please provide a company name")
      }
    }

    if (currentStepKey === "skills" && Array.isArray(stepData.skills)) {
      const hasValidSkill = stepData.skills.some((skill: any) => skill.name && skill.name.trim() !== "")
      if (!hasValidSkill) {
        isValid = false
        errors.push("Please add at least one skill")
      }
    }

    if (currentStepKey === "education" && Array.isArray(stepData.education)) {
      const hasValidEducation = stepData.education.some(
        (edu: any) => edu.school && edu.school.trim() !== "" && edu.degree && edu.degree.trim() !== "",
      )
      if (!hasValidEducation) {
        isValid = false
        errors.push("Please add at least one education entry with school and degree")
      }
    }

    if (currentStepKey === "experience") {
      // If fresher, skip experience validation
      if (stepData.isFresher) {
        isValid = true
      } else if (Array.isArray(stepData.experience)) {
        const hasValidExperience = stepData.experience.some(
          (exp: any) => exp.company && exp.company.trim() !== "" && exp.title && exp.title.trim() !== "",
        )
        if (!hasValidExperience) {
          isValid = false
          errors.push("Please add at least one work experience with company and job title or fresher")
        }
      }
    }

    // Update validation status in store
    updateValidationStatus(currentStepKey, isValid, isValid ? "" : errors[0])
    setValidationErrors(errors)

    return isValid
  }

  const handleNext = (stepData: any) => {
    // Validate current step
    const isValid = validateCurrentStep(stepData)

    // Update form data in state and store
    const updatedData = { ...formData, ...stepData }
    setFormData(updatedData)
    updateOnboardingData(updatedData)

    if (!isValid) {
      // Don't proceed if validation fails
      return
    }

    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      // Save progress in auth store
      updateOnboardingStatus({ lastStep: nextStep })
    } else {
      handleSubmit(updatedData)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      // Save progress in auth store
      updateOnboardingStatus({ lastStep: prevStep })
    }
  }

  const handleSubmit = async (finalData: any) => {
    setIsSubmitting(true)
    try {
      // In a real app, you would send this data to your API
      console.log("Submitting onboarding data:", finalData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check if all steps are valid before marking onboarding as complete
      let allValid = true
      for (const step of steps) {
        const key = step.key
        const stepData = finalData[key] || finalData
        // Use the same validation as validateCurrentStep
        if (key === "basicInfo") {
          if (!stepData.headline || stepData.headline.trim() === "") allValid = false
          if (userRole === "employer" && stepData.isNewCompany && (!stepData.companyName || stepData.companyName.trim() === "")) allValid = false
        }
        if (key === "skills" && Array.isArray(stepData.skills)) {
          const hasValidSkill = stepData.skills.some((skill: any) => skill.name && skill.name.trim() !== "")
          if (!hasValidSkill) allValid = false
        }
        if (key === "education" && Array.isArray(stepData.education)) {
          const hasValidEducation = stepData.education.some((edu: any) => edu.school && edu.school.trim() !== "" && edu.degree && edu.degree.trim() !== "")
          if (!hasValidEducation) allValid = false
        }
        if (key === "experience") {
          if (stepData.isFresher) {
            // valid
          } else if (Array.isArray(stepData.experience)) {
            const hasValidExperience = stepData.experience.some((exp: any) => exp.company && exp.company.trim() !== "" && exp.title && exp.title.trim() !== "")
            if (!hasValidExperience) allValid = false
          } else {
            allValid = false
          }
        }
      }
      if (allValid) {
        completeOnboarding()
      }
      // Redirect to appropriate dashboard
      if (userRole === "applicant") {
        router.push("/dashboard")
      } else {
        router.push("/employer/dashboard")
      }
    } catch (error) {
      console.error("Error submitting onboarding data:", error)
      setValidationErrors(["There was an error submitting your information. Please try again."])
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
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {CurrentStepComponent && <CurrentStepComponent onNext={handleNext} data={formData} />}

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || isSubmitting}>
            Back
          </Button>

          {/* Skip button - only for development purposes */}
          {process.env.NODE_ENV === "development" && (
            <Button variant="outline" onClick={() => completeOnboarding()} className="ml-auto mr-2">
              Skip Onboarding (Dev Only)
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}