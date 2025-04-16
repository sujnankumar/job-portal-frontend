"use client"

import { useState } from "react"
import { FileUp, File, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface UploadedFile {
  id: string
  name: string
  size: string
  progress: number
}

export default function ResumeUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "john-smith-resume.pdf",
      size: "1.2 MB",
      progress: 100,
    },
  ])
  const [highlightService, setHighlightService] = useState(false)

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((files) => files.filter((file) => file.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center",
          uploadedFiles.length > 0 ? "border-gray-200 bg-light-gray" : "border-primary bg-light-cream",
        )}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <FileUp className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium text-dark-gray mb-1">
            {uploadedFiles.length > 0 ? "Upload additional files" : "Upload your resume"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">Supported formats: PDF, DOCX, RTF (Max 5MB)</p>
          <Button className="bg-primary hover:bg-primary/90">Choose File</Button>
          <input type="file" className="hidden" accept=".pdf,.docx,.rtf" />
          <p className="text-xs text-gray-500 mt-3">or drag and drop your files here</p>
        </div>
      </div>

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-dark-gray">Uploaded Files</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between border rounded-md p-3 bg-white">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center bg-light-gray rounded-md">
                    <File className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-dark-gray">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {file.progress < 100 ? (
                    <div className="w-20 bg-light-gray rounded-full h-2 mr-3">
                      <div className="bg-primary rounded-full h-2" style={{ width: `${file.progress}%` }} />
                    </div>
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
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
        <Button variant="outline" className="sm:w-auto">
          Cancel
        </Button>
        <Button className="bg-accent hover:bg-accent/90 sm:w-auto">Continue to Next Step</Button>
      </div>
    </div>
  )
}
