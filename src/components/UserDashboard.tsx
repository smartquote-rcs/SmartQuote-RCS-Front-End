import { useState, useEffect } from "react";
import { useCurrency } from "../hooks/useCurrency";
import { processImageUrl, handleImageError } from "../utils/imageProxy";
import { API_BASE_URL } from "../api/client";
import { 
  Search, 
  ShoppingCart, 
  Eye, 
  FileText,
  User,
  LogOut,
  Menu,
  X,
  BarChart3,
  Bell,
  Settings,
  MessageSquare,
  Star,
  Package,
  Calendar,
  CreditCard,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Send,
  Heart,
  Check
} from "lucide-react";
import { ProductSearchPage } from "./pages/ProductSearchPage";
import { UserSettingsPage } from "./pages/UserSettingsPage";
import { Badge } from "./ui/badge";
import { useApp } from "../contexts/AppContext";
import { useTranslation } from 'react-i18next';
import { buscaGeralService } from "../services/buscaGeralService";
import { jobService } from "../api/services";

interface User {
  email: string;
  name: string;
  role: string;
}

interface UserDashboardProps {
  user: User | null;
  onLogout: () => void;
}

const mainNavItems = [
  {
    icon: BarChart3,
    label: "navigation.dashboard",
    key: "dashboard",
    active: true,
  },
  {
    icon: Search,
    label: "navigation.productSearch",
    key: "product-search",
  },
  {
    icon: ShoppingCart,
    label: "navigation.myQuotes",
    key: "my-quotes",
  },
  {
    icon: Package,
    label: "navigation.newQuote",
    key: "orders",
  },
];

const accountItems = [
  { icon: FileText, label: "navigation.history", key: "history" },
  { icon: Star, label: "navigation.favorites", key: "favorites" },
  { icon: CreditCard, label: "navigation.payments", key: "payments" },
  { icon: Calendar, label: "navigation.appointments", key: "appointments" },
];

const supportItems = [
  { icon: MessageSquare, label: "navigation.support", key: "support" },
  { icon: Bell, label: "navigation.notifications", key: "notifications" },
  { icon: Settings, label: "navigation.settings", key: "settings" },
];

export function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const { t, i18n } = useTranslation();
  const { systemName } = useApp();
  const { formatCurrency } = useCurrency();
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newQuotePrompt, setNewQuotePrompt] = useState("");
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [activeProcessesCount, setActiveProcessesCount] = useState(0);
  // Histórico de cotações criadas
  const [quoteHistory, setQuoteHistory] = useState<Array<{
    id: string;
    message: string;
    timestamp: string;
    quote: any;
  }>>([]);
  
  // Carregar histórico do localStorage ao montar o componente
  useEffect(() => {
    const savedHistory = localStorage.getItem('userQuoteHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setQuoteHistory(parsed);
        }
      } catch (error) {
        console.error('Erro ao carregar histórico do localStorage:', error);
      }
    }
  }, []);

  // Salvar histórico no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('userQuoteHistory', JSON.stringify(quoteHistory));
  }, [quoteHistory]);

  const [quoteMessage, setQuoteMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    quoteId?: string;
  } | null>(null);
  // Estado de paginação para favoritos
  const [favoritesCurrentPage, setFavoritesCurrentPage] = useState(1);
  const favoritesItemsPerPage = 15;
  // Forçar atualização ao trocar idioma
  const [, setForceUpdate] = useState(0);

  // Ouvir mudanças de idioma
  useEffect(() => {
    const handleLanguageChange = () => {
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    
    // Também ouvir mudanças do próprio i18n
    const handleI18nChange = () => {
      setForceUpdate(prev => prev + 1);
    };
    
    i18n.on('languageChanged', handleI18nChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      i18n.off('languageChanged', handleI18nChange);
    };
  }, [i18n]);
  
  // Usar o contexto da aplicação
  const { 
    favorites, 
    toggleFavorite, 
    getFavoriteProducts, 
    notifications, 
    unreadCount, 
    markAsRead,
    markAllAsRead,
    quotes: myQuotes,
    addQuote
  } = useApp();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-orange-600 text-white text-xs">{t('status.pending')}</Badge>;
      case "approved":
        return <Badge className="bg-green-600 text-white text-xs">{t('status.approved')}</Badge>;
      case "processing":
        return <Badge className="bg-blue-600 text-white text-xs">{t('status.processing')}</Badge>;
      case "rejected":
        return <Badge className="bg-red-600 text-white text-xs">{t('status.rejected')}</Badge>;
      default:
        return <Badge className="text-xs">{status}</Badge>;
    }
  };

  // Função para carregar e contar processos ativos
  const loadActiveProcesses = async () => {
    try {
      const response = await jobService.getActiveJobs();
      if (response.success && response.data) {
        setActiveProcessesCount(response.data.length);
      }
    } catch (error) {
      console.error('Erro ao carregar processos ativos:', error);
      setActiveProcessesCount(0);
    }
  };

  // Carregar processos ativos ao montar o componente e a cada 30 segundos
  useEffect(() => {
    loadActiveProcesses();
    const interval = setInterval(loadActiveProcesses, 30000); // Atualizar a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const renderNavItem = (item: any, isActive: boolean) => {
    const Icon = item.icon;
    const showNotification = item.key === 'my-quotes' && activeProcessesCount > 0;
    
    return (
      <button
        key={item.key}
        onClick={() => {
          setActivePage(item.key);
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center justify-between space-x-3 p-3 rounded-md w-full text-left transition-all duration-300 ${
          isActive 
            ? "bg-white/10 backdrop-blur-md border border-blue-400 text-blue-400" 
            : "hover:bg-white/5 hover:backdrop-blur-md border border-transparent hover:border-blue-400/30 text-dark-secondary hover:text-blue-300"
        }`}
      >
        <div className="flex items-center space-x-3">
          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-400" : "text-dark-secondary"}`} />
          <span className={`text-xs sm:text-sm truncate ${isActive ? "text-blue-400" : "text-dark-secondary"}`}>{t(item.label)}</span>
        </div>
        {showNotification && (
          <div className="flex items-center space-x-1">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
              {activeProcessesCount}
            </span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </button>
    );
  };

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <div className="flex flex-col h-full">
            <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">
                    {t('dashboard.title')} - Debug: {t('test')}
                  </h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">{t('dashboard.subtitle')}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setActivePage("notifications")}
                    className="relative bg-white/10 hover:bg-blue-500/20 hover:border-blue-400/50 text-white p-3 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105 group"
                    title="Ir para Notificações"
                  >
                    <Bell className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                    {/* Badge de notificações não lidas */}
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center text-[11px] font-bold animate-pulse">
                      3
                    </span>
                  </button>
                </div>
              </div>
            </header>
            
            <main className="flex-1 dashboard-main p-3 sm:p-4 lg:p-8 bg-dark-bg">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 lg:mb-6">
                {/* Minhas Cotações */}
                <div className="glass-card p-4 sm:p-6 bg-blue-500/10 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group cursor-pointer" onClick={() => setActivePage("my-quotes")}>
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-blue-400">{myQuotes.length}</h3>
                      <p className="text-xs sm:text-sm text-blue-300 truncate">{t('dashboard.activeQuotes')}</p>
                    </div>
                  </div>
                </div>

                {/* Produtos Favoritos */}
                <div className="glass-card p-4 sm:p-6 bg-yellow-500/10 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 group cursor-pointer" onClick={() => setActivePage("favorites")}>
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-yellow-400">{favorites.length}</h3>
                      <p className="text-xs sm:text-sm text-yellow-300 truncate">{t('navigation.favorites')}</p>
                    </div>
                  </div>
                </div>

                {/* Notificações */}
                <div className="glass-card p-4 sm:p-6 bg-green-500/10 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group cursor-pointer sm:col-span-2 xl:col-span-1" onClick={() => setActivePage("notifications")}>
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                      <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-green-400">{unreadCount}</h3>
                      <p className="text-xs sm:text-sm text-green-300 truncate">{t('navigation.notifications')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cotações Recentes */}
              <div className="glass-card p-4 sm:p-6 bg-white/5 rounded-xl border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-white truncate min-w-0">{t('dashboard.recentQuotes')}</h2>
                  <button 
                    onClick={() => setActivePage("my-quotes")}
                    className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium transition-colors duration-300 flex-shrink-0 ml-2"
                  >
                    {t('dashboard.viewAll')}
                  </button>
                </div>
                {myQuotes.length > 0 ? (
                  <div className="space-y-3">
                    {myQuotes.slice(0, 3).map((quote) => (
                      <div key={quote.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors duration-300">
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="text-white font-medium text-sm truncate">{quote.produto}</p>
                          <p className="text-slate-400 text-xs truncate">{quote.fornecedor}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-white font-semibold text-sm whitespace-nowrap">{quote.valor}</p>
                          {getStatusBadge(quote.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-dark-secondary mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-dark-primary mb-2">{t('newQuote.noQuotesFound')}</h3>
                    <p className="text-sm text-dark-secondary mb-4">Você ainda não fez nenhuma solicitação de cotação</p>
                    <button 
                      onClick={() => setActivePage("orders")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      Criar Nova Cotação
                    </button>
                  </div>
                )}
              </div>
            </main>
          </div>
        );
      case "product-search":
        return <ProductSearchPage />;
      case "my-quotes":
        return (
          <div className="flex flex-col h-full w-full">
            <header className="bg-dark-bg border-b border-dark-color px-3 sm:px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400 flex-shrink-0" />
                    <span className="truncate">{t('quotes.title')}</span>
                  </h1>
                  <p className="text-sm sm:text-base text-dark-secondary mt-2">{t('quotes.subtitle')}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 flex-shrink-0">
                  <div className="glass-card px-4 py-2 text-center sm:text-left bg-blue-500/20 border-blue-500/30">
                    <span className="text-blue-300 font-bold text-lg">{myQuotes.length}</span>
                    <span className="text-blue-200 ml-2">cotações</span>
                  </div>
                  <button 
                    onClick={() => setActivePage("notifications")}
                    className="relative bg-white/10 hover:bg-blue-500/20 hover:border-blue-400/50 text-white p-3 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105 group"
                    title="Ir para Notificações"
                  >
                    <Bell className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center text-[11px] font-bold animate-pulse">
                      3
                    </span>
                  </button>
                  <button className="group bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border border-blue-500/30 hover:border-blue-400/50 text-blue-400 hover:text-blue-300 px-4 py-2.5 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 text-sm shadow-lg hover:shadow-xl">
                    <RefreshCw className="w-4 h-4 flex-shrink-0 transition-transform group-hover:rotate-180" />
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>
            </header>
            
            <main className="flex-1 dashboard-main p-3 sm:p-4 lg:p-8 bg-dark-bg">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 lg:mb-6">
                <div className="glass-card p-4 sm:p-6 bg-green-500/10 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-green-400">{myQuotes.filter(q => q.status === 'approved').length}</h3>
                      <p className="text-xs sm:text-sm text-dark-secondary truncate">Aprovadas</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4 sm:p-6 bg-yellow-500/10 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-600 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-yellow-400">{myQuotes.filter(q => q.status === 'pending').length}</h3>
                      <p className="text-xs sm:text-sm text-dark-secondary truncate">Pendentes</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4 sm:p-6 bg-blue-500/10 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-blue-400">{myQuotes.filter(q => q.status === 'processing').length}</h3>
                      <p className="text-xs sm:text-sm text-dark-secondary truncate">Em Processamento</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4 sm:p-6 bg-purple-500/10 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-purple-400">{myQuotes.length}</h3>
                      <p className="text-xs sm:text-sm text-dark-secondary truncate">Total</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 space-y-4 lg:space-y-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 overflow-x-auto pb-2">
                  <button className="glass-card bg-white/5 hover:bg-blue-500/20 hover:border-blue-400/50 text-white px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 text-xs sm:text-sm whitespace-nowrap">
                    <span>Todas</span>
                  </button>
                  <button className="glass-card bg-white/5 hover:bg-green-500/20 hover:border-green-400/50 text-white px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 text-xs sm:text-sm whitespace-nowrap">
                    <span>Aprovadas</span>
                  </button>
                  <button className="glass-card bg-white/5 hover:bg-yellow-500/20 hover:border-yellow-400/50 text-white px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 text-xs sm:text-sm whitespace-nowrap">
                    <span>Pendentes</span>
                  </button>
                  <button className="glass-card bg-white/5 hover:bg-blue-500/20 hover:border-blue-400/50 text-white px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 text-xs sm:text-sm whitespace-nowrap">
                    <span>Em Processamento</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <button className="glass-card p-2 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-110 group">
                    <Filter className="w-4 h-4 text-dark-secondary group-hover:text-cyan-400 transition-colors" />
                  </button>
                  <button className="glass-card p-2 rounded-lg hover:bg-green-500/20 hover:border-green-400/50 transition-all duration-300 hover:scale-110 group">
                    <Download className="w-4 h-4 text-dark-secondary group-hover:text-green-400 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Quotes List */}
              <div className="space-y-3 sm:space-y-4">
                {myQuotes.map((quote) => (
                  <div key={quote.id} className="glass-card bg-white/5 rounded-xl border border-white/20 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/25 p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                      <div className="flex-1 min-w-0 pr-0 lg:pr-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 sm:mb-3">
                          <span className="font-mono text-xs sm:text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-300">{quote.id}</span>
                          <div className="mt-1 sm:mt-0">
                            {getStatusBadge(quote.status)}
                          </div>
                        </div>
                        <h3 className="font-bold text-dark-primary mb-2 text-sm sm:text-base lg:text-lg hover:text-cyan-400 transition-colors duration-300 line-clamp-2">{quote.produto}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-dark-secondary space-y-1 sm:space-y-0">
                          <span className="flex items-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 flex-shrink-0"></span>
                            <span className="truncate">{quote.fornecedor}</span>
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                            <span className="whitespace-nowrap">{quote.data}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end space-y-3 sm:space-y-0 sm:space-x-4 flex-shrink-0">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400 text-center sm:text-right hover:text-green-300 transition-colors duration-300 whitespace-nowrap">{quote.valor}</div>
                        <div className="flex items-center space-x-2 justify-center sm:justify-end">
                          <button className="glass-card p-2 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-110 group">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-dark-secondary group-hover:text-cyan-400 transition-colors" />
                          </button>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm flex items-center space-x-2 rounded-lg transition-all duration-300 hover:scale-105 whitespace-nowrap">
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>Ver Detalhes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {myQuotes.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-dark-secondary mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">{t('newQuote.noQuotesFound')}</h3>
                  <p className="text-sm sm:text-base text-dark-secondary mb-4 px-4">Você ainda não fez nenhuma solicitação de cotação</p>
                  <button 
                    onClick={() => setActivePage("product-search")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                  >
                    Buscar Produtos
                  </button>
                </div>
              )}
            </main>
          </div>
        );
      case "orders":
        return (
          <div className="flex flex-col h-full w-full overflow-hidden">
            <header className="bg-dark-bg border-b border-dark-color px-3 sm:px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary truncate flex items-center gap-3">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    {t("navigation.newQuote")}
                  </h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">{t("dashboard.newQuoteSubtitle")}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="glass-card bg-blue-500/20 border-blue-500/30 px-4 py-2 text-center sm:text-left flex-shrink-0 rounded-lg">
                    <span className="text-blue-300 font-bold text-lg">{myQuotes.length}</span>
                    <span className="text-blue-200 ml-2">cotações ativas</span>
                  </div>
                </div>
              </div>
            </header>
            
            <main className="flex-1 flex flex-col p-3 sm:p-4 lg:p-8 bg-dark-bg overflow-hidden">
              {/* Nova Cotação com IA */}
              <div className="flex-shrink-0 mb-8">
                <div className="glass-card bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl border border-blue-500/20 p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white">{t("dashboard.createNewQuoteAI")}</h2>
                      <p className="text-xs sm:text-sm text-blue-200">{t("dashboard.createNewQuoteAIDesc")}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={newQuotePrompt}
                        onChange={(e) => setNewQuotePrompt(e.target.value)}
                        placeholder={t("newQuote.placeholder")}
                        className="w-full h-20 sm:h-24 bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 sm:p-4 text-white placeholder-slate-400 resize-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors text-xs sm:text-sm"
                        maxLength={500}
                      />
                      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs text-slate-400">
                        {newQuotePrompt.length}/500
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={async () => {
                          if (newQuotePrompt.trim()) {
                            // Validar solicitação antes de enviar
                            const validation = buscaGeralService.validarSolicitacao(newQuotePrompt);
                            if (!validation.valid) {
                              setQuoteMessage({
                                type: 'error',
                                text: validation.message || t('newQuote.invalidRequest')
                              });
                              return;
                            }

                            setIsCreatingQuote(true);
                            setQuoteMessage(null);
                            
                            try {
                              // Usar o serviço de busca geral
                              const result = await buscaGeralService.buscarGeral(newQuotePrompt);

                              if (!result.success) {
                                throw new Error(result.error || 'Erro na busca');
                              }

                              // Criar cotação com base na resposta da API
                              const newQuote = {
                                id: `RCS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
                                produto: result.data?.produto || `Produto personalizado (${newQuotePrompt.substring(0, 30)}...)`,
                                fornecedor: result.data?.fornecedor || "IA SmartQuote",
                                valor: result.data?.valor || formatCurrency(Math.random() * 5000 + 100),
                                status: "pending" as const,
                                data: new Date().toLocaleDateString('pt-PT'),
                                submittedAt: new Date().toLocaleString('pt-PT'),
                                cliente: user?.name || "Cliente",
                                quantidade: result.data?.quantidade || "1 unidade",
                                prioridade: result.data?.prioridade || "medium",
                                dataRecebido: new Date().toISOString().split('T')[0],
                                prazoResposta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                responsavel: "Sistema IA",
                                descricao: result.data?.descricao || newQuotePrompt,
                                observacoes: result.data?.observacoes || '',
                                categoria: result.data?.categoria || '',
                                especificacoes: result.data?.especificacoes || '',
                                prazoEntrega: result.data?.prazoEntrega || ''
                              };
                              
                              addQuote(newQuote);
                              
                              // Adicionar ao histórico
                              const historyEntry = {
                                id: newQuote.id,
                                message: `Cotação ${newQuote.produto} criada com sucesso`,
                                timestamp: new Date().toLocaleString('pt-PT'),
                                quote: newQuote
                              };
                              setQuoteHistory(prev => [historyEntry, ...prev]);
                              
                              setQuoteMessage({
                                type: 'success',
                                text: t('newQuote.quotationCreated'),
                                quoteId: newQuote.id
                              });
                              setIsCreatingQuote(false);
                              setNewQuotePrompt("");
                              
                              // Remover a mensagem após 5 segundos
                              setTimeout(() => {
                                setQuoteMessage(null);
                              }, 5000);
                              
                            } catch (error: any) {
                              console.error('❌ Erro ao fazer busca:', error);
                              setQuoteMessage({
                                type: 'error',
                                text: error.message || t('newQuote.processError')
                              });
                              setIsCreatingQuote(false);
                            }
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
                    </div>
                    
                    {isCreatingQuote && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-blue-300 text-xs sm:text-sm">{t('newQuote.aiAnalyzing')}</span>
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {quoteMessage.type === 'success' ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <X className="w-4 h-4 text-red-400" />
                            )}
                            <span className="text-xs sm:text-sm font-medium">{quoteMessage.text}</span>
                          </div>
                          {quoteMessage.type === 'success' && quoteMessage.quoteId && (
                            <button
                              onClick={() => setActivePage("quotes")}
                              className="bg-green-600/50 hover:bg-green-700/50 border border-green-600/50 text-green-300 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-300 flex items-center space-x-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{t('newQuote.details')}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cotação Criada */}
                    {/* Apenas mensagem de sucesso/erro aqui */}
                  </div>
                </div>
              </div>

              {/* Lista de Cotações Existentes - Histórico Real */}
              <div className="flex-1 flex flex-col justify-center items-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-dark-secondary mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-dark-primary mb-3">Nenhuma cotação encontrada</h3>
                  <p className="text-base text-dark-secondary mb-6 px-4 max-w-md">Você ainda não criou nenhuma solicitação de cotação. Use o formulário acima para criar sua primeira cotação.</p>
                  <button 
                    onClick={() => setActivePage("product-search")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 font-medium"
                  >
                    Explorar Produtos
                  </button>
                </div>
              </div>
            </main>
          </div>
        );
      case "favorites":
        const favoriteProducts = getFavoriteProducts();
        
        // Calcular paginação para favoritos
        const totalFavoritesPages = Math.max(1, Math.ceil(favoriteProducts.length / favoritesItemsPerPage));
        const paginatedFavorites = favoriteProducts.slice(
          (favoritesCurrentPage - 1) * favoritesItemsPerPage,
          favoritesCurrentPage * favoritesItemsPerPage
        );
        
        return (
          <div className="flex flex-col h-full w-full">
            <header className="bg-dark-bg border-b border-dark-color px-3 sm:px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary truncate flex items-center gap-3">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                    Produtos Favoritos
                  </h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">Seus produtos salvos para consulta rápida</p>
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
                  <div className="glass-card bg-yellow-500/20 border-yellow-500/30 px-4 py-2 text-center sm:text-left flex-shrink-0 rounded-lg">
                    <span className="text-yellow-300 font-bold text-lg">{favoriteProducts.length}</span>
                    <span className="text-yellow-200 ml-2">favoritos</span>
                  </div>
                </div>
              </div>
            </header>
            
            <main className="flex-1 dashboard-main p-3 sm:p-4 lg:p-8 bg-dark-bg overflow-y-auto">
              {favoriteProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6 mb-6">
                    {paginatedFavorites.map((produto) => (
                      <div key={produto.id} className="glass-card p-3 sm:p-4 bg-white/5 rounded-xl border border-white/20 hover:border-yellow-400/50 transition-all duration-300 group flex flex-col h-full">
                        <div className="relative w-full h-32 sm:h-36 bg-gray-800 rounded-lg overflow-hidden mb-3 group-hover:scale-[1.02] transition-all duration-300 flex-shrink-0">
                          <img 
                            src={processImageUrl(produto.image_url, 300, 300)} 
                            alt={produto.nome}
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                          />
                          {/* Desconto e Popular removidos pois não existem no tipo Product */}
                          <button
                            onClick={() => produto.id && toggleFavorite(String(produto.id))}
                            className="absolute bottom-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                            title="Remover dos favoritos"
                          >
                            <Heart className="w-3 h-3 text-white fill-current" />
                          </button>
                        </div>

                        <div className="flex-1 flex flex-col">
                          <div className="mb-3 flex-grow">
                            <h3 className="font-bold text-dark-primary hover:text-yellow-400 transition-colors duration-300 text-sm leading-tight line-clamp-2 mb-2">
                              {produto.nome}
                            </h3>
                            <p className="text-xs text-dark-secondary line-clamp-2">
                              {produto.descricao}
                            </p>
                          </div>

                          <div className="mt-auto">
                            <div className="flex items-center justify-center mb-3">
                              <span className="text-base font-bold text-green-400">{typeof produto.preco === 'number' ? formatCurrency(produto.preco) : produto.preco}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1.5 w-full">
                              <button 
                                onClick={() => setActivePage("product-search")}
                                className="glass-card p-1.5 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-110 group flex-shrink-0"
                                title="Ver detalhes"
                              >
                                <Eye className="w-3.5 h-3.5 text-dark-secondary group-hover:text-cyan-400 transition-colors" />
                              </button>
                              <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 text-xs flex items-center justify-center space-x-1 rounded-lg transition-all duration-300 flex-1">
                                <ShoppingCart className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">Cotação</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Paginação para favoritos */}
                  {totalFavoritesPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 mt-6 mb-4">
                      <button
                        onClick={() => setFavoritesCurrentPage(Math.max(1, favoritesCurrentPage - 1))}
                        disabled={favoritesCurrentPage === 1}
                        className="px-3 py-2 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Anterior
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalFavoritesPages }, (_, i) => i + 1)
                          .filter(page => 
                            page === 1 || 
                            page === totalFavoritesPages || 
                            Math.abs(page - favoritesCurrentPage) <= 1
                          )
                          .map((page, index, array) => (
                            <div key={page} className="flex items-center">
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="text-slate-400 px-2">...</span>
                              )}
                              <button
                                onClick={() => setFavoritesCurrentPage(page)}
                                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                  page === favoritesCurrentPage
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          ))}
                      </div>
                      
                      <button
                        onClick={() => setFavoritesCurrentPage(Math.min(totalFavoritesPages, favoritesCurrentPage + 1))}
                        disabled={favoritesCurrentPage === totalFavoritesPages}
                        className="px-3 py-2 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Próxima
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 lg:py-12">
                  <Star className="w-10 h-10 sm:w-12 sm:h-12 text-dark-secondary mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">Nenhum produto favorito</h3>
                  <p className="text-sm sm:text-base text-dark-secondary px-4 mb-4">Explore nossos produtos e marque seus favoritos</p>
                  <button 
                    onClick={() => setActivePage("product-search")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                  >
                    Explorar Produtos
                  </button>
                </div>
              )}
            </main>
          </div>
        );
      case "payments":
        return (
          <div className="flex flex-col h-full">
            <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">Pagamentos</h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">Histórico de pagamentos e faturas</p>
                </div>
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
              </div>
            </header>
            
            <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
              <div className="text-center py-8 lg:py-12">
                <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-dark-secondary mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">Histórico de Pagamentos</h3>
                <p className="text-sm sm:text-base text-dark-secondary px-4">Visualize faturas e comprovantes</p>
              </div>
            </main>
          </div>
        );
      case "appointments":
        return (
          <div className="flex flex-col h-full">
            <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">Agendamentos</h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">Consultas e reuniões agendadas</p>
                </div>
              </div>
            </header>
            
            <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
              <div className="text-center py-8 lg:py-12">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-dark-secondary mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">Agendamentos</h3>
                <p className="text-sm sm:text-base text-dark-secondary px-4">Gerencie suas consultas e reuniões</p>
              </div>
            </main>
          </div>
        );
      case "support":
        return (
          <div className="flex flex-col h-full">
            <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">Suporte</h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">Central de ajuda e atendimento</p>
                </div>
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
              </div>
            </header>
            
            <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
              <div className="text-center py-8 lg:py-12">
                <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-dark-secondary mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">Suporte ao Cliente</h3>
                <p className="text-sm sm:text-base text-dark-secondary px-4">Entre em contato conosco para ajuda</p>
              </div>
            </main>
          </div>
        );
      case "notifications":
        return (
          <div className="flex flex-col h-full">
            <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary flex items-center gap-3">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    Notificações
                  </h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">Suas mensagens e alertas</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="glass-card bg-red-500/20 border-red-500/30 px-4 py-2 text-center sm:text-left flex-shrink-0 rounded-lg">
                    <span className="text-red-300 font-bold text-lg">{unreadCount}</span>
                    <span className="text-red-200 ml-2">novas</span>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAllAsRead()}
                      className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium transition-colors duration-300"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>
              </div>
            </header>
            
            <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`glass-card p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                        notification.lida 
                          ? "bg-white/5 border-white/20" 
                          : "bg-blue-500/10 border-blue-500/30"
                      } ${notification.urgente ? "ring-2 ring-red-400/50" : ""}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.tipo === 'quote' ? 'bg-green-500/20' :
                          notification.tipo === 'system' ? 'bg-blue-500/20' :
                          notification.tipo === 'supplier' ? 'bg-purple-500/20' :
                          'bg-orange-500/20'
                        }`}>
                          {notification.tipo === 'quote' && <ShoppingCart className="w-5 h-5 text-green-400" />}
                          {notification.tipo === 'system' && <Settings className="w-5 h-5 text-blue-400" />}
                          {notification.tipo === 'supplier' && <Package className="w-5 h-5 text-purple-400" />}
                          {notification.tipo === 'payment' && <CreditCard className="w-5 h-5 text-orange-400" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-medium ${notification.lida ? 'text-dark-primary' : 'text-white'} truncate`}>
                              {notification.titulo}
                            </h3>
                            {!notification.lida && (
                              <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                            )}
                            {notification.urgente && (
                              <Badge className="bg-red-600 text-white text-xs">Urgente</Badge>
                            )}
                          </div>
                          <p className={`text-sm ${notification.lida ? 'text-dark-secondary' : 'text-blue-200'} mb-2 line-clamp-2`}>
                            {notification.mensagem}
                          </p>
                          <p className="text-xs text-dark-secondary">
                            {notification.data}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 lg:py-12">
                  <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-dark-secondary mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">Nenhuma notificação</h3>
                  <p className="text-sm sm:text-base text-dark-secondary px-4">Você está em dia com suas notificações</p>
                </div>
              )}
            </main>
          </div>
        );
      case "settings":
        return <UserSettingsPage />;
      case "history":
        return (
          <div className="flex flex-col h-full">
            <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">Histórico de Cotações</h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">Visualize todas as suas cotações anteriores</p>
                </div>
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
              </div>
            </header>
            
            <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
              <div className="text-center py-8 lg:py-12">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-dark-secondary mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">Histórico de Cotações</h3>
                <p className="text-sm sm:text-base text-dark-secondary px-4">Visualize todas as suas cotações anteriores</p>
              </div>
            </main>
          </div>
        );
      default:
        return <ProductSearchPage />;
    }
  };

  return (
    <div className="flex h-screen w-full max-w-full bg-dark-bg overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative z-50 lg:z-auto
        w-56 sm:w-64 h-full bg-dark-bg border-r border-dark-color 
        flex flex-col transition-transform duration-300 ease-in-out
        max-w-full
      `}>
        {/* Logo */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-dark-color flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActivePage('dashboard')}
              className="flex items-center space-x-2 sm:space-x-3 min-w-0 hover:opacity-80 transition-opacity duration-200 group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden flex-shrink-0 p-1 group-hover:scale-105 transition-transform duration-200">
                <img src="/RCS.png" alt="RCS Logo" className="w-full h-full object-contain relative z-10" />
              </div>
               
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-dark-primary truncate group-hover:text-blue-400 transition-colors duration-200">
                  {systemName || 'SMARTQUOTE'}
                </h1>
                <p className="text-xs text-dark-secondary font-medium truncate">
                  Portal do Cliente
                </p>
              </div>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-hover text-dark-secondary flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 lg:p-4 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-dark-secondary uppercase tracking-wider px-3 py-2">
              Principal
            </h3>
            {mainNavItems.map((item) => renderNavItem(item, activePage === item.key))}
          </div>

          {/* Account Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-dark-secondary uppercase tracking-wider px-3 py-2">
              Conta
            </h3>
            {accountItems.map((item) => renderNavItem(item, activePage === item.key))}
          </div>

          {/* Support Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-dark-secondary uppercase tracking-wider px-3 py-2">
              Suporte
            </h3>
            {supportItems.map((item) => renderNavItem(item, activePage === item.key))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-3 sm:p-4 lg:p-4 border-t border-dark-color space-y-3 sm:space-y-4 flex-shrink-0">
          <div className="glass-card p-3 hover:border-cyan-400/50 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-110">
                <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-dark-primary truncate transition-colors duration-300 hover:text-cyan-400">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-dark-secondary truncate">
                  Cliente
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-dark-bg border-b border-dark-color p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-dark-hover text-dark-secondary touch-manipulation"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => setActivePage('dashboard')}
            className="flex items-center space-x-2 min-w-0 hover:opacity-80 transition-opacity duration-200 group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-lg flex items-center justify-center p-1 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
              <img src="/RCS.png" alt="RCS Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-dark-primary text-sm sm:text-base truncate group-hover:text-blue-400 transition-colors duration-200">{systemName || 'SMARTQUOTE'}</span>
          </button>
          <div className="w-9 sm:w-10 flex-shrink-0"></div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden w-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}