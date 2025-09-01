import { useState, useEffect } from "react";
import {
  Mail,
  Search,
  RefreshCw,
  X,
  User,
  List
} from "lucide-react";
import { emailService } from "../../services/emailService";

interface EmailMessage {
  id: string;
  subject: string;
  date: Date;
  from: string;
  clienteNome: string;
  clienteEmail: string;
  clienteEmpresa?: string;
  clienteTelefone?: string;
  clienteLocalizacao?: string;
  textoOriginal: string;
  itens: Array<{
    nome: string;
    categoria?: string;
    quantidade?: number;
    prioridade?: string;
    justificativa?: string;
  }>;
  alternativas: Array<{
    nome: string;
    tipo?: string;
    vantagens?: string[];
    limitacoes?: string[];
    cenario_recomendado?: string;
  }>;
  prazoImplementacao?: number;
  origemTipo?: string;
  origemFonte?: string;
  status?: string;
  isRead?: boolean;
  attachments: any[];
  dadosBruto?: any;
}

export function EmailsPage() {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<EmailMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // Filtros antigos removidos, agora só busca texto
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailServiceStatus, setEmailServiceStatus] = useState<any>(null);
  // Estado para controlar se está mostrando detalhes no mobile
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  useEffect(() => {
    loadEmails();
    loadEmailServiceStatus();
  }, []);

  useEffect(() => {
    filterEmails();
  }, [emails, searchQuery]);

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:2000/api/prompts/with-dados-bruto');
      if (!response.ok) throw new Error('Erro ao buscar emails');
      const data = await response.json();

      // Extrai o array de pedidos
      let emailsRaw = [];
      if (Array.isArray(data)) {
        emailsRaw = data;
      } else if (Array.isArray(data.emails)) {
        emailsRaw = data.emails;
      } else if (Array.isArray(data.data)) {
        emailsRaw = data.data;
      } else {
        const firstArray = Object.values(data).find(v => Array.isArray(v));
        if (firstArray) emailsRaw = firstArray;
      }

      // Mapeia os campos conforme estrutura do JSON real
      const emails: EmailMessage[] = (emailsRaw || []).map((item: any) => {
        const dadosBruto = item && item.dados_bruto ? item.dados_bruto : {};
        const cliente = item && item.cliente ? item.cliente : {};
        const dadosExtraidos = item && item.dados_extraidos ? item.dados_extraidos : {};
        const origem = item && item.origem ? item.origem : {};
        return {
          id: item && item.id !== undefined ? String(item.id) : 'Não informado',
          subject: dadosBruto.subject || 'Não informado',
          date: dadosBruto.date ? new Date(dadosBruto.date) : new Date(),
          from: dadosBruto.from || 'Não informado',
          clienteNome: cliente.nome || 'Não informado',
          clienteEmail: cliente.email || 'Não informado',
          clienteEmpresa: cliente.empresa || 'Não informado',
          clienteTelefone: cliente.telefone || 'Não informado',
          clienteLocalizacao: cliente.localizacao || 'Não informado',
          textoOriginal: item && item.texto_original ? item.texto_original : 'Não informado',
          itens: Array.isArray(dadosExtraidos.itens_a_comprar)
            ? dadosExtraidos.itens_a_comprar.map((it: any) => ({
                nome: it && it.nome ? it.nome : 'Não informado',
                categoria: it && it.categoria ? it.categoria : 'Não informado',
                quantidade: it && typeof it.quantidade === 'number' ? it.quantidade : 'Não informado',
                prioridade: it && it.prioridade ? it.prioridade : 'Não informado',
                justificativa: it && it.justificativa ? it.justificativa : 'Não informado'
              }))
            : [],
          alternativas: Array.isArray(dadosExtraidos.alternativas_viaveis)
            ? dadosExtraidos.alternativas_viaveis.map((alt: any) => ({
                nome: alt && alt.nome ? alt.nome : 'Não informado',
                tipo: alt && alt.tipo ? alt.tipo : 'Não informado',
                vantagens: Array.isArray(alt && alt.vantagens) ? alt.vantagens : [],
                limitacoes: Array.isArray(alt && alt.limitacoes) ? alt.limitacoes : [],
                cenario_recomendado: alt && alt.cenario_recomendado ? alt.cenario_recomendado : 'Não informado'
              }))
            : [],
          prazoImplementacao: typeof dadosExtraidos.prazo_implementacao_dias === 'number' ? dadosExtraidos.prazo_implementacao_dias : 'Não informado',
          origemTipo: origem.tipo || 'Não informado',
          origemFonte: origem.fonte || 'Não informado',
          status: item && item.status ? item.status : 'Não informado',
          isRead: !!(item && item.isRead),
          attachments: Array.isArray(dadosBruto.attachments) ? dadosBruto.attachments : [],
          dadosBruto: dadosBruto
        };
      });
      setEmails(emails);
    } catch (error) {
      console.error('Erro ao carregar emails:', error);
      setEmails([]);
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
        (email.from && email.from.toLowerCase().includes(query)) ||
        (email.subject && email.subject.toLowerCase().includes(query)) ||
        (email.textoOriginal && email.textoOriginal.toLowerCase().includes(query)) ||
        (email.clienteNome && email.clienteNome.toLowerCase().includes(query)) ||
        (email.clienteEmail && email.clienteEmail.toLowerCase().includes(query))
      );
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort((a, b) => b.date.getTime() - a.date.getTime());

    setFilteredEmails(filtered);
  };

  const handleEmailClick = async (email: EmailMessage) => {
    setSelectedEmail(email);
    // Marcar como lido localmente e no backend
    if (!email.isRead) {
      setEmails(prev => prev.map(e =>
        e.id === email.id ? { ...e, isRead: true, status: 'Lido' } : e
      ));
      // Atualizar no backend (ajuste a rota se necessário)
      try {
        await fetch(`http://localhost:2000/api/prompts/with-dados-bruto/${email.id}/read`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Lido', isRead: true })
        });
      } catch (err) {
        // Silencioso, mas pode exibir toast/erro se desejar
      }
    }
    // Se for mobile, mostrar detalhes
    if (window.innerWidth < 1024) {
      setShowMobileDetails(true);
    }
  };

  const handleBackToList = () => {
    setShowMobileDetails(false);
    setSelectedEmail(null);
  };

  const handleRefresh = () => {
    loadEmails();
    loadEmailServiceStatus();
  };

  // getEmailStatusIcon removido (não usado)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              Pedidos de Cotação
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
              Pedidos recebidos e processados pelo sistema
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="glass-card px-4 py-2 text-center bg-blue-500/20 border-blue-500/30">
              <span className="text-blue-300 font-bold text-lg">{emails.length}</span>
              <span className="text-blue-200 ml-2">Pedidos</span>
            </div>
            <div className="glass-card px-4 py-2 text-center bg-green-500/20 border-green-500/30">
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
        <div className="h-full flex flex-col lg:flex-row">
          {/* Lista de Pedidos - MOBILE: só aparece se não estiver mostrando detalhes */}
          <div className={`w-full lg:w-1/2 xl:w-2/5 border-b lg:border-b-0 lg:border-r border-dark-color flex flex-col min-h-[300px] ${showMobileDetails ? 'hidden' : ''} lg:flex`}> 
            {/* Barra de Busca */}
            <div className="p-4 border-b border-dark-color bg-dark-bg">
              <div className="flex flex-col space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-secondary w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar pedidos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-hover border border-dark-color rounded-lg text-dark-primary placeholder-dark-secondary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Lista de Pedidos */}
            <div className="flex-1 force-scroll scrollable-content min-h-0 overflow-y-scroll">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                    <span className="text-dark-secondary">Carregando pedidos...</span>
                  </div>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                  <Mail className="w-12 h-12 text-dark-secondary mb-2" />
                  <p className="text-dark-secondary">
                    {searchQuery ? 'Nenhum pedido encontrado' : 'Nenhum pedido recebido ainda'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2 min-h-[800px]">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => handleEmailClick(email)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border w-full max-w-full ${
                        selectedEmail?.id === email.id
                          ? 'bg-blue-600/20 border-blue-500/50'
                          : !email.isRead
                          ? 'bg-dark-hover/50 border-transparent hover:bg-dark-hover hover:border-dark-color'
                          : 'bg-transparent border-transparent hover:bg-dark-hover/30 hover:border-dark-color'
                      }`}
                    >
                      <div className="flex items-start space-x-3 w-full">
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex flex-col space-y-1 w-full">
                            <div className="flex items-center justify-between w-full">
                              <span className={`text-sm font-medium truncate max-w-[200px] ${!email.isRead ? 'text-white' : 'text-dark-primary'}`}>
                                {email.clienteNome || 'Não informado'}
                              </span>
                              {email.status && (
                                <span className="text-xs px-2 py-0.5 rounded bg-dark-color text-dark-secondary border border-dark-hover flex-shrink-0">
                                  {email.status}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mb-1 truncate ${!email.isRead ? 'text-white font-medium' : 'text-dark-primary'}`}>
                              {email.subject || 'Não informado'}
                            </p>
                            <p className="text-xs text-dark-secondary line-clamp-2">
                              {(email.textoOriginal ? email.textoOriginal.substring(0, 100) : 'Não informado') + (email.textoOriginal && email.textoOriginal.length > 100 ? '...' : '')}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-dark-secondary">
                                  {email.date ? email.date.toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Não informado'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {!email.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Painel de detalhes mobile: só aparece se showMobileDetails=true (mobile) */}
          {showMobileDetails && selectedEmail && (
            <div className="lg:hidden flex-1 border-t border-dark-color bg-dark-bg p-4 space-y-6 animate-fade-in force-scroll scrollable-content min-h-0 overflow-y-scroll">
              <div className="min-h-[600px]"> {/* Container com altura mínima para scroll */}
                <button onClick={handleBackToList} className="mb-4 flex items-center gap-2 text-blue-400 hover:text-blue-600 font-medium">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-5 h-5"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                Voltar para lista
              </button>
              <section>
                <h3 className="text-base font-bold text-dark-primary mb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" /> Informações do Cliente
                </h3>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div><span className="font-medium">Nome:</span> {selectedEmail?.clienteNome || 'Não informado'}</div>
                  <div><span className="font-medium">E-mail:</span> {selectedEmail?.clienteEmail || 'Não informado'}</div>
                  <div><span className="font-medium">Empresa:</span> {selectedEmail?.clienteEmpresa || 'Não informado'}</div>
                  <div><span className="font-medium">Telefone:</span> {selectedEmail?.clienteTelefone || 'Não informado'}</div>
                  <div><span className="font-medium">Localização:</span> {selectedEmail?.clienteLocalizacao || 'Não informado'}</div>
                </div>
              </section>
              <section>
                <h3 className="text-base font-bold text-dark-primary mb-2 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-400" /> Conteúdo do Pedido
                </h3>
                <pre className="whitespace-pre-wrap text-dark-primary text-xs font-mono bg-dark-hover/30 p-3 rounded-lg border border-dark-color">
                  {selectedEmail?.textoOriginal || 'Não informado'}
                </pre>
              </section>
              <section>
                <h3 className="text-base font-bold text-dark-primary mb-2 flex items-center gap-2">
                  <List className="w-5 h-5 text-yellow-400" /> Itens a Comprar
                </h3>
                {selectedEmail?.itens?.length === 0 ? (
                  <p className="text-dark-secondary text-xs">Nenhum item identificado.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedEmail?.itens?.map((item, idx) => (
                      <li key={idx} className="bg-dark-hover rounded-lg p-2 border border-dark-color">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-dark-primary">{item.nome || 'Não informado'}</span>
                          <span className="text-xs text-dark-secondary">Categoria: {item.categoria || 'Não informado'}</span>
                          <span className="text-xs text-dark-secondary">Qtd: {item.quantidade ?? 'Não informado'}</span>
                          <span className="text-xs text-dark-secondary">Prioridade: {item.prioridade || 'Não informado'}</span>
                          <span className="text-xs text-dark-secondary">Justificativa: {item.justificativa || 'Não informado'}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              </div> {/* Fecha o container com altura mínima */}
            </div>
          )}

          {/* Visualização do Pedido - Desktop */}
          <div className="w-full lg:flex-1 flex-col hidden lg:flex">
            {selectedEmail ? (
              <div className="p-4 sm:p-6 border-b border-dark-color bg-dark-bg space-y-8">
                {/* Seção Cliente */}
                <section>
                  <h3 className="text-lg font-bold text-dark-primary mb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" /> Informações do Cliente
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div><span className="font-medium">Nome:</span> {selectedEmail?.clienteNome || 'Não informado'}</div>
                    <div><span className="font-medium">E-mail:</span> {selectedEmail?.clienteEmail || 'Não informado'}</div>
                    <div><span className="font-medium">Empresa:</span> {selectedEmail?.clienteEmpresa || 'Não informado'}</div>
                    <div><span className="font-medium">Telefone:</span> {selectedEmail?.clienteTelefone || 'Não informado'}</div>
                    <div><span className="font-medium">Localização:</span> {selectedEmail?.clienteLocalizacao || 'Não informado'}</div>
                  </div>
                </section>
                {/* Seção Conteúdo do Pedido */}
                <section>
                  <h3 className="text-lg font-bold text-dark-primary mb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-400" /> Conteúdo do Pedido
                  </h3>
                  <pre className="whitespace-pre-wrap text-dark-primary text-xs sm:text-sm font-mono bg-dark-hover/30 p-3 sm:p-4 rounded-lg border border-dark-color">
                    {selectedEmail?.textoOriginal || 'Não informado'}
                  </pre>
                </section>
                {/* Seção Itens a Comprar */}
                <section>
                  <h3 className="text-lg font-bold text-dark-primary mb-2 flex items-center gap-2">
                    <List className="w-5 h-5 text-yellow-400" /> Itens a Comprar
                  </h3>
                  {selectedEmail?.itens?.length === 0 ? (
                    <p className="text-dark-secondary text-sm">Nenhum item identificado.</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedEmail?.itens?.map((item, idx) => (
                        <li key={idx} className="bg-dark-hover rounded-lg p-3 border border-dark-color">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-1 sm:gap-0">
                            <span className="font-medium text-dark-primary">{item.nome || 'Não informado'}</span>
                            <span className="text-xs text-dark-secondary">Categoria: {item.categoria || 'Não informado'}</span>
                            <span className="text-xs text-dark-secondary">Qtd: {item.quantidade ?? 'Não informado'}</span>
                            <span className="text-xs text-dark-secondary">Prioridade: {item.prioridade || 'Não informado'}</span>
                          </div>
                          <div className="text-xs text-dark-secondary mt-1">Justificativa: {item.justificativa || 'Não informado'}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-6 sm:p-8">
                <div>
                  <Mail className="w-12 h-12 sm:w-16 sm:h-16 text-dark-secondary mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">
                    Selecione um pedido
                  </h3>
                  <p className="text-dark-secondary text-xs sm:text-base">
                    Escolha um pedido da lista para visualizar seu conteúdo
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
