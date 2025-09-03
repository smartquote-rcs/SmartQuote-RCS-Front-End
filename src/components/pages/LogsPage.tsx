import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Activity, AlertCircle, CheckCircle, Info, User, Clock, Eye, Award, Ban } from "lucide-react";
import { cotacaoService } from "../../api/services";

interface LogEntry {
  id: string;
  timestamp: string;
  nivel: string;
  categoria: string;
  usuario: string;
  acao: string;
  detalhes: string;
  ip?: string;
  duracao?: string;
  type?: string;
  motivo?: string;
  cotacaoId?: string;
  cotacaoNumero?: string;
  valor?: number;
  cliente?: string;
}

const getLevelIcon = (nivel: string) => {
  switch (nivel) {
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-200" />;
    case "warning":
      return <AlertCircle className="w-4 h-4 text-amber-200" />;
    case "success":
      return <CheckCircle className="w-4 h-4 text-emerald-200" />;
    case "info":
      return <Info className="w-4 h-4 text-cyan-200" />;
    default:
      return <Activity className="w-4 h-4 text-slate-300" />;
  }
};

const getActionIcon = (type: string) => {
  switch (type) {
    case "cotacao_approved":
      return <Award className="w-4 h-4 text-emerald-300" />;
    case "cotacao_rejected":
      return <Ban className="w-4 h-4 text-red-300" />;
    default:
      return null;
  }
};

const LogCard = ({ log }: { log: LogEntry }) => {
  const getBorderColor = (nivel: string) => {
    switch (nivel) {
      case "error": return "border-l-red-400";
      case "warning": return "border-l-amber-400";
      case "success": return "border-l-emerald-400";
      case "info": return "border-l-cyan-400";
      default: return "border-l-slate-400";
    }
  };

  const isQuoteLog = log.type?.includes('cotacao_');

  return (
    <div className={`glass-card bg-dark-card border border-dark-color rounded-xl border-l-4 ${getBorderColor(log.nivel)} 
                     hover:border-cyan-400/40 transition-all duration-300 group shadow-lg hover:shadow-xl`}>
      
      <div className="p-3 sm:p-4 lg:p-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-3 lg:space-y-0 lg:space-x-4">
          
          {/* Main content */}
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-slate-800/70 to-slate-900/70 border border-slate-500/40 flex items-center justify-center shadow-md backdrop-blur-sm">
                {getLevelIcon(log.nivel)}
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-dark-secondary flex-shrink-0" />
                  <span className="font-mono text-xs sm:text-xs text-dark-secondary font-medium truncate">
                    {log.timestamp || 'Data não disponível'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                </div>
              </div>
              
              {/* Action and details */}
              <div className="mb-3">
                <h4 className="text-sm sm:text-sm font-semibold text-dark-primary-text mb-1 flex items-center space-x-2">
                  <User className="w-3 h-3 text-cyan-300 flex-shrink-0" />
                  <span className="truncate">
                    {isQuoteLog 
                      ? (log.type === 'cotacao_approved' ? 'Cotação Aprovada' : 'Cotação Rejeitada')
                      : (log.acao || 'Ação não definida')
                    }
                  </span>
                  {isQuoteLog && getActionIcon(log.type || '')}
                </h4>
                <p className="text-dark-secondary leading-relaxed text-xs sm:text-xs line-clamp-2 sm:line-clamp-none">
                  {isQuoteLog 
                    ? (log.motivo || 'Motivo não informado')
                    : (log.detalhes || 'Detalhes não disponíveis')
                  }
                </p>
              </div>
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center space-x-1 bg-gradient-to-r from-slate-800/50 to-slate-900/50 px-2 py-1 rounded-md border border-slate-500/50 shadow-sm">
                  <User className="w-3 h-3 text-cyan-200" />
                  <span className="text-slate-100 font-medium text-xs truncate max-w-24 sm:max-w-none">
                    {isQuoteLog 
                      ? `Status: ${log.type === 'cotacao_approved' ? 'true' : 'false'}`
                      : (log.usuario || 'N/A')
                    }
                  </span>
                </div>
                
                {/* Mostrar usuário responsável */}
                {!isQuoteLog && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-700/30 to-cyan-700/30 px-2 py-1 rounded-md border border-blue-500/40 shadow-sm">
                    <span className="text-blue-200">👤</span>
                    <span className="text-blue-100 font-medium text-xs truncate max-w-20 sm:max-w-none">{log.usuario}</span>
                  </div>
                )}
                
                {isQuoteLog && log.cliente && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-700/30 to-cyan-700/30 px-2 py-1 rounded-md border border-blue-500/40 shadow-sm">
                    <span className="text-blue-200">👤</span>
                    <span className="text-blue-100 font-medium text-xs truncate max-w-20 sm:max-w-none">{log.cliente}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action button - better mobile positioning */}
          <div className="flex items-center justify-end lg:justify-start space-x-2 flex-shrink-0 lg:mt-0">
            <button className="opacity-70 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-800/50 rounded-lg border border-transparent hover:border-cyan-400/40">
              <Eye className="w-3 h-3 sm:w-3 sm:h-3 text-slate-400 hover:text-cyan-300 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function LogsPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Carregar logs e cotações quando o componente for montado
  useEffect(() => {
    console.log('LogsPage: useEffect executado');
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('LogsPage: fetchData iniciado');
    setLoading(true);
    setError(null);
    try {
      // Carregar cotações da API
      const cotacoesResult = await cotacaoService.getAll();
      
      console.log('LogsPage: resultado de cotações:', cotacoesResult);
      
      // Processar cotações
      if (cotacoesResult.success && cotacoesResult.data) {
        const cotacoesArr = Array.isArray(cotacoesResult.data?.data) ? cotacoesResult.data.data : [];
        console.log('LogsPage: cotações carregadas:', cotacoesArr.length);

        // Gerar logs para todas as cotações
        const cotacaoLogs: LogEntry[] = cotacoesArr.map((cotacao: any) => {
          const isApproved = cotacao.aprovacao === true;
          const isRejected = cotacao.aprovacao === false;
          
          return {
            id: `cotacao_${cotacao.id}`,
            type: isApproved ? 'cotacao_approved' : (isRejected ? 'cotacao_rejected' : 'cotacao_pending'),
            nivel: isApproved ? 'success' : (isRejected ? 'warning' : 'info'),
            categoria: 'Cotação',
            usuario: cotacao.aprovado_por || cotacao.solicitante || 'Sistema',
            acao: isApproved ? 'Cotação Aprovada' : (isRejected ? 'Cotação Rejeitada' : 'Cotação Pendente'),
            detalhes: cotacao.motivo || (isApproved ? 'Cotação aprovada automaticamente' : (isRejected ? 'Cotação rejeitada' : 'Aguardando aprovação')),
            timestamp: cotacao.data_aprovacao || cotacao.dataRecebido || cotacao.cadastrado_em || new Date().toISOString(),
            cotacaoId: String(cotacao.id),
            cotacaoNumero: cotacao.numero || `COT-${cotacao.id}`,
            motivo: cotacao.motivo,
            valor: parseFloat(cotacao.valor || cotacao.orcamento_geral || '0'),
            cliente: cotacao.cliente || cotacao.nome_cliente || cotacao.solicitante,
            ip: '192.168.1.100',
            duracao: '1.2s'
          };
        });

        setLogs(cotacaoLogs);
      } else {
        console.log('LogsPage: erro ao carregar cotações ou dados vazios');
        setError('Erro ao carregar cotações da API');
        setLogs([]);
      }
      
    } catch (error) {
      console.error('LogsPage: erro na função fetchData:', error);
      setError('Erro ao carregar dados: ' + String(error));
      setLogs([]);
    } finally {
      console.log('LogsPage: fetchData finalizado');
      setLoading(false);
    }
  };

  // Função para filtrar logs com segurança
  const filteredLogs = logs.filter((log) => {
    if (!log || typeof log !== 'object') return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || [
      log.detalhes,
      log.usuario,
      log.acao,
      log.cotacaoNumero,
      log.cliente
    ].some(field => field && field.toLowerCase().includes(searchLower));
    
    return matchesSearch;
  });

  // Paginação
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-5 xl:py-6 flex-shrink-0">
        {/* Uma única linha - Título, subtítulo, busca e paginação */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-dark-primary-text">
                {t('logs.title')}
              </h1>
              <p className="text-dark-secondary text-xs sm:text-sm lg:text-base mt-1">
                {t('logs.subtitle')}
              </p>
            </div>
          </div>

          {/* Pesquisa e paginação - lado direito */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
            {/* Pesquisa */}
            <div className="relative group w-full sm:flex-1 sm:min-w-0 sm:max-w-xs lg:max-w-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/70 group-hover:text-cyan-400 transition-colors duration-200 z-10 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"/></svg>
              <input
                type="text"
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-11 w-full bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-sm sm:text-base"
              />
            </div>
            
            {/* Paginação */}
            <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 font-semibold text-xs sm:text-sm disabled:opacity-50"
                disabled={page === 1}
              >
                <span className="hidden sm:inline">Anterior</span>
                <span className="sm:hidden">‹</span>
              </button>
              <span className="text-slate-300 font-medium text-xs sm:text-sm whitespace-nowrap">
                <span className="hidden sm:inline">Página </span>{page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 font-semibold text-xs sm:text-sm disabled:opacity-50"
                disabled={page === totalPages}
              >
                <span className="hidden sm:inline">Próxima</span>
                <span className="sm:hidden">›</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollable-content dashboard-main p-3 sm:p-4 lg:p-6 xl:p-8 bg-dark-bg max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-140px)] md:max-h-[calc(100vh-160px)] lg:max-h-[calc(100vh-180px)] xl:max-h-[calc(100vh-200px)]">
        {/* Error display */}
        {error && (
          <div className="glass-card bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <h3 className="text-red-300 font-semibold">Erro detectado</h3>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-dark-secondary text-sm sm:text-base">Carregando logs do sistema...</p>
          </div>
        )}

        {/* Lista de logs */}
        {!loading && filteredLogs.length > 0 && (
          <>
            <div className="space-y-3 sm:space-y-4">
              {paginatedLogs.map((log, index) => (
                <LogCard key={log.id || index} log={log} />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && filteredLogs.length === 0 && !error && (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-dark-secondary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-dark-primary-text mb-2">Nenhum log encontrado</h3>
            <p className="text-dark-secondary max-w-md mx-auto text-sm sm:text-base px-4">
              Não há registros que correspondam aos seus critérios de pesquisa.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}