import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowUpRight, MessageSquare, BarChart3 } from "lucide-react";

const prompts = [
  {
    id: 1,
    text: "What are the best project management tools for remote teams?",
    score: 94,
    mentions: 1247,
    growth: "+23%",
    status: "trending"
  },
  {
    id: 2,
    text: "How to implement AI in customer service workflows?",
    score: 89,
    mentions: 892,
    growth: "+18%",
    status: "rising"
  },
  {
    id: 3,
    text: "Best practices for digital marketing automation",
    score: 85,
    mentions: 756,
    growth: "+15%",
    status: "stable"
  },
  {
    id: 4,
    text: "Software development lifecycle management tools",
    score: 82,
    mentions: 634,
    growth: "+12%",
    status: "rising"
  },
  {
    id: 5,
    text: "Cloud infrastructure security best practices",
    score: 78,
    mentions: 523,
    growth: "+8%",
    status: "stable"
  },
];

export function TopPerformingPrompts() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "trending":
        return "bg-ai8-neon/20 text-ai8-neon border-ai8-neon/30";
      case "rising":
        return "bg-ai8-success/20 text-ai8-success border-ai8-success/30";
      default:
        return "bg-ai8-gray/20 text-ai8-gray border-ai8-gray/30";
    }
  };

  return (
    <Card className="ai8-card border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-8">
        <div>
          <CardTitle className="text-xl font-bold text-ai8-navy">Top Performing Prompts</CardTitle>
          <CardDescription className="text-ai8-gray font-medium">
            Prompts driving the highest visibility and mentions
          </CardDescription>
        </div>
        <button className="ai8-button-secondary gap-2 flex items-center">
          View All
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-5">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="p-5 rounded-xl border border-gray-100 hover:ai8-shadow transition-all duration-200 bg-ai8-light/50"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 mr-4">
                <p className="text-sm font-semibold text-ai8-navy leading-relaxed">
                  {prompt.text}
                </p>
              </div>
              <Badge className={`${getStatusColor(prompt.status)} font-semibold px-3 py-1`}>
                {prompt.status}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-ai8-gray" />
                    <span className="text-sm text-ai8-gray font-medium">Score</span>
                    <span className="text-sm font-bold text-ai8-navy">{prompt.score}/100</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-ai8-gray" />
                    <span className="text-sm text-ai8-gray font-medium">Mentions</span>
                    <span className="text-sm font-bold text-ai8-navy">{prompt.mentions.toLocaleString()}</span>
                  </div>
                </div>
                <Badge className="bg-ai8-success/20 text-ai8-success border-ai8-success/30 font-bold px-3 py-1">
                  {prompt.growth}
                </Badge>
              </div>
              
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-ai8-neon to-ai8-neon/80 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${prompt.score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}