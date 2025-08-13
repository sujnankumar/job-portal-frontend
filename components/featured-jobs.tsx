import Image from "next/image"
import Link from "next/link"
import { MapPin, IndianRupee, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatSalaryRange, formatRelativeTime } from "@/lib/utils"
import { useEffect, useState } from "react" // Import hooks
import api from "@/lib/axios" // Import your configured axios instance

// Define a employment_type/interface for the job object structure
interface Job {
  job_id: string;
  title: string;
  company_name: string;
  location: string;
  show_salary: boolean;
  min_salary?: number | null; // Optional or null
  max_salary?: number | null; // Optional or null
  employment_type: string;
  logo?: string | null; // Optional or null
  logo_url?: string | null; // Optional or null
  posted_at: string; // Expecting ISO string from API
  tags?: string[] | null; // Optional or null
}

// Function to fetch featured jobs from the API
async function fetchFeaturedJobs(): Promise<Job[]> {
  try {
    // *** Replace with your actual API endpoint ***
    const response = await api.get("/job/featured-jobs");
    console.log("API Response:", response.data); // Debugging line
    if (Array.isArray(response.data.featured_jobs)) {
      return response.data.featured_jobs  ;
    } else {
      console.error("Unexpected API response structure:", response.data);
      return []; // Return empty array if structure is wrong
    }
  } catch (error) {
    console.error("Failed to fetch featured jobs:", error);
    return []; // Return empty array on error
  }
}


export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchFeaturedJobs()
      .then(data => {
        setJobs(data);
      })
      .catch(err => {
        // Error handling is mostly done within fetchFeaturedJobs,
        // but you could set a generic error message here if needed.
        setError("Could not load featured jobs.");
        console.error(err); // Log the specific error
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  if (isLoading) {
    // Optional: Render a loading state (e.g., skeletons)
    return <div className="text-center py-8">Loading featured jobs...</div>;
  }

  if (error) {
    // Optional: Render an error message
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (jobs.length === 0) {
    // Optional: Render a message if no jobs are found
    return <div className="text-center py-8 text-gray-500">No featured jobs available right now.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Map over the fetched jobs state */}
      {jobs.map((job) => (
        <Link
          href={`/jobs/${job.job_id}`}
          key={job.job_id}
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col" // Use flex column for better structure
        >
          {/* Top section with logo, title, company */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-light-gray flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
              <Image
                // Use a placeholder if logo is missing
                src={job.logo_url || "/company_placeholder.jpeg"}
                width={48}
                height={48}
                alt={`${job.company_name} logo`}
                className="w-full h-full object-contain" // Ensure image fits well
                // Add error handling for images if needed
                onError={(e) => { e.currentTarget.src = '/company_placeholder.jpeg'; }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-dark-gray truncate line-clamp-1">{job.title}</h3>
              <p className="text-sm text-gray-500 truncate line-clamp-1">{job.company_name}</p>
            </div>
          </div>


          {/* Job Details Section */}
          <div className="mt-auto space-y-2"> {/* Push details to bottom and add spacing */}
            {/* Location, Salary, employment_type details */}
            <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
              {job.show_salary ? (
                <div className="flex items-center">
                  <IndianRupee className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  <span className="truncate">{formatSalaryRange(job.min_salary, job.max_salary)}</span>
                </div>
              ) : (
                 <div className="flex items-center text-gray-500 italic">
                   <IndianRupee className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                   <span>Salary not disclosed</span>
                 </div>
              )}
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span className="truncate">{job.employment_type}</span>
              </div>
            </div>


            {/* Tags Section */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {job.tags.slice(0, 3).map((tag) => ( // Limit tags shown for space
                  <Badge key={tag} variant="outline" className="bg-light-gray text-xs px-1.5 py-0.5">
                    {tag}
                  </Badge>
                ))}
                {job.tags.length > 3 && (
                   <Badge variant="outline" className="bg-light-gray text-xs px-1.5 py-0.5">
                    +{job.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Posted Date - Updated */}
            <div className="text-xs text-gray-500 pt-1">
              Posted {formatRelativeTime(job.posted_at)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}