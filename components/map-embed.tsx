"use client"

import type React from "react"

import { useState, useEffect } from "react" // Added useEffect
import { MapPin, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Updated Props: Only accept location string
interface MapEmbedProps {
  location: string // Changed from address, made required
}

// Geocoding function (using Nominatim - remember usage policy)
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null; // No results found
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
}


function getOsmEmbedUrl(lat: number, lon: number, zoom: number) {
  // Calculate bounding box based on zoom (this is approximate)
  const delta = 1 / Math.pow(2, zoom - 1); // Adjust this formula as needed for desired bbox size
  const minLon = lon - delta;
  const minLat = lat - delta;
  const maxLon = lon + delta;
  const maxLat = lat + delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lon}&zoom=${zoom}`
}

// Default values defined inside the component
const DEFAULT_HEIGHT = 400;
const DEFAULT_WIDTH = "100%";
const DEFAULT_ZOOM = 13;
const SHOW_SEARCH = true; // Decide if search should always be shown or hidden

export default function MapEmbed({ location }: MapEmbedProps) {
  // State for coordinates
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [currentDisplayAddress, setCurrentDisplayAddress] = useState(location); // Address shown on map label
  const [isLoading, setIsLoading] = useState(true); // Start loading initially

  // State for search input (if search is enabled)
  const [searchAddress, setSearchAddress] = useState(location);

  // Fetch coordinates when location prop changes or initially
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setCurrentDisplayAddress(location); // Update display address immediately

    geocodeAddress(location)
      .then(coords => {
        if (isMounted) {
          if (coords) {
            setCoordinates(coords);
            setMapUrl(getOsmEmbedUrl(coords.lat, coords.lon, DEFAULT_ZOOM));
          } else {
            // Handle case where geocoding fails (e.g., show default map or error)
            console.warn(`Could not geocode: ${location}. Showing default map.`);
            setCoordinates(null); // Clear coordinates
            // Optionally set a default fallback URL or keep it null to show nothing/error
            setMapUrl(null); // Or a fallback URL
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          console.error(`Error during geocoding for: ${location}`);
          setCoordinates(null);
          setMapUrl(null);
          setIsLoading(false);
        }
      });

    return () => { isMounted = false; }; // Cleanup on unmount or location change
  }, [location]); // Re-run effect if the location prop changes

  // Handle search submission
  const handleSearch = async () => {
    if (!SHOW_SEARCH) return; // Don't search if disabled

    setIsLoading(true);
    const coords = await geocodeAddress(searchAddress);
    if (coords) {
      setCoordinates(coords);
      setCurrentDisplayAddress(searchAddress); // Update display address to searched term
      setMapUrl(getOsmEmbedUrl(coords.lat, coords.lon, DEFAULT_ZOOM));
    } else {
      alert(`Could not find coordinates for: ${searchAddress}`);
      // Optionally revert searchAddress or keep it
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {SHOW_SEARCH && (
        <div className="p-3 bg-white border-b">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search for a location"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
                disabled={isLoading} // Disable input while loading new search
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading} className="bg-accent hover:bg-accent/90">
              {isLoading ? "Searching..." : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      <div className="relative" style={{ height: DEFAULT_HEIGHT, width: DEFAULT_WIDTH }}>
        {isLoading && !mapUrl && ( // Show loading indicator only initially or if search fails
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            Loading map...
          </div>
        )}
        {!isLoading && !mapUrl && ( // Show error/fallback if loading finished but no map URL
           <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500">
             Could not load map for the specified location.
           </div>
        )}
        {mapUrl && ( // Only render iframe if mapUrl is available
          <iframe
            title={`Map of ${currentDisplayAddress}`}
            src={mapUrl}
            width="100%"
            height={DEFAULT_HEIGHT}
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            key={mapUrl} // Add key to force iframe reload on URL change
          />
        )}
        {/* Location label */}
        {!isLoading && coordinates && ( // Show label only when loaded and coordinates exist
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md text-sm font-medium">
            {currentDisplayAddress}
          </div>
        )}
        {/* Attribution */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-600 bg-white/80 px-1 rounded">
          Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>
        </div>
      </div>
    </div>
  )
}