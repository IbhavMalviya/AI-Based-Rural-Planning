import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const getPhColor = (ph: number) => {
    if (ph < 6) return "text-destructive";
    if (ph > 7.5) return "text-accent";
    return "text-primary";
  };

  return (
    <Card className="animate-fade-in shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Leaf className="h-5 w-5" />
          Soil Composition Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium text-muted-foreground">Soil Type</span>
          <Badge variant="secondary" className="text-base px-4 py-1">
            {data.soilType}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">pH Level</span>
              <span className={`text-2xl font-bold ${getPhColor(data.ph)}`}>
                {data.ph}
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${(data.ph / 14) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Nitrogen (N)</span>
              <span className="text-2xl font-bold text-primary">{data.nitrogen}</span>
            </div>
            <p className="text-xs text-muted-foreground">mg/kg</p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Phosphorus (P)</span>
              <span className="text-2xl font-bold text-secondary">{data.phosphorus}</span>
            </div>
            <p className="text-xs text-muted-foreground">mg/kg</p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Potassium (K)</span>
              <span className="text-2xl font-bold text-accent">{data.potassium}</span>
            </div>
            <p className="text-xs text-muted-foreground">mg/kg</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SoilCard;
