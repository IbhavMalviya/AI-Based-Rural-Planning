import { useState } from "react";
import LocationSearch from "@/components/LocationSearch";
import WeatherCard from "@/components/WeatherCard";
import SoilCard from "@/components/SoilCard";
import DataChart from "@/components/DataChart";
import MapView from "@/components/MapView";
import StatsOverview from "@/components/StatsOverview";
import DataInsights from "@/components/DataInsights";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileJson, FileSpreadsheet, Sparkles, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-urban-planning.jpg";
import { Thermometer, Droplets, Leaf, Mountain } from "lucide-react";

interface EnvironmentalData {
  location: string;
  coordinates: { lat: number; lng: number };
  weather: {
    avgTemperature: number;
    avgHumidity: number;
    prevYearRainfall: number;
    avgAnnualRainfall: number;
  };
  soil: {
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    soilType: string;
  };
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<EnvironmentalData | null>(null);
  const { toast } = useToast();

  const handleSearch = async (location: string) => {
    setIsLoading(true);

    // Simulate geocoding and API call
    setTimeout(() => {
      const mockLat = 40.7128 + (Math.random() - 0.5) * 20;
      const mockLng = -74.006 + (Math.random() - 0.5) * 40;

      const mockData: EnvironmentalData = {
        location,
        coordinates: {
          lat: mockLat,
          lng: mockLng,
        },
        weather: {
          avgTemperature: parseFloat((18.5 + Math.random() * 5).toFixed(2)),
          avgHumidity: parseFloat((60 + Math.random() * 20).toFixed(2)),
          prevYearRainfall: parseFloat((800 + Math.random() * 400).toFixed(2)),
          avgAnnualRainfall: parseFloat((900 + Math.random() * 300).toFixed(2)),
        },
        soil: {
          ph: parseFloat((6.5 + Math.random() * 1.5).toFixed(2)),
          nitrogen: parseFloat((20 + Math.random() * 30).toFixed(2)),
          phosphorus: parseFloat((15 + Math.random() * 25).toFixed(2)),
          potassium: parseFloat((150 + Math.random() * 100).toFixed(2)),
          soilType: ["Loamy", "Clay", "Sandy", "Silty"][Math.floor(Math.random() * 4)],
        },
      };

      setData(mockData);
      setIsLoading(false);

      toast({
        title: "Analysis Complete",
        description: `Environmental data retrieved for ${location}`,
      });
    }, 2000);
  };

  const exportToCSV = () => {
    if (!data) return;

    const csvContent = `Location,${data.location}
Latitude,${data.coordinates.lat}
Longitude,${data.coordinates.lng}
Avg Temperature (°C),${data.weather.avgTemperature}
Avg Humidity (%),${data.weather.avgHumidity}
Previous Year Rainfall (mm),${data.weather.prevYearRainfall}
Avg Annual Rainfall (mm),${data.weather.avgAnnualRainfall}
pH,${data.soil.ph}
Nitrogen (mg/kg),${data.soil.nitrogen}
Phosphorus (mg/kg),${data.soil.phosphorus}
Potassium (mg/kg),${data.soil.potassium}
Soil Type,${data.soil.soilType}`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.location.replace(/\s+/g, "_")}_environmental_data.csv`;
    a.click();

    toast({
      title: "Export Successful",
      description: "Data exported to CSV file",
    });
  };

  const exportToJSON = () => {
    if (!data) return;

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.location.replace(/\s+/g, "_")}_environmental_data.json`;
    a.click();

    toast({
      title: "Export Successful",
      description: "Data exported to JSON file",
    });
  };

  const getInsights = () => {
    if (!data) return [];

    const insights = [];

    if (data.soil.ph < 6) {
      insights.push({
        type: "warning" as const,
        title: "Acidic Soil Detected",
        description:
          "pH level is below optimal range. Consider lime application to neutralize acidity for better crop growth.",
      });
    } else if (data.soil.ph > 7.5) {
      insights.push({
        type: "info" as const,
        title: "Alkaline Soil Profile",
        description:
          "pH is above neutral. Select alkaline-tolerant plant species or amend with sulfur compounds.",
      });
    } else {
      insights.push({
        type: "success" as const,
        title: "Optimal pH Balance",
        description:
          "Soil pH is within ideal range (6-7.5) for most vegetation and urban greenery projects.",
      });
    }

    if (data.weather.prevYearRainfall > 1200) {
      insights.push({
        type: "info" as const,
        title: "High Rainfall Zone",
        description:
          "Above-average precipitation detected. Implement robust drainage systems and consider water management infrastructure.",
      });
    } else if (data.weather.prevYearRainfall < 600) {
      insights.push({
        type: "warning" as const,
        title: "Water Scarcity Risk",
        description:
          "Low annual rainfall. Prioritize drought-resistant landscaping and efficient irrigation systems.",
      });
    }

    if (data.soil.nitrogen < 30) {
      insights.push({
        type: "info" as const,
        title: "Moderate Nitrogen Levels",
        description:
          "Nitrogen content is moderate. Supplement with organic matter for enhanced green space development.",
      });
    }

    return insights;
  };

  const getStats = () => {
    if (!data) return [];

    return [
      {
        label: "Average Temperature",
        value: `${data.weather.avgTemperature}°C`,
        icon: <Thermometer className="h-5 w-5 text-primary" />,
        color: "bg-primary/10",
        trend: data.weather.avgTemperature > 20 ? ("up" as const) : ("neutral" as const),
      },
      {
        label: "Annual Rainfall",
        value: `${data.weather.avgAnnualRainfall.toFixed(0)} mm`,
        icon: <Droplets className="h-5 w-5 text-secondary" />,
        color: "bg-secondary/10",
        trend:
          data.weather.avgAnnualRainfall > 1000
            ? ("up" as const)
            : data.weather.avgAnnualRainfall < 600
            ? ("down" as const)
            : ("neutral" as const),
      },
      {
        label: "Soil Quality",
        value: data.soil.soilType,
        icon: <Leaf className="h-5 w-5 text-primary" />,
        color: "bg-primary/10",
        trend: "neutral" as const,
      },
      {
        label: "pH Balance",
        value: data.soil.ph.toFixed(1),
        icon: <Mountain className="h-5 w-5 text-accent" />,
        color: "bg-accent/10",
        trend:
          data.soil.ph >= 6 && data.soil.ph <= 7.5
            ? ("up" as const)
            : ("neutral" as const),
      },
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Enhanced Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Sustainable Urban Planning"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/70 to-background" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto animate-fade-in space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Environmental Intelligence</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-secondary">
              Urban Planning
            </span>
            <span className="block text-primary mt-2">Data Platform</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive environmental analysis combining 5-year weather patterns, soil composition, and
            geospatial data for sustainable urban development
          </p>

          <div className="mt-12">
            <LocationSearch onSearch={handleSearch} isLoading={isLoading} />
          </div>
        </div>
      </section>

      {/* Data Display Section */}
      {data && (
        <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-16 space-y-8">
          {/* Header with Actions */}
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-primary" />
                <h2 className="text-4xl font-bold text-foreground">{data.location}</h2>
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <span className="text-sm">
                  {data.coordinates.lat.toFixed(4)}°N, {Math.abs(data.coordinates.lng).toFixed(4)}°
                  {data.coordinates.lng < 0 ? "W" : "E"}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm">5-year historical analysis</span>
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={exportToCSV} variant="outline" size="lg" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={exportToJSON} variant="outline" size="lg" className="gap-2">
                <FileJson className="h-4 w-4" />
                Export JSON
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <StatsOverview stats={getStats()} />

          {/* Map and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 overflow-hidden border-none shadow-[var(--shadow-strong)]">
              <CardContent className="p-0 h-[500px]">
                <MapView location={{ ...data.coordinates, name: data.location }} />
              </CardContent>
            </Card>

            <DataInsights insights={getInsights()} />
          </div>

          {/* Detailed Data Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <WeatherCard data={data.weather} />
            <SoilCard data={data.soil} />
          </div>

          {/* Chart Analysis */}
          <DataChart weatherData={data.weather} soilData={data.soil} />
        </section>
      )}

      {/* Enhanced Empty State */}
      {!data && !isLoading && (
        <section className="max-w-5xl mx-auto px-4 py-24">
          <Card className="border-none shadow-[var(--shadow-soft)] bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-12 text-center space-y-6">
              <div className="inline-flex p-6 rounded-2xl bg-primary/10 mb-4">
                <MapPin className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">Ready to Analyze Your Location</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Enter any city or coordinates to receive comprehensive environmental intelligence including:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-left">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Thermometer className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Weather Patterns</h4>
                  <p className="text-sm text-muted-foreground">
                    5-year temperature, humidity, and rainfall analysis
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                    <Leaf className="h-6 w-6 text-secondary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Soil Composition</h4>
                  <p className="text-sm text-muted-foreground">pH levels and NPK nutrient analysis</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="font-semibold text-foreground">Geospatial Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Interactive maps with location visualization
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
