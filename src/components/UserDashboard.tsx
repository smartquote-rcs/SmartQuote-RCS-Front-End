import { useState } from "react";
import { 
  Search, 
  ShoppingCart, 
  Eye, 
  FileText,
  User,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { ProductSearchPage } from "./pages/ProductSearchPage";
import { Badge } from "./ui/badge";

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
  { icon: Search, label: "Pesquisa de Produtos", key: "product-search", active: true },
  { icon: ShoppingCart, label: "Minhas Cotações", key: "my-quotes" },
  { icon: FileText, label: "Histórico", key: "history" },
];

const myQuotes = [
  {
    id: "COT-2024-0045",
    produto: "Painel Solar 400W",
    fornecedor: "EnerTech Solutions",
    valor: "€285.00",
    status: "pending",
    data: "24/01/2024"
  },
  {
    id: "COT-2024-0044", 
    produto: "Impressora HP PageWide",
    fornecedor: "PrintMax Industrial",
    valor: "€1,850.00",
    status: "approved",
    data: "23/01/2024"
  },
  {
    id: "COT-2024-0043",
    produto: "Servidor Dell PowerEdge",
    fornecedor: "TechFlow Innovations", 
    valor: "€2,450.00",
    status: "processing",
    data: "22/01/2024"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-orange-600 text-white text-xs">Pendente</Badge>;
    case "approved":
      return <Badge className="bg-green-600 text-white text-xs">Aprovada</Badge>;
    case "processing":
      return <Badge className="bg-blue-600 text-white text-xs">Processando</Badge>;
    case "rejected":
      return <Badge className="bg-red-600 text-white text-xs">Rejeitada</Badge>;
    default:
      return <Badge className="text-xs">{status}</Badge>;
  }
};

export function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [activePage, setActivePage] = useState("product-search");
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
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isActive ? "text-blue-400" : "text-dark-secondary"}`} />
        <span className={`text-xs sm:text-sm lg:text-base truncate ${isActive ? "text-blue-400" : "text-dark-secondary"}`}>{item.label}</span>
      </button>
    );
  };

  const renderContent = () => {
    switch (activePage) {
      case "product-search":
        return <ProductSearchPage />;
      case "my-quotes":
        return (
          <div className="flex flex-col h-full">
            <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">Minhas Cotações</h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">Acompanhe o status das suas solicitações de cotação</p>
                </div>
                <div className="dark-tag text-center sm:text-left">
                  {myQuotes.length} cotações
                </div>
              </div>
            </header>
            
            <main className="flex-1 overflow-auto p-4 lg:p-8 bg-dark-bg">
              <div className="grid gap-4 lg:gap-6">
                {myQuotes.map((quote) => (
                  <div key={quote.id} className="glass-card p-4 hover:border-cyan-400/50 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                          <span className="font-mono text-xs sm:text-sm font-medium text-dark-primary hover:text-cyan-400 transition-colors duration-300">{quote.id}</span>
                          <div className="mt-1 sm:mt-0">
                            {getStatusBadge(quote.status)}
                          </div>
                        </div>
                        <h3 className="font-bold text-dark-primary mb-1 text-sm sm:text-base hover:text-cyan-400 transition-colors duration-300">{quote.produto}</h3>
                        <p className="text-xs sm:text-sm text-dark-secondary mb-2">{quote.fornecedor}</p>
                        <p className="text-xs text-dark-secondary">{quote.data}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="text-lg sm:text-xl font-bold text-dark-primary text-center sm:text-right hover:text-green-400 transition-colors duration-300">{quote.valor}</div>
                        <button className="dark-button-secondary px-3 py-2 text-xs sm:text-sm flex items-center justify-center space-x-2 hover:scale-105 transition-transform duration-200">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Ver Detalhes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        );
      case "history":
        return (
          <div className="flex flex-col h-full">
            <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">Histórico de Cotações</h1>
                <p className="text-xs sm:text-sm text-dark-secondary mt-1">Visualize todas as suas cotações anteriores</p>
              </div>
            </header>
            
            <main className="flex-1 overflow-auto p-4 lg:p-8 bg-dark-bg">
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
                <p className="text-xs text-dark-secondary font-medium truncate">Portal do Cliente</p>
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
          <div className="space-y-1 sm:space-y-2">
            {mainNavItems.map((item) => renderNavItem(item, activePage === item.key))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-3 sm:p-4 lg:p-6 border-t border-dark-color space-y-3 sm:space-y-4 flex-shrink-0">
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