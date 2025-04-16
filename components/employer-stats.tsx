import { Users, Briefcase, Eye } from "lucide-react"

export default function EmployerStats() {
  const stats = [
    {
      title: "Active Jobs",
      value: "12",
      icon: Briefcase,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Applications",
      value: "143",
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Profile Views",
      value: "2,456",
      icon: Eye,
      color: "bg-purple-100 text-purple-600",
    },
  ]

  return (
    <>
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-dark-gray">{stat.value}</h3>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
