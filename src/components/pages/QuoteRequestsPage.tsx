import { useState } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, Filter, Eye, Download, Mail, Clock, CheckCircle, AlertTriangle } from "lucide-react";

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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">Solicitações de Cotação</h1>
            <p className="text-xs sm:text-sm text-dark-secondary mt-1">
              Gerencie e acompanhe todas as solicitações de cotação do sistema
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="dark-tag text-center sm:text-left">
              {filteredCotacoes.length} cotações
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 lg:p-8 bg-dark-bg">
        <Tabs defaultValue="all" className="w-full h-full flex flex-col">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0 flex-shrink-0">
            <TabsList className="bg-dark-tag border border-dark-color">
              <TabsTrigger value="all" className="data-[state=active]:bg-dark-cta data-[state=active]:text-white text-dark-secondary text-sm">
                Todas ({cotacoes.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-dark-cta data-[state=active]:text-white text-dark-secondary text-sm">
                Pendentes ({cotacoes.filter(c => c.status === 'pending_approval').length})
              </TabsTrigger>
              <TabsTrigger value="processing" className="data-[state=active]:bg-dark-cta data-[state=active]:text-white text-dark-secondary text-sm">
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
                  className="pl-10 w-full lg:w-64 bg-dark-card border-dark-color text-dark-primary"
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

          <div className="flex-1 overflow-auto">
            <TabsContent value="all" className="h-full mt-0">
              <div className="grid gap-4 lg:gap-6">
                {filteredCotacoes.map((cotacao) => (
                  <div key={cotacao.id} className="glass-card p-4 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getStatusIcon(cotacao.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                            <h3 className="font-mono text-sm font-bold text-dark-primary">{cotacao.id}</h3>
                            <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                              {getStatusBadge(cotacao.status)}
                              {getPriorityBadge(cotacao.prioridade)}
                            </div>
                          </div>
                          <div className="space-y-1 text-xs sm:text-sm">
                            <p className="text-dark-primary font-medium">{cotacao.cliente}</p>
                            <p className="text-dark-secondary">{cotacao.produto} - {cotacao.quantidade}</p>
                            <p className="text-dark-secondary">Fornecedor: {cotacao.fornecedor}</p>
                            <p className="text-dark-secondary">Responsável: {cotacao.responsavel}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end space-y-3 sm:space-y-0 sm:space-x-4 lg:text-right">
                        <div>
                          <div className="text-lg sm:text-xl font-bold text-dark-primary">{cotacao.valor}</div>
                          <div className="text-xs text-dark-secondary">
                            Prazo: {new Date(cotacao.prazoResposta).toLocaleDateString('pt-PT')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 rounded-lg bg-dark-tag hover:bg-dark-hover transition-colors">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-dark-secondary" />
                          </button>
                          <button className="p-2 rounded-lg bg-dark-tag hover:bg-dark-hover transition-colors">
                            <Download className="w-3 h-3 sm:w-4 sm:h-4 text-dark-secondary" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="h-full mt-0">
              <div className="grid gap-4 lg:gap-6">
                {cotacoes.filter(c => c.status === 'pending_approval').map((cotacao) => (
                  <div key={cotacao.id} className="glass-card p-4 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getStatusIcon(cotacao.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                            <h3 className="font-mono text-sm font-bold text-dark-primary">{cotacao.id}</h3>
                            <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                              {getStatusBadge(cotacao.status)}
                              {getPriorityBadge(cotacao.prioridade)}
                            </div>
                          </div>
                          <div className="space-y-1 text-xs sm:text-sm">
                            <p className="text-dark-primary font-medium">{cotacao.cliente}</p>
                            <p className="text-dark-secondary">{cotacao.produto} - {cotacao.quantidade}</p>
                            <p className="text-dark-secondary">Fornecedor: {cotacao.fornecedor}</p>
                            <p className="text-dark-secondary">Responsável: {cotacao.responsavel}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end space-y-3 sm:space-y-0 sm:space-x-4 lg:text-right">
                        <div>
                          <div className="text-lg sm:text-xl font-bold text-dark-primary">{cotacao.valor}</div>
                          <div className="text-xs text-dark-secondary">
                            Prazo: {new Date(cotacao.prazoResposta).toLocaleDateString('pt-PT')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 rounded-lg bg-dark-tag hover:bg-dark-hover transition-colors">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-dark-secondary" />
                          </button>
                          <button className="p-2 rounded-lg bg-dark-tag hover:bg-dark-hover transition-colors">
                            <Download className="w-3 h-3 sm:w-4 sm:h-4 text-dark-secondary" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="processing" className="h-full mt-0">
              <div className="grid gap-4 lg:gap-6">
                {cotacoes.filter(c => c.status === 'processing').map((cotacao) => (
                  <div key={cotacao.id} className="glass-card p-4 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getStatusIcon(cotacao.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                            <h3 className="font-mono text-sm font-bold text-dark-primary">{cotacao.id}</h3>
                            <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                              {getStatusBadge(cotacao.status)}
                              {getPriorityBadge(cotacao.prioridade)}
                            </div>
                          </div>
                          <div className="space-y-1 text-xs sm:text-sm">
                            <p className="text-dark-primary font-medium">{cotacao.cliente}</p>
                            <p className="text-dark-secondary">{cotacao.produto} - {cotacao.quantidade}</p>
                            <p className="text-dark-secondary">Fornecedor: {cotacao.fornecedor}</p>
                            <p className="text-dark-secondary">Responsável: {cotacao.responsavel}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end space-y-3 sm:space-y-0 sm:space-x-4 lg:text-right">
                        <div>
                          <div className="text-lg sm:text-xl font-bold text-dark-primary">{cotacao.valor}</div>
                          <div className="text-xs text-dark-secondary">
                            Prazo: {new Date(cotacao.prazoResposta).toLocaleDateString('pt-PT')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 rounded-lg bg-dark-tag hover:bg-dark-hover transition-colors">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-dark-secondary" />
                          </button>
                          <button className="p-2 rounded-lg bg-dark-tag hover:bg-dark-hover transition-colors">
                            <Download className="w-3 h-3 sm:w-4 sm:h-4 text-dark-secondary" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>

          {filteredCotacoes.length === 0 && (
            <div className="text-center py-8 lg:py-12">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 text-dark-secondary mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">Nenhuma cotação encontrada</h3>
              <p className="text-sm sm:text-base text-dark-secondary px-4">Tente ajustar os filtros de pesquisa</p>
            </div>
          )}
        </Tabs>
      </main>
    </div>
  );
}