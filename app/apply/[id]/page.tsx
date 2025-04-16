"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import ResumeUploader from "@/components/resume-uploader"
import ResumeBuilder from "@/components/resume-builder"

export default function ApplyPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user?.role === "employer") {
      router.push("/employer/dashboard")
    } else if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, user, router])

  // Note: In a real app, you would fetch the job details based on the id

  return (
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
            <TabsTrigger
              value="build"
              className="flex-1 rounded-tr-xl rounded-tl-none rounded-bl-none rounded-br-none py-3"
            >
              Resume Builder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="p-6">
            <ResumeUploader />
          </TabsContent>

          <TabsContent value="build" className="p-6">
            <ResumeBuilder />
          </TabsContent>
        </Tabs>

        {/* Additional Information */}
        <div className="bg-white p-6 rounded-xl shadow-md mt-6">
          <h2 className="text-xl font-semibold text-dark-gray mb-4">Additional Information</h2>

          <Form>
            <div className="space-y-4">
              <FormField
                name="coverLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us why you're a good fit for this position..."
                        className="min-h-[150px]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="linkedIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/your-profile" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="portfolio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio or Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-website.com" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button className="w-full bg-accent hover:bg-accent/90">Submit Application</Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
