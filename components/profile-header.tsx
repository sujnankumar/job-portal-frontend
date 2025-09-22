import { useRef, useState, useEffect } from "react";
import axios from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Camera, MapPin, Briefcase, Mail, Phone, Pencil, Loader2, FileText, Upload, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProfileHeaderProps {
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  personalInfo: any;
  education: any[];
  experience: any[];
  skills: any[];
  onStartEdit?: () => void;
}

function getProfileCompleteness(
  personalInfo: any,
  education: any[],
  experience: any[],
  skills: any[]
) {
  let total = 0; // firstName, lastName, headline, email, phone, location, bio, at least 1 education, 1 experience, 1 skill
  let filled = 0;
  if (personalInfo.firstName) filled++;
  total++;
  if (personalInfo.lastName) filled++;
  total++;
  if (personalInfo.headline) filled++;
  total++;
  if (personalInfo.email) filled++;
  total++;
  if (personalInfo.phone) filled++;
  total++;
  if (personalInfo.location) filled++;
  total++;
  if (personalInfo.bio) filled++;
  total++;
  if (education.length > 0) filled++;
  total++;
  if (experience.length > 0) filled++;
  total++;
  if (skills.length > 0) filled++;
  total++;
  return Math.round((filled / total) * 100);
}

export default function ProfileHeader({
  isEditing,
  setIsEditing,
  personalInfo,
  education,
  experience,
  skills,
  onStartEdit,
}: ProfileHeaderProps) {
  const completeness = getProfileCompleteness(
    personalInfo,
    education,
    experience,
    skills
  );
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileUrl, setProfileUrl] = useState<string>("");
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profileUploading, setProfileUploading] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [coverLoading, setCoverLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Resume state
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Fetch cover photo on mount or after upload
  useEffect(() => {
    async function fetchCover() {
      setCoverLoading(true);
      try {
        const res = await axios.get("/profile/cover_photo", {
          responseType: "blob",
          headers: { Authorization: user?.token ? `Bearer ${user.token}` : undefined },
        });
        const url = URL.createObjectURL(res.data);
        setCoverUrl(url);
      } catch {
        setCoverUrl("");
      } finally {
        setCoverLoading(false);
      }
    }
    fetchCover();
    return () => { if (coverUrl && coverUrl.startsWith("blob:")) URL.revokeObjectURL(coverUrl); };
  }, [user]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Cancel upload
  const handleCancel = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Confirm upload
  const handleConfirm = async () => {
    if (!coverFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", coverFile);
      await axios.put("/profile/upload_cover_photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: user?.token ? `Bearer ${user.token}` : undefined,
        },
      });
      setCoverPreview(null);
      setCoverFile(null);
      // Refetch cover
      const res = await axios.get("/profile/cover_photo", {
        responseType: "blob",
        headers: {
          Authorization: user?.token ? `Bearer ${user.token}` : undefined,
        },
      });
      const url = URL.createObjectURL(res.data);
      setCoverUrl(url);
      toast({ title: "Cover photo updated!" });
    } catch (e: any) {
      toast({
        title: "Failed to upload cover photo",
        description: e?.response?.data?.detail || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Fetch profile photo on mount or after upload
  useEffect(() => {
    async function fetchProfile() {
      setProfileLoading(true);
      try {
        const res = await axios.get("/profile/profile_photo", {
          responseType: "blob",
          headers: { Authorization: user?.token ? `Bearer ${user.token}` : undefined },
        });
        const url = URL.createObjectURL(res.data);
        setProfileUrl(url);
      } catch {
        setProfileUrl("");
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
    return () => { if (profileUrl && profileUrl.startsWith("blob:")) URL.revokeObjectURL(profileUrl); };
  }, [user]);

  // Handle profile file input change
  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
      setProfileDialogOpen(true);
    }
  };

  // Cancel profile upload
  const handleProfileCancel = () => {
    setProfileFile(null);
    setProfilePreview(null);
    setProfileDialogOpen(false);
    if (profileInputRef.current) profileInputRef.current.value = "";
  };

  // Confirm profile upload
  const handleProfileConfirm = async () => {
    if (!profileFile) return;
    setProfileUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", profileFile);
      await axios.put("/profile/upload_profile_photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: user?.token ? `Bearer ${user.token}` : undefined,
        },
      });
      setProfilePreview(null);
      setProfileFile(null);
      setProfileDialogOpen(false);
      // Refetch profile
      const res = await axios.get("/profile/profile_photo", {
        responseType: "blob",
        headers: {
          Authorization: user?.token ? `Bearer ${user.token}` : undefined,
        },
      });
      const url = URL.createObjectURL(res.data);
      setProfileUrl(url);
      toast({ title: "Profile photo updated!" });
    } catch (e: any) {
      toast({
        title: "Failed to upload profile photo",
        description: e?.response?.data?.detail || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setProfileUploading(false);
    }
  };

  // Resume functions
  const handlePreviewResume = async () => {
    try {
      const response = await axios.get("/resume/preview_resume", {
        responseType: "blob",
        headers: {
          Authorization: user?.token ? `Bearer ${user.token}` : undefined,
        },
      });
      
      const blob = new Blob([response.data], { type: response.data.type });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      
      // Clean up the object URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        toast({
          title: "No resume found",
          description: "Please upload a resume first",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to preview resume",
          description: e?.response?.data?.detail || "Unknown error",
          variant: "destructive",
        });
      }
    }
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword"
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only PDF and Word documents are allowed",
          variant: "destructive",
        });
        return;
      }
      
      setResumeFile(file);
      setResumeDialogOpen(true);
    }
  };

  const handleResumeCancel = () => {
    setResumeFile(null);
    setResumeDialogOpen(false);
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  };

  const handleResumeConfirm = async () => {
    if (!resumeFile) return;
    setResumeUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      
      await axios.post("/resume/upload_resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: user?.token ? `Bearer ${user.token}` : undefined,
        },
      });
      
      setResumeFile(null);
      setResumeDialogOpen(false);
      toast({ title: "Resume uploaded successfully!" });
    } catch (e: any) {
      toast({
        title: "Failed to upload resume",
        description: e?.response?.data?.detail || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setResumeUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* 
      <div className="px-6 pt-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Progress value={completeness} className="w-64 h-2" />
          <span className="text-sm font-medium text-gray-600">{completeness}% Complete</span>
          <Badge className="bg-green-100 text-green-800 ml-2">Completing the profile increases your chances of getting recruited</Badge>
        </div>
      </div> */}
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-primary to-accent relative flex items-center justify-center">
        {coverLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
            <Loader2 className="animate-spin h-10 w-10 text-gray-400" />
          </div>
        ) : (
          <img
            src={coverPreview || coverUrl || "/mystical-forest-spirit.png"}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover object-center z-0"
            onLoad={() => setCoverLoading(false)}
          />
        )}
        {coverPreview ? (
          <div className="absolute bottom-3 left-3 flex gap-2 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        ) : null}
        <div className="absolute bottom-3 right-3 z-10 flex gap-2">
          {coverPreview ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleConfirm}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Confirm"}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/80 hover:bg-white text-dark-gray rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4 md:mr-1 md:rounded-full" />
              <span className="hidden md:inline">Change Cover</span>
            </Button>
          )}
          <label htmlFor="cover-upload" className="hidden">
            Upload Cover Photo
          </label>
          <input
            id="cover-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6 relative">
        {/* Responsive layout: improved mobile alignment */}
        <div className="flex flex-col">
          {/* Profile Picture */}
          <div className="md:absolute md:-top-12 md:left-6 z-20 bg-white shadow-md w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-full border-3 border-white mx-auto -mt-12 md:mt-0 md:mx-0">
            {profileLoading ? (
              <Loader2 className="animate-spin h-10 w-10 text-gray-400" />
            ) : (
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <img
                  src={profilePreview || profileUrl || "/mystical-forest-spirit.png"}
                  width={128}
                  height={128}
                  alt="Profile"
                  className="rounded-full h-24 w-24 md:h-32 md:w-32 object-cover absolute top-0 left-0 border-4 border-white"
                  onLoad={() => setProfileLoading(false)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-white hover:bg-light-gray"
                  onClick={() => profileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileFileChange}
                  aria-label="Upload profile photo"
                />
              </div>
            )}
          </div>
          
          {/* Profile Picture Modal */}
          <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Preview Profile Picture</DialogTitle>
              </DialogHeader>
              {profilePreview && (
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={profilePreview}
                    alt="Preview"
                    className="rounded-full h-32 w-32 object-cover border"
                  />
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleProfileCancel}
                  disabled={profileUploading}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleProfileConfirm}
                  disabled={profileUploading}
                >
                  {profileUploading ? "Uploading..." : "Confirm"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Profile Details */}
          <div className="mt-4 md:mt-5 md:ml-44 flex flex-col md:flex-row md:items-end justify-between gap-4 items-stretch">
            {/* On mobile, mt-20 pushes text closer to the profile image. On desktop, md:mt-5 and md:ml-44 keep original alignment. */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl font-bold text-dark-gray">
                  {personalInfo.first_name || ""} {personalInfo.last_name || ""}
                </h1>
                <Badge className="bg-primary text-dark-gray">
                  Available for work
                </Badge>
              </div>
              <h2 className="text-lg text-gray-600 mt-1">
                {personalInfo.headline || ""}
              </h2>
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500 justify-center md:justify-start">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {personalInfo.location || ""}
                </div>
                {/* Optionally, you can show experience summary here if available */}
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {personalInfo.email || ""}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {personalInfo.phone || ""}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2 md:self-end w-full md:w-auto">
              <div className="flex flex-col md:flex-row gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviewResume}
                  className="flex items-center w-full md:w-auto"
                >
                  <Eye className="h-4 w-4 mr-1" /> Preview Resume
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resumeInputRef.current?.click()}
                  className="flex items-center w-full md:w-auto"
                >
                  <Upload className="h-4 w-4 mr-1" /> Update Resume
                </Button>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleResumeFileChange}
                  aria-label="Upload resume file"
                />
              </div>
              <Button
                className="bg-accent hover:bg-accent/90 w-full md:w-auto"
                onClick={() => { onStartEdit?.(); setIsEditing(true); }}
                disabled={isEditing}
              >
                <Pencil className="h-4 w-4 mr-1" /> Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Upload Modal */}
      <Dialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
          </DialogHeader>
          {resumeFile && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 w-full">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{resumeFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleResumeCancel}
              disabled={resumeUploading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleResumeConfirm}
              disabled={resumeUploading}
            >
              {resumeUploading ? "Uploading..." : "Upload Resume"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
