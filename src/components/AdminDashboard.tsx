import { useState, useEffect } from "react";
import {
  BarChart3,
  FileText,
  Users,
  Settings,
  Activity,
  Database,
  Search,
  LogOut,
  Menu,
  X,
  Shield,
  Bell,
  Plus,
  Send,
  RefreshCw,
  Check
} from "lucide-react";
import { Separator } from "./ui/separator";
import { DashboardPage } from "./pages/DashboardPage";
import { QuoteRequestsPage } from "./pages/QuoteRequestsPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { LogsPage } from "./pages/LogsPage";
import { ReportsPage } from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { ProductSearchPage } from "./pages/ProductSearchPage";
import UserManagementPage from "./pages/UserManagementPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { useApp } from "../contexts/AppContext";
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

interface User {
  email: string;
  name: string;
  role: string;
}

interface AdminDashboardProps {
  user: User | null;
  onLogout: () => void;
}

const mainNavItems = [
  {
    icon: BarChart3,
    label: "admin.navigation.dashboard",
    key: "dashboard",
    active: true,
  },
  {
    icon: FileText,
    label: "admin.navigation.quotes",
    key: "quotes",
  },
  {
    icon: Plus,
    label: "navigation.newQuote",
    key: "new-quote",
  },
  {
    icon: Search,
    label: "navigation.productSearch",
    key: "product-search",
  },
  { icon: Users, label: "admin.navigation.suppliers", key: "suppliers" },
];

const systemItems = [
  { icon: Activity, label: "admin.navigation.logs", key: "logs" },
  { icon: FileText, label: "admin.navigation.reports", key: "reports" },
  { icon: Bell, label: "navigation.notifications", key: "notifications" },
];

const adminItems = [
  { icon: Settings, label: "navigation.settings", key: "settings" },
  {
    icon: Database,
    label: "admin.navigation.dataManagement",
    key: "data-management",
  },
  {
    icon: Users,
    label: "admin.navigation.userManagement",
    key: "user-management",
  },
];

export function AdminDashboard({
  user,
  onLogout,
}: AdminDashboardProps) {
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newQuotePrompt, setNewQuotePrompt] = useState("");
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [lastCreatedQuote, setLastCreatedQuote] = useState<any>(null);
  const [quoteMessage, setQuoteMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  // Forçar atualização ao trocar idioma
  const [, setForceUpdate] = useState(0);

  // Ouvir mudanças de idioma
  useEffect(() => {
    const handleLanguageChange = () => setForceUpdate(f => f + 1);
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);
  
  // Usar o contexto da aplicação
  const { addQuote, quotes: allQuotes } = useApp();

  const renderNavItem = (item: any, isActive: boolean) => {
    const Icon = item.icon;
    return (
      <button
        key={item.key}
        onClick={() => {
          setActivePage(item.key);
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center space-x-2 p-2 rounded-md w-full text-left transition-all duration-300 ${
          isActive 
            ? "bg-white/10 backdrop-blur-md border border-blue-400 text-blue-400" 
            : "hover:bg-white/5 hover:backdrop-blur-md border border-transparent hover:border-blue-400/30 text-dark-secondary hover:text-blue-300"
        }`}
      >
        <Icon
          className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-400" : "text-dark-secondary"}`}
        />
        <span className={`text-xs sm:text-sm truncate ${isActive ? "text-blue-400" : "text-dark-secondary"}`}>
          {t(item.label)}
        </span>
      </button>
    );
  };

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage onNavigateToNotifications={() => setActivePage("notifications")} />;
      case "quotes":
        return <QuoteRequestsPage />;
      case "new-quote":
        return (
          <div className="flex flex-col h-full w-full">
            <header className="bg-dark-bg border-b border-dark-color px-3 sm:px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary truncate flex items-center gap-3">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    {t('newQuote.title')} - Admin
                  </h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">{t('newQuote.subtitle')} para qualquer cliente</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <button 
                      onClick={() => setActivePage("notifications")}
                      className="p-2 bg-slate-800/50 rounded-full hover:bg-slate-700/50 transition-colors"
                    >
                      <Bell className="w-5 h-5 text-slate-300" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">3</span>
                      </div>
                    </button>
                  </div>
                  <div className="dark-tag text-center sm:text-left flex-shrink-0">
                    {allQuotes.length} {t('admin.dashboard.quotesInSystem')}
                  </div>
                </div>
              </div>
            </header>
            
            <main className="flex-1 dashboard-main p-3 sm:p-4 lg:p-8 bg-dark-bg overflow-y-auto">
              {/* Nova Cotação com IA */}
              <div className="mb-8">
                <div className="glass-card bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl border border-blue-500/20 p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    </div>
                    <div>
			<h2 className="text-base sm:text-lg font-bold text-white">{t('newQuote.createWithAI')} - Admin</h2>
                      <p className="text-xs sm:text-sm text-blue-200">{t('newQuote.aiDescription')}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={newQuotePrompt}
                        onChange={(e) => setNewQuotePrompt(e.target.value)}
                        placeholder={t('newQuote.placeholder')}
                        className="w-full h-20 sm:h-24 bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 sm:p-4 text-white placeholder-slate-400 resize-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors text-xs sm:text-sm"
                        maxLength={500}
                      />
                      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs text-slate-400">
                        {newQuotePrompt.length}/500
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={() => {
                          if (newQuotePrompt.trim()) {
                            setIsCreatingQuote(true);
                            setQuoteMessage(null);
                            setLastCreatedQuote(null);
                            
                            // Simular processamento de IA
                            setTimeout(() => {
                              // Simular possível erro (5% de chance)
                              const hasError = Math.random() < 0.05;
                              
                              if (hasError) {
                                setQuoteMessage({
                                  type: 'error',
                                  text: t('newQuote.errorMessage')
                                });
                                setIsCreatingQuote(false);
                                return;
                              }
                              
                              const newQuote = {
                                id: `RCS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
                                produto: `Admin: ${newQuotePrompt.substring(0, 30)}...`,
                                fornecedor: "Admin SmartQuote",
                                valor: "€" + (Math.random() * 10000 + 500).toFixed(2),
                                status: "approved" as const,
                                data: new Date().toLocaleDateString('pt-PT'),
                                submittedAt: new Date().toLocaleString('pt-PT'),
                                cliente: "Cliente Administrativo",
                                quantidade: "1 unidade",
                                prioridade: "high",
                                dataRecebido: new Date().toISOString().split('T')[0],
                                prazoResposta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                responsavel: user?.name || "Admin"
                              };
                              
                              addQuote(newQuote);
                              setLastCreatedQuote(newQuote);
                              setQuoteMessage({
                                type: 'success',
                                text: t('newQuote.successMessage')
                              });
                              setIsCreatingQuote(false);
                              setNewQuotePrompt("");
                              
                              // Remover a mensagem após 5 segundos
                              setTimeout(() => {
                                setQuoteMessage(null);
                              }, 5000);
                            }, 3000);
                          }
                        }}
                        disabled={!newQuotePrompt.trim() || isCreatingQuote}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-300 flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        {isCreatingQuote ? (
                          <>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>{t('newQuote.creating')}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{t('newQuote.generate')}</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setNewQuotePrompt("")}
                        className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm"
                      >
                        {t('newQuote.clear')}
                      </button>
                      <button
                        onClick={() => setActivePage("quotes")}
                        className="bg-green-600/50 hover:bg-green-700/50 border border-green-600/50 text-green-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 text-xs sm:text-sm"
                      >
                        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Ver Todas</span>
                      </button>
                    </div>
                    
                    {isCreatingQuote && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-blue-300 text-xs sm:text-sm">Admin: Nossa IA está processando a cotação e conectando com fornecedores premium...</span>
                        </div>
                      </div>
                    )}

                    {/* Mensagem de Sucesso/Erro */}
                    {quoteMessage && (
                      <div className={`${
                        quoteMessage.type === 'success' 
                          ? 'bg-green-500/10 border-green-500/20 text-green-300' 
                          : 'bg-red-500/10 border-red-500/20 text-red-300'
                      } border rounded-lg p-3 sm:p-4 transition-all duration-300`}>
                        <div className="flex items-center space-x-3">
                          {quoteMessage.type === 'success' ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-xs sm:text-sm font-medium">{quoteMessage.text}</span>
                        </div>
                      </div>
                    )}

                    {/* Cotação Criada */}
                    {lastCreatedQuote && (
                      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-green-500/30 backdrop-blur-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-white font-bold text-sm mb-1">Cotação Criada</h4>
                            <p className="text-green-400 font-mono text-xs">{lastCreatedQuote.id}</p>
                          </div>
                          <div className="bg-green-500/20 px-2 py-1 rounded-md">
                            <span className="text-green-400 text-xs font-medium">Aprovada</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 block mb-1">Produto:</span>
                            <span className="text-white">{lastCreatedQuote.produto}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-1">Fornecedor:</span>
                            <span className="text-white">{lastCreatedQuote.fornecedor}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-1">Valor:</span>
                            <span className="text-green-400 font-bold">{lastCreatedQuote.valor}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-1">Data:</span>
                            <span className="text-white">{lastCreatedQuote.data}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <button
                            onClick={() => setActivePage("quotes")}
                            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Ver na Lista de Cotações</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Estatísticas Rápidas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="glass-card p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-400">{allQuotes.filter(q => q.status === 'approved').length}</h3>
                      <p className="text-xs text-dark-secondary">{t('status.approved')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-600 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-yellow-400">{allQuotes.filter(q => q.status === 'pending').length}</h3>
                      <p className="text-xs text-dark-secondary">{t('status.pending')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-400">{allQuotes.filter(q => q.status === 'processing').length}</h3>
                      <p className="text-xs text-dark-secondary">{t('status.processing')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-400">{allQuotes.length}</h3>
                      <p className="text-xs text-dark-secondary">{t('dashboard.total')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações administrativas */}
              <div className="glass-card p-4 sm:p-6 bg-white/5 rounded-xl border border-white/20">
                <h3 className="text-base sm:text-lg font-bold text-white mb-4">{t('admin.dashboard.adminTools')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setActivePage("user-management")}
                    className="glass-card p-4 bg-white/5 hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-300 text-left"
                  >
                    <Users className="w-6 h-6 text-blue-400 mb-2" />
                    <h4 className="font-medium text-white">{t('admin.navigation.userManagement')}</h4>
                    <p className="text-xs text-dark-secondary">{t('admin.dashboard.userManagementDesc')}</p>
                  </button>
                  
                  <button 
                    onClick={() => setActivePage("suppliers")}
                    className="glass-card p-4 bg-white/5 hover:bg-green-500/20 hover:border-green-400/50 transition-all duration-300 text-left"
                  >
                    <Users className="w-6 h-6 text-green-400 mb-2" />
                    <h4 className="font-medium text-white">{t('admin.navigation.suppliers')}</h4>
                    <p className="text-xs text-dark-secondary">{t('admin.dashboard.suppliersDesc')}</p>
                  </button>
                  
                  <button 
                    onClick={() => setActivePage("reports")}
                    className="glass-card p-4 bg-white/5 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-300 text-left"
                  >
                    <FileText className="w-6 h-6 text-purple-400 mb-2" />
                    <h4 className="font-medium text-white">{t('admin.navigation.reports')}</h4>
                    <p className="text-xs text-dark-secondary">{t('admin.dashboard.reportsDesc')}</p>
                  </button>
                </div>
              </div>
            </main>
          </div>
        );
      case "product-search":
        return <ProductSearchPage />;
      case "suppliers":
        return <SuppliersPage />;
      case "notifications":
        return <NotificationsPage />;
      case "logs":
        return <LogsPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      case "user-management":
        return <UserManagementPage />;
      case "data-management":
        return (
          <div className="flex flex-col h-full">
            <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
                    <Database className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
                    {t('admin.navigation.dataManagement')}
                  </h1>
                  <p className="text-sm sm:text-base text-dark-secondary mt-2">
                    {t('admin.dashboard.dataManagementDesc')}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                  <div className="glass-card px-4 py-2 text-center sm:text-left bg-purple-500/20 border-purple-500/30">
                    <span className="text-purple-300 font-bold text-lg">2.4GB</span>
                    <span className="text-purple-200 ml-2">{t('admin.dashboard.stored')}</span>
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-4 lg:p-8 bg-dark-bg">
              {/* Data Management Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <div className="glass-card bg-white/5 rounded-xl p-3 lg:p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:from-purple-500 hover:to-purple-400 hover:shadow-lg hover:shadow-purple-500/25">
                      <Database className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-primary transition-colors duration-300 hover:text-purple-400">
                        2.4GB
                      </h3>
                      <p className="text-xs text-dark-secondary truncate">
                        {t('admin.dashboard.storedData')}
                      </p>
                    </div>
                  </div>
                </div>

                                <div className="glass-card bg-white/5 rounded-xl p-3 lg:p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:from-green-500 hover:to-green-400 hover:shadow-lg hover:shadow-green-500/25">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-primary transition-colors duration-300 hover:text-green-400">
                        99.9%
                      </h3>
                      <p className="text-xs text-dark-secondary truncate">
                        Uptime
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card bg-white/5 rounded-xl p-3 lg:p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/25">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-primary transition-colors duration-300 hover:text-blue-400">
                        15,247
                      </h3>
                      <p className="text-xs text-dark-secondary truncate">
                        Registros Totais
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card bg-white/5 rounded-xl p-3 lg:p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:from-orange-500 hover:to-orange-400 hover:shadow-lg hover:shadow-orange-500/25">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-primary transition-colors duration-300 hover:text-orange-400">
                        Diário
                      </h3>
                      <p className="text-xs text-dark-secondary truncate">
                        Backup
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center py-8 lg:py-12">
                <Database className="w-10 h-10 sm:w-12 sm:h-12 text-dark-secondary mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">
                  Gestão Avançada de Dados
                </h3>
                <p className="text-sm sm:text-base text-dark-secondary px-4">
                  Ferramentas de administração e backup em
                  desenvolvimento
                </p>
              </div>
            </main>
          </div>
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div
      className="flex h-screen max-w-full bg-dark-bg overflow-hidden"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        fixed lg:relative z-50 lg:z-auto
        w-56 sm:w-64 h-full bg-dark-bg border-r border-dark-color 
        flex flex-col transition-transform duration-300 ease-in-out
      `}
      >
        {/* Logo */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-dark-color flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden flex-shrink-0 p-1">
                <img src="/RCS.png" alt="RCS Logo" className="w-full h-full object-contain relative z-10" />
              </div>
               
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-dark-primary truncate">
                  SMARTQUOTE
                </h1>
                <p className="text-xs text-dark-secondary font-medium truncate">
                  Painel Administrativo
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-hover text-dark-secondary flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 lg:p-4 space-y-4 sm:space-y-5 scrollable-content">
          {/* Main Navigation */}
          <div className="space-y-2">
            {mainNavItems.map((item) =>
              renderNavItem(item, activePage === item.key),
            )}
          </div>

          <Separator style={{ backgroundColor: "#374151" }} />

          {/* System Group */}
          <div className="space-y-2">
            <div className="px-2 sm:px-3">
              <h3 className="text-xs font-bold text-dark-primary uppercase tracking-widest">
                Sistema
              </h3>
            </div>
            <div className="space-y-2">
              {systemItems.map((item) =>
                renderNavItem(item, activePage === item.key),
              )}
            </div>
          </div>

          <Separator style={{ backgroundColor: "#374151" }} />

          {/* Admin Group */}
          <div className="space-y-2">
            <div className="px-2 sm:px-3">
              <h3 className="text-xs font-bold text-dark-Primary uppercase tracking-widest">
                Administração
              </h3>
            </div>
            <div className="space-y-1">
              {adminItems.map((item) =>
                renderNavItem(item, activePage === item.key),
              )}
            </div>
          </div>
        </nav>

        {/* System Status & User */}
        <div className="p-2 sm:p-3 lg:p-4 border-t border-dark-color space-y-2 sm:space-y-3 flex-shrink-0">
          {/* System Status */}
          <div className="glass-card p-3 lg:p-4 text-center border border-white/20 rounded-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 bg-white/5">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full status-online"></div>
              <h4 className="text-xs sm:text-sm font-bold text-dark-primary">
                Sistema Ativo
              </h4>
            </div>
            <p className="text-xs text-dark-secondary mb-3">
              IA: Online | Admin: Ativo
            </p>
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 px-3 lg:px-4 w-full flex items-center justify-center space-x-1 hover:scale-105 transition-all duration-200 rounded-lg">
              <Database className="w-3 h-3" />
              <span>Ver Status</span>
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 rounded-xl glass-card border border-white/20 transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 bg-white/5">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:from-red-500 hover:to-red-400 hover:shadow-lg hover:shadow-red-500/25">
              <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-dark-primary truncate transition-colors duration-300 hover:text-red-400">
                {user?.name || "Administrador"}
              </p>
              <p className="text-xs text-dark-secondary truncate">
                Administrador do Sistema
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-dark-hover text-dark-secondary hover:text-red-400 transition-all duration-300 flex-shrink-0 hover:scale-110 hover:shadow-lg"
              title="Sair"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-dark-bg border-b border-dark-color p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-dark-hover text-dark-secondary"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-lg flex items-center justify-center p-1">
              <img src="/RCS.png" alt="RCS Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-dark-primary text-sm sm:text-base">
              SmartQuote-RCS
            </span>
          </div>
          <div className="w-9 sm:w-10"></div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}