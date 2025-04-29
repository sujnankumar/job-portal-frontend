"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuthStore } from "@/store/authStore"
import ProtectedRoute from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import OnboardingMiddleware from "@/components/auth/onboarding-middleware";
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  MapPin,
  Building,
  Briefcase,
  IndianRupee,
  Mail,
  Phone,
  Globe,
  Linkedin,
  AlertCircle,
  MessageSquare,
  Download,
  Trash2,
  ExternalLink,
} from "lucide-react"
import ApplicationTimeline from "@/components/application-timeline"
import api from "@/lib/axios"
import { set } from "date-fns"
import ResumeActions from "@/components/resume-actions"

export default function ApplicationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [application, setApplication] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState("")

  const fetchApplication = async (appId: string, token: string) => {
       setLoading(true);
       setError(""); // Clear previous errors
       try {
         const response = await api.get(`/ga/application/app_id/${appId}`, {
           headers: { Authorization: `Bearer ${token}` },
         });
   
         if (response.data && response.data.application) {
           setApplication(response.data.application);
           console.log("Fetched Application:", response.data.application); // Log fetched data
         } else {
           // Handle cases where the response is OK but the data structure is unexpected
           throw new Error("Invalid application data received from API.");
         }
       } catch (err: any) {
         console.error("Error fetching application:", err);
         // Use error message from the API response if available, otherwise a generic one
         const errorMessage = err.response?.data?.detail || err.message || "Failed to load application details.";
         setError(errorMessage);
       } finally {
         setLoading(false);
       }
     };
   

  useEffect(() => {
    const fetchParamsAndApplication = async () => {
      // Get the id from params after resolving the Promise
      const resolvedParams = await params;
      const appId = resolvedParams.id;
      setId(appId);
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login page");
        router.push("/auth/login");
        return; // Stop further execution in this effect
      }
  
      if (user?.role === "employer") {
        console.log("Employer role detected, redirecting to employer dashboard");
        router.push("/employer/dashboard");
        return; // Stop further execution in this effect
      }
      
      console.log("User role:", user?.role);
     
      if (user?.role === "applicant" && appId && user.token) {
        console.log("Fetching application details for applicant:", appId);
        fetchApplication(appId, user.token);
      }
    };

    fetchParamsAndApplication();
  }, [isAuthenticated, user, router, params]);

  
  // Format date to readable string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Format date without time
  const formatDateOnly = (dateString: string) => {
    if (dateString && dateString.toString().trim() !== "") {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
      return new Date(dateString.split("T")[0]).toLocaleDateString(undefined, options)
    }
    return "N/A"
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending Review
          </Badge>
        )
      case "interview":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Interview Scheduled
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Accepted
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Not Selected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleWithdrawApplication = async(appId: string, token: string) => {
    console.log("Withdrawing application:", appId, token)
    setIsWithdrawDialogOpen(false)
    const response = await api.post(`/application/delete_application/${appId}`,{}, {
           headers: { Authorization: `Bearer ${token}` },
         });
    if (response.status === 200) {
      console.log("Application withdrawn successfully")
      router.push("/applications")
    }
    else {
      console.error("Failed to withdraw application")
      alert("Failed to withdraw application. Please try again.")
    }
  }

  return (
    <OnboardingMiddleware>
      <ProtectedRoute allowedRoles={["applicant"]}>
        <div className="container mx-auto max-w-5xl py-8 px-4">
          {/* Back button and title */}
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => router.push("/applications")} className="mr-2 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-dark-gray">Application Details</h1>
          </div>

          {/* Application header */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center">
                  <div className="mr-4 flex-shrink-0">
                    <Image
                      src={application?.job?.logo || "/placeholder.svg"}
                      alt={application?.job?.company}
                      width={60}
                      height={60}
                      className="rounded-md"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-dark-gray">{application?.job?.title}</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      {application?.job?.company_name} • {application?.job?.location}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  {getStatusBadge(application?.status)}
                  <div className="text-sm text-gray-500">Applied on {formatDateOnly(application?.applied_at)}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center bg-light-gray px-3 py-1 rounded-full">
                  <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                  {application?.job?.employment_type}
                </div>
                <div className="flex items-center bg-light-gray px-3 py-1 rounded-full">
                  <IndianRupee className="h-4 w-4 mr-1 text-gray-500" />
                  {application?.job?.salary}
                </div>
                <div className="flex items-center bg-light-gray px-3 py-1 rounded-full">
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  {application?.job?.location}
                </div>
                <div className="flex items-center bg-light-gray px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4 mr-1 text-gray-500" />
                  Deadline: {formatDateOnly(application?.job?.expires_at)}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/jobs/${application?.job_id}`)}
                className="text-gray-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Job Details
              </Button>

              <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Withdraw Application
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Application</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to withdraw your application for {application?.job?.title} at{" "}
                      {application?.job?.company}? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)}>
                      Cancel
                    </Button>
                    {(application?._id && user?.token) &&
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (application._id && user.token) {
                            handleWithdrawApplication(application._id, user.token)
                          } else {
                            console.error("Withdraw failed: Application ID or token missing.");
                            alert("Could not withdraw application due to missing information.");
                          }
                        }}
                      >
                        Withdraw Application
                      </Button>
                    }               
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          {/* Interview alert if applicable */}
          {application?.status === "interview" && application?.interview && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-blue-800 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Upcoming Interview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Clock className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">{formatDate(application?.interview.date)}</div>
                      <div className="text-sm text-blue-700">
                        {application?.interview.type} • {application?.interview.duration}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Building className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Interviewers</div>
                      <div className="text-sm text-blue-700">{application?.interview.interviewers.join(", ")}</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Instructions</div>
                      <div className="text-sm text-blue-700">{application?.interview.instructions}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Add to Calendar
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Application details tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="resume">Resume & Cover Letter</TabsTrigger>
              <TabsTrigger value="timeline">Application Timeline</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Full Name</div>
                      <div className="font-medium">{application?.personalInfo?.name}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {application?.personalInfo?.email}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {application?.personalInfo?.phone}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Website</div>
                      <div className="font-medium flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-gray-400" />
                        {application?.personalInfo?.website}
                      </div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <div className="text-sm text-gray-500">LinkedIn</div>
                      <div className="font-medium flex items-center">
                        <Linkedin className="h-4 w-4 mr-2 text-gray-400" />
                        {application?.personalInfo?.linkedin}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Message */}
              {application?.customMessage && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Your Message to the Employer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-light-gray p-4 rounded-md text-gray-700 whitespace-pre-line">
                      {application?.customMessage}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Application Status */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-32 text-sm text-gray-500">Current Status:</div>
                      <div>{getStatusBadge(application?.status)}</div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-32 text-sm text-gray-500">Applied On:</div>
                      <div className="font-medium">{formatDate(application?.applied_at)}</div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-32 text-sm text-gray-500">Last Updated:</div>
                      <div className="font-medium">
                      {application?.timeline && application.timeline.length > 0 
                          ? formatDate(application.timeline[application.timeline.length - 1].date)
                          : "No Timeline Available"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interview Details (if applicable) */}
              {application?.status === "interview" && application?.interview && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Interview Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="w-32 text-sm text-gray-500 mt-0.5">Date & Time:</div>
                        <div className="font-medium">{formatDate(application?.interview.date)}</div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-32 text-sm text-gray-500 mt-0.5">Format:</div>
                        <div className="font-medium">{application?.interview.type}</div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-32 text-sm text-gray-500 mt-0.5">Duration:</div>
                        <div className="font-medium">{application?.interview.duration}</div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-32 text-sm text-gray-500 mt-0.5">Interviewers:</div>
                        <div>
                          {application?.interview.interviewers.map((interviewer, index) => (
                            <div key={index} className="font-medium">
                              {interviewer}
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-start">
                        <div className="w-32 text-sm text-gray-500 mt-0.5">Instructions:</div>
                        <div className="text-gray-700">{application?.interview.instructions}</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Add to Calendar
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            {/* Resume & Cover Letter Tab */}
            <TabsContent value="resume" className="space-y-6">
              {/* Resume */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Resume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-light-gray p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-gray-500" />
                        <span className="font-medium">{application?.resume_filename}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Last updated: {formatDateOnly(application?.resume?.upload_date)}
                      </div>
                    </div>
                  </div>
                  <ResumeActions base64File={application?.resume?.file} filename={application?.resume?.filename} />
                </CardContent>
              </Card>

              {/* Cover Letter */}
              {application?.cover_letter && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Cover Letter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-light-gray p-4 rounded-md text-gray-700 whitespace-pre-line">
                      {application?.cover_letter}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Application Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ApplicationTimeline timeline={application?.timeline} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap gap-3 justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="text-gray-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Recruiter
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send a message to the recruiter</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button onClick={() => router.push("/applications")} variant="outline">
              Back to Applications
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    </OnboardingMiddleware>
  )
}