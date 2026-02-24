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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={cn(
            "animate-fade-in border-none shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-strong)] transition-all duration-300 hover:-translate-y-1",
            "bg-gradient-to-br from-card to-muted/20 overflow-hidden relative group"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Decorative accent line */}
          <div className={cn("absolute top-0 left-0 right-0 h-1", index === 0 && "bg-primary", index === 1 && "bg-secondary", index === 2 && "bg-primary", index === 3 && "bg-accent")} />
          <CardContent className="p-5 pt-6">
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110", stat.color)}>
                {stat.icon}
              </div>
              {stat.trend && (
                <div className="flex items-center gap-1 text-sm">
                  {getTrendIcon(stat.trend)}
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
