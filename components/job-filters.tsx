"use client"

import { useState } from "react"
import { Filter, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function JobFilters() {
  const [salaryRange, setSalaryRange] = useState([50, 150])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-20 max-h-[calc(100vh-6rem)] flex flex-col">
      <div className="p-5 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-dark-gray" />
            <h2 className="font-medium text-dark-gray">Filters</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-accent">
            Reset
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto px-5 py-2 flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <Accordion type="multiple" defaultValue={["jobType", "experience", "salary"]}>
          {/* Job Type */}
          <AccordionItem value="jobType" className="border-b border-gray-100">
            <AccordionTrigger className="py-3 text-sm font-medium text-dark-gray">Job Type</AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="full-time" />
                  <label
                    htmlFor="full-time"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Full-time
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="part-time" />
                  <label
                    htmlFor="part-time"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Part-time
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="contract" />
                  <label
                    htmlFor="contract"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Contract
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="internship" />
                  <label
                    htmlFor="internship"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Internship
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="temporary" />
                  <label
                    htmlFor="temporary"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Temporary
                  </label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Experience Level */}
          <AccordionItem value="experience" className="border-b border-gray-100">
            <AccordionTrigger className="py-3 text-sm font-medium text-dark-gray">Experience Level</AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="entry-level" />
                  <label
                    htmlFor="entry-level"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Entry Level
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mid-level" />
                  <label
                    htmlFor="mid-level"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mid Level
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="senior-level" />
                  <label
                    htmlFor="senior-level"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Senior Level
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="director" />
                  <label
                    htmlFor="director"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Director
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="executive" />
                  <label
                    htmlFor="executive"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Executive
                  </label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Salary Range */}
          <AccordionItem value="salary" className="border-b border-gray-100">
            <AccordionTrigger className="py-3 text-sm font-medium text-dark-gray">Salary Range</AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="space-y-4">
                <Slider
                  defaultValue={[50, 150]}
                  max={200}
                  step={5}
                  value={salaryRange}
                  onValueChange={setSalaryRange}
                  className="my-6"
                />
                <div className="flex items-center gap-3">
                  <div className="w-full">
                    <p className="text-xs text-gray-500 mb-1">Min ($k)</p>
                    <Input
                      type="number"
                      value={salaryRange[0]}
                      onChange={(e) => setSalaryRange([Number.parseInt(e.target.value), salaryRange[1]])}
                    />
                  </div>
                  <div className="w-full">
                    <p className="text-xs text-gray-500 mb-1">Max ($k)</p>
                    <Input
                      type="number"
                      value={salaryRange[1]}
                      onChange={(e) => setSalaryRange([salaryRange[0], Number.parseInt(e.target.value)])}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Location */}
          <AccordionItem value="location" className="border-b border-gray-100">
            <AccordionTrigger className="py-3 text-sm font-medium text-dark-gray">Location</AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remote" />
                  <label
                    htmlFor="remote"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remote
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="hybrid" />
                  <label
                    htmlFor="hybrid"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Hybrid
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="onsite" />
                  <label
                    htmlFor="onsite"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    On-site
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2 mb-1">City or Zip Code</p>
                <Input placeholder="Enter location" />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Industry */}
          <AccordionItem value="industry" className="border-b border-gray-100">
            <AccordionTrigger className="py-3 text-sm font-medium text-dark-gray">Industry</AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="technology" />
                  <label
                    htmlFor="technology"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Technology
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="healthcare" />
                  <label
                    htmlFor="healthcare"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Healthcare
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="finance" />
                  <label
                    htmlFor="finance"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Finance
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="education" />
                  <label
                    htmlFor="education"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Education
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="retail" />
                  <label
                    htmlFor="retail"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Retail
                  </label>
                </div>
                <Button variant="ghost" size="sm" className="text-primary mt-2">
                  Show more <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Skills */}
          <AccordionItem value="skills" className="border-b border-gray-100">
            <AccordionTrigger className="py-3 text-sm font-medium text-dark-gray">Skills</AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="space-y-2">
                <Input placeholder="Add a skill (e.g. JavaScript)" />
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="bg-light-gray text-dark-gray text-xs px-2 py-1 rounded-md flex items-center">
                    React
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1 text-gray-500 hover:text-gray-700">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="bg-light-gray text-dark-gray text-xs px-2 py-1 rounded-md flex items-center">
                    TypeScript
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1 text-gray-500 hover:text-gray-700">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="p-5 pt-2 mt-auto border-t border-gray-100">
        <Button className="w-full bg-accent hover:bg-accent/90">Apply Filters</Button>
      </div>
    </div>
  )
}
