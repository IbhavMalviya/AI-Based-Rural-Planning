import { useState } from "react";
import LocationSearch from "@/components/LocationSearch";
import WeatherCard from "@/components/WeatherCard";
import SoilCard from "@/components/SoilCard";
import DataChart from "@/components/DataChart";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-urban-planning.jpg";

interface EnvironmentalData {
  location: string;
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
    
    // Simulate API call with mock data
    setTimeout(() => {
      const mockData: EnvironmentalData = {
        location,
        weather: {
          avgTemperature: 18.5 + Math.random() * 5,
          avgHumidity: 60 + Math.random() * 20,
          prevYearRainfall: 800 + Math.random() * 400,
          avgAnnualRainfall: 900 + Math.random() * 300,
        },
        soil: {
          ph: 6.5 + Math.random() * 1.5,
          nitrogen: 20 + Math.random() * 30,
          phosphorus: 15 + Math.random() * 25,
          potassium: 150 + Math.random() * 100,
          soilType: ["Loamy", "Clay", "Sandy", "Silty"][Math.floor(Math.random() * 4)],
        },
      };
      
      setData(mockData);
      setIsLoading(false);
      
      toast({
        title: "Data Retrieved Successfully",
        description: `Environmental analysis complete for ${location}`,
      });
    }, 2000);
  };

  const exportToCSV = () => {
    if (!data) return;
    
    const csvContent = `Location,${data.location}
Avg Temperature (°C),${data.weather.avgTemperature.toFixed(2)}
Avg Humidity (%),${data.weather.avgHumidity.toFixed(2)}
Previous Year Rainfall (mm),${data.weather.prevYearRainfall.toFixed(2)}
Avg Annual Rainfall (mm),${data.weather.avgAnnualRainfall.toFixed(2)}
pH,${data.soil.ph.toFixed(2)}
Nitrogen (mg/kg),${data.soil.nitrogen.toFixed(2)}
Phosphorus (mg/kg),${data.soil.phosphorus.toFixed(2)}
Potassium (mg/kg),${data.soil.potassium.toFixed(2)}
Soil Type,${data.soil.soilType}`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.location}_environmental_data.csv`;
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
    a.download = `${data.location}_environmental_data.json`;
    a.click();
    
    toast({
      title: "Export Successful",
      description: "Data exported to JSON file",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Urban Planning" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Urban Planning
            <span className="block text-primary mt-2">Data Intelligence</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Comprehensive environmental analysis for sustainable urban development
          </p>
          
          <div className="mt-8">
            <LocationSearch onSearch={handleSearch} isLoading={isLoading} />
          </div>
        </div>
      </section>

      {/* Data Display Section */}
      {data && (
        <section className="max-w-7xl mx-auto px-4 py-12 space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Analysis Results: {data.location}
              </h2>
              <p className="text-muted-foreground">
                Based on 5-year historical data and soil composition
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={exportToJSON} variant="outline" className="gap-2">
                <FileJson className="h-4 w-4" />
                Export JSON
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeatherCard data={data.weather} />
            <SoilCard data={data.soil} />
          </div>

          <DataChart weatherData={data.weather} soilData={data.soil} />
        </section>
      )}

      {/* Empty State */}
      {!data && !isLoading && (
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="space-y-4 text-muted-foreground">
            <h3 className="text-2xl font-semibold text-foreground">
              Ready to Analyze
            </h3>
            <p className="text-lg">
              Enter a location above to get comprehensive environmental data including weather patterns, 
              soil composition, and nutrient analysis for informed urban planning decisions.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
