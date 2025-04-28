"use client"

import { useEffect, useState } from "react"
import { Filter, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export interface JobFiltersState {
  jobTypes: string[];
  experienceLevels: string[];
  salaryRange: [number, number];
  location: string;
  industries: string[];
  skills: string[];
  locationTypes?: string[];
  search?: string;
}

interface JobFiltersProps {
  filters: JobFiltersState;
  setFilters: (filters: JobFiltersState) => void;
}

export default function JobFilters({ filters, setFilters }: JobFiltersProps) {
  // Handlers for filter changes
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-20 max-h-[calc(100vh-6rem)] flex flex-col">
      <div className="p-5 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-dark-gray" />
            <h2 className="font-medium text-dark-gray">Filters</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-accent" onClick={() => setFilters({ jobTypes: [], experienceLevels: [], salaryRange: [50, 150], location: '', industries: [], skills: [] })}>
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
            <AccordionTrigger className="py-3 text-sm font-medium text-dark-gray" onClick={() => toggleSection("salary")}>Salary Range</AccordionTrigger>
            {openSections["salary"] && (
              <AccordionContent className="pb-3">
                <div className="space-y-4">
                  <Slider
                    defaultValue={[50, 150]}
                    max={200}
                    step={5}
                    value={filters.salaryRange}
                    onValueChange={(range) => setFilters({ ...filters, salaryRange: range as [number, number] })}
                    className="my-6"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-full">
                      <p className="text-xs text-gray-500 mb-1">Min ($k)</p>
                      <Input
                        type="number"
                        value={filters.salaryRange[0]}
                        onChange={(e) => setFilters({ ...filters, salaryRange: [Number.parseInt(e.target.value), filters.salaryRange[1]] })}
                      />
                    </div>
                    <div className="w-full">
                      <p className="text-xs text-gray-500 mb-1">Max ($k)</p>
                      <Input
                        type="number"
                        value={filters.salaryRange[1]}
                        onChange={(e) => setFilters({ ...filters, salaryRange: [filters.salaryRange[0], Number.parseInt(e.target.value)] })}
                      />
                    </div>
                  </div>
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
              <AccordionContent className="pb-3">
                <div className="space-y-2">
                  <Input placeholder="Add a skill (e.g. JavaScript)" />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {filters.skills.map((skill, index) => (
                      <div key={index} className="bg-light-gray text-dark-gray text-xs px-2 py-1 rounded-md flex items-center">
                        {skill}
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1 text-gray-500 hover:text-gray-700">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
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
