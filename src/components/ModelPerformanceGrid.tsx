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
    trend: "up"
  },
  {
    name: "Claude", 
    logo: "🔮",
    visibility: 7.2,
    presence: 68,
    change: 5.3,
    trend: "up"
  },
  {
    name: "Gemini",
    logo: "✨", 
    visibility: 6.8,
    presence: 71,
    change: -2.1,
    trend: "down"
  },
  {
    name: "Meta AI",
    logo: "🌐",
    visibility: 5.9,
    presence: 64,
    change: 8.7,
    trend: "up"
  },
  {
    name: "Grok",
    logo: "⚡",
    visibility: 4.2,
    presence: 45,
    change: 0,
    trend: "neutral"
  },
  {
    name: "DeepSeek",
    logo: "🧠",
    visibility: 3.1,
    presence: 38,
    change: 15.2,
    trend: "up"
  },
];

export function ModelPerformanceGrid() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-dark-positive" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-dark-negative" />;
      default:
        return <Minus className="w-4 h-4 text-dark-secondary" />;
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === "up") return "text-dark-positive";
    if (trend === "down") return "text-dark-negative";
    return "text-dark-secondary";
  };

  return (
    <div className="dark-card">
      <div className="flex flex-row items-center justify-between pb-8">
        <div>
          <h3 className="text-xl font-bold text-dark-primary mb-2">Model Performance</h3>
          <p className="text-dark-secondary font-medium">
            Your brand visibility across different AI language models
          </p>
        </div>
        <button className="dark-button-secondary gap-2 flex items-center">
          View Details
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <div
              key={model.name}
              className="p-6 rounded-xl border border-dark-color hover:dark-shadow-lg transition-all duration-300 hover:-translate-y-1 bg-dark-card group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-dark-tag flex items-center justify-center dark-shadow border border-dark-color">
                    <span className="text-2xl">{model.logo}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-primary text-lg">{model.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getTrendIcon(model.trend)}
                      <span className={`text-sm font-bold ${getTrendColor(model.trend, model.change)}`}>
                        {model.change > 0 ? "+" : ""}{model.change}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-dark-secondary font-medium">Visibility</span>
                    <span className="font-bold text-dark-primary">{model.visibility}/10</span>
                  </div>
                  <div className="w-full bg-dark-tag rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${model.visibility * 10}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-dark-secondary font-medium">Presence</span>
                    <span className="font-bold text-dark-primary">{model.presence}%</span>
                  </div>
                  <div className="w-full bg-dark-tag rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${model.presence}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}