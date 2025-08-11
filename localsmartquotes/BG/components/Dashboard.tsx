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
  X
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

const systemItems = [
  { icon: Activity, label: "Logs do Sistema", key: "logs" },
  { icon: FileText, label: "Relatórios", key: "reports" },
];

const adminItems = [
  { icon: Settings, label: "Configurações", key: "settings" },
];

export function Dashboard({ user, onLogout }: DashboardProps) {
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
        <Icon className={`w-5 h-5 ${isActive ? "text-dark-primary" : "text-dark-secondary"}`} />
        <span className="text-sm lg:text-base">{item.label}</span>
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
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center dark-shadow-lg relative overflow-hidden">
                <span className="text-white font-bold text-base lg:text-lg relative z-10">RCS</span>
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
              <h3 className="text-xs font-bold text-dark-secondary uppercase tracking-widest">Admin</h3>
            </div>
            <div className="space-y-2">
              {adminItems.map((item) => renderNavItem(item, activePage === item.key))}
            </div>
          </div>
        </nav>

        {/* User Profile & Status */}
        <div className="p-4 lg:p-6 border-t border-dark-color space-y-4">
          {/* System Status */}
          <div className="bg-dark-card rounded-xl p-3 lg:p-4 text-center border border-dark-color">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <h4 className="text-sm font-bold text-dark-primary">Sistema Ativo</h4>
            </div>
            <p className="text-xs text-dark-secondary mb-3">IA: Online | Processamento: Ativo</p>
            <button className="dark-button-primary text-xs py-2 px-3 lg:px-4 w-full">
              <Database className="w-3 h-3 mr-1" />
              Ver Status
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-dark-card border border-dark-color">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs lg:text-sm font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-primary truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-dark-secondary truncate">
                {user?.email || 'email@exemplo.com'}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-dark-hover text-dark-secondary hover:text-red-400 transition-colors"
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
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RCS</span>
            </div>
            <span className="font-bold text-dark-primary">RCS Procurement</span>
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
