import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cloud, Droplets, Thermometer, Wind } from "lucide-react";
import InfoTooltip from "./InfoTooltip";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

  const metrics = [
    { icon: <Thermometer className="h-5 w-5" />, iconColor: "text-primary", bg: "bg-primary/10", label: t("weather.avg_temp"), value: `${data.avgTemperature}°C`, sub: data.avgTemperature > 30 ? "Hot zone" : data.avgTemperature < 15 ? "Cool zone" : "Moderate" },
    { icon: <Wind className="h-5 w-5" />, iconColor: "text-secondary", bg: "bg-secondary/10", label: t("weather.avg_humidity"), value: `${data.avgHumidity}%`, sub: data.avgHumidity > 70 ? "High humidity" : "Normal" },
    { icon: <Cloud className="h-5 w-5" />, iconColor: "text-accent", bg: "bg-accent/10", label: t("weather.last_year_rainfall"), value: `${data.prevYearRainfall} mm`, sub: data.prevYearRainfall > 1200 ? "Heavy rainfall" : data.prevYearRainfall < 600 ? "Low rainfall" : "Moderate" },
    { icon: <Droplets className="h-5 w-5" />, iconColor: "text-primary", bg: "bg-primary/10", label: t("weather.avg_annual_rainfall"), value: `${data.avgAnnualRainfall} mm`, sub: "5-year average" },
  ];

  return (
    <Card className="animate-fade-in border-none shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300 bg-gradient-to-br from-card to-muted/20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
      <CardHeader className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Cloud className="h-5 w-5" />
              {t("section.weather")}
            </CardTitle>
            <CardDescription>{t("section.weather_desc")}</CardDescription>
          </div>
          <InfoTooltip content="Weather data is sourced from Open-Meteo API, analyzing 5 years of historical records." />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((m, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
            <div className={`p-2.5 rounded-xl ${m.bg} ${m.iconColor} group-hover:scale-110 transition-transform`}>
              {m.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="text-xs text-muted-foreground/60">{m.sub}</p>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{m.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
