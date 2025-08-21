import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Timer,
  Package,
  Building,
  Search,
  ExternalLink,
  Trash2
} from 'lucide-react';

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
  };
  progresso?: {
    etapa: string;
    produtos: number;
    detalhes: string;
  };
  resultado?: {
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Dados mock - os mesmos da ProcessesPage
  const mockJobs: QuoteJob[] = [
    {
      id: "e30fe277-9e23-4071-b174-9a97e671d708",
      status: "concluido",
      criadoEm: "2025-08-20T15:50:05.487Z",
      parametros: {
        termo: "Monitor 4K",
        numResultados: 1,
        fornecedores: [1, 2],
        usuarioId: 1
      },
      iniciadoEm: "2025-08-20T15:50:05.487Z",
      progresso: {
        etapa: "salvamento",
        produtos: 2,
        detalhes: "Salvando produtos na base de dados..."
      },
      concluidoEm: "2025-08-20T15:53:07.907Z",
      resultado: {
        produtos: [
          {
            name: "Monitor Samsung 32 4K UHD",
            price: "R$ 1.899,99",
            image_url: "https://example.com/monitor1.jpg",
            description: "Monitor 32 polegadas 4K UHD com HDR",
            product_url: "https://example.com/product1"
          },
          {
            name: "Monitor LG 27 4K IPS",
            price: "R$ 1.599,99", 
            image_url: "https://example.com/monitor2.jpg",
            description: "Monitor 27 polegadas 4K IPS profissional",
            product_url: "https://example.com/product2"
          }
        ],
        salvamento: {
          salvos: 2,
          erros: 0,
          detalhes: [
            {
              fornecedor: "TechStore",
              fornecedor_id: 1,
              salvos: 1,
              erros: 0,
              detalhes: [
                {
                  produto: "Monitor Samsung 32 4K UHD",
                  status: "salvo",
                  id: 1,
                  preco_centavos: 189999
                }
              ]
            },
            {
              fornecedor: "DigitalShop",
              fornecedor_id: 2,
              salvos: 1,
              erros: 0,
              detalhes: [
                {
                  produto: "Monitor LG 27 4K IPS",
                  status: "salvo",
                  id: 2,
                  preco_centavos: 159999
                }
              ]
            }
          ]
        },
        tempoExecucao: 182
      }
    },
    {
      id: "f40ge388-ae34-5182-c285-0b08f782e819",
      status: "em-andamento",
      criadoEm: "2025-08-21T09:15:00.000Z",
      parametros: {
        termo: "Notebook Dell",
        numResultados: 3,
        fornecedores: [1, 2, 3],
        usuarioId: 1
      },
      iniciadoEm: "2025-08-21T09:15:05.000Z",
      progresso: {
        etapa: "busca",
        produtos: 0,
        detalhes: "Buscando produtos nos fornecedores..."
      }
    },
    {
      id: "g51hf499-bf45-6293-d396-1c19g893f920",
      status: "pendente",
      criadoEm: "2025-08-21T10:30:00.000Z",
      parametros: {
        termo: "Mouse Gamer",
        numResultados: 5,
        fornecedores: [2, 3],
        usuarioId: 2
      }
    }
  ];

  useEffect(() => {
    const loadJobData = async () => {
      try {
        setLoading(true);
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Buscar o job pelo ID
        const foundJob = mockJobs.find(j => j.id === jobId);
        
        if (foundJob) {
          setJob(foundJob);
        } else {
          setError('Job não encontrado');
        }
      } catch (err) {
        setError('Erro ao carregar dados do job');
      } finally {
        setLoading(false);
      }
    };

    loadJobData();
  }, [jobId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-dark-hover text-dark-secondary border-dark-border';
      case 'em-andamento':
        return 'bg-dark-cta/20 text-dark-cta border-dark-cta/30';
      case 'concluido':
        return 'bg-dark-success/20 text-dark-success border-dark-success/30';
      case 'erro':
        return 'bg-dark-error/20 text-dark-error border-dark-error/30';
      case 'cancelado':
        return 'bg-dark-error/20 text-dark-error border-dark-error/30';
      default:
        return 'bg-dark-hover text-dark-secondary border-dark-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="h-4 w-4" />;
      case 'em-andamento':
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

  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(centavos / 100);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-dark-bg min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Timer className="h-12 w-12 text-dark-cta mx-auto mb-4 animate-spin" />
            <p className="text-dark-secondary">Carregando detalhes do job...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-6 space-y-6 bg-dark-bg min-h-screen">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="text-dark-secondary hover:text-dark-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-dark-error mx-auto mb-4" />
            <p className="text-dark-error text-lg font-medium">{error || 'Job não encontrado'}</p>
            <p className="text-dark-secondary">Verifique o ID do job e tente novamente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-dark-bg min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="text-dark-secondary hover:text-dark-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-dark-primary">Detalhes do Job</h1>
            <p className="text-dark-secondary">Job #{job.id.substring(0, 8)}</p>
          </div>
        </div>
        {onDelete && (
          <Button 
            variant="outline" 
            className="text-dark-error border-dark-error/30 hover:bg-dark-error/10"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Job
          </Button>
        )}
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status e Informações Gerais */}
        <Card className="bg-dark-card border-dark-border lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-dark-cta/10 rounded-lg">
                <Search className="h-6 w-6 text-dark-cta" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-dark-primary mb-2">{job.parametros.termo}</h2>
                <Badge className={`${getStatusColor(job.status)} text-sm`}>
                  {getStatusIcon(job.status)}
                  <span className="ml-2">{job.status.replace('-', ' ').toUpperCase()}</span>
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-dark-secondary mb-3">Informações do Job</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-dark-secondary">Criado em:</span>
                    <span className="text-dark-primary">
                      {new Date(job.criadoEm).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {job.iniciadoEm && (
                    <div className="flex justify-between">
                      <span className="text-dark-secondary">Iniciado em:</span>
                      <span className="text-dark-primary">
                        {new Date(job.iniciadoEm).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  {job.concluidoEm && (
                    <div className="flex justify-between">
                      <span className="text-dark-secondary">Concluído em:</span>
                      <span className="text-dark-success">
                        {new Date(job.concluidoEm).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-dark-secondary mb-3">Parâmetros</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-dark-secondary">Resultado máximo:</span>
                    <span className="text-dark-primary">{job.parametros.numResultados}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-secondary">Fornecedores:</span>
                    <span className="text-dark-primary">{job.parametros.fornecedores.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-secondary">Usuário ID:</span>
                    <span className="text-dark-primary">{job.parametros.usuarioId}</span>
                  </div>
                  {job.resultado && (
                    <div className="flex justify-between">
                      <span className="text-dark-secondary">Tempo execução:</span>
                      <span className="text-dark-cta font-medium">{job.resultado.tempoExecucao}s</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Progresso */}
        <Card className="bg-dark-card border-dark-border">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-dark-primary mb-4">Progresso</h3>
            {job.progresso ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-dark-cta mb-2">{job.progresso.produtos}</div>
                  <div className="text-sm text-dark-secondary">Produtos processados</div>
                </div>
                <div className="p-3 bg-dark-hover/50 rounded-lg">
                  <div className="text-sm font-medium text-dark-primary mb-1">{job.progresso.etapa}</div>
                  <div className="text-xs text-dark-secondary">{job.progresso.detalhes}</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-dark-secondary">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aguardando início</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Resultados */}
      {job.resultado && (
        <div className="space-y-6">
          {/* Resumo dos Resultados */}
          <Card className="bg-dark-card border-dark-border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-dark-primary mb-4">Resumo dos Resultados</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-dark-cta/10 rounded-lg">
                  <div className="text-2xl font-bold text-dark-cta">{job.resultado.produtos.length}</div>
                  <div className="text-sm text-dark-secondary">Produtos encontrados</div>
                </div>
                <div className="text-center p-4 bg-dark-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-dark-success">{job.resultado.salvamento.salvos}</div>
                  <div className="text-sm text-dark-secondary">Produtos salvos</div>
                </div>
                <div className="text-center p-4 bg-dark-error/10 rounded-lg">
                  <div className="text-2xl font-bold text-dark-error">{job.resultado.salvamento.erros}</div>
                  <div className="text-sm text-dark-secondary">Erros</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Produtos Encontrados */}
          {job.resultado.produtos.length > 0 && (
            <Card className="bg-dark-card border-dark-border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-dark-primary mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos Encontrados ({job.resultado.produtos.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.resultado.produtos.map((produto, index) => (
                    <div key={index} className="p-4 bg-dark-hover/30 rounded-lg border border-dark-border/50">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-dark-border/50 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-dark-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-dark-primary mb-1 line-clamp-2">{produto.name}</h4>
                          <p className="text-sm text-dark-secondary mb-2 line-clamp-2">{produto.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-dark-cta">{produto.price}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-dark-secondary hover:text-dark-primary"
                              onClick={() => window.open(produto.product_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Fornecedores */}
          {job.resultado.salvamento.detalhes.length > 0 && (
            <Card className="bg-dark-card border-dark-border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-dark-primary mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Detalhes por Fornecedor ({job.resultado.salvamento.detalhes.length})
                </h3>
                <div className="space-y-4">
                  {job.resultado.salvamento.detalhes.map((fornecedor) => (
                    <div key={fornecedor.fornecedor_id} className="p-4 bg-dark-hover/30 rounded-lg border border-dark-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-dark-primary">{fornecedor.fornecedor}</h4>
                        <div className="flex gap-2">
                          <Badge className="bg-dark-success/20 text-dark-success">
                            {fornecedor.salvos} salvos
                          </Badge>
                          {fornecedor.erros > 0 && (
                            <Badge className="bg-dark-error/20 text-dark-error">
                              {fornecedor.erros} erros
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {fornecedor.detalhes.map((detalhe) => (
                          <div key={detalhe.id} className="flex items-center justify-between p-3 bg-dark-card rounded border border-dark-border/30">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-dark-primary">{detalhe.produto}</div>
                              <div className="text-xs text-dark-secondary">Status: {detalhe.status}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-dark-cta">
                                {formatCurrency(detalhe.preco_centavos)}
                              </div>
                              <div className="text-xs text-dark-secondary">ID: {detalhe.id}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-dark-card border-dark-border max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-dark-primary mb-2">Confirmar Exclusão</h3>
              <p className="text-dark-secondary mb-6">
                Tem certeza que deseja excluir este job? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDelete?.(job.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 bg-dark-error hover:bg-dark-error/90"
                >
                  Excluir
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
