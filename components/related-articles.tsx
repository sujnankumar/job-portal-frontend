import Image from "next/image"
import Link from "next/link"
import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data for related articles
const relatedArticles = [
  {
    id: "2",
    title: "How to Write a Cover Letter That Gets Noticed",
    excerpt:
      "Tips and examples for writing a cover letter that will help you stand out from the competition and land an interview.",
    category: "Resume & Cover Letters",
    author: "Lisa Taylor",
    date: "June 20, 2023",
    image: "/placeholder.svg?height=200&width=300&query=cover letter",
    readTime: "8 min read",
  },
  {
    id: "3",
    title: "The Do's and Don'ts of Resume Formatting",
    excerpt: "Learn the best practices for formatting your resume to make it visually appealing and easy to read.",
    category: "Resume & Cover Letters",
    author: "Michael Brown",
    date: "April 12, 2023",
    image: "/placeholder.svg?height=200&width=300&query=resume format",
    readTime: "6 min read",
  },
  {
    id: "4",
    title: "How to Address Employment Gaps on Your Resume",
    excerpt: "Strategies for explaining employment gaps on your resume in a way that won't hurt your job prospects.",
    category: "Resume & Cover Letters",
    author: "Jane Smith",
    date: "March 5, 2023",
    image: "/placeholder.svg?height=200&width=300&query=employment gaps",
    readTime: "7 min read",
  },
]

export default function RelatedArticles() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {relatedArticles.map((article) => (
        <Link key={article.id} href={`/career-advice/${article.id}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="relative h-40 w-full bg-light-gray">
              <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <Badge className="self-start mb-2 bg-accent text-white">{article.category}</Badge>

              <h3 className="font-semibold text-dark-gray text-lg mb-2 line-clamp-2">{article.title}</h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{article.excerpt}</p>

              <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {article.date}
                </div>
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
