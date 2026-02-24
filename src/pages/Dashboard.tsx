import { useState } from "react";
import LocationSearch from "@/components/LocationSearch";
import WeatherCard from "@/components/WeatherCard";
import SoilCard from "@/components/SoilCard";
import DataChart from "@/components/DataChart";
import MapView from "@/components/MapView";
import StatsOverview from "@/components/StatsOverview";
import DataInsights from "@/components/DataInsights";
import CropRecommendations from "@/components/CropRecommendations";
import SeasonalCalendar from "@/components/SeasonalCalendar";
import GovernmentSchemes from "@/components/GovernmentSchemes";
import CostProfitCalculator from "@/components/CostProfitCalculator";
import PDFReportGenerator from "@/components/PDFReportGenerator";
import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileJson, FileSpreadsheet, Sparkles, MapPin, Thermometer, Droplets, Leaf, Mountain, BarChart3, Shield, Globe2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-agriculture.jpg";

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
  const { t } = useLanguage();

  const handleSearch = async (location: string) => {
    setIsLoading(true);
    console.log('[FRONTEND] Starting search for:', location);

    const partialData: Partial<EnvironmentalData> = {
      location,
      coordinates: { lat: 0, lng: 0 },
      weather: { avgTemperature: 0, avgHumidity: 0, prevYearRainfall: 0, avgAnnualRainfall: 0 },
      soil: { ph: 0, nitrogen: 0, phosphorus: 0, potassium: 0, soilType: '' },
    };

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/fetch-environmental-data`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ location }),
      });

      if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response stream available');

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          const eventMatch = line.match(/event: (\w+)\ndata: (.+)/);
          if (!eventMatch) continue;

          const [, eventType, dataStr] = eventMatch;
          const eventData = JSON.parse(dataStr);

          switch (eventType) {
            case 'status':
              toast({ title: eventData.message, description: `Processing ${eventData.stage}...` });
              break;
            case 'coordinates':
              partialData.coordinates = { lat: eventData.latitude, lng: eventData.longitude, boundingBox: eventData.boundingBox, polygon: eventData.polygon };
              partialData.location = eventData.displayName || eventData.location;
              setData({ ...partialData } as EnvironmentalData);
              break;
            case 'weather':
              if (!partialData.weather) partialData.weather = {} as any;
              switch (eventData.metric) {
                case 'temperature': partialData.weather.avgTemperature = eventData.value; break;
                case 'humidity': partialData.weather.avgHumidity = eventData.value; break;
                case 'prevRainfall': partialData.weather.prevYearRainfall = eventData.value; break;
                case 'avgRainfall': partialData.weather.avgAnnualRainfall = eventData.value; break;
              }
              setData({ ...partialData } as EnvironmentalData);
              toast({ title: `${eventData.label} received`, description: `${eventData.value} ${eventData.unit || ''}` });
              break;
            case 'soil':
              if (!partialData.soil) partialData.soil = {} as any;
              switch (eventData.metric) {
                case 'type': partialData.soil.soilType = eventData.value; break;
                case 'ph': partialData.soil.ph = eventData.value; break;
                case 'nitrogen': partialData.soil.nitrogen = eventData.value; break;
                case 'phosphorus': partialData.soil.phosphorus = eventData.value; break;
                case 'potassium': partialData.soil.potassium = eventData.value; break;
              }
              setData({ ...partialData } as EnvironmentalData);
              toast({ title: `${eventData.label} received`, description: `${eventData.value} ${eventData.unit || ''}` });
              break;
            case 'complete':
              setIsLoading(false);
              toast({ title: `✅ ${t("misc.analysis_complete")}`, description: `All environmental data retrieved for ${location}` });
              break;
            case 'error':
              toast({ title: "Error", description: eventData.error, variant: "destructive" });
              setIsLoading(false);
              break;
          }
        }
      }
    } catch (error) {
      console.error('[FRONTEND] Error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "An unexpected error occurred", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;
    const csvContent = `Location,${data.location}\nLatitude,${data.coordinates.lat}\nLongitude,${data.coordinates.lng}\nAvg Temperature (°C),${data.weather.avgTemperature}\nAvg Humidity (%),${data.weather.avgHumidity}\nPrevious Year Rainfall (mm),${data.weather.prevYearRainfall}\nAvg Annual Rainfall (mm),${data.weather.avgAnnualRainfall}\npH,${data.soil.ph}\nNitrogen (mg/kg),${data.soil.nitrogen}\nPhosphorus (mg/kg),${data.soil.phosphorus}\nPotassium (mg/kg),${data.soil.potassium}\nSoil Type,${data.soil.soilType}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.location.replace(/\s+/g, "_")}_environmental_data.csv`;
    a.click();
    toast({ title: "Export Successful", description: "Data exported to CSV file" });
  };

  const exportToJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.location.replace(/\s+/g, "_")}_environmental_data.json`;
    a.click();
    toast({ title: "Export Successful", description: "Data exported to JSON file" });
  };

  const getInsights = () => {
    if (!data) return [];
    const insights = [];

    if (data.soil.ph < 6) {
      insights.push({ type: "warning" as const, title: "Acidic Soil Detected (pH < 6)", description: "Your soil is acidic which can affect nutrient availability. For Indian farmers: Apply agricultural lime (चूना) at 200-400 kg/hectare before monsoon. Acidic soil is suitable for crops like tea, potato, and some pulses. Government schemes like Soil Health Card Scheme provide free soil testing." });
    } else if (data.soil.ph > 7.5) {
      insights.push({ type: "info" as const, title: "Alkaline Soil Profile (pH > 7.5)", description: "Alkaline soil common in arid regions. Add organic matter like farmyard manure (गोबर की खाद) or vermicompost. Gypsum application at 500-1000 kg/hectare helps. Suitable for crops like barley, wheat varieties, and cotton. Drip irrigation recommended." });
    } else {
      insights.push({ type: "success" as const, title: "Optimal pH Balance (6-7.5) ✓", description: "Excellent! Your soil pH is ideal for most Indian crops including rice, wheat, pulses, and vegetables. Maintain with balanced organic farming practices. Regular green manuring with dhaincha or moong improves soil structure." });
    }

    if (data.weather.prevYearRainfall > 1200) {
      insights.push({ type: "info" as const, title: "High Rainfall Zone (>1200mm annually)", description: "Abundant water suitable for paddy, sugarcane, banana, and coconut. Risk of waterlogging - ensure proper drainage. Kharif crops ideal. Apply for Pradhan Mantri Fasal Bima Yojana (PMFBY) for crop insurance against excess rainfall damage." });
    } else if (data.weather.prevYearRainfall < 600) {
      insights.push({ type: "warning" as const, title: "Low Rainfall / Drought-Prone Area (<600mm)", description: "Water conservation critical. Drip irrigation eligible for 90% subsidy under PMKSY scheme. Grow drought-resistant crops: bajra, jowar, groundnut, pulses. Adopt mulching and rainwater harvesting. Mgnrega provides funds for farm pond construction." });
    } else {
      insights.push({ type: "success" as const, title: "Moderate Rainfall (600-1200mm)", description: "Balanced rainfall zone suitable for diverse crops. Both Kharif and Rabi seasons viable. Cotton, soybean, maize, wheat, chickpea, and vegetables recommended. Mixed cropping reduces risk. Micro-irrigation systems get 55% subsidy." });
    }

    if (data.soil.nitrogen < 280) {
      insights.push({ type: "warning" as const, title: "Low Nitrogen Levels (<280 mg/kg)", description: "Nitrogen deficiency affects leaf growth. Apply urea (यूरिया) 100-150 kg/ha or use biofertilizers. Grow green manure crops like dhaincha, sunhemp between seasons." });
    }
    if (data.soil.phosphorus < 11) {
      insights.push({ type: "info" as const, title: "Phosphorus Deficiency (<11 mg/kg)", description: "Essential for root development and flowering. Apply Single Super Phosphate (SSP) or DAP at 50-75 kg/ha." });
    }
    if (data.soil.potassium < 140) {
      insights.push({ type: "info" as const, title: "Low Potassium Content (<140 mg/kg)", description: "Important for disease resistance and fruit quality. Apply Muriate of Potash (MOP) 30-60 kg/ha." });
    }
    if (data.weather.avgTemperature > 30) {
      insights.push({ type: "info" as const, title: "High Temperature Region (>30°C average)", description: "Suitable for tropical crops: cotton, groundnut, millets, and summer vegetables. Heat-tolerant varieties essential." });
    }

    return insights;
  };

  const getStats = () => {
    if (!data) return [];
    return [
      { label: t("stats.avg_temp"), value: `${data.weather.avgTemperature}°C`, icon: <Thermometer className="h-5 w-5 text-primary" />, color: "bg-primary/10", trend: data.weather.avgTemperature > 20 ? ("up" as const) : ("neutral" as const) },
      { label: t("stats.annual_rainfall"), value: `${data.weather.avgAnnualRainfall.toFixed(0)} mm`, icon: <Droplets className="h-5 w-5 text-secondary" />, color: "bg-secondary/10", trend: data.weather.avgAnnualRainfall > 1000 ? ("up" as const) : data.weather.avgAnnualRainfall < 600 ? ("down" as const) : ("neutral" as const) },
      { label: t("stats.soil_quality"), value: data.soil.soilType, icon: <Leaf className="h-5 w-5 text-primary" />, color: "bg-primary/10", trend: "neutral" as const },
      { label: t("stats.ph_balance"), value: data.soil.ph.toFixed(1), icon: <Mountain className="h-5 w-5 text-accent" />, color: "bg-accent/10", trend: data.soil.ph >= 6 && data.soil.ph <= 7.5 ? ("up" as const) : ("neutral" as const) },
    ];
  };

  return (
    <div className="min-h-screen bg-background">
      <LanguageToggle />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Indian Agriculture Landscape" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/50 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-semibold text-primary-foreground tracking-wide">{t("hero.badge")}</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight">
            <span className="text-primary-foreground drop-shadow-lg">
              {t("hero.title")}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed font-light">
            {t("hero.subtitle")}
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {[
              { icon: <BarChart3 className="h-3.5 w-3.5" />, label: "5-Year Data" },
              { icon: <Leaf className="h-3.5 w-3.5" />, label: "Soil Analysis" },
              { icon: <Shield className="h-3.5 w-3.5" />, label: "Govt Schemes" },
              { icon: <Globe2 className="h-3.5 w-3.5" />, label: "AI Crop Insights" },
            ].map((pill) => (
              <div key={pill.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10">
                <span className="text-primary-foreground/70">{pill.icon}</span>
                <span className="text-xs font-medium text-primary-foreground/80">{pill.label}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <LocationSearch onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Scroll indicator */}
          {!data && (
            <div className="pt-8 animate-bounce">
              <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 mx-auto flex items-start justify-center p-1.5">
                <div className="w-1.5 h-3 rounded-full bg-primary-foreground/50 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Data Display Section */}
      {data && (
        <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-16 space-y-10">
          {/* Location Header */}
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">{data.location}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <span className="text-sm font-mono">
                      {data.coordinates.lat.toFixed(4)}°N, {Math.abs(data.coordinates.lng).toFixed(4)}°{data.coordinates.lng < 0 ? "W" : "E"}
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-sm">{t("misc.5yr_analysis")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button onClick={exportToCSV} variant="outline" size="lg" className="gap-2 rounded-xl">
                <FileSpreadsheet className="h-4 w-4" />
                {t("btn.export_csv")}
              </Button>
              <Button onClick={exportToJSON} variant="outline" size="lg" className="gap-2 rounded-xl">
                <FileJson className="h-4 w-4" />
                {t("btn.export_json")}
              </Button>
              <PDFReportGenerator data={data} />
            </div>
          </div>

          <StatsOverview stats={getStats()} />

          {/* Map and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[500px] rounded-2xl overflow-hidden shadow-[var(--shadow-strong)]">
              <MapView 
                location={{ 
                  ...data.coordinates, 
                  name: data.location,
                  boundingBox: data.coordinates.boundingBox,
                  polygon: data.coordinates.polygon
                }} 
              />
            </div>
            <DataInsights insights={getInsights()} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <WeatherCard data={data.weather} />
            <SoilCard data={data.soil} />
          </div>

          <DataChart weatherData={data.weather} soilData={data.soil} />

          <SeasonalCalendar weather={data.weather} soil={data.soil} location={data.location} />

          <CropRecommendations weather={data.weather} soil={data.soil} location={data.location} />

          <CostProfitCalculator weather={data.weather} soil={data.soil} location={data.location} />

          <GovernmentSchemes weather={data.weather} soil={data.soil} location={data.location} />
        </section>
      )}

      {/* Empty State */}
      {!data && !isLoading && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          {/* Trusted by banner */}
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6">{t("hero.badge")}</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-40">
              {["🌾 Open-Meteo", "🗺️ OpenStreetMap", "🤖 Gemini AI", "📊 SoilGrids"].map((src) => (
                <span key={src} className="text-lg font-semibold text-muted-foreground">{src}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <Thermometer className="h-7 w-7" />, color: "text-primary", bg: "bg-primary/10", title: t("empty.weather_title"), desc: t("empty.weather_desc") },
              { icon: <Leaf className="h-7 w-7" />, color: "text-secondary", bg: "bg-secondary/10", title: t("empty.soil_title"), desc: t("empty.soil_desc") },
              { icon: <MapPin className="h-7 w-7" />, color: "text-accent", bg: "bg-accent/10", title: t("empty.geo_title"), desc: t("empty.geo_desc") },
              { icon: <Sparkles className="h-7 w-7" />, color: "text-primary", bg: "bg-primary/10", title: t("empty.ai_title"), desc: t("empty.ai_desc") },
            ].map((card) => (
              <Card key={card.title} className="border-none shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-muted/20 group">
                <CardContent className="p-6 space-y-4">
                  <div className={`h-14 w-14 rounded-2xl ${card.bg} flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                    {card.icon}
                  </div>
                  <h4 className="font-bold text-foreground text-lg">{card.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-none shadow-[var(--shadow-soft)] bg-gradient-to-br from-primary/5 via-card to-secondary/5">
            <CardContent className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    🌾 {t("empty.farmers")}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{t("empty.farmers_desc")}</p>
                </div>
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                    🏛️ {t("empty.planners")}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{t("empty.planners_desc")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8 mt-16">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">The 5 Arcs</span>
            <span className="text-muted-foreground text-sm">— AI Rural Planning Platform</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Open-Meteo API</span>
            <span>•</span>
            <span>OpenStreetMap</span>
            <span>•</span>
            <span>Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
