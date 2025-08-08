import { useState } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, Eye, Download, Mail, Clock, CheckCircle, AlertTriangle, FileText, Building, User, Euro } from "lucide-react";

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
      return <Badge className="bg-green-600 text-white text-xs">Processada</Badge>;
    case "pending_approval":
      return <Badge className="bg-orange-600 text-white text-xs">Pendente</Badge>;
    case "sent":
      return <Badge className="bg-purple-600 text-white text-xs">Enviada</Badge>;
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
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case "pending_approval":
      return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    case "sent":
      return <Mail className="w-4 h-4 text-purple-400" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

export function QuoteRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todas");

  const filteredCotacoes = cotacoes.filter((cotacao) => {
    const matchesSearch = cotacao.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotacao.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotacao.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || cotacao.status === statusFilter;
    const matchesPriority = priorityFilter === "Todas" || cotacao.prioridade === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const QuoteCard = ({ cotacao }: { cotacao: any }) => (
    <div className="glass-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300 group relative">
      {/* Borda lateral de status */}
      <div className={`absolute left-0 top-0 w-1 h-full rounded-l-xl ${
        cotacao.status === 'pending_approval' ? 'bg-orange-500' : 
        cotacao.status === 'processing' ? 'bg-blue-500' : 
        cotacao.status === 'processed' ? 'bg-green-500' : 'bg-purple-500'
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
                <span className="text-slate-300 text-sm">Responsável: <span className="text-white font-medium">{cotacao.responsavel}</span></span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
                <span className="text-slate-400 text-xs block mb-1">Fornecedor:</span>
                <span className="text-white font-medium">{cotacao.fornecedor}</span>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
                <span className="text-slate-400 text-xs block mb-1">Recebido:</span>
                <span className="text-white font-medium">
                  {new Date(cotacao.dataRecebido).toLocaleDateString('pt-PT')}
                </span>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50 col-span-2 lg:col-span-1">
                <span className="text-slate-400 text-xs block mb-1">Prazo:</span>
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
              <span className="text-xs text-green-400 font-medium">Valor</span>
            </div>
            <div className="text-lg font-bold text-green-400">{cotacao.valor}</div>
          </div>
          
          <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
            <button className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none">
              <Eye className="w-3 h-3" />
              <span>Ver</span>
            </button>
            <button className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none">
              <Download className="w-3 h-3" />
              <span>PDF</span>
            </button>
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
              Solicitações de Cotação
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
              Gerencie e acompanhe todas as solicitações de cotação do sistema
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="glass-card px-4 py-2 text-center sm:text-left bg-blue-500/20 border-blue-500/30">
              <span className="text-blue-300 font-bold text-lg">{filteredCotacoes.length}</span>
              <span className="text-blue-200 ml-2">cotações</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
        <Tabs defaultValue="all" className="w-full h-full flex flex-col">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0 flex-shrink-0">
            <TabsList className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 text-sm">
                Todas ({cotacoes.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300 text-sm">
                Pendentes ({cotacoes.filter(c => c.status === 'pending_approval').length})
              </TabsTrigger>
              <TabsTrigger value="processing" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 text-sm">
                Processando ({cotacoes.filter(c => c.status === 'processing').length})
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-secondary" />
                <Input
                  placeholder="Pesquisar cotações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full lg:w-64"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-dark-card border-dark-color text-dark-primary text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-dark-color">
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="processing">Processando</SelectItem>
                    <SelectItem value="processed">Processada</SelectItem>
                    <SelectItem value="pending_approval">Pendente</SelectItem>
                    <SelectItem value="sent">Enviada</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-32 bg-dark-card border-dark-color text-dark-primary text-sm">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-dark-color">
                    <SelectItem value="Todas">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex-1 scrollable-content">
            <TabsContent value="all" className="h-full mt-0">
              <div className="grid gap-4">
                {filteredCotacoes.map((cotacao) => (
                  <QuoteCard key={cotacao.id} cotacao={cotacao} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="h-full mt-0">
              <div className="grid gap-4">
                {cotacoes.filter(c => c.status === 'pending_approval').map((cotacao) => (
                  <QuoteCard key={cotacao.id} cotacao={cotacao} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="processing" className="h-full mt-0">
              <div className="grid gap-4">
                {cotacoes.filter(c => c.status === 'processing').map((cotacao) => (
                  <QuoteCard key={cotacao.id} cotacao={cotacao} />
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