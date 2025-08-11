import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Mail, Users, CheckCircle, Clock, Download, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { QuoteProcessingChart } from "../QuoteProcessingChart";
import { SupplierPerformanceChart } from "../SupplierPerformanceChart";
import { RecentQuotes } from "../RecentQuotes";
import { PendingApprovals } from "../PendingApprovals";

const metrics = [
  {
    title: "Solicitações de Cotação",
    value: "147",
    change: "+12",
    period: "este mês",
    icon: Mail,
    iconColor: "text-blue-400",
    isPositive: true
  },
  {
    title: "Fornecedores Ativos", 
    value: "342",
    change: "+8",
    period: "este mês",
    icon: Users,
    iconColor: "text-green-400",
    isPositive: true
  },
  {
    title: "Aprovações Pendentes",
    value: "23",
    change: "-5",
    period: "vs ontem",
    icon: Clock,
    iconColor: "text-orange-400",
    isPositive: true
  },
  {
    title: "Tempo Médio Processamento",
    value: "2.4h",
    change: "-0.8h",
    period: "vs semana passada",
    icon: TrendingUp,
    iconColor: "text-purple-400",
    isPositive: true
  },
];

const systemAlerts = [
  {
    type: "success",
    message: "Processamento IA concluiu 15 cotações na última hora",
    time: "5 min atrás"
  },
  {
    type: "warning", 
    message: "Cotação #RCS-2024-0892 requer revisão manual (>€2M)",
    time: "12 min atrás"
  },
  {
    type: "info",
    message: "Nova validação de fornecedor concluída: TechFlow Solutions",
    time: "1 hora atrás"
  }
];

export function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary mb-1 sm:mb-2">Painel de Controle</h1>
            <p className="text-xs sm:text-sm lg:text-base text-dark-secondary font-medium">
              Visão geral do processamento IA de cotações e gestão de fornecedores
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="dark-tag bg-green-600 px-2 py-1 text-xs sm:text-sm">
              IA Ativa
            </div>
            <div className="dark-tag px-2 py-1 text-xs sm:text-sm">
              Fase 1
            </div>
            <button className="dark-button-primary gap-2 flex items-center text-xs sm:text-sm lg:text-base px-3 py-2">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Exportar Relatório</span>
              <span className="sm:hidden">Exportar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 lg:p-8 bg-dark-bg">
        {/* Top-level Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            
            return (
              <div key={metric.title} className="dark-card p-4 hover:dark-shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-2xl bg-dark-tag flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ${metric.iconColor}`} />
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={`text-xs sm:text-sm font-bold ${metric.isPositive ? 'text-dark-positive' : 'text-dark-negative'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-dark-primary mb-1 sm:mb-2">{metric.value}</h3>
                  <p className="text-xs sm:text-sm font-medium text-dark-secondary">{metric.title}</p>
                  <p className="text-xs text-dark-secondary mt-1">{metric.period}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Alerts */}
        <div className="mb-6 lg:mb-8">
          <div className="dark-card p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 lg:pb-6 space-y-3 lg:space-y-0">
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-dark-primary mb-1 sm:mb-2">Alertas do Sistema</h3>
                <p className="text-xs sm:text-sm lg:text-base text-dark-secondary font-medium">
                  Atualizações em tempo real do processamento e notificações
                </p>
              </div>
              <button className="dark-button-secondary text-xs sm:text-sm px-3 py-2 self-start lg:self-auto">Ver Todos</button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {systemAlerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl bg-dark-bg border border-dark-color">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    alert.type === 'success' ? 'bg-green-400' : 
                    alert.type === 'warning' ? 'bg-orange-400' : 'bg-blue-400'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-dark-primary break-words">{alert.message}</p>
                    <p className="text-xs text-dark-secondary mt-1">{alert.time}</p>
                  </div>
                  {alert.type === 'warning' && (
                    <button className="dark-button-secondary text-xs px-2 sm:px-3 py-1 flex-shrink-0">
                      Revisar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <QuoteProcessingChart />
          <SupplierPerformanceChart />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          <RecentQuotes />
          <PendingApprovals />
        </div>
      </main>
    </div>
  );
}