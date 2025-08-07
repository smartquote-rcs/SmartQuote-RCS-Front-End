import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ExternalLink, Code, BarChart3, MessageSquare } from "lucide-react";

const integrations = [
  {
    title: "API",
    description: "Build your own integrations",
    icon: Code,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600"
  },
  {
    title: "Looker Studio",
    description: "Bring scores into dashboards", 
    icon: BarChart3,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-600"
  },
  {
    title: "Request",
    description: "Submit integration request",
    icon: MessageSquare,
    color: "from-purple-500 to-purple-600", 
    bgColor: "bg-purple-50",
    textColor: "text-purple-600"
  }
];

export function IntegrationsPage() {
  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
            <p className="text-sm text-gray-500 mt-1">Connect AI8 Digital with your existing tools</p>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card 
                key={integration.title}
                className="rounded-xl border-0 shadow-sm bg-white hover:shadow-lg transition-all duration-200 group cursor-pointer"
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${integration.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="mb-3">{integration.title}</CardTitle>
                  <CardDescription className="mb-6">
                    {integration.description}
                  </CardDescription>
                  <Button variant="outline" className="w-full gap-2 group-hover:bg-gray-50">
                    Learn More
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-12 max-w-4xl">
          <Card className="rounded-xl border-0 shadow-sm bg-gradient-to-r from-mint-50 to-mint-100">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-mint-900 mb-4">
                  Need a Custom Integration?
                </h3>
                <p className="text-mint-700 mb-6">
                  Our team can help you build custom integrations to fit your specific workflow needs.
                </p>
                <Button className="bg-mint-600 hover:bg-mint-700">
                  Contact Our Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}