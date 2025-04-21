import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { MapPin, Briefcase, Users, Calendar, ExternalLink, Star, Mail, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CompanyJobs from "@/components/company-jobs"

export const metadata: Metadata = {
  title: "Company Profile | JobPortal",
  description: "View company profile and open positions",
}

// Mock data for a single company
const company = {
  id: "1",
  name: "Tech Innovations Inc.",
  logo: "/abstract-circuit-board.png",
  coverImage: "/san-francisco-street-grid.png",
  description:
    "Tech Innovations Inc. is a leading technology company focused on innovative solutions for businesses and consumers. We specialize in developing cutting-edge software, hardware, and cloud services that help our clients stay ahead in today's rapidly evolving digital landscape.\n\nFounded in 2010, we've grown from a small startup to a global enterprise with offices in major tech hubs around the world. Our team of talented engineers, designers, and business professionals is dedicated to creating products that make a difference.",
  industry: "Technology",
  location: "San Francisco, CA",
  size: "1000-5000 employees",
  founded: 2010,
  website: "https://example.com",
  openPositions: 12,
  rating: 4.5,
  benefits: [
    "Competitive salary and equity",
    "Health, dental, and vision insurance",
    "401(k) matching",
    "Flexible work arrangements",
    "Professional development budget",
    "Generous paid time off",
    "Parental leave",
    "Wellness programs",
  ],
  culture:
    "At Tech Innovations, we believe in fostering a culture of innovation, collaboration, and continuous learning. We value diversity of thought and background, and we're committed to creating an inclusive environment where everyone can do their best work.",
  contact: {
    email: "careers@techinnovations.example",
    phone: "+1 (555) 123-4567",
    address: "123 Tech Boulevard, San Francisco, CA 94105",
  },
}

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Company Header */}
      <div className="relative mb-8">
        <div className="h-48 w-full rounded-xl overflow-hidden bg-light-gray">
          <Image
            src={company.coverImage || "/placeholder.svg"}
            alt={`${company.name} cover`}
            width={1200}
            height={300}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center p-2">
          <Image
            src={company.logo || "/placeholder.svg"}
            alt={`${company.name} logo`}
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
      </div>

      {/* Company Info */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-dark-gray">{company.name}</h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {company.location}
                </div>
              </div>

              <div className="flex items-center bg-light-gray px-3 py-1.5 rounded-full">
                <Star className="h-5 w-5 text-yellow-400 mr-1" />
                <span className="font-medium">{company.rating}</span>
                <span className="text-gray-500 ml-1">/5</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <div className="flex items-center text-gray-600">
                <Briefcase className="h-4 w-4 mr-1" />
                {company.industry}
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {company.size}
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                Founded {company.founded}
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-light-gray">
                  {company.openPositions} open positions
                </Badge>
              </div>
            </div>

            <Tabs defaultValue="about">
              <TabsList className="mb-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="culture">Culture & Benefits</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4">
                <div className="prose max-w-none text-gray-700">
                  {company.description.split("\n\n").map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                <div className="flex mt-4">
                  <Button asChild variant="outline" size="sm">
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="culture" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-dark-gray mb-3">Company Culture</h3>
                  <p className="text-gray-700">{company.culture}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-dark-gray mb-3">Benefits & Perks</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {company.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent mr-2"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-light-gray rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <h3 className="font-medium">Email</h3>
                    </div>
                    <a href={`mailto:${company.contact.email}`} className="text-accent hover:underline">
                      {company.contact.email}
                    </a>
                  </div>

                  <div className="bg-light-gray rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <h3 className="font-medium">Phone</h3>
                    </div>
                    <a href={`tel:${company.contact.phone}`} className="text-accent hover:underline">
                      {company.contact.phone}
                    </a>
                  </div>

                  <div className="bg-light-gray rounded-lg p-4 md:col-span-2">
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <h3 className="font-medium">Address</h3>
                    </div>
                    <p>{company.contact.address}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold text-dark-gray mb-4">Quick Actions</h2>

            <div className="space-y-3">
              <Button className="w-full bg-accent hover:bg-accent/90">
                <Link href={`/jobs?company=${company.id}`} className="w-full">
                  View All Jobs
                </Link>
              </Button>

              <Button variant="outline" className="w-full">
                Follow Company
              </Button>

              <Button variant="outline" className="w-full">
                <Link href={`/companies/${company.id}/reviews`} className="w-full">
                  Read Reviews
                </Link>
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-dark-gray mb-4">Similar Companies</h2>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Link href={`/companies/${i + 1}`} key={i} className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-light-gray transition-colors">
                    <div className="w-10 h-10 bg-light-gray rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                      <Image
                        src={`/diverse-team-brainstorm.png?height=40&width=40&query=company ${i} logo`}
                        alt={`Similar company ${i}`}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-dark-gray">Similar Company {i}</h3>
                      <p className="text-xs text-gray-500">{5 - i} open positions</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Company Jobs */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-dark-gray mb-6">Open Positions</h2>
        <CompanyJobs companyId={params.id} />
      </div>
    </div>
  )
}
