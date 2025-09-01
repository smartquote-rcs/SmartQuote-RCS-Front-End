import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FileText, Download, Calendar, TrendingUp, Users, Euro, Activity, Eye, Search } from "lucide-react";

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
  const { t } = useTranslation();
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
    <div className="glass-card p-4 sm:p-6 lg:p-8 hover:border-dark-cta transition-colors bg-white/5 rounded-2xl border border-white/20">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0 lg:space-x-6">
        <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            {getTypeIcon(relatorio.tipo)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-3">
              <h3 className="font-bold text-dark-primary text-sm sm:text-base lg:text-lg truncate">{relatorio.titulo}</h3>
              <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                {getStatusBadge(relatorio.status)}
                <Badge className="bg-dark-tag text-white text-xs">{relatorio.tipo}</Badge>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-dark-secondary mb-4 break-words line-clamp-2">{relatorio.descricao}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-dark-secondary">Período:</span>
                <span className="text-dark-primary sm:ml-2 truncate">{relatorio.periodo}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-dark-secondary">Formato:</span>
                <span className="text-dark-primary sm:ml-2">{relatorio.formato}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-dark-secondary">Tamanho:</span>
                <span className="text-dark-primary sm:ml-2">{relatorio.tamanho}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-dark-secondary">Downloads:</span>
                <span className="text-dark-primary sm:ml-2">{relatorio.downloads}</span>
              </div>
              <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2 flex flex-col sm:flex-row sm:items-center">
                <span className="text-dark-secondary">Gerado:</span>
                <span className="text-dark-primary sm:ml-2 truncate">
                  {new Date(relatorio.gerado).toLocaleString('pt-PT')}
                </span>
              </div>
              <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2 flex flex-col sm:flex-row sm:items-center">
                <span className="text-dark-secondary">Autor:</span>
                <span className="text-dark-primary sm:ml-2 truncate">{relatorio.autor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-row sm:flex-col lg:flex-col space-x-2 sm:space-x-0 sm:space-y-2 min-w-0 lg:min-w-[140px]">
          {relatorio.status === "Concluído" && (
            <>
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl font-medium flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm transition-all duration-300 hover:scale-105 shadow-lg shadow-green-600/20 flex-1 sm:flex-none">
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl font-medium flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-600/20 flex-1 sm:flex-none">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Visualizar</span>
              </button>
            </>
          )}
          {relatorio.status === "Em Processamento" && (
            <div className="glass-card px-3 py-2 sm:px-4 sm:py-2 bg-orange-500/20 border-orange-500/30 rounded-xl text-center flex-1 sm:flex-none">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 animate-spin mx-auto mb-1" />
              <span className="text-orange-300 text-xs">Processando...</span>
            </div>
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              {t('reports.title')}
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
              {t('reports.subtitle')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="glass-card px-4 py-2 text-center sm:text-left bg-blue-500/20 border-blue-500/30">
              <span className="text-blue-300 font-bold text-lg">{filteredRelatorios.length}</span>
              <span className="text-blue-200 ml-2">{t('reports.title')}</span>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
              <FileText className="w-5 h-5" />
              <span>{t('reports.generateReport')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="glass-card p-4 sm:p-6 lg:p-8 bg-white/5 rounded-2xl border border-white/20">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">28</h3>
                <p className="text-xs sm:text-sm text-dark-secondary truncate">Total de Relatórios</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4 sm:p-6 lg:p-8 bg-white/5 rounded-2xl">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">156</h3>
                <p className="text-xs sm:text-sm text-dark-secondary truncate">Downloads este Mês</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 sm:p-6 lg:p-8 bg-white/5 rounded-2xl">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-orange-600 flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">3</h3>
                <p className="text-xs sm:text-sm text-dark-secondary truncate">Em Processamento</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 sm:p-6 lg:p-8 bg-white/5 rounded-2xl">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">12</h3>
                <p className="text-xs sm:text-sm text-dark-secondary truncate">Automáticos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Pesquisa - sempre visível */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-secondary" />
              <Input
                placeholder="Pesquisar relatórios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtros - ocultos no mobile */}
            <div className="hidden sm:flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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