import { useState } from "react";
import {
  BarChart3,
  FileText,
  Users,
  Settings,
  CheckCircle,
  Activity,
  Database,
  Search,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { DashboardPage } from "./pages/DashboardPage";
import { QuoteRequestsPage } from "./pages/QuoteRequestsPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { LogsPage } from "./pages/LogsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProductSearchPage } from "./pages/ProductSearchPage";
import { UserManagementPage } from "./pages/UserManagementPage";

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
    label: "Painel Administrativo",
    key: "dashboard",
    active: true,
  },
  {
    icon: FileText,
    label: "Solicitações de Cotação",
    key: "quotes",
  },
  {
    icon: Search,
    label: "Pesquisa de Produtos",
    key: "product-search",
  },
  { icon: Users, label: "Fornecedores", key: "suppliers" },
  { icon: CheckCircle, label: "Aprovações", key: "approvals" },
];

const systemItems = [
  { icon: Activity, label: "Logs do Sistema", key: "logs" },
  { icon: FileText, label: "Relatórios", key: "reports" },
];

const adminItems = [
  { icon: Settings, label: "Configurações", key: "settings" },
  {
    icon: Database,
    label: "Gestão de Dados",
    key: "data-management",
  },
  {
    icon: Users,
    label: "Gestão de Usuários",
    key: "user-management",
  },
];

export function AdminDashboard({
  user,
  onLogout,
}: AdminDashboardProps) {
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

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
        <Icon
          className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isActive ? "text-blue-400" : "text-dark-secondary"}`}
        />
        <span className={`text-xs sm:text-sm lg:text-base truncate ${isActive ? "text-blue-400" : "text-dark-secondary"}`}>
          {item.label}
        </span>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">
                    Gestão de Dados
                  </h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">
                    Administração avançada de dados do sistema
                  </p>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-4 lg:p-8 bg-dark-bg">
              {/* Data Management Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <div className="glass-card">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:from-purple-500 hover:to-purple-400 hover:shadow-lg hover:shadow-purple-500/25">
                      <Database className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-dark-primary transition-colors duration-300 hover:text-purple-400">
                        2.4GB
                      </h3>
                      <p className="text-xs sm:text-sm text-dark-secondary truncate">
                        Dados Armazenados
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:from-green-500 hover:to-green-400 hover:shadow-lg hover:shadow-green-500/25">
                      <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-dark-primary transition-colors duration-300 hover:text-green-400">
                        99.9%
                      </h3>
                      <p className="text-xs sm:text-sm text-dark-secondary truncate">
                        Uptime
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/25">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-dark-primary transition-colors duration-300 hover:text-blue-400">
                        15,247
                      </h3>
                      <p className="text-xs sm:text-sm text-dark-secondary truncate">
                        Registros Totais
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:from-orange-500 hover:to-orange-400 hover:shadow-lg hover:shadow-orange-500/25">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-dark-primary transition-colors duration-300 hover:text-orange-400">
                        Diário
                      </h3>
                      <p className="text-xs sm:text-sm text-dark-secondary truncate">
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
      className="flex h-screen bg-dark-bg overflow-hidden"
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
        w-64 sm:w-72 h-full bg-dark-bg border-r border-dark-color 
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
                  SmartQuote RCS
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
        <nav className="flex-1 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-1 sm:space-y-2">
            {mainNavItems.map((item) =>
              renderNavItem(item, activePage === item.key),
            )}
          </div>

          <Separator style={{ backgroundColor: "#374151" }} />

          {/* System Group */}
          <div className="space-y-3 sm:space-y-4">
            <div className="px-3 sm:px-4">
              <h3 className="text-xs font-bold text-dark-secondary uppercase tracking-widest">
                Sistema
              </h3>
            </div>
            <div className="space-y-1 sm:space-y-2">
              {systemItems.map((item) =>
                renderNavItem(item, activePage === item.key),
              )}
            </div>
          </div>

          <Separator style={{ backgroundColor: "#374151" }} />

          {/* Admin Group */}
          <div className="space-y-3 sm:space-y-4">
            <div className="px-3 sm:px-4">
              <h3 className="text-xs font-bold text-dark-secondary uppercase tracking-widest">
                Administração
              </h3>
            </div>
            <div className="space-y-1 sm:space-y-2">
              {adminItems.map((item) =>
                renderNavItem(item, activePage === item.key),
              )}
            </div>
          </div>
        </nav>

        {/* System Status & User */}
        <div className="p-3 sm:p-4 lg:p-6 border-t border-dark-color space-y-3 sm:space-y-4 flex-shrink-0">
          {/* System Status */}
          <div className="glass-card p-3 lg:p-4 text-center border border-white/20 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full status-online"></div>
              <h4 className="text-xs sm:text-sm font-bold text-dark-primary">
                Sistema Ativo
              </h4>
            </div>
            <p className="text-xs text-dark-secondary mb-3">
              IA: Online | Admin: Ativo
            </p>
            <button className="dark-button-primary text-xs py-2 px-3 lg:px-4 w-full flex items-center justify-center space-x-1 hover:scale-105 transition-transform duration-200">
              <Database className="w-3 h-3" />
              <span>Ver Status</span>
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 rounded-xl glass-card border border-white/20 transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10">
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
              SmartQuote
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