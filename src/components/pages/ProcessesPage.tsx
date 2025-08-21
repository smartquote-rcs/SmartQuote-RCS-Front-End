import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Clock, 
  Eye, 
  FileText, 
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Trash2,
  Building,
  AlertTriangle,
  Package,
  Search
} from 'lucide-react';
import { ProcessDetailsPage } from './ProcessDetailsPage';

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

// Dados mock baseados no JSON real
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
          name: "Monitor 32'' E32K G5 UHD 4K USB-C/HDMI/DP/RJ45/3USB-A",
          price: "701814,78AKZ",
          image_url: "https://ncrangola.vtexassets.com/arquivos/ids/171144/6N4D6AA.jpg?v=638898907769770000",
          description: "O Monitor 4K HP E32k G5 com USB-C foi concebido de forma engenhosa para apresentar imagens incrivelm...",
          product_url: "https://www.ncrangola.com/monitor-32-e32k-g5-uhd-4k-usb-c-hdmi-dp-rj45-3usb-a/p"
        },
        {
          name: "MONITOR NILOX NXM274KD11 (27″ IPS 4K UHD 60Hz)",
          price: "431.194,51 Kz",
          image_url: "https://loja.sistec.co.ao/wp-content/uploads/2024/09/NXM274KD11-MONITOR-NILOX-27-4K-UHD-300x300.jpg",
          description: "Monitor Nilox NXM274KD11 com tela optimizada de 27\", 2xHDMI e uma Display Port., resolução 4K UHD, taxa de actualização 60 Hz que oferece um tempo de resposta de 5 ms no modo Overdrive para jogos.",
          product_url: "https://loja.sistec.co.ao/product/monitor-nilox-nxm274kd11-4k-uhd-de-27/"
        }
      ],
      salvamento: {
        salvos: 2,
        erros: 0,
        detalhes: [
          {
            fornecedor: "NCR",
            fornecedor_id: 1,
            salvos: 1,
            erros: 0,
            detalhes: [
              {
                produto: "Monitor 32'' E32K G5 UHD 4K USB-C/HDMI/DP/RJ45/3USB-A",
                status: "salvo",
                id: 81,
                preco_centavos: 70181478
              }
            ]
          },
          {
            fornecedor: "Sistec",
            fornecedor_id: 2,
            salvos: 1,
            erros: 0,
            detalhes: [
              {
                produto: "MONITOR NILOX NXM274KD11 (27″ IPS 4K UHD 60Hz)",
                status: "salvo",
                id: 82,
                preco_centavos: 43119451
              }
            ]
          }
        ]
      },
      tempoExecucao: 180219
    }
  },
  {
    id: "f20fe277-8e23-5071-c174-8a97e671d709",
    status: "em-andamento",
    criadoEm: "2025-08-21T10:30:15.123Z",
    iniciadoEm: "2025-08-21T10:30:20.456Z",
    parametros: {
      termo: "Laptop HP",
      numResultados: 5,
      fornecedores: [1, 2, 3],
      usuarioId: 2
    },
    progresso: {
      etapa: "busca",
      produtos: 3,
      detalhes: "Buscando produtos nos fornecedores..."
    }
  },
  {
    id: "a10fe277-7e23-6071-d174-7a97e671d710",
    status: "pendente",
    criadoEm: "2025-08-21T12:15:30.789Z",
    parametros: {
      termo: "Impressora multifunção",
      numResultados: 3,
      fornecedores: [2, 4],
      usuarioId: 1
    }
  }
];

export function ProcessesPage() {
  const [jobs, setJobs] = useState<QuoteJob[]>(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState<QuoteJob[]>(mockJobs);
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const deleteJob = (jobId: string) => {
    setJobs(jobs.filter(j => j.id !== jobId));
    setShowDeleteConfirm(null);
    if (selectedJobId === jobId) {
      setSelectedJobId(null);
      setViewMode('list');
    }
  };

  const viewJobDetails = (jobId: string) => {
    setSelectedJobId(jobId);
    setViewMode('details');
  };

  const backToList = () => {
    setSelectedJobId(null);
    setViewMode('list');
  };

  // Se estiver no modo de detalhes, renderizar a página de detalhes
  if (viewMode === 'details' && selectedJobId) {
    return (
      <ProcessDetailsPage 
        jobId={selectedJobId} 
        onBack={backToList}
        onDelete={deleteJob}
      />
    );
  }

  useEffect(() => {
    let filtered = jobs;
    
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }
    
    setFilteredJobs(filtered);
  }, [jobs, statusFilter]);

  const getStatusColor = (status: QuoteJob['status']) => {
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
    <div className="p-6 space-y-6 bg-dark-bg min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-primary">
            Processos de Cotação
          </h1>
          <p className="text-dark-secondary mt-1">
            Acompanhe o status e progresso das cotações em andamento
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-dark-primary mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-dark-border rounded-lg bg-dark-card text-dark-primary focus:outline-none focus:ring-2 focus:ring-dark-cta"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map((job) => {
          const produtos = job.resultado?.produtos || [];
          const fornecedores = job.resultado?.salvamento?.detalhes || [];
          
          return (
            <Card key={job.id} className="bg-dark-card border-dark-border hover:border-dark-cta transition-colors">
              <div className="p-6">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono text-dark-secondary">{job.id.substring(0, 8)}</span>
                    </div>
                    <h3 className="font-semibold text-dark-primary mb-1 line-clamp-2">
                      {job.parametros.termo}
                    </h3>
                    <p className="text-sm text-dark-secondary line-clamp-2">
                      Job criado em {new Date(job.criadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-dark-secondary hover:text-dark-primary">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getStatusColor(job.status)} text-xs flex items-center gap-1`}>
                      {getStatusIcon(job.status)}
                      {job.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                    {job.resultado && (
                      <span className="text-sm font-medium text-dark-primary">
                        {job.resultado.tempoExecucao}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Informações do Job */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-dark-secondary">
                    <Search className="h-4 w-4" />
                    <span>Termo: {job.parametros.termo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-secondary">
                    <Building className="h-4 w-4" />
                    <span>Fornecedores: {job.parametros.fornecedores.length}</span>
                  </div>
                  {produtos.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-dark-secondary">
                      <Package className="h-4 w-4" />
                      <span>Produtos encontrados: {produtos.length}</span>
                    </div>
                  )}
                  {job.concluidoEm && (
                    <div className="flex items-center gap-2 text-sm text-dark-secondary">
                      <Clock className="h-4 w-4" />
                      <span>Finalizado: {new Date(job.concluidoEm).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>

                {/* Produtos */}
                {produtos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-dark-primary mb-2">
                      Produtos ({produtos.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {produtos.slice(0, 2).map((produto, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-dark-border text-dark-secondary bg-dark-hover"
                        >
                          {produto.name.substring(0, 20)}...
                        </Badge>
                      ))}
                      {produtos.length > 2 && (
                        <Badge variant="outline" className="text-xs border-dark-border text-dark-secondary bg-dark-hover">
                          +{produtos.length - 2} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Fornecedores */}
                {fornecedores.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-dark-primary mb-2">
                      Fornecedores ({fornecedores.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {fornecedores.slice(0, 3).map((fornecedor) => (
                        <Badge
                          key={fornecedor.fornecedor_id}
                          variant="outline"
                          className={`text-xs ${
                            fornecedor.salvos > 0 ? 'border-dark-cta/30 text-dark-cta bg-dark-cta/10' :
                            'border-dark-border text-dark-secondary bg-dark-hover'
                          }`}
                        >
                          {fornecedor.fornecedor}
                        </Badge>
                      ))}
                      {fornecedores.length > 3 && (
                        <Badge variant="outline" className="text-xs border-dark-border text-dark-secondary bg-dark-hover">
                          +{fornecedores.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-dark-primary border-dark-border hover:bg-dark-hover"
                    onClick={() => viewJobDetails(job.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-dark-error border-dark-border hover:bg-dark-error/10 hover:text-dark-error"
                    onClick={() => setShowDeleteConfirm(job.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Mensagem se não houver jobs */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-dark-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-primary mb-2">
            Nenhum job encontrado
          </h3>
          <p className="text-dark-secondary">
            {statusFilter !== 'todos' 
              ? 'Tente ajustar os filtros para ver mais resultados.'
              : 'Não há jobs de cotação no momento.'
            }
          </p>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-dark-card border-dark-border max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-dark-error/20 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-dark-error" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-primary">Confirmar Exclusão</h3>
                  <p className="text-sm text-dark-secondary">Esta ação não pode ser desfeita.</p>
                </div>
              </div>
              
              <p className="text-dark-primary mb-6">
                Tem certeza que deseja deletar o processo <strong>{showDeleteConfirm}</strong>? 
                Todos os dados relacionados serão permanentemente removidos.
              </p>
              
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="text-dark-primary border-dark-border hover:bg-dark-hover"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => deleteJob(showDeleteConfirm)}
                  className="bg-dark-error hover:bg-dark-error/80 text-white"
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