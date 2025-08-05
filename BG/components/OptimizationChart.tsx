import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertTriangle, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export function OptimizationChart() {
  const score = 74;
  const issues = [
    { type: "Critical", count: 2, color: "text-red-600", bgColor: "bg-red-50", icon: XCircle },
    { type: "Warnings", count: 5, color: "text-yellow-600", bgColor: "bg-yellow-50", icon: AlertTriangle },
    { type: "Passing", count: 23, color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Site Optimization Score</CardTitle>
        <CardDescription>
          LLM visibility optimization status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Circular Progress */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#3b82f6"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{score}%</span>
            </div>
          </div>
        </div>

        {/* Issues Breakdown */}
        <div className="space-y-3">
          {issues.map((issue) => {
            const Icon = issue.icon;
            return (
              <div key={issue.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg ${issue.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${issue.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{issue.type}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {issue.count}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Priority Action */}
        <div className="pt-4 border-t border-gray-100">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Highest Priority Action</h4>
              <p className="text-sm text-gray-500 mt-1">
                Optimize heading structure &amp; main content tags
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              View Actions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}