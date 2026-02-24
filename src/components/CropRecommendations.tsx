import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sprout, TrendingUp, IndianRupee, Droplets, Calendar, Timer, Banknote, Leaf, AlertCircle, Lightbulb, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface CropData {
  name: string;
  suitability: number;
  probability: number;
  season: string;
  duration: string;
  yield: string;
  marketPrice: string;
  waterNeed: string;
  npkRatio: string;
  benefits: string;
  tips: string;
  pests: string;
}

interface AdditionalInfo {
  cropRotation: string;
  soilManagement: string;
  waterStrategy: string;
  govSchemes: string;
  incomePotential: string;
}

interface CropRecommendationsProps {
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

const CropRecommendations = ({ weather, soil, location }: CropRecommendationsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [crops, setCrops] = useState<CropData[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const parseCropRecommendations = (text: string) => {
    const cropsList: CropData[] = [];
    const cropMatches = text.split('---CROP START---');
    
    cropMatches.forEach(cropText => {
      if (!cropText.includes('---CROP END---')) return;
      const crop = cropText.split('---CROP END---')[0];
      const nameMatch = crop.match(/\*\*Crop Name:\*\*\s*(.+)/);
      const suitabilityMatch = crop.match(/\*\*Suitability:\*\*\s*(\d+)/);
      const probabilityMatch = crop.match(/\*\*Probability:\*\*\s*(\d+)/);
      const seasonMatch = crop.match(/\*\*Season:\*\*\s*(.+)/);
      const durationMatch = crop.match(/\*\*Duration:\*\*\s*(.+)/);
      const yieldMatch = crop.match(/\*\*Yield:\*\*\s*(.+)/);
      const priceMatch = crop.match(/\*\*Market Price:\*\*\s*(.+)/);
      const waterMatch = crop.match(/\*\*Water Need:\*\*\s*(.+)/);
      const npkMatch = crop.match(/\*\*NPK Ratio:\*\*\s*(.+)/);
      const benefitsMatch = crop.match(/\*\*Key Benefits:\*\*\s*(.+)/);
      const tipsMatch = crop.match(/\*\*Cultivation Tips:\*\*\s*(.+)/);
      const pestsMatch = crop.match(/\*\*Pests\/Diseases:\*\*\s*(.+)/);

      if (nameMatch) {
        cropsList.push({
          name: nameMatch[1].trim(),
          suitability: suitabilityMatch ? parseInt(suitabilityMatch[1]) : 0,
          probability: probabilityMatch ? parseInt(probabilityMatch[1]) : 0,
          season: seasonMatch ? seasonMatch[1].trim() : '',
          duration: durationMatch ? durationMatch[1].trim() : '',
          yield: yieldMatch ? yieldMatch[1].trim() : '',
          marketPrice: priceMatch ? priceMatch[1].trim() : '',
          waterNeed: waterMatch ? waterMatch[1].trim() : '',
          npkRatio: npkMatch ? npkMatch[1].trim() : '',
          benefits: benefitsMatch ? benefitsMatch[1].trim() : '',
          tips: tipsMatch ? tipsMatch[1].trim() : '',
          pests: pestsMatch ? pestsMatch[1].trim() : '',
        });
      }
    });

    const additionalSection = text.split('---ADDITIONAL INFO---')[1]?.split('---END INFO---')[0];
    if (additionalSection) {
      const rotationMatch = additionalSection.match(/\*\*Crop Rotation:\*\*\s*(.+?)(?=\*\*|$)/s);
      const soilMatch = additionalSection.match(/\*\*Soil Management:\*\*\s*(.+?)(?=\*\*|$)/s);
      const waterMatch = additionalSection.match(/\*\*Water Strategy:\*\*\s*(.+?)(?=\*\*|$)/s);
      const schemesMatch = additionalSection.match(/\*\*Government Schemes:\*\*\s*(.+?)(?=\*\*|$)/s);
      const incomeMatch = additionalSection.match(/\*\*Income Potential:\*\*\s*(.+?)(?=\*\*|$)/s);

      setAdditionalInfo({
        cropRotation: rotationMatch ? rotationMatch[1].trim() : '',
        soilManagement: soilMatch ? soilMatch[1].trim() : '',
        waterStrategy: waterMatch ? waterMatch[1].trim() : '',
        govSchemes: schemesMatch ? schemesMatch[1].trim() : '',
        incomePotential: incomeMatch ? incomeMatch[1].trim() : '',
      });
    }

    return cropsList;
  };

  const getCropRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('predict-crops', {
        body: { weather, soil, location }
      });

      if (error) throw error;

      const parsedCrops = parseCropRecommendations(data.recommendations);
      setCrops(parsedCrops);
      setHasFetched(true);
      
      toast({
        title: "✅ Crop Recommendations Generated",
        description: `${parsedCrops.length} crops analyzed for your region`,
      });
    } catch (error) {
      console.error('[CROP-RECOMMEND] Failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate recommendations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (!hasFetched && location && weather && soil) {
      getCropRecommendations();
    }
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="animate-fade-in shadow-[var(--shadow-strong)] border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sprout className="h-6 w-6 text-primary" />
              {t("section.crop_rec")}
            </CardTitle>
            <CardDescription className="text-base">
              {t("section.crop_rec_desc")} {location}
            </CardDescription>
          </div>
          {isLoading && crops.length === 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">{t("misc.loading")}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      {crops.length > 0 && (
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {crops.map((crop, index) => (
              <Card key={index} className="border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-[var(--shadow-soft)]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-primary" />
                        {crop.name}
                      </CardTitle>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          {crop.season}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Timer className="h-3 w-3" />
                          {crop.duration}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{crop.probability}%</div>
                      <div className="text-xs text-muted-foreground">{t("crop.success_rate")}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t("crop.suitability")}</span>
                      <span className="text-sm font-bold">{crop.suitability}/10</span>
                    </div>
                    <Progress value={crop.suitability * 10} className="h-2" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground">{t("crop.yield")}</div>
                          <div className="text-sm">{crop.yield}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Banknote className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground">{t("crop.market_price")}</div>
                          <div className="text-sm">{crop.marketPrice}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Droplets className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground">{t("crop.water")}</div>
                          <div className="text-sm">{crop.waterNeed}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Leaf className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground">{t("crop.npk")}</div>
                          <div className="text-sm">{crop.npkRatio}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground">{t("crop.benefits")}</div>
                          <div className="text-sm">{crop.benefits}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-accent/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-1">{t("crop.tips")}</div>
                        <div className="text-sm">{crop.tips}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-destructive mb-1">{t("crop.pests")}</div>
                        <div className="text-sm text-foreground">{crop.pests}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {additionalInfo && (
            <Card className="border-2 border-accent/50 bg-gradient-to-br from-accent/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-primary" />
                  {t("crop.additional")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><Sprout className="h-4 w-4" />{t("crop.rotation")}</h4>
                    <p className="text-sm text-muted-foreground">{additionalInfo.cropRotation}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><Leaf className="h-4 w-4" />{t("crop.soil_mgmt")}</h4>
                    <p className="text-sm text-muted-foreground">{additionalInfo.soilManagement}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><Droplets className="h-4 w-4" />{t("crop.water_strategy")}</h4>
                    <p className="text-sm text-muted-foreground">{additionalInfo.waterStrategy}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><IndianRupee className="h-4 w-4" />{t("crop.income")}</h4>
                    <p className="text-sm text-muted-foreground">{additionalInfo.incomePotential}</p>
                  </div>
                </div>
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4" />{t("crop.gov_schemes")}</h4>
                  <p className="text-sm text-muted-foreground">{additionalInfo.govSchemes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={getCropRecommendations} variant="outline" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{t("misc.refreshing")}</>
              ) : (
                <><TrendingUp className="h-4 w-4" />{t("btn.refresh")}</>
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default CropRecommendations;
