import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import InfoTooltip from "./InfoTooltip";
import { useLanguage } from "@/contexts/LanguageContext";

interface SoilData {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  soilType: string;
}

interface SoilCardProps {
  data: SoilData;
}

const SoilCard = ({ data }: SoilCardProps) => {
  const { t } = useLanguage();

  const getPhColor = (ph: number) => {
    if (ph < 6) return "text-destructive";
    if (ph > 7.5) return "text-accent";
    return "text-primary";
  };

  const getPhLabel = (ph: number) => {
    if (ph < 6) return "Acidic";
    if (ph > 7.5) return "Alkaline";
    return "Optimal";
  };

  const nutrients = [
    { label: t("soil.nitrogen"), value: data.nitrogen, color: "bg-primary", max: 600, unit: "mg/kg", status: data.nitrogen < 280 ? "Low" : "Good" },
    { label: t("soil.phosphorus"), value: data.phosphorus, color: "bg-secondary", max: 50, unit: "mg/kg", status: data.phosphorus < 11 ? "Low" : "Good" },
    { label: t("soil.potassium"), value: data.potassium, color: "bg-accent", max: 400, unit: "mg/kg", status: data.potassium < 140 ? "Low" : "Good" },
  ];

  return (
    <Card className="animate-fade-in border-none shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300 bg-gradient-to-br from-card to-muted/20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
      <CardHeader className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Leaf className="h-5 w-5" />
              {t("section.soil")}
            </CardTitle>
            <CardDescription>{t("section.soil_desc")}</CardDescription>
          </div>
          <InfoTooltip content="N promotes leaf growth, P supports root development, K strengthens disease resistance. pH between 6-7.5 is ideal." />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Soil Type & pH */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{t("soil.type")}</p>
            <Badge variant="secondary" className="text-sm px-3 py-1">{data.soilType}</Badge>
          </div>
          <div className="p-4 rounded-xl bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{t("soil.ph")}</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getPhColor(data.ph)}`}>{data.ph}</span>
              <span className={`text-xs font-medium ${getPhColor(data.ph)}`}>{getPhLabel(data.ph)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div className="bg-primary h-1.5 rounded-full transition-all duration-700" style={{ width: `${(data.ph / 14) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* NPK with progress bars */}
        <div className="space-y-4">
          {nutrients.map((n) => (
            <div key={n.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{n.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{n.value} <span className="text-xs text-muted-foreground font-normal">{n.unit}</span></span>
                  <Badge variant={n.status === "Low" ? "destructive" : "default"} className="text-[10px] px-1.5 py-0">{n.status}</Badge>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className={`${n.color} h-2 rounded-full transition-all duration-700`} style={{ width: `${Math.min((n.value / n.max) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SoilCard;
