import { useState, useEffect } from "react"
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
import api from "@/lib/axios"

export default function HomePage() {
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("")
  const [jobTypes, setJobTypes] = useState<string[]>([])
  const jobTypeOptions = ["Full-time", "Part-time", "Contract", "Internship"]
  const [booleanQuery, setBooleanQuery] = useState("")


  const handleSearch = () => {
    // Build query params
    const params = new URLSearchParams()
    if (search)   params.set("search", search)
    if (location) params.set("location", location)
  if (jobTypes)  jobTypes.forEach(type => params.append("jobType", type))
  if (booleanQuery.trim()) params.set("boolean", booleanQuery.trim())

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
              <details className="bg-white rounded-lg shadow-md p-4 group">
                <summary className="font-semibold text-dark-gray cursor-pointer select-none flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180 text-gray-500" />
                    Boolean Search Builder
                  </span>
                  <span className="text-xs font-normal text-gray-500">Advanced</span>
                </summary>
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <Input
                      value={booleanQuery}
                      onChange={(e) => setBooleanQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch() } }}
                      placeholder="Build expression: e.g. (React OR Angular) AND (developer OR engineer) NOT junior"
                      className="w-full h-12 pr-10"
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label="Run Boolean Search"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  </div>
                  <BooleanBuilder
                    value={booleanQuery}
                    onChange={setBooleanQuery}
                  />
                  <p className="text-xs text-gray-500/70 text-left leading-relaxed">
                    Click buttons to insert operators/keywords. Expression supports AND, OR, NOT and parentheses (). Quotes "phrase here" match exact phrases.
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
      {/* <section className="container mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-bold text-dark-gray mb-8">Your Saved Searches</h2>
        <SavedSearches />
      </section> */}
    </div>
  )
}

// Extended Boolean Builder with dynamic metadata-driven sections
interface JobMeta {
  jobTypes: string[]
  industries: string[]
  locations: string[]
  locationTypes: string[]
  experienceLevels: string[]
  companies: string[]
  tags: string[]
}

function BooleanBuilder({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [loadingMeta, setLoadingMeta] = useState(false)
  const [meta, setMeta] = useState<JobMeta>({ jobTypes: [], industries: [], locations: [], locationTypes: [], experienceLevels: [], companies: [], tags: [] })

  useEffect(() => {
    const fetchMeta = async () => {
      setLoadingMeta(true)
      try {
  const res = await api.get('/job/list')
  const jobs: any[] = res.data || []
  const grab = (field: string): string[] => Array.from(new Set<string>(jobs.map((j: any) => j[field]).filter(Boolean).map((v: any) => String(v))))
  const collectTags: string[] = Array.from(new Set<string>(jobs.flatMap((j: any) => (j.tags || []).map((t: any) => String(t))).filter(Boolean)))
        // job_category vs job_category potential misspelling already standardized as job_category
        setMeta({
          jobTypes: grab('employment_type').sort(),
            industries: grab('job_category').sort(),
          locations: grab('location').sort(),
          locationTypes: grab('location_type').sort(),
          experienceLevels: grab('experience_level').sort(),
          companies: grab('company').sort(),
          tags: collectTags.sort()
        })
      } catch (e) {
        // silently fail; user still has manual input
      } finally {
        setLoadingMeta(false)
      }
    }
    fetchMeta()
  }, [])

  const insert = (token: string) => {
    onChange(value.trim() ? value + ' ' + token : token)
  }
  const wrapExpr = () => { if (value) onChange('(' + value + ')') }
  const clear = () => onChange('')
  const sections: { title: string; items: string[]; quote?: boolean }[] = [
    { title: 'Job Type', items: meta.jobTypes, quote: true },
    { title: 'Industry', items: meta.industries, quote: true },
    { title: 'Location Type', items: meta.locationTypes, quote: true },
    { title: 'Location', items: meta.locations, quote: true },
    { title: 'Experience Level', items: meta.experienceLevels, quote: true },
    { title: 'Company', items: meta.companies, quote: true },
    { title: 'Tags / Skills', items: meta.tags.slice(0, 40), quote: true },
  ]
  const operators = ['AND', 'OR', 'NOT']
  const parens = ['(', ')']

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {operators.map(op => (
          <button key={op} type="button" onClick={() => insert(op)} className="px-3 py-1 text-xs font-semibold rounded bg-accent text-white hover:bg-accent/90">{op}</button>
        ))}
        {parens.map(p => (
          <button key={p} type="button" onClick={() => insert(p)} className="px-2 py-1 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-100">{p}</button>
        ))}
        <button type="button" onClick={wrapExpr} className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100" title="Wrap entire expression">(expr)</button>
        <button type="button" onClick={clear} className="px-2 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50">Clear</button>
      </div>
      {loadingMeta && <div className="text-xs text-gray-500">Loading options...</div>}
      <div className="grid md:grid-cols-2 gap-4">
        {sections.map(sec => sec.items.length > 0 && (
          <div key={sec.title} className="space-y-1">
            <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{sec.title}</h5>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-auto border border-gray-100 p-2 rounded">
              {sec.items.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => insert(sec.quote ? '"' + item + '"' : item)}
                  className="px-2 py-0.5 text-[10px] rounded bg-gray-100 hover:bg-gray-200 border border-gray-200"
                  title={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
