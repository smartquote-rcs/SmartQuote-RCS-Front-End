import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Clock, 
  Eye, 
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Trash2,
  Building,
  AlertTriangle,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ProcessDetailsPage } from './ProcessDetailsPage';
import { jobService } from '../../api/services';
import { API_BASE_URL } from '../../api/client';

interface QuoteJob {
  id: string;
  status: 'pendente' | 'EXECUTANDO' | 'concluido' | 'erro' | 'cancelado';
  criadoEm: string;
  iniciadoEm?: string;
  concluidoEm?: string;
  parametros: {
    termo: string;
    numResultados: number;
    fornecedores: number[];
    usuarioId: number;
    custo_beneficio?: any;
    rigor?: number;
    refinamento?: boolean;
    salvamento?: boolean;
    urls_add?: string[];
  };
  progresso?: {
    etapa: string;
    produtos: number;
    detalhes: string;
  };
  resultado?: {
    relatorio?: any;
    produtos: Array<{
      name: string;
      price: string;
      image_url: string;
      description: string;
      product_url: string;
    }>;
    salvamento: {
      salvos: number;
      erros: number;
      detalhes: Array<{
        fornecedor: string;
        fornecedor_id: number;
        salvos: number;
        erros: number;
        detalhes: Array<{
          produto: string;
          status: string;
          id: number;
          preco_centavos: number;
        }>;
      }>;
    };
    tempoExecucao: number;
  };
}


// Função para buscar jobs da API
async function fetchJobs(): Promise<QuoteJob[]> {
  try {
  const response = await fetch(`${API_BASE_URL}/busca-automatica/jobs/`);
    if (!response.ok) throw new Error('Erro ao buscar processos');
    const data = await response.json();
    
    // A API retorna { success: true, message: "X jobs encontrados", jobs: [...] }
    if (data.success && data.jobs) {
      return data.jobs;
    }
    return [];
  } catch (e) {
    console.error('Erro ao buscar jobs:', e);
    return [];
  }
}

interface ProcessesPageProps {
  isLight?: boolean;
}

export function ProcessesPage({ isLight = false }: ProcessesPageProps = {}) {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<QuoteJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<QuoteJob[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const deleteJob = async (jobId: string) => {
    const res = await jobService.deleteJobById(jobId);
    if (res.success) {
      setJobs(jobs.filter(j => j.id !== jobId));
      setShowDeleteConfirm(null);
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
        setViewMode('list');
      }
    } else {
      alert(res.error || 'Erro ao deletar processo.');
    }
  };

  const viewJobDetails = (jobId: string) => {
    console.log('Abrindo detalhes para job:', jobId);
    setSelectedJobId(jobId);
    setViewMode('details');
  };

  const backToList = () => {
    setSelectedJobId(null);
    setViewMode('list');
  };

  // Renderização principal da página (sempre mostra a lista)


  // Atualiza jobs periodicamente (real time)
  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;

    const updateJobs = async () => {
      const apiJobs = await fetchJobs();
      if (isMounted) setJobs(apiJobs);
    };
    updateJobs();
    interval = setInterval(updateJobs, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Filtra jobs por status
  useEffect(() => {
    let filtered = jobs;
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }
    setFilteredJobs(filtered);
    
    // Reset da página quando filtros mudam
    setCurrentPage(1);
  }, [jobs, statusFilter]);

  const getStatusColor = (status: QuoteJob['status']) => {
    if (isLight) {
      switch (status) {
        case 'EXECUTANDO':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'pendente':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'concluido':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'erro':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'cancelado':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else {
      switch (status) {
        case 'EXECUTANDO':
          return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        case 'pendente':
          return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        case 'concluido':
          return 'bg-green-500/20 text-green-300 border-green-500/30';
        case 'erro':
          return 'bg-red-500/20 text-red-300 border-red-500/30';
        case 'cancelado':
          return 'bg-red-500/20 text-red-300 border-red-500/30';
        default:
          return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      }
    }
  };

  const getStatusIcon = (status: QuoteJob['status']) => {
    switch (status) {
      case 'EXECUTANDO':
        return <Clock className="h-4 w-4" />;
      case 'pendente':
        return <AlertCircle className="h-4 w-4" />;
      case 'concluido':
        return <CheckCircle className="h-4 w-4" />;
      case 'erro':
        return <XCircle className="h-4 w-4" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className={`flex flex-col h-screen ${isLight ? 'bg-gray-50' : 'bg-slate-900'}`}>
      <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
            {t("processes.title")}
          </h1>
          <p className={`text-sm sm:text-base ${isLight ? 'text-gray-600' : 'text-slate-400'} mt-1`}>
            {t("processes.subtitle")}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex flex-col w-full sm:w-auto">
          <label className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-white'} mb-1`}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base w-full sm:w-48 ${
              isLight 
                ? 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500' 
                : 'border-slate-600 bg-slate-800 text-white focus:ring-blue-500 focus:border-blue-500'
            }`}
          >
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="executando">Em Andamento</option>
            <option value="concluido">Concluído</option>
            <option value="erro">Erro</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>


      {/* Paginação e Estatísticas */}
      {filteredJobs.length > 0 && (
        <div className="flex items-center items-center justify-between gap-2 py-1">
          <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-slate-400'}`}>
            Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredJobs.length)} a{' '}
            {Math.min(currentPage * itemsPerPage, filteredJobs.length)} de {filteredJobs.length} processos
          </div>
          
          {Math.ceil(filteredJobs.length / itemsPerPage) > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`${
                  isLight 
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50' 
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50'
                }`}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(filteredJobs.length / itemsPerPage) }, (_, i) => i + 1)
                  .filter(page => {
                    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (page >= currentPage - 2 && page <= currentPage + 2) return true;
                    return false;
                  })
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page > prevPage + 1;
                    
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsis && (
                          <span className={`px-2 ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[36px] h-8 ${
                            currentPage === page
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : isLight
                                ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredJobs.length / itemsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(filteredJobs.length / itemsPerPage)}
                className={`${
                  isLight 
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50' 
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50'
                }`}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Lista de Processos */}
      <div className="overflow-y-auto max-h-[calc(100vh-400px)] px-2">
        {filteredJobs.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-96 ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
            <Package className={`h-10 w-10 mb-4 ${isLight ? 'text-gray-400' : 'text-slate-500'}`} />
            <span className="text-lg font-semibold">Nenhum processo encontrado</span>
            <span className="text-sm mt-2">Nenhum processo de cotação foi encontrado no momento.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
            {filteredJobs
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((job) => {
          const produtos = job.resultado?.produtos || [];
          
          return (
            <Card key={job.id} className={`border transition-all duration-300 h-fit
  ${isLight
    ? 'bg-white/90 border-gray-200/60 hover:border-blue-400/80 hover:shadow-lg hover:bg-white'
    : 'bg-slate-800/60 border-slate-700/50 hover:border-blue-400/60 hover:shadow-xl hover:shadow-blue-400/20 backdrop-blur-sm'}
`}>
              <div className="p-3 space-y-3">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-mono px-2 py-1 rounded ${isLight ? 'bg-gray-100 text-gray-600' : 'bg-slate-700/50 text-slate-300'}`}>{job.id.substring(0, 8)}</span>
                    </div>
                    <h3 className={`font-semibold mb-1 line-clamp-1 text-sm truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {job.parametros.termo}
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                      {new Date(job.criadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 flex-shrink-0 ${
                    isLight ? 'text-gray-500 hover:text-gray-900' : 'text-slate-400 hover:text-white'
                  }`}>
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>

                {/* Status */}
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(job.status)} text-xs flex items-center gap-1 flex-shrink-0`}>
                      {getStatusIcon(job.status)}
                      <span className="hidden sm:inline">{job.status.replace('-', ' ').toUpperCase()}</span>
                      <span className="sm:hidden">{job.status.charAt(0).toUpperCase()}</span>
                    </Badge>
                    {job.resultado && (
                      <div className={`text-xs px-2 py-1 rounded font-semibold ${isLight ? 'bg-gray-100 text-gray-700' : 'bg-slate-700/50 text-slate-300'}`}>
                        {job.resultado.tempoExecucao}s
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações resumidas */}
                <div className="space-y-2 mb-3">
                  <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded-md ${isLight ? 'bg-blue-50 text-blue-700' : 'bg-blue-500/20 text-blue-300'}`}>
                    <Building className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate font-medium">{job.parametros.fornecedores.length} fornecedores</span>
                  </div>
                  {produtos.length > 0 && (
                    <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded-md ${isLight ? 'bg-green-50 text-green-700' : 'bg-green-500/20 text-green-300'}`}>
                      <Package className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate font-medium">{produtos.length} produtos</span>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="sm" 
                    className={`flex-1 text-xs py-1 h-7 flex items-center justify-center gap-1 transition-all duration-200 ${
                      isLight 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25'
                    }`}
                    onClick={() => viewJobDetails(job.id)}
                  >
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline">Ver Detalhes</span>
                    <span className="sm:hidden">Detalhes</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`h-7 sm:w-7 p-0 sm:flex-shrink-0 transition-all duration-200 ${
                      isLight 
                        ? 'text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm' 
                        : 'text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400 shadow-lg'
                    }`}
                    onClick={() => setShowDeleteConfirm(job.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Processo */}
      {viewMode === 'details' && selectedJobId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className={`rounded-lg w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl min-h-[50vh] max-h-[95vh] sm:max-h-[90vh] overflow-hidden border my-4 ${
            isLight ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-700'
          }`}>
            <ProcessDetailsPage 
              jobId={selectedJobId!} 
              onBack={backToList}
              onDelete={deleteJob}
              isLight={isLight}
            />
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className={`max-w-md w-full ${
            isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-600'
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isLight ? 'bg-red-100' : 'bg-red-500/20'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${isLight ? 'text-red-600' : 'text-red-400'}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Confirmar Exclusão</h3>
                  <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-slate-400'}`}>Esta ação não pode ser desfeita.</p>
                </div>
              </div>
              
              <p className={`mb-6 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                Tem certeza que deseja deletar o processo <strong>{showDeleteConfirm}</strong>? 
                Todos os dados relacionados serão permanentemente removidos.
              </p>
              
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(null)}
                  className={isLight 
                    ? 'text-gray-700 border-gray-300 hover:bg-gray-50' 
                    : 'text-white border-slate-600 hover:bg-slate-700'
                  }
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => deleteJob(showDeleteConfirm!)}
                  className={isLight 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                  }
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar Processo
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
    </div>
  );
}