import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";

interface LocationSearchProps {
  onSearch: (location: string) => void;
  isLoading?: boolean;
}

const LocationSearch = ({ onSearch, isLoading }: LocationSearchProps) => {
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch(location.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter city name or coordinates (e.g., New York or 40.7128,-74.0060)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10 h-12 text-base bg-card"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={isLoading || !location.trim()}
          className="px-8"
        >
          {isLoading ? (
            <>
              <span className="animate-pulse">Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Analyze
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default LocationSearch;
