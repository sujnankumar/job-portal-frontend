import type { Metadata } from "next"
import CompanySearch from "@/components/company-search"
import CompanyListings from "@/components/company-listings"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Companies | JobPortal",
  description: "Browse and search for companies hiring on JobPortal",
}

export default function CompaniesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-gray mb-2">Companies</h1>
        <p className="text-gray-600">
          Discover great places to work. Browse company profiles, reviews, and open positions.
        </p>
      </div>

      <CompanySearch />
      <Separator className="my-6" />
      <CompanyListings />
    </div>
  )
}
