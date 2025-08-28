import { Mail, Users, Clock, Download, TrendingUp, Bell, Shield, RefreshCw } from "lucide-react";
import { QuoteProcessingChart } from "../QuoteProcessingChart";
import type { Cotacao } from "../QuoteProcessingChart";
import { SupplierPerformanceChart } from "../SupplierPerformanceChart";
import { RecentQuotes } from "../RecentQuotes";
import { PendingApprovals } from "../PendingApprovals";
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { EmailStatus } from "../EmailStatus";
import { EmailNotifications } from "../EmailNotifications";

interface Metric {
  title: string;
  value: string;
  change: string;
  period: string;
  icon: any;
  iconColor: string;
  isPositive: boolean;
  isLoading?: boolean;
  isError?: boolean;
}

interface DashboardPageProps {
  onNavigateToNotifications?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToQuotes?: () => void;
  onNavigateToLoginLogs?: () => void;
  onRefreshStats?: () => void;
  dashboardStats?: {
    quotes: {
      total: number;
      approved: number;
      pending: number;
      processing: number;
      rejected: number;
    };
    suppliers: {
      total: number;
      active: number;
      inactive: number;
    };
    products: {
      total: number;
      inStock: number;
      outOfStock: number;
    };
    users: {
      total: number;
      admin: number;
      manager: number;
      user: number;
    };
  } | null;
  isLoadingStats?: boolean;
  statsError?: string | null;
}


function getRelativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hora${Math.floor(diff / 3600) > 1 ? 's' : ''} atrás`;
  return date.toLocaleString();
}

export function DashboardPage({
  onNavigateToNotifications, 
  onNavigateToSettings, 
  onNavigateToQuotes,
  onNavigateToLoginLogs,
  onRefreshStats,
  dashboardStats,
  isLoadingStats = false,
  statsError = null
}: DashboardPageProps = {}) {
  const { t } = useTranslation();
  // Simular notificações não lidas (em um app real, viria de um contexto ou API)
  const unreadNotifications = 3;

  // Estado para logs de login
  const [loginAlerts, setLoginAlerts] = useState<Array<any>>([]);

  useEffect(() => {
    // Buscar logs de login do localStorage
    let logs: any[] = [];
    try {
      const offlineLogs = JSON.parse(localStorage.getItem('offline_logs') || '[]');
      logs = offlineLogs.concat();
    } catch {}
    // Se houver endpoint de logs futuramente, buscar aqui
    // Filtrar apenas logs de login
    const loginLogs = logs.filter(l => l.type === 'login');
    // Ordenar do mais recente para o mais antigo
    loginLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    // Pegar os 3 mais recentes
    setLoginAlerts(loginLogs.slice(0, 3));
  }, []);

  // Função para gerar métricas dinâmicas
  const generateDynamicMetrics = (): Metric[] => {
    if (isLoadingStats) {
      return [
        {
          title: "Solicitações de Cotação",
          value: "...",
          change: "...",
          period: "carregando",
          icon: Mail,
          iconColor: "text-blue-400",
          isPositive: true,
          isLoading: true
        },
        {
          title: "Fornecedores Ativos",
          value: "...",
          change: "...",
          period: "carregando",
          icon: Users,
          iconColor: "text-green-400",
          isPositive: true,
          isLoading: true
        },
        {
          title: "Aprovações Pendentes",
          value: "...",
          change: "...",
          period: "carregando",
          icon: Clock,
          iconColor: "text-orange-400",
          isPositive: true,
          isLoading: true
        },
        {
          title: "Total de Produtos",
          value: "...",
          change: "...",
          period: "carregando",
          icon: TrendingUp,
          iconColor: "text-purple-400",
          isPositive: true,
          isLoading: true
        }
      ];
    }

    if (statsError) {
      return [
        {
          title: "Solicitações de Cotação",
          value: "Erro",
          change: "N/A",
          period: "erro de conexão",
          icon: Mail,
          iconColor: "text-red-400",
          isPositive: false,
          isError: true
        },
        {
          title: "Fornecedores Ativos",
          value: "Erro",
          change: "N/A",
          period: "erro de conexão",
          icon: Users,
          iconColor: "text-red-400",
          isPositive: false,
          isError: true
        },
        {
          title: "Total de Usuários",
          value: "Erro",
          change: "N/A",
          period: "erro de conexão",
          icon: Shield,
          iconColor: "text-red-400",
          isPositive: false,
          isError: true
        },
        {
          title: "Total de Produtos",
          value: "Erro",
          change: "N/A",
          period: "erro de conexão",
          icon: TrendingUp,
          iconColor: "text-red-400",
          isPositive: false,
          isError: true
        }
      ];
    }

    if (dashboardStats) {
      return [
        {
          title: "Solicitações de Cotação",
          value: dashboardStats.quotes.total.toString(),
          change: `+${dashboardStats.quotes.approved}`,
          period: "aprovadas",
          icon: Mail,
          iconColor: "text-blue-400",
          isPositive: true
        },
        {
          title: "Fornecedores Ativos",
          value: dashboardStats.suppliers.total.toString(),
          change: `${dashboardStats.suppliers.active}`,
          period: "ativos",
          icon: Users,
          iconColor: "text-green-400",
          isPositive: true
        },
        {
          title: "Total de Usuários",
          value: dashboardStats.users.total.toString(),
          change: `${dashboardStats.users.admin + dashboardStats.users.manager}`,
          period: "admin/manager",
          icon: Shield,
          iconColor: "text-purple-400",
          isPositive: true
        },
        {
          title: "Total de Produtos",
          value: dashboardStats.products.total.toString(),
          change: `${dashboardStats.products.inStock}`,
          period: "em estoque",
          icon: TrendingUp,
          iconColor: "text-purple-400",
          isPositive: true
        }
      ];
    }

    // Fallback para dados estáticos quando não há dados da API
    return [
      {
        title: "Solicitações de Cotação",
        value: "---",
        change: "---",
        period: "carregando...",
        icon: Mail,
        iconColor: "text-blue-400",
        isPositive: true
      },
      {
        title: "Fornecedores Ativos", 
        value: "---",
        change: "---",
        period: "carregando...",
        icon: Users,
        iconColor: "text-green-400",
        isPositive: true
      },
      {
        title: "Total de Usuários",
        value: "---",
        change: "---",
        period: "carregando...",
        icon: Shield,
        iconColor: "text-purple-400",
        isPositive: true
      },
      {
        title: "Total de Produtos",
        value: "---",
        change: "---",
        period: "carregando...",
        icon: TrendingUp,
        iconColor: "text-purple-400",
        isPositive: true
      }
    ];
  };

  const dynamicMetrics = generateDynamicMetrics();

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-dark-primary mb-1 truncate">{t('admin.dashboard.title')}</h1>
            <p className="text-xs sm:text-sm lg:text-base text-dark-secondary font-medium">
              {t('admin.dashboard.subtitle')}
            </p>
          </div>
          <div className="flex flex-row sm:flex-nowrap items-center gap-2 sm:gap-3 shrink-0">
            {onNavigateToNotifications && (
              <button 
                onClick={onNavigateToNotifications}
                className="relative bg-white/10 hover:bg-blue-500/20 hover:border-blue-400/50 text-white p-2 sm:p-3 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105 group"
                title="Ir para Notificações"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-blue-400 transition-colors" />
                {/* Badge de notificações não lidas */}
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-[11px] font-bold animate-pulse">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}</span>
                )}
              </button>
            )}
            {onRefreshStats && (
              <button 
                onClick={onRefreshStats}
                disabled={isLoadingStats}
                className="bg-green-600/20 hover:bg-green-600/30 disabled:bg-gray-600/20 text-green-400 disabled:text-gray-400 px-3 py-2 sm:px-4 rounded-lg border border-green-500/30 disabled:border-gray-500/30 transition-colors duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm disabled:cursor-not-allowed"
                title={isLoadingStats ? "Atualizando..." : "Atualizar Estatísticas"}
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isLoadingStats ? 'Atualizando...' : 'Atualizar'}</span>
                <span className="sm:hidden">{isLoadingStats ? '...' : 'Atualizar'}</span>
              </button>
            )}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 rounded-lg border border-blue-500 transition-colors duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Exportar Relatório</span>
              <span className="sm:hidden">Exportar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-3 sm:p-4 lg:p-6 xl:p-8 bg-dark-bg overflow-y-auto">
        {/* Top-level Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {dynamicMetrics.map((metric: Metric) => {
            const Icon = metric.icon;
            
            return (
              <div key={metric.title} className="glass-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-3 sm:p-4 border border-white/10 backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/25`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${metric.iconColor} transition-all duration-300`} />
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
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 transition-colors duration-300 group-hover:text-cyan-400">{metric.value}</h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-300 mb-1 leading-tight">{metric.title}</p>
                  <p className="text-xs text-slate-400">{metric.period}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Email Monitoring Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <EmailStatus onOpenSettings={onNavigateToSettings} />
          <EmailNotifications 
            onNavigateToQuotes={onNavigateToQuotes}
          />
        </div>

        {/* System Alerts dinâmicos com logs de login */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="glass-card bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl p-3 sm:p-4 border border-white/10 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 space-y-2 sm:space-y-0">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">Alertas do Sistema</h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Atualizações em tempo real de inicio de sessão
                </p>
              </div>
              <button
                className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-xs sm:text-sm rounded-lg border border-slate-600/50 transition-all duration-200 self-start sm:self-auto whitespace-nowrap"
                onClick={onNavigateToLoginLogs}
                type="button"
              >
                Ver Todos
              </button>
            </div>
            <div className="space-y-2">
              {loginAlerts.length === 0 && (
                <div className="text-slate-400 text-xs">Nenhum alerta de login recente.</div>
              )}
              {loginAlerts.map((log, index) => (
                <div key={index} className="glass-card bg-gradient-to-r from-white/5 to-white/2 rounded-lg p-3 border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-blue-400"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-white break-words">
                        Login realizado por <span className="font-bold">{log.userName || log.userEmail}</span>
                        {log.details?.role && (
                          <span className="ml-1 text-blue-300">({log.details.role})</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{getRelativeTime(log.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 mb-4 sm:mb-6 lg:mb-8">
          {/* Buscar cotações da API para alimentar o gráfico */}
          <DashboardCharts />
          <SupplierPerformanceChart />
        </div>
      </main>
    </div>
  );
}


// Novo componente para buscar cotações e renderizar o gráfico corretamente
import React from "react";

export function DashboardCharts() {
  const [cotacoes, setCotacoes] = React.useState<Cotacao[]>([]);
  React.useEffect(() => {
    async function fetchCotacoes() {
      try {
        const mod = await import("../../api/services");
        const response = await mod.cotacaoService.getAll();
        const cotacoesArr = Array.isArray(response.data?.data) ? response.data.data : [];
        setCotacoes(cotacoesArr.map((c: any) => ({
          status: c.status || c.situacao || '',
          dataRecebido: c.dataRecebido || c.cadastrado_em || c.data_solicitacao || '',
        })));
      } catch {
        setCotacoes([]);
      }
    }
    fetchCotacoes();
  }, []);
  return <QuoteProcessingChart cotacoes={cotacoes} />;
}