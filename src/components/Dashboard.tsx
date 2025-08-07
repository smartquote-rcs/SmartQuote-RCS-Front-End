import { useState } from "react";
import { 
  BarChart3, 
  FileText, 
  Users, 
  Settings, 
  Mail, 
  CheckCircle, 
  Activity,
  Database,
  Search,
  LogOut,
  Menu,
  X,
  UserCog,
  Puzzle,
  MessageSquare,
  Brain,
  TrendingUp,
  Zap,
  Bot,
  BookOpen,
  Heart
} from "lucide-react";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { DashboardPage } from "./pages/DashboardPage";
import { QuoteRequestsPage } from "./pages/QuoteRequestsPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { LogsPage } from "./pages/LogsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProductSearchPage } from "./pages/ProductSearchPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { IntegrationsPage } from "./pages/IntegrationsPage";
import { PromptsPage } from "./pages/PromptsPage";
import { IntelligencePage } from "./pages/IntelligencePage";
import { OptimizePage } from "./pages/OptimizePage";
import { LLMTrafficPage } from "./pages/LLMTrafficPage";
import { CrawlersPage } from "./pages/CrawlersPage";
import { CitationsPage } from "./pages/CitationsPage";
import { SentimentPage } from "./pages/SentimentPage";
import { AdminDashboard } from "./AdminDashboard";
import { ManagerDashboard } from "./ManagerDashboard";
import { UserDashboard } from "./UserDashboard";

interface User {
  email: string;
  name: string;
  role: string;
}

interface DashboardProps {
  user: User | null;
  onLogout: () => void;
}

const mainNavItems = [
  { icon: BarChart3, label: "Painel Principal", key: "dashboard", active: true },
  { icon: Mail, label: "Solicitações de Cotação", key: "quotes" },
  { icon: Search, label: "Pesquisa de Produtos", key: "product-search" },
  { icon: Users, label: "Fornecedores", key: "suppliers" },
  { icon: CheckCircle, label: "Aprovações", key: "approvals" },
];

const aiItems = [
  { icon: Brain, label: "Inteligência IA", key: "intelligence" },
  { icon: MessageSquare, label: "Gestão de Prompts", key: "prompts" },
  { icon: TrendingUp, label: "Otimização IA", key: "optimize" },
  { icon: Bot, label: "Tráfego LLM", key: "llm-traffic" },
  { icon: Heart, label: "Análise de Sentimento", key: "sentiment" },
];

const systemItems = [
  { icon: Activity, label: "Logs do Sistema", key: "logs" },
  { icon: FileText, label: "Relatórios Avançados", key: "reports" },
  { icon: Zap, label: "Crawlers Web", key: "crawlers" },
  { icon: BookOpen, label: "Gestão de Citações", key: "citations" },
];

const adminItems = [
  { icon: UserCog, label: "Gestão de Usuários", key: "user-management" },
  { icon: Puzzle, label: "Integrações API", key: "integrations" },
  { icon: Settings, label: "Configurações", key: "settings" },
];

export function Dashboard({ user, onLogout }: DashboardProps) {
  // Se o usuário é admin, renderizar AdminDashboard específico
  if (user?.email?.includes('admin@') || user?.role?.toLowerCase().includes('admin')) {
    return <AdminDashboard user={user} onLogout={onLogout} />;
  }
  
  // Se o usuário é manager, renderizar ManagerDashboard específico
  if (user?.role?.toLowerCase().includes('manager') || user?.role?.toLowerCase().includes('gestor')) {
    return <ManagerDashboard user={user} onLogout={onLogout} />;
  }
  
  // Se o usuário é usuário comum, renderizar UserDashboard específico
  if (user?.email?.includes('usuario@') || user?.role?.toLowerCase().includes('user')) {
    return <UserDashboard user={user} onLogout={onLogout} />;
  }

  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderNavItem = (item: any, isActive: boolean) => {
    const Icon = item.icon;
    return (
      <button
        key={item.key}
        onClick={() => {
          setActivePage(item.key);
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center space-x-3 p-3 rounded-md w-full text-left transition-all duration-300 ${
          isActive 
            ? "bg-white/10 backdrop-blur-md border border-blue-400 text-blue-400" 
            : "hover:bg-white/5 hover:backdrop-blur-md border border-transparent hover:border-blue-400/30 text-dark-secondary hover:text-blue-300"
        }`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-blue-400" : "text-dark-secondary"}`} />
        <span className={`text-sm lg:text-base ${isActive ? "text-blue-400" : "text-dark-secondary"}`}>{item.label}</span>
      </button>
    );
  };

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage />;
      case "quotes":
        return <QuoteRequestsPage />;
      case "product-search":
        return <ProductSearchPage />;
      case "suppliers":
        return <SuppliersPage />;
      case "approvals":
        return <ApprovalsPage />;
      case "intelligence":
        return <IntelligencePage />;
      case "prompts":
        return <PromptsPage />;
      case "optimize":
        return <OptimizePage />;
      case "llm-traffic":
        return <LLMTrafficPage />;
      case "sentiment":
        return <SentimentPage />;
      case "logs":
        return <LogsPage />;
      case "reports":
        return <ReportsPage />;
      case "crawlers":
        return <CrawlersPage />;
      case "citations":
        return <CitationsPage />;
      case "user-management":
        return <UserManagementPage />;
      case "integrations":
        return <IntegrationsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
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
        w-72 h-full bg-dark-bg border-r border-dark-color 
        flex flex-col transition-transform duration-300 ease-in-out
      `}>
        {/* Logo */}
        <div className="p-4 lg:p-8 border-b border-dark-color">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-15 h-15 lg:w-18 lg:h-18 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden p-1">
                <img src="/RCS.png" alt="RCS Logo" className="w-full h-full object-contain relative z-10" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-dark-primary">RCS Procurement</h1>
                <p className="text-xs text-dark-secondary font-medium">Plataforma de Automação IA</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-hover text-dark-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 lg:p-6 space-y-6 lg:space-y-8 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-2">
            {mainNavItems.map((item) => renderNavItem(item, activePage === item.key))}
          </div>

          <Separator style={{ backgroundColor: '#374151' }} />

          {/* IA Group */}
          <div className="space-y-4">
            <div className="px-4">
              <h3 className="text-xs font-bold text-dark-secondary uppercase tracking-widest">Inteligência Artificial</h3>
            </div>
            <div className="space-y-2">
              {aiItems.map((item) => renderNavItem(item, activePage === item.key))}
            </div>
          </div>

          <Separator style={{ backgroundColor: '#374151' }} />

          {/* System Group */}
          <div className="space-y-4">
            <div className="px-4">
              <h3 className="text-xs font-bold text-dark-secondary uppercase tracking-widest">Sistema</h3>
            </div>
            <div className="space-y-2">
              {systemItems.map((item) => renderNavItem(item, activePage === item.key))}
            </div>
          </div>

          <Separator style={{ backgroundColor: '#374151' }} />

          {/* Admin Group */}
          <div className="space-y-4">
            <div className="px-4">
              <h3 className="text-xs font-bold text-dark-secondary uppercase tracking-widest">Administração</h3>
            </div>
            <div className="space-y-2">
              {adminItems.map((item) => renderNavItem(item, activePage === item.key))}
            </div>
          </div>
        </nav>

        {/* User Profile & Status */}
        <div className="p-4 lg:p-6 border-t border-dark-color space-y-4">
          {/* System Status - Enhanced */}
          <div className="glass-card p-3 lg:p-4 border border-white/20 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-green-400 rounded-full status-online"></div>
              <h4 className="text-sm font-bold text-dark-primary">Sistema Ativo</h4>
            </div>
            
            <div className="space-y-2 text-xs text-dark-secondary mb-3">
              <div className="flex justify-between hover:text-green-400 transition-colors duration-200">
                <span>IA Engine:</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="flex justify-between hover:text-green-400 transition-colors duration-200">
                <span>Processamento:</span>
                <span className="text-green-400">Ativo</span>
              </div>
              <div className="flex justify-between hover:text-green-400 transition-colors duration-200">
                <span>API Status:</span>
                <span className="text-green-400">Conectado</span>
              </div>
              <div className="flex justify-between hover:text-yellow-400 transition-colors duration-200">
                <span>Cache:</span>
                <span className="text-yellow-400">Otimizando</span>
              </div>
            </div>
            
            <button className="dark-button-primary text-xs py-2 px-3 lg:px-4 w-full hover:scale-105 transition-transform duration-200">
              <Database className="w-3 h-3 mr-1" />
              Monitoramento Completo
            </button>
          </div>

          {/* User Info - Enhanced */}
          <div className="flex items-center space-x-3 p-3 rounded-xl glass-card border border-white/20 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:from-blue-500 hover:to-blue-400 hover:shadow-xl hover:shadow-blue-500/25 hover:scale-110">
              <span className="text-white text-xs lg:text-sm font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium text-dark-primary truncate transition-colors duration-300 hover:text-blue-400">
                  {user?.name || 'Usuário'}
                </p>
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-blue-600/20 text-blue-300 border-blue-600/30 transition-all duration-300 hover:bg-blue-600/30 hover:text-blue-200"
                >
                  {user?.role || 'Padrão'}
                </Badge>
              </div>
              <p className="text-xs text-dark-secondary truncate">
                {user?.email || 'email@exemplo.com'}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-dark-hover text-dark-secondary hover:text-red-400 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-dark-bg border-b border-dark-color p-4 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-dark-hover text-dark-secondary"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center p-1">
              <img src="/RCS.png" alt="RCS Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-dark-primary">RCS Procurement</span>
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {/* Breadcrumb Header */}
          <div className="bg-dark-bg border-b border-dark-color p-4 lg:p-6">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-dark-secondary">Dashboard</span>
              <span className="text-dark-secondary">→</span>
              <span className="text-dark-primary font-medium">
                {mainNavItems.find(item => item.key === activePage)?.label ||
                 aiItems.find(item => item.key === activePage)?.label ||
                 systemItems.find(item => item.key === activePage)?.label ||
                 adminItems.find(item => item.key === activePage)?.label ||
                 "Painel Principal"}
              </span>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="h-full overflow-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}