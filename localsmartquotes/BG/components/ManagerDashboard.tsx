import { useState } from "react";
import { 
  BarChart3, 
  FileText, 
  Users, 
  CheckCircle, 
  Activity,
  Search,
  TrendingUp,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  UserCheck
} from "lucide-react";
import { Separator } from "./ui/separator";
import { DashboardPage } from "./pages/DashboardPage";
import { QuoteRequestsPage } from "./pages/QuoteRequestsPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ProductSearchPage } from "./pages/ProductSearchPage";

interface User {
  email: string;
  name: string;
  role: string;
}

interface ManagerDashboardProps {
  user: User | null;
  onLogout: () => void;
}

const mainNavItems = [
  { icon: BarChart3, label: "Painel Gerencial", key: "dashboard", active: true },
  { icon: CheckCircle, label: "Aprovações", key: "approvals" },
  { icon: FileText, label: "Solicitações de Cotação", key: "quotes" },
  { icon: Users, label: "Fornecedores", key: "suppliers" },
  { icon: Search, label: "Pesquisa de Produtos", key: "product-search" },
];

const systemItems = [
  { icon: TrendingUp, label: "Relatórios", key: "reports" },
  { icon: Activity, label: "Análises", key: "analytics" },
];

export function ManagerDashboard({ user, onLogout }: ManagerDashboardProps) {
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
        className={`dark-nav-item w-full text-left ${
          isActive ? "dark-nav-item-active" : ""
        }`}
      >
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isActive ? "text-dark-primary" : "text-dark-secondary"}`} />
        <span className="text-xs sm:text-sm lg:text-base truncate">{item.label}</span>
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
      case "reports":
        return <ReportsPage />;
      case "analytics":
        return (
          <div className="flex flex-col h-full">
            <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">Análises Gerenciais</h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">Métricas e indicadores de desempenho da equipe</p>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-4 lg:p-8 bg-dark-bg">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <div className="dark-card p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-dark-primary">89%</h3>
                      <p className="text-xs sm:text-sm text-dark-secondary truncate">Taxa de Aprovação</p>
                    </div>
                  </div>
                </div>
                
                <div className="dark-card p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-dark-primary">2.1h</h3>
                      <p className="text-xs sm:text-sm text-dark-secondary truncate">Tempo Médio Aprovação</p>
                    </div>
                  </div>
                </div>

                <div className="dark-card p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-600 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-dark-primary">12</h3>
                      <p className="text-xs sm:text-sm text-dark-secondary truncate">Pendências</p>
                    </div>
                  </div>
                </div>

                <div className="dark-card p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-dark-primary">156</h3>
                      <p className="text-xs sm:text-sm text-dark-secondary truncate">Cotações do Mês</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center py-8 lg:py-12">
                <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-dark-secondary mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">Análises Avançadas</h3>
                <p className="text-sm sm:text-base text-dark-secondary px-4">Dashboards de performance e relatórios detalhados em desenvolvimento</p>
              </div>
            </main>
          </div>
        );
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
        w-64 sm:w-72 h-full bg-dark-bg border-r border-dark-color 
        flex flex-col transition-transform duration-300 ease-in-out
      `}>
        {/* Logo */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-dark-color flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center dark-shadow-lg relative overflow-hidden flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-base lg:text-lg relative z-10">SQ</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-dark-primary truncate">SmartQuote RCS</h1>
                <p className="text-xs text-dark-secondary font-medium truncate">Painel Gerencial</p>
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
        <nav className="flex-1 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-1 sm:space-y-2">
            {mainNavItems.map((item) => renderNavItem(item, activePage === item.key))}
          </div>

          <Separator style={{ backgroundColor: '#374151' }} />

          {/* System Group */}
          <div className="space-y-3 sm:space-y-4">
            <div className="px-3 sm:px-4">
              <h3 className="text-xs font-bold text-dark-secondary uppercase tracking-widest">Gestão</h3>
            </div>
            <div className="space-y-1 sm:space-y-2">
              {systemItems.map((item) => renderNavItem(item, activePage === item.key))}
            </div>
          </div>
        </nav>

        {/* System Status & User */}
        <div className="p-3 sm:p-4 lg:p-6 border-t border-dark-color space-y-3 sm:space-y-4 flex-shrink-0">
          {/* System Status */}
          <div className="bg-dark-card rounded-xl p-3 lg:p-4 text-center border border-dark-color">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <h4 className="text-xs sm:text-sm font-bold text-dark-primary">Sistema Ativo</h4>
            </div>
            <p className="text-xs text-dark-secondary mb-3">IA: Online | Gestão: Ativa</p>
            <button className="dark-button-primary text-xs py-2 px-3 lg:px-4 w-full flex items-center justify-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>Ver Métricas</span>
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-dark-card border border-dark-color">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-dark-primary truncate">
                {user?.name || 'Gestor'}
              </p>
              <p className="text-xs text-dark-secondary truncate">
                Gestor de Procurement
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-dark-hover text-dark-secondary hover:text-red-400 transition-colors flex-shrink-0"
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
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">SQ</span>
            </div>
            <span className="font-bold text-dark-primary text-sm sm:text-base">SmartQuote</span>
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
