import { useState } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, Eye, Download, Mail, Clock, CheckCircle, AlertTriangle, FileText, Building, User, Euro, Check, X, Info, Filter, SortAsc, SortDesc } from "lucide-react";
import { useTranslation } from 'react-i18next';

const cotacoes = [
  {
    id: "RCS-2024-0892",
    cliente: "Energia Verde Lda",
    produto: "Painéis Solares 400W",
    quantidade: "150 unidades",
    valor: "€42.750,00",
    status: "pending_approval",
    prioridade: "high",
    fornecedor: "EnerTech Solutions",
    dataRecebido: "2024-01-24",
    prazoResposta: "2024-01-26",
    responsavel: "João Silva"
  },
  {
    id: "RCS-2024-0891",
    cliente: "TechFlow Solutions",
    produto: "Servidores Dell PowerEdge",
    quantidade: "5 unidades",
    valor: "€12.250,00",
    status: "processed",
    prioridade: "medium",
    fornecedor: "TechFlow Innovations",
    dataRecebido: "2024-01-24",
    prazoResposta: "2024-01-25",
    responsavel: "Maria Santos"
  },
  {
    id: "RCS-2024-0890",
    cliente: "Impressões Digitais",
    produto: "Impressoras HP PageWide",
    quantidade: "3 unidades",
    valor: "€5.550,00",
    status: "sent",
    prioridade: "low",
    fornecedor: "PrintMax Industrial",
    dataRecebido: "2024-01-23",
    prazoResposta: "2024-01-24",
    responsavel: "Carlos Mendes"
  },
  {
    id: "RCS-2024-0889",
    cliente: "Industrial Power Corp",
    produto: "Geradores a Diesel",
    quantidade: "2 unidades",
    valor: "€31.000,00",
    status: "processing",
    prioridade: "high",
    fornecedor: "PowerGen Systems",
    dataRecebido: "2024-01-23",
    prazoResposta: "2024-01-25",
    responsavel: "Ana Costa"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "processing":
      return <Badge className="bg-blue-600 text-white text-xs">Processando</Badge>;
    case "processed":
    case "approved":
      return <Badge className="bg-green-600 text-white text-xs">Aprovada</Badge>;
    case "pending_approval":
      return <Badge className="bg-orange-600 text-white text-xs">Pendente</Badge>;
    case "sent":
      return <Badge className="bg-purple-600 text-white text-xs">Enviada</Badge>;
    case "rejected":
      return <Badge className="bg-red-600 text-white text-xs">Rejeitada</Badge>;
    default:
      return <Badge className="text-xs">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return <Badge className="bg-red-500 text-white text-xs">Alta</Badge>;
    case "medium":
      return <Badge className="bg-yellow-500 text-white text-xs">Média</Badge>;
    case "low":
      return <Badge className="bg-green-500 text-white text-xs">Baixa</Badge>;
    default:
      return <Badge className="text-xs">{priority}</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "processing":
      return <Clock className="w-4 h-4 text-blue-400" />;
    case "processed":
    case "approved":
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case "pending_approval":
      return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    case "sent":
      return <Mail className="w-4 h-4 text-purple-400" />;
    case "rejected":
      return <X className="w-4 h-4 text-red-400" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

export function QuoteRequestsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [fornecedorFilter, setFornecedorFilter] = useState("Todos");
  const [dateFilter, setDateFilter] = useState("Todas");
  const [valueFilter, setValueFilter] = useState("Todos");
  const [sortBy, setSortBy] = useState("data");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [cotacoesList, setCotacoesList] = useState(cotacoes);

  // Extrair valores únicos para os filtros
  const uniqueFornecedores = [...new Set(cotacoesList.map(c => c.fornecedor))];
  
  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("Todos");
    setPriorityFilter("Todas");
    setFornecedorFilter("Todos");
    setDateFilter("Todas");
    setValueFilter("Todos");
    setSortBy("data");
    setSortOrder("desc");
  };

  // Função para obter cotações filtradas e ordenadas
  const getFilteredAndSortedCotacoes = () => {
    let filtered = cotacoesList.filter((cotacao) => {
      const matchesSearch = cotacao.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cotacao.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cotacao.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cotacao.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "Todos" || cotacao.status === statusFilter;
      const matchesPriority = priorityFilter === "Todas" || cotacao.prioridade === priorityFilter;
      const matchesFornecedor = fornecedorFilter === "Todos" || cotacao.fornecedor === fornecedorFilter;
      
      // Filtro por data
      let matchesDate = true;
      if (dateFilter !== "Todas") {
        const hoje = new Date();
        const cotacaoDate = new Date(cotacao.dataRecebido);
        switch (dateFilter) {
          case "hoje":
            matchesDate = cotacaoDate.toDateString() === hoje.toDateString();
            break;
          case "semana":
            const inicioSemana = new Date(hoje.setDate(hoje.getDate() - 7));
            matchesDate = cotacaoDate >= inicioSemana;
            break;
          case "mes":
            const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            matchesDate = cotacaoDate >= inicioMes;
            break;
          case "trimestre":
            const inicioTrimestre = new Date(hoje.getFullYear(), Math.floor(hoje.getMonth() / 3) * 3, 1);
            matchesDate = cotacaoDate >= inicioTrimestre;
            break;
        }
      }
      
      // Filtro por valor
      let matchesValue = true;
      if (valueFilter !== "Todos") {
        const valor = parseFloat(cotacao.valor.replace(/[€.,]/g, ''));
        switch (valueFilter) {
          case "baixo":
            matchesValue = valor < 1000;
            break;
          case "medio":
            matchesValue = valor >= 1000 && valor <= 10000;
            break;
          case "alto":
            matchesValue = valor > 10000;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesFornecedor && matchesDate && matchesValue;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "data":
          aValue = new Date(a.dataRecebido).getTime();
          bValue = new Date(b.dataRecebido).getTime();
          break;
        case "valor":
          aValue = parseFloat(a.valor.replace(/[€.,]/g, ''));
          bValue = parseFloat(b.valor.replace(/[€.,]/g, ''));
          break;
        case "cliente":
          aValue = a.cliente.toLowerCase();
          bValue = b.cliente.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "prioridade":
          const prioridadeOrder = { "high": 3, "medium": 2, "low": 1 };
          aValue = prioridadeOrder[a.prioridade as keyof typeof prioridadeOrder] || 0;
          bValue = prioridadeOrder[b.prioridade as keyof typeof prioridadeOrder] || 0;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredCotacoes = getFilteredAndSortedCotacoes();

  // Contar filtros ativos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== "Todos") count++;
    if (priorityFilter !== "Todas") count++;
    if (fornecedorFilter !== "Todos") count++;
    if (dateFilter !== "Todas") count++;
    if (valueFilter !== "Todos") count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const handleApprove = (cotacaoId: string) => {
    setCotacoesList(prev => 
      prev.map(cotacao => 
        cotacao.id === cotacaoId 
          ? { ...cotacao, status: 'approved' }
          : cotacao
      )
    );
    // Aqui poderia adicionar uma notificação de sucesso
    console.log(`Cotação ${cotacaoId} aprovada com sucesso`);
  };

  const handleReject = (cotacaoId: string) => {
    setCotacoesList(prev => 
      prev.map(cotacao => 
        cotacao.id === cotacaoId 
          ? { ...cotacao, status: 'rejected' }
          : cotacao
      )
    );
    // Aqui poderia adicionar uma notificação de rejeição
    console.log(`Cotação ${cotacaoId} rejeitada`);
  };

  const handleViewDetails = (cotacaoId: string) => {
    // Implementar modal de detalhes ou navegação
    console.log('Ver detalhes da cotação:', cotacaoId);
    // Aqui poderia abrir um modal com detalhes completos da cotação
  };

  const QuoteCard = ({ cotacao, onApprove, onReject, onViewDetails }: { 
    cotacao: any; 
    onApprove: (id: string) => void; 
    onReject: (id: string) => void; 
    onViewDetails: (id: string) => void; 
  }) => (
    <div className="glass-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300 group relative">
      {/* Borda lateral de status */}
      <div className={`absolute left-0 top-0 w-1 h-full rounded-l-xl ${
        cotacao.status === 'pending_approval' ? 'bg-orange-500' : 
        cotacao.status === 'processing' ? 'bg-blue-500' : 
        (cotacao.status === 'processed' || cotacao.status === 'approved') ? 'bg-green-500' : 
        cotacao.status === 'rejected' ? 'bg-red-500' : 'bg-purple-500'
      }`}></div>
      
      <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-3 lg:space-y-0 lg:space-x-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            {getStatusIcon(cotacao.status)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
              <h3 className="font-mono text-base font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">{cotacao.id}</h3>
              <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                {getStatusBadge(cotacao.status)}
                {getPriorityBadge(cotacao.prioridade)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-medium text-white text-sm">{cotacao.cliente}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{cotacao.produto} - {cotacao.quantidade}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{t('approvals.responsible')}: <span className="text-white font-medium">{cotacao.responsavel}</span></span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
                <span className="text-slate-400 text-xs block mb-1">{t('dashboard.supplier')}:</span>
                <span className="text-white font-medium">{cotacao.fornecedor}</span>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
                <span className="text-slate-400 text-xs block mb-1">{t('quoteRequests.received')}:</span>
                <span className="text-white font-medium">
                  {new Date(cotacao.dataRecebido).toLocaleDateString('pt-PT')}
                </span>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50 col-span-2 lg:col-span-1">
                <span className="text-slate-400 text-xs block mb-1">{t('approvals.deadline')}:</span>
                <span className="text-white font-medium">
                  {new Date(cotacao.prazoResposta).toLocaleDateString('pt-PT')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Valor e Actions */}
        <div className="flex flex-col space-y-3 min-w-0 lg:min-w-[140px]">
          <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Euro className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-medium">{t('approvals.value')}</span>
            </div>
            <div className="text-lg font-bold text-green-400">{cotacao.valor}</div>
          </div>
          
          <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
            {/* Botões de ação baseados no status */}
            {cotacao.status === 'pending_approval' ? (
              <>
                <button 
                  onClick={() => onApprove(cotacao.id)}
                  className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <Check className="w-3 h-3" />
                  <span>{t('approvals.approve')}</span>
                </button>
                <button 
                  onClick={() => onReject(cotacao.id)}
                  className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <X className="w-3 h-3" />
                  <span>{t('approvals.reject')}</span>
                </button>
                <button 
                  onClick={() => onViewDetails(cotacao.id)}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <Info className="w-3 h-3" />
                  <span>{t('approvals.viewDetails')}</span>
                </button>
              </>
            ) : cotacao.status === 'approved' || cotacao.status === 'processed' ? (
              <>
                <button 
                  onClick={() => onViewDetails(cotacao.id)}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <Eye className="w-3 h-3" />
                  <span>Visualizar</span>
                </button>
                <button className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105">
                  <Download className="w-3 h-3" />
                  <span>PDF</span>
                </button>
                <button 
                  onClick={() => onReject(cotacao.id)}
                  className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-400 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <X className="w-3 h-3" />
                  <span>Cancelar</span>
                </button>
              </>
            ) : cotacao.status === 'rejected' ? (
              <>
                <button 
                  onClick={() => onViewDetails(cotacao.id)}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <Info className="w-3 h-3" />
                  <span>Detalhes</span>
                </button>
                <button 
                  onClick={() => onApprove(cotacao.id)}
                  className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <Check className="w-3 h-3" />
                  <span>Reativar</span>
                </button>
                <button className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none opacity-50 cursor-not-allowed">
                  <Download className="w-3 h-3" />
                  <span>PDF</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onViewDetails(cotacao.id)}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <Eye className="w-3 h-3" />
                  <span>Ver</span>
                </button>
                <button className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105">
                  <Download className="w-3 h-3" />
                  <span>PDF</span>
                </button>
                <button 
                  onClick={() => onApprove(cotacao.id)}
                  className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <Check className="w-3 h-3" />
                  <span>Aprovar</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              {t('quoteRequests.title')}
              {activeFiltersCount > 0 && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                  {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
                </span>
              )}
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
              {t('quoteRequests.subtitle')}
              {activeFiltersCount > 0 && (
                <span className="text-blue-400 ml-2">
                  • {filteredCotacoes.length} de {cotacoesList.length} resultados
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="glass-card px-4 py-2 text-center sm:text-left bg-blue-500/20 border-blue-500/30">
              <span className="text-blue-300 font-bold text-lg">{filteredCotacoes.length}</span>
              <span className="text-blue-200 ml-2">cotações</span>
              {filteredCotacoes.length !== cotacoesList.length && (
                <span className="text-slate-400 text-xs block">de {cotacoesList.length} total</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
        <Tabs defaultValue="all" className="w-full h-full flex flex-col">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0 flex-shrink-0">
            <TabsList className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 text-sm">
                Todas ({cotacoesList.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300 text-sm">
                Pendentes ({cotacoesList.filter(c => c.status === 'pending_approval').length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-slate-300 text-sm">
                Aprovadas ({cotacoesList.filter(c => c.status === 'approved' || c.status === 'processed').length})
              </TabsTrigger>
              <TabsTrigger value="processing" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 text-sm">
                Processando ({cotacoesList.filter(c => c.status === 'processing').length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-300 text-sm">
                Rejeitadas ({cotacoesList.filter(c => c.status === 'rejected').length})
              </TabsTrigger>
            </TabsList>

            {/* Filtros Melhorados */}
            <div className="flex flex-col space-y-4">
              {/* Linha Principal de Filtros */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
                {/* Pesquisa */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-secondary" />
                  <Input
                    placeholder="Pesquisar por cliente, produto, ID ou fornecedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>

                {/* Filtros Básicos */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40 bg-dark-card border-dark-color text-dark-primary text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-card border-dark-color">
                      <SelectItem value="Todos" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">Todos Status</SelectItem>
                      <SelectItem value="pending_approval" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">Pendente Aprovação</SelectItem>
                      <SelectItem value="approved" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">Aprovada</SelectItem>
                      <SelectItem value="processing" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">Processando</SelectItem>
                      <SelectItem value="processed" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">Processada</SelectItem>
                      <SelectItem value="rejected" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">Rejeitada</SelectItem>
                      <SelectItem value="sent" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">Enviada</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-32 bg-dark-card border-dark-color text-dark-primary text-sm">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-card border-dark-color">
                      <SelectItem value="Todas" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">Todas</SelectItem>
                      <SelectItem value="high" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">🔴 Alta</SelectItem>
                      <SelectItem value="medium" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">🟡 Média</SelectItem>
                      <SelectItem value="low" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">🟢 Baixa</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Botão de Filtros Avançados */}
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center space-x-1 font-medium ${
                      showAdvancedFilters 
                        ? 'bg-blue-600/30 border border-blue-500/50 text-blue-400' 
                        : 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300'
                    }`}
                  >
                    <Filter className="w-3 h-3" />
                    <span>{showAdvancedFilters ? 'Menos' : 'Mais'} Filtros</span>
                  </button>
                </div>
              </div>

              {/* Filtros Avançados (Expansíveis) */}
              {showAdvancedFilters && (
                <div className="glass-card bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Filtro por Fornecedor */}
                    <div>
                      <label className="text-slate-300 text-xs font-medium mb-2 block">Fornecedor</label>
                      <Select value={fornecedorFilter} onValueChange={setFornecedorFilter}>
                        <SelectTrigger className="bg-dark-card border-dark-color text-dark-primary text-sm">
                          <SelectValue placeholder="Fornecedor" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-color">
                          <SelectItem value="Todos" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">Todos Fornecedores</SelectItem>
                          {uniqueFornecedores.map(fornecedor => (
                            <SelectItem key={fornecedor} value={fornecedor} className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">{fornecedor}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por Data */}
                    <div>
                      <label className="text-slate-300 text-xs font-medium mb-2 block">Período</label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="bg-dark-card border-dark-color text-dark-primary text-sm">
                          <SelectValue placeholder="Data" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-color">
                          <SelectItem value="Todas" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">Todas as Datas</SelectItem>
                          <SelectItem value="hoje" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">📅 Hoje</SelectItem>
                          <SelectItem value="semana" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">📅 Última Semana</SelectItem>
                          <SelectItem value="mes" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">📅 Último Mês</SelectItem>
                          <SelectItem value="trimestre" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">📅 Último Trimestre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por Valor */}
                    <div>
                      <label className="text-slate-300 text-xs font-medium mb-2 block">Faixa de Valor</label>
                      <Select value={valueFilter} onValueChange={setValueFilter}>
                        <SelectTrigger className="bg-dark-card border-dark-color text-dark-primary text-sm">
                          <SelectValue placeholder="Valor" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-color">
                          <SelectItem value="Todos" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">Todos os Valores</SelectItem>
                          <SelectItem value="baixo" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">💰 Até €1.000</SelectItem>
                          <SelectItem value="medio" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">💰 €1.000 - €10.000</SelectItem>
                          <SelectItem value="alto" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">💰 Acima de €10.000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ordenação */}
                    <div>
                      <label className="text-slate-300 text-xs font-medium mb-2 block">Ordenar Por</label>
                      <div className="flex space-x-1">
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="bg-dark-card border-dark-color text-dark-primary text-sm flex-1">
                            <SelectValue placeholder="Campo" />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-card border-dark-color">
                            <SelectItem value="data" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">📅 Data</SelectItem>
                            <SelectItem value="valor" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">💰 Valor</SelectItem>
                            <SelectItem value="cliente" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">👤 Cliente</SelectItem>
                            <SelectItem value="status" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">📊 Status</SelectItem>
                            <SelectItem value="prioridade" className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white">⚡ Prioridade</SelectItem>
                          </SelectContent>
                        </Select>
                        <button
                          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                          className="bg-dark-card border border-dark-color text-dark-primary px-2 rounded-lg hover:bg-slate-600/50 transition-colors"
                        >
                          {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ações dos Filtros */}
                  <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-slate-700/50 space-y-2 sm:space-y-0">
                    <div className="text-slate-400 text-xs">
                      {filteredCotacoes.length} de {cotacoesList.length} cotações encontradas
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={clearAllFilters}
                        className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 px-3 py-1 text-xs rounded-lg transition-all duration-200"
                      >
                        Limpar Filtros
                      </button>
                      <button
                        onClick={() => setShowAdvancedFilters(false)}
                        className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 px-3 py-1 text-xs rounded-lg transition-all duration-200"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 scrollable-content">
            <TabsContent value="all" className="h-full mt-0">
              <div className="grid gap-4">
                {filteredCotacoes.map((cotacao) => (
                  <QuoteCard 
                    key={cotacao.id} 
                    cotacao={cotacao} 
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="h-full mt-0">
              <div className="grid gap-4">
                {cotacoesList.filter(c => c.status === 'pending_approval').map((cotacao) => (
                  <QuoteCard 
                    key={cotacao.id} 
                    cotacao={cotacao} 
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="approved" className="h-full mt-0">
              <div className="grid gap-4">
                {cotacoesList.filter(c => c.status === 'approved' || c.status === 'processed').map((cotacao) => (
                  <QuoteCard 
                    key={cotacao.id} 
                    cotacao={cotacao} 
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="processing" className="h-full mt-0">
              <div className="grid gap-4">
                {cotacoesList.filter(c => c.status === 'processing').map((cotacao) => (
                  <QuoteCard 
                    key={cotacao.id} 
                    cotacao={cotacao} 
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rejected" className="h-full mt-0">
              <div className="grid gap-4">
                {cotacoesList.filter(c => c.status === 'rejected').map((cotacao) => (
                  <QuoteCard 
                    key={cotacao.id} 
                    cotacao={cotacao} 
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </TabsContent>
          </div>

          {filteredCotacoes.length === 0 && (
            <div className="text-center py-8 lg:py-12">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">Nenhuma cotação encontrada</h3>
              <p className="text-sm sm:text-base text-slate-300 px-4">Tente ajustar os filtros de pesquisa</p>
            </div>
          )}
        </Tabs>
      </main>
    </div>
  );
}