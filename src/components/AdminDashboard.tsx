import { useState, useEffect, useRef } from "react";
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
  Check,
  Upload,
  Image
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
  const [shouldFocusPrompt, setShouldFocusPrompt] = useState(false);
  // Estados para novo produto
  const [newProduct, setNewProduct] = useState({
    nome: '',
    descricao: '',
    preco: '',
    quantidade: '',
    categoriaId: '',
    categoria: '',
    fornecedorId: '',
    fornecedor: '',
    codigo: '',
    unidadeMedida: 'unidade',
    disponibilidade: 'em-stock',
    prazoEntrega: '',
    especificacoes: '',
    imagem: '',
    peso: '',
    dimensoes: {
      comprimento: '',
      largura: '',
      altura: ''
    },
    tags: [] as string[],
    precoMinimo: '',
    precoMaximo: '',
    moeda: 'EUR',
    garantia: '',
    observacoes: ''
  });
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  
  // Estados para novo fornecedor
  const [newSupplier, setNewSupplier] = useState({
    nomeEmpresa: '',
    observacoes: '',
    ativo: true,
    categoriaMercado: '',
    localizacao: '',
    rating: 0,
    contactos: {
      principal: {
        nome: '',
        email: '',
        telefone: '',
        cargo: ''
      }
    }
  });
  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);
  // Estados para Toast Notifications
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: "success" | "error" | "info";
    title: string;
    message: string;
    duration?: number;
  }>>([]);
  // Forçar atualização ao trocar idioma
  const [, setForceUpdate] = useState(0);
  const newQuoteTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Ouvir mudanças de idioma
  useEffect(() => {
    const handleLanguageChange = () => setForceUpdate(f => f + 1);
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);
  
  // Efeito para dar foco ao textarea quando navegar para new-quote
  useEffect(() => {
    if (activePage === "new-quote" && shouldFocusPrompt && newQuoteTextareaRef.current) {
      newQuoteTextareaRef.current.focus();
      setShouldFocusPrompt(false);
    }
  }, [activePage, shouldFocusPrompt]);
  
  // Função para navegar para new-quote com foco
  const navigateToNewQuote = () => {
    setActivePage("new-quote");
    setShouldFocusPrompt(true);
  };
  
  // Função para navegar para new-product
  const navigateToNewProduct = () => {
    setActivePage("new-product");
  };
  
  // Função para navegar para new-supplier
  const navigateToNewSupplier = () => {
    setActivePage("new-supplier");
  };
  
  // Função para mostrar toast
  const showToast = (type: "success" | "error" | "info", title: string, message: string, duration: number = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };
  
  // Função para remover toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  // Função para validar e salvar produto
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    const requiredFields = ['nome', 'descricao', 'preco', 'quantidade', 'categoriaId'];
    const emptyFields = requiredFields.filter(field => {
      const value = newProduct[field as keyof typeof newProduct];
      return !value || (typeof value === 'string' && !value.trim());
    });
    
    if (emptyFields.length > 0) {
      showToast(
        "error",
        "Campos Obrigatórios",
        "Por favor, preencha todos os campos obrigatórios: Nome, Descrição, Preço, Quantidade e Categoria."
      );
      return;
    }
    
    // Validar se o preço é um número válido
    const preco = parseFloat(newProduct.preco);
    if (isNaN(preco) || preco <= 0) {
      showToast(
        "error",
        "Preço Inválido",
        "Por favor, insira um preço válido maior que zero."
      );
      return;
    }
    
    // Validar se a quantidade é um número válido
    const quantidade = parseInt(newProduct.quantidade);
    if (isNaN(quantidade) || quantidade < 0) {
      showToast(
        "error",
        "Quantidade Inválida",
        "Por favor, insira uma quantidade válida (número inteiro maior ou igual a zero)."
      );
      return;
    }
    
    // Validar se a categoria é um número válido
    const categoriaId = parseInt(newProduct.categoriaId);
    if (isNaN(categoriaId) || categoriaId <= 0) {
      showToast(
        "error",
        "Categoria Inválida",
        "Por favor, selecione uma categoria válida."
      );
      return;
    }
    
    // Criar produto através da API
    setIsCreatingProduct(true);
    
    try {
      const productData = {
        nome: newProduct.nome,
        descricao: newProduct.descricao,
        preco: preco,
        quantidade: quantidade,
        categoriaId: categoriaId,
        categoria: newProduct.categoria,
        fornecedorId: newProduct.fornecedorId ? parseInt(newProduct.fornecedorId) : undefined,
        fornecedor: newProduct.fornecedor,
        codigo: newProduct.codigo,
        unidadeMedida: newProduct.unidadeMedida || 'unidade',
        disponibilidade: newProduct.disponibilidade as 'em-stock' | 'fora-de-stock' | 'descontinuado' | 'pre-venda',
        prazoEntrega: newProduct.prazoEntrega,
        especificacoes: newProduct.especificacoes,
        imagem: newProduct.imagem,
        peso: newProduct.peso ? parseFloat(newProduct.peso) : undefined,
        dimensoes: newProduct.dimensoes.comprimento || newProduct.dimensoes.largura || newProduct.dimensoes.altura ? {
          comprimento: newProduct.dimensoes.comprimento ? parseFloat(newProduct.dimensoes.comprimento) : undefined,
          largura: newProduct.dimensoes.largura ? parseFloat(newProduct.dimensoes.largura) : undefined,
          altura: newProduct.dimensoes.altura ? parseFloat(newProduct.dimensoes.altura) : undefined,
        } : undefined,
        tags: newProduct.tags,
        precoMinimo: newProduct.precoMinimo ? parseFloat(newProduct.precoMinimo) : undefined,
        precoMaximo: newProduct.precoMaximo ? parseFloat(newProduct.precoMaximo) : undefined,
        moeda: newProduct.moeda || 'EUR',
        garantia: newProduct.garantia,
        observacoes: newProduct.observacoes,
        cadastradoEm: new Date().toISOString(),
        cadastradoPor: 1, // ID do usuário atual - pode ser obtido do contexto depois
        atualizadoEm: new Date().toISOString(),
        atualizadoPor: 1, // ID do usuário atual - pode ser obtido do contexto depois
        ativo: true
      };
      
      await addProduct(productData);
      
      showToast(
        "success",
        "Produto Adicionado com Sucesso",
        `${newProduct.nome} foi adicionado ao catálogo por €${preco.toFixed(2)}.`
      );
      
      // Limpar formulário
      setNewProduct({
        nome: '',
        descricao: '',
        preco: '',
        quantidade: '',
        categoriaId: '',
        categoria: '',
        fornecedorId: '',
        fornecedor: '',
        codigo: '',
        unidadeMedida: 'unidade',
        disponibilidade: 'em-stock',
        prazoEntrega: '',
        especificacoes: '',
        imagem: '',
        peso: '',
        dimensoes: {
          comprimento: '',
          largura: '',
          altura: ''
        },
        tags: [] as string[],
        precoMinimo: '',
        precoMaximo: '',
        moeda: 'EUR',
        garantia: '',
        observacoes: ''
      });
      
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      showToast(
        "error",
        "Erro ao Adicionar Produto",
        "Ocorreu um erro ao adicionar o produto. Tente novamente."
      );
    } finally {
      setIsCreatingProduct(false);
    }
  };
  
  // Função para validar e salvar fornecedor
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    const requiredFields = ['nomeEmpresa', 'categoriaMercado', 'localizacao', 'observacoes'];
    const emptyFields = requiredFields.filter(field => {
      const value = newSupplier[field as keyof typeof newSupplier];
      return typeof value === 'string' && !value.trim();
    });
    
    // Validar contacto principal
    if (!newSupplier.contactos.principal.nome || !newSupplier.contactos.principal.nome.trim()) {
      showToast(
        "error",
        "Nome do Contacto Obrigatório",
        "Por favor, preencha o nome do contacto principal."
      );
      return;
    }
    
    if (!newSupplier.contactos.principal.email || !newSupplier.contactos.principal.email.trim()) {
      showToast(
        "error",
        "Email do Contacto Obrigatório",
        "Por favor, preencha o email do contacto principal."
      );
      return;
    }
    
    if (emptyFields.length > 0) {
      showToast(
        "error",
        "Campos Obrigatórios",
        "Por favor, preencha todos os campos obrigatórios: Nome da Empresa, Categoria de Mercado, Localização e Observações."
      );
      return;
    }
    
    // Validar email do contacto principal
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSupplier.contactos.principal.email)) {
      showToast(
        "error",
        "Email Inválido",
        "Por favor, insira um endereço de email válido para o contacto principal."
      );
      return;
    }
    
    // Salvar fornecedor
    setIsCreatingSupplier(true);
    
    try {
      // Criar objeto completo do fornecedor com campos de auditoria
      const currentDate = new Date().toISOString();
      const currentUserId = 1; // Simular ID do usuário atual (em produção viria da autenticação)
      
      const supplierData = {
        ...newSupplier,
        cadastradoEm: currentDate,
        cadastradoPor: currentUserId,
        atualizadoEm: currentDate,
        atualizadoPor: currentUserId
      };
      
      // Adicionar fornecedor ao contexto global (que agora salva na API)
      await addSupplier(supplierData);
      console.log('Fornecedor adicionado ao contexto:', supplierData);
      
      showToast(
        "success",
        "Fornecedor Adicionado com Sucesso",
        `${newSupplier.nomeEmpresa} foi adicionado à lista de fornecedores. Categoria de Mercado: ${newSupplier.categoriaMercado} - ${newSupplier.localizacao}.`
      );
      
      // Limpar formulário
      setNewSupplier({
        nomeEmpresa: '',
        observacoes: '',
        ativo: true,
        categoriaMercado: '',
        localizacao: '',
        rating: 0,
        contactos: {
          principal: {
            nome: '',
            email: '',
            telefone: '',
            cargo: ''
          }
        }
      });
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      showToast(
        "error",
        "Erro ao Salvar Fornecedor",
        "Ocorreu um erro ao salvar o fornecedor. Tente novamente."
      );
    } finally {
      setIsCreatingSupplier(false);
    }
  };
  
  // Usar o contexto da aplicação
  const { addQuote, quotes: allQuotes, addSupplier, addProduct, setToastCallback } = useApp();

  // Registrar função de toast no contexto - DESABILITADO para evitar toasts automáticos
  /*
  useEffect(() => {
    console.log('🎯 AdminDashboard: Registrando showToast no contexto...');
    setToastCallback(showToast);
    console.log('✅ AdminDashboard: showToast registrado com sucesso');
  }, [setToastCallback]);
  */

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
        return (
          <DashboardPage 
            onNavigateToNotifications={() => setActivePage("notifications")}
            onNavigateToSettings={() => setActivePage("settings")}
            onNavigateToQuotes={() => setActivePage("quotes")}
          />
        );
      case "quotes":
        return <QuoteRequestsPage onNavigateToNewQuote={navigateToNewQuote} />;
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
                        ref={newQuoteTextareaRef}
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
                                submittedAt: new Date().toLocaleString('pt-PT')
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

              {/* Lista de Cotações Criadas */}
              {allQuotes.length > 0 && (
                <div className="mb-8">
                  <div className="glass-card bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-500/20 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-500/20 rounded-lg">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-bold text-white">Cotações Recentes</h2>
                          <p className="text-xs sm:text-sm text-slate-200">Últimas cotações criadas pelo admin</p>
                        </div>
                      </div>
                      <div className="bg-slate-500/20 px-3 py-1 rounded-lg">
                        <span className="text-slate-300 text-xs font-medium">{allQuotes.length} cotações</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {allQuotes.slice(0, 5).map((quote, index) => (
                        <div
                          key={quote.id}
                          className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4 hover:border-slate-500/50 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-white font-semibold text-sm">{quote.produto}</h4>
                                <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                                  quote.status === 'approved' 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : quote.status === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}>
                                  {quote.status === 'approved' ? 'Aprovada' : 
                                   quote.status === 'pending' ? 'Pendente' : 'Processando'}
                                </div>
                              </div>
                              <p className="text-slate-400 text-xs font-mono mb-2">ID: {quote.id}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-slate-500 block mb-1">Fornecedor:</span>
                                  <span className="text-slate-300">{quote.fornecedor}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block mb-1">Status:</span>
                                  <span className={`${
                                    quote.status === 'approved' 
                                      ? 'text-green-400'
                                      : quote.status === 'pending'
                                      ? 'text-yellow-400'
                                      : 'text-blue-400'
                                  }`}>
                                    {quote.status === 'approved' ? 'Aprovada' : 
                                     quote.status === 'pending' ? 'Pendente' : 'Processando'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block mb-1">Valor:</span>
                                  <span className="text-green-400 font-bold">{quote.valor}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block mb-1">Data:</span>
                                  <span className="text-slate-300">{quote.data}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                            <div className="flex items-center space-x-2 text-xs text-slate-400">
                              <span>Criada por: {user?.name || 'Admin'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {index === 0 && lastCreatedQuote?.id === quote.id && (
                                <div className="bg-green-500/20 border border-green-500/30 px-2 py-1 rounded-md">
                                  <span className="text-green-400 text-xs font-medium">✨ Recém criada</span>
                                </div>
                              )}
                              <button
                                onClick={() => setActivePage("quotes")}
                                className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 px-3 py-1 text-xs rounded-lg transition-all duration-200 flex items-center space-x-1"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Ver Detalhes</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {allQuotes.length > 5 && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
                        <button
                          onClick={() => setActivePage("quotes")}
                          className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm flex items-center space-x-2 mx-auto"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Ver todas as {allQuotes.length} cotações</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
             
            </main>
          </div>
        );
      case "new-product":
        return (
          <div className="flex flex-col h-full w-full">
            <header className="bg-dark-bg border-b border-dark-color px-3 sm:px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary truncate flex items-center gap-3">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    Novo Produto - Admin
                  </h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">Adicionar novos produtos ao catálogo</p>
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
                    Gestão de Produtos
                  </div>
                </div>
              </div>
            </header>
            
            <main className="flex-1 dashboard-main p-3 sm:p-4 lg:p-8 bg-dark-bg overflow-y-auto">
              {/* Formulário de Novo Produto */}
              <div className="mb-8">
                <div className="glass-card bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-xl border border-green-500/20 p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white">Adicionar Novo Produto</h2>
                      <p className="text-xs sm:text-sm text-green-200">Preencha os dados do novo produto para o catálogo</p>
                      <p className="text-xs text-yellow-300 mt-1">* Campos obrigatórios</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSaveProduct} className="space-y-6">
                    {/* Informações Básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Nome do Produto *</label>
                        <input
                          type="text"
                          value={newProduct.nome}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, nome: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white placeholder-slate-400 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                          placeholder="Ex: Painel Solar 400W Monocristalino"
                          disabled={isCreatingProduct}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Categoria ID *</label>
                        <select 
                          value={newProduct.categoriaId}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, categoriaId: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                          disabled={isCreatingProduct}
                        >
                          <option value="">Selecionar categoria</option>
                          <option value="1">Energia Solar (ID: 1)</option>
                          <option value="2">Infraestrutura TI (ID: 2)</option>
                          <option value="3">Equipamento de Impressão (ID: 3)</option>
                          <option value="4">Iluminação (ID: 4)</option>
                          <option value="5">Climatização (ID: 5)</option>
                          <option value="6">Outros (ID: 6)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Quantidade *</label>
                        <input
                          type="number"
                          min="0"
                          value={newProduct.quantidade}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, quantidade: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white placeholder-slate-400 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                          placeholder="100"
                          disabled={isCreatingProduct}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Preço (€) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newProduct.preco}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, preco: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white placeholder-slate-400 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                          placeholder="285.00"
                          disabled={isCreatingProduct}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Código/SKU</label>
                        <input
                          type="text"
                          value={newProduct.codigo}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, codigo: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white placeholder-slate-400 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                          placeholder="Ex: PS-400W-MONO"
                          disabled={isCreatingProduct}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Unidade de Medida</label>
                        <select 
                          value={newProduct.unidadeMedida}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, unidadeMedida: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                          disabled={isCreatingProduct}
                        >
                          <option value="unidade">Unidade</option>
                          <option value="kg">Quilograma (kg)</option>
                          <option value="litro">Litro</option>
                          <option value="metro">Metro</option>
                          <option value="m2">Metro Quadrado (m²)</option>
                          <option value="m3">Metro Cúbico (m³)</option>
                          <option value="par">Par</option>
                          <option value="conjunto">Conjunto</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Fornecedor</label>
                        <input
                          type="text"
                          value={newProduct.fornecedor}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, fornecedor: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white placeholder-slate-400 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                          placeholder="Nome do fornecedor"
                          disabled={isCreatingProduct}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Disponibilidade</label>
                        <select 
                          value={newProduct.disponibilidade}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, disponibilidade: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                          disabled={isCreatingProduct}
                        >
                          <option value="em-stock">Em Stock</option>
                          <option value="fora-de-stock">Fora de Stock</option>
                          <option value="descontinuado">Descontinuado</option>
                          <option value="pre-venda">Pré-venda</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Prazo de Entrega</label>
                        <input
                          type="text"
                          value={newProduct.prazoEntrega}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, prazoEntrega: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white placeholder-slate-400 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                          placeholder="Ex: 5-7 dias úteis"
                          disabled={isCreatingProduct}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Peso (kg)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newProduct.peso}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, peso: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white placeholder-slate-400 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                          placeholder="18.5"
                          disabled={isCreatingProduct}
                        />
                      </div>
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Descrição *</label>
                      <textarea
                        rows={4}
                        value={newProduct.descricao}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, descricao: e.target.value }))}
                        className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white placeholder-slate-400 resize-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                        placeholder="Descreva as características principais do produto..."
                        disabled={isCreatingProduct}
                      />
                    </div>

                    {/* Imagem do Produto */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Imagem do Produto</label>
                      <div className="space-y-4">
                        {/* Preview da imagem */}
                        {newProduct.imagem && (
                          <div className="relative w-32 h-32 mx-auto">
                            <img 
                              src={newProduct.imagem} 
                              alt="Preview do produto"
                              className="w-full h-full object-cover rounded-lg border border-slate-600"
                            />
                            <button
                              type="button"
                              onClick={() => setNewProduct(prev => ({ ...prev, imagem: '' }))}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition-colors"
                              disabled={isCreatingProduct}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        
                        {/* Input para URL da imagem */}
                        <div>
                          <input
                            type="url"
                            value={newProduct.imagem}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, imagem: e.target.value }))}
                            className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white placeholder-slate-400 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-colors"
                            placeholder="https://exemplo.com/imagem-produto.jpg"
                            disabled={isCreatingProduct}
                          />
                        </div>
                        
                        {/* Botões de exemplo */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-slate-400">Exemplos:</span>
                          {[
                            { name: 'Painel Solar', url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop' },
                            { name: 'Servidor', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=400&fit=crop' },
                            { name: 'Impressora', url: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop' }
                          ].map((example) => (
                            <button
                              key={example.name}
                              type="button"
                              onClick={() => setNewProduct(prev => ({ ...prev, imagem: example.url }))}
                              className="text-xs bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 px-2 py-1 rounded transition-colors"
                              disabled={isCreatingProduct}
                            >
                              {example.name}
                            </button>
                          ))}
                        </div>
                        
                        {/* Upload de arquivo (simulado) */}
                        <div className="border-2 border-dashed border-slate-600/50 rounded-lg p-6 text-center">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-400 mb-2">Ou faça upload de uma imagem</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Simular upload - em produção seria enviado para um servidor
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setNewProduct(prev => ({ ...prev, imagem: event.target?.result as string }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                            id="image-upload"
                            disabled={isCreatingProduct}
                          />
                          <label
                            htmlFor="image-upload"
                            className="inline-flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                          >
                            <Image className="w-4 h-4" />
                            <span className="text-sm">Selecionar Arquivo</span>
                          </label>
                          <p className="text-xs text-slate-500 mt-2">JPG, PNG, GIF até 5MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Indicador de Loading */}
                    {isCreatingProduct && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-300 text-xs sm:text-sm">Adicionando produto ao catálogo...</span>
                        </div>
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={isCreatingProduct}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-300 flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        {isCreatingProduct ? (
                          <>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Adicionando...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Adicionar Produto</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewProduct({
                            nome: '',
                            descricao: '',
                            preco: '',
                            quantidade: '',
                            categoriaId: '',
                            categoria: '',
                            fornecedorId: '',
                            fornecedor: '',
                            codigo: '',
                            unidadeMedida: 'unidade',
                            disponibilidade: 'em-stock',
                            prazoEntrega: '',
                            especificacoes: '',
                            imagem: '',
                            peso: '',
                            dimensoes: {
                              comprimento: '',
                              largura: '',
                              altura: ''
                            },
                            tags: [] as string[],
                            precoMinimo: '',
                            precoMaximo: '',
                            moeda: 'EUR',
                            garantia: '',
                            observacoes: ''
                          });
                        }}
                        disabled={isCreatingProduct}
                        className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Limpar
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePage("product-search")}
                        disabled={isCreatingProduct}
                        className="bg-blue-600/50 hover:bg-blue-700/50 border border-blue-600/50 text-blue-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Ver Catálogo</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Dicas para Novos Produtos */}
              <div className="mb-8">
                <div className="glass-card bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-500/20 p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white">Dicas para Cadastro</h2>
                      <p className="text-xs sm:text-sm text-slate-200">Boas práticas para adicionar produtos</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <div>
                          <h4 className="text-white font-medium">Nome Descritivo</h4>
                          <p className="text-slate-400 text-xs">Use nomes claros que incluam marca, modelo e características principais</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        <div>
                          <h4 className="text-white font-medium">Especificações Completas</h4>
                          <p className="text-slate-400 text-xs">Inclua todas as especificações técnicas relevantes</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                        <div>
                          <h4 className="text-white font-medium">Preços Atualizados</h4>
                          <p className="text-slate-400 text-xs">Mantenha os preços sempre atualizados com o fornecedor</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                        <div>
                          <h4 className="text-white font-medium">Disponibilidade Real</h4>
                          <p className="text-slate-400 text-xs">Confirme a disponibilidade e prazos com o fornecedor</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        );
      case "new-supplier":
        return (
          <div className="flex flex-col h-full w-full">
            <header className="bg-dark-bg border-b border-dark-color px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary truncate flex items-center gap-2 sm:gap-3">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    Novo Fornecedor - Admin
                  </h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">Adicionar novos fornecedores à plataforma</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <button 
                      onClick={() => setActivePage("notifications")}
                      className="p-2 bg-slate-800/50 rounded-full hover:bg-slate-700/50 transition-colors"
                    >
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">3</span>
                      </div>
                    </button>
                  </div>
                  <div className="dark-tag text-center sm:text-left flex-shrink-0 text-xs sm:text-sm">
                    Gestão de Fornecedores
                  </div>
                </div>
              </div>
            </header>
            
            <main className="flex-1 dashboard-main p-3 sm:p-4 lg:p-8 bg-dark-bg overflow-y-auto">
              {/* Formulário de Novo Fornecedor */}
              <div className="mb-6 sm:mb-8">
                <div className="glass-card bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/20 p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-white">Adicionar Novo Fornecedor</h2>
                      <p className="text-xs sm:text-sm text-purple-200">Preencha os dados do novo fornecedor para a plataforma</p>
                      <p className="text-xs text-yellow-300 mt-1">* Campos obrigatórios</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSaveSupplier} className="space-y-4 sm:space-y-6">
                    {/* Nome da Empresa */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Nome da Empresa *</label>
                      <input
                        type="text"
                        value={newSupplier.nomeEmpresa}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
                        className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2.5 sm:p-3 text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                        placeholder="Ex: EnerTech Solutions"
                        disabled={isCreatingSupplier}
                      />
                    </div>

                    {/* Categoria de Mercado e Localização */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Categoria de Mercado *</label>
                        <select 
                          value={newSupplier.categoriaMercado}
                          onChange={(e) => setNewSupplier(prev => ({ ...prev, categoriaMercado: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2.5 sm:p-3 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                          disabled={isCreatingSupplier}
                        >
                          <option value="">Selecionar categoria de mercado</option>
                          <option value="Nacional">Nacional</option>
                          <option value="Internacional">Internacional</option>
                          <option value="Regional">Regional</option>
                          <option value="Local">Local</option>
                          <option value="Global">Global</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Localização *</label>
                        <input
                          type="text"
                          value={newSupplier.localizacao}
                          onChange={(e) => setNewSupplier(prev => ({ ...prev, localizacao: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2.5 sm:p-3 text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                          placeholder="Ex: Porto, Portugal"
                          disabled={isCreatingSupplier}
                        />
                      </div>
                    </div>

                    {/* Contacto Principal */}
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 sm:p-4">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-300 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Contacto Principal *
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Nome *</label>
                          <input
                            type="text"
                            value={newSupplier.contactos.principal.nome}
                            onChange={(e) => setNewSupplier(prev => ({ 
                              ...prev, 
                              contactos: { 
                                ...prev.contactos, 
                                principal: { ...prev.contactos.principal, nome: e.target.value } 
                              } 
                            }))}
                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg p-2.5 sm:p-3 text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                            placeholder="João Silva"
                            disabled={isCreatingSupplier}
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Email *</label>
                          <input
                            type="email"
                            value={newSupplier.contactos.principal.email}
                            onChange={(e) => setNewSupplier(prev => ({ 
                              ...prev, 
                              contactos: { 
                                ...prev.contactos, 
                                principal: { ...prev.contactos.principal, email: e.target.value } 
                              } 
                            }))}
                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg p-2.5 sm:p-3 text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                            placeholder="contact@empresa.com"
                            disabled={isCreatingSupplier}
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Telefone</label>
                          <input
                            type="tel"
                            value={newSupplier.contactos.principal.telefone}
                            onChange={(e) => setNewSupplier(prev => ({ 
                              ...prev, 
                              contactos: { 
                                ...prev.contactos, 
                                principal: { ...prev.contactos.principal, telefone: e.target.value } 
                              } 
                            }))}
                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg p-2.5 sm:p-3 text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                            placeholder="+351 220 123 456"
                            disabled={isCreatingSupplier}
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Cargo</label>
                          <input
                            type="text"
                            value={newSupplier.contactos.principal.cargo}
                            onChange={(e) => setNewSupplier(prev => ({ 
                              ...prev, 
                              contactos: { 
                                ...prev.contactos, 
                                principal: { ...prev.contactos.principal, cargo: e.target.value } 
                              } 
                            }))}
                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg p-2.5 sm:p-3 text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                            placeholder="Diretor Comercial"
                            disabled={isCreatingSupplier}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Observações */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Observações *</label>
                      <textarea
                        rows={3}
                        value={newSupplier.observacoes}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, observacoes: e.target.value }))}
                        className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2.5 sm:p-3 text-white placeholder-slate-400 resize-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                        placeholder="Observações sobre o fornecedor, histórico, características especiais..."
                        disabled={isCreatingSupplier}
                      />
                    </div>

                    {/* Rating e Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Rating Inicial</label>
                        <select 
                          value={newSupplier.rating}
                          onChange={(e) => setNewSupplier(prev => ({ ...prev, rating: Number(e.target.value) }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2.5 sm:p-3 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                          disabled={isCreatingSupplier}
                        >
                          <option value={0}>Sem avaliação</option>
                          <option value={1}>⭐ (1 estrela)</option>
                          <option value={2}>⭐⭐ (2 estrelas)</option>
                          <option value={3}>⭐⭐⭐ (3 estrelas)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 estrelas)</option>
                          <option value={5}>⭐⭐⭐⭐⭐ (5 estrelas)</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newSupplier.ativo}
                            onChange={(e) => setNewSupplier(prev => ({ ...prev, ativo: e.target.checked }))}
                            className="w-4 h-4 text-purple-600 bg-slate-800 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                            disabled={isCreatingSupplier}
                          />
                          <span className="text-xs sm:text-sm font-medium text-slate-300">Fornecedor Ativo</span>
                        </label>
                      </div>
                    </div>

                    {/* Informações para auditoria */}
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 sm:p-4">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-300 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Informações de Auditoria
                      </h4>
                      <p className="text-xs text-slate-400">
                        Os campos de cadastro, atualização e responsável serão preenchidos automaticamente pelo sistema.
                      </p>
                    </div>

                    {/* Indicador de Loading */}
                    {isCreatingSupplier && (
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                          <span className="text-purple-300 text-xs sm:text-sm">Adicionando fornecedor à plataforma...</span>
                        </div>
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={isCreatingSupplier}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-300 flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        {isCreatingSupplier ? (
                          <>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Adicionando...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Adicionar Fornecedor</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewSupplier({
                            nomeEmpresa: '',
                            observacoes: '',
                            ativo: true,
                            categoriaMercado: '',
                            localizacao: '',
                            rating: 0,
                            contactos: {
                              principal: {
                                nome: '',
                                email: '',
                                telefone: '',
                                cargo: ''
                              }
                            }
                          });
                        }}
                        disabled={isCreatingSupplier}
                        className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Limpar
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePage("suppliers")}
                        disabled={isCreatingSupplier}
                        className="bg-blue-600/50 hover:bg-blue-700/50 border border-blue-600/50 text-blue-300 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Ver Fornecedores</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Dicas para Novos Fornecedores */}
              <div className="mb-6 sm:mb-8">
                <div className="glass-card bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-500/20 p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-white">Dicas para Cadastro</h2>
                      <p className="text-xs sm:text-sm text-slate-200">Boas práticas para adicionar fornecedores</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="min-w-0">
                          <h4 className="text-white font-medium">Informações Completas</h4>
                          <p className="text-slate-400 text-xs">Preencha todos os dados de contato para facilitar comunicação</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="min-w-0">
                          <h4 className="text-white font-medium">Categoria Correta</h4>
                          <p className="text-slate-400 text-xs">Selecione a categoria que melhor representa os produtos/serviços</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="min-w-0">
                          <h4 className="text-white font-medium">Especialidades Detalhadas</h4>
                          <p className="text-slate-400 text-xs">Liste os produtos e serviços específicos oferecidos</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="min-w-0">
                          <h4 className="text-white font-medium">Pessoa de Contato</h4>
                          <p className="text-slate-400 text-xs">Defina um responsável principal para facilitar negociações</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        );
      case "product-search":
        return <ProductSearchPage onNavigateToNewProduct={navigateToNewProduct} />;
      case "suppliers":
        return <SuppliersPage onNewSupplier={navigateToNewSupplier} />;
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
            <button
              onClick={() => setActivePage('dashboard')}
              className="flex items-center space-x-2 sm:space-x-3 min-w-0 hover:opacity-80 transition-opacity duration-200 group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden flex-shrink-0 p-1 group-hover:scale-105 transition-transform duration-200">
                <img src="/RCS.png" alt="RCS Logo" className="w-full h-full object-contain relative z-10" />
              </div>
               
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-dark-primary truncate group-hover:text-blue-400 transition-colors duration-200">
                  SMARTQUOTE
                </h1>
                <p className="text-xs text-dark-secondary font-medium truncate">
                  Painel Administrativo
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
          <button
            onClick={() => setActivePage('dashboard')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200 group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-lg flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-200">
              <img src="/RCS.png" alt="RCS Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-dark-primary text-sm sm:text-base group-hover:text-blue-400 transition-colors duration-200">
              SmartQuote-RCS
            </span>
          </button>
          <div className="w-9 sm:w-10"></div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>

      {/* Toast Notifications Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`transform transition-all duration-500 ease-in-out animate-in slide-in-from-right glass-card backdrop-blur-xl border-2 rounded-2xl p-5 shadow-2xl hover:scale-105 pointer-events-auto ${
              toast.type === "success" 
                ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-50 shadow-emerald-500/20" 
                : toast.type === "error" 
                ? "bg-red-500/15 border-red-400/40 text-red-50 shadow-red-500/20"
                : "bg-cyan-500/15 border-cyan-400/40 text-cyan-50 shadow-cyan-500/20"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  toast.type === "success" 
                    ? "bg-emerald-500/80 ring-2 ring-emerald-400/30" 
                    : toast.type === "error" 
                    ? "bg-red-500/80 ring-2 ring-red-400/30"
                    : "bg-cyan-500/80 ring-2 ring-cyan-400/30"
                }`}>
                  {toast.type === "success" && <Check className="w-5 h-5 text-white" />}
                  {toast.type === "error" && <X className="w-5 h-5 text-white" />}
                  {toast.type === "info" && <Activity className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm leading-tight mb-1">{toast.title}</h4>
                  <p className="text-xs opacity-90 leading-relaxed">{toast.message}</p>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 p-1.5 rounded-full hover:bg-white/15 transition-all duration-200 flex-shrink-0 hover:scale-110"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Progress bar para mostrar tempo restante */}
            <div className={`mt-4 h-1.5 rounded-full overflow-hidden ${
              toast.type === "success" 
                ? "bg-emerald-500/20" 
                : toast.type === "error" 
                ? "bg-red-500/20"
                : "bg-cyan-500/20"
            }`}>
              <div 
                className={`h-full rounded-full transition-all duration-100 ${
                  toast.type === "success" 
                    ? "bg-emerald-400" 
                    : toast.type === "error" 
                    ? "bg-red-400"
                    : "bg-cyan-400"
                }`}
                style={{ 
                  animation: `shrink ${toast.duration || 5000}ms linear forwards`,
                  width: '100%'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* CSS para animação da progress bar */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}