import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { Progress } from "../ui/progress";
import { Plus, Search, Filter, MoreVertical, Play, Pause } from "lucide-react";
import { Input } from "../ui/input";

const promptsData = [
  {
    id: 1,
    text: "What are the best project management tools for remote teams in 2024?",
    status: true,
    visibility: 94,
    presence: 82,
    runCount: 1247,
    lastRun: "2 hours ago"
  },
  {
    id: 2,
    text: "How to implement AI chatbots for customer service automation?",
    status: true,
    visibility: 89,
    presence: 76,
    runCount: 892,
    lastRun: "4 hours ago"
  },
  {
    id: 3,
    text: "Best practices for digital marketing automation in 2024",
    status: false,
    visibility: 85,
    presence: 71,
    runCount: 756,
    lastRun: "1 day ago"
  },
  {
    id: 4,
    text: "Software development lifecycle management tools comparison",
    status: true,
    visibility: 82,
    presence: 68,
    runCount: 634,
    lastRun: "6 hours ago"
  },
  {
    id: 5,
    text: "Cloud infrastructure security best practices and tools",
    status: true,
    visibility: 78,
    presence: 64,
    runCount: 523,
    lastRun: "3 hours ago"
  },
  {
    id: 6,
    text: "Enterprise data analytics platforms for business intelligence",
    status: false,
    visibility: 74,
    presence: 59,
    runCount: 445,
    lastRun: "2 days ago"
  },
  {
    id: 7,
    text: "Mobile app development frameworks comparison 2024",
    status: true,
    visibility: 71,
    presence: 56,
    runCount: 387,
    lastRun: "8 hours ago"
  },
];

export function PromptsPage() {
  const [selectedPrompts, setSelectedPrompts] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectAll = () => {
    if (selectedPrompts.length === promptsData.length) {
      setSelectedPrompts([]);
    } else {
      setSelectedPrompts(promptsData.map(p => p.id));
    }
  };

  const handleSelectPrompt = (id: number) => {
    setSelectedPrompts(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const filteredPrompts = promptsData.filter(prompt =>
    prompt.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Prompts</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and monitor your AI prompt performance</p>
          </div>
          <Button size="sm" className="gap-2 bg-mint-600 hover:bg-mint-700">
            <Plus className="w-4 h-4" />
            Add New Prompt
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8">
        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
          {selectedPrompts.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{selectedPrompts.length} selected</Badge>
              <Button variant="outline" size="sm">Bulk Enable</Button>
              <Button variant="outline" size="sm">Bulk Disable</Button>
            </div>
          )}
        </div>

        <Card className="rounded-xl border-0 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Prompts</CardTitle>
                <CardDescription>
                  Monitor performance and manage your prompt portfolio
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-medium">
                {filteredPrompts.length} prompts
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPrompts.length === promptsData.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">Prompt Text</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-20">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-32">Visibility</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-24">Presence %</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-24">Run Count</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-28">Last Run</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrompts.map((prompt) => (
                    <TableRow 
                      key={prompt.id}
                      className="border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedPrompts.includes(prompt.id)}
                          onCheckedChange={() => handleSelectPrompt(prompt.id)}
                        />
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm font-medium text-gray-900 leading-relaxed">
                          {prompt.text}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={prompt.status}
                            size="sm"
                          />
                          {prompt.status ? (
                            <Play className="w-4 h-4 text-green-600" />
                          ) : (
                            <Pause className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Score</span>
                            <span className="font-medium">{prompt.visibility}/100</span>
                          </div>
                          <Progress value={prompt.visibility} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">
                          {prompt.presence}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium">
                          {prompt.runCount.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {prompt.lastRun}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}