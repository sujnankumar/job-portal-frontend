import Image from "next/image"
import { Camera, MapPin, Briefcase, Mail, Phone, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ProfileHeader() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-primary to-accent relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute bottom-3 right-3 bg-white/80 hover:bg-white text-dark-gray"
        >
          <Camera className="h-4 w-4 mr-1" /> Change Cover
        </Button>
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6 relative">
        {/* Profile Picture */}
        <div className="absolute -top-16 left-6 border-4 border-white rounded-full">
          <div className="relative">
            <Image
              src="/mystical-forest-spirit.png"
              width={128}
              height={128}
              alt="Profile"
              className="rounded-full h-32 w-32 object-cover"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-white hover:bg-light-gray"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="mt-20 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-dark-gray">Jane Smith</h1>
              <Badge className="bg-primary text-dark-gray">Available for work</Badge>
            </div>
            <h2 className="text-lg text-gray-600 mt-1">Senior Frontend Developer</h2>
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                San Francisco, CA
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                5+ years experience
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                jane.smith@example.com
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                (555) 123-4567
              </div>
            </div>
          </div>

          <Button className="md:self-end bg-accent hover:bg-accent/90">
            <Pencil className="h-4 w-4 mr-1" /> Edit Profile
          </Button>
        </div>
      </div>
    </div>
  )
}
