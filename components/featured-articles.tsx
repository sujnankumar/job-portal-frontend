import Image from "next/image"
import Link from "next/link"
import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data for featured articles
const featuredArticles = [
  {
    id: "1",
    title: "10 Resume Tips That Will Help You Get Hired",
    excerpt:
      "Learn how to create a standout resume that will catch the attention of hiring managers and help you land your dream job.",
    category: "Resume & Cover Letters",
    author: "Jane Smith",
    date: "May 15, 2023",
    image: "/placeholder.svg?height=400&width=800&query=resume writing",
    readTime: "8 min read",
  },
  {
    id: "2",
    title: "How to Ace Your Next Job Interview",
    excerpt:
      "Prepare for your next job interview with these expert tips and strategies that will help you make a great impression.",
    category: "Interview Tips",
    author: "John Doe",
    date: "June 2, 2023",
    image: "/placeholder.svg?height=400&width=800&query=job interview",
    readTime: "10 min read",
  },
  {
    id: "3",
    title: "Negotiating Your Salary: A Complete Guide",
    excerpt:
      "Learn how to negotiate your salary with confidence and get the compensation you deserve for your skills and experience.",
    category: "Salary & Negotiation",
    author: "Sarah Johnson",
    date: "April 28, 2023",
    image: "/placeholder.svg?height=400&width=800&query=salary negotiation",
    readTime: "12 min read",
  },
]

export default function FeaturedArticles() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-dark-gray mb-6">Featured Articles</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredArticles.map((article, index) => (
          <Link key={article.id} href={`/career-advice/${article.id}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="relative h-48 w-full bg-light-gray">
                <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <Badge className="self-start mb-2 bg-accent text-white">{article.category}</Badge>

                <h3 className="font-semibold text-dark-gray text-lg mb-2 line-clamp-2">{article.title}</h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{article.excerpt}</p>

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
    </div>
  )
}
