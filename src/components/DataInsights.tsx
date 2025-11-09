import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface Insight {
  type: "warning" | "success" | "info";
  title: string;
  description: string;
}

interface DataInsightsProps {
  insights: Insight[];
}

const DataInsights = ({ insights }: DataInsightsProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-5 w-5 text-accent" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
      default:
        return <Info className="h-5 w-5 text-secondary" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "warning":
        return "destructive";
      case "success":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="animate-fade-in shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="text-primary">AI-Powered Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="flex gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(insight.type)}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{insight.title}</h4>
                <Badge variant={getBadgeVariant(insight.type)} className="text-xs">
                  {insight.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{insight.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DataInsights;
