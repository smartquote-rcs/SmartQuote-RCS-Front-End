import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { processImageUrl, handleImageError } from '../../utils/imageProxy';
import { jobService } from '../../api/services';
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Timer,
  Package,
  Building,
  ExternalLink,
  Trash2,
  X
} from 'lucide-react';

interface QuoteJob {
  id: string;
  status: 'pendente' | 'em-andamento' | 'EXECUTANDO' | 'concluido' | 'erro' | 'cancelado';
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

interface ProcessDetailsPageProps {
  jobId: string;
  onBack: () => void;
  onDelete?: (jobId: string) => void;
  isLight?: boolean;
}

export function ProcessDetailsPage({ jobId, onBack, onDelete, isLight = false }: ProcessDetailsPageProps) {
  const [job, setJob] = useState<QuoteJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar detalhes do job da API
  const fetchJobDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobService.getJobById(id);
      
      if (response.success && response.data) {
        // A API retorna { success: true, job: {...} }
        const jobData = response.data.job || response.data;
        setJob(jobData);
      } else {
        throw new Error(response.error || 'Job não encontrado');
      }
    } catch (e) {
      console.error('Erro ao buscar detalhes do job:', e);
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobDetails(jobId);
    }
  }, [jobId]);

  const getStatusColor = (status: string) => {
    if (isLight) {
      switch (status) {
        case 'em-andamento':
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
        case 'em-andamento':
        case 'EXECUTANDO':
          return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
        case 'pendente':
          return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
        case 'concluido':
          return 'bg-green-600/20 text-green-400 border-green-500/30';
        case 'erro':
          return 'bg-red-600/20 text-red-400 border-red-500/30';
        case 'cancelado':
          return 'bg-red-600/20 text-red-400 border-red-500/30';
        default:
          return 'bg-slate-600/20 text-slate-300 border-slate-500/30';
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'em-andamento':
      case 'EXECUTANDO':
        return <Clock className="h-4 w-4" />;
      case 'pendente':
        return <Timer className="h-4 w-4" />;
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

  if (loading) {
    return (
      <div className="bg-slate-900 text-slate-200 p-6">
        <div className="flex items-center justify-center h-60">
          <div className="text-slate-300">Carregando detalhes do processo...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 text-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Detalhes do Processo</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center justify-center h-60">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Erro ao carregar</h3>
            <p className="text-slate-300 mb-4">{error}</p>
            <Button
              onClick={onBack}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Lista
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-slate-900 text-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Detalhes do Processo</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center justify-center h-60">
          <div className="text-center">
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Processo não encontrado</h3>
            <p className="text-slate-300 mb-4">O processo solicitado não foi encontrado.</p>
            <Button
              onClick={onBack}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Lista
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const produtos = job.resultado?.produtos || [];

  return (
    <div className={`max-h-[95vh] sm:max-h-[90vh] overflow-y-auto ${
      isLight ? 'bg-gray-50 text-gray-900' : 'bg-slate-900 text-slate-200'
    }`}>
      {/* Header do Modal */}
      <div className={`sticky top-0 border-b px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between ${
        isLight 
          ? 'bg-white border-gray-200' 
          : 'bg-slate-800 border-slate-700'
      }`}>
        <div className="min-w-0 flex-1">
          <h1 className={`text-lg sm:text-xl font-bold truncate ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>{job.parametros.termo}</h1>
          <p className={`text-xs sm:text-sm font-mono truncate ${
            isLight ? 'text-gray-500' : 'text-slate-400'
          }`}>ID: {job.id}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Badge className={`${getStatusColor(job.status)} flex items-center gap-1 sm:gap-2 text-xs`}>
            {getStatusIcon(job.status)}
            <span className="hidden sm:inline">{job.status.replace('-', ' ').toUpperCase()}</span>
            <span className="sm:hidden">{job.status.charAt(0).toUpperCase()}</span>
          </Badge>
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${
              isLight 
                ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className={isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'}>
            <div className="p-3 sm:p-4">
              <h3 className={`text-xs sm:text-sm font-medium mb-2 ${
                isLight ? 'text-gray-500' : 'text-slate-400'
              }`}>Criado em</h3>
              <p className={`text-sm sm:text-base ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}>{new Date(job.criadoEm).toLocaleString('pt-BR')}</p>
            </div>
          </Card>
          
          <Card className={isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'}>
            <div className="p-3 sm:p-4">
              <h3 className={`text-xs sm:text-sm font-medium mb-2 ${
                isLight ? 'text-gray-500' : 'text-slate-400'
              }`}>Produtos Encontrados</h3>
              <p className={`text-lg font-semibold ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}>{produtos.length}</p>
            </div>
          </Card>
          
          {job.resultado && (
            <Card className={isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'}>
              <div className="p-3 sm:p-4">
                <h3 className={`text-xs sm:text-sm font-medium mb-2 ${
                  isLight ? 'text-gray-500' : 'text-slate-400'
                }`}>Tempo de Execução</h3>
                <p className={`text-sm sm:text-base ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>{(job.resultado.tempoExecucao / 1000).toFixed(1)}s</p>
              </div>
            </Card>
          )}
        </div>

        {/* Parâmetros da Busca */}
        <Card className={isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'}>
          <div className="p-4 sm:p-6">
            <h2 className={`text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              <Building className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              Parâmetros da Busca
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <h3 className={`text-xs sm:text-sm font-medium mb-1 ${
                  isLight ? 'text-gray-500' : 'text-slate-400'
                }`}>Termo de busca</h3>
                <p className={`text-sm sm:text-base break-words ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>{job.parametros.termo}</p>
              </div>
              
              <div>
                <h3 className={`text-xs sm:text-sm font-medium mb-1 ${
                  isLight ? 'text-gray-500' : 'text-slate-400'
                }`}>Número de resultados</h3>
                <p className={`text-sm sm:text-base ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>{job.parametros.numResultados}</p>
              </div>
              
              <div className="sm:col-span-2">
                <h3 className={`text-xs sm:text-sm font-medium mb-1 ${
                  isLight ? 'text-gray-500' : 'text-slate-400'
                }`}>Fornecedores</h3>
                <div className="flex flex-wrap gap-1">
                  {job.parametros.fornecedores.map((fornecedorId) => (
                    <Badge key={fornecedorId} variant="outline" className={`text-xs ${
                      isLight ? 'border-gray-300 text-gray-600' : 'border-slate-500 text-slate-300'
                    }`}>
                      ID: {fornecedorId}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-1">Usuário</h3>
                <p className="text-white">ID: {job.parametros.usuarioId}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Progresso (se em andamento) */}
        {job.progresso && (
          <Card className={isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'}>
            <div className="p-4 sm:p-6">
              <h2 className={`text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}>
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                Progresso Atual
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={isLight ? 'text-gray-500' : 'text-slate-400'}>Etapa:</span>
                  <Badge variant="outline" className={`${
                    isLight ? 'border-gray-300 text-gray-600' : 'border-slate-500 text-slate-300'
                  }`}>{job.progresso.etapa}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={isLight ? 'text-gray-500' : 'text-slate-400'}>Produtos processados:</span>
                  <span className={isLight ? 'text-gray-900' : 'text-white'}>{job.progresso.produtos}</span>
                </div>
                
                <div>
                  <span className={`block mb-2 ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>Detalhes:</span>
                  <p className={`p-3 rounded text-sm sm:text-base ${
                    isLight ? 'text-gray-900 bg-gray-100' : 'text-white bg-slate-700'
                  }`}>{job.progresso.detalhes}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Produtos Encontrados */}
        {produtos.length > 0 && (
          <Card className={isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'}>
            <div className="p-4 sm:p-6">
              <h2 className={`text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}>
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                Produtos Encontrados ({produtos.length})
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {produtos.slice(0, 9).map((produto, index) => (
                  <Card key={index} className={isLight ? 'bg-gray-50 border-gray-200' : 'bg-slate-700 border-slate-600'}>
                    <div className="p-3 sm:p-4">
                      <img
                        src={processImageUrl(produto.image_url, 300, 200)}
                        alt={produto.name}
                        className="w-full h-24 sm:h-32 object-cover rounded-lg mb-3"
                        onError={handleImageError}
                      />
                      
                      <h3 className={`font-medium mb-2 line-clamp-2 text-sm sm:text-base ${
                        isLight ? 'text-gray-900' : 'text-white'
                      }`}>
                        {produto.name}
                      </h3>
                      
                      <p className={`text-xs sm:text-sm mb-2 line-clamp-2 ${
                        isLight ? 'text-gray-600' : 'text-slate-400'
                      }`}>
                        {produto.description}
                      </p>
                      
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-blue-400 font-semibold text-sm sm:text-base">
                          {produto.price}
                        </span>
                        
                        {produto.product_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className={`text-xs h-7 px-2 ${
                              isLight 
                                ? 'border-gray-300 text-gray-600 hover:bg-gray-100' 
                                : 'border-slate-600 text-slate-300 hover:bg-slate-600'
                            }`}
                            onClick={() => window.open(produto.product_url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {produtos.length > 9 && (
                <p className={`text-center mt-4 text-sm ${
                  isLight ? 'text-gray-500' : 'text-slate-400'
                }`}>
                  ... e mais {produtos.length - 9} produtos
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Botões de Ação */}
        <div className={`flex justify-between pt-4 sm:pt-6 border-t ${
          isLight ? 'border-gray-200' : 'border-slate-700'
        }`}>
          <Button
            onClick={onBack}
            variant="outline"
            className={`${
              isLight 
                ? 'border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400' 
                : 'border-cyan-400 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-300'
            }`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Fechar
          </Button>
          
          {onDelete && (
            <Button
              onClick={() => onDelete(jobId)}
              className={`${
                isLight
                  ? 'bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600'
                  : 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700'
              } transition-all duration-200`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar Processo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
