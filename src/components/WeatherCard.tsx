import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cloud, Droplets, Thermometer } from "lucide-react";
import InfoTooltip from "./InfoTooltip";

interface WeatherData {
  avgTemperature: number;
  avgHumidity: number;
  prevYearRainfall: number;
  avgAnnualRainfall: number;
}

interface WeatherCardProps {
  data: WeatherData;
}

const WeatherCard = ({ data }: WeatherCardProps) => {
  return (
    <Card className="animate-fade-in shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Cloud className="h-5 w-5" />
              Weather Patterns (5-Year Analysis)
            </CardTitle>
            <CardDescription>
              Historical climate data averaged over 2018-2023
            </CardDescription>
          </div>
          <InfoTooltip content="Weather data is sourced from Open-Meteo API, analyzing 5 years of historical records. Temperature and humidity help determine suitable crop varieties and irrigation needs." />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Thermometer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Temperature</p>
              <p className="text-2xl font-bold text-foreground">{data.avgTemperature}°C</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Droplets className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Humidity</p>
              <p className="text-2xl font-bold text-foreground">{data.avgHumidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Cloud className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Year Rainfall</p>
              <p className="text-2xl font-bold text-foreground">{data.prevYearRainfall} mm</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Droplets className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Annual Rainfall</p>
              <p className="text-2xl font-bold text-foreground">{data.avgAnnualRainfall} mm</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
