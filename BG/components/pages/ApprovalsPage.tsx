import { useState } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { AlertTriangle, CheckCircle, X, Clock, Search, User, Building, Euro } from "lucide-react";

const aprovacoesToMySQLEndentes = [
  {
    id: "RCS-2024-0892",
    cliente: "Energia Verde Lda",
    valor: "€2.450.000",
    motivo: "Excede limite de €2M",
    responsavel: "João Silva",
    prioridade: "high",
    categoria: "Energia Solar",
    fornecedor: "EnerTech Solutions",
    prazo: "2024-01-26",
    submetido: "2024-01-24 14:30",
    descricao: "Solicitação para instalação de sistema solar fotovoltaico de 1.5MW para complexo industrial."
  },
  {
    id: "RCS-2024-0889",
    cliente: "Industrial Power Corp",
    valor: "€1.200.000",
    motivo: "Requisitos complexos de fornecedor",
    responsavel: "Maria Santos",
    prioridade: "medium",
    categoria: "Energia",
    fornecedor: "PowerGen Systems",
    prazo: "2024-01-25",
    submetido: "2024-01-23 16:45",
    descricao: "Aquisição de sistema de backup de energia com geradores e UPS para datacenter."
  },
  {
    id: "RCS-2024-0887",
    cliente: "Energy Solutions Ltd",
    valor: "€3.100.000",
    motivo: "Excede limite de €2M",
    responsavel: "Carlos Mendes",
    prioridade: "high",
    categoria: "Energia Solar",
    fornecedor: "EnerTech Solutions",
    prazo: "2024-01-25",
    submetido: "2024-01-22 10:15",
    descricao: "Projeto de parque solar de 2.5MW com integração à rede elétrica nacional."
  },
  {
    id: "RCS-2024-0885",
    cliente: "TechCorp International",
    valor: "€850.000",
    motivo: "Novo fornecedor não validado",
    responsavel: "Ana Costa",
    prioridade: "medium",
    categoria: "Infraestrutura TI",
    fornecedor: "TechFlow Innovations",
    prazo: "2024-01-27",
    submetido: "2024-01-23 09:20",
    descricao: "Upgrade completo da infraestrutura de TI incluindo servidores e storage."
  }
];

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

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "high":
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    case "medium":
      return <Clock className="w-4 h-4 text-yellow-400" />;
    case "low":
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

export function ApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [responsavelFilter, setResponsavelFilter] = useState("Todos");

  const filteredAprovacoes = aprovacoesToMySQLEndentes.filter((aprovacao) => {
    const matchesSearch = aprovacao.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aprovacao.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aprovacao.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "Todas" || aprovacao.prioridade === priorityFilter;
    const matchesResponsavel = responsavelFilter === "Todos" || aprovacao.responsavel === responsavelFilter;
    
    return matchesSearch && matchesPriority && matchesResponsavel;
  });

  const handleApprove = (id: string) => {
    console.log(`Aprovando cotação ${id}`);
    // Implementar lógica de aprovação
  };

  const handleReject = (id: string) => {
    console.log(`Rejeitando cotação ${id}`);
    // Implementar lógica de rejeição
  };

  const ApprovalCard = ({ aprovacao }: { aprovacao: any }) => (
    <div className="dark-card p-4 border-l-4 border-l-orange-500 hover:border-dark-cta transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0 lg:space-x-6">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {getPriorityIcon(aprovacao.prioridade)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-3">
              <h3 className="font-mono text-sm font-bold text-dark-primary">{aprovacao.id}</h3>
              <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                {getPriorityBadge(aprovacao.prioridade)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-dark-secondary flex-shrink-0" />
                <span className="font-medium text-dark-primary">{aprovacao.cliente}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Euro className="w-4 h-4 text-dark-secondary flex-shrink-0" />
                <span className="text-xl font-bold text-dark-primary">{aprovacao.valor}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-dark-secondary flex-shrink-0" />
                <span className="text-dark-secondary">Responsável: {aprovacao.responsavel}</span>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm font-medium text-orange-400 mb-1">Motivo da Aprovação Manual:</p>
              <p className="text-sm text-dark-secondary">{aprovacao.motivo}</p>
            </div>

            <div className="mt-3">
              <p className="text-sm text-dark-secondary">{aprovacao.descricao}</p>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-dark-secondary">Categoria:</span>
                <span className="text-dark-primary ml-2">{aprovacao.categoria}</span>
              </div>
              <div>
                <span className="text-dark-secondary">Fornecedor:</span>
                <span className="text-dark-primary ml-2">{aprovacao.fornecedor}</span>
              </div>
              <div>
                <span className="text-dark-secondary">Prazo:</span>
                <span className="text-dark-primary ml-2">
                  {new Date(aprovacao.prazo).toLocaleDateString('pt-PT')}
                </span>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <span className="text-dark-secondary">Submetido:</span>
                <span className="text-dark-primary ml-2">
                  {new Date(aprovacao.submetido).toLocaleString('pt-PT')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 min-w-0 lg:min-w-[140px]">
          <Button
            onClick={() => handleApprove(aprovacao.id)}
            className="dark-button-primary flex items-center justify-center space-x-2 px-4 py-2 text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Aprovar</span>
          </Button>
          <Button
            onClick={() => handleReject(aprovacao.id)}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Rejeitar</span>
          </Button>
          <Button
            variant="outline"
            className="dark-button-secondary px-4 py-2 text-sm"
          >
            Ver Detalhes
          </Button>
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
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              Aprovações Pendentes
            </h1>
            <p className="text-xs sm:text-sm text-dark-secondary mt-1">
              Cotações que requerem revisão manual e aprovação
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="dark-tag bg-orange-600 text-center sm:text-left">
              {filteredAprovacoes.length} pendentes
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 lg:p-8 bg-dark-bg">
        {/* Filters */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-secondary" />
              <Input
                placeholder="Pesquisar aprovações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-dark-card border-dark-color text-dark-primary"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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

              <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-dark-card border-dark-color text-dark-primary text-sm">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-dark-color">
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="João Silva">João Silva</SelectItem>
                  <SelectItem value="Maria Santos">Maria Santos</SelectItem>
                  <SelectItem value="Carlos Mendes">Carlos Mendes</SelectItem>
                  <SelectItem value="Ana Costa">Ana Costa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Approvals List */}
        <div className="grid gap-4 lg:gap-6">
          {filteredAprovacoes.map((aprovacao) => (
            <ApprovalCard key={aprovacao.id} aprovacao={aprovacao} />
          ))}
        </div>

        {filteredAprovacoes.length === 0 && (
          <div className="text-center py-8 lg:py-12">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">Nenhuma aprovação pendente</h3>
            <p className="text-sm sm:text-base text-dark-secondary px-4">Todas as cotações foram processadas</p>
          </div>
        )}
      </main>
    </div>
  );
}