
import { useState, useEffect, useRef } from "react";
import {
  BarChart3,
  FileText,
  Users,
  Settings,
  Activity,
  HelpCircle,
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
  Mail,
  Eye
} from "lucide-react";
import { Separator } from "./ui/separator";
import { DashboardPage } from "./pages/DashboardPage";
import { QuoteRequestsPage } from "./pages/QuoteRequestsPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { LogsPage } from "./pages/LogsPage";
import { LogIn } from "lucide-react";
import { LoginLogsPage } from "./pages/LoginLogsPage";
import { ReportsPage } from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { ProductSearchPage } from "./pages/ProductSearchPage";
import UserManagementPage from "./pages/UserManagementPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { EmailsPage } from "./pages/EmailsPage";
import { ProcessesPage } from "./pages/ProcessesPage";
import { HelpPage } from "./pages/HelpPage";
import { useApp } from "../contexts/AppContext";
import { produtoService, supplierService, dashboardService } from "../api/services";
import { buscaGeralService } from "../services/buscaGeralService";
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useCurrency } from '../hooks/useCurrency';


interface User {
  id: number; // adiciona id para auditoria
  email: string;
  name: string;
  role: string;
  position?: string;
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
  { icon: Mail, label: "navigation.emails", key: "emails" },
  { icon: Activity, label: "navigation.processes", key: "processes" },
];

const adminItems = [
  {
    icon: Users,
    label: "admin.navigation.userManagement",
    key: "user-management",
  },
  { icon: Settings, label: "navigation.settings", key: "settings" },
  { icon: LogIn, label: "admin.navigation.loginLogs", key: "login-logs" },
  {
    icon: HelpCircle,
    label: "admin.navigation.dataManagement",
    key: "help",
  },
];

export function AdminDashboard({
  user,
  onLogout,
}: AdminDashboardProps) {
  const { t } = useTranslation();
  const { systemName } = useApp();
  const { currency, formatCurrency } = useCurrency();
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnboardingMode, setIsOnboardingMode] = useState(false);
  const [newQuotePrompt, setNewQuotePrompt] = useState("");
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);

  // Estado para estatísticas da API
  const [dashboardStats, setDashboardStats] = useState<{
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
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Estado para lista de fornecedores
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  useEffect(() => {
    async function fetchFornecedores() {
      const res = await supplierService.getAll();
      if (res.success && Array.isArray(res.data)) {
        setFornecedores(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setFornecedores(res.data.data);
      }
    }
    fetchFornecedores();
  }, []);

  // Centralização da lógica de acesso e menus

  const PERMISSIONS: {
    [key: string]: {
      main: string[];
      system: string[];
      admin: string[];
      defaultPage: string;
    };
    user: {
      main: string[];
      system: string[];
      admin: string[];
      defaultPage: string;
    };
    manager: {
      main: string[];
      system: string[];
      admin: string[];
      defaultPage: string;
    };
    admin: {
      main: string[];
      system: string[];
      admin: string[];
      defaultPage: string;
    };
  } = {
    user: {
      main: ["quotes", "new-quote", "product-search"],
      system: ["logs", "reports", "notifications", "emails", "processes"],
      admin: ["settings", "help"],
      defaultPage: "quotes"
    },
    manager: {
      main: ["quotes", "new-quote", "product-search", "dashboard", "suppliers"],
      system: ["logs", "reports", "notifications", "emails", "processes"],
      admin: ["settings", "help"],
      defaultPage: "dashboard"
    },
    admin: {
      main: [
        ...mainNavItems.map(i => i.key),
        "new-product"
      ],
      system: systemItems.map(i => i.key),
      admin: adminItems.map(i => i.key),
      defaultPage: "dashboard"
    }
  };

  function getNavConfig(position: string) {
    let role = "user";
    if (position === "admin") role = "admin";
    else if (position === "manager") role = "manager";
    const perms = PERMISSIONS[role];
    return {
      filteredMainNavItems: mainNavItems.filter(item => perms.main.includes(item.key)),
      filteredSystemItems: systemItems.filter(item => perms.system.includes(item.key)),
      filteredAdminItems: adminItems.filter(item => perms.admin.includes(item.key)),
      allowedPages: [...perms.main, ...perms.system, ...perms.admin],
      defaultPage: perms.defaultPage
    };
  }

  const userPosition = user?.position || user?.role || "user";
  const {
    filteredMainNavItems,
    filteredSystemItems,
    filteredAdminItems,
    allowedPages,
    defaultPage
  } = getNavConfig(userPosition);

  // Verificar se é primeira vez do usuário e redirecionar para onboarding
  useEffect(() => {
    if (user?.email) {
      const onboardingKey = `onboarding_completed_${user.email}`;
      const hasCompletedOnboarding = localStorage.getItem(onboardingKey);
      
      if (!hasCompletedOnboarding && activePage !== 'help') {
        setActivePage('help');
        setIsOnboardingMode(true);
      }
    }
  }, [user?.email, activePage]);

  useEffect(() => {
    if (!allowedPages.includes(activePage)) {
      setActivePage(defaultPage);
    }
  }, [activePage, allowedPages, defaultPage]);
  
  // Histórico de cotações criadas
  const [quoteHistory, setQuoteHistory] = useState<Array<{
    id: string;
    message: string;
    timestamp: string;
    quote: any;
  }>>([]);
  
  // Carregar histórico do localStorage ao montar o componente
  useEffect(() => {
    const savedHistory = localStorage.getItem('adminQuoteHistory');
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
    localStorage.setItem('adminQuoteHistory', JSON.stringify(quoteHistory));
  }, [quoteHistory]);

  const [quoteMessage, setQuoteMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    quoteId?: string;
  } | null>(null);
  const [shouldFocusPrompt, setShouldFocusPrompt] = useState(false);
  // Estados para novo produto
  const [newProduct, setNewProduct] = useState({
    fornecedorId: '1', // RCS por padrão (ID 1)
    codigo: '',
    nome: '',
    categoria: '',
    descricao: '',
    preco: 0,
    estoque: 0,
    origem: 'local',
    // cadastrado_por e atualizado_por serão preenchidos automaticamente
    // cadastrado_em será preenchido automaticamente
  });
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Estados para novo fornecedor
  const [newSupplier, setNewSupplier] = useState({
    nome: '',
    contato_email: '',
    contato_telefone: '',
    site: '',
    observacoes: '',
    ativo: true,
    cadastrado_em: '',
    cadastrado_por: user?.id ?? 0,
    atualizado_em: '',
    atualizado_por: user?.id ?? 0,
  });

  // Aplica máscara simples de telefone (ex: +351 90000-0000)
  const formatTelefone = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.startsWith('351')) {
      // Portugal
      if (digits.length <= 3) return '+351 ';
      const rest = digits.slice(3);
      if (rest.length <= 3) return '+351 ' + rest;
      if (rest.length <= 6) return '+351 ' + rest.slice(0,3) + ' ' + rest.slice(3);
      return '+351 ' + rest.slice(0,3) + ' ' + rest.slice(3,6) + '-' + rest.slice(6,10);
    }
    // Genérico
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return '(' + digits.slice(0,2) + ') ' + digits.slice(2);
    return '(' + digits.slice(0,2) + ') ' + digits.slice(2,7) + '-' + digits.slice(7,11);
  };
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
    const requiredFields = ['fornecedorId', 'nome', 'categoria', 'descricao', 'preco', 'estoque'];
    const emptyFields = requiredFields.filter(field => {
      const value = newProduct[field as keyof typeof newProduct];
      if (field === 'fornecedorId') return !value || value === '';
      return !value || (typeof value === 'string' && !value.trim());
    });
    if (emptyFields.length > 0) {
      showToast(
        "error",
        "Campos Obrigatórios",
        "Por favor, preencha todos os campos obrigatórios: Fornecedor, Nome, Categoria, Descrição, Preço e Estoque."
      );
      return;
    }

    // Criar produto através da API
    setIsCreatingProduct(true);

    try {
      // Mapear os campos do formulário para o payload esperado pelo produtoService.create
      const currentDate = new Date().toISOString().replace(/\..+Z$/, '');
      // Obtém id do usuário logado; se não existir aborta (evita violar FK com 0)
      const userIdRaw = (user as any)?.id;
      const userId = typeof userIdRaw === 'number' ? userIdRaw : Number(userIdRaw);
      if (!userId || isNaN(userId)) {
        showToast(
          'error',
          'Sessão inválida',
          'Não foi possível identificar o usuário logado. Faça login novamente.'
        );
        setIsCreatingProduct(false);
        return;
      }
      let origem: 'local' | 'externo' = 'local';
      if (newProduct.origem === 'local' || newProduct.origem === 'externo') {
        origem = newProduct.origem;
      }
      // Só incluir categoria se estiver preenchida
      const productData: any = {
        nome: newProduct.nome,
        descricao: typeof newProduct.descricao === 'string' ? newProduct.descricao : '',
        preco: newProduct.preco,
        estoque: newProduct.estoque,
        fornecedor_id: Number(newProduct.fornecedorId),
        codigo: newProduct.codigo || '',
        categoria: newProduct.categoria || '',
        origem,
        cadastrado_por: userId,
        cadastrado_em: currentDate,
        atualizado_por: userId,
        atualizado_em: currentDate
      };
      const { success, error } = await produtoService.create(productData);
      if (!success) {
        showToast(
          "error",
          "Erro ao Adicionar Produto",
          error || "Ocorreu um erro ao adicionar o produto. Tente novamente."
        );
        setIsCreatingProduct(false);
        return;
      }
      showToast(
        "success",
        "Produto Adicionado com Sucesso",
        `${newProduct.nome} foi adicionado ao catálogo.`
      );
      // Limpar formulário
      setNewProduct({
        fornecedorId: '1', // RCS por padrão (ID 1)
        codigo: '',
        nome: '',
        categoria: '',
        descricao: '',
        preco: 0,
        estoque: 0,
        origem: 'local',
        // cadastrado_por e atualizado_por serão preenchidos automaticamente
        // cadastrado_em será preenchido automaticamente
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
    if (!newSupplier.nome.trim() || !newSupplier.contato_email.trim()) {
      showToast(
        "error",
        "Campos Obrigatórios",
        "Por favor, preencha os campos obrigatórios: Nome e Email de contato."
      );
      return;
    }
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSupplier.contato_email)) {
      showToast(
        "error",
        "Email Inválido",
        "Por favor, insira um endereço de email válido."
      );
      return;
    }

    // Salvar fornecedor
    setIsCreatingSupplier(true);

    try {
      // Criar objeto completo do fornecedor com campos de auditoria
      const currentDate = new Date().toISOString();
      const currentUserIdRaw = (user as any)?.id;
      const currentUserId = typeof currentUserIdRaw === 'number' ? currentUserIdRaw : Number(currentUserIdRaw);
      if (!currentUserId || isNaN(currentUserId)) {
        showToast(
          'error',
          'Sessão inválida',
          'Usuário não identificado. Refaça login antes de cadastrar fornecedor.'
        );
        setIsCreatingSupplier(false);
        return;
      }
      const supplierData = {
        ...newSupplier,
        cadastrado_em: currentDate,
        cadastrado_por: currentUserId,
        atualizado_em: currentDate,
        atualizado_por: currentUserId
      };
  console.log('🛰️ [AdminDashboard] Payload fornecedor antes de addSupplier:', supplierData);
      await addSupplier(supplierData);
      showToast(
        "success",
        "Fornecedor Adicionado com Sucesso",
        `${newSupplier.nome} foi adicionado à lista de fornecedores.`
      );
      // Limpar formulário
      setNewSupplier({
        nome: '',
        contato_email: '',
        contato_telefone: '',
        site: '',
        observacoes: '',
        ativo: true,
        cadastrado_em: '',
        cadastrado_por: currentUserId,
        atualizado_em: '',
        atualizado_por: currentUserId,
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
  const { addQuote, quotes: allQuotes, addSupplier } = useApp();

  // Função para atualizar estatísticas manualmente
  const refreshStats = async () => {
    setIsLoadingStats(true);
    setStatsError(null);

    try {
      // Tentar buscar estatísticas específicas do dashboard
      const statsResponse = await dashboardService.getStats();
      if (statsResponse.success) {
        setDashboardStats(statsResponse.data);
      } else {
        // Fallback: buscar dados individuais e compor estatísticas
        const [quoteStatsResponse, suppliersResponse, productsResponse, userStatsResponse] = await Promise.allSettled([
          dashboardService.getQuoteStats(),
          supplierService.getAll(),
          produtoService.getAll ? produtoService.getAll() : Promise.resolve({ success: false }),
          dashboardService.getUserStats()
        ]);

        // Processar dados das cotações
        let quotesStats = {
          total: allQuotes.length,
          approved: allQuotes.filter(q => q.status === 'approved').length,
          pending: allQuotes.filter(q => q.status === 'pending').length,
          processing: allQuotes.filter(q => q.status === 'processing').length,
          rejected: allQuotes.filter(q => q.status === 'rejected').length,
        };

        if (quoteStatsResponse.status === 'fulfilled' && quoteStatsResponse.value.success) {
          quotesStats = {
            total: quoteStatsResponse.value.data.total || quotesStats.total,
            approved: quoteStatsResponse.value.data.approved || quotesStats.approved,
            pending: quoteStatsResponse.value.data.pending || quotesStats.pending,
            processing: quoteStatsResponse.value.data.processing || quotesStats.processing,
            rejected: quoteStatsResponse.value.data.rejected || quotesStats.rejected,
          };
        }

        // Processar dados dos fornecedores
        let suppliersCount = fornecedores.length;
        if (suppliersResponse.status === 'fulfilled' && suppliersResponse.value.success) {
          const suppliersData = Array.isArray(suppliersResponse.value.data)
            ? suppliersResponse.value.data
            : suppliersResponse.value.data?.data || [];
          suppliersCount = suppliersData.length;
        }

        // Processar dados dos produtos
        let productsCount = 0;
        if (productsResponse.status === 'fulfilled' && productsResponse.value.success) {
          const productsValue = productsResponse.value as any;
          const productsData = Array.isArray(productsValue.data)
            ? productsValue.data
            : productsValue.data?.data || [];
          productsCount = productsData.length;
        }

        // Processar dados dos usuários
        let usersStats = { total: 0, admin: 0, manager: 0, user: 0 };
        if (userStatsResponse.status === 'fulfilled' && userStatsResponse.value.success) {
          usersStats = {
            total: userStatsResponse.value.data.total || 0,
            admin: userStatsResponse.value.data.admin || 0,
            manager: userStatsResponse.value.data.manager || 0,
            user: userStatsResponse.value.data.user || 0,
          };
        }

        setDashboardStats({
          quotes: quotesStats,
          suppliers: {
            total: suppliersCount,
            active: suppliersCount,
            inactive: 0
          },
          products: {
            total: productsCount,
            inStock: productsCount,
            outOfStock: 0
          },
          users: usersStats
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      setStatsError('Erro ao atualizar estatísticas');
      // Fallback final: usar dados locais disponíveis
      setDashboardStats({
        quotes: {
          total: allQuotes.length,
          approved: allQuotes.filter(q => q.status === 'approved').length,
          pending: allQuotes.filter(q => q.status === 'pending').length,
          processing: allQuotes.filter(q => q.status === 'processing').length,
          rejected: allQuotes.filter(q => q.status === 'rejected').length,
        },
        suppliers: { total: fornecedores.length, active: fornecedores.length, inactive: 0 },
        products: { total: 0, inStock: 0, outOfStock: 0 },
        users: { total: 0, admin: 0, manager: 0, user: 0 }
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Buscar estatísticas da API
  useEffect(() => {
    async function fetchDashboardStats() {
      setIsLoadingStats(true);
      setStatsError(null);

      try {
        // Tentar buscar estatísticas específicas do dashboard
        const statsResponse = await dashboardService.getStats();
        if (statsResponse.success) {
          setDashboardStats(statsResponse.data);
        } else {
          // Fallback: buscar dados individuais e compor estatísticas
          const [quoteStatsResponse, suppliersResponse, productsResponse, userStatsResponse] = await Promise.allSettled([
            dashboardService.getQuoteStats(),
            supplierService.getAll(),
            produtoService.getAll ? produtoService.getAll() : Promise.resolve({ success: false }),
            dashboardService.getUserStats()
          ]);

          // Processar dados das cotações
          let quotesStats = {
            total: allQuotes.length,
            approved: allQuotes.filter(q => q.status === 'approved').length,
            pending: allQuotes.filter(q => q.status === 'pending').length,
            processing: allQuotes.filter(q => q.status === 'processing').length,
            rejected: allQuotes.filter(q => q.status === 'rejected').length,
          };

          if (quoteStatsResponse.status === 'fulfilled' && quoteStatsResponse.value.success) {
            quotesStats = {
              total: quoteStatsResponse.value.data.total || quotesStats.total,
              approved: quoteStatsResponse.value.data.approved || quotesStats.approved,
              pending: quoteStatsResponse.value.data.pending || quotesStats.pending,
              processing: quoteStatsResponse.value.data.processing || quotesStats.processing,
              rejected: quoteStatsResponse.value.data.rejected || quotesStats.rejected,
            };
          }

          // Processar dados dos fornecedores
          let suppliersCount = fornecedores.length;
          if (suppliersResponse.status === 'fulfilled' && suppliersResponse.value.success) {
            const suppliersData = Array.isArray(suppliersResponse.value.data)
              ? suppliersResponse.value.data
              : suppliersResponse.value.data?.data || [];
            suppliersCount = suppliersData.length;
          }

          // Processar dados dos produtos
          let productsCount = 0;
          if (productsResponse.status === 'fulfilled' && productsResponse.value.success) {
            const productsValue = productsResponse.value as any; // Type assertion para contornar tipo limitado
            const productsData = Array.isArray(productsValue.data)
              ? productsValue.data
              : productsValue.data?.data || [];
            productsCount = productsData.length;
          }

          // Processar dados dos usuários
          let usersStats = { total: 0, admin: 0, manager: 0, user: 0 };
          if (userStatsResponse.status === 'fulfilled' && userStatsResponse.value.success) {
            usersStats = {
              total: userStatsResponse.value.data.total || 0,
              admin: userStatsResponse.value.data.admin || 0,
              manager: userStatsResponse.value.data.manager || 0,
              user: userStatsResponse.value.data.user || 0,
            };
          }

          setDashboardStats({
            quotes: quotesStats,
            suppliers: {
              total: suppliersCount,
              active: suppliersCount, // Assumir todos ativos por padrão
              inactive: 0
            },
            products: {
              total: productsCount,
              inStock: productsCount, // Assumir todos em stock por padrão
              outOfStock: 0
            },
            users: usersStats
          });
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        setStatsError('Erro ao carregar estatísticas');
        // Fallback final: usar dados locais disponíveis
        setDashboardStats({
          quotes: {
            total: allQuotes.length,
            approved: allQuotes.filter(q => q.status === 'approved').length,
            pending: allQuotes.filter(q => q.status === 'pending').length,
            processing: allQuotes.filter(q => q.status === 'processing').length,
            rejected: allQuotes.filter(q => q.status === 'rejected').length,
          },
          suppliers: { total: fornecedores.length, active: fornecedores.length, inactive: 0 },
          products: { total: 0, inStock: 0, outOfStock: 0 },
          users: { total: 0, admin: 0, manager: 0, user: 0 }
        });
      } finally {
        setIsLoadingStats(false);
      }
    }

    fetchDashboardStats();
  }, [fornecedores, allQuotes]); // Recarregar quando fornecedores ou cotações mudarem

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
        className={`flex items-center space-x-2 p-2 rounded-md w-full text-left transition-all duration-300 ${isActive
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
            onNavigateToQuotes={() => setActivePage("emails")}
            onNavigateToEmails={() => setActivePage("emails")}
            onNavigateToLoginLogs={() => setActivePage("login-logs")}
            onNavigateToNotifications={() => setActivePage("notifications")}
            onRefreshStats={refreshStats}
            dashboardStats={dashboardStats}
            isLoadingStats={isLoadingStats}
            statsError={statsError}
          />
        );
      case "quotes":
        return <QuoteRequestsPage onNavigateToNewQuote={navigateToNewQuote} />;
      case "processes":
        return <ProcessesPage />;
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
                        onClick={async () => {
                          if (newQuotePrompt.trim()) {
                            setIsCreatingQuote(true);
                            setQuoteMessage(null);

                            try {
                              // Usar o serviço de busca geral
                              const result = await buscaGeralService.buscarGeral(newQuotePrompt.trim());
                              console.log('📨 Resposta da API de busca geral (Admin):', result);

                              // Criar cotação com base na resposta da API
                              const newQuote = {
                                id: `RCS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
                                produto: result.data?.produto || `Admin: ${newQuotePrompt.substring(0, 30)}...`,
                                fornecedor: result.data?.fornecedor || "Admin SmartQuote",
                                valor: result.data?.valor || formatCurrency(Math.random() * 10000 + 500),
                                status: "approved" as const,
                                data: new Date().toLocaleDateString('pt-PT'),
                                submittedAt: new Date().toLocaleString('pt-PT'),
                                cliente: user?.name || "Admin",
                                quantidade: result.data?.quantidade || "1 unidade",
                                prioridade: result.data?.prioridade || "high",
                                dataRecebido: new Date().toISOString().split('T')[0],
                                prazoResposta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                responsavel: "Sistema Admin",
                                descricao: result.data?.descricao || newQuotePrompt,
                                observacoes: result.data?.observacoes || ''
                              };

                              addQuote(newQuote);
                              
                              // Adicionar ao histórico
                              const historyEntry = {
                                id: newQuote.id,
                                message: `Cotação ${newQuote.produto} criada com sucesso (Admin)`,
                                timestamp: new Date().toLocaleString('pt-PT'),
                                quote: newQuote
                              };
                              setQuoteHistory(prev => [historyEntry, ...prev]);
                              
                              setQuoteMessage({
                                type: 'success',
                                text: 'Cotação criada com sucesso!',
                                quoteId: newQuote.id
                              });
                              setIsCreatingQuote(false);
                              setNewQuotePrompt("");

                              // Remover a mensagem após 5 segundos
                              setTimeout(() => {
                                setQuoteMessage(null);
                              }, 5000);
                              
                            } catch (error) {
                              console.error('❌ Erro ao fazer busca (Admin):', error);
                              setQuoteMessage({
                                type: 'error',
                                text: 'Erro ao processar solicitação. Tente novamente.'
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
                      <div className={`${quoteMessage.type === 'success'
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
                              <span>Detalhes</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Apenas mensagem de sucesso/erro aqui */}
                  </div>
                </div>
              </div>
        
              {/* Lista de Cotações Criadas - Histórico Real */}
              <div className="mb-8">
                <div className="glass-card bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-500/20 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-500/20 rounded-lg">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-white">Histórico de Cotações Admin</h2>
                        <p className="text-xs sm:text-sm text-slate-200">Últimas cotações criadas pelo admin</p>
                      </div>
                    </div>
                    <div className="bg-slate-500/20 px-3 py-1 rounded-lg">
                      <span className="text-slate-300 text-xs font-medium">{quoteHistory.length} cotações</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {quoteHistory.length > 0 ? (
                      <>
                        {quoteHistory.slice(0, 10).map((entry) => (
                          <div key={entry.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/20 hover:border-slate-500/40 transition-all duration-200">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-green-400 font-mono text-xs">{entry.id}</p>
                                <p className="text-slate-400 text-xs">{entry.timestamp}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="bg-green-500/20 px-2 py-1 rounded">
                                  <span className="text-green-400 text-xs font-medium">Aprovada</span>
                                </div>
                                <button
                                  onClick={() => setActivePage("quotes")}
                                  className="bg-green-600/30 hover:bg-green-600/50 border border-green-500/40 text-green-300 px-3 py-1.5 rounded text-xs transition-all duration-200 flex items-center space-x-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Ver Detalhes</span>
                                </button>
                              </div>
                            </div>
                            <p className="text-white text-sm">{entry.message}</p>
                            {entry.quote && (
                              <div className="mt-2 pt-2 border-t border-slate-600/30">
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <span className="text-slate-400">Produto:</span>
                                    <span className="text-white ml-2">{entry.quote.produto}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Valor:</span>
                                    <span className="text-green-400 ml-2 font-bold">{entry.quote.valor}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center text-slate-400 text-sm py-8">
                        <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma cotação criada ainda.</p>
                        <p className="text-xs mt-1">Use o prompt acima para criar sua primeira cotação.</p>
                      </div>
                    )}
                  </div>

                  {quoteHistory.length > 10 && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
                      <button
                        onClick={() => setActivePage("quotes")}
                        className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm flex items-center space-x-2 mx-auto"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Ver todas as {quoteHistory.length} cotações</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

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
                    {/* Grupo: Dados Básicos */}
                    <div>
                      <h3 className="text-sm font-semibold text-green-300 mb-4">Dados Básicos</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Fornecedor e Código */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Fornecedor *</label>
                            <select
                              value={newProduct.fornecedorId || '1'}
                              onChange={e => setNewProduct(prev => ({ ...prev, fornecedorId: e.target.value }))}
                              className="w-full bg-slate-700 border border-slate-500 rounded-lg p-3 text-slate-400 cursor-not-allowed"
                              required
                              disabled={true}
                              title="Fornecedor fixo: RCS"
                            >
                              <option value="1">RCS</option>
                              {fornecedores && fornecedores.map((f: any) => {
                                const fornecedorId = f.id || f.fornecedorId || f.ID || f._id;
                                if (fornecedorId === 1 || fornecedorId === '1') return null; // Não duplicar RCS
                                return (
                                  <option key={fornecedorId} value={fornecedorId}>
                                    {f.nomeEmpresa || f.nome || fornecedorId}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Código (SKU)</label>
                            <input 
                              type="text" 
                              value={newProduct.codigo || ''} 
                              onChange={e => setNewProduct(prev => ({ ...prev, codigo: e.target.value }))} 
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors" 
                              placeholder="Ex: RCS-001" 
                              disabled={isCreatingProduct} 
                            />
                          </div>
                        </div>

                        {/* Nome e Categoria */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Nome do Produto *</label>
                            <input 
                              type="text" 
                              value={newProduct.nome} 
                              onChange={e => setNewProduct(prev => ({ ...prev, nome: e.target.value }))} 
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors" 
                              placeholder="Ex: Servidor Dell PowerEdge" 
                              required 
                              disabled={isCreatingProduct} 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Categoria *</label>
                            <select
                              value={newProduct.categoria || ''}
                              onChange={e => setNewProduct(prev => ({ ...prev, categoria: e.target.value }))}
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                              required
                              disabled={isCreatingProduct}
                            >
                              <option value="">Selecione a categoria</option>
                              <option value="Hardware de Servidores e Storage">Hardware de Servidores e Storage</option>
                              <option value="Hardware de Posto de Trabalho">Hardware de Posto de Trabalho</option>
                              <option value="Serviços de Cloud">Serviços de Cloud</option>
                              <option value="Networking">Networking</option>
                              <option value="Cibersegurança">Cibersegurança</option>
                              <option value="Videovigilância (CCTV)">Videovigilância (CCTV)</option>
                              <option value="Controle de Acesso">Controle de Acesso</option>
                              <option value="Software de Produtividade e Colaboração">Software de Produtividade e Colaboração</option>
                              <option value="Business Intelligence (BI)">Business Intelligence (BI)</option>
                              <option value="Software de Conformidade (Compliance)">Software de Conformidade (Compliance)</option>
                              <option value="Software de Gestão (ERP/CRM)">Software de Gestão (ERP/CRM)</option>
                              <option value="Automação de Postos de Combustível">Automação de Postos de Combustível</option>
                              <option value="Quiosques e Autoatendimento">Quiosques e Autoatendimento</option>
                              <option value="Internet das Coisas (IoT)">Internet das Coisas (IoT)</option>
                              <option value="Realidade Virtual e Aumentada (VR/AR)">Realidade Virtual e Aumentada (VR/AR)</option>
                              <option value="Soluções para Saúde (Health Tech)">Soluções para Saúde (Health Tech)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-green-700/30" />

                    {/* Grupo: Descrição */}
                    <div>
                      <h3 className="text-sm font-semibold text-green-300 mb-4">Descrição</h3>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Descrição Detalhada *</label>
                        <textarea 
                          rows={3} 
                          value={newProduct.descricao} 
                          onChange={e => setNewProduct(prev => ({ ...prev, descricao: e.target.value }))} 
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors resize-none" 
                          placeholder="Descreva as características, especificações e funcionalidades do produto..." 
                          required 
                          disabled={isCreatingProduct} 
                        />
                      </div>
                    </div>

                    <hr className="border-green-700/30" />

                    {/* Grupo: Preço, Estoque e Origem */}
                    <div>
                      <h3 className="text-sm font-semibold text-green-300 mb-4">Informações Comerciais</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Preço ({currency.symbol}) *</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">{currency.symbol}</span>
                            <input 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              value={newProduct.preco} 
                              onChange={e => setNewProduct(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))} 
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 pl-8 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors" 
                              placeholder="0.00" 
                              required 
                              disabled={isCreatingProduct} 
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Estoque Inicial *</label>
                          <input 
                            type="number" 
                            min="0" 
                            value={newProduct.estoque || 0} 
                            onChange={e => setNewProduct(prev => ({ ...prev, estoque: parseInt(e.target.value) || 0 }))} 
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors" 
                            placeholder="0" 
                            required 
                            disabled={isCreatingProduct} 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Origem</label>
                          <input 
                            type="text" 
                            value="Local" 
                            className="w-full bg-slate-700 border border-slate-500 rounded-lg p-3 text-slate-400 cursor-not-allowed" 
                            disabled={true} 
                            title="Origem fixa: Local" 
                          />
                        </div>
                      </div>
                    </div>

                    <hr className="border-green-700/30" />

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={isCreatingProduct}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-300 text-sm"
                      >
                        {isCreatingProduct ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Adicionando...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Adicionar Produto</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewProduct({
                          fornecedorId: '1', // RCS por padrão (ID 1)
                          codigo: '',
                          nome: '',
                          categoria: '',
                          descricao: '',
                          preco: 0,
                          estoque: 0,
                          origem: 'local',
                        })}
                        disabled={isCreatingProduct}
                        className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 px-6 py-3 rounded-lg font-medium transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Limpar Formulário
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePage("product-search")}
                        disabled={isCreatingProduct}
                        className="bg-blue-600/50 hover:bg-blue-700/50 border border-blue-600/50 text-blue-300 px-6 py-3 rounded-lg font-medium transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Search className="w-4 h-4" />
                        <span>Ver Produtos</span>
                      </button>
                    </div>
                  </form>
                </div> {/* fim bloco mb-8 principal */}
              </div> {/* fechamento da div.mb-8 aberta após comentário Formulário de Novo Produto */}
            </main>
          </div>
        );

  // case "notifications" removido (duplicado) - já tratado mais abaixo
      case "new-supplier":
        return (
          <div className="flex flex-col h-full w-full">
            <header className="bg-dark-bg border-b border-dark-color px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 flex-shrink-0 w-full max-w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 min-w-0 max-w-full flex-wrap">
                <div className="min-w-0 max-w-full break-words">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary truncate flex items-center gap-2 sm:gap-3">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    Novo Fornecedor - Admin
                  </h1>
                  <p className="text-xs sm:text-sm text-dark-secondary mt-1">Adicionar novos fornecedores à plataforma</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap min-w-0 max-w-full">
                  <div className="relative min-w-0">
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
                  <div className="dark-tag text-center sm:text-left flex-shrink-0 text-xs sm:text-sm min-w-0 max-w-full break-words">
                    Gestão de Fornecedores
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 dashboard-main p-3 sm:p-4 lg:p-8 bg-dark-bg overflow-y-auto min-w-0 max-w-full">
              {/* Formulário de Novo Fornecedor */}
              <div className="mb-6 sm:mb-8">
                <div className="glass-card bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/20 p-4 sm:p-6 min-w-0 max-w-full">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6 flex-wrap min-w-0 max-w-full">
                    <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-white">Adicionar Novo Fornecedor</h2>
                      <p className="text-xs sm:text-sm text-purple-200">Preencha os dados do novo fornecedor para a plataforma</p>
                      <p className="text-xs text-yellow-300 mt-1">* Campos obrigatórios</p>
                    </div>
                  </div>
                  <form onSubmit={handleSaveSupplier} className="space-y-4 sm:space-y-6 min-w-0 max-w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 min-w-0 max-w-full">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Nome *</label>
                        <input
                          type="text"
                          value={newSupplier.nome}
                          onChange={e => setNewSupplier(prev => ({ ...prev, nome: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2.5 sm:p-3 text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                          placeholder="Razão social / Nome fantasia"
                          required
                          disabled={isCreatingSupplier}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Email de Contato *</label>
                        <input
                          type="email"
                          value={newSupplier.contato_email}
                          onChange={e => setNewSupplier(prev => ({ ...prev, contato_email: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2.5 sm:p-3 text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                          placeholder="exemplo@fornecedor.com"
                          required
                          disabled={isCreatingSupplier}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Telefone</label>
                        <input
                          type="tel"
                          value={newSupplier.contato_telefone}
                          onChange={e => setNewSupplier(prev => ({ ...prev, contato_telefone: formatTelefone(e.target.value) }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2.5 sm:p-3 text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                          placeholder="(+351) 90000-0000"
                          disabled={isCreatingSupplier}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Site</label>
                        <input
                          type="url"
                          value={newSupplier.site}
                          onChange={e => setNewSupplier(prev => ({ ...prev, site: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2.5 sm:p-3 text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                          placeholder="https://www.fornecedor.com"
                          disabled={isCreatingSupplier}
                        />
                      </div>
                      <div className="lg:col-span-2 min-w-0 max-w-full">
                        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Observações</label>
                        <textarea
                          rows={3}
                          value={newSupplier.observacoes}
                          onChange={e => setNewSupplier(prev => ({ ...prev, observacoes: e.target.value }))}
                          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-2.5 sm:p-3 text-white placeholder-slate-400 resize-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                          placeholder="Observações sobre o fornecedor, histórico, características especiais..."
                          disabled={isCreatingSupplier}
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-2 flex-wrap min-w-0 max-w-full">
                        <input
                          id="supplier-ativo"
                          type="checkbox"
                          checked={newSupplier.ativo}
                          onChange={e => setNewSupplier(prev => ({ ...prev, ativo: e.target.checked }))}
                          className="h-4 w-4 rounded border-slate-600 text-purple-500 focus:ring-purple-500/50 bg-slate-800"
                          disabled={isCreatingSupplier}
                        />
                        <label htmlFor="supplier-ativo" className="text-xs sm:text-sm text-slate-300 select-none">Ativo</label>
                      </div>
                    </div> {/* fecha grid de campos principais */}
                    {/* Campos de auditoria ocultos (preenchidos automaticamente) */}
                    <input type="hidden" value={newSupplier.cadastrado_por} readOnly />
                    <input type="hidden" value={newSupplier.atualizado_por} readOnly />
                    <input type="hidden" value={newSupplier.cadastrado_em} readOnly />
                    <input type="hidden" value={newSupplier.atualizado_em} readOnly />
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
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 flex-wrap min-w-0 max-w-full">
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
                        onClick={() => setNewSupplier({
                          nome: '',
                          contato_email: '',
                          contato_telefone: '',
                          site: '',
                          observacoes: '',
                          ativo: true,
                          cadastrado_em: '',
                          cadastrado_por: user?.id ?? 0,
                          atualizado_em: '',
                          atualizado_por: user?.id ?? 0,
                        })}
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
                <div className="glass-card bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-500/20 p-4 sm:p-6 min-w-0 max-w-full">
                  <div className="flex items-center space-x-3 mb-4 flex-wrap min-w-0 max-w-full">
                    <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-white">Dicas para Cadastro</h2>
                      <p className="text-xs sm:text-sm text-slate-200">Boas práticas para adicionar fornecedores</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm min-w-0 max-w-full">
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
        return <SuppliersPage user={user} />;
      case "notifications":
        return <NotificationsPage />;
      case "emails":
        return <EmailsPage />;
      case "logs":
        return <LogsPage />;
      case "login-logs":
        return <LoginLogsPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      case "user-management":
        return <UserManagementPage />;
      case "help":
        return (
          <HelpPage 
            user={user}
            isOnboarding={isOnboardingMode}
            onNavigateToDashboard={() => {
              setIsOnboardingMode(false);
              setActivePage("dashboard");
            }}
            onNavigateToQuotes={() => {
              setIsOnboardingMode(false);
              setActivePage("quotes");
            }}
            onOnboardingComplete={() => {
              setIsOnboardingMode(false);
            }}
          />
        );
      default:
        return <DashboardPage />;
    }
  }

  // Definições para controle de acesso por posição

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

      {/* Sidebar - Oculta durante onboarding */}
      {!isOnboardingMode && (
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
                  {systemName || 'SMARTQUOTE'}
                </h1>
                <p className="text-xs text-dark-secondary font-medium truncate">
                  Painel Administrativo
                </p>
              </div>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-hover text-dark-secondary flex-shrink-0"
              title="Fechar menu"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 lg:p-4 space-y-4 sm:space-y-5 scrollable-content">
          {/* Main Navigation */}
          <div className="space-y-2">
            {filteredMainNavItems.map((item) =>
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
              {filteredSystemItems.map((item) =>
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
              {filteredAdminItems.map((item) =>
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
              <HelpCircle className="w-3 h-3" />
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
                {userPosition === "admin"
                  ? "Administrador do Sistema"
                  : userPosition === "manager"
                    ? "Gestor"
                    : "Usuário"}
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
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isOnboardingMode ? 'w-full' : ''}`}>
        {/* Mobile Header - Oculto durante onboarding */}
        {!isOnboardingMode && (
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
                {systemName || 'SmartQuote-RCS'}
              </span>
            </button>
            <div className="w-9 sm:w-10"></div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {/* Impede acesso a páginas não permitidas para user comum */}
          {renderContent()}
        </div>
      </div>

      {/* Toast Notifications Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`transform transition-all duration-500 ease-in-out animate-in slide-in-from-right glass-card backdrop-blur-xl border-2 rounded-2xl p-5 shadow-2xl hover:scale-105 pointer-events-auto ${toast.type === "success"
              ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-50 shadow-emerald-500/20"
              : toast.type === "error"
                ? "bg-red-500/15 border-red-400/40 text-red-50 shadow-red-500/20"
                : "bg-cyan-500/15 border-cyan-400/40 text-cyan-50 shadow-cyan-500/20"
              }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${toast.type === "success"
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
                title="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Progress bar para mostrar tempo restante */}
            <div className={`mt-4 h-1.5 rounded-full overflow-hidden ${toast.type === "success"
              ? "bg-emerald-500/20"
              : toast.type === "error"
                ? "bg-red-500/20"
                : "bg-cyan-500/20"
              }`}>
              <div
                className={`h-full rounded-full transition-all duration-100 ${toast.type === "success"
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