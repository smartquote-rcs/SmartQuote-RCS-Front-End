import { Mail, Users, Clock, Download, TrendingUp, Bell } from "lucide-react";
import { QuoteProcessingChart } from "../QuoteProcessingChart";
import { SupplierPerformanceChart } from "../SupplierPerformanceChart";
import { RecentQuotes } from "../RecentQuotes";
import { PendingApprovals } from "../PendingApprovals";
import { useTranslation } from 'react-i18next';

interface DashboardPageProps {
  onNavigateToNotifications?: () => void;
}

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

export function DashboardPage({ onNavigateToNotifications }: DashboardPageProps = {}) {
  const { t } = useTranslation();
  // Simular notificações não lidas (em um app real, viria de um contexto ou API)
  const unreadNotifications = 3;

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary mb-1 sm:mb-2">{t('admin.dashboard.title')}</h1>
            <p className="text-xs sm:text-sm lg:text-base text-dark-secondary font-medium">
              {t('admin.dashboard.subtitle')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {onNavigateToNotifications && (
              <button 
                onClick={onNavigateToNotifications}
                className="relative bg-white/10 hover:bg-blue-500/20 hover:border-blue-400/50 text-white p-3 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105 group"
                title="Ir para Notificações"
              >
                <Bell className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                {/* Badge de notificações não lidas */}
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center text-[11px] font-bold animate-pulse">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </button>
            )}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg border border-blue-500 transition-colors duration-200 flex items-center gap-2 text-xs sm:text-sm lg:text-base">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Exportar Relatório</span>
              <span className="sm:hidden">Exportar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
        {/* Top-level Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            
            return (
              <div key={metric.title} className="glass-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/25`}>
                    <Icon className={`w-5 h-5 ${metric.iconColor} transition-all duration-300`} />
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-semibold transition-all duration-300 ${
                    metric.isPositive 
                      ? 'bg-green-500/20 text-green-400 group-hover:bg-green-500/30' 
                      : 'bg-red-500/20 text-red-400 group-hover:bg-red-500/30'
                  }`}>
                    {metric.change}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 transition-colors duration-300 group-hover:text-cyan-400">{metric.value}</h3>
                  <p className="text-sm font-medium text-slate-300 mb-1">{metric.title}</p>
                  <p className="text-xs text-slate-400">{metric.period}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Alerts */}
        <div className="mb-6 lg:mb-8">
          <div className="glass-card bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 space-y-2 lg:space-y-0">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Alertas do Sistema</h3>
                <p className="text-sm text-slate-300">
                  Atualizações em tempo real do processamento e notificações
                </p>
              </div>
              <button className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-sm rounded-lg border border-slate-600/50 transition-all duration-200 self-start lg:self-auto">Ver Todos</button>
            </div>
            <div className="space-y-2">
              {systemAlerts.map((alert, index) => (
                <div key={index} className="glass-card bg-gradient-to-r from-white/5 to-white/2 rounded-lg p-3 border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      alert.type === 'success' ? 'bg-green-400' : 
                      alert.type === 'warning' ? 'bg-orange-400' : 'bg-blue-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white break-words">{alert.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                    </div>
                    {alert.type === 'warning' && (
                      <button className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs rounded-lg border border-orange-500/30 transition-all duration-200 flex-shrink-0">
                        Revisar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-6 lg:space-y-8 mb-6 lg:mb-8">
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