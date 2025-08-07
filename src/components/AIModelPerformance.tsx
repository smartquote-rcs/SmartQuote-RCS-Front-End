import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";

const models = [
  {
    name: "OpenAI",
    logo: "🤖",
    visibility: 8.7,
    presence: 82,
    change: 12.5,
    trend: "up",
    color: "from-green-500 to-emerald-600"
  },
  {
    name: "Anthropic", 
    logo: "🔮",
    visibility: 7.2,
    presence: 68,
    change: 5.3,
    trend: "up",
    color: "from-purple-500 to-violet-600"
  },
  {
    name: "Google Gemini",
    logo: "✨", 
    visibility: 6.8,
    presence: 71,
    change: -2.1,
    trend: "down",
    color: "from-blue-500 to-cyan-600"
  },
  {
    name: "Meta AI",
    logo: "🌐",
    visibility: 5.9,
    presence: 64,
    change: 8.7,
    trend: "up", 
    color: "from-orange-500 to-red-600"
  },
  {
    name: "Grok",
    logo: "⚡",
    visibility: 4.2,
    presence: 45,
    change: 0,
    trend: "neutral",
    color: "from-gray-500 to-slate-600"
  },
  {
    name: "DeepSeek",
    logo: "🧠",
    visibility: 3.1,
    presence: 38,
    change: 15.2,
    trend: "up",
    color: "from-indigo-500 to-purple-600"
  },
];

export function AIModelPerformance() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>AI Model Performance</CardTitle>
          <CardDescription>
            Your brand visibility across different AI language models
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          See Details
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <div
              key={model.name}
              className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${model.color} flex items-center justify-center text-white`}>
                    <span className="text-lg">{model.logo}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{model.name}</h3>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(model.trend)}
                      <span className={`text-xs ${getTrendColor(model.trend)}`}>
                        {model.change > 0 ? "+" : ""}{model.change}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Visibility</span>
                    <span className="font-medium">{model.visibility}/10</span>
                  </div>
                  <Progress value={model.visibility * 10} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Presence</span>
                    <span className="font-medium">{model.presence}%</span>
                  </div>
                  <Progress value={model.presence} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}