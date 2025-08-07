import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Heart, TrendingUp, Star, AlertCircle } from "lucide-react";

const sentimentOverTimeData = [
  { date: "Jun 17", positive: 68, neutral: 25, negative: 7 },
  { date: "Jun 18", positive: 72, neutral: 22, negative: 6 },
  { date: "Jun 19", positive: 75, neutral: 20, negative: 5 },
  { date: "Jun 20", positive: 78, neutral: 18, negative: 4 },
  { date: "Jun 21", positive: 74, neutral: 21, negative: 5 },
  { date: "Jun 22", positive: 79, neutral: 17, negative: 4 },
  { date: "Jun 23", positive: 82, neutral: 15, negative: 3 },
];

const sentimentByCategoryData = [
  { category: "Trust", score: 85 },
  { category: "Innovation", score: 92 },
  { category: "Value", score: 78 },
  { category: "Quality", score: 88 },
  { category: "Support", score: 76 },
  { category: "Reliability", score: 90 },
];

const topSentiments = [
  "Transparency",
  "Problem resolution", 
  "Innovation leadership",
  "Customer support",
  "Product quality",
  "Market expertise"
];

const lowestSentiments = [
  "Overall quality",
  "Super shoe range",
  "Pricing concerns",
  "Documentation gaps"
];

export function SentimentPage() {
  return (
    <>
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-dark-primary">Sentiment</h1>
            <p className="text-sm text-dark-secondary mt-1">Monitor brand sentiment across AI responses</p>
          </div>
          <button className="dark-button-secondary gap-2 flex items-center">
            <Heart className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-dark-bg">
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sentiment Over Time */}
          <div className="dark-card">
            <div className="pb-6">
              <h3 className="text-xl font-bold text-dark-primary mb-2">Sentiment Over Time</h3>
              <p className="text-dark-secondary font-medium">Nike brand sentiment June 17-23</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sentimentOverTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                      boxShadow: "rgba(0, 0, 0, 0.4) 0px 8px 24px",
                      color: "#FFFFFF"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="positive" 
                    stackId="1"
                    stroke="#22C55E" 
                    fill="#22C55E"
                    fillOpacity={0.8}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="neutral" 
                    stackId="1"
                    stroke="#F59E0B" 
                    fill="#F59E0B"
                    fillOpacity={0.8}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="negative" 
                    stackId="1"
                    stroke="#EF4444" 
                    fill="#EF4444"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sentiment by Category */}
          <div className="dark-card">
            <div className="pb-6">
              <h3 className="text-xl font-bold text-dark-primary mb-2">Sentiment by Category</h3>
              <p className="text-dark-secondary font-medium">Performance across different brand attributes</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={sentimentByCategoryData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fontSize: 12, fill: '#94A3B8' }}
                    className="text-xs"
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    tickCount={6}
                  />
                  <Radar
                    name="Sentiment Score"
                    dataKey="score"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3B82F6" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sentiment Tags */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Sentiments */}
          <div className="dark-card">
            <div className="pb-6">
              <h3 className="text-xl font-bold text-dark-primary mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-green-400" />
                Top Sentiments
              </h3>
              <p className="text-dark-secondary font-medium">Most positive mentions and associations</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {topSentiments.map((sentiment, index) => (
                <div 
                  key={index}
                  className="px-4 py-2 rounded-full text-sm font-medium text-white bg-green-600 hover:bg-green-500 transition-colors"
                >
                  {sentiment}
                </div>
              ))}
            </div>
          </div>

          {/* Lowest Sentiments */}
          <div className="dark-card">
            <div className="pb-6">
              <h3 className="text-xl font-bold text-dark-primary mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Lowest Sentiments
              </h3>
              <p className="text-dark-secondary font-medium">Areas needing attention and improvement</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {lowestSentiments.map((sentiment, index) => (
                <div 
                  key={index}
                  className="px-4 py-2 rounded-full text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors"
                >
                  {sentiment}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insight Panel */}
        <div className="dark-card bg-gradient-to-r from-dark-card to-dark-tag">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-dark-cta flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-primary mb-1">
                    Unlock Advanced Sentiment Analytics
                  </h3>
                  <p className="text-sm text-dark-secondary">
                    Get detailed sentiment breakdown, competitor comparisons, and actionable insights
                  </p>
                </div>
              </div>
              <button className="dark-button-primary px-8">
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}