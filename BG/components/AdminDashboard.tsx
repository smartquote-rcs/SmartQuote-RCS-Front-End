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
  Bell,
  Plus,
  Send,
  RefreshCw
} from "lucide-react";
import { Separator } from "./ui/separator";
import { DashboardPage } from "./pages/DashboardPage";
import { QuoteRequestsPage } from "./pages/QuoteRequestsPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { LogsPage } from "./pages/LogsPage";
import { ReportsPage } from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { ProductSearchPage } from "./pages/ProductSearchPage";
import UserManagementPage from "./pages/UserManagementPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { useApp } from "../contexts/AppContext";

type RoleType = "usuario" | "gestor" | "admin";
interface TabItem {
  icon: React.ComponentType<any>;
  label: string;
  key: string;
}

const usuarioTabs: TabItem[] = [
  { icon: FileText, label: "Solicitações de Cotação", key: "quotes" },
  { icon: Plus, label: "Nova Cotação", key: "new-quote" },
];
const gestorExtras: TabItem[] = [
  { icon: BarChart3, label: "Painel Administrativo", key: "dashboard" },
  { icon: Settings, label: "Configurações", key: "settings" },
  { icon: Database, label: "Gestão de Dados", key: "data-management" },
];
const adminExtras: TabItem[] = [
  { icon: Search, label: "Pesquisa de Produtos", key: "product-search" },
  { icon: Users, label: "Fornecedores", key: "suppliers" },
  { icon: CheckCircle, label: "Aprovações", key: "approvals" },
  { icon: Users, label: "Gestão de Usuários", key: "user-management" },
];

const navTabs: Record<RoleType, TabItem[]> = {
  usuario: usuarioTabs,
  gestor: [...usuarioTabs, ...gestorExtras],
  admin: [...usuarioTabs, ...gestorExtras, ...adminExtras],
};

const systemTabs: Record<RoleType, TabItem[]> = {
  usuario: [
    { icon: Activity, label: "Logs do Sistema", key: "logs" },
    { icon: FileText, label: "Relatórios", key: "reports" },
    { icon: Bell, label: "Notificações", key: "notifications" },
  ],
  gestor: [
    { icon: Activity, label: "Logs do Sistema", key: "logs" },
    { icon: FileText, label: "Relatórios", key: "reports" },
    { icon: Bell, label: "Notificações", key: "notifications" },
  ],
  admin: [
    { icon: Activity, label: "Logs do Sistema", key: "logs" },
    { icon: FileText, label: "Relatórios", key: "reports" },
    { icon: Bell, label: "Notificações", key: "notifications" },
  ],
};

export function AdminDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newQuotePrompt, setNewQuotePrompt] = useState("");
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const { addQuote, quotes: allQuotes } = useApp();

  // Normaliza o papel para garantir que só "usuario", "gestor" ou "admin" sejam aceitos
  let role: RoleType;
  const rawRole = (user?.role || "usuario").toLowerCase();
  if (rawRole === "admin" || rawRole === "gestor" || rawRole === "usuario") {
    role = rawRole;
  } else {
    role = "usuario";
  }

  const mainNavItems: TabItem[] = navTabs[role];
  const systemItems: TabItem[] = systemTabs[role];
  const adminItems: TabItem[] = (role === "admin" || role === "gestor")
    ? navTabs[role].filter(item => ["settings","data-management","user-management"].includes(item.key))
    : [];

  // Função auxiliar para renderizar itens do menu
  const renderNavItem = (item: TabItem, isActive: boolean) => {
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
          {item.label}
        </span>
      </button>
    );
  };

  // Função auxiliar para renderizar o conteúdo principal
  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage onNavigateToNotifications={() => setActivePage("notifications")} />;
      case "quotes":
        return <QuoteRequestsPage />;
      case "new-quote":
        return (
          <div className="flex flex-col h-full w-full items-center justify-center text-white">
            <h2 className="text-2xl font-bold mb-4">Nova Cotação</h2>
            {/* Adapte aqui o formulário de nova cotação conforme necessário */}
          </div>
        );
      case "product-search":
        return <ProductSearchPage />;
      case "suppliers":
        return <SuppliersPage />;
      case "approvals":
        return <ApprovalsPage />;
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
          <div className="flex flex-col h-full items-center justify-center text-white">
            <h2 className="text-2xl font-bold mb-4">Gestão de Dados</h2>
            {/* Adapte aqui o conteúdo de gestão de dados */}
          </div>
        );
      default:
        return <DashboardPage />;
    }
  };

  // Return principal do componente
  return (
    <div className="admin-dashboard-root">
      <div className="flex h-screen max-w-full bg-dark-bg overflow-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        {/* Sidebar */}
        <div className={`fixed lg:relative z-50 lg:z-auto w-56 sm:w-64 h-full bg-dark-bg border-r border-dark-color flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          {/* Sidebar, navegação, status do sistema e usuário */}
          {/* Implemente aqui o menu lateral conforme o design desejado */}
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden bg-dark-bg border-b border-dark-color p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
            {/* Mobile header */}
            {/* Implemente aqui o header mobile se necessário */}
          </div>
          {/* Page Content */}
          <div className="flex-1 overflow-hidden">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}