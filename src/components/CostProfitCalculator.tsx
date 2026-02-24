import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calculator, TrendingUp, TrendingDown, IndianRupee, Wheat, Droplets, Sprout } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface CostProfitCalculatorProps {
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
  location: string;
}

interface CropProfile {
  name: string;
  nameHi: string;
  yieldPerHa: number; // quintals
  mspPerQuintal: number; // INR
  seedCostPerHa: number;
  fertilizerCostPerHa: number;
  laborCostPerHa: number;
  irrigationCostPerHa: number;
  pesticideCostPerHa: number;
  miscCostPerHa: number;
  waterNeedMm: number;
}

const cropDatabase: CropProfile[] = [
  { name: "Wheat", nameHi: "गेहूं", yieldPerHa: 35, mspPerQuintal: 2275, seedCostPerHa: 3500, fertilizerCostPerHa: 8000, laborCostPerHa: 12000, irrigationCostPerHa: 6000, pesticideCostPerHa: 2500, miscCostPerHa: 3000, waterNeedMm: 450 },
  { name: "Rice (Paddy)", nameHi: "धान", yieldPerHa: 40, mspPerQuintal: 2183, seedCostPerHa: 2500, fertilizerCostPerHa: 9000, laborCostPerHa: 15000, irrigationCostPerHa: 8000, pesticideCostPerHa: 3000, miscCostPerHa: 3500, waterNeedMm: 1200 },
  { name: "Cotton", nameHi: "कपास", yieldPerHa: 20, mspPerQuintal: 6620, seedCostPerHa: 4000, fertilizerCostPerHa: 7500, laborCostPerHa: 18000, irrigationCostPerHa: 5000, pesticideCostPerHa: 5000, miscCostPerHa: 4000, waterNeedMm: 700 },
  { name: "Soybean", nameHi: "सोयाबीन", yieldPerHa: 15, mspPerQuintal: 4600, seedCostPerHa: 5000, fertilizerCostPerHa: 5000, laborCostPerHa: 10000, irrigationCostPerHa: 3000, pesticideCostPerHa: 2000, miscCostPerHa: 2500, waterNeedMm: 500 },
  { name: "Groundnut", nameHi: "मूंगफली", yieldPerHa: 18, mspPerQuintal: 5850, seedCostPerHa: 8000, fertilizerCostPerHa: 5500, laborCostPerHa: 14000, irrigationCostPerHa: 4000, pesticideCostPerHa: 2500, miscCostPerHa: 3000, waterNeedMm: 500 },
  { name: "Sugarcane", nameHi: "गन्ना", yieldPerHa: 700, mspPerQuintal: 315, seedCostPerHa: 12000, fertilizerCostPerHa: 12000, laborCostPerHa: 25000, irrigationCostPerHa: 15000, pesticideCostPerHa: 4000, miscCostPerHa: 5000, waterNeedMm: 1800 },
  { name: "Mustard", nameHi: "सरसों", yieldPerHa: 14, mspPerQuintal: 5650, seedCostPerHa: 1500, fertilizerCostPerHa: 5000, laborCostPerHa: 8000, irrigationCostPerHa: 3000, pesticideCostPerHa: 1500, miscCostPerHa: 2000, waterNeedMm: 350 },
  { name: "Chickpea (Chana)", nameHi: "चना", yieldPerHa: 12, mspPerQuintal: 5440, seedCostPerHa: 4000, fertilizerCostPerHa: 3500, laborCostPerHa: 8000, irrigationCostPerHa: 2500, pesticideCostPerHa: 1500, miscCostPerHa: 2000, waterNeedMm: 300 },
];

const CostProfitCalculator = ({ weather, soil, location }: CostProfitCalculatorProps) => {
  const { t, lang } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<string>(cropDatabase[0].name);
  const [landArea, setLandArea] = useState<number>(1);
  const [areaUnit, setAreaUnit] = useState<"hectare" | "acre">("hectare");
  const [customSeedCost, setCustomSeedCost] = useState<string>("");
  const [customFertCost, setCustomFertCost] = useState<string>("");
  const [customLaborCost, setCustomLaborCost] = useState<string>("");

  const crop = cropDatabase.find((c) => c.name === selectedCrop) || cropDatabase[0];
  const areaInHa = areaUnit === "acre" ? landArea * 0.4047 : landArea;

  const analysis = useMemo(() => {
    const seedCost = (customSeedCost ? parseFloat(customSeedCost) : crop.seedCostPerHa) * areaInHa;
    const fertCost = (customFertCost ? parseFloat(customFertCost) : crop.fertilizerCostPerHa) * areaInHa;
    const laborCost = (customLaborCost ? parseFloat(customLaborCost) : crop.laborCostPerHa) * areaInHa;
    const irrigationCost = crop.irrigationCostPerHa * areaInHa;
    const pesticideCost = crop.pesticideCostPerHa * areaInHa;
    const miscCost = crop.miscCostPerHa * areaInHa;

    // Adjust yield based on environmental factors
    let yieldMultiplier = 1.0;
    // Rainfall effect
    if (weather.avgAnnualRainfall < crop.waterNeedMm * 0.5) yieldMultiplier *= 0.7;
    else if (weather.avgAnnualRainfall < crop.waterNeedMm * 0.8) yieldMultiplier *= 0.85;
    else if (weather.avgAnnualRainfall > crop.waterNeedMm * 2) yieldMultiplier *= 0.9;

    // Soil pH effect
    if (soil.ph < 5.5 || soil.ph > 8.5) yieldMultiplier *= 0.8;
    else if (soil.ph < 6 || soil.ph > 8) yieldMultiplier *= 0.9;

    // Nutrient effect
    if (soil.nitrogen < 200) yieldMultiplier *= 0.9;
    if (soil.phosphorus < 10) yieldMultiplier *= 0.95;

    const adjustedYield = crop.yieldPerHa * areaInHa * yieldMultiplier;
    const totalRevenue = adjustedYield * crop.mspPerQuintal;
    const totalCost = seedCost + fertCost + laborCost + irrigationCost + pesticideCost + miscCost;
    const netProfit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;
    const breakEvenYield = totalCost / crop.mspPerQuintal;

    return {
      seedCost, fertCost, laborCost, irrigationCost, pesticideCost, miscCost,
      totalCost, adjustedYield, totalRevenue, netProfit, roi, breakEvenYield, yieldMultiplier,
    };
  }, [crop, areaInHa, customSeedCost, customFertCost, customLaborCost, weather, soil]);

  const costBreakdown = [
    { name: lang === "hi" ? "बीज" : "Seed", value: Math.round(analysis.seedCost) },
    { name: lang === "hi" ? "उर्वरक" : "Fertilizer", value: Math.round(analysis.fertCost) },
    { name: lang === "hi" ? "श्रम" : "Labor", value: Math.round(analysis.laborCost) },
    { name: lang === "hi" ? "सिंचाई" : "Irrigation", value: Math.round(analysis.irrigationCost) },
    { name: lang === "hi" ? "कीटनाशक" : "Pesticide", value: Math.round(analysis.pesticideCost) },
    { name: lang === "hi" ? "अन्य" : "Misc", value: Math.round(analysis.miscCost) },
  ];

  const barColors = [
    "hsl(120, 65%, 35%)", "hsl(200, 70%, 50%)", "hsl(30, 90%, 55%)",
    "hsl(150, 60%, 45%)", "hsl(0, 84%, 60%)", "hsl(210, 25%, 60%)",
  ];

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <Card className="border-none shadow-[var(--shadow-soft)] bg-gradient-to-br from-card to-muted/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Calculator className="h-6 w-6 text-accent" />
          </div>
          <div>
            <CardTitle className="text-2xl">{t("calc.title")}</CardTitle>
            <CardDescription>{t("calc.desc")} {location}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>{t("calc.select_crop")}</Label>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {cropDatabase.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {lang === "hi" ? c.nameHi : c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("calc.land_area")}</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0.1}
                step={0.1}
                value={landArea}
                onChange={(e) => setLandArea(parseFloat(e.target.value) || 0)}
                className="flex-1"
              />
              <Select value={areaUnit} onValueChange={(v) => setAreaUnit(v as "hectare" | "acre")}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hectare">{lang === "hi" ? "हेक्टेयर" : "Hectare"}</SelectItem>
                  <SelectItem value="acre">{lang === "hi" ? "एकड़" : "Acre"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("calc.custom_seed")} ({t("calc.optional")})</Label>
            <Input type="number" placeholder={fmt(crop.seedCostPerHa) + "/ha"} value={customSeedCost} onChange={(e) => setCustomSeedCost(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("calc.custom_fert")} ({t("calc.optional")})</Label>
            <Input type="number" placeholder={fmt(crop.fertilizerCostPerHa) + "/ha"} value={customFertCost} onChange={(e) => setCustomFertCost(e.target.value)} />
          </div>
        </div>

        <Separator />

        {/* Results Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-muted/50 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <IndianRupee className="h-4 w-4" />
              {t("calc.total_cost")}
            </div>
            <p className="text-xl font-bold text-foreground">{fmt(Math.round(analysis.totalCost))}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Wheat className="h-4 w-4" />
              {t("calc.est_yield")}
            </div>
            <p className="text-xl font-bold text-foreground">{analysis.adjustedYield.toFixed(1)} {lang === "hi" ? "क्विंटल" : "qtl"}</p>
            {analysis.yieldMultiplier < 1 && (
              <p className="text-xs text-destructive">{t("calc.yield_adjusted")}</p>
            )}
          </div>
          <div className="p-4 rounded-xl bg-muted/50 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" />
              {t("calc.revenue")}
            </div>
            <p className="text-xl font-bold text-foreground">{fmt(Math.round(analysis.totalRevenue))}</p>
            <p className="text-xs text-muted-foreground">@ {fmt(crop.mspPerQuintal)}/{lang === "hi" ? "क्विंटल" : "qtl"} MSP</p>
          </div>
          <div className={`p-4 rounded-xl space-y-1 ${analysis.netProfit >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {analysis.netProfit >= 0 ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
              {t("calc.net_profit")}
            </div>
            <p className={`text-xl font-bold ${analysis.netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
              {fmt(Math.round(analysis.netProfit))}
            </p>
            <p className="text-xs text-muted-foreground">ROI: {analysis.roi.toFixed(1)}%</p>
          </div>
        </div>

        {/* Cost Breakdown Chart + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t("calc.cost_breakdown")}</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={costBreakdown} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" width={80} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {costBreakdown.map((_, i) => (
                    <Cell key={i} fill={barColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">{t("calc.break_even")}</h4>
            <div className="p-4 rounded-xl bg-muted/30 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("calc.be_yield")}</span>
                <span className="font-medium text-foreground">{analysis.breakEvenYield.toFixed(1)} {lang === "hi" ? "क्विंटल" : "qtl"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("calc.actual_yield")}</span>
                <span className="font-medium text-foreground">{analysis.adjustedYield.toFixed(1)} {lang === "hi" ? "क्विंटल" : "qtl"}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("calc.yield_margin")}</span>
                <span className={`font-bold ${analysis.adjustedYield > analysis.breakEvenYield ? "text-primary" : "text-destructive"}`}>
                  {analysis.adjustedYield > analysis.breakEvenYield ? "+" : ""}{((analysis.adjustedYield - analysis.breakEvenYield) / analysis.breakEvenYield * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-secondary" />
                <span className="font-medium text-sm text-foreground">{t("calc.water_note")}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {lang === "hi"
                  ? `${crop.nameHi} को ${crop.waterNeedMm} मिमी पानी चाहिए। आपके क्षेत्र में ${weather.avgAnnualRainfall.toFixed(0)} मिमी वर्षा होती है।`
                  : `${crop.name} needs ${crop.waterNeedMm}mm water. Your area receives ${weather.avgAnnualRainfall.toFixed(0)}mm rainfall.`}
                {weather.avgAnnualRainfall < crop.waterNeedMm
                  ? ` ${lang === "hi" ? "⚠️ सिंचाई आवश्यक है।" : "⚠️ Supplemental irrigation needed."}`
                  : ` ${lang === "hi" ? "✅ पर्याप्त वर्षा।" : "✅ Sufficient rainfall."}`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-2">
              <div className="flex items-center gap-2">
                <Sprout className="h-4 w-4 text-accent" />
                <span className="font-medium text-sm text-foreground">{t("calc.env_impact")}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {analysis.yieldMultiplier < 0.85
                  ? (lang === "hi" ? "⚠️ मिट्टी/जलवायु की स्थिति के कारण उपज में उल्लेखनीय कमी। वैकल्पिक फसल पर विचार करें।" : "⚠️ Significant yield reduction due to soil/climate conditions. Consider alternative crops.")
                  : analysis.yieldMultiplier < 1
                    ? (lang === "hi" ? "⚡ हल्का पर्यावरणीय प्रभाव। मिट्टी संशोधन से उपज बढ़ सकती है।" : "⚡ Mild environmental impact. Soil amendments may improve yield.")
                    : (lang === "hi" ? "✅ इस फसल के लिए पर्यावरणीय परिस्थितियां अनुकूल हैं।" : "✅ Environmental conditions are favorable for this crop.")}
              </p>
            </div>
          </div>
        </div>

        {/* Crop Comparison Table */}
        <div>
          <h4 className="font-semibold text-foreground mb-4">{t("calc.compare_title")}</h4>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("calc.crop")}</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">{t("calc.cost_ha")}</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">{t("calc.revenue_ha")}</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">{t("calc.profit_ha")}</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">ROI</th>
                </tr>
              </thead>
              <tbody>
                {cropDatabase.map((c) => {
                  const cost = c.seedCostPerHa + c.fertilizerCostPerHa + c.laborCostPerHa + c.irrigationCostPerHa + c.pesticideCostPerHa + c.miscCostPerHa;
                  const rev = c.yieldPerHa * c.mspPerQuintal;
                  const profit = rev - cost;
                  const roi = ((profit / cost) * 100);
                  return (
                    <tr key={c.name} className={`border-t border-border ${c.name === selectedCrop ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                      <td className="p-3 font-medium text-foreground">{lang === "hi" ? c.nameHi : c.name}</td>
                      <td className="p-3 text-right text-muted-foreground">{fmt(cost)}</td>
                      <td className="p-3 text-right text-muted-foreground">{fmt(rev)}</td>
                      <td className={`p-3 text-right font-medium ${profit >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(profit)}</td>
                      <td className={`p-3 text-right font-medium ${roi >= 0 ? "text-primary" : "text-destructive"}`}>{roi.toFixed(0)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t("calc.disclaimer")}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostProfitCalculator;
