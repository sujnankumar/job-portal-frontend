import { useEffect, useState } from "react"
import { Users, Briefcase, Eye } from "lucide-react"
import api from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"

export default function EmployerStats() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    active_jobs: 0,
    total_applications: 0,
    profile_views: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.token) return
      try {
        const res = await api.get("/employer_stats", {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        setStats(res.data)
      } catch (err) {
        setStats({ active_jobs: 0, total_applications: 0, profile_views: 0 })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user])

  const statList = [
    {
      title: "Active Jobs",
      value: loading ? "-" : stats.active_jobs,
      icon: Briefcase,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Applications",
      value: loading ? "-" : stats.total_applications,
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Profile Views",
      value: loading ? "-" : stats.profile_views,
      icon: Eye,
      color: "bg-purple-100 text-purple-600",
    },
  ]

  return (
    <>
      {statList.map((stat) => (
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
