import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sprout, TrendingUp, IndianRupee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const { toast } = useToast();

  const getCropRecommendations = async () => {
    setIsLoading(true);
    console.log('[CROP-RECOMMEND] Fetching recommendations for:', location);

    try {
      const { data, error } = await supabase.functions.invoke('predict-crops', {
        body: { weather, soil, location }
      });

      if (error) {
        console.error('[CROP-RECOMMEND] Error:', error);
        throw error;
      }

      console.log('[CROP-RECOMMEND] Received recommendations');
      setRecommendations(data.recommendations);
      
      toast({
        title: "✅ Crop Recommendations Generated",
        description: "AI-powered analysis complete for your region",
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

  return (
    <Card className="animate-fade-in shadow-[var(--shadow-strong)] border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sprout className="h-6 w-6 text-primary" />
              AI-Powered Crop Recommendations
            </CardTitle>
            <CardDescription className="text-base">
              Get personalized crop suggestions based on your soil and weather conditions for {location}
            </CardDescription>
          </div>
          {!recommendations && (
            <Button 
              onClick={getCropRecommendations}
              disabled={isLoading}
              size="lg"
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Get Recommendations
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      
      {recommendations && (
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary mb-4">
                <IndianRupee className="h-5 w-5" />
                <span className="font-semibold text-lg">Expert Agricultural Guidance for Indian Farmers</span>
              </div>
              
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {recommendations}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={getCropRecommendations}
              variant="outline"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh Recommendations'
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default CropRecommendations;
