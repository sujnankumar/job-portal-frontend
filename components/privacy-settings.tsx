"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PrivacySettings() {
  const { toast } = useToast()
  const [profileVisibility, setProfileVisibility] = useState("public")
  const [resumeVisibility, setResumeVisibility] = useState("registered")
  const [contactVisibility, setContactVisibility] = useState("connections")
  const [settings, setSettings] = useState({
    showOnlineStatus: true,
    allowMessaging: true,
    showProfileViews: true,
    allowJobAlerts: true,
    allowRecruiters: true,
    showSalaryExpectations: false,
    allowDataSharing: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings({
      ...settings,
      [setting]: value,
    })
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // Here you would normally make an API call to save the settings
      // await api.post('/user/privacy-settings', {
      //   profileVisibility,
      //   resumeVisibility,
      //   contactVisibility,
      //   ...settings
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Settings saved successfully",
        description: "Your privacy settings have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem updating your privacy settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-medium text-dark-gray">Privacy Settings</h2>
        </div>
        <p className="text-gray-500 mb-6">
          Control who can see your profile information and how your data is used on JobHunt.
        </p>
      </div>

      {/* Profile Visibility */}
      <div className="space-y-4">
        <h3 className="font-medium text-dark-gray">Profile Visibility</h3>
        <div className="border rounded-md p-4 bg-light-gray">
          <RadioGroup value={profileVisibility} onValueChange={setProfileVisibility}>
            <div className="flex items-start space-x-2 mb-3">
              <RadioGroupItem value="public" id="public" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="public" className="font-medium">
                  Public
                </Label>
                <p className="text-sm text-gray-500">Your profile is visible to everyone, including search engines.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 mb-3">
              <RadioGroupItem value="registered" id="registered" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="registered" className="font-medium">
                  Registered Users Only
                </Label>
                <p className="text-sm text-gray-500">Only registered JobHunt users can view your profile.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="private" id="private" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="private" className="font-medium">
                  Private
                </Label>
                <p className="text-sm text-gray-500">Your profile is only visible to companies you apply to.</p>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Resume Visibility */}
      <div className="space-y-4">
        <h3 className="font-medium text-dark-gray">Resume Visibility</h3>
        <div className="border rounded-md p-4 bg-light-gray">
          <RadioGroup value={resumeVisibility} onValueChange={setResumeVisibility}>
            <div className="flex items-start space-x-2 mb-3">
              <RadioGroupItem value="public" id="resume-public" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="resume-public" className="font-medium">
                  Public
                </Label>
                <p className="text-sm text-gray-500">Your resume is visible to all employers and recruiters.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 mb-3">
              <RadioGroupItem value="registered" id="resume-registered" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="resume-registered" className="font-medium">
                  Registered Employers Only
                </Label>
                <p className="text-sm text-gray-500">Only verified employers can view your resume.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="private" id="resume-private" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="resume-private" className="font-medium">
                  Private
                </Label>
                <p className="text-sm text-gray-500">Your resume is only visible when you apply to specific jobs.</p>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Contact Information Visibility */}
      <div className="space-y-4">
        <h3 className="font-medium text-dark-gray">Contact Information Visibility</h3>
        <div className="border rounded-md p-4 bg-light-gray">
          <Select value={contactVisibility} onValueChange={setContactVisibility}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select who can see your contact information" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="registered">Registered Users</SelectItem>
              <SelectItem value="connections">Connections Only</SelectItem>
              <SelectItem value="applied">Companies I've Applied To</SelectItem>
              <SelectItem value="nobody">Nobody</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-2">This controls who can see your email address and phone number.</p>
        </div>
      </div>

      {/* Additional Privacy Settings */}
      <div className="space-y-4">
        <h3 className="font-medium text-dark-gray">Additional Settings</h3>
        <div className="border rounded-md p-4 bg-light-gray space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="online-status" className="font-medium">
                Show Online Status
              </Label>
              <p className="text-sm text-gray-500">Let others know when you're active on JobHunt</p>
            </div>
            <Switch
              id="online-status"
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) => handleSettingChange("showOnlineStatus", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow-messaging" className="font-medium">
                Allow Messaging
              </Label>
              <p className="text-sm text-gray-500">Receive messages from employers and recruiters</p>
            </div>
            <Switch
              id="allow-messaging"
              checked={settings.allowMessaging}
              onCheckedChange={(checked) => handleSettingChange("allowMessaging", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="profile-views" className="font-medium">
                Show Profile Views
              </Label>
              <p className="text-sm text-gray-500">See who viewed your profile</p>
            </div>
            <Switch
              id="profile-views"
              checked={settings.showProfileViews}
              onCheckedChange={(checked) => handleSettingChange("showProfileViews", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="job-alerts" className="font-medium">
                Job Alerts
              </Label>
              <p className="text-sm text-gray-500">Receive notifications about new job opportunities</p>
            </div>
            <Switch
              id="job-alerts"
              checked={settings.allowJobAlerts}
              onCheckedChange={(checked) => handleSettingChange("allowJobAlerts", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow-recruiters" className="font-medium">
                Open to Recruiters
              </Label>
              <p className="text-sm text-gray-500">Allow recruiters to contact you about opportunities</p>
            </div>
            <Switch
              id="allow-recruiters"
              checked={settings.allowRecruiters}
              onCheckedChange={(checked) => handleSettingChange("allowRecruiters", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="salary-expectations" className="font-medium">
                Show Salary Expectations
              </Label>
              <p className="text-sm text-gray-500">Display your salary expectations on your profile</p>
            </div>
            <Switch
              id="salary-expectations"
              checked={settings.showSalaryExpectations}
              onCheckedChange={(checked) => handleSettingChange("showSalaryExpectations", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="data-sharing" className="font-medium">
                Data Sharing for Research
              </Label>
              <p className="text-sm text-gray-500">Allow anonymous data to be used for improving JobHunt</p>
            </div>
            <Switch
              id="data-sharing"
              checked={settings.allowDataSharing}
              onCheckedChange={(checked) => handleSettingChange("allowDataSharing", checked)}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          className="bg-accent hover:bg-accent/90" 
          onClick={handleSaveSettings}
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-1" /> 
          {isLoading ? "Saving..." : "Save Privacy Settings"}
        </Button>
      </div>
    </div>
  )
}
