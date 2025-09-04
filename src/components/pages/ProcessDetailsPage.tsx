import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { processImageUrl, handleImageError } from '../../utils/imageProxy';
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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

interface ProcessDetailsPageProps {
  jobId: string;
  onBack: () => void;
  onDelete?: (jobId: string) => void;
}

export function ProcessDetailsPage({ jobId, onBack, onDelete }: ProcessDetailsPageProps) {
  const [job, setJob] = useState<QuoteJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar detalhes do job da API
  const fetchJobDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
  const response = await fetch(`${API_BASE_URL}/busca-automatica/job/${id}`);
      if (!response.ok) throw new Error('Erro ao buscar detalhes do processo');
      
      const data = await response.json();
      
      if (data.success && data.job) {
        setJob(data.job);
      } else {
        throw new Error('Job não encontrado');
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
    switch (status) {
      case 'em-andamento':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'pendente':
        return 'bg-slate-600/20 text-slate-300 border-slate-500/30';
      case 'concluido':
        return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 'erro':
        return 'bg-red-600/20 text-red-400 border-red-500/30';
      case 'cancelado':
        return 'bg-red-600/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-600/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'em-andamento':
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
        <div className="flex items-center justify-center h-60">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Erro ao carregar</h3>
            <p className="text-slate-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-slate-900 text-slate-200 p-6">
        <div className="flex items-center justify-center h-60">
          <div className="text-center">
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Processo não encontrado</h3>
            <p className="text-slate-300">O processo solicitado não foi encontrado.</p>
          </div>
        </div>
      </div>
    );
  }

  const produtos = job.resultado?.produtos || [];

  return (
    <div className="bg-slate-900 text-slate-200 max-h-[90vh] overflow-y-auto">
      {/* Header do Modal */}
      <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{job.parametros.termo}</h1>
          <p className="text-slate-400 text-sm">ID: {job.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${getStatusColor(job.status)} flex items-center gap-2`}>
            {getStatusIcon(job.status)}
            {job.status.replace('-', ' ').toUpperCase()}
          </Badge>
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6 space-y-6">
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <div className="p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Criado em</h3>
              <p className="text-white">{new Date(job.criadoEm).toLocaleString('pt-BR')}</p>
            </div>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <div className="p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Produtos Encontrados</h3>
              <p className="text-white text-lg font-semibold">{produtos.length}</p>
            </div>
          </Card>
          
          {job.resultado && (
            <Card className="bg-slate-800 border-slate-700">
              <div className="p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Tempo de Execução</h3>
                <p className="text-white">{(job.resultado.tempoExecucao / 1000).toFixed(1)}s</p>
              </div>
            </Card>
          )}
        </div>

        {/* Parâmetros da Busca */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-400" />
              Parâmetros da Busca
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-1">Termo de busca</h3>
                <p className="text-white">{job.parametros.termo}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-1">Número de resultados</h3>
                <p className="text-white">{job.parametros.numResultados}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-1">Fornecedores</h3>
                <div className="flex flex-wrap gap-1">
                  {job.parametros.fornecedores.map((fornecedorId) => (
                    <Badge key={fornecedorId} variant="outline" className="text-xs border-slate-500 text-slate-300">
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
          <Card className="bg-slate-800 border-slate-700">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                Progresso Atual
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Etapa:</span>
                  <Badge variant="outline" className="border-slate-500 text-slate-300">{job.progresso.etapa}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Produtos processados:</span>
                  <span className="text-white">{job.progresso.produtos}</span>
                </div>
                
                <div>
                  <span className="text-slate-400 block mb-2">Detalhes:</span>
                  <p className="text-white bg-slate-700 p-3 rounded">{job.progresso.detalhes}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Produtos Encontrados */}
        {produtos.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-400" />
                Produtos Encontrados ({produtos.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {produtos.slice(0, 9).map((produto, index) => (
                  <Card key={index} className="bg-slate-700 border-slate-600">
                    <div className="p-4">
                      <img
                        src={processImageUrl(produto.image_url, 300, 200)}
                        alt={produto.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                        onError={handleImageError}
                      />
                      
                      <h3 className="font-medium text-white mb-2 line-clamp-2">
                        {produto.name}
                      </h3>
                      
                      <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                        {produto.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-blue-400 font-semibold">
                          {produto.price}
                        </span>
                        
                        {produto.product_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:bg-slate-600"
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
                <p className="text-slate-400 text-center mt-4">
                  ... e mais {produtos.length - 9} produtos
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-between pt-6 border-t border-slate-700">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Fechar
          </Button>
          
          {onDelete && (
            <Button
              onClick={() => onDelete(jobId)}
              className="bg-red-600 hover:bg-red-700 text-white"
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
