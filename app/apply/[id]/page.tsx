"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import ResumeUploader from "@/components/resume-uploader"
import ResumeBuilder from "@/components/resume-builder"
import api from "@/lib/axios"
import React from "react"
import OnboardingMiddleware from "@/components/auth/onboarding-middleware";

interface FormValues {
  coverLetter: string
  linkedIn: string
  portfolio: string
}

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isAuthenticated, hydrated } = useAuthStore()
  const router = useRouter()
  const [resumeConfirmed, setResumeConfirmed] = useState(false)
  const [selectedResume, setSelectedResume] = useState<any>(null)

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    defaultValues: {
      coverLetter: "",
      linkedIn: "",
      portfolio: "",
    },
  })

  const coverLetter = form.watch("coverLetter");

  const unwrappedParams = React.use(params)

  useEffect(() => {
    if (!hydrated) return;
    console.log("User:", user)
    console.log("Is Authenticated:", isAuthenticated)
    if (isAuthenticated && user?.role === "employer") {
      router.push("/employer/dashboard")
    } else if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [hydrated, isAuthenticated, user, router])

  // Note: In a real app, you would fetch the job details based on the id

  const onSubmit = async (data: FormValues) => {
    if (!selectedResume) return;
    const formData = new FormData();
    // Attach resume file
    if (selectedResume.type === "custom") {
      if (selectedResume.file) {
        formData.append("resume", selectedResume.file);
      } else {
        alert("Please upload your resume file.");
        return;
      }
    } else if (selectedResume.type === "profile") {
      // For profile resume, fetch the file from the server and append as Blob
      try {
        const res = await api.get("/resume/get_profile_resume", {
          responseType: "blob",
          headers: user && "token" in user ? { Authorization: `Bearer ${user.token}` } : {},
        });
        // Use .get for fetch/axios compatibility
        const contentType = res.headers instanceof Headers
          ? res.headers.get("content-type")
          : res.headers["content-type"] || "application/pdf";
        let filename = selectedResume.filename || "profile_resume.pdf";
        const disposition = res.headers instanceof Headers
          ? res.headers.get("content-disposition")
          : res.headers["content-disposition"];
        if (disposition) {
          const match = disposition.match(/filename="?([^";]+)"?/);
          if (match) filename = match[1];
        }
        const file = new File([res.data], filename, { type: contentType });
        formData.append("resume", file);
      } catch (err) {
        alert("Failed to fetch profile resume. Please try uploading a custom resume.");
        return;
      }
    }
    // Attach other fields
    formData.append("cover_letter", data.coverLetter || "");
    formData.append("linked_in", data.linkedIn || "");
    formData.append("portfolio", data.portfolio || "");
    console.log("Form Data:", formData.get("resume"), data.coverLetter, data.linkedIn, data.portfolio)
    try {
      await api.post(`/application/apply/${unwrappedParams.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: user && "token" in user ? `Bearer ${user.token}` : "",
        },
      });
      router.push("/applications");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to submit application.");
    }
  }

  return (
    <OnboardingMiddleware>
      <ProtectedRoute allowedRoles={["applicant"]}>
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h1 className="text-2xl font-bold text-dark-gray">Apply for: Senior Frontend Developer</h1>
            <p className="text-gray-600">Tech Innovations Inc. • San Francisco, CA</p>
          </div>

          <Tabs defaultValue="upload" className="bg-white rounded-xl shadow-md">
            <TabsList className="border-b w-full rounded-t-xl rounded-b-none p-0">
              <TabsTrigger
                value="upload"
                className="flex-1 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none py-3"
              >
                Upload Resume
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="p-6">
              <ResumeUploader
                onConfirm={(resume) => {
                  setSelectedResume(resume)
                  setResumeConfirmed(!!resume)
                }}
              />
            </TabsContent>

            <TabsContent value="build" className="p-6">
              {/* ResumeBuilder removed from apply page */}
            </TabsContent>
          </Tabs>

          {/* Additional Information */}
          <div className="bg-white p-6 rounded-xl shadow-md mt-6">
            <h2 className="text-xl font-semibold text-dark-gray mb-4">Additional Information</h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="coverLetter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Letter <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us why you're a good fit for this position..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/your-profile" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio or Website (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://your-website.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={!resumeConfirmed || !coverLetter.trim()}>
                    Submit Application
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </ProtectedRoute>
    </OnboardingMiddleware>
  )
}
