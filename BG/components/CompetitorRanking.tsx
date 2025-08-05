import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowUpRight, TrendingUp, TrendingDown, Crown } from "lucide-react";

const competitors = [
  {
    rank: 1,
    name: "AI8 Digital",
    logo: "A8",
    score: 8.4,
    change: "+0.3",
    trend: "up",
    isYou: true,
    gradient: "from-ai8-navy to-ai8-neon"
  },
  {
    rank: 2,
    name: "TechCorp Solutions",
    logo: "TC",
    score: 7.9,
    change: "-0.1",
    trend: "down",
    isYou: false,
    gradient: "from-blue-500 to-blue-600"
  },
  {
    rank: 3,
    name: "InnovateLabs",
    logo: "IL",
    score: 7.6,
    change: "+0.2",
    trend: "up",
    isYou: false,
    gradient: "from-purple-500 to-purple-600"
  },
  {
    rank: 4,
    name: "NextGen Analytics",
    logo: "NG",
    score: 7.2,
    change: "0.0",
    trend: "neutral",
    isYou: false,
    gradient: "from-orange-500 to-orange-600"
  },
  {
    rank: 5,
    name: "DataWise Pro",
    logo: "DW",
    score: 6.8,
    change: "-0.4",
    trend: "down",
    isYou: false,
    gradient: "from-red-500 to-red-600"
  },
];

export function CompetitorRanking() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-ai8-success" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-ai8-error" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-ai8-success";
      case "down":
        return "text-ai8-error";
      default:
        return "text-ai8-gray";
    }
  };

  return (
    <Card className="ai8-card border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-8">
        <div>
          <CardTitle className="text-xl font-bold text-ai8-navy">Competitor Ranking</CardTitle>
          <CardDescription className="text-ai8-gray font-medium">
            How you rank against key competitors in AI visibility
          </CardDescription>
        </div>
        <button className="ai8-button-secondary gap-2 flex items-center">
          View Full Report
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        {competitors.map((competitor) => (
          <div
            key={competitor.rank}
            className={`p-5 rounded-xl border transition-all duration-200 ${
              competitor.isYou 
                ? "border-ai8-neon/30 bg-ai8-neon/5 ai8-shadow ai8-glow-neon-subtle" 
                : "border-gray-100 bg-ai8-light/30 hover:ai8-shadow"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-4">
                  {competitor.rank === 1 && (
                    <Crown className="w-6 h-6 text-ai8-warning" />
                  )}
                  <div className={`
                    w-12 h-12 rounded-2xl bg-gradient-to-br ${competitor.gradient} 
                    flex items-center justify-center ai8-shadow
                  `}>
                    <span className="text-ai8-white font-bold text-sm">{competitor.logo}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-ai8-navy text-lg">
                      #{competitor.rank} {competitor.name}
                    </span>
                    {competitor.isYou && (
                      <Badge className="bg-ai8-neon/20 text-ai8-neon border-ai8-neon/30 font-bold">You</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-sm text-ai8-gray font-medium">Score: </span>
                    <span className="text-sm font-bold text-ai8-navy">{competitor.score}</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(competitor.trend)}
                      <span className={`text-sm font-bold ${getTrendColor(competitor.trend)}`}>
                        {competitor.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}