import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import LocationSearch from "@/components/LocationSearch";
import WeatherCard from "@/components/WeatherCard";
import SoilCard from "@/components/SoilCard";
import DataChart from "@/components/DataChart";
import MapView from "@/components/MapView";
import StatsOverview from "@/components/StatsOverview";
import DataInsights from "@/components/DataInsights";
import CropRecommendations from "@/components/CropRecommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileJson, FileSpreadsheet, Sparkles, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-urban-planning.jpg";
import { Thermometer, Droplets, Leaf, Mountain } from "lucide-react";

interface EnvironmentalData {
  location: string;
  coordinates: { 
    lat: number; 
    lng: number;
    boundingBox?: number[];
    polygon?: any;
  };
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
    console.log('[FRONTEND] Starting search for:', location);

    // Initialize partial data structure
    const partialData: Partial<EnvironmentalData> = {
      location,
      coordinates: { lat: 0, lng: 0 },
      weather: {
        avgTemperature: 0,
        avgHumidity: 0,
        prevYearRainfall: 0,
        avgAnnualRainfall: 0,
      },
      soil: {
        ph: 0,
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
        soilType: '',
      },
    };

    try {
      // Get the Supabase project URL for the edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/fetch-environmental-data`;

      console.log('[FRONTEND] Fetching from:', functionUrl);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ location }),
      });

      console.log('[FRONTEND] Response status:', response.status);
      console.log('[FRONTEND] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      console.log('[FRONTEND] Starting to read stream...');
      let buffer = '';
      let eventCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('[FRONTEND] Stream completed. Total events:', eventCount);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        console.log('[FRONTEND] Buffer received:', buffer.length, 'bytes');
        
        // Process complete events
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          console.log('[FRONTEND] Processing line:', line);

          const eventMatch = line.match(/event: (\w+)\ndata: (.+)/);
          if (!eventMatch) {
            console.log('[FRONTEND] No match for line');
            continue;
          }

          const [, eventType, dataStr] = eventMatch;
          const eventData = JSON.parse(dataStr);

          eventCount++;
          console.log(`[FRONTEND] Event #${eventCount}:`, eventType, eventData);

          switch (eventType) {
            case 'status':
              toast({
                title: eventData.message,
                description: `Processing ${eventData.stage}...`,
              });
              break;

            case 'coordinates':
              console.log('[FRONTEND] Updating coordinates:', eventData);
              partialData.coordinates = {
                lat: eventData.latitude,
                lng: eventData.longitude,
                boundingBox: eventData.boundingBox,
                polygon: eventData.polygon,
              };
              partialData.location = eventData.displayName || eventData.location;
              setData({ ...partialData } as EnvironmentalData);
              break;

            case 'weather':
              console.log('[FRONTEND] Updating weather metric:', eventData.metric, eventData.value);
              if (!partialData.weather) partialData.weather = {} as any;
              
              switch (eventData.metric) {
                case 'temperature':
                  partialData.weather.avgTemperature = eventData.value;
                  break;
                case 'humidity':
                  partialData.weather.avgHumidity = eventData.value;
                  break;
                case 'prevRainfall':
                  partialData.weather.prevYearRainfall = eventData.value;
                  break;
                case 'avgRainfall':
                  partialData.weather.avgAnnualRainfall = eventData.value;
                  break;
              }
              
              setData({ ...partialData } as EnvironmentalData);
              
              toast({
                title: `${eventData.label} received`,
                description: `${eventData.value} ${eventData.unit || ''}`,
              });
              break;

            case 'soil':
              console.log('[FRONTEND] Updating soil metric:', eventData.metric, eventData.value);
              if (!partialData.soil) partialData.soil = {} as any;
              
              switch (eventData.metric) {
                case 'type':
                  partialData.soil.soilType = eventData.value;
                  break;
                case 'ph':
                  partialData.soil.ph = eventData.value;
                  break;
                case 'nitrogen':
                  partialData.soil.nitrogen = eventData.value;
                  break;
                case 'phosphorus':
                  partialData.soil.phosphorus = eventData.value;
                  break;
                case 'potassium':
                  partialData.soil.potassium = eventData.value;
                  break;
              }
              
              setData({ ...partialData } as EnvironmentalData);
              
              toast({
                title: `${eventData.label} received`,
                description: `${eventData.value} ${eventData.unit || ''}`,
              });
              break;

            case 'complete':
              console.log('[FRONTEND] Analysis complete!');
              setIsLoading(false);
              toast({
                title: "✅ Analysis Complete",
                description: `All environmental data retrieved for ${location}`,
              });
              break;

            case 'error':
              console.error('[FRONTEND] Stream error:', eventData.error);
              toast({
                title: "Error",
                description: eventData.error,
                variant: "destructive",
              });
              setIsLoading(false);
              break;
          }
        }
      }

    } catch (error) {
      console.error('[FRONTEND] Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
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

    // pH Analysis
    if (data.soil.ph < 6) {
      insights.push({
        type: "warning" as const,
        title: "Acidic Soil Detected (pH < 6)",
        description:
          "Your soil is acidic which can affect nutrient availability. For Indian farmers: Apply agricultural lime (चूना) at 200-400 kg/hectare before monsoon. Acidic soil is suitable for crops like tea, potato, and some pulses. Government schemes like Soil Health Card Scheme provide free soil testing.",
      });
    } else if (data.soil.ph > 7.5) {
      insights.push({
        type: "info" as const,
        title: "Alkaline Soil Profile (pH > 7.5)",
        description:
          "Alkaline soil common in arid regions. Add organic matter like farmyard manure (गोबर की खाद) or vermicompost. Gypsum application at 500-1000 kg/hectare helps. Suitable for crops like barley, wheat varieties, and cotton. Drip irrigation recommended.",
      });
    } else {
      insights.push({
        type: "success" as const,
        title: "Optimal pH Balance (6-7.5) ✓",
        description:
          "Excellent! Your soil pH is ideal for most Indian crops including rice, wheat, pulses, and vegetables. Maintain with balanced organic farming practices. Regular green manuring with dhaincha or moong improves soil structure.",
      });
    }

    // Rainfall Analysis
    if (data.weather.prevYearRainfall > 1200) {
      insights.push({
        type: "info" as const,
        title: "High Rainfall Zone (>1200mm annually)",
        description:
          "Abundant water suitable for paddy, sugarcane, banana, and coconut. Risk of waterlogging - ensure proper drainage. Kharif crops ideal. Apply for Pradhan Mantri Fasal Bima Yojana (PMFBY) for crop insurance against excess rainfall damage.",
      });
    } else if (data.weather.prevYearRainfall < 600) {
      insights.push({
        type: "warning" as const,
        title: "Low Rainfall / Drought-Prone Area (<600mm)",
        description:
          "Water conservation critical. Drip irrigation eligible for 90% subsidy under PMKSY scheme. Grow drought-resistant crops: bajra, jowar, groundnut, pulses. Adopt mulching and rainwater harvesting. Mgnrega provides funds for farm pond construction.",
      });
    } else {
      insights.push({
        type: "success" as const,
        title: "Moderate Rainfall (600-1200mm)",
        description:
          "Balanced rainfall zone suitable for diverse crops. Both Kharif and Rabi seasons viable. Cotton, soybean, maize, wheat, chickpea, and vegetables recommended. Mixed cropping reduces risk. Micro-irrigation systems get 55% subsidy.",
      });
    }

    // NPK Analysis
    if (data.soil.nitrogen < 280) {
      insights.push({
        type: "warning" as const,
        title: "Low Nitrogen Levels (<280 mg/kg)",
        description:
          "Nitrogen deficiency affects leaf growth. Apply urea (यूरिया) 100-150 kg/ha or use biofertilizers. Grow green manure crops like dhaincha, sunhemp between seasons. Vermicompost adds 1-2% nitrogen. Under Soil Health Card scheme, get customized fertilizer recommendations.",
      });
    }

    if (data.soil.phosphorus < 11) {
      insights.push({
        type: "info" as const,
        title: "Phosphorus Deficiency (<11 mg/kg)",
        description:
          "Essential for root development and flowering. Apply Single Super Phosphate (SSP) or DAP at 50-75 kg/ha. Rock phosphate works in acidic soils. Mycorrhizal fungi enhance P uptake. Available through govt fertilizer subsidy schemes.",
      });
    }

    if (data.soil.potassium < 140) {
      insights.push({
        type: "info" as const,
        title: "Low Potassium Content (<140 mg/kg)",
        description:
          "Important for disease resistance and fruit quality. Apply Muriate of Potash (MOP) 30-60 kg/ha. Wood ash and banana pseudostem are organic K sources. Helps crops withstand drought stress. Test soil annually via Soil Health Card scheme.",
      });
    }

    // Temperature-based insights
    if (data.weather.avgTemperature > 30) {
      insights.push({
        type: "info" as const,
        title: "High Temperature Region (>30°C average)",
        description:
          "Suitable for tropical crops: cotton, groundnut, millets, and summer vegetables. Heat-tolerant varieties essential. Shade nets for vegetables. Protected cultivation gets 50% subsidy under NHM. Consider shifting to Zaid season crops.",
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
            <span className="text-sm font-medium text-primary">The 5 Arcs</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-secondary">
              AI Based Indian Rural Planning 
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Empowering planners with AIML-driven environmental and geological analysis. 
            5-year weather data, soil composition, and personalized crop recommendations for every district in India.
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
                <MapView 
                  location={{ 
                    ...data.coordinates, 
                    name: data.location,
                    boundingBox: data.coordinates.boundingBox,
                    polygon: data.coordinates.polygon
                  }} 
                />
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

          {/* AI-Powered Crop Recommendations */}
          <CropRecommendations 
            weather={data.weather} 
            soil={data.soil} 
            location={data.location} 
          />
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
              <h3 className="text-3xl font-bold text-foreground">Begin Your Agricultural Analysis</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Enter any location in India to access comprehensive environmental and geological information for Rural Planning.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 text-left">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Thermometer className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Weather Patterns</h4>
                  <p className="text-sm text-muted-foreground">
                    5-year temperature, humidity, and rainfall analysis for crop planning
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                    <Leaf className="h-6 w-6 text-secondary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Soil Analysis</h4>
                  <p className="text-sm text-muted-foreground">NPK nutrients, pH levels, and soil type for optimal fertilizer planning</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="font-semibold text-foreground">Geographic Data</h4>
                  <p className="text-sm text-muted-foreground">Boundary maps and precise coordinates for land management</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">AI Crop Insights</h4>
                  <p className="text-sm text-muted-foreground">Personalized recommendations with govt. schemes and market info</p>
                </div>
              </div>
              <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
                <p className="text-sm text-muted-foreground text-left">
                  <strong className="text-foreground">🌾 For Farmers:</strong> Get insights on crop selection, fertilizer ratios, irrigation needs, and access schemes like PM-KISAN, PMFBY, and Soil Health Cards.
                </p>
                <p className="text-sm text-muted-foreground text-left">
                  <strong className="text-foreground">🏛️ For Planners:</strong> Environmental data for sustainable development, green infrastructure, water management, and climate adaptation strategies.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};

export default Dashboard;

