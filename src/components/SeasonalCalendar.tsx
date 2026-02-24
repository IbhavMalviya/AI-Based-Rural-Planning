import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Sun, CloudRain, Snowflake, Sprout, Wheat } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SeasonalCalendarProps {
  weather: {
    avgTemperature: number;
    avgHumidity: number;
    prevYearRainfall: number;
    avgAnnualRainfall: number;
  };
  soil: {
    ph: number;
    soilType: string;
  };
  location: string;
}

interface CropWindow {
  crop: string;
  sowStart: number;
  sowEnd: number;
  harvestStart: number;
  harvestEnd: number;
  season: "kharif" | "rabi" | "zaid";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const seasonConfig = {
  kharif: { label: "Kharif", color: "bg-primary/20 text-primary", icon: CloudRain, months: "Jun–Oct" },
  rabi: { label: "Rabi", color: "bg-secondary/20 text-secondary", icon: Snowflake, months: "Oct–Mar" },
  zaid: { label: "Zaid", color: "bg-accent/20 text-accent", icon: Sun, months: "Mar–Jun" },
};

const getCropWindows = (weather: SeasonalCalendarProps["weather"], soil: SeasonalCalendarProps["soil"]): CropWindow[] => {
  const crops: CropWindow[] = [];
  const rainfall = weather.avgAnnualRainfall;
  const temp = weather.avgTemperature;

  if (rainfall > 500) crops.push({ crop: "Rice (Paddy)", sowStart: 5, sowEnd: 6, harvestStart: 9, harvestEnd: 10, season: "kharif" });
  crops.push({ crop: "Maize", sowStart: 5, sowEnd: 6, harvestStart: 8, harvestEnd: 9, season: "kharif" });
  if (rainfall > 400) crops.push({ crop: "Cotton", sowStart: 4, sowEnd: 5, harvestStart: 9, harvestEnd: 11, season: "kharif" });
  crops.push({ crop: "Soybean", sowStart: 5, sowEnd: 6, harvestStart: 9, harvestEnd: 10, season: "kharif" });
  if (rainfall < 800) crops.push({ crop: "Bajra (Millet)", sowStart: 5, sowEnd: 6, harvestStart: 8, harvestEnd: 9, season: "kharif" });

  crops.push({ crop: "Wheat", sowStart: 10, sowEnd: 11, harvestStart: 2, harvestEnd: 3, season: "rabi" });
  crops.push({ crop: "Chickpea (Gram)", sowStart: 9, sowEnd: 10, harvestStart: 1, harvestEnd: 2, season: "rabi" });
  crops.push({ crop: "Mustard", sowStart: 9, sowEnd: 10, harvestStart: 1, harvestEnd: 2, season: "rabi" });
  if (soil.ph >= 6 && soil.ph <= 7.5) crops.push({ crop: "Potato", sowStart: 9, sowEnd: 10, harvestStart: 0, harvestEnd: 1, season: "rabi" });

  if (temp > 25) {
    crops.push({ crop: "Watermelon", sowStart: 1, sowEnd: 2, harvestStart: 4, harvestEnd: 5, season: "zaid" });
    crops.push({ crop: "Cucumber", sowStart: 2, sowEnd: 3, harvestStart: 4, harvestEnd: 5, season: "zaid" });
    crops.push({ crop: "Moong Dal", sowStart: 2, sowEnd: 3, harvestStart: 4, harvestEnd: 5, season: "zaid" });
  }

  return crops;
};

const isInRange = (month: number, start: number, end: number): boolean => {
  if (start <= end) return month >= start && month <= end;
  return month >= start || month <= end;
};

const SeasonalCalendar = ({ weather, soil, location }: SeasonalCalendarProps) => {
  const { t } = useLanguage();
  const cropWindows = getCropWindows(weather, soil);

  const getMonthBg = (month: number) => {
    if (month >= 5 && month <= 9) return "bg-primary/5";
    if (month >= 10 || month <= 1) return "bg-secondary/5";
    if (month >= 2 && month <= 5) return "bg-accent/5";
    return "";
  };

  return (
    <Card className="border-none shadow-[var(--shadow-strong)]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{t("section.calendar")}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{t("section.calendar_desc")} {location}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(seasonConfig) as Array<keyof typeof seasonConfig>).map((key) => {
              const s = seasonConfig[key];
              const Icon = s.icon;
              return (
                <Badge key={key} variant="outline" className={`${s.color} gap-1 px-3 py-1`}>
                  <Icon className="h-3 w-3" />
                  {s.label} ({s.months})
                </Badge>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[180px_repeat(12,1fr)] gap-0 mb-1">
              <div className="text-xs font-semibold text-muted-foreground px-2 py-2">{t("cal.crop")}</div>
              {MONTHS.map((m, i) => (
                <div key={m} className={`text-xs font-medium text-center py-2 ${getMonthBg(i)}`}>{m}</div>
              ))}
            </div>

            {cropWindows.map((cw, idx) => {
              const sc = seasonConfig[cw.season];
              return (
                <div key={idx} className="grid grid-cols-[180px_repeat(12,1fr)] gap-0 border-t border-border/50">
                  <div className="flex items-center gap-2 px-2 py-2.5">
                    <span className="text-sm font-medium text-foreground truncate">{cw.crop}</span>
                    <Badge variant="outline" className={`${sc.color} text-[10px] px-1.5 py-0 shrink-0`}>{sc.label}</Badge>
                  </div>
                  {MONTHS.map((_, monthIdx) => {
                    const isSowing = isInRange(monthIdx, cw.sowStart, cw.sowEnd);
                    const isHarvest = isInRange(monthIdx, cw.harvestStart, cw.harvestEnd);
                    const isGrowing = !isSowing && !isHarvest && (() => {
                      const growStart = (cw.sowEnd + 1) % 12;
                      const growEnd = (cw.harvestStart - 1 + 12) % 12;
                      return isInRange(monthIdx, growStart, growEnd);
                    })();

                    return (
                      <div key={monthIdx} className={`flex items-center justify-center py-2.5 ${getMonthBg(monthIdx)}`}>
                        {isSowing && (
                          <div className="w-full mx-0.5 h-6 rounded-sm bg-primary/70 flex items-center justify-center" title={t("cal.sowing")}>
                            <Sprout className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                        {isHarvest && (
                          <div className="w-full mx-0.5 h-6 rounded-sm bg-accent/70 flex items-center justify-center" title={t("cal.harvest")}>
                            <Wheat className="h-3 w-3 text-accent-foreground" />
                          </div>
                        )}
                        {isGrowing && (
                          <div className="w-full mx-0.5 h-6 rounded-sm bg-secondary/30" title={t("cal.growing")} />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border/50 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-5 h-4 rounded-sm bg-primary/70 flex items-center justify-center"><Sprout className="h-2.5 w-2.5 text-primary-foreground" /></div>
            <span className="text-xs text-muted-foreground">{t("cal.sowing")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-4 rounded-sm bg-secondary/30" />
            <span className="text-xs text-muted-foreground">{t("cal.growing")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-4 rounded-sm bg-accent/70 flex items-center justify-center"><Wheat className="h-2.5 w-2.5 text-accent-foreground" /></div>
            <span className="text-xs text-muted-foreground">{t("cal.harvest")}</span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">🌧️ Monsoon Note:</strong> {t("cal.monsoon_note")} <strong>{weather.avgAnnualRainfall.toFixed(0)} mm/year</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeasonalCalendar;
