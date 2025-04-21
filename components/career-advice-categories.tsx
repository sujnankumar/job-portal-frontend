import Link from "next/link"
import { ChevronRight } from "lucide-react"

// Mock data for categories
const categories = [
  {
    id: "resume",
    name: "Resume & Cover Letters",
    count: 24,
  },
  {
    id: "interviews",
    name: "Interview Tips",
    count: 18,
  },
  {
    id: "job-search",
    name: "Job Search Strategies",
    count: 15,
  },
  {
    id: "career-development",
    name: "Career Development",
    count: 22,
  },
  {
    id: "workplace",
    name: "Workplace Success",
    count: 12,
  },
  {
    id: "salary",
    name: "Salary & Negotiation",
    count: 9,
  },
  {
    id: "remote-work",
    name: "Remote Work",
    count: 14,
  },
  {
    id: "career-change",
    name: "Career Change",
    count: 11,
  },
]

export default function CareerAdviceCategories() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-dark-gray mb-4">Categories</h2>

      <div className="space-y-1">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/career-advice/categories/${category.id}`}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-light-gray transition-colors"
          >
            <span className="text-gray-700">{category.name}</span>
            <div className="flex items-center text-gray-500">
              <span className="text-sm mr-1">{category.count}</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link href="/career-advice/categories" className="text-accent hover:underline text-sm font-medium">
          View All Categories
        </Link>
      </div>
    </div>
  )
}
