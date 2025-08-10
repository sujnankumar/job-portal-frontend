import {
  BriefcaseBusiness,
  Code,
  Building2,
  Briefcase,
  Microscope,
  ShoppingBag,
  BookOpen,
  Truck,
  PieChart,
  Building,
  CircleHelp,
} from "lucide-react"
import { useEffect, useState } from "react"
import api from "@/lib/axios"
import Link from "next/link"

const iconMap: Record<string, React.ElementType> = {
  Technology: Code,
  Business: BriefcaseBusiness,
  Healthcare: Microscope,
  Education: BookOpen,
  Engineering: Building2,
  Finance: PieChart,
  Retail: ShoppingBag,
  Logistics: Truck,
  Government: Building,
  Administration: Briefcase,
}

async function fetchCategories() {
  // Replace with your actual API endpoint
  const res = await api.get("/job/categories/popular")
  if (!res.data) throw new Error("Failed to fetch categories")
  return res.data.categories
}

export default function JobCategories() {
  const [categories, setCategories] = useState<
    { name: string; count: number }[]
  >([])

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {categories.map((category) => {
        const Icon = iconMap[category.name] || CircleHelp
        return (
          <Link
            key={category.name}
            href={`/jobs?industry=${encodeURIComponent(category.name)}`}
            className="bg-white p-4 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer border border-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="inline-flex p-3 rounded-full bg-light-cream mb-3">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium text-dark-gray">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.count} jobs</p>
          </Link>
        )
      })}
    </div>
  )
}