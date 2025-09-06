import { Mail, Users, Clock, TrendingUp, Bell, Shield, RefreshCw } from "lucide-react";
import { QuoteProcessingChart } from "../QuoteProcessingChart";
import type { Cotacao } from "../QuoteProcessingChart";
import { SupplierPerformanceChart } from "../SupplierPerformanceChart";
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { EmailStatus } from "../EmailStatus";
import { EmailNotifications } from "../EmailNotifications";
import { useTheme } from "../../hooks/useTheme";


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
  onNavigateToQuotes?: () => void;
  onNavigateToLoginLogs?: () => void;
  onNavigateToEmails?: () => void;
  onNavigateToNotifications?: () => void;
  onRefreshStats?: () => void;
  themeClasses?: any;
  isLight?: boolean;
  toggleTheme?: () => void;
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
  onNavigateToQuotes,
  onNavigateToLoginLogs,
  onNavigateToEmails,
  onNavigateToNotifications,
  onRefreshStats,
  dashboardStats,
  isLoadingStats = false,
  statsError = null,
  themeClasses,
  isLight = false,
  toggleTheme
}: DashboardPageProps = {}) {
  const { t } = useTranslation();
  const { themeClasses: hookThemeClasses, isLight: hookIsLight } = useTheme();
  
  // Use props if provided, otherwise use hook values
  const finalThemeClasses = themeClasses || hookThemeClasses;
  const finalIsLight = isLight !== undefined ? isLight : hookIsLight;
  // Buscar notificações reais e calcular não lidas
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const { notificationService } = await import("../../api/services");
        const response = await notificationService.getAll();
        if (!response.success || !response.data) throw new Error();
        const arr = Array.isArray(response.data) ? response.data : (Array.isArray(response.data.data) ? response.data.data : (response.data.notifications || []));
        // IDs lidas do localStorage
        let readIds: string[] = [];
        try {
          readIds = JSON.parse(localStorage.getItem("readNotifications") || "[]");
        } catch {}
        const mapped = arr.map((n: any) => {
          const id = n.id?.toString() ?? n._id?.toString() ?? Math.random().toString(36).slice(2);
          return {
            id,
            read: readIds.includes(id) ? true : (n.read ?? n.lida ?? false),
          };
        });
        setUnreadNotifications(mapped.filter((n: any) => !n.read).length);
      } catch {
        // não precisa setNotifications
        setUnreadNotifications(0);
      }
    }
    fetchNotifications();
  }, []);

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
          title: t('dashboard.quoteRequests'),
          value: "...",
          change: "...",
          period: t('common.loading'),
          icon: Mail,
          iconColor: "text-blue-400",
          isPositive: true,
          isLoading: true
        },
        {
          title: t('dashboard.activeSuppliers'),
          value: "...",
          change: "...",
          period: t('common.loading'),
          icon: Users,
          iconColor: "text-green-400",
          isPositive: true,
          isLoading: true
        },
        {
          title: t('dashboard.pendingApprovals'),
          value: "...",
          change: "...",
          period: t('common.loading'),
          icon: Clock,
          iconColor: "text-orange-400",
          isPositive: true,
          isLoading: true
        },
        {
          title: t('dashboard.totalProducts'),
          value: "...",
          change: "...",
          period: t('common.loading'),
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
          title: t('dashboard.quoteRequests'),
          value: t('common.error'),
          change: "N/A",
          period: t('dashboard.connectionError'),
          icon: Mail,
          iconColor: "text-red-400",
          isPositive: false,
          isError: true
        },
        {
          title: t('dashboard.activeSuppliers'),
          value: t('common.error'),
          change: "N/A",
          period: t('dashboard.connectionError'),
          icon: Users,
          iconColor: "text-red-400",
          isPositive: false,
          isError: true
        },
        {
          title: t('dashboard.totalUsers'),
          value: t('common.error'),
          change: "N/A",
          period: t('dashboard.connectionError'),
          icon: Shield,
          iconColor: "text-red-400",
          isPositive: false,
          isError: true
        },
        {
          title: t('dashboard.totalProducts'),
          value: t('common.error'),
          change: "N/A",
          period: t('dashboard.connectionError'),
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
          title: t('dashboard.quoteRequests'),
          value: dashboardStats.quotes.total.toString(),
          change: `+${dashboardStats.quotes.approved}`,
          period: t('dashboard.approved'),
          icon: Mail,
          iconColor: "text-blue-400",
          isPositive: true
        },
        {
          title: t('dashboard.activeSuppliers'),
          value: dashboardStats.suppliers.total.toString(),
          change: `${dashboardStats.suppliers.active}`,
          period: t('dashboard.active'),
          icon: Users,
          iconColor: "text-green-400",
          isPositive: true
        },
        {
          title: t('dashboard.totalUsers'),
          value: dashboardStats.users.total.toString(),
          change: `${dashboardStats.users.admin + dashboardStats.users.manager}`,
          period: t('dashboard.adminManager'),
          icon: Shield,
          iconColor: "text-purple-400",
          isPositive: true
        },
        {
          title: t('dashboard.totalProducts'),
          value: dashboardStats.products.total.toString(),
          change: `${dashboardStats.products.inStock}`,
          period: t('dashboard.inStock'),
          icon: TrendingUp,
          iconColor: "text-purple-400",
          isPositive: true
        }
      ];
    }

    // Fallback para dados estáticos quando não há dados da API
    return [
      {
        title: t('dashboard.quoteRequests'),
        value: "---",
        change: "---",
        period: t('common.loading') + "...",
        icon: Mail,
        iconColor: "text-blue-400",
        isPositive: true
      },
      {
        title: t('dashboard.activeSuppliers'), 
        value: "---",
        change: "---",
        period: t('common.loading') + "...",
        icon: Users,
        iconColor: "text-green-400",
        isPositive: true
      },
      {
        title: t('dashboard.totalUsers'),
        value: "---",
        change: "---",
        period: t('common.loading') + "...",
        icon: Shield,
        iconColor: "text-purple-400",
        isPositive: true
      },
      {
        title: t('dashboard.totalProducts'),
        value: "---",
        change: "---",
        period: t('common.loading') + "...",
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
      <header className={`${finalThemeClasses?.bg || 'bg-dark-bg'} border-b ${finalThemeClasses?.border || 'border-dark-color'} px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 flex-shrink-0`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold ${finalThemeClasses?.textPrimary || 'text-dark-primary'} mb-1 truncate`}>{t('admin.dashboard.title')}</h1>
            <p className={`text-xs sm:text-sm lg:text-base ${finalThemeClasses?.textSecondary || 'text-dark-secondary'} font-medium`}>
              {t('admin.dashboard.subtitle')}
            </p>
          </div>
          <div className="flex flex-row sm:flex-nowrap items-center gap-2 sm:gap-3 shrink-0">
            {onRefreshStats && (
              <button 
                onClick={onRefreshStats}
                disabled={isLoadingStats}
                className={`${finalIsLight 
                  ? 'bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 text-blue-600 disabled:text-gray-400 border-blue-200 disabled:border-gray-200' 
                  : 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 disabled:bg-gray-600/20 text-blue-400 disabled:text-gray-500 border-blue-500/30 disabled:border-gray-500/30'
                } px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 shadow-sm hover:shadow-md disabled:shadow-none`}
                title={isLoadingStats ? t('dashboard.updating') : t('dashboard.updateStats')}
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoadingStats ? 'animate-spin' : ''} transition-transform`} />
                <span className="hidden sm:inline font-medium">{isLoadingStats ? t('dashboard.updating') : t('dashboard.update')}</span>
                <span className="sm:hidden font-medium">{isLoadingStats ? '...' : t('dashboard.update')}</span>
              </button>
            )}
            {/* Theme Toggle Button */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className={`p-2 ${finalThemeClasses?.cardBg || 'bg-slate-800/50'} ${finalThemeClasses?.border || 'border-slate-600/50'} border rounded-lg ${finalThemeClasses?.hover || 'hover:bg-slate-700/50'} transition-colors shadow-sm`}
                title={finalIsLight ? "Alternar para modo escuro" : "Alternar para modo claro"}
              >
                {finalIsLight ? (
                  <svg className={`w-5 h-5 ${finalThemeClasses?.textSecondary || 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className={`w-5 h-5 ${finalThemeClasses?.textSecondary || 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            )}
            <div className="relative">
              <button 
                onClick={onNavigateToNotifications}
                className={`p-2 ${finalThemeClasses?.cardBg || 'bg-slate-800/50'} ${finalThemeClasses?.border || 'border-slate-600/50'} border rounded-lg ${finalThemeClasses?.hover || 'hover:bg-slate-700/50'} transition-colors shadow-sm`}
                title="Ver notificações"
              >
                <Bell className={`w-5 h-5 ${finalThemeClasses?.textSecondary || 'text-slate-300'}`} />
                {unreadNotifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={`flex-1 dashboard-main p-3 sm:p-4 lg:p-6 xl:p-8 ${finalThemeClasses?.bg || 'bg-dark-bg'} overflow-y-auto`}>
        {/* Top-level Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {dynamicMetrics.map((metric: Metric) => {
            const Icon = metric.icon;
            
            return (
              <div key={metric.title} className={`${finalThemeClasses?.glassCard || 'glass-card'} ${finalIsLight ? 'bg-white shadow-lg border-gray-200' : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10'} rounded-xl p-3 sm:p-4 border backdrop-blur-sm ${finalIsLight ? 'hover:border-blue-300 hover:shadow-xl' : 'hover:border-cyan-400/30'} transition-all duration-300 group`}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${finalIsLight ? 'bg-blue-100' : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'} flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${finalIsLight ? 'group-hover:bg-blue-200' : 'group-hover:shadow-lg group-hover:shadow-blue-500/25'}`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${metric.iconColor} transition-all duration-300`} />
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-semibold transition-all duration-300 ${
                    metric.isPositive 
                      ? `${finalIsLight ? 'bg-green-100 text-green-600' : 'bg-green-500/20 text-green-400'} ${finalIsLight ? 'group-hover:bg-green-200' : 'group-hover:bg-green-500/30'}` 
                      : `${finalIsLight ? 'bg-red-100 text-red-600' : 'bg-red-500/20 text-red-400'} ${finalIsLight ? 'group-hover:bg-red-200' : 'group-hover:bg-red-500/30'}`
                  }`}>
                    {metric.change}
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold ${finalThemeClasses?.textPrimary || 'text-white'} mb-1 transition-colors duration-300 ${finalIsLight ? 'group-hover:text-blue-600' : 'group-hover:text-cyan-400'}`}>{metric.value}</h3>
                  <p className={`text-xs sm:text-sm font-medium ${finalThemeClasses?.textSecondary || 'text-slate-300'} mb-1 leading-tight`}>{metric.title}</p>
                  <p className={`text-xs ${finalThemeClasses?.textMuted || 'text-slate-400'}`}>{metric.period}</p>
                </div>
              </div>
            );
          })}
        </div>


        {/* Email Monitoring Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <EmailStatus themeClasses={finalThemeClasses} isLight={finalIsLight} />
          <EmailNotifications 
            onNavigateToQuotes={onNavigateToQuotes}
            onNavigateToEmails={onNavigateToEmails}
            themeClasses={finalThemeClasses} 
            isLight={finalIsLight}
          />
        </div>

        {/* System Alerts dinâmicos com logs de login */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className={`${finalThemeClasses?.glassCard || 'glass-card'} ${finalIsLight ? 'bg-white shadow-lg border-gray-200' : 'bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-white/10'} rounded-xl p-3 sm:p-4 border backdrop-blur-sm`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 space-y-2 sm:space-y-0">
              <div className="min-w-0 flex-1 flex items-center gap-2">
                <h3 className={`text-base sm:text-lg font-bold ${finalThemeClasses?.textPrimary || (finalIsLight ? 'text-gray-800' : 'text-white')} mb-1 flex items-center gap-2`}>
                  Alertas do Sistema
                </h3>
                {/* Badge de status */}
                <span className={`px-2 py-1 text-xs rounded-full ${finalIsLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-400'} font-medium`}>
                  {loginAlerts.length} recentes
                </span>
              </div>
              <button
                className={`px-3 py-2 ${finalIsLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300' : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border-slate-600/50'} text-xs sm:text-sm rounded-lg border transition-all duration-200 self-start sm:self-auto whitespace-nowrap`}
                onClick={onNavigateToLoginLogs}
                type="button"
              >
                Ver Todos
              </button>
            </div>
            <div className="space-y-2">
              {loginAlerts.length === 0 && (
                <div className={`${finalIsLight ? 'text-gray-500' : 'text-slate-400'} text-xs`}>Nenhum alerta de login recente.</div>
              )}
              {loginAlerts.map((log, index) => (
                <div key={index} className={`${finalIsLight ? 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:shadow-md' : 'bg-gradient-to-r from-white/5 to-white/2 border-white/10 hover:border-cyan-400/30'} rounded-lg p-3 border transition-all duration-300`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${finalIsLight ? 'bg-blue-500' : 'bg-blue-400'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs sm:text-sm font-medium ${finalIsLight ? 'text-gray-800' : 'text-white'} break-words`}>
                        Login realizado por <span className="font-bold">{log.userName || log.userEmail}</span>
                        {log.details?.role && (
                          <span className={`ml-1 ${finalIsLight ? 'text-blue-600' : 'text-blue-300'}`}>({log.details.role})</span>
                        )}
                      </p>
                      <p className={`text-xs ${finalIsLight ? 'text-gray-500' : 'text-slate-400'} mt-1`}>{getRelativeTime(log.timestamp)}</p>
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
          <DashboardCharts themeClasses={finalThemeClasses} isLight={finalIsLight} />
          <SupplierPerformanceChart isLight={finalIsLight} />
        </div>
      </main>
    </div>
  );
}


// Novo componente para buscar cotações e renderizar o gráfico corretamente
import React from "react";

export function DashboardCharts({ themeClasses, isLight }: { themeClasses?: any; isLight?: boolean }) {
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
  return <QuoteProcessingChart cotacoes={cotacoes} themeClasses={themeClasses} isLight={isLight} />;
}