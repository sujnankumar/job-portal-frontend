import Image from "next/image"
import Link from "next/link"
import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data for recent articles
const recentArticles = [
  {
    id: "4",
    title: "5 Strategies for Finding Remote Work Opportunities",
    excerpt:
      "Discover effective strategies for finding and landing remote work opportunities in today's competitive job market.",
    category: "Remote Work",
    author: "Michael Brown",
    date: "July 10, 2023",
    image: "/placeholder.svg?height=200&width=300&query=remote work",
    readTime: "7 min read",
  },
  {
    id: "5",
    title: "How to Build a Professional Network That Works for You",
    excerpt:
      "Learn how to build and maintain a professional network that can help you advance your career and find new opportunities.",
    category: "Career Development",
    author: "Emily Chen",
    date: "July 5, 2023",
    image: "/placeholder.svg?height=200&width=300&query=professional networking",
    readTime: "9 min read",
  },
  {
    id: "6",
    title: "The Ultimate Guide to Changing Careers",
    excerpt:
      "Thinking about changing careers? This guide will help you navigate the process and make a successful transition.",
    category: "Career Change",
    author: "David Wilson",
    date: "June 28, 2023",
    image: "/placeholder.svg?height=200&width=300&query=career change",
    readTime: "15 min read",
  },
  {
    id: "7",
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
    id: "8",
    title: "Mastering the Art of the Follow-Up Email",
    excerpt:
      "Learn when and how to follow up after a job application or interview to increase your chances of success.",
    category: "Job Search Strategies",
    author: "Robert Johnson",
    date: "June 15, 2023",
    image: "/placeholder.svg?height=200&width=300&query=follow up email",
    readTime: "6 min read",
  },
]

export default function RecentArticles() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-dark-gray mb-6">Recent Articles</h2>

      <div className="space-y-6">
        {recentArticles.map((article) => (
          <Link key={article.id} href={`/career-advice/${article.id}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row">
                <div className="relative h-48 md:h-auto md:w-1/3 bg-light-gray">
                  <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
                </div>

                <div className="p-5 md:w-2/3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-accent text-white">{article.category}</Badge>
                    <span className="text-xs text-gray-500">{article.readTime}</span>
                  </div>

                  <h3 className="font-semibold text-dark-gray text-lg mb-2">{article.title}</h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>

                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {article.date} • by {article.author}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Link href="/career-advice/all">
          <Badge variant="outline" className="px-4 py-2 text-sm cursor-pointer hover:bg-light-gray">
            View All Articles
          </Badge>
        </Link>
      </div>
    </div>
  )
}
