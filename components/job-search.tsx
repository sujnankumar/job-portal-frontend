import { Search, MapPin, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function JobSearch({ search, setSearch, location, setLocation, onSearch }: {
  search: string;
  setSearch: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input placeholder="Job title, keywords, or company" className="pl-9 h-12" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input placeholder="City, state, or zip code" className="pl-9 h-12" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
        </div>
        <div className="md:col-span-1">
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-12 w-full bg-accent hover:bg-accent/90" onClick={onSearch}>Search</Button>
            <Button variant="outline" className="h-12 w-full">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
