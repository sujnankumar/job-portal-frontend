"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Clock, Video, Users, MessageSquare } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn, toIST } from "@/lib/utils"
import api from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"

interface InterviewSchedulerProps {
  candidateName: string
  candidateId: string
  jobId: string
}

export default function InterviewScheduler({ candidateName, candidateId, jobId }: InterviewSchedulerProps) {
  const { user } = useAuthStore()
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    interviewType: "video",
    startTime: "",
    duration: "30",
    interviewers: "",
    notes: "",
    zoomLink: "https://zoom.us/j/123456789",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      if (!date) {
        setError("Please select a date.")
        setLoading(false)
        return
      }
      const payload: any = {
        candidate_id: candidateId,
        job_id: jobId,
        date: date.toISOString().slice(0, 10),
        startTime: formData.startTime,
        duration: formData.duration,
        interviewType: formData.interviewType,
        interviewers: formData.interviewers,
        notes: formData.notes,
      }
      if (formData.interviewType === "video") {
        payload.zoomLink = formData.zoomLink
      }
      await api.post("/interview/schedule", payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      setSuccess("Interview scheduled successfully!")
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to schedule interview.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Video className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-medium text-dark-gray">Schedule Interview with {candidateName}</h2>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="interviewType">Interview Type</Label>
            <Select
              value={formData.interviewType}
              onValueChange={(value) => handleSelectChange("interviewType", value)}
            >
              <SelectTrigger id="interviewType">
                <SelectValue placeholder="Select interview type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video Interview (Zoom)</SelectItem>
                <SelectItem value="phone">Phone Interview</SelectItem>
                <SelectItem value="onsite">On-site Interview</SelectItem>
                <SelectItem value="technical">Technical Assessment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Interview Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < toIST(new Date())}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select value={formData.duration} onValueChange={(value) => handleSelectChange("duration", value)}>
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewers">Interviewers</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="interviewers"
                name="interviewers"
                placeholder="Enter interviewer names or emails"
                value={formData.interviewers}
                onChange={handleChange}
                className="pl-9"
              />
            </div>
          </div>

          {formData.interviewType === "video" && (
            <div className="space-y-2">
              <Label htmlFor="zoomLink">Zoom Link</Label>
              <Input
                id="zoomLink"
                name="zoomLink"
                value={formData.zoomLink}
                onChange={handleChange}
                placeholder="https://zoom.us/j/123456789"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes for Candidate</Label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional information or instructions for the candidate..."
              className="min-h-[100px] pl-9"
            />
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end gap-3">
          <Button type="button" variant="outline" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={loading}>
            {loading ? "Scheduling..." : "Schedule Interview"}
          </Button>
        </div>
      </form>

      {formData.interviewType === "video" && (
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="font-medium text-blue-700 flex items-center">
            <Video className="h-4 w-4 mr-1" /> Zoom Integration
          </h3>
          <p className="text-sm text-blue-600 mt-1">
            A Zoom meeting will be automatically created and the link will be sent to the candidate and all
            interviewers.
          </p>
        </div>
      )}
    </div>
  )
}
