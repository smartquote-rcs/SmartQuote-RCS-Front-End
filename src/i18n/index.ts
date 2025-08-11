import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Definir as traduções inline
const ptTranslations = {
  test: "Teste em Português",
  navigation: {
    dashboard: "Painel Principal",
    productSearch: "Pesquisa de Produtos",
    myQuotes: "Minhas Cotações",
    newQuote: "Nova Cotação",
    history: "Histórico",
    favorites: "Favoritos",
    payments: "Pagamentos",
    appointments: "Agendamentos",
    support: "Suporte",
    notifications: "Notificações",
    settings: "Configurações"
  },
  dashboard: {
    title: "Painel Principal",
    subtitle: "Bem-vindo ao seu painel de controle pessoal",
    activeQuotes: "Cotações Ativas",
    recentQuotes: "Cotações Recentes",
    viewAll: "Ver todas",
    goToNotifications: "Ir para Notificações",
    total: "Total"
  },
  quotes: {
    title: "Minhas Cotações",
    subtitle: "Acompanhe o status das suas solicitações de cotação",
    approved: "Aprovadas",
    pending: "Pendentes",
    processing: "Em Processamento",
    rejected: "Rejeitadas",
    total: "Total",
    update: "Atualizar",
    viewDetails: "Ver Detalhes",
    noQuotesFound: "Nenhuma cotação encontrada",
    noQuotesMessage: "Você ainda não fez nenhuma solicitação de cotação",
    searchProducts: "Buscar Produtos",
    exploreProducts: "Explorar Produtos"
  },
  newQuote: {
    title: "Nova Cotação",
    subtitle: "Crie cotações personalizadas usando IA",
    createWithAI: "Criar Nova Cotação com IA",
    aiDescription: "Descreva o que precisa e nossa IA irá gerar uma cotação personalizada",
    placeholder: "Ex: Preciso de 50 painéis solares de 400W para instalação residencial, incluindo inversores e sistema de montagem. O projeto é para uma residência de 200m² em Lisboa...",
    generate: "Gerar Cotação",
    creating: "Criando Cotação...",
    clear: "Limpar",
    aiAnalyzing: "Nossa IA está analisando sua solicitação e buscando os melhores fornecedores...",
    successMessage: "Cotação criada com sucesso!",
    errorMessage: "Erro ao gerar cotação. Tente novamente em alguns momentos.",
    quoteCreated: "Cotação Criada",
    viewMyQuotes: "Ver Minhas Cotações",
    activeQuotes: "cotações ativas"
  },
  settings: {
    title: "Configurações",
    language: "Idioma",
    selectLanguage: "Selecionar Idioma",
    portuguese: "Português",
    english: "English"
  },
  admin: {
    navigation: {
      dashboard: "Painel Administrativo",
      quotes: "Solicitações de Cotação",
      suppliers: "Fornecedores",
      logs: "Logs do Sistema",
      reports: "Relatórios",
      dataManagement: "Gestão de Dados",
      userManagement: "Gestão de Usuários"
    },
    dashboard: {
      title: "Painel Administrativo",
      subtitle: "Gerencie todo o sistema SmartQuote RCS",
      totalQuotes: "Total de Cotações",
      pendingApprovals: "Aprovações Pendentes",
      activeSuppliers: "Fornecedores Ativos",
      systemAlerts: "Alertas do Sistema",
      adminTools: "Ferramentas Administrativas",
      userManagementDesc: "Criar e gerenciar contas",
      suppliersDesc: "Gerenciar parceiros",
      reportsDesc: "Análises e estatísticas",
      quotesInSystem: "cotações no sistema",
      dataManagementDesc: "Administração avançada de dados do sistema",
      stored: "armazenados",
      storedData: "Dados Armazenados"
    }
  },
  status: {
    pending: "Pendente",
    approved: "Aprovada",
    processing: "Processando",
    rejected: "Rejeitada"
  },
  productSearch: {
    title: "Pesquisa de Produtos",
    subtitle: "Encontre os melhores produtos para suas necessidades",
    searchPlaceholder: "Pesquisar produtos, fornecedores ou categorias...",
    categories: "Categorias",
    allCategories: "Todas as Categorias",
    filters: "Filtros",
    sortBy: "Ordenar por",
    priceRange: "Faixa de Preço",
    supplier: "Fornecedor",
    rating: "Avaliação",
    viewGrid: "Visualização em Grade",
    viewList: "Visualização em Lista",
    addToFavorites: "Adicionar aos Favoritos",
    viewDetails: "Ver Detalhes",
    requestQuote: "Solicitar Cotação",
    popular: "Popular",
    availability: "Disponibilidade",
    category: "Categoria",
    noProducts: "Nenhum produto encontrado",
    specifications: "Especificações",
    reviews: "Avaliações"
  },
  quoteRequests: {
    title: "Solicitações de Cotação",
    subtitle: "Gerencie todas as solicitações de cotação",
    searchPlaceholder: "Pesquisar por ID, cliente ou produto...",
    filters: "Filtros",
    status: "Status",
    priority: "Prioridade",
    dateRange: "Período",
    supplier: "Fornecedor",
    client: "Cliente",
    product: "Produto",
    quantity: "Quantidade",
    value: "Valor",
    receivedDate: "Data Recebida",
    deadline: "Prazo",
    responsible: "Responsável",
    actions: "Ações",
    viewDetails: "Ver Detalhes",
    approve: "Aprovar",
    reject: "Rejeitar",
    download: "Baixar",
    sendEmail: "Enviar Email",
    noQuotes: "Nenhuma cotação encontrada",
    high: "Alta",
    medium: "Média",
    low: "Baixa",
    all: "Todos",
    pendingApproval: "Pendente de Aprovação",
    approved: "Aprovada",
    processing: "Em Processamento",
    rejected: "Rejeitada",
    received: "Recebido"
  },
  approvals: {
    title: "Aprovações Pendentes",
    subtitle: "Revise e aprove solicitações que excedem limites",
    searchPlaceholder: "Pesquisar por ID, cliente ou responsável...",
    approve: "Aprovar",
    reject: "Rejeitar",
    viewDetails: "Ver Detalhes",
    client: "Cliente",
    value: "Valor",
    reason: "Motivo",
    responsible: "Responsável",
    priority: "Prioridade",
    deadline: "Prazo",
    submitted: "Submetido",
    noApprovals: "Nenhuma aprovação pendente",
    high: "Alta",
    medium: "Média",
    low: "Baixa"
  },
  reports: {
    title: "Relatórios e Analytics",
    subtitle: "Análise completa do desempenho do sistema",
    performance: "Desempenho",
    suppliers: "Fornecedores",
    quotes: "Cotações",
    revenue: "Receita",
    generateReport: "Gerar Relatório"
  },
  suppliers: {
    title: "Gestão de Fornecedores",
    subtitle: "Gerencie fornecedores e suas ofertas",
    addSupplier: "Adicionar Fornecedor",
    editSupplier: "Editar Fornecedor",
    active: "Ativo",
    inactive: "Inativo",
    contact: "Contato",
    products: "Produtos",
    rating: "Avaliação"
  },
  logs: {
    title: "Logs do Sistema",
    subtitle: "Monitore a atividade e eventos do sistema",
    searchPlaceholder: "Pesquisar logs...",
    level: "Nível",
    category: "Categoria",
    user: "Usuário",
    action: "Ação",
    timestamp: "Data/Hora",
    details: "Detalhes",
    ip: "IP",
    duration: "Duração",
    exportLogs: "Exportar Logs",
    clearLogs: "Limpar Logs",
    refresh: "Atualizar",
    all: "Todos",
    info: "Info",
    warning: "Aviso",
    error: "Erro",
    success: "Sucesso"
  },
  userManagement: {
    title: "Gerenciamento de Usuários",
    subtitle: "Gerencie contas e permissões de usuários",
    addUser: "Adicionar Usuário",
    editUser: "Editar Usuário",
    deleteUser: "Excluir Usuário",
    searchPlaceholder: "Pesquisar usuários...",
    name: "Nome",
    email: "E-mail",
    phone: "Telefone",
    role: "Função",
    department: "Departamento",
    status: "Status",
    lastLogin: "Último Login",
    createdAt: "Criado em",
    active: "Ativo",
    inactive: "Inativo",
    admin: "Administrador",
    manager: "Gerente",
    user: "Usuário",
    save: "Salvar",
    cancel: "Cancelar",
    confirmDelete: "Confirmar Exclusão",
    deleteConfirmMessage: "Tem certeza que deseja excluir este usuário?",
    permissions: "Permissões"
  },
  notifications: {
    title: "Notificações",
    subtitle: "Gerencie suas notificações e alertas",
    markAllRead: "Marcar todas como lidas",
    markAsRead: "Marcar como lida",
    delete: "Excluir",
    searchPlaceholder: "Pesquisar notificações...",
    all: "Todas",
    unread: "Não lidas",
    read: "Lidas",
    category: "Categoria",
    timestamp: "Data/Hora",
    type: "Tipo",
    message: "Mensagem"
  }
};

const enTranslations = {
  test: "Test in English",
  navigation: {
    dashboard: "Main Dashboard",
    productSearch: "Product Search",
    myQuotes: "My Quotes",
    newQuote: "New Quote",
    history: "History",
    favorites: "Favorites",
    payments: "Payments",
    appointments: "Appointments",
    support: "Support",
    notifications: "Notifications",
    settings: "Settings"
  },
  dashboard: {
    title: "Main Dashboard",
    subtitle: "Welcome to your personal control panel",
    activeQuotes: "Active Quotes",
    recentQuotes: "Recent Quotes",
    viewAll: "View all",
    goToNotifications: "Go to Notifications",
    total: "Total"
  },
  quotes: {
    title: "My Quotes",
    subtitle: "Track the status of your quote requests",
    approved: "Approved",
    pending: "Pending",
    processing: "Processing",
    rejected: "Rejected",
    total: "Total",
    update: "Update",
    viewDetails: "View Details",
    noQuotesFound: "No quotes found",
    noQuotesMessage: "You haven't made any quote requests yet",
    searchProducts: "Search Products",
    exploreProducts: "Explore Products"
  },
  newQuote: {
    title: "New Quote",
    subtitle: "Create personalized quotes using AI",
    createWithAI: "Create New Quote with AI",
    aiDescription: "Describe what you need and our AI will generate a personalized quote",
    placeholder: "Ex: I need 50 solar panels of 400W for residential installation, including inverters and mounting system. The project is for a 200m² residence in Lisbon...",
    generate: "Generate Quote",
    creating: "Creating Quote...",
    clear: "Clear",
    aiAnalyzing: "Our AI is analyzing your request and searching for the best suppliers...",
    successMessage: "Quote created successfully!",
    errorMessage: "Error generating quote. Please try again in a few moments.",
    quoteCreated: "Quote Created",
    viewMyQuotes: "View My Quotes",
    activeQuotes: "active quotes"
  },
  settings: {
    title: "Settings",
    language: "Language",
    selectLanguage: "Select Language",
    portuguese: "Português",
    english: "English"
  },
  admin: {
    navigation: {
      dashboard: "Administrative Panel",
      quotes: "Quote Requests",
      suppliers: "Suppliers",
      logs: "System Logs",
      reports: "Reports",
      dataManagement: "Data Management",
      userManagement: "User Management"
    },
    dashboard: {
      title: "Administrative Panel",
      subtitle: "Manage the entire SmartQuote RCS system",
      totalQuotes: "Total Quotes",
      pendingApprovals: "Pending Approvals",
      activeSuppliers: "Active Suppliers",
      systemAlerts: "System Alerts",
      adminTools: "Administrative Tools",
      userManagementDesc: "Create and manage accounts",
      suppliersDesc: "Manage partners",
      reportsDesc: "Analytics and statistics",
      quotesInSystem: "quotes in system",
      dataManagementDesc: "Advanced system data administration",
      stored: "stored",
      storedData: "Stored Data"
    }
  },
  status: {
    pending: "Pending",
    approved: "Approved",
    processing: "Processing",
    rejected: "Rejected"
  },
  productSearch: {
    title: "Product Search",
    subtitle: "Find the best products for your needs",
    searchPlaceholder: "Search products, suppliers or categories...",
    categories: "Categories",
    allCategories: "All Categories",
    filters: "Filters",
    sortBy: "Sort by",
    priceRange: "Price Range",
    supplier: "Supplier",
    rating: "Rating",
    viewGrid: "Grid View",
    viewList: "List View",
    addToFavorites: "Add to Favorites",
    viewDetails: "View Details",
    requestQuote: "Request Quote",
    popular: "Popular",
    availability: "Availability",
    category: "Category",
    noProducts: "No products found",
    specifications: "Specifications",
    reviews: "Reviews"
  },
  quoteRequests: {
    title: "Quote Requests",
    subtitle: "Manage all quote requests",
    searchPlaceholder: "Search by ID, client or product...",
    filters: "Filters",
    status: "Status",
    priority: "Priority",
    dateRange: "Date Range",
    supplier: "Supplier",
    client: "Client",
    product: "Product",
    quantity: "Quantity",
    value: "Value",
    receivedDate: "Received Date",
    deadline: "Deadline",
    responsible: "Responsible",
    actions: "Actions",
    viewDetails: "View Details",
    approve: "Approve",
    reject: "Reject",
    download: "Download",
    sendEmail: "Send Email",
    noQuotes: "No quotes found",
    high: "High",
    medium: "Medium",
    low: "Low",
    all: "All",
    pendingApproval: "Pending Approval",
    approved: "Approved",
    processing: "Processing",
    rejected: "Rejected",
    received: "Received"
  },
  approvals: {
    title: "Pending Approvals",
    subtitle: "Review and approve requests that exceed limits",
    searchPlaceholder: "Search by ID, client or responsible...",
    approve: "Approve",
    reject: "Reject",
    viewDetails: "View Details",
    client: "Client",
    value: "Value", 
    reason: "Reason",
    responsible: "Responsible",
    priority: "Priority",
    deadline: "Deadline",
    submitted: "Submitted",
    noApprovals: "No pending approvals",
    high: "High",
    medium: "Medium",
    low: "Low"
  },
  reports: {
    title: "Reports and Analytics",
    subtitle: "Complete system performance analysis",
    performance: "Performance",
    suppliers: "Suppliers",
    quotes: "Quotes",
    revenue: "Revenue",
    generateReport: "Generate Report"
  },
  suppliers: {
    title: "Supplier Management",
    subtitle: "Manage suppliers and their offers",
    addSupplier: "Add Supplier",
    editSupplier: "Edit Supplier",
    active: "Active",
    inactive: "Inactive",
    contact: "Contact",
    products: "Products",
    rating: "Rating"
  },
  logs: {
    title: "System Logs",
    subtitle: "Monitor system activity and events",
    searchPlaceholder: "Search logs...",
    level: "Level",
    category: "Category",
    user: "User",
    action: "Action",
    timestamp: "Timestamp",
    details: "Details",
    ip: "IP",
    duration: "Duration",
    exportLogs: "Export Logs",
    clearLogs: "Clear Logs",
    refresh: "Refresh",
    all: "All",
    info: "Info",
    warning: "Warning",
    error: "Error",
    success: "Success"
  },
  userManagement: {
    title: "User Management",
    subtitle: "Manage user accounts and permissions",
    addUser: "Add User",
    editUser: "Edit User",
    deleteUser: "Delete User",
    searchPlaceholder: "Search users...",
    name: "Name",
    email: "Email",
    phone: "Phone",
    role: "Role",
    department: "Department",
    status: "Status",
    lastLogin: "Last Login",
    createdAt: "Created at",
    active: "Active",
    inactive: "Inactive",
    admin: "Administrator",
    manager: "Manager",
    user: "User",
    save: "Save",
    cancel: "Cancel",
    confirmDelete: "Confirm Deletion",
    deleteConfirmMessage: "Are you sure you want to delete this user?",
    permissions: "Permissions"
  },
  notifications: {
    title: "Notifications",
    subtitle: "Manage your notifications and alerts",
    markAllRead: "Mark all as read",
    markAsRead: "Mark as read",
    delete: "Delete",
    searchPlaceholder: "Search notifications...",
    all: "All",
    unread: "Unread",
    read: "Read",
    category: "Category",
    timestamp: "Timestamp",
    type: "Type",
    message: "Message"
  }
};

const resources = {
  pt: {
    translation: ptTranslations
  },
  en: {
    translation: enTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    debug: false, // Desativando debug
    
    interpolation: {
      escapeValue: false, // react already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    react: {
      useSuspense: false, // Desabilitar suspense para evitar problemas
    }
  });

// Forçar carregamento do idioma salvo
const savedLanguage = localStorage.getItem('i18nextLng');
if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'en')) {
  i18n.changeLanguage(savedLanguage);
}

export default i18n;
