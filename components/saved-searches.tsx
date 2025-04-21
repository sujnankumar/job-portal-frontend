import { LucideHeart, Search, ArrowRight, Clock, Bell, BellOff } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

const savedSearches = [
  {
    id: "1",
    name: "Full Stack Developer in New York",
    keywords: "Full Stack, Developer, React, Node.js",
    location: "New York, NY",
    results: 56,
    lastChecked: "12 hours ago",
    alerts: true,
  },
  {
    id: "2",
    name: "Remote UX Designer",
    keywords: "UX, Designer, Remote, User Experience",
    location: "Remote",
    results: 34,
    lastChecked: "2 days ago",
    alerts: false,
  },
  {
    id: "3",
    name: "Product Manager in San Francisco",
    keywords: "Product Manager, Product Development",
    location: "San Francisco, CA",
    results: 28,
    lastChecked: "5 days ago",
    alerts: true,
  },
]

export default function SavedSearches() {
  // If there are no saved searches, show a placeholder card
  if (savedSearches.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
        <div className="inline-flex p-4 rounded-full bg-light-cream mb-4">
          <LucideHeart className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium text-dark-gray mb-2">No saved searches yet</h3>
        <p className="text-gray-500 mb-6">
          Save your search criteria to get notified when new jobs match your preferences
        </p>
        <Button className="bg-primary hover:bg-primary/90">
          <Search className="mr-2 h-4 w-4" /> Start a search
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {savedSearches.map((search) => (
        <div
          key={search.id}
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-dark-gray">{search.name}</h3>
            <div className="flex items-center space-x-2">
              {search.alerts ? <Bell className="h-4 w-4 text-accent" /> : <BellOff className="h-4 w-4 text-gray-400" />}
              <Switch checked={search.alerts} />
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-500">
            <p className="line-clamp-1">{search.keywords}</p>
            <p>{search.location}</p>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5 mr-1" />
              Checked {search.lastChecked}
            </div>
            <div className="text-sm font-medium text-accent">{search.results} jobs</div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
            <Button variant="outline" size="sm">
              Edit
            </Button>
            <Link href={`/jobs?search=${search.id}`}>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                View Results <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
