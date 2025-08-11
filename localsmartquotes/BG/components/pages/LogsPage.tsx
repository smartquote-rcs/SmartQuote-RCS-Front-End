import { useState } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, Activity, AlertCircle, CheckCircle, Info, User, Clock } from "lucide-react";

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

  const LogCard = ({ log }: { log: any }) => (
    <div className={`dark-card p-4 border-l-4 ${
      log.nivel === 'error' ? 'border-l-red-500' :
      log.nivel === 'warning' ? 'border-l-orange-500' :
      log.nivel === 'success' ? 'border-l-green-500' : 'border-l-blue-500'
    } hover:border-dark-cta transition-colors`}>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-3 lg:space-y-0 lg:space-x-6">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            {getLevelIcon(log.nivel)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-dark-secondary flex-shrink-0" />
                <span className="font-mono text-xs sm:text-sm text-dark-primary">{log.timestamp}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                {getLevelBadge(log.nivel)}
                <Badge className="bg-dark-tag text-white text-xs">{log.categoria}</Badge>
              </div>
            </div>
            
            <h3 className="font-medium text-dark-primary mb-1 text-sm sm:text-base">{log.acao}</h3>
            <p className="text-xs sm:text-sm text-dark-secondary mb-3 break-words">{log.detalhes}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <User className="w-3 h-3 text-dark-secondary flex-shrink-0" />
                <span className="text-dark-secondary">Usuário:</span>
                <span className="text-dark-primary truncate">{log.usuario}</span>
              </div>
              <div>
                <span className="text-dark-secondary">IP:</span>
                <span className="text-dark-primary ml-2">{log.ip}</span>
              </div>
              <div>
                <span className="text-dark-secondary">Duração:</span>
                <span className="text-dark-primary ml-2">{log.duracao}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <span className="font-mono text-xs text-dark-secondary">{log.id}</span>
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
              <Activity className="w-6 h-6 text-blue-400" />
              Logs do Sistema
            </h1>
            <p className="text-xs sm:text-sm text-dark-secondary mt-1">
              Monitore atividades e eventos do sistema em tempo real
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="dark-tag text-center sm:text-left">
              {filteredLogs.length} registros
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
                placeholder="Pesquisar nos logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-dark-card border-dark-color text-dark-primary"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-dark-card border-dark-color text-dark-primary text-sm">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-dark-color">
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-dark-card border-dark-color text-dark-primary text-sm">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-dark-color">
                  <SelectItem value="Todas">Todas</SelectItem>
                  <SelectItem value="Sistema">Sistema</SelectItem>
                  <SelectItem value="Usuário">Usuário</SelectItem>
                  <SelectItem value="Aprovação">Aprovação</SelectItem>
                  <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="grid gap-3 lg:gap-4">
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
      </main>
    </div>
  );
}
