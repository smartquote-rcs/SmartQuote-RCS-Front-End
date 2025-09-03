import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, Activity, AlertCircle, CheckCircle, Info, User, Clock, Download, Filter, Trash2, RefreshCw, Eye } from "lucide-react";

const logs = [
  {
    id: "LOG-001",
    timestamp: "2024-01-24 15:30:22",
    nivel: "info",
    categoria: "Sistema",
    usuario: "Sistema IA",
    acao: "Processamento de Cotação",
    detalhes: "Cotação RCS-2024-0892 processada automaticamente com sucesso",
    ip: "192.168.1.100",
    duracao: "2.3s"
  },
  {
    id: "LOG-002",
    timestamp: "2024-01-24 15:28:15",
    nivel: "warning",
    categoria: "Aprovação",
    usuario: "João Silva",
    acao: "Cotação Pendente",
    detalhes: "Cotação RCS-2024-0892 enviada para aprovação manual - Excede limite de €2M",
    ip: "192.168.1.105",
    duracao: "0.8s"
  },
  {
    id: "LOG-003",
    timestamp: "2024-01-24 15:25:10",
    nivel: "success",
    categoria: "Fornecedor",
    usuario: "Maria Santos",
    acao: "Validação Concluída",
    detalhes: "Nova validação de fornecedor concluída: TechFlow Solutions",
    ip: "192.168.1.102",
    duracao: "15.2s"
  },
  {
    id: "LOG-004",
    timestamp: "2024-01-24 15:20:45",
    nivel: "error",
    categoria: "Sistema",
    usuario: "Sistema IA",
    acao: "Erro de Processamento",
    detalhes: "Falha na conexão com API do fornecedor EnerTech - Timeout após 30s",
    ip: "192.168.1.100",
    duracao: "30.0s"
  },
  {
    id: "LOG-005",
    timestamp: "2024-01-24 15:18:30",
    nivel: "info",
    categoria: "Usuário",
    usuario: "Carlos Mendes",
    acao: "Login",
    detalhes: "Usuário logou no sistema com sucesso",
    ip: "192.168.1.108",
    duracao: "1.1s"
  },
  {
    id: "LOG-006",
    timestamp: "2024-01-24 15:15:22",
    nivel: "info",
    categoria: "Sistema",
    usuario: "Sistema IA",
    acao: "Backup Automático",
    detalhes: "Backup diário dos dados concluído com sucesso - 2.4GB arquivados",
    ip: "192.168.1.100",
    duracao: "45.7s"
  }
];

const getLevelBadge = (nivel: string) => {
  switch (nivel) {
    case "error":
      return <Badge className="bg-red-600 text-white text-xs">Erro</Badge>;
    case "warning":
      return <Badge className="bg-orange-600 text-white text-xs">Aviso</Badge>;
    case "success":
      return <Badge className="bg-green-600 text-white text-xs">Sucesso</Badge>;
    case "info":
      return <Badge className="bg-blue-600 text-white text-xs">Info</Badge>;
    default:
      return <Badge className="text-xs">{nivel}</Badge>;
  }
};

const getLevelIcon = (nivel: string) => {
  switch (nivel) {
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    case "warning":
      return <AlertCircle className="w-4 h-4 text-orange-400" />;
    case "success":
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case "info":
      return <Info className="w-4 h-4 text-blue-400" />;
    default:
      return <Activity className="w-4 h-4 text-gray-400" />;
  }
};

export function LogsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("Todos");
  const [categoryFilter, setCategoryFilter] = useState("Todas");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.detalhes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.acao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "Todos" || log.nivel === levelFilter;
    const matchesCategory = categoryFilter === "Todas" || log.categoria === categoryFilter;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const LogCard = ({ log }: { log: any }) => {
    const getBorderColor = (nivel: string) => {
      switch (nivel) {
        case "error": return "border-l-red-500";
        case "warning": return "border-l-orange-500";
        case "success": return "border-l-green-500";
        case "info": return "border-l-blue-500";
        default: return "border-l-gray-500";
      }
    };

    return (
      <div className={`glass-card p-3 sm:p-4 lg:p-5 border-l-4 ${getBorderColor(log.nivel)} hover:shadow-lg hover:scale-[1.01] transition-all duration-300 bg-white/5 rounded-2xl border border-white/20 group`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-1">
              {getLevelIcon(log.nivel)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-dark-secondary flex-shrink-0" />
                  <span className="font-mono text-xs sm:text-sm text-dark-primary font-medium truncate">{log.timestamp}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                  {getLevelBadge(log.nivel)}
                  <Badge className="bg-slate-700/50 text-slate-300 text-xs border border-slate-600/30">{log.categoria}</Badge>
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="font-semibold text-dark-primary mb-2 text-sm sm:text-base group-hover:text-blue-400 transition-colors duration-300 line-clamp-1">{log.acao}</h3>
                <p className="text-xs sm:text-sm text-dark-secondary break-words leading-relaxed line-clamp-2">{log.detalhes}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs">
                <div className="flex items-center space-x-2 bg-slate-800/30 rounded-lg p-2">
                  <User className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  <span className="text-slate-400 hidden sm:inline">Usuário:</span>
                  <span className="text-white truncate font-medium">{log.usuario}</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-800/30 rounded-lg p-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 flex-shrink-0"></div>
                  <span className="text-slate-400 hidden sm:inline">IP:</span>
                  <span className="text-white font-mono">{log.ip}</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-800/30 rounded-lg p-2 sm:col-span-2 lg:col-span-1">
                  <Clock className="w-3 h-3 text-green-400 flex-shrink-0" />
                  <span className="text-slate-400 hidden sm:inline">Duração:</span>
                  <span className="text-white font-mono">{log.duracao}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col lg:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-2">
            <span className="font-mono text-xs text-slate-400 bg-slate-800/30 px-2 py-1 rounded flex-1 sm:flex-none text-center">{log.id}</span>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              {t('logs.title')}
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
              {t('logs.subtitle')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="glass-card px-4 py-2 text-center sm:text-left bg-blue-500/20 border-blue-500/30">
              <span className="text-blue-300 font-bold text-lg">{filteredLogs.length}</span>
              <span className="text-blue-200 ml-2">registros</span>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center justify-center space-x-2 text-sm transition-all duration-300 hover:scale-105">
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium flex items-center justify-center space-x-2 text-sm transition-all duration-300 hover:scale-105">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium flex items-center justify-center space-x-2 text-sm transition-all duration-300 hover:scale-105">
                <Trash2 className="w-4 h-4" />
                <span>Limpar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="glass-card p-3 sm:p-4 bg-red-500/10 rounded-xl border border-red-500/20">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-red-400">{logs.filter(log => log.nivel === 'error').length}</h3>
                <p className="text-xs text-red-300 truncate">Erros</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-3 sm:p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-orange-400">{logs.filter(log => log.nivel === 'warning').length}</h3>
                <p className="text-xs text-orange-300 truncate">Avisos</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-3 sm:p-4 bg-green-500/10 rounded-xl border border-green-500/20">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-green-400">{logs.filter(log => log.nivel === 'success').length}</h3>
                <p className="text-xs text-green-300 truncate">Sucessos</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-3 sm:p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Info className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-blue-400">{logs.filter(log => log.nivel === 'info').length}</h3>
                <p className="text-xs text-blue-300 truncate">Informativos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 lg:mb-8">
          <div className="glass-card p-4 bg-white/5 rounded-xl border border-white/20">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-semibold text-white">Filtros de Pesquisa</h3>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Pesquisa - sempre visível */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-secondary z-10" />
                <Input
                  placeholder="Pesquisar nos logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              {/* Filtros - ocultos no mobile */}
              <div className="hidden sm:flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-slate-700/50 border-slate-600 text-white text-sm">
                    <SelectValue placeholder="Nível" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="Todos">Todos os Níveis</SelectItem>
                    <SelectItem value="error">🔴 Erro</SelectItem>
                    <SelectItem value="warning">🟡 Aviso</SelectItem>
                    <SelectItem value="success">🟢 Sucesso</SelectItem>
                    <SelectItem value="info">🔵 Info</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-slate-700/50 border-slate-600 text-white text-sm">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="Todas">Todas as Categorias</SelectItem>
                    <SelectItem value="Sistema">⚙️ Sistema</SelectItem>
                    <SelectItem value="Usuário">👤 Usuário</SelectItem>
                    <SelectItem value="Aprovação">✅ Aprovação</SelectItem>
                    <SelectItem value="Fornecedor">🏢 Fornecedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 force-scroll scrollable-content min-h-0 overflow-y-scroll">
          <div className="grid gap-3 lg:gap-4 min-h-[800px]"> {/* Força altura para scroll */}
            {filteredLogs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 lg:py-12">
              <Activity className="w-10 h-10 sm:w-12 sm:h-12 text-dark-secondary mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">Nenhum log encontrado</h3>
              <p className="text-sm sm:text-base text-dark-secondary px-4">Tente ajustar os filtros de pesquisa</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}