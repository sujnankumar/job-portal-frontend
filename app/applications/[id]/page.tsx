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
  Loader2,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react"
import ApplicationTimeline from "@/components/application-timeline"
import api from "@/lib/axios"
import { set } from "date-fns"
import ResumeActions from "@/components/resume-actions"
import ContactRecruiterChatModal from "@/components/contact-recruiter-chat-modal"

export default function ApplicationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isAuthenticated, hydrated } = useAuthStore()
  const router = useRouter()
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [application, setApplication] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [showInterviewDetails, setShowInterviewDetails] = useState(false)
  const [interviewDetails, setInterviewDetails] = useState<any>(null)
  const [loadingInterview, setLoadingInterview] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoLoading, setLogoLoading] = useState(false)
  const [companyDetails, setCompanyDetails] = useState<any>(null)
  const [companyLoading, setCompanyLoading] = useState(false)

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
          //  console.log("Fetched Application:", response.data.application); // Log fetched data
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
      
      // Wait for auth store to be hydrated before checking authentication
      if (!hydrated) {
        return;
      }
      
      if (!isAuthenticated) {
        // console.log("User not authenticated, redirecting to login page");
        router.push("/auth/login");
        return; // Stop further execution in this effect
      }
  
      if (user?.role === "employer") {
        // console.log("Employer role detected, redirecting to employer dashboard");
        router.push("/employer/dashboard");
        return; // Stop further execution in this effect
      }
      
      // console.log("User role:", user?.role);
     
      if (user?.role === "applicant" && appId && user.token) {
        // console.log("Fetching application details for applicant:", appId);
        fetchApplication(appId, user.token);
      }
    };

    fetchParamsAndApplication();
  }, [isAuthenticated, user, router, params, hydrated]);

  // Fetch company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!application?.job?.company_id) {
        setCompanyDetails(null)
        return
      }

      setCompanyLoading(true)
      try {
        const res = await api.get(`/company/${application.job.company_id}`)
        setCompanyDetails(res.data)
      } catch (error) {
        console.error("Failed to fetch company details:", error)
        setCompanyDetails(null)
      } finally {
        setCompanyLoading(false)
      }
    }

    fetchCompanyDetails()
  }, [application?.job?.company_id])

  // Fetch company logo
  useEffect(() => {
    const fetchCompanyLogo = async () => {
      if (!application?.job?.logo) {
        // console.log("company details: ",application)
        setLogoUrl(null)
        return
      }

      setLogoLoading(true)
      try {
        // console.log("Fetching company logo for:", application.job.logo)
        const res = await api.get(`/company/logo/${application.job.logo}`, {
          responseType: "blob",
        })
        const url = URL.createObjectURL(res.data)
        // console.log("Fetched company logo:", url)
        setLogoUrl(url)
      } catch (error) {
        console.error("Failed to fetch company logo:", error)
        setLogoUrl(null)
      } finally {
        setLogoLoading(false)
      }
    }

    fetchCompanyLogo()

    // Cleanup function to revoke object URL
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl)
      }
    }
  }, [application?.job?.logo])

  // Cleanup logo URL when component unmounts
  useEffect(() => {
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl)
      }
    }
  }, [logoUrl])

  
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
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        )
      case "interview":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            Interview Scheduled
          </Badge>
        )
      case "accepted":
      case "selected":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status === "selected" ? "Selected" : "Accepted"}
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Not Selected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Check if application can be edited
  const canEditApplication = () => {
    if (!application) return { canEdit: false, reason: "Application not found" };
    
    // Check application status - only pending and review can be edited
    const editableStatuses = ["pending", "review"];
    if (!editableStatuses.includes(application.status)) {
      const statusMessages = {
        "interview": "Application is scheduled for interview",
        "accepted": "Application has been accepted",
        "selected": "Application has been selected",
        "rejected": "Application has been rejected",
      };
      return { 
        canEdit: false, 
        reason: statusMessages[application.status as keyof typeof statusMessages] || "Application cannot be edited in current status" 
      };
    }
    
    // Check if deadline has passed
    if (application?.job?.expires_at) {
      const deadline = new Date(application.job.expires_at);
      const now = new Date();
      if (now > deadline) {
        return { canEdit: false, reason: "Application deadline has passed" };
      }
    }
    
    return { canEdit: true, reason: "" };
  };

  const { canEdit, reason } = canEditApplication();

  // Check if application can be withdrawn
  const canWithdrawApplication = () => {
    if (!application) return { canWithdraw: false, reason: "Application not found" };
    
    // Check application status - only pending, review, and interview can be withdrawn
    const withdrawableStatuses = ["pending", "review", "interview"];
    if (!withdrawableStatuses.includes(application.status)) {
      const statusMessages = {
        "accepted": "Cannot withdraw an accepted application",
        "selected": "Cannot withdraw a selected application", 
        "rejected": "Application has already been rejected",
      };
      return { 
        canWithdraw: false, 
        reason: statusMessages[application.status as keyof typeof statusMessages] || "Application cannot be withdrawn in current status" 
      };
    }
    
    // Check if deadline has passed (optional restriction)
    if (application?.job?.expires_at) {
      const deadline = new Date(application.job.expires_at);
      const now = new Date();
      if (now > deadline) {
        return { canWithdraw: false, reason: "Application deadline has passed" };
      }
    }
    
    return { canWithdraw: true, reason: "" };
  };

  const { canWithdraw, reason: withdrawReason } = canWithdrawApplication();

  const handleWithdrawApplication = async(appId: string, token: string) => {
    // console.log("Withdrawing application:", appId, token)
    setIsWithdrawDialogOpen(false)
    const response = await api.post(`/application/delete_application/${appId}`,{}, {
           headers: { Authorization: `Bearer ${token}` },
         });
    if (response.status === 200) {
      // console.log("Application withdrawn successfully")
      router.push("/applications")
    }
    else {
      console.error("Failed to withdraw application")
      alert("Failed to withdraw application. Please try again.")
    }
  }

  // Fetch interview details
  const fetchInterviewDetails = async () => {
    if (!user?.token || !application?.job_id) return
    
    setLoadingInterview(true)
    try {
      const response = await api.get(`/interview/details/${application.job_id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setInterviewDetails(response.data)
      setShowInterviewDetails(true)
    } catch (err: any) {
      console.error("Error fetching interview details:", err)
      alert("Failed to load interview details. Please try again.")
    } finally {
      setLoadingInterview(false)
    }
  }

  // Extract job and employer info for chat modal
  const jobId = application?.job_id || application?.job?._id || ""
  const employerId = application?.job?.employer_id || application?.job?.employer || ""
  const companyName = companyDetails?.company_name || application?.job?.company_name || application?.job?.company || ""
  const companyLogo = logoUrl || application?.job?.logo || "/company_placeholder.jpeg"
  const jobTitle = application?.job?.title || ""

  return (
    <OnboardingMiddleware>
      <ProtectedRoute allowedRoles={["applicant"]}>
        {/* Show loading while auth store is hydrating */}
        {!hydrated ? (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
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
                    <div className="w-16 h-16 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                      {logoLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <Image
                          src={logoUrl || application?.job?.logo || "/company_placeholder.jpeg"}
                          alt={companyDetails?.company_name || application?.job?.company_name || "Company logo"}
                          width={60}
                          height={60}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-dark-gray">{application?.job?.title}</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      {companyLoading ? (
                        <span className="inline-flex items-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading company...
                        </span>
                      ) : (
                        <>
                          {companyDetails?.company_name || application?.job?.company_name} • {application?.job?.location}
                        </>
                      )}
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

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => canEdit && router.push(`/applications/edit/${application?._id}`)}
                        disabled={!canEdit}
                        className={canEdit ? "text-blue-600 border-blue-200 hover:bg-blue-50" : "text-gray-400 border-gray-200 cursor-not-allowed opacity-60"}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Application
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{canEdit ? "Edit your application details" : reason}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Dialog open={isWithdrawDialogOpen && canWithdraw} onOpenChange={(open) => canWithdraw && setIsWithdrawDialogOpen(open)}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={!canWithdraw}
                            className={canWithdraw ? "text-red-600 border-red-200 hover:bg-red-50" : "text-gray-400 border-gray-200 cursor-not-allowed opacity-60"}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Withdraw Application
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Withdraw Application</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to withdraw your application for {application?.job?.title} at{" "}
                              {companyDetails?.company_name || application?.job?.company_name}? This action cannot be undone.
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
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{canWithdraw ? "Withdraw your application" : withdrawReason}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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

                    {/* Interview Details Button */}
                    {application?.status === "interview" && (
                      <div className="flex items-center pt-2">
                        <div className="w-32"></div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchInterviewDetails}
                          disabled={loadingInterview}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          {loadingInterview ? (
                            "Loading..."
                          ) : (
                            <>
                              <Calendar className="h-4 w-4 mr-2" />
                              View Interview Details
                            </>
                          )}
                        </Button>
                      </div>
                    )}
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
                          {application?.interview.interviewers.map((interviewer: string, index: number) => (
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
                  <Button variant="outline" className="text-gray-700" onClick={() => setShowChat(true)} disabled={showChat}>
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
          
          {/* Interview Details Modal */}
          <Dialog open={showInterviewDetails} onOpenChange={setShowInterviewDetails}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Interview Details
                </DialogTitle>
                <DialogDescription>
                  Complete information about your scheduled interview
                </DialogDescription>
              </DialogHeader>
              
              {interviewDetails && (
                <div className="space-y-6 mt-4">
                  {/* Basic Interview Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Interview Date & Time</div>
                      <div className="font-medium">{formatDate(interviewDetails.scheduled_time)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Interview Type</div>
                      <div className="font-medium capitalize">{interviewDetails.details?.interviewType || "Not specified"}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="font-medium">{interviewDetails.details?.duration || "Not specified"}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Status</div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Scheduled
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Interviewers */}
                  {interviewDetails.details?.interviewers && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Interviewers</div>
                      <div className="space-y-1">
                        {Array.isArray(interviewDetails.details.interviewers) ? (
                          interviewDetails.details.interviewers.map((interviewer: string, index: number) => (
                            <div key={index} className="flex items-center">
                              <Building className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="font-medium">{interviewer}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">{interviewDetails.details.interviewers}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Zoom Link for Video Interviews */}
                  {interviewDetails.zoom_link && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Meeting Link</div>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <a 
                          href={interviewDetails.zoom_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {interviewDetails.zoom_link}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Notes/Instructions */}
                  {interviewDetails.details?.notes && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Additional Notes</div>
                      <div className="bg-gray-50 p-3 rounded-md text-gray-700 whitespace-pre-line">
                        {interviewDetails.details.notes}
                      </div>
                    </div>
                  )}

                  {/* Interview ID for Reference */}
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-400">Interview ID: {interviewDetails.id}</div>
                  </div>
                </div>
              )}
              
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setShowInterviewDetails(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    // Add to calendar functionality can be implemented here
                    alert("Add to calendar functionality can be implemented here")
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Chat Modal */}
          <ContactRecruiterChatModal
            jobId={jobId}
            employerId={employerId}
            companyName={companyName}
            companyLogo={companyLogo}
            jobTitle={jobTitle}
            open={showChat}
            onClose={() => setShowChat(false)}
          />
        </div>
        )}
      </ProtectedRoute>
    </OnboardingMiddleware>
  )
}