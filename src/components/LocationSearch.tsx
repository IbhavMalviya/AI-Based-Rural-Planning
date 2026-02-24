import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface LocationSearchProps {
  onSearch: (location: string) => void;
  isLoading?: boolean;
}

interface LocationSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  address?: { country_code?: string };
}

const LocationSearch = ({ onSearch, isLoading }: LocationSearchProps) => {
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFetching, setIsFetching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (location.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
      setIsFetching(true);
      try {
        const searchQuery = `${location}, India`;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&countrycodes=in&format=json&limit=8&addressdetails=1`,
          { headers: { "User-Agent": "indian_agriculture_platform" } }
        );
        if (response.ok) {
          const data = await response.json();
          const indianLocations = data.filter((item: LocationSuggestion) => item.address && (item.address as any).country_code === 'in');
          setSuggestions(indianLocations);
          setShowSuggestions(indianLocations.length > 0);
        }
      } catch (error) { console.error("Error fetching suggestions:", error); }
      finally { setIsFetching(false); }
    };
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (location.trim()) { onSearch(location.trim()); setShowSuggestions(false); } };
  const handleSuggestionClick = (suggestion: LocationSuggestion) => { setLocation(suggestion.display_name); setShowSuggestions(false); onSearch(suggestion.display_name); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setSelectedIndex((prev) => prev < suggestions.length - 1 ? prev + 1 : prev); break;
      case "ArrowUp": e.preventDefault(); setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1)); break;
      case "Enter": e.preventDefault(); if (selectedIndex >= 0) handleSuggestionClick(suggestions[selectedIndex]); else handleSubmit(e); break;
      case "Escape": setShowSuggestions(false); break;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative">
      <div className="flex gap-2 p-2 rounded-2xl bg-primary-foreground/10 backdrop-blur-lg border border-primary-foreground/20 shadow-2xl">
        <div className="relative flex-1">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/50" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={t("hero.search_placeholder")}
            value={location}
            onChange={(e) => { setLocation(e.target.value); setSelectedIndex(-1); }}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            className="pl-12 h-14 text-base bg-transparent border-none text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isLoading}
            maxLength={200}
          />
        </div>
        
        <Button type="submit" size="lg" disabled={isLoading || !location.trim()} className="px-8 h-14 rounded-xl text-base font-semibold">
          {isLoading ? (
            <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />{t("hero.analyzing")}</span>
          ) : (
            <span className="flex items-center gap-2"><Search className="h-5 w-5" />{t("hero.analyze")}</span>
          )}
        </Button>
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-3 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
          <div className="max-h-80 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn("w-full px-5 py-3.5 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left", selectedIndex === index && "bg-primary/5")}
              >
                <div className="mt-0.5 text-primary"><MapPin className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{suggestion.display_name.split(",")[0]}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{suggestion.display_name}</p>
                </div>
                <div className="text-xs text-muted-foreground capitalize bg-muted/50 px-2 py-0.5 rounded-md">{suggestion.type}</div>
              </button>
            ))}
          </div>
          {isFetching && (
            <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Loading more results...</p>
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default LocationSearch;
