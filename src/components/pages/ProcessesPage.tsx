import { useState, useEffect } from 'react';
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
  Package
} from 'lucide-react';
import { ProcessDetailsPage } from './ProcessDetailsPage';
import { jobService } from '../../api/services';
import { API_BASE_URL } from '../../api/client';

interface QuoteJob {
  id: string;
  status: 'pendente' | 'em-andamento' | 'concluido' | 'erro' | 'cancelado';
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
  const [jobs, setJobs] = useState<QuoteJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<QuoteJob[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

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
  }, [jobs, statusFilter]);

  const getStatusColor = (status: QuoteJob['status']) => {
    if (isLight) {
      switch (status) {
        case 'em-andamento':
          return 'bg-blue-100 text-blue-700 border-blue-300';
        case 'pendente':
          return 'bg-gray-100 text-gray-700 border-gray-300';
        case 'concluido':
          return 'bg-green-100 text-green-700 border-green-300';
        case 'erro':
          return 'bg-red-100 text-red-700 border-red-300';
        case 'cancelado':
          return 'bg-red-100 text-red-700 border-red-300';
        default:
          return 'bg-gray-100 text-gray-700 border-gray-300';
      }
    } else {
      switch (status) {
        case 'em-andamento':
          return 'bg-dark-cta/20 text-dark-cta border-dark-cta/30';
        case 'pendente':
          return 'bg-dark-hover text-dark-secondary border-dark-border';
        case 'concluido':
          return 'bg-dark-success/20 text-dark-success border-dark-success/30';
        case 'erro':
          return 'bg-dark-error/20 text-dark-error border-dark-error/30';
        case 'cancelado':
          return 'bg-dark-error/20 text-dark-error border-dark-error/30';
        default:
          return 'bg-dark-hover text-dark-secondary border-dark-border';
      }
    }
  };

  const getStatusIcon = (status: QuoteJob['status']) => {
    switch (status) {
      case 'em-andamento':
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
    <div className={`p-3 sm:p-4 md:p-6 space-y-4 min-h-screen ${isLight ? 'bg-gray-50' : 'bg-dark-bg'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-gray-800' : 'text-dark-primary'}`}>
            Processos de Cotação
          </h1>
          <p className={`text-sm sm:text-base ${isLight ? 'text-gray-600' : 'text-dark-secondary'} mt-1`}>
            Acompanhe o status e progresso das cotações em andamento
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex flex-col w-full sm:w-auto">
          <label className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-dark-primary'} mb-1`}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm sm:text-base w-full sm:w-48 ${
              isLight 
                ? 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500' 
                : 'border-dark-border bg-dark-card text-dark-primary focus:ring-dark-cta'
            }`}
          >
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="em-andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
            <option value="erro">Erro</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Lista de Processos */}
      <div className="flex-1 force-scroll scrollable-content min-h-0 overflow-y-scroll">
        {filteredJobs.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-96 ${isLight ? 'text-gray-500' : 'text-dark-secondary'}`}>
            <Package className={`h-10 w-10 mb-4 ${isLight ? 'text-gray-400' : 'text-dark-secondary'}`} />
            <span className="text-lg font-semibold">Nenhum processo encontrado</span>
            <span className="text-sm mt-2">Nenhum processo de cotação foi encontrado no momento.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 min-h-[800px]">
          {filteredJobs.map((job) => {
          const produtos = job.resultado?.produtos || [];
          
          return (
            <Card key={job.id} className={`border transition-colors h-fit
  ${isLight
    ? 'bg-white border-gray-200 hover:border-blue-400'
    : 'bg-gradient-to-br from-dark-card/80 to-dark-cta/10 border-dark-border hover:border-dark-cta backdrop-blur-md'}
`}>
              <div className="p-3 sm:p-4">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-mono ${isLight ? 'text-gray-500' : 'text-dark-secondary'}`}>{job.id.substring(0, 8)}</span>
                    </div>
                    <h3 className={`font-medium mb-1 line-clamp-1 text-sm truncate ${isLight ? 'text-gray-900' : 'text-dark-primary'}`}>
                      {job.parametros.termo}
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-dark-secondary'}`}>
                      {new Date(job.criadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className={`h-6 w-6 p-0 flex-shrink-0 ${
                    isLight ? 'text-gray-500 hover:text-gray-900' : 'text-dark-secondary hover:text-dark-primary'
                  }`}>
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>

                {/* Status */}
                <div className="mb-2 sm:mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getStatusColor(job.status)} text-xs flex items-center gap-1 flex-shrink-0`}>
                      {getStatusIcon(job.status)}
                      <span className="hidden sm:inline">{job.status.replace('-', ' ').toUpperCase()}</span>
                      <span className="sm:hidden">{job.status.charAt(0).toUpperCase()}</span>
                    </Badge>
                    {job.resultado && (
                      <span className={`text-xs font-medium ${isLight ? 'text-gray-900' : 'text-dark-primary'}`}>
                        {job.resultado.tempoExecucao}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Informações resumidas */}
                <div className="space-y-1 mb-2 sm:mb-3">
                  <div className={`flex items-center gap-2 text-xs ${isLight ? 'text-gray-600' : 'text-dark-secondary'}`}>
                    <Building className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{job.parametros.fornecedores.length} fornecedores</span>
                  </div>
                  {produtos.length > 0 && (
                    <div className={`flex items-center gap-2 text-xs ${isLight ? 'text-gray-600' : 'text-dark-secondary'}`}>
                      <Package className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{produtos.length} produtos</span>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="sm" 
                    className={`flex-1 text-xs py-1 h-7 flex items-center justify-center gap-1 ${
                      isLight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
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
                    className={`h-7 sm:w-7 p-0 sm:flex-shrink-0 ${
                      isLight 
                        ? 'text-red-600 border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300' 
                        : 'text-dark-error border-dark-border hover:bg-dark-error/10 hover:text-dark-error'
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

  {/* ...existing code... */}

      {/* Modal de Detalhes do Processo */}
      {viewMode === 'details' && selectedJobId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden border ${
            isLight ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-700'
          }`}>
            <ProcessDetailsPage 
              jobId={selectedJobId} 
              onBack={backToList}
              onDelete={deleteJob}
            />
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className={`max-w-md w-full ${
            isLight ? 'bg-white border-gray-200' : 'bg-dark-card border-dark-border'
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isLight ? 'bg-red-100' : 'bg-dark-error/20'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${isLight ? 'text-red-600' : 'text-dark-error'}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-dark-primary'}`}>Confirmar Exclusão</h3>
                  <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-dark-secondary'}`}>Esta ação não pode ser desfeita.</p>
                </div>
              </div>
              
              <p className={`mb-6 ${isLight ? 'text-gray-900' : 'text-dark-primary'}`}>
                Tem certeza que deseja deletar o processo <strong>{showDeleteConfirm}</strong>? 
                Todos os dados relacionados serão permanentemente removidos.
              </p>
              
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(null)}
                  className={isLight 
                    ? 'text-gray-700 border-gray-300 hover:bg-gray-50' 
                    : 'text-dark-primary border-dark-border hover:bg-dark-hover'
                  }
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => deleteJob(showDeleteConfirm)}
                  className={isLight 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-dark-error hover:bg-dark-error/80 text-white'
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
  );
}