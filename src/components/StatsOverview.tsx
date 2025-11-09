import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: React.ReactNode;
  color: string;
}

interface StatsOverviewProps {
  stats: Stat[];
}

const StatsOverview = ({ stats }: StatsOverviewProps) => {
  const getTrendIcon = (trend?: "up" | "down" | "neutral") => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-primary" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={cn(
            "animate-fade-in border-none shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300",
            "bg-gradient-to-br from-card to-card/50"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-3 rounded-xl", stat.color)}>
                {stat.icon}
              </div>
              {stat.trend && (
                <div className="flex items-center gap-1 text-sm">
                  {getTrendIcon(stat.trend)}
                  {stat.trendValue && (
                    <span className="text-muted-foreground">{stat.trendValue}</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
