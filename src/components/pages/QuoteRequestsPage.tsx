  // Função universal para substituir item por produto local ou web
  async function handleReplaceUniversal(produto: any, item: any, setReplaceLoading: any, setReplaceError: any, setReplaceSuccess: any, onItemReplaced: any, t: any) {
    setReplaceLoading(true);
    setReplaceError("");
    setReplaceSuccess("");
    try {
      let productId = produto.id;
      // Se produto web já tem id, trata como local
      if (!productId) {
        // Se não tem id, aí sim cria produto web
        let precoNum = 0;
        if (typeof produto.preco === 'number') {
          precoNum = produto.preco;
        } else if (typeof produto.preco === 'string') {
          precoNum = parseFloat(produto.preco.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(/,/g, '.')) || 0;
        }
        const productData = {
          fornecedor_id: produto.fornecedor_id || 1,
          codigo: produto.codigo && produto.codigo.trim() ? produto.codigo : "web-" + Date.now(),
          nome: produto.nome && produto.nome.trim() ? produto.nome : "Produto Web",
          modelo: produto.modelo && produto.modelo.trim() ? produto.modelo : "N/A",
          descricao: produto.descricao && produto.descricao.trim() ? produto.descricao : produto.nome || "Produto importado da web",
          preco: precoNum || 0,
          unidade: produto.unidade || "un",
          estoque: produto.estoque || 200,
          origem: "externo" as "externo",
          image_url: produto.image_url && produto.image_url.trim() ? produto.image_url : "https://example.com/produto-web-image.png",
          produto_url: produto.url && produto.url.trim() ? produto.url : "https://example.com/produto-web",
          categoria: produto.categoria || null,
          tags: produto.tags || [],
          disponibilidade: produto.disponibilidade || "imediata",
          especificacoes_tecnicas: produto.especificacoes_tecnicas || {},
          cadastrado_por: 1,
          cadastrado_em: new Date().toISOString(),
          atualizado_por: 1,
          atualizado_em: new Date().toISOString(),
        };
        const { create } = await import('../../api/services').then(m => m.produtoService);
  const createRes = await create(productData);
  console.log('Resposta da API ao criar produto web:', createRes);
        console.log('DEBUG createRes:', createRes);
        console.log('DEBUG createRes.data:', createRes.data);
        const newId = createRes.data?.data?.id;
        if (createRes.success && newId) {
            productId = newId;
        } else {
          let errMsg = '';
          if (typeof createRes.error === 'object') {
            errMsg = JSON.stringify(createRes.error);
          } else {
            errMsg = String(createRes.error || 'Erro desconhecido.');
          }
          setReplaceError('Erro ao criar produto web: ' + errMsg);
          setReplaceLoading(false);
          return;
        }
      }
      // Chama o replace
      const { replaceProduct } = await import('../../api/services').then(m => m.produtoService);
      const res = await replaceProduct(item.id, productId);
      if (res.success) {
        setReplaceSuccess(`${t("quoteRequests.itemReplacedSuccess")} (ID usado: ${productId})`);
        // Se o item tinha status false, atualiza para true
        if (item.status === false) {
          item.status = true;
        }
        if (onItemReplaced) onItemReplaced();
      } else {
        setReplaceError(`${res.error || t("quoteRequests.errorReplacingItem")}. (ID usado: ${productId})`);
      }
    } catch (e) {
      setReplaceError(t("quoteRequests.errorReplacingItem"));
    }
    setReplaceLoading(false);
  }
import React from "react";
import { ExportFormat } from "../../utils/exportCotacaoPdf";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../hooks/useCurrency";
// Componente para exibir detalhes do item e submodal

type ItemDetalheCardProps = { item: any, onItemReplaced?: () => void, isLight?: boolean };

const ItemDetalheCard = ({ item, onItemReplaced, isLight = false }: ItemDetalheCardProps) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [open, setOpen] = React.useState(false);
  const [showReplace, setShowReplace] = React.useState(false);
  const [sugeridosLocal, setSugeridosLocal] = React.useState<any[]>([]);
  const [sugeridosWeb, setSugeridosWeb] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [loadingSugeridos, setLoadingSugeridos] = React.useState(false);
  const [replaceLoading, setReplaceLoading] = React.useState(false);
  const [replaceError, setReplaceError] = React.useState("");
  const [replaceSuccess, setReplaceSuccess] = React.useState("");

  // Buscar sugestões locais e web ao abrir modal
  const fetchSugeridos = async () => {
    console.log('fetchSugeridos chamado para item.id:', item.id);
    setLoadingSugeridos(true);
    setReplaceError("");
    try {
      const api = (await import('../../api/client')).default;
      const [localRes, webRes] = await Promise.all([
        api.get(`/cotacoes-itens/sugeridos/local/${item.id}`).then(r => r.data),
        api.get(`/cotacoes-itens/sugeridos/web/${item.id}`).then(r => r.data)
      ]);
      setSugeridosLocal(Array.isArray(localRes) ? localRes : []);
      setSugeridosWeb(Array.isArray(webRes) ? webRes : []);
    } catch (e) {
      setReplaceError(t("quoteRequests.errorFetchingProducts"));
    }
    setLoadingSugeridos(false);
  };


  // Filtro de produtos
  const sugeridosLocalFiltrados = sugeridosLocal.filter(p =>
    p.nome?.toLowerCase().includes(search.toLowerCase())
  );
  const sugeridosWebFiltrados = sugeridosWeb.filter(p =>
    p.nome?.toLowerCase().includes(search.toLowerCase())
  );

  return (
  <div className={`border rounded-xl p-3 sm:p-4 md:p-6 flex flex-col gap-3 sm:gap-4 shadow-lg text-sm sm:text-base md:text-lg w-full overflow-hidden ${item.status === false ? 'bg-red-900/60 border-red-500/60 text-red-200' : 'bg-slate-800/60 border-cyan-900/30 text-white'}`}>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm sm:text-base break-words">
            {item.item_nome && item.item_nome.length > 50
              ? item.item_nome.slice(0, 50) + '...'
              : item.item_nome}
          </div>
          <div className="text-slate-400 text-xs mt-1 break-words">
            {t("quoteRequests.supplierLabel")}: <span className="text-cyan-300">{item.provider || item.fornecedor || '-'}</span>
          </div>
          <div className="text-slate-400 text-xs break-words">
            {t("quoteRequests.originLabel")}: <span className="text-cyan-300">{item.origem || '-'}</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          {/* Informações de preço responsivas */}
          <div className="flex flex-col sm:text-right order-2 sm:order-1">
            <div className="text-slate-300 text-xs sm:text-sm">
              {t("quoteRequests.quantityLabel")}: <b>{item.quantidade}</b>
            </div>
            <div className="text-slate-300 text-xs sm:text-sm break-words">
              {t("quoteRequests.priceLabel")}: <b>{item.item_preco} {item.item_moeda}</b>
            </div>
            <div className="text-slate-300 text-xs sm:text-sm break-words">
              {t("quoteRequests.subtotalLabel")}: <b>{formatCurrency(item.quantidade * item.item_preco)}</b>
            </div>
          </div>
          
          {/* Botões responsivos */}
          <div className="flex flex-row sm:flex-col gap-2 order-1 sm:order-2">
            <button 
              onClick={() => setOpen(true)} 
              className="flex-1 sm:flex-none bg-cyan-900/30 hover:bg-cyan-700/40 text-cyan-300 border border-cyan-700/40 px-2 sm:px-3 py-1 sm:py-1 rounded text-xs font-semibold transition-all min-h-[32px] sm:min-h-auto"
            >
              {t("quoteRequests.itemDetails")}
            </button>
            {item.status === true && (
              <button 
                onClick={() => { setShowReplace(v => { if (!v) fetchSugeridos(); return !v; }); }} 
                className="flex-1 sm:flex-none bg-blue-900/30 hover:bg-blue-700/40 text-blue-300 border border-blue-700/40 px-2 sm:px-3 py-1 sm:py-1 rounded text-xs font-semibold transition-all min-h-[32px] sm:min-h-auto"
              >
                {t("quoteRequests.replaceItem")}
              </button>
            )}
            {item.status === false && (
              <button 
                onClick={() => { setShowReplace(v => { if (!v) fetchSugeridos(); return !v; }); }} 
                className="flex-1 sm:flex-none bg-green-900/30 hover:bg-green-700/40 text-green-300 border border-green-700/40 px-2 sm:px-3 py-1 sm:py-1 rounded text-xs font-semibold transition-all min-h-[32px] sm:min-h-auto"
              >
                Adicionar Item
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Descrição responsiva */}
      <div className="text-slate-300 text-xs mt-2 break-words">
        {item.item_descricao && item.item_descricao.length > 50
          ? item.item_descricao.slice(0, 50) + '...'
          : item.item_descricao}
      </div>
      {showReplace && (
        <div className="mt-3 sm:mt-4 p-6 sm:p-8 bg-slate-900/90 border border-cyan-700/30 rounded-2xl w-full overflow-hidden min-h-[400px] max-h-[80vh]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4">
            <input
              type="text"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-white border border-cyan-700/30 focus:border-cyan-400 outline-none text-base min-w-0"
              placeholder={t("quoteRequests.searchProduct")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={loadingSugeridos}
            />
            <Search className="w-5 h-5 text-cyan-400" />
          </div>
          {replaceError && <div className="text-red-400 text-base mb-3 break-words">{replaceError}</div>}
          {replaceSuccess && <div className="text-green-400 text-base mb-3 animate-pulse break-words">{replaceSuccess}</div>}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-800 flex flex-col gap-6">
            {/* SUGESTÕES LOCAIS */}
            <div>
              <h3 className="text-cyan-300 text-lg font-bold mb-2">Sugestões Locais</h3>
              {loadingSugeridos ? (
                <div className="text-slate-400 text-base p-4 text-center">{t("quoteRequests.loadingProducts")}</div>
              ) : sugeridosLocalFiltrados.length === 0 ? (
                <div className="text-slate-400 text-base p-4 text-center">Nenhum produto local encontrado.</div>
              ) : sugeridosLocalFiltrados.map(prod => (
                <button
                  key={prod.id}
                  className="w-full text-left px-4 py-3 hover:bg-cyan-800/30 rounded text-cyan-200 text-base flex items-center gap-2 transition-all break-words min-h-[44px]"
                  onClick={() => handleReplaceUniversal(prod, item, setReplaceLoading, setReplaceError, setReplaceSuccess, onItemReplaced, t)}
                  disabled={replaceLoading}
                >
                  <Search className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="break-words">{prod.nome}</span>
                </button>
              ))}
            </div>
            {/* SUGESTÕES WEB */}
            <div>
              <h3 className="text-blue-300 text-lg font-bold mb-2">Sugestões Web</h3>
              {loadingSugeridos ? (
                <div className="text-slate-400 text-base p-4 text-center">{t("quoteRequests.loadingProducts")}</div>
              ) : sugeridosWebFiltrados.length === 0 ? (
                <div className="text-slate-400 text-base p-4 text-center">Nenhum produto web encontrado.</div>
              ) : sugeridosWebFiltrados.map((prod, idx) => (
                <button
                  key={prod.url || prod.id || idx}
                  className="w-full text-left px-4 py-3 hover:bg-blue-800/30 rounded text-blue-200 text-base flex items-center gap-2 transition-all break-words min-h-[44px]"
                  onClick={() => handleReplaceUniversal(prod, item, setReplaceLoading, setReplaceError, setReplaceSuccess, onItemReplaced, t)}
                  disabled={replaceLoading}
                >
                  <Search className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="break-words">{prod.nome}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Submodal para detalhes completos - Layout de Fatura 100% Responsivo */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] overflow-y-auto bg-slate-900/95 border border-cyan-400/30 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl m-2 sm:m-4">
          <DialogHeader className="pb-3 sm:pb-4">
            <DialogTitle className="text-cyan-300 text-lg sm:text-xl md:text-2xl flex items-center gap-2 flex-wrap">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="break-words">{t("quoteRequests.invoiceTitle", "Fatura do Item")}</span>
            </DialogTitle>
          </DialogHeader>
          
          {/* Layout de Fatura Responsivo */}
          <div className="bg-white/5 border border-slate-600/30 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mt-3 sm:mt-4">
            {/* Cabeçalho da Fatura Responsivo */}
            <div className="border-b border-slate-600/30 pb-3 sm:pb-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-300 mb-1 sm:mb-2 break-words">FATURA DE ITEM</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Detalhes da cotação solicitada</p>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <p className="text-slate-400 text-xs sm:text-sm">Data: {new Date().toLocaleDateString('pt-PT')}</p>
                  <p className="text-slate-400 text-xs sm:text-sm break-all">ID: #{item.id || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Informações do Item - Grid Responsivo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
              {/* Informações do Produto */}
              <div className="space-y-3">
                <h4 className="text-base sm:text-lg font-semibold text-cyan-300 border-b border-slate-600/30 pb-2">Informações do Produto</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-slate-400 text-sm font-medium flex-shrink-0">Nome:</span> 
                    <span className="text-white font-medium text-sm break-words">{item.item_nome}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-slate-400 text-sm font-medium flex-shrink-0">Descrição:</span> 
                    <span className="text-white text-sm break-words">{item.item_descricao || '-'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-slate-400 text-sm font-medium flex-shrink-0">Fornecedor:</span> 
                    <span className="text-cyan-300 font-medium text-sm break-words">{item.provider || item.fornecedor || '-'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-slate-400 text-sm font-medium flex-shrink-0">Origem:</span> 
                    <span className="text-white text-sm break-words">{item.origem || '-'}</span>
                  </div>
                </div>
              </div>
              
              {/* Detalhes Financeiros */}
              <div className="space-y-3">
                <h4 className="text-base sm:text-lg font-semibold text-cyan-300 border-b border-slate-600/30 pb-2">Detalhes Financeiros</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-slate-400 text-sm font-medium flex-shrink-0">Preço Unitário:</span> 
                    <span className="text-green-400 font-bold text-sm break-words">{item.item_preco} {item.item_moeda}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-slate-400 text-sm font-medium flex-shrink-0">Quantidade:</span> 
                    <span className="text-white font-medium text-sm">{item.quantidade}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-slate-400 text-sm font-medium flex-shrink-0">Moeda:</span> 
                    <span className="text-white text-sm">{item.item_moeda}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total da Fatura - Responsivo */}
            <div className="border-t border-slate-600/30 pt-3 sm:pt-4">
              <div className="flex justify-center sm:justify-end">
                <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4 w-full sm:w-auto sm:min-w-64 max-w-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                    <span className="text-base sm:text-lg font-semibold text-slate-300 text-center sm:text-left">Total:</span>
                    <span className="text-xl sm:text-2xl font-bold text-green-400 text-center sm:text-right break-all">{formatCurrency(item.quantidade * item.item_preco)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Botões Responsivos */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 w-full">
            <button 
              onClick={() => setOpen(false)} 
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg rounded-md bg-cyan-700/60 hover:bg-cyan-600/70 text-cyan-100 border border-cyan-600/60 font-semibold transition-all duration-200 min-h-[44px]"
            >
              {t("quoteRequests.close")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Search,
  Eye,
  Download,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Building,
  User,
  Check,
  Info,
  SortAsc,
  SortDesc,
  Plus,
} from "lucide-react";
import { cotacaoService, relatorioService } from "../../api/services";
import api from '../../api/client';

interface QuoteRequestsPageProps {
  onNavigateToNewQuote?: () => void;
  isLight?: boolean;
}

const getStatusFromAprovacao = (cotacao: any) => {
  if (cotacao.aprovacao === true) return "approved";
  if (cotacao.aprovacao === false) return "pending_approval";
  return "pending_approval"; // null ou undefined também é pendente
};

const getStatusBadge = (cotacao: any) => {
  const status = getStatusFromAprovacao(cotacao);
  if (status === "approved") {
    return (
      <Badge className="bg-green-600 text-white text-xs">Aprovado</Badge>
    );
  } else {
    return (
      <Badge className="bg-orange-600 text-white text-xs">Pendente</Badge>
    );
  }
};

const getStatusIcon = (cotacao: any) => {
  const status = getStatusFromAprovacao(cotacao);
  if (status === "approved") {
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  } else {
    return <AlertTriangle className="w-4 h-4 text-orange-400" />;
  }
};

export function QuoteRequestsPage({
  onNavigateToNewQuote,
  isLight = false,
}: QuoteRequestsPageProps = {}) {
  const { t } = useTranslation();
  const { formatCurrency, currency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [fornecedorFilter, setFornecedorFilter] = useState("Todos");
  const [dateFilter, setDateFilter] = useState("Todas");
  const [valueFilter, setValueFilter] = useState("Todos");
  const [sortBy, setSortBy] = useState("data");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [cotacoesList, setCotacoesList] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number|null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('smartquote_auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        const uid = parsed?.user?.id;
        if (typeof uid === 'number') setCurrentUserId(uid);
      }
    } catch {}
  }, []);

  // Sincronizar cotações locais com o contexto global
  useEffect(() => {
    async function fetchCotacoes() {
      try {
        const response = await cotacaoService.getAll();
        // Corrigir para acessar o array de cotações em response.data.data
        const cotacoesArr = Array.isArray(response.data?.data) ? response.data.data : [];
        console.log('Cotações recebidas da API:', cotacoesArr);
        // Mapeia os campos para garantir compatibilidade com o frontend
        const mappedCotacoes = cotacoesArr.map((c: any) => ({
          ...c,
          cliente: c.cliente || c.nome_cliente || c.solicitante || '',
          produto: c.produto || c.nome_produto || '',
          fornecedor: c.fornecedor || c.nome_fornecedor || '',
          prioridade: c.prioridade || c.priority || '',
          status: c.status || '',
          aprovacao: c.aprovacao,
          valor: c.valor || c.orcamento_geral || '',
          quantidade: c.quantidade || '',
          aprovado_por: c.aprovado_por || c.aprovador || '',
          motivo: c.motivo || '',
          condicoes: c.condicoes || '',
          dataRecebido: c.dataRecebido || c.cadastrado_em || c.data_solicitacao || '',
          prazoResposta: c.prazoResposta || c.prazo_validade || '',
          orcamento_geral: c.orcamento_geral || c.valor || '',
        }));
  // Exibe todas as cotações, sem filtrar por prazo_validade
  setCotacoesList(mappedCotacoes);
      } catch (error) {
        setCotacoesList([]);
        console.error('Erro ao buscar cotações:', error);
      }
    }
    fetchCotacoes();
  }, []);

  // Estados para o modal de detalhes
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCotacao, setSelectedCotacao] = useState<any>(null);

  // Estados para o formulário de nova cotação
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Estado para os itens da cotação
  const [cotacaoItens, setCotacaoItens] = useState<any[]>([]);
  // Modal de erro PDF
  const [pdfErrorModal, setPdfErrorModal] = useState<{open: boolean; message: string}>({open: false, message: ""});
  
  // Modal de escolha de formato de download
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  
  // Estado para formato de exportação (removido pois não está sendo usado)
  // const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');

  // Função para exportar cotação no formato escolhido (removida pois não está sendo usada)
  // const handleExportCotacao = () => {

  // Função para exportar cotação com formato específico (usada pelo modal de download)
  const handleDownloadWithFormat = async (format: ExportFormat) => {
    if (!selectedCotacao) return;
    
    try {
      let response;
      
      switch (format) {
        case 'pdf':
          response = await relatorioService.gerarPDF(selectedCotacao.id);
          break;
        case 'xlsx':
          response = await relatorioService.gerarExcel(selectedCotacao.id);
          break;
        case 'csv':
          response = await relatorioService.gerarCSV(selectedCotacao.id);
          break;
        default:
          throw new Error('Formato não suportado');
      }
      
      if (response.success) {
        // Download iniciado com sucesso
        window.dispatchEvent(new CustomEvent('toast', { 
          detail: { 
            type: 'success', 
            message: `Download ${format.toUpperCase()} iniciado com sucesso!` 
          } 
        }));
      } else {
        // Erro no download
        window.dispatchEvent(new CustomEvent('toast', { 
          detail: { 
            type: 'error', 
            message: response.error || `Erro ao baixar ${format.toUpperCase()}` 
          } 
        }));
      }
    } catch (error) {
      console.error('Erro no download:', error);
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { 
          type: 'error', 
          message: `Erro ao processar download ${format.toUpperCase()}` 
        } 
      }));
    }
    
    setIsDownloadModalOpen(false);
  };

  // Função para abrir o modal de download
  const handleOpenDownloadModal = () => {
    setIsDownloadModalOpen(true);
  };

  // Função para lidar com download de uma cotação específica
  const handleDownload = (cotacao: any) => {
    setSelectedCotacao(cotacao);
    setIsDownloadModalOpen(true);
  };

  // Função para buscar itens da cotação (usada também como callback de atualização)
  const fetchCotacaoItens = () => {
    if (selectedCotacao && selectedCotacao.id) {
      api.get(`/cotacoes-itens?cotacao_id=${selectedCotacao.id}`)
        .then(res => setCotacaoItens(Array.isArray(res.data) ? res.data : []))
        .catch(() => setCotacaoItens([]));
    } else {
      setCotacaoItens([]);
    }
  };
  // Buscar itens ao abrir detalhes
  useEffect(() => {
    fetchCotacaoItens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCotacao]);

  // Extrair valores únicos para os filtros
  const uniqueFornecedores = [
    ...new Set(cotacoesList.map((c) => c.fornecedor)),
  ];

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("Todos");
    setPriorityFilter("Todas");
    setFornecedorFilter("Todos");
    setDateFilter("Todas");
    setValueFilter("Todos");
    setSortBy("data");
    setSortOrder("desc");
  };


  // Modal de motivo para aprovar / rejeitar / reativar
  const [approvalModal, setApprovalModal] = useState<{open:boolean; action:'approve'|'set_pending'|'reject'; cotacaoId:string|null}>({open:false, action:'approve', cotacaoId:null});
  const [motivoInput, setMotivoInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Feedback visual de envio
  const openApproval = (id:string, action:'approve'|'set_pending'|'reject') => {
    setMotivoInput('');
    setIsSubmitting(false);
    setApprovalModal({open:true, action, cotacaoId:id});
  };
  const closeApproval = () => {
    setMotivoInput('');
    setIsSubmitting(false);
    setApprovalModal(p=>({...p, open:false}));
  };
  // Submissão com feedback visual e validação
  const submitApproval = async () => {
    if (!approvalModal.cotacaoId) return;
    const id = approvalModal.cotacaoId;
    const action = approvalModal.action;
    const isApprove = action === 'approve';
    const isPending = action === 'set_pending';
    
    if (!motivoInput.trim()) {
      setIsSubmitting(false);
      setMotivoInput("");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload:any = { aprovacao: isApprove, motivo: motivoInput };
      if (currentUserId != null) {
        payload.aprovado_por = currentUserId; // envia id do usuário logado
      }
      
      // Define status baseado na aprovação
      if (isApprove) {
        payload.status = 'completa';
        payload.data_aprovacao = new Date().toISOString();
      } else if (isPending) {
        payload.status = 'incompleta';
        payload.data_aprovacao = null;
      }
      
      const resp = await cotacaoService.update(String(id), payload);
      if (resp.success) {
        setCotacoesList(prev => prev.map(c => {
          if (String(c.id) !== String(id)) return c;
          // Atualiza campos baseado na ação
          return {
            ...c,
            aprovacao: isApprove,
            status: isApprove ? 'completa' : 'incompleta',
            motivo: motivoInput,
            data_aprovacao: isApprove ? new Date().toISOString() : null,
            aprovado_por: currentUserId != null ? currentUserId : c.aprovado_por
          };
        }));
        window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: t("quoteRequests.quotationUpdatedSuccess") } }));
        setMotivoInput("");
      } else {
        window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: resp.error || t("quoteRequests.updateApprovalError") } }));
      }
    } catch (e) {
      console.error('Erro ao atualizar aprovação:', e);
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: t("quoteRequests.generalUpdateError") } }));
    } finally {
      setIsSubmitting(false);
      closeApproval();
    }
  };

  // (removido handleIncreaseQuantity não utilizado)

  // Função para visualizar detalhes
  const handleViewDetails = (cotacaoId: string | number) => {
    const idStr = String(cotacaoId);
    const cotacao = cotacoesList.find(c => String(c.id) === idStr);
    if (cotacao) {
      setSelectedCotacao(cotacao);
      setIsDetailModalOpen(true);
    } else {
      setSelectedCotacao(null);
      setCotacaoItens([]);
      setIsDetailModalOpen(true);
    }
  };

  // Memoização para performance
  const QuoteCard = React.memo(({
    cotacao,
    onViewDetails,
    onDownload,
    isLight,
  }: {
    cotacao: any;
    onViewDetails: (id: string) => void;
    onDownload: (cotacao: any) => void;
    isLight?: boolean;
  }) => (
  <div className={`glass-card ${isLight ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-blue-400/60' : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 hover:border-cyan-400/30'} rounded-xl p-3 sm:p-4 backdrop-blur-sm transition-all duration-300 group relative w-full max-w-screen overflow-x-auto`}>
      {/* Borda lateral de status */}
      <div
        className={`absolute left-0 top-0 w-1 h-full rounded-l-xl ${
          cotacao.status === "pending_approval"
            ? "bg-orange-500"
            : cotacao.status === "processing"
            ? "bg-blue-500"
            : cotacao.status === "processed" || cotacao.status === "approved"
            ? "bg-green-500"
            : cotacao.status === "rejected"
            ? "bg-red-500"
            : "bg-purple-500"
        }`}
      ></div>

  <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-2 sm:space-y-3 lg:space-y-0 lg:space-x-4">
  <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            {getStatusIcon(cotacao)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3">
              <div className="flex flex-col">
                <h3 className={`font-mono text-base font-bold ${isLight ? 'text-gray-800 group-hover:text-blue-600' : 'text-white group-hover:text-cyan-400'} transition-colors duration-300`}>
                  {cotacao.id}
                </h3>
                {cotacao.prompt && cotacao.prompt.texto_original && (
                  <span className={`block text-lg font-semibold ${isLight ? 'text-blue-600' : 'text-cyan-300'} mt-1 truncate`} title={cotacao.prompt.texto_original}>
                    {cotacao.prompt.texto_original.length > 50
                      ? cotacao.prompt.texto_original.slice(0, 50) + '...'
                      : cotacao.prompt.texto_original}
                  </span>
                )}
              </div>
              <div className="flex items-center mb-1 sm:mb-0 sm:ml-2 sm:justify-end w-full sm:w-auto">
                {getStatusBadge(cotacao)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Building className={`w-4 h-4 ${isLight ? 'text-gray-500' : 'text-slate-400'} flex-shrink-0`} />
                <span className={`font-medium ${isLight ? 'text-gray-800' : 'text-white'} text-sm`}>
                  {cotacao.aprovado_por}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className={`w-4 h-4 ${isLight ? 'text-gray-500' : 'text-slate-400'} flex-shrink-0`} />
                <span className={`${isLight ? 'text-gray-600' : 'text-slate-300'} text-sm`}>
                  {cotacao.motivo}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User className={`w-4 h-4 ${isLight ? 'text-gray-500' : 'text-slate-400'} flex-shrink-0`} />
                <span className={`${isLight ? 'text-gray-600' : 'text-slate-300'} text-sm`}>
                  {t("approvals.responsible")}:{" "}
                  <span className={`${isLight ? 'text-gray-800' : 'text-white'} font-medium`}>
                    {cotacao.aprovado_por}
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 text-xs">
              <div className={`${isLight ? 'bg-gray-100 border-gray-200' : 'bg-slate-800/30 border-slate-700/50'} rounded-lg p-2 border`}>
                <span className={`${isLight ? 'text-gray-500' : 'text-slate-400'} text-xs block mb-1`}>
                  Fornecedor:
                </span>
                <span className={`${isLight ? 'text-gray-800' : 'text-white'} font-medium`}>
                  {cotacao.fornecedor && cotacao.fornecedor !== '' ? cotacao.fornecedor : '-'}
                </span>
              </div>
              <div className={`${isLight ? 'bg-gray-100 border-gray-200' : 'bg-slate-800/30 border-slate-700/50'} rounded-lg p-2 border`}>
                <span className={`${isLight ? 'text-gray-500' : 'text-slate-400'} text-xs block mb-1`}>
                  {t("quoteRequests.received")}:
                </span>
                <span className={`${isLight ? 'text-gray-800' : 'text-white'} font-medium`}>
                  {new Date(cotacao.dataRecebido).toLocaleDateString("pt-PT")}
                </span>
              </div>
              <div className={`${isLight ? 'bg-gray-100 border-gray-200' : 'bg-slate-800/30 border-slate-700/50'} rounded-lg p-2 border col-span-2 lg:col-span-1`}>
                <span className={`${isLight ? 'text-gray-500' : 'text-slate-400'} text-xs block mb-1`}>
                  {t("approvals.deadline")}:
                </span>
                <span className={`${isLight ? 'text-gray-800' : 'text-white'} font-medium`}>
                  {new Date(cotacao.prazoResposta).toLocaleDateString("pt-PT")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Valor e Actions */}
  <div className="flex flex-col space-y-2 sm:space-y-3 min-w-0 lg:min-w-[140px]">
          <div className={`${isLight ? 'bg-green-50 border-green-200' : 'bg-green-500/10 border-green-500/30'} rounded-lg p-3 border text-center`}>
            <div className="flex items-center justify-center space-x-1 mb-1">
              <span className={`text-sm ${isLight ? 'text-green-600' : 'text-green-400'} font-medium`}>{currency.symbol}</span>
              <span className={`text-xs ${isLight ? 'text-green-600' : 'text-green-400'} font-medium`}>
                {t("approvals.value")}
              </span>
            </div>
            <div className={`text-lg font-bold ${isLight ? 'text-green-700' : 'text-green-400'}`}>
              {formatCurrency(parseFloat(cotacao.orcamento_geral) || 0, false)}
            </div>
          </div>

          {/* Aviso de Aprovação Especial removido conforme solicitado */}

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full mt-2">
            {/* Botões de ação baseados no campo aprovacao */}
            {cotacao.aprovacao !== true ? (
              /* Pendente - mostra botão de aprovar */
              <>
                <button
                  onClick={() => openApproval(String(cotacao.id),'approve')}
                  aria-label="Aprovar cotação"
                  className={`${isLight ? 'bg-green-100 hover:bg-green-200 border-green-300 text-green-700 hover:text-green-800 focus:ring-green-500' : 'bg-green-600/20 hover:bg-green-600/40 border-green-500/30 text-green-400 hover:text-green-300 focus:ring-green-400'} hover:border-green-400/60 border px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-105 focus:outline-none focus:ring-2`}
                >
                  <Check className="w-3 h-3" />
                  <span>Aprovar</span>
                </button>
                <button
                  onClick={() => onViewDetails(cotacao.id)}
                  aria-label="Ver detalhes da cotação"
                  className={`${isLight ? 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 hover:text-blue-800 focus:ring-blue-500' : 'bg-blue-600/20 hover:bg-blue-600/40 border-blue-500/30 text-blue-400 hover:text-blue-300 focus:ring-blue-400'} hover:border-blue-400/60 border px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-105 focus:outline-none focus:ring-2`}
                >
                  <Info className="w-3 h-3" />
                  <span>Ver Detalhes</span>
                </button>
              </>
            ) : (
              /* Aprovado - mostra botão para colocar como pendente */
              <>
                <button
                  onClick={() => onViewDetails(cotacao.id)}
                  aria-label="Visualizar cotação"
                  className={`${isLight ? 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 hover:text-blue-800 focus:ring-blue-500' : 'bg-blue-600/20 hover:bg-blue-600/40 border-blue-500/30 text-blue-400 hover:text-blue-300 focus:ring-blue-400'} hover:border-blue-400/60 border px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-105 focus:outline-none focus:ring-2`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Visualizar</span>
                </button>
                <button 
                  onClick={() => onDownload(cotacao)}
                  className={`${isLight ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 hover:text-purple-700 focus:ring-purple-500' : 'bg-slate-700/50 hover:bg-slate-600/70 border-slate-600/50 text-slate-300 hover:text-purple-300 focus:ring-purple-400'} hover:border-purple-500/30 border px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-105 focus:outline-none focus:ring-2`} 
                  aria-label="Download"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => openApproval(String(cotacao.id),'set_pending')}
                  aria-label="Colocar como pendente"
                  className={`${isLight ? 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-700 hover:text-orange-800 focus:ring-orange-500' : 'bg-orange-600/20 hover:bg-orange-600/40 border-orange-500/30 text-orange-400 hover:text-orange-300 focus:ring-orange-400'} hover:border-orange-400/60 border px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-105 focus:outline-none focus:ring-2`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Pendente</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  ));

  // Lógica de filtragem
  const filteredCotacoes = cotacoesList.filter((cotacao) => {
    const matchesSearch = searchTerm === "" || 
      (cotacao.cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cotacao.produto || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cotacao.id ? String(cotacao.id) : "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cotacao.fornecedor || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "Todos" || cotacao.status === statusFilter;
    const matchesPriority = priorityFilter === "Todas" || cotacao.prioridade === priorityFilter;
    const matchesFornecedor = fornecedorFilter === "Todos" || cotacao.fornecedor === fornecedorFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesFornecedor;
  });


  // Estado para aba ativa
  const [activeTab, setActiveTab] = useState('all');

  // Função para obter o filtro de cada aba
  const getTabFilter = (tab: string) => {
    if (tab === 'pending') {
      return (c: any) => c.aprovacao !== true;
    }
    if (tab === 'approved') {
      return (c: any) => c.aprovacao === true;
    }
    if (tab === 'rejected') {
      return () => false; // Sem rejeitados por enquanto
    }
    // Todas
    return () => true;
  };

  // Função para obter o total de páginas da aba ativa
  const getTotalPages = () => {
    // Primeiro aplica os filtros de pesquisa, depois o filtro da aba
    const filtered = filteredCotacoes.filter(getTabFilter(activeTab));
    return Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  };

  // Sempre que currentPage for maior que o total da aba, ajusta
  useEffect(() => {
    const total = getTotalPages();
    if (currentPage > total) {
      setCurrentPage(total);
    }
  }, [activeTab, cotacoesList, itemsPerPage, currentPage]);

  // Resetar página ao trocar de aba
  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  // Contar filtros ativos
  const activeFiltersCount = [
    searchTerm !== "",
    statusFilter !== "Todos",
    priorityFilter !== "Todas",
    fornecedorFilter !== "Todos",
    dateFilter !== "Todas",
    valueFilter !== "Todos"
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header - Compacto no mobile */}
      <header className={`${isLight ? 'bg-white border-gray-200' : 'bg-dark-bg border-dark-color'} border-b px-4 lg:px-8 py-1 md:py-4 lg:py-6 flex-shrink-0`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-1 md:space-y-4 lg:space-y-0">
          <div className="hidden md:block">
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${isLight ? 'text-gray-800' : 'text-dark-primary'} flex items-center gap-3`}>
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              {t("quoteRequests.title")}
              {activeFiltersCount > 0 && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                  {activeFiltersCount} {activeFiltersCount > 1 ? t("quoteRequests.filtersActive") : t("quoteRequests.filterActive")}{" "}
                  {activeFiltersCount > 1 ? t("quoteRequests.filterActivePlural") : t("quoteRequests.filterActiveSingular")}
                </span>
              )}
            </h1>
            <p className={`text-sm sm:text-base ${isLight ? 'text-gray-600' : 'text-dark-secondary'} mt-2`}>
              {t("quoteRequests.subtitle")}
              {activeFiltersCount > 0 && (
                <span className="text-blue-400 ml-2">
                  • {filteredCotacoes.length} {t("quoteRequests.totalOf")} {cotacoesList.length}{" "}
                  {t("quoteRequests.results")}
                </span>
              )}
            </p>
          </div>
          
          {/* Header mobile compacto */}
          <div className="md:hidden flex items-center justify-between">
            <h1 className={`text-lg font-bold ${isLight ? 'text-gray-800' : 'text-dark-primary'} flex items-center gap-2`}>
              <FileText className="w-5 h-5 text-blue-400" />
              {t("quoteRequests.title")}
            </h1>
            <span className={`${isLight ? 'text-blue-600' : 'text-blue-300'} font-bold text-sm`}>
              {filteredCotacoes.length}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-1 md:space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="hidden md:flex items-center gap-3 w-full justify-center">
              <div className={`glass-card ${isLight ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-white/5 border-blue-500/30 text-blue-300'} px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 text-sm min-w-[160px] h-[44px]`}>
                <span className="font-bold text-lg">{filteredCotacoes.length}</span>
                <span className={`ml-2 ${isLight ? 'text-blue-600' : 'text-blue-200'}`}>{t("quoteRequests.quotations")}</span>
                {filteredCotacoes.length !== cotacoesList.length && (
                  <span className={`${isLight ? 'text-gray-500' : 'text-slate-400'} text-xs block ml-2`}>
                    {t("quoteRequests.totalOf")} {cotacoesList.length} {t("quoteRequests.total")}
                  </span>
                )}
              </div>
              {onNavigateToNewQuote ? (
                <Button
                  onClick={onNavigateToNewQuote}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 text-sm md:text-base min-w-[160px] h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t("quoteRequests.newQuote")}</span>
                </Button>
              ) : (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 text-sm md:text-base min-w-[160px] h-[44px]">
                      <Plus className="w-4 h-4" />
                      <span>{t("quoteRequests.newQuote")}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-dark-card border-dark-color">
                    {/* ...existing code for dialog content... */}
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={`flex-1 dashboard-main p-3 md:p-4 lg:p-8 ${isLight ? 'bg-gray-50' : 'bg-dark-bg'} overflow-hidden`}>
  <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 md:mb-6 space-y-3 md:space-y-4 lg:space-y-0 flex-shrink-0">
            {/* Tabs - ocultas no mobile */}
            <TabsList className={`hidden md:flex ${isLight ? 'bg-gray-200 border-gray-300' : 'bg-slate-800/50 border-slate-700/50'} backdrop-blur-sm rounded-xl p-1 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent`}>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 text-xs sm:text-sm hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200 whitespace-nowrap px-2 py-2 sm:px-4 min-w-max"
              >
                {t("quoteRequests.allTab")} ({filteredCotacoes.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300 text-xs sm:text-sm hover:bg-orange-500/20 hover:text-orange-300 transition-all duration-200 whitespace-nowrap px-2 py-2 sm:px-4 min-w-max"
              >
                {t("quoteRequests.pendingTab")} ({filteredCotacoes.filter(getTabFilter('pending')).length})
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-slate-300 text-xs sm:text-sm hover:bg-green-500/20 hover:text-green-300 transition-all duration-200 whitespace-nowrap px-2 py-2 sm:px-4 min-w-max"
              >
                {t("quoteRequests.approvedTab")} ({filteredCotacoes.filter(getTabFilter('approved')).length})
              </TabsTrigger>
            </TabsList>

            {/* Filtros Melhorados */}
            <div className="flex flex-col space-y-1 md:space-y-4">
              {/* Linha Principal de Filtros */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-1 md:space-y-3 lg:space-y-0 lg:space-x-4">
                {/* Pesquisa - sempre visível */}
                <div className="relative group flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70 group-hover:text-blue-400 transition-colors duration-200 z-10 pointer-events-none" />
                  <Input
                    placeholder={t("quoteRequests.searchByClient")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 w-full bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-10 md:h-auto"
                  />
                </div>

                {/* Paginação sempre visível, inclusive no mobile */}
                <div className="flex items-center gap-2 ml-auto justify-end mt-2 md:mt-0">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 font-semibold text-sm disabled:opacity-50"
                    disabled={currentPage === 1}
                  >
                    {t("quoteRequests.previous")}
                  </button>
                  <span className="text-slate-300 font-medium text-sm">
                    {t("quoteRequests.page")} {currentPage} {t("quoteRequests.of")} {getTotalPages()}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(getTotalPages(), p + 1))}
                    className="px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 font-semibold text-sm disabled:opacity-50"
                    disabled={currentPage === getTotalPages()}
                  >
                    {t("quoteRequests.next")}
                  </button>
                </div>
              </div>

              {/* Filtros Avançados (Expansíveis) - ocultos no mobile */}
              {showAdvancedFilters && (
                <div className="hidden md:block glass-card bg-slate-800/30 rounded-lg p-3 sm:p-4 border border-slate-700/50 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Filtro por Fornecedor */}
                    <div>
                      <label className="text-slate-300 text-xs font-medium mb-2 block">
                        {t("quoteRequests.supplier")}
                      </label>
                      <Select
                        value={fornecedorFilter}
                        onValueChange={setFornecedorFilter}
                      >
                        <SelectTrigger className="bg-dark-card border-dark-color text-dark-primary text-sm hover:bg-slate-700/70 hover:border-blue-500/50 transition-all duration-200">
                          <SelectValue placeholder={t("quoteRequests.supplier")} />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-color">
                          <SelectItem
                            value="Todos"
                            className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-blue-500/20 hover:text-blue-300 transition-colors duration-200"
                          >
                            Todos Fornecedores
                          </SelectItem>
                          {uniqueFornecedores.map((fornecedor) => (
                            <SelectItem
                              key={fornecedor}
                              value={fornecedor}
                              className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-blue-500/20 hover:text-blue-300 transition-colors duration-200"
                            >
                              {fornecedor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por Data */}
                    <div>
                      <label className="text-slate-300 text-xs font-medium mb-2 block">
                        Período
                      </label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="bg-dark-card border-dark-color text-dark-primary text-sm hover:bg-slate-700/70 hover:border-blue-500/50 transition-all duration-200">
                          <SelectValue placeholder="Data" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-color">
                          <SelectItem
                            value="Todas"
                            className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-blue-500/20 hover:text-blue-300 transition-colors duration-200"
                          >
                            Todas as Datas
                          </SelectItem>
                          <SelectItem
                            value="hoje"
                            className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-blue-500/20 hover:text-blue-300 transition-colors duration-200"
                          >
                            📅 Hoje
                          </SelectItem>
                          <SelectItem
                            value="semana"
                            className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-blue-500/20 hover:text-blue-300 transition-colors duration-200"
                          >
                            📅 Última Semana
                          </SelectItem>
                          <SelectItem
                            value="mes"
                            className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-blue-500/20 hover:text-blue-300 transition-colors duration-200"
                          >
                            📅 Último Mês
                          </SelectItem>
                          <SelectItem
                            value="trimestre"
                            className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-blue-500/20 hover:text-blue-300 transition-colors duration-200"
                          >
                            📅 Último Trimestre
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por Valor */}
                    <div>
                      <label className="text-slate-300 text-xs font-medium mb-2 block">
                        Faixa de Valor
                      </label>
                      <Select
                        value={valueFilter}
                        onValueChange={setValueFilter}
                      >
                        <SelectTrigger className="bg-dark-card border-dark-color text-dark-primary text-sm hover:bg-slate-700/70 hover:border-blue-500/50 transition-all duration-200">
                          <SelectValue placeholder="Valor" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-color">
                          <SelectItem
                            value="Todos"
                            className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-blue-500/20 hover:text-blue-300 transition-colors duration-200"
                          >
                            Todos os Valores
                          </SelectItem>
                          <SelectItem
                            value="baixo"
                            className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-green-500/20 hover:text-green-300 transition-colors duration-200"
                          >
                            💰 Até {currency.symbol}1.000
                          </SelectItem>
                          <SelectItem
                            value="medio"
                            className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-yellow-500/20 hover:text-yellow-300 transition-colors duration-200"
                          >
                            💰 {currency.symbol}1.000 - {currency.symbol}10.000
                          </SelectItem>
                          <SelectItem
                            value="alto"
                            className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200"
                          >
                            💰 Acima de {currency.symbol}10.000
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ordenação */}
                    <div>
                      <label className="text-slate-300 text-xs font-medium mb-2 block">
                        Ordenar Por
                      </label>
                      <div className="flex space-x-1">
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="bg-dark-card border-dark-color text-dark-primary text-sm flex-1 hover:bg-slate-700/70 hover:border-blue-500/50 transition-all duration-200">
                            <SelectValue placeholder="Campo" />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-card border-dark-color">
                            <SelectItem
                              value="data"
                              className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-blue-500/20 hover:text-blue-300 transition-colors duration-200"
                            >
                              📅 Data
                            </SelectItem>
                            <SelectItem
                              value="valor"
                              className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-green-500/20 hover:text-green-300 transition-colors duration-200"
                            >
                              💰 Valor
                            </SelectItem>
                            <SelectItem
                              value="cliente"
                              className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-purple-500/20 hover:text-purple-300 transition-colors duration-200"
                            >
                              👤 Cliente
                            </SelectItem>
                            <SelectItem
                              value="status"
                              className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-orange-500/20 hover:text-orange-300 transition-colors duration-200"
                            >
                              📊 Status
                            </SelectItem>
                            <SelectItem
                              value="prioridade"
                              className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200"
                            >
                              ⚡ Prioridade
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <button
                          onClick={() =>
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                          }
                          className="bg-dark-card border border-dark-color text-dark-primary px-2 rounded-lg hover:bg-slate-600/70 hover:border-blue-500/50 hover:text-blue-300 transition-all duration-200"
                        >
                          {sortOrder === "asc" ? (
                            <SortAsc className="w-4 h-4" />
                          ) : (
                            <SortDesc className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ações dos Filtros */}
                  <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-slate-700/50 space-y-2 sm:space-y-0">
                    <div className="text-slate-400 text-xs">
                      {filteredCotacoes.length} de {cotacoesList.length}{" "}
                      cotações encontradas
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={clearAllFilters}
                        className="bg-slate-700/50 hover:bg-slate-600/70 hover:border-red-500/30 border border-slate-600/50 text-slate-300 hover:text-red-300 px-3 py-1 text-xs rounded-lg transition-all duration-200"
                      >
                        Limpar Filtros
                      </button>
                      <button
                        onClick={() => setShowAdvancedFilters(false)}
                        className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 hover:border-blue-400/50 text-blue-400 hover:text-blue-300 px-3 py-1 text-xs rounded-lg transition-all duration-200"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Conteúdo com dados */}
            {cotacoesList.length > 0 && (
              <div className="flex-1 overflow-y-auto">
                {/* Funções para filtrar e paginar por aba */}
                {(() => {
                  const getPaginated = (tab: string) => {
                    // Primeiro aplica os filtros de pesquisa, depois o filtro da aba
                    const filtered = filteredCotacoes.filter(getTabFilter(tab));
                    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
                    const page = Math.min(currentPage, totalPages);
                    return filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
                  };
                  return (
                    <>
                      <TabsContent value="all" className="h-full mt-0">
                        <div className="grid gap-4">
                          {getPaginated('all').map((cotacao) => (
                            <QuoteCard
                              key={cotacao.id}
                              cotacao={cotacao}
                              onViewDetails={handleViewDetails}
                              onDownload={handleDownload}
                              isLight={isLight}
                            />
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="pending" className="h-full mt-0">
                        <div className="grid gap-4">
                          {getPaginated('pending').map((cotacao) => (
                            <QuoteCard
                              key={cotacao.id}
                              cotacao={cotacao}
                              onViewDetails={handleViewDetails}
                              onDownload={handleDownload}
                              isLight={isLight}
                            />
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="approved" className="h-full mt-0">
                        <div className="grid gap-4">
                          {getPaginated('approved').map((cotacao) => (
                            <QuoteCard
                              key={cotacao.id}
                              cotacao={cotacao}
                              onViewDetails={handleViewDetails}
                              onDownload={handleDownload}
                              isLight={isLight}
                            />
                          ))}
                        </div>
                      </TabsContent>
                    </>
                  );
                })()}

                {/* Estado quando há dados mas filtros não retornam resultados */}
                {filteredCotacoes.length === 0 && cotacoesList.length > 0 && (
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <Search className="w-12 h-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      Nenhuma cotação encontrada
                    </h3>
                    <p className="text-sm text-slate-300 text-center">
                      Tente ajustar os filtros de pesquisa. ({cotacoesList.length}{" "}
                      cotações disponíveis)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Estado vazio centralizado quando não há dados */}
            {cotacoesList.length === 0 && (
              <div className="flex-1 flex flex-col justify-center items-center">
                <FileText className="w-16 h-16 text-slate-400 mb-6" />
                <h3 className="text-xl font-semibold text-white mb-3">
                  Nenhuma cotação encontrada
                </h3>
                <p className="text-slate-300 mb-6 text-center max-w-md">
                  Você ainda não possui cotações registradas no sistema.
                </p>
                {onNavigateToNewQuote && (
                  <button 
                    onClick={onNavigateToNewQuote}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 font-semibold text-base shadow-lg"
                  >
                    Criar Nova Cotação
                  </button>
                )}
              </div>
            )}
          </div>
        </Tabs>
      </main>

      {/* Modal de Motivo para Aprovar / Rejeitar / Reativar */}
      {/* Modal de Motivo para Aprovar / Rejeitar / Reativar */}
      <Dialog open={approvalModal.open} onOpenChange={(o)=>!o && closeApproval()}>
  <DialogContent className={`w-full max-w-4xl ${isLight ? 'bg-white border-gray-300' : 'bg-slate-900/95 border-cyan-500/30'} p-8 rounded-2xl overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle className={`${isLight ? 'text-gray-800' : 'text-white'} font-semibold flex items-center gap-2`}>
              {approvalModal.action === 'approve' && <Check className="w-4 h-4 text-green-400"/>}
              {approvalModal.action === 'set_pending' && <Clock className="w-4 h-4 text-orange-400"/>}
              {approvalModal.action === 'approve' && 'Aprovar Cotação'}
              {approvalModal.action === 'set_pending' && 'Marcar como Pendente'}
            </DialogTitle>
            <DialogDescription className={`${isLight ? 'text-gray-600' : 'text-slate-300'} text-sm`}>
              Informe o motivo. Esse registro ficará salvo no histórico.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <textarea
              value={motivoInput}
              onChange={(e)=>setMotivoInput(e.target.value)}
              placeholder={t("quoteRequests.reasonPlaceholder")}
              aria-label="Motivo da aprovação/rejeição"
              className={`w-full h-28 rounded-md ${isLight ? 'bg-gray-100 text-gray-800 border-gray-300 focus:border-blue-500 focus:ring-blue-500' : 'bg-slate-800/70 text-white border-slate-600/50 focus:border-cyan-400 focus:ring-cyan-400'} border ${!motivoInput.trim() && isSubmitting ? 'border-red-500' : ''} focus:ring-1 text-sm p-3 resize-none outline-none`}
            />
            {!motivoInput.trim() && isSubmitting && (
              <div className="text-red-400 text-xs">{t("quoteRequests.reasonRequired")}</div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-2 w-full mt-2">
              <button onClick={closeApproval} aria-label="Cancelar" className={`w-full sm:w-auto px-4 py-2 text-sm rounded-md ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300 focus:ring-gray-500' : 'bg-slate-700/60 hover:bg-slate-600/70 text-slate-200 border-slate-600/60 focus:ring-slate-400'} border focus:outline-none focus:ring-2`}>{t("quoteRequests.cancel")}</button>
              <button
                onClick={submitApproval}
                aria-label="Confirmar aprovação/pendente"
                disabled={isSubmitting || !motivoInput.trim()}
                className={`w-full sm:w-auto px-4 py-2 text-sm rounded-md font-semibold flex items-center gap-1 border transition-colors focus:outline-none focus:ring-2 disabled:opacity-60 ${
                  approvalModal.action==='set_pending' 
                    ? isLight ? 'bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-300 focus:ring-orange-500' : 'bg-orange-600/30 hover:bg-orange-600/50 text-orange-300 border-orange-500/40 focus:ring-cyan-400'
                    : isLight ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300 focus:ring-green-500' : 'bg-green-600/30 hover:bg-green-600/50 text-green-300 border-green-500/40 focus:ring-cyan-400'
                }`}
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                ) : approvalModal.action==='approve' ? <Check className="w-4 h-4"/> : <Clock className="w-4 h-4"/>}
                {t("quoteRequests.confirm")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes da Cotação com Sistema de Validação */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
  <DialogContent className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto ${isLight ? 'bg-white border-gray-300' : 'bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-cyan-400/30'} backdrop-blur-xl p-8 rounded-2xl`}>
          <DialogHeader className={`${isLight ? 'border-gray-200' : 'border-slate-700/50'} border-b pb-2`}>
            <DialogTitle className={`text-lg font-bold ${isLight ? 'text-gray-800' : 'text-white'} flex items-center gap-2`}>
              <FileText className="h-5 w-5 text-cyan-400" />
              {t("quoteRequests.quotationDetails")} {selectedCotacao?.id}
            </DialogTitle>
          </DialogHeader>

          {/* Exibir itens da cotação com todos os campos fundamentais */}
          {cotacaoItens.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-cyan-400" />
                {t("quoteRequests.quotationItems")}
              </h3>
              <div className="space-y-4">
                {cotacaoItens.map(item => (
                  <ItemDetalheCard key={item.id} item={item} onItemReplaced={fetchCotacaoItens} isLight={isLight} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 text-slate-400 text-sm">{t("quoteRequests.noItemsFound")}</div>
          )}
          <div className="glass-card bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl p-2 sm:p-4 border border-white/10 mt-6">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full">
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <button
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-400 border border-blue-500/50 hover:border-blue-400/70 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all hover:scale-105 text-sm"
                  onClick={handleOpenDownloadModal}
                  aria-label="Download da cotação"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
      {/* Modal de erro ao exportar PDF */}
      <Dialog open={pdfErrorModal.open} onOpenChange={(o)=>!o && setPdfErrorModal({open:false, message: ""})}>
        <DialogContent className="w-full max-w-xs sm:max-w-md bg-slate-900/95 border border-red-500/30 p-2 sm:p-6 rounded-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-red-400 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400"/>
              {t("quoteRequests.pdfExportError")}
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-sm">
              {pdfErrorModal.message}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <button
              onClick={()=>setPdfErrorModal({open:false, message: ""})}
              className="px-4 py-2 rounded-md bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 font-semibold"
            >
              {t("quoteRequests.close")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
              <button className="w-full sm:w-auto bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 text-purple-400 border border-purple-500/50 hover:border-purple-400/70 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all hover:scale-105 text-sm">
                <Mail className="h-4 w-4" />
                {t("quoteRequests.sendEmail")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Escolha de Formato de Download */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="w-full max-w-md bg-slate-900/95 border border-cyan-400/30 p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="h-5 w-5 text-cyan-400" />
              Escolha o formato de download
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-sm">
              Selecione o formato em que deseja baixar esta cotação:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            <button
              onClick={() => handleDownloadWithFormat('pdf')}
              className="w-full bg-red-600/20 hover:bg-red-600/40 hover:border-red-400/60 border border-red-500/30 text-red-400 hover:text-red-300 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium hover:scale-105"
            >
              <FileText className="w-5 h-5" />
              <span>Baixar como PDF</span>
            </button>
            
            <button
              onClick={() => handleDownloadWithFormat('xlsx')}
              className="w-full bg-green-600/20 hover:bg-green-600/40 hover:border-green-400/60 border border-green-500/30 text-green-400 hover:text-green-300 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium hover:scale-105"
            >
              <FileText className="w-5 h-5" />
              <span>Baixar como Excel</span>
            </button>
            
            <button
              onClick={() => handleDownloadWithFormat('csv')}
              className="w-full bg-blue-600/20 hover:bg-blue-600/40 hover:border-blue-400/60 border border-blue-500/30 text-blue-400 hover:text-blue-300 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium hover:scale-105"
            >
              <FileText className="w-5 h-5" />
              <span>Baixar como CSV</span>
            </button>
            
            <button
              onClick={() => setIsDownloadModalOpen(false)}
              className="w-full bg-slate-700/60 hover:bg-slate-600/70 text-slate-200 px-4 py-2 rounded-lg transition-all duration-200 font-medium border border-slate-600/60"
            >
              Cancelar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
