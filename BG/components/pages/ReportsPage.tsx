import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FileText, Download, Calendar, TrendingUp, Users, Euro, Activity, Eye } from "lucide-react";

const relatorios = [
  {
    id: "REL-001",
    titulo: "Relatório Mensal de Cotações",
    tipo: "Cotações",
    periodo: "Janeiro 2024",
    status: "Concluído",
    tamanho: "2.4 MB",
    formato: "PDF",
    gerado: "2024-01-24 14:30",
    autor: "Sistema Automático",
    downloads: 15,
    descricao: "Análise completa das cotações processadas durante o mês de Janeiro."
  },
  {
    id: "REL-002",
    titulo: "Performance de Fornecedores Q1",
    tipo: "Fornecedores",
    periodo: "Q1 2024",
    status: "Em Processamento",
    tamanho: "1.8 MB",
    formato: "Excel",
    gerado: "2024-01-24 12:15",
    autor: "Maria Santos",
    downloads: 8,
    descricao: "Avaliação detalhada da performance dos fornecedores no primeiro trimestre."
  },
  {
    id: "REL-003",
    titulo: "Análise de Custos de Procurement",
    tipo: "Financeiro",
    periodo: "2023",
    status: "Concluído",
    tamanho: "3.2 MB",
    formato: "PDF",
    gerado: "2024-01-20 16:45",
    autor: "Carlos Mendes",
    downloads: 23,
    descricao: "Relatório anual de análise de custos e economia obtida através do sistema."
  },
  {
    id: "REL-004",
    titulo: "Métricas de IA e Automação",
    tipo: "Sistema",
    periodo: "Janeiro 2024",
    status: "Concluído",
    tamanho: "1.5 MB",
    formato: "PDF",
    gerado: "2024-01-22 10:30",
    autor: "Sistema Automático",
    downloads: 12,
    descricao: "Performance da inteligência artificial e índices de automação do sistema."
  },
  {
    id: "REL-005",
    titulo: "Auditoria de Aprovações",
    tipo: "Aprovações",
    periodo: "Dezembro 2023",
    status: "Concluído",
    tamanho: "2.1 MB",
    formato: "Excel",
    gerado: "2024-01-15 09:20",
    autor: "João Silva",
    downloads: 6,
    descricao: "Auditoria completa das aprovações manuais e motivos de escalonamento."
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Concluído":
      return <Badge className="bg-green-600 text-white text-xs">Concluído</Badge>;
    case "Em Processamento":
      return <Badge className="bg-blue-600 text-white text-xs">Processando</Badge>;
    case "Erro":
      return <Badge className="bg-red-600 text-white text-xs">Erro</Badge>;
    default:
      return <Badge className="text-xs">{status}</Badge>;
  }
};

const getTypeIcon = (tipo: string) => {
  switch (tipo) {
    case "Cotações":
      return <FileText className="w-4 h-4 text-blue-400" />;
    case "Fornecedores":
      return <Users className="w-4 h-4 text-green-400" />;
    case "Financeiro":
      return <Euro className="w-4 h-4 text-yellow-400" />;
    case "Sistema":
      return <Activity className="w-4 h-4 text-purple-400" />;
    case "Aprovações":
      return <TrendingUp className="w-4 h-4 text-orange-400" />;
    default:
      return <FileText className="w-4 h-4 text-gray-400" />;
  }
};

export function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const filteredRelatorios = relatorios.filter((relatorio) => {
    const matchesSearch = relatorio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         relatorio.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         relatorio.autor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "Todos" || relatorio.tipo === typeFilter;
    const matchesStatus = statusFilter === "Todos" || relatorio.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const RelatorioCard = ({ relatorio }: { relatorio: any }) => (
    <div className="dark-card p-4 hover:border-dark-cta transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0 lg:space-x-6">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            {getTypeIcon(relatorio.tipo)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
              <h3 className="font-bold text-dark-primary text-sm sm:text-base truncate">{relatorio.titulo}</h3>
              <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                {getStatusBadge(relatorio.status)}
                <Badge className="bg-dark-tag text-white text-xs">{relatorio.tipo}</Badge>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-dark-secondary mb-3 break-words">{relatorio.descricao}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-dark-secondary">Período:</span>
                <span className="text-dark-primary ml-2">{relatorio.periodo}</span>
              </div>
              <div>
                <span className="text-dark-secondary">Formato:</span>
                <span className="text-dark-primary ml-2">{relatorio.formato}</span>
              </div>
              <div>
                <span className="text-dark-secondary">Tamanho:</span>
                <span className="text-dark-primary ml-2">{relatorio.tamanho}</span>
              </div>
              <div>
                <span className="text-dark-secondary">Downloads:</span>
                <span className="text-dark-primary ml-2">{relatorio.downloads}</span>
              </div>
              <div className="sm:col-span-2 lg:col-span-2">
                <span className="text-dark-secondary">Gerado:</span>
                <span className="text-dark-primary ml-2">
                  {new Date(relatorio.gerado).toLocaleString('pt-PT')}
                </span>
              </div>
              <div className="sm:col-span-2 lg:col-span-2">
                <span className="text-dark-secondary">Autor:</span>
                <span className="text-dark-primary ml-2">{relatorio.autor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 min-w-0 lg:min-w-[140px]">
          {relatorio.status === "Concluído" && (
            <>
              <Button className="dark-button-primary flex items-center justify-center space-x-2 px-3 py-2 text-sm">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
              <Button className="dark-button-secondary flex items-center justify-center space-x-2 px-3 py-2 text-sm">
                <Eye className="w-4 h-4" />
                <span>Visualizar</span>
              </Button>
            </>
          )}
          {relatorio.status === "Em Processamento" && (
            <Button disabled className="bg-gray-600 text-gray-300 px-3 py-2 text-sm rounded-lg">
              Processando...
            </Button>
          )}
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
              <FileText className="w-6 h-6 text-blue-400" />
              Relatórios
            </h1>
            <p className="text-xs sm:text-sm text-dark-secondary mt-1">
              Acesse e gere relatórios detalhados do sistema
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="dark-tag text-center sm:text-left">
              {filteredRelatorios.length} relatórios
            </div>
            <Button className="dark-button-primary flex items-center justify-center space-x-2 px-4 py-2 text-sm">
              <FileText className="w-4 h-4" />
              <span>Novo Relatório</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 lg:p-8 bg-dark-bg">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="dark-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-dark-primary">28</h3>
                <p className="text-xs sm:text-sm text-dark-secondary truncate">Total de Relatórios</p>
              </div>
            </div>
          </div>
          
          <div className="dark-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-dark-primary">156</h3>
                <p className="text-xs sm:text-sm text-dark-secondary truncate">Downloads este Mês</p>
              </div>
            </div>
          </div>

          <div className="dark-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-600 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-dark-primary">3</h3>
                <p className="text-xs sm:text-sm text-dark-secondary truncate">Em Processamento</p>
              </div>
            </div>
          </div>

          <div className="dark-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-dark-primary">12</h3>
                <p className="text-xs sm:text-sm text-dark-secondary truncate">Automáticos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="relative flex-1 max-w-md">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-secondary" />
              <Input
                placeholder="Pesquisar relatórios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-dark-card border-dark-color text-dark-primary"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-dark-card border-dark-color text-dark-primary text-sm">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-dark-color">
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Cotações">Cotações</SelectItem>
                  <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Sistema">Sistema</SelectItem>
                  <SelectItem value="Aprovações">Aprovações</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-dark-card border-dark-color text-dark-primary text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-dark-color">
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Em Processamento">Processando</SelectItem>
                  <SelectItem value="Erro">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="grid gap-4 lg:gap-6">
          {filteredRelatorios.map((relatorio) => (
            <RelatorioCard key={relatorio.id} relatorio={relatorio} />
          ))}
        </div>

        {filteredRelatorios.length === 0 && (
          <div className="text-center py-8 lg:py-12">
            <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-dark-secondary mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">Nenhum relatório encontrado</h3>
            <p className="text-sm sm:text-base text-dark-secondary px-4">Tente ajustar os filtros de pesquisa</p>
          </div>
        )}
      </main>
    </div>
  );
}