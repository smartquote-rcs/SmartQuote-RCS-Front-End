import { useState, useEffect } from "react";
import {
  Mail,
  Search,
  MoreVertical,
  Star,
  RefreshCw,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Download,
  Paperclip,
  X
} from "lucide-react";
import { emailService } from "../../services/emailService";

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: Date;
  attachments: any[];
  isRead?: boolean;
  isQuoteRequest?: boolean;
  confidence?: number;
  status?: 'pending' | 'processed' | 'rejected';
  quoteId?: string;
}

export function EmailsPage() {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<EmailMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'quote-requests' | 'processed'>('all');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailServiceStatus, setEmailServiceStatus] = useState<any>(null);

  useEffect(() => {
    loadEmails();
    loadEmailServiceStatus();
  }, []);

  useEffect(() => {
    filterEmails();
  }, [emails, searchQuery, filterStatus]);

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      // Simular emails de cotação recebidos
      const mockEmails: EmailMessage[] = [
        {
          id: "1",
          from: "cliente@empresa.com",
          subject: "Solicitação de Cotação - Painéis Solares",
          body: `Prezados,

Gostaria de solicitar uma cotação para:

Produto: Painéis Solares 400W
Quantidade: 50 unidades
Cliente: Energia Verde Lda
Prazo: 15 dias

Por favor, enviem a cotação com urgência.

Atenciosamente,
João Silva`,
          date: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
          attachments: [],
          isRead: false,
          isQuoteRequest: true,
          confidence: 95,
          status: 'pending'
        },
        {
          id: "2",
          from: "compras@techcorp.pt",
          subject: "Orçamento para Servidores",
          body: `Bom dia,

Necessitamos de um orçamento para:

Produto: Servidores Dell PowerEdge R750
Quantidade: 3 unidades
Cliente: TechCorp International
Especificações: 64GB RAM, 2TB SSD

Prazo: 30 dias

Cumprimentos,
Maria Silva
Departamento de Compras`,
          date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
          attachments: [{ name: "especificacoes.pdf", size: "245KB" }],
          isRead: true,
          isQuoteRequest: true,
          confidence: 90,
          status: 'processed',
          quoteId: 'RCS-2025-001'
        },
        {
          id: "3",
          from: "fornecedor@supplies.com",
          subject: "Disponibilidade de Produtos",
          body: `Olá,

Informamos que temos novos produtos disponíveis em nosso catálogo.

Por favor, consultem nossa lista atualizada.

Obrigado,
Pedro Santos`,
          date: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 horas atrás
          attachments: [],
          isRead: true,
          isQuoteRequest: false,
          confidence: 20,
          status: 'rejected'
        },
        {
          id: "4",
          from: "vendas@industrial.pt",
          subject: "Pedido de Cotação - Equipamentos Industriais",
          body: `Caros Senhores,

Solicitamos cotação para os seguintes itens:

1. Compressor Industrial 50HP - 2 unidades
2. Motor Elétrico 30KW - 5 unidades
3. Painel de Controle Automático - 1 unidade

Cliente: Indústria Metalúrgica SA
Prazo de entrega: 45 dias úteis
Local de entrega: Porto

Aguardamos retorno urgente.

Cordialmente,
Ana Costa
Departamento Técnico`,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
          attachments: [
            { name: "especificacoes_tecnicas.pdf", size: "1.2MB" },
            { name: "layout_instalacao.dwg", size: "856KB" }
          ],
          isRead: false,
          isQuoteRequest: true,
          confidence: 98,
          status: 'pending'
        },
        {
          id: "5",
          from: "procurement@construction.com",
          subject: "RFQ: Construction Materials",
          body: `Dear Supplier,

We are requesting quotes for the following construction materials:

- Steel beams (various sizes) - 500 tons
- Concrete blocks - 10,000 units
- Roofing materials - 2,000 m²

Project: Commercial Building Complex
Delivery timeline: 8 weeks
Location: Lisbon

Please provide detailed pricing and availability.

Best regards,
Construction Team`,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 dias atrás
          attachments: [],
          isRead: true,
          isQuoteRequest: true,
          confidence: 85,
          status: 'processed',
          quoteId: 'RCS-2025-002'
        }
      ];

      setEmails(mockEmails);
    } catch (error) {
      console.error('Erro ao carregar emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmailServiceStatus = () => {
    const status = emailService.getStatus();
    setEmailServiceStatus(status);
  };

  const filterEmails = () => {
    let filtered = [...emails];

    // Filtrar por texto de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(email =>
        email.from.toLowerCase().includes(query) ||
        email.subject.toLowerCase().includes(query) ||
        email.body.toLowerCase().includes(query)
      );
    }

    // Filtrar por status
    switch (filterStatus) {
      case 'unread':
        filtered = filtered.filter(email => !email.isRead);
        break;
      case 'quote-requests':
        filtered = filtered.filter(email => email.isQuoteRequest);
        break;
      case 'processed':
        filtered = filtered.filter(email => email.status === 'processed');
        break;
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort((a, b) => b.date.getTime() - a.date.getTime());

    setFilteredEmails(filtered);
  };

  const handleEmailClick = (email: EmailMessage) => {
    setSelectedEmail(email);
    // Marcar como lido
    if (!email.isRead) {
      setEmails(prev => prev.map(e => 
        e.id === email.id ? { ...e, isRead: true } : e
      ));
    }
  };

  const handleRefresh = () => {
    loadEmails();
    loadEmailServiceStatus();
  };

  const getEmailStatusIcon = (email: EmailMessage) => {
    if (!email.isQuoteRequest) return null;
    
    switch (email.status) {
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m atrás`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d atrás`;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              Emails de Cotação
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
              Emails recebidos e processados pelo sistema
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="glass-card px-4 py-2 text-center sm:text-left bg-blue-500/20 border-blue-500/30">
              <span className="text-blue-300 font-bold text-lg">{emails.filter(e => e.isQuoteRequest).length}</span>
              <span className="text-blue-200 ml-2">Cotações</span>
            </div>
            <div className="glass-card px-4 py-2 text-center sm:text-left bg-green-500/20 border-green-500/30">
              <span className="text-green-300 font-bold text-lg">{emails.filter(e => !e.isRead).length}</span>
              <span className="text-green-200 ml-2">Não lidos</span>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden bg-dark-bg">
        <div className="h-full flex">
          {/* Lista de Emails */}
          <div className="w-full lg:w-1/2 xl:w-2/5 border-r border-dark-color flex flex-col">
            {/* Barra de Busca e Filtros */}
            <div className="p-4 border-b border-dark-color bg-dark-bg">
              <div className="flex flex-col space-y-3">
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-secondary w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-hover border border-dark-color rounded-lg text-dark-primary placeholder-dark-secondary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                {/* Filtros */}
                <div className="flex space-x-2 overflow-x-auto">
                  {[
                    { key: 'all', label: 'Todos', count: emails.length },
                    { key: 'unread', label: 'Não lidos', count: emails.filter(e => !e.isRead).length },
                    { key: 'quote-requests', label: 'Cotações', count: emails.filter(e => e.isQuoteRequest).length },
                    { key: 'processed', label: 'Processados', count: emails.filter(e => e.status === 'processed').length }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setFilterStatus(filter.key as any)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        filterStatus === filter.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-dark-hover text-dark-secondary hover:text-dark-primary hover:bg-dark-color'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lista de Emails */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                    <span className="text-dark-secondary">Carregando emails...</span>
                  </div>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                  <Mail className="w-12 h-12 text-dark-secondary mb-2" />
                  <p className="text-dark-secondary">
                    {searchQuery || filterStatus !== 'all' ? 'Nenhum email encontrado' : 'Nenhum email recebido ainda'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => handleEmailClick(email)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                        selectedEmail?.id === email.id
                          ? 'bg-blue-600/20 border-blue-500/50'
                          : !email.isRead
                          ? 'bg-dark-hover/50 border-transparent hover:bg-dark-hover hover:border-dark-color'
                          : 'bg-transparent border-transparent hover:bg-dark-hover/30 hover:border-dark-color'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-sm font-medium ${!email.isRead ? 'text-white' : 'text-dark-primary'}`}>
                              {email.from}
                            </span>
                            {getEmailStatusIcon(email)}
                          </div>
                          <p className={`text-sm mb-1 truncate ${!email.isRead ? 'text-white font-medium' : 'text-dark-primary'}`}>
                            {email.subject}
                          </p>
                          <p className="text-xs text-dark-secondary line-clamp-2">
                            {email.body.substring(0, 100)}...
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-dark-secondary">
                                {formatDate(email.date)}
                              </span>
                              {email.attachments.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Paperclip className="w-3 h-3 text-dark-secondary" />
                                  <span className="text-xs text-dark-secondary">
                                    {email.attachments.length}
                                  </span>
                                </div>
                              )}
                            </div>
                            {email.isQuoteRequest && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span className="text-xs text-yellow-400">
                                  {email.confidence}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {!email.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Visualização do Email */}
          <div className="hidden lg:flex lg:flex-1 flex-col">
            {selectedEmail ? (
              <>
                {/* Header do Email */}
                <div className="p-6 border-b border-dark-color bg-dark-bg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-dark-primary mb-2">
                        {selectedEmail.subject}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-dark-secondary">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{selectedEmail.from}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{selectedEmail.date.toLocaleString('pt-PT')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedEmail.isQuoteRequest && (
                        <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          selectedEmail.status === 'processed'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : selectedEmail.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {selectedEmail.status === 'processed' && 'Processado'}
                          {selectedEmail.status === 'pending' && 'Pendente'}
                          {selectedEmail.status === 'rejected' && 'Rejeitado'}
                        </div>
                      )}
                      <button 
                        className="p-2 text-dark-secondary hover:text-dark-primary transition-colors"
                        title="Mais opções"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Info de Cotação */}
                  {selectedEmail.isQuoteRequest && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-white">
                          Detectado como pedido de cotação
                        </span>
                        <span className="text-sm text-blue-300">
                          (Confiança: {selectedEmail.confidence}%)
                        </span>
                      </div>
                      {selectedEmail.quoteId && (
                        <p className="text-sm text-green-300">
                          Cotação criada: {selectedEmail.quoteId}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Anexos */}
                  {selectedEmail.attachments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-dark-primary mb-2">
                        Anexos ({selectedEmail.attachments.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedEmail.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-2 bg-dark-hover rounded-lg"
                          >
                            <Paperclip className="w-4 h-4 text-dark-secondary" />
                            <span className="text-sm text-dark-primary flex-1">
                              {attachment.name}
                            </span>
                            <span className="text-xs text-dark-secondary">
                              {attachment.size}
                            </span>
                            <button 
                              className="p-1 text-dark-secondary hover:text-dark-primary transition-colors"
                              title="Baixar anexo"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Corpo do Email */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-dark-primary text-sm font-mono bg-dark-hover/30 p-4 rounded-lg border border-dark-color">
                      {selectedEmail.body}
                    </pre>
                  </div>
                </div>

                {/* Ações */}
                <div className="p-6 border-t border-dark-color bg-dark-bg">
                  <div className="flex space-x-3">
                    {selectedEmail.isQuoteRequest && selectedEmail.status === 'pending' && (
                      <>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Criar Cotação</span>
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>Rejeitar</span>
                        </button>
                      </>
                    )}
                    <button className="bg-dark-hover hover:bg-dark-color text-dark-primary px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Responder</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <Mail className="w-16 h-16 text-dark-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-dark-primary mb-2">
                    Selecione um email
                  </h3>
                  <p className="text-dark-secondary">
                    Escolha um email da lista para visualizar seu conteúdo
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Email Service Status */}
      {emailServiceStatus && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`p-3 rounded-lg shadow-lg ${
            emailServiceStatus.running
              ? 'bg-green-600/90 text-white'
              : 'bg-yellow-600/90 text-white'
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                emailServiceStatus.running ? 'bg-green-300' : 'bg-yellow-300'
              }`}></div>
              <span className="text-sm font-medium">
                Serviço de Email: {emailServiceStatus.running ? 'Ativo' : 'Inativo'}
              </span>
              <button
                onClick={() => setEmailServiceStatus(null)}
                className="ml-2 text-white/70 hover:text-white"
                title="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
