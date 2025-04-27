"use client"

import { useEffect, useRef, useState } from "react"
import { FileUp, File, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import api from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import type React from "react"

interface UploadedFile {
  id: string
  name: string
  size: string
  progress: number
}

export default function ResumeUploader({ onConfirm }: { onConfirm?: (resume: { type: "profile" | "custom", file?: File, filename?: string }) => void }) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [highlightService, setHighlightService] = useState(false)
  const [profileResume, setProfileResume] = useState<{ filename: string } | null>(null)
  const [useProfileResume, setUseProfileResume] = useState(false)
  const [loadingProfileResume, setLoadingProfileResume] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const user = useAuthStore((state) => state.user)
  const hydrated = useAuthStore((state) => state.hydrated)
  const router = useRouter()

  // Fetch profile resume on mount
  useEffect(() => {
    if (!hydrated) return;
    const fetchProfileResume = async () => {
      setLoadingProfileResume(true)
      try {
        const res = await api.get("/resume/get_profile_resume", {
          responseType: "blob",
          headers: user && user.token ? { Authorization: `Bearer ${user.token}` } : {},
        })
        // Try to extract filename from content-disposition header
        
        let filename = "profile_resume.pdf"
        // Use res.headers.get for fetch/axios compatibility
        const disposition = typeof res.headers.get === "function" 
          ? res.headers.get("content-disposition") 
          : res.headers["content-disposition"]
        if (disposition) {
          const match = disposition.match(/filename="?([^";]+)"?/)
          if (match) filename = match[1]
        }
        setProfileResume({ filename })
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Resume not found, allow upload
          setProfileResume(null)
        } else {
          // Optionally handle other errors
          setProfileResume(null)
        }
      } finally {
        setLoadingProfileResume(false)
      }
    }
    fetchProfileResume()
  }, [user, hydrated])

  // Only allow one file upload if not using profile resume
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    setUploadedFiles([
      {
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        progress: 100,
        file, // store the actual File object
      } as any // for type compatibility
    ])
    // Reset input value so same file can be uploaded again if needed
    e.target.value = ""
  }

  // Handle button click to trigger file input
  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    const file = files[0]
    setUploadedFiles([
      {
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        progress: 100,
      },
    ])
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleRemoveFile = () => {
    setUploadedFiles([])
  }

  // Reset confirmation if resume type or file changes
  useEffect(() => {
    setConfirmed(false)
    onConfirm?.(null as any)
  }, [useProfileResume, uploadedFiles, profileResume])

  // Action handlers
  const handleBackToJob = () => {
    router.back()
  }
  const handleConfirm = () => {
    // If already confirmed, toggle off
    if (confirmed) {
      setConfirmed(false)
      onConfirm?.(null as any)
      return
    }
    // Confirm logic
    if (useProfileResume && profileResume) {
      setConfirmed(true)
      onConfirm?.({ type: "profile", filename: profileResume.filename })
    } else if (!useProfileResume && uploadedFiles.length > 0) {
      setConfirmed(true)
      onConfirm?.({ type: "custom", filename: uploadedFiles[0].name, file: uploadedFiles[0].file })
    }
  }

  // Profile Resume Option
  const showProfileOption = !loadingProfileResume && profileResume;

  return (
    <div className="space-y-6">
      {/* Profile Resume Option */}
      {showProfileOption && (
        <div
          className={cn(
            "border rounded-md p-4 flex items-center gap-4 cursor-pointer transition-colors",
            useProfileResume ? "border-green-500 bg-green-50" : "border-gray-200 bg-light-cream hover:border-red-300"
          )}
          onClick={() => {
            setUseProfileResume(true)
            setUploadedFiles([])
          }}
        >
          <span
            className={cn(
              "w-5 h-5 flex items-center justify-center mr-2",
              useProfileResume ? "" : ""
            )}
          >
            {useProfileResume && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" rx="4" fill="#22c55e" />
                <path d="M6 10.5L9 13.5L14 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <label className="cursor-pointer select-none">
            Use your profile resume: <span className="font-medium text-dark-gray">{profileResume.filename}</span>
          </label>
        </div>
      )}
      {/* Custom Resume Option (only show if profile resume exists) */}
      {showProfileOption && (
        <div
          className={cn(
            "border rounded-md p-4 flex items-center gap-4 cursor-pointer transition-colors",
            !useProfileResume ? "border-green-500 bg-green-50" : "border-gray-200 bg-light-cream hover:border-red-300"
          )}
          onClick={() => setUseProfileResume(false)}
        >
          <span
            className={cn(
              "w-5 h-5 flex items-center justify-center mr-2",
              !useProfileResume ? "" : ""
            )}
          >
            {!useProfileResume && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" rx="4" fill="#22c55e" />
                <path d="M6 10.5L9 13.5L14 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <label className="cursor-pointer select-none">
            Upload a custom resume
          </label>
        </div>
      )}
      {/* Only show upload option if no profile resume found */}
      {!showProfileOption && (
        <div
          className={cn(
            "border rounded-md p-4 flex items-center gap-4 cursor-pointer transition-colors border-red-500 bg-red-50"
          )}
        >
          <span className="inline-block w-4 h-4 rounded-full border-2 border-red-500 bg-red-500 mr-2" />
          <label className="cursor-pointer select-none">Upload Resume</label>
        </div>
      )}
      {/* Upload area (only if not using profile resume) */}
      {!useProfileResume && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center",
            uploadedFiles.length > 0 ? "border-gray-200 bg-light-gray" : "border-primary bg-light-cream",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="flex flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <FileUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium text-dark-gray mb-1">
              {uploadedFiles.length > 0 ? "Replace uploaded file" : "Upload your resume"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">Supported formats: PDF, DOCX, RTF (Max 5MB)</p>
            {uploadedFiles.length === 0 && (
              <Button className="bg-primary hover:bg-primary/90" type="button" onClick={handleChooseFile}>
                Choose File
              </Button>
            )}
            {uploadedFiles.length > 0 && (
              <Button className="bg-primary hover:bg-primary/90 mt-2" type="button" onClick={handleChooseFile}>
                Replace File
              </Button>
            )}
            <label htmlFor="file-upload" className="sr-only">Upload File</label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.docx,.rtf"
              ref={fileInputRef}
              onChange={handleFileChange}
              // allow replacing file even if one is uploaded
            />
            <p className="text-xs text-gray-500 mt-3">or drag and drop your file here</p>
          </div>
        </div>
      )}
      {/* Uploaded file preview (only one allowed) */}
      {!useProfileResume && uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-dark-gray">Uploaded File</h3>
          <div className="flex items-center justify-between border rounded-md p-3 bg-white">
            <div className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center bg-light-gray rounded-md">
                <File className="h-5 w-5 text-gray-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-dark-gray">{uploadedFiles[0].name}</p>
                <p className="text-xs text-gray-500">{uploadedFiles[0].size}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {/* Resume Highlighting Service */}
      <div className="border rounded-md p-4 bg-light-cream">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-dark-gray">Resume Highlighting Service</h3>
            <p className="text-sm text-gray-600 mt-1">
              Our AI will analyze your resume and highlight key skills and experiences that match this job.
            </p>
            <p className="text-xs text-gray-500 mt-1">This will help your application stand out to recruiters.</p>
          </div>
          <Switch checked={highlightService} onCheckedChange={setHighlightService} />
        </div>
      </div>
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" className="sm:w-auto" type="button" onClick={handleBackToJob}>
          Back to Job
        </Button>
        <Button
          className={`bg-accent hover:bg-accent/90 sm:w-auto ${confirmed ? 'opacity-80' : ''}`}
          type="button"
          onClick={handleConfirm}
          disabled={(!useProfileResume && uploadedFiles.length === 0) && !profileResume}
        >
          {confirmed ? "Confirmed" : "Confirm"}
        </Button>
      </div>
    </div>
  )
}
