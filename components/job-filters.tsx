"use client"

import { useEffect, useRef, useState } from "react"
import { Filter, ChevronDown, X, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import api from "@/lib/axios"

export interface JobFiltersState {
  jobTypes: string[];
  experienceLevels: string[];
  salaryRange: [number, number];
  location: string;
  industries: string[];
  skills: string[];
  locationTypes?: string[];
  search?: string;
  booleanQuery?: string;
}

interface JobFiltersProps {
  filters: JobFiltersState;
  setFilters: (filters: JobFiltersState) => void;
}

export default function JobFilters({ filters, setFilters }: JobFiltersProps) {
  // Handlers for filter changes
  console.log(filters)
  const handleJobTypeChange = (type: string, checked: boolean) => {
    setFilters({
      ...filters,
      jobTypes: checked
        ? [...filters.jobTypes, type]
        : filters.jobTypes.filter((t) => t !== type),
    })
  }

  const handleExperienceLevelChange = (level: string, checked: boolean) => {
    setFilters({
      ...filters,
      experienceLevels: checked
        ? [...filters.experienceLevels, level]
        : filters.experienceLevels.filter((l) => l !== level),
    })
  }

  const handleLocationTypeChange = (type: string, checked: boolean) => {
    setFilters({
      ...filters,
      locationTypes: checked
        ? [...(filters.locationTypes || []), type]
        : (filters.locationTypes || []).filter((t) => t !== type),
    })
  }

  const [showAllIndustries, setShowAllIndustries] = useState(false)

  const handleIndustryChange = (industry: string, checked: boolean) => {
    setFilters({
      ...filters,
      industries: checked
        ? [...filters.industries, industry]
        : filters.industries.filter((i) => i !== industry),
    })
  }

  const mainIndustries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
  ]
  const moreIndustries = [
    "Business",
    "Engineering",
    "Logistics",
    "Government",
    "Administration",
    "Other",
  ]
  const allIndustries = [...mainIndustries, ...moreIndustries]

  // Accordion open state for each filter
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({})

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Skills dropdown state
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [allSkills, setAllSkills] = useState<string[]>([])
  const [topSkills, setTopSkills] = useState<string[]>([])
  const [otherSkills, setOtherSkills] = useState<string[]>([])
  const [showOtherSkills, setShowOtherSkills] = useState(false)
  const [skillsQuery, setSkillsQuery] = useState("")
  const skillsSectionRef = useRef<HTMLDivElement | null>(null)

  // Fetch skills once (derive from jobs) when Skills section first opened OR immediately
  useEffect(() => {
    const fetchSkills = async () => {
      if (allSkills.length > 0 || skillsLoading) return
      setSkillsLoading(true)
      try {
        const res = await api.get("/job/list")
        const freq: Record<string, number> = {}
        for (const job of res.data || []) {
          const jobSkills = Array.isArray(job.skills) ? job.skills : []
          for (let sk of jobSkills) {
            if (!sk) continue
            // normalize case (trim, collapse spaces)
            sk = String(sk).trim()
            if (!sk) continue
            const key = sk.toLowerCase()
            freq[key] = (freq[key] || 0) + 1
          }
        }
        const sorted = Object.entries(freq)
          .sort((a,b) => b[1]-a[1])
          .map(([k]) => k)
        // Reconstruct display case: Title Case for consistency
        const toDisplay = sorted.map(k => k.split(/\s+/).map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(" "))
        const top = toDisplay.slice(0,20)
        const rest = toDisplay.slice(20)
        setAllSkills(toDisplay)
        setTopSkills(top)
        setOtherSkills(rest)
      } catch (e) {
        // silently ignore; keep no skills if failure
      } finally {
        setSkillsLoading(false)
      }
    }
    fetchSkills()
  }, [allSkills.length, skillsLoading])

  // Auto-scroll into view when expanding skills (so user sees list start)
  useEffect(() => {
    if (openSections["skills"] && skillsSectionRef.current) {
      const elTop = skillsSectionRef.current.getBoundingClientRect().top
      if (elTop < 80) {
        skillsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [openSections["skills"]])

  const toggleSkill = (skill: string) => {
    const exists = filters.skills.includes(skill)
    setFilters({
      ...filters,
      skills: exists ? filters.skills.filter(s => s !== skill) : [...filters.skills, skill]
    })
  }

  const removeSkill = (skill: string) => {
    setFilters({ ...filters, skills: filters.skills.filter(s => s !== skill) })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-20 max-h-[calc(100vh-6rem)] flex flex-col">
      <div className="p-5 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-dark-gray" />
            <h2 className="font-medium text-dark-gray">Filters</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-accent" onClick={() => setFilters({ jobTypes: [], experienceLevels: [], salaryRange: [0, 20], location: '', industries: [], skills: [], booleanQuery: '' })}>
            Reset
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto px-5 py-2 flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <Accordion type="multiple" defaultValue={[]}> 
          {/* Job Type */}
          <AccordionItem value="jobType" className="border-b border-gray-100">
            <AccordionTrigger className="py-3 text-sm font-medium text-dark-gray" onClick={() => toggleSection("jobType")}>Job Type</AccordionTrigger>
            {openSections["jobType"] && (
              <AccordionContent className="pb-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="full-time" checked={filters.jobTypes.includes("Full-time")} onCheckedChange={(checked) => handleJobTypeChange("Full-time", !!checked)} />
                    <label
                      htmlFor="full-time"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Full-time
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="part-time" checked={filters.jobTypes.includes("Part-time")} onCheckedChange={(checked) => handleJobTypeChange("Part-time", !!checked)} />
                    <label
                      htmlFor="part-time"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Part-time
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="contract" checked={filters.jobTypes.includes("Contract")} onCheckedChange={(checked) => handleJobTypeChange("Contract", !!checked)} />
                    <label
                      htmlFor="contract"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Contract
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="internship" checked={filters.jobTypes.includes("Internship")} onCheckedChange={(checked) => handleJobTypeChange("Internship", !!checked)} />
                    <label
                      htmlFor="internship"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Internship
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="temporary" checked={filters.jobTypes.includes("Temporary")} onCheckedChange={(checked) => handleJobTypeChange("Temporary", !!checked)} />
                    <label
                      htmlFor="temporary"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Temporary
                    </label>
                  </div>
                </div>
              </AccordionContent>
            )}
          </AccordionItem>

          {/* Experience Level */}
          <AccordionItem value="experience" className="border-b border-gray-100">
            <AccordionTrigger className="py-3 text-sm font-medium text-dark-gray" onClick={() => toggleSection("experience")}>Experience Level</AccordionTrigger>
            {openSections["experience"] && (
              <AccordionContent className="pb-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="entry-level" checked={filters.experienceLevels.includes("Entry Level")} onCheckedChange={(checked) => handleExperienceLevelChange("Entry Level", !!checked)} />
                    <label
                      htmlFor="entry-level"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Entry Level
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="mid-level" checked={filters.experienceLevels.includes("Mid Level")} onCheckedChange={(checked) => handleExperienceLevelChange("Mid Level", !!checked)} />
                    <label
                      htmlFor="mid-level"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Mid Level
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="senior-level" checked={filters.experienceLevels.includes("Senior Level")} onCheckedChange={(checked) => handleExperienceLevelChange("Senior Level", !!checked)} />
                    <label
                      htmlFor="senior-level"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Senior Level
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="director" checked={filters.experienceLevels.includes("Director")} onCheckedChange={(checked) => handleExperienceLevelChange("Director", !!checked)} />
                    <label
                      htmlFor="director"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Director
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="executive" checked={filters.experienceLevels.includes("Executive")} onCheckedChange={(checked) => handleExperienceLevelChange("Executive", !!checked)} />
                    <label
                      htmlFor="executive"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Executive
                    </label>
                  </div>
                </div>
              </AccordionContent>
            )}
          </AccordionItem>

          {/* Salary Range */}
          <AccordionItem value="salary" className="border-b border-gray-100">
            <AccordionTrigger className="py-3 text-sm font-medium text-dark-gray" onClick={() => toggleSection("salary")}>Salary (LPA)</AccordionTrigger>
            {openSections["salary"] && (
              <AccordionContent className="pb-3">
                <div className="space-y-4">
                  <Slider
                    defaultValue={[0, 20]}
                    max={20}
                    min={0}
                    step={1}
                    value={filters.salaryRange}
                    onValueChange={(range) => {
                      let [min, max] = range as [number, number]
                      if (min < 0) min = 0
                      if (max > 20) max = 20
                      if (min >= max) {
                        if (min === 20) { min = 19; max = 20 } else { max = min + 1 }
                      }
                      setFilters({ ...filters, salaryRange: [min, max] })
                    }}
                    className="my-6"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-full">
                      <p className="text-xs text-gray-500 mb-1">Min (LPA)</p>
                      <Input
                        type="number"
                        min={0}
                        max={19}
                        value={filters.salaryRange[0]}
                        onChange={(e) => {
                          let val = parseInt(e.target.value, 10)
                          if (isNaN(val)) val = 0
                          if (val < 0) val = 0
                          if (val > 19) val = 19
                          let max = filters.salaryRange[1]
                          if (val >= max) max = Math.min(val + 1, 20)
                          setFilters({ ...filters, salaryRange: [val, max] })
                        }}
                      />
                    </div>
                    <div className="w-full">
                      <p className="text-xs text-gray-500 mb-1">Max (LPA)</p>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={filters.salaryRange[1]}
                        onChange={(e) => {
                          let val = parseInt(e.target.value, 10)
                          if (isNaN(val)) val = 1
                          if (val < 1) val = 1
                          if (val > 20) val = 20
                          let min = filters.salaryRange[0]
                          if (min >= val) min = Math.max(0, val - 1)
                          setFilters({ ...filters, salaryRange: [min, val] })
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500">Annual CTC in Lakhs. Range 0–20 LPA. Min always &lt; Max. 20 LPA upper cap.</p>
                </div>
              </AccordionContent>
            )}
          </AccordionItem>

          {/* Location */}
          <AccordionItem value="location" className="border-b border-gray-100">
            <AccordionTrigger className="py-3 text-sm font-medium text-dark-gray" onClick={() => toggleSection("location")}>Location</AccordionTrigger>
            {openSections["location"] && (
              <AccordionContent className="pb-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remote" checked={filters.locationTypes?.includes("Remote") || false} onCheckedChange={(checked) => handleLocationTypeChange("Remote", !!checked)} />
                    <label htmlFor="remote" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Remote</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="hybrid" checked={filters.locationTypes?.includes("Hybrid") || false} onCheckedChange={(checked) => handleLocationTypeChange("Hybrid", !!checked)} />
                    <label htmlFor="hybrid" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Hybrid</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="onsite" checked={filters.locationTypes?.includes("On-site") || false} onCheckedChange={(checked) => handleLocationTypeChange("On-site", !!checked)} />
                    <label htmlFor="onsite" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">On-site</label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 mb-1">City or Zip Code</p>
                  <Input value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })} placeholder="Enter location" />
                </div>
              </AccordionContent>
            )}
          </AccordionItem>

          {/* Industry */}
          <AccordionItem value="industry" className="border-b border-gray-100">
            <AccordionTrigger className="py-3 text-sm font-medium text-dark-gray" onClick={() => toggleSection("industry")}>Industry</AccordionTrigger>
            {openSections["industry"] && (
              <AccordionContent className="pb-3">
                <div className="space-y-2">
                  {(showAllIndustries ? allIndustries : mainIndustries).map((industry) => (
                    <div className="flex items-center space-x-2" key={industry}>
                      <Checkbox id={industry.toLowerCase()} checked={filters.industries.includes(industry)} onCheckedChange={(checked) => handleIndustryChange(industry, !!checked)} />
                      <label htmlFor={industry.toLowerCase()} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {industry}
                      </label>
                    </div>
                  ))}
                  {!showAllIndustries && (
                    <Button variant="ghost" size="sm" className="text-primary mt-2" type="button" onClick={() => setShowAllIndustries(true)}>
                      Show more <ChevronDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </AccordionContent>
            )}
          </AccordionItem>

          {/* Skills */}
          <AccordionItem value="skills" className="border-b border-gray-100">
            <AccordionTrigger className="py-3 text-sm font-medium text-dark-gray" onClick={() => toggleSection("skills")}>Skills</AccordionTrigger>
            {openSections["skills"] && (
              <AccordionContent className="pb-4" ref={skillsSectionRef}>
                <div className="space-y-3">
                  <Input
                    placeholder="Search skills"
                    value={skillsQuery}
                    onChange={(e) => setSkillsQuery(e.target.value)}
                    className="h-8 text-xs"
                  />
                  {skillsLoading && <div className="py-4 text-center text-gray-500 text-[11px]">Loading skills...</div>}
                  {!skillsLoading && allSkills.length > 0 && (
                    <div className="space-y-2">
                      {/* Top Skills */}
                      {!skillsQuery && (
                        <div>
                          <p className="text-[10px] font-semibold text-gray-500 mb-1">Top Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {topSkills.map(skill => (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => toggleSkill(skill)}
                                className={`px-2 py-0.5 text-[11px] rounded border ${filters.skills.includes(skill) ? 'bg-accent text-white border-accent' : 'bg-light-gray hover:bg-light-gray/80 border-gray-200'} transition-colors`}
                              >{skill}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Filtered Skills List */}
                      <div className="max-h-52 overflow-y-auto border rounded-md p-2 bg-white">
                        <div className="grid grid-cols-2 gap-1">
                          {(skillsQuery ? allSkills.filter(s => s.toLowerCase().includes(skillsQuery.toLowerCase())) : (showOtherSkills ? otherSkills : otherSkills.slice(0, 30))).map(skill => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`text-left px-2 py-1 rounded border text-[11px] ${filters.skills.includes(skill) ? 'bg-accent text-white border-accent' : 'bg-light-gray/60 hover:bg-light-gray border-gray-200'} transition-colors`}
                            >{skill}</button>
                          ))}
                        </div>
                        {!skillsQuery && otherSkills.length > 30 && (
                          <div className="mt-2 text-center">
                            <button
                              type="button"
                              onClick={() => setShowOtherSkills(o => !o)}
                              className="text-[11px] text-accent hover:underline"
                            >
                              {showOtherSkills ? 'Show Less' : `Show All (${otherSkills.length})`}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {(!skillsLoading && allSkills.length === 0) && <p className="text-[11px] text-gray-500">No skills detected from current jobs.</p>}
                  {filters.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t mt-2">
                      {filters.skills.map(skill => (
                        <div key={skill} className="bg-light-gray text-dark-gray text-[11px] px-2 py-1 rounded-md flex items-center">
                          {skill}
                          <button type="button" aria-label={`Remove ${skill}`} onClick={() => removeSkill(skill)} className="ml-1 text-gray-500 hover:text-gray-700">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            )}
          </AccordionItem>
        </Accordion>
      </div>

      {/* <div className="p-5 pt-2 mt-auto border-t border-gray-100">
        <Button className="w-full bg-accent hover:bg-accent/90">Apply Filters</Button>
      </div> */}
    </div>
  )
}
