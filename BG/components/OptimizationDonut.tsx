import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertTriangle, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: 'Passing', value: 23, color: '#10B981' },
  { name: 'Warnings', value: 5, color: '#F59E0B' },
  { name: 'Critical', value: 2, color: '#EF4444' },
];

const issues = [
  { type: "Critical", count: 2, color: "text-ai8-error", bgColor: "bg-ai8-error/10", icon: XCircle },
  { type: "Warnings", count: 5, color: "text-ai8-warning", bgColor: "bg-ai8-warning/10", icon: AlertTriangle },
  { type: "Passing", count: 23, color: "text-ai8-success", bgColor: "bg-ai8-success/10", icon: CheckCircle },
];

export function OptimizationDonut() {
  const score = 74;

  return (
    <Card className="ai8-card border-0">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-bold text-ai8-navy">Site Optimization Score</CardTitle>
        <CardDescription className="text-ai8-gray font-medium">
          LLM visibility optimization status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Donut Chart */}
        <div className="relative">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "rgba(0, 0, 0, 0.08) 0px 8px 24px",
                    fontWeight: 500
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-ai8-navy mb-1">{score}%</div>
              <div className="text-sm font-medium text-ai8-gray">Overall Score</div>
            </div>
          </div>
        </div>

        {/* Issues Breakdown */}
        <div className="space-y-4">
          {issues.map((issue) => {
            const Icon = issue.icon;
            return (
              <div key={issue.type} className="flex items-center justify-between p-4 rounded-xl bg-ai8-light border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl ${issue.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${issue.color}`} />
                  </div>
                  <span className="text-sm font-semibold text-ai8-navy">{issue.type}</span>
                </div>
                <Badge className="bg-ai8-white text-ai8-navy border-gray-200 font-bold px-3 py-1">
                  {issue.count}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Priority Action */}
        <div className="pt-6 border-t border-gray-100">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-ai8-navy mb-2">Highest Priority Action</h4>
              <p className="text-sm text-ai8-gray font-medium">
                Optimize heading structure &amp; main content tags for better AI parsing
              </p>
            </div>
            <button className="ai8-button-secondary w-full gap-2 group">
              View All Actions
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}