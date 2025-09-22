import type { Metadata } from "next"
import CareerAdviceSearch from "@/components/career-advice-search"
import CareerAdviceCategories from "@/components/career-advice-categories"
import FeaturedArticles from "@/components/featured-articles"
import RecentArticles from "@/components/recent-articles"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Career Advice | WOWR",
  description: "Career advice, tips, and resources for job seekers",
}

export default function CareerAdvicePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-gray mb-2">Career Advice</h1>
        <p className="text-gray-600">
          Expert tips, guides, and resources to help you advance your career and find your dream job.
        </p>
      </div>

      <CareerAdviceSearch />
      <Separator className="my-8" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <FeaturedArticles />
          <Separator className="my-8" />
          <RecentArticles />
        </div>

        <div>
          <CareerAdviceCategories />
        </div>
      </div>
    </div>
  )
}
