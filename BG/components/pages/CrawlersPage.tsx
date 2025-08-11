import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Bot, Activity, Globe, Clock, TrendingUp } from "lucide-react";

const crawlActivityData = [
  { date: "Jan 17", Bytespider: 145, ClaudeBot: 89, GPTBot: 234, Other: 67 },
  { date: "Jan 18", Bytespider: 167, ClaudeBot: 123, GPTBot: 289, Other: 78 },
  { date: "Jan 19", Bytespider: 134, ClaudeBot: 98, GPTBot: 256, Other: 56 },
  { date: "Jan 20", Bytespider: 189, ClaudeBot: 145, GPTBot: 312, Other: 89 },
  { date: "Jan 21", Bytespider: 156, ClaudeBot: 134, GPTBot: 287, Other: 72 },
  { date: "Jan 22", Bytespider: 178, ClaudeBot: 167, GPTBot: 345, Other: 94 },
  { date: "Jan 23", Bytespider: 198, ClaudeBot: 189, GPTBot: 378, Other: 102 },
];

const mostCrawledPages = [
  { page: "/products/analytics-platform", crawls: 1247 },
  { page: "/solutions/enterprise", crawls: 892 },
  { page: "/blog/ai-analytics-guide", crawls: 756 },
  { page: "/pricing", crawls: 634 },
  { page: "/about", crawls: 523 },
  { page: "/docs/api-reference", crawls: 445 },
];

const recentCrawls = [
  { crawler: "GPTBot", path: "/products/analytics-platform", timestamp: "2 minutes ago" },
  { crawler: "ClaudeBot", path: "/blog/latest-features", timestamp: "5 minutes ago" },
  { crawler: "Bytespider", path: "/solutions/enterprise", timestamp: "8 minutes ago" },
  { crawler: "GPTBot", path: "/pricing", timestamp: "12 minutes ago" },
  { crawler: "ClaudeBot", path: "/docs/getting-started", timestamp: "15 minutes ago" },
  { crawler: "GoogleOther", path: "/about", timestamp: "18 minutes ago" },
];

const getCrawlerColor = (crawler: string) => {
  switch (crawler) {
    case "GPTBot": return "bg-green-100 text-green-700";
    case "ClaudeBot": return "bg-purple-100 text-purple-700";
    case "Bytespider": return "bg-blue-100 text-blue-700";
    case "GoogleOther": return "bg-orange-100 text-orange-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

export function CrawlersPage() {
  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Crawlers</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor AI bot activity on your site</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Activity className="w-4 h-4" />
            Real-time Monitor
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8">
        {/* Crawl Activity Chart */}
        <Card className="rounded-xl border-0 shadow-sm bg-white mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              Crawl Activity Over Time
            </CardTitle>
            <CardDescription>
              AI bot activity on your site over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crawlActivityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="GPTBot" stackId="a" fill="#10b981" name="GPTBot" />
                  <Bar dataKey="ClaudeBot" stackId="a" fill="#8b5cf6" name="ClaudeBot" />
                  <Bar dataKey="Bytespider" stackId="a" fill="#3b82f6" name="Bytespider" />
                  <Bar dataKey="Other" stackId="a" fill="#6b7280" name="Other Bots" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Most Crawled Pages */}
          <Card className="rounded-xl border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" />
                Most Crawled Pages
              </CardTitle>
              <CardDescription>Pages with highest bot activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="font-semibold text-gray-700">Page</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Crawls</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mostCrawledPages.map((page, index) => (
                    <TableRow key={index} className="border-gray-100 hover:bg-gray-50/50">
                      <TableCell>
                        <span className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                          {page.page}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="font-medium">
                          {page.crawls.toLocaleString()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Crawls */}
          <Card className="rounded-xl border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Recent Crawls
              </CardTitle>
              <CardDescription>Latest bot activity on your site</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="font-semibold text-gray-700">Crawler</TableHead>
                    <TableHead className="font-semibold text-gray-700">Path</TableHead>
                    <TableHead className="font-semibold text-gray-700">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCrawls.map((crawl, index) => (
                    <TableRow key={index} className="border-gray-100 hover:bg-gray-50/50">
                      <TableCell>
                        <Badge className={getCrawlerColor(crawl.crawler)}>
                          {crawl.crawler}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700 truncate block max-w-xs">
                          {crawl.path}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">{crawl.timestamp}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Footer Insight */}
        <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-r from-gray-50 to-gray-100">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    See all the AI crawlers that are on your site right now
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get real-time monitoring, detailed bot analytics, and crawl pattern insights
                  </p>
                </div>
              </div>
              <Button className="bg-mint-600 hover:bg-mint-700 px-8">
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}