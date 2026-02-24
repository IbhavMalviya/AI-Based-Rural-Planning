import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import InfoTooltip from "./InfoTooltip";
import { useLanguage } from "@/contexts/LanguageContext";

interface DataChartProps {
  weatherData: {
    avgTemperature: number;
    avgHumidity: number;
    prevYearRainfall: number;
    avgAnnualRainfall: number;
  };
  soilData: {
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

const DataChart = ({ weatherData, soilData }: DataChartProps) => {
  const { t } = useLanguage();

  const chartData = [
    {
      category: "NPK Levels",
      Nitrogen: soilData.nitrogen,
      Phosphorus: soilData.phosphorus,
      Potassium: soilData.potassium,
    },
  ];

  return (
    <Card className="animate-fade-in shadow-[var(--shadow-soft)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              {t("section.npk_chart")}
            </CardTitle>
            <CardDescription>{t("section.npk_chart_desc")}</CardDescription>
          </div>
          <InfoTooltip content="NPK chart shows Nitrogen, Phosphorus, and Potassium levels. Balanced ratios are crucial for optimal crop growth." />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="category" />
            <YAxis label={{ value: 'mg/kg', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="Nitrogen" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Phosphorus" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Potassium" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DataChart;
