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
} from "lucide-react"

const categories = [
  { name: "Technology", icon: Code, count: 1243 },
  { name: "Business", icon: BriefcaseBusiness, count: 876 },
  { name: "Healthcare", icon: Microscope, count: 654 },
  { name: "Education", icon: BookOpen, count: 432 },
  { name: "Engineering", icon: Building2, count: 567 },
  { name: "Finance", icon: PieChart, count: 321 },
  { name: "Retail", icon: ShoppingBag, count: 432 },
  { name: "Logistics", icon: Truck, count: 284 },
  { name: "Government", icon: Building, count: 198 },
  { name: "Administration", icon: Briefcase, count: 345 },
]

export default function JobCategories() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {categories.map((category) => (
        <div
          key={category.name}
          className="bg-white p-4 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
        >
          <div className="inline-flex p-3 rounded-full bg-light-cream mb-3">
            <category.icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium text-dark-gray">{category.name}</h3>
          <p className="text-sm text-gray-500">{category.count} jobs</p>
        </div>
      ))}
    </div>
  )
}
