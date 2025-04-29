import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import JobCategories from "@/components/job-categories"
import FeaturedJobs from "@/components/featured-jobs"
import SavedSearches from "@/components/saved-searches"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("")
  const [jobTypes, setJobTypes] = useState<string[]>([])
  const jobTypeOptions = ["Full-time", "Part-time", "Contract", "Internship"]


  const handleSearch = () => {
    // Build query params
    const params = new URLSearchParams()
    if (search)   params.set("search", search)
    if (location) params.set("location", location)
    if (jobTypes)  jobTypes.forEach(type => params.append("jobType", type))

    router.push(`/jobs?${params.toString()}`)
  }
  return (
    <div className="flex flex-col space-y-10 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary to-accent py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark-gray">
              Find Your <span className="text-white">Dream Job</span> Today
            </h1>
            <p className="text-dark-gray text-lg md:text-xl max-w-2xl">
              Browse through thousands of full-time and part-time jobs near you
            </p>

            {/* Main Search Bar */}
            <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Job title, keywords, or company"
            className="w-full h-12"
          />
          <Input
            value={location}
            onChange={(e) => setLocation(e.currentTarget.value)}
            placeholder="Location"
            className="w-full h-12"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-12 w-full justify-between">
                {jobTypes.length > 0 ? jobTypes.join(", ") : "Select Job Types"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
              <div className="flex flex-col gap-2">
                {jobTypeOptions.map((type) => (
                  <label key={type} className="flex items-center space-x-2">
                    <Checkbox
                      checked={jobTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        setJobTypes((prev) =>
                          checked ? [...prev, type] : prev.filter((t) => t !== type)
                        )
                      }}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

              {/* Advanced Filters */}
                <div className="flex justify-end">
                  <Button className="mt-3 md:mt-0 w-auto bg-accent hover:bg-accent/90 text-white" onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" /> Search Jobs
                  </Button>
                </div>
            </div>

            {/* Boolean Search */}
            <div className="w-full max-w-4xl mt-4">
              <details className="bg-white rounded-lg shadow-md p-4">
                <summary className="font-semibold text-dark-gray cursor-pointer">Boolean Search</summary>
                <div className="mt-4">
                  <Input
                    placeholder="e.g. (React OR Angular) AND (developer OR engineer) NOT junior"
                    className="w-full h-12"
                  />
                  <p className="text-xs text-gray-500/70 mt-2 text-left">
                    Use operators like AND, OR, NOT, and parentheses () to create more precise searches.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="container mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-bold text-dark-gray mb-8">Popular Job Categories</h2>
        <JobCategories />
      </section>

      {/* Featured Jobs */}
      <section className="container mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-bold text-dark-gray mb-8">Featured Jobs</h2>
        <FeaturedJobs />
      </section>

      {/* Saved Searches */}
      <section className="container mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-bold text-dark-gray mb-8">Your Saved Searches</h2>
        <SavedSearches />
      </section>
    </div>
  )
}
