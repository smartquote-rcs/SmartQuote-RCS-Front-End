import React from "react";
import { exportCotacao, ExportFormat } from "../../utils/exportCotacaoPdf";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../hooks/useCurrency";
// Componente para exibir detalhes do item e submodal

type ItemDetalheCardProps = { item: any, onItemReplaced?: () => void };
const ItemDetalheCard = ({ item, onItemReplaced }: ItemDetalheCardProps) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [replaceLoading, setReplaceLoading] = useState(false);
  const [replaceError, setReplaceError] = useState("");
  const [replaceSuccess, setReplaceSuccess] = useState("");

  // Buscar produtos ao abrir combobox
  const fetchProdutos = async () => {
    setLoadingProdutos(true);
    setReplaceError("");
    try {
      const res = await import('../../api/services').then(m => m.produtoService.getAll());
      if (res.success && Array.isArray(res.data?.data)) {
        setProdutos(res.data.data);
      } else {
        setReplaceError(t("quoteRequests.errorFetchingProducts"));
      }
    } catch (e) {
      setReplaceError(t("quoteRequests.errorFetchingProducts"));
    }
    setLoadingProdutos(false);
  };

  const handleReplace = async (newProductId: number) => {
    setReplaceLoading(true);
    setReplaceError("");
    setReplaceSuccess("");
    try {
      const res = await import('../../api/services').then(m => m.produtoService.replaceProduct(item.id, newProductId));
      if (res.success) {
        setReplaceSuccess(t("quoteRequests.itemReplacedSuccess"));
        setTimeout(() => {
          setShowReplace(false);
          setReplaceSuccess("");
          if (onItemReplaced) onItemReplaced();
        }, 800);
      } else {
        setReplaceError(res.error || t("quoteRequests.errorReplacingItem"));
      }
    } catch (e) {
      setReplaceError(t("quoteRequests.errorReplacingItem"));
    }
    setReplaceLoading(false);
  };

  // Filtro de produtos
  const produtosFiltrados = produtos.filter(p =>
    p.nome?.toLowerCase().includes(search.toLowerCase())
  );

  return (
  <div className="bg-slate-800/60 border border-cyan-900/30 rounded-xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 shadow-lg text-base sm:text-lg w-full max-w-screen overflow-x-auto">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <div className="text-white font-semibold text-base">
            {item.item_nome && item.item_nome.length > 50
              ? item.item_nome.slice(0, 50) + '...'
              : item.item_nome}
          </div>
          <div className="text-slate-400 text-xs">{t("quoteRequests.supplierLabel")}: <span className="text-cyan-300">{item.provider || item.fornecedor || '-'}</span></div>
          <div className="text-slate-400 text-xs">{t("quoteRequests.originLabel")}: <span className="text-cyan-300">{item.origem || '-'}</span></div>
        </div>
        <div className="text-right">
          <div className="text-slate-300 text-sm">{t("quoteRequests.quantityLabel")}: <b>{item.quantidade}</b></div>
          <div className="text-slate-300 text-sm">{t("quoteRequests.priceLabel")}: <b>{item.item_preco} {item.item_moeda}</b></div>
          <div className="text-slate-300 text-sm">{t("quoteRequests.subtotalLabel")}: <b>{formatCurrency(item.quantidade * item.item_preco)}</b></div>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => setOpen(true)} className="ml-auto bg-cyan-900/30 hover:bg-cyan-700/40 text-cyan-300 border border-cyan-700/40 px-3 py-1 rounded text-xs font-semibold transition-all">{t("quoteRequests.itemDetails")}</button>
          <button onClick={() => { setShowReplace(v => !v); if (!produtos.length) fetchProdutos(); }} className="ml-auto bg-blue-900/30 hover:bg-blue-700/40 text-blue-300 border border-blue-700/40 px-3 py-1 rounded text-xs font-semibold transition-all">{t("quoteRequests.replaceItem")}</button>
        </div>
      </div>
      <div className="text-slate-300 text-xs mt-2">
        {item.item_descricao && item.item_descricao.length > 50
          ? item.item_descricao.slice(0, 50) + '...'
          : item.item_descricao}
      </div>
      {showReplace && (
  <div className="mt-4 p-3 sm:p-4 bg-slate-900/90 border border-cyan-700/30 rounded-xl w-full max-w-screen sm:max-w-2xl mx-auto overflow-x-auto">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-white border border-cyan-700/30 focus:border-cyan-400 outline-none text-base"
              placeholder={t("quoteRequests.searchProduct")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={loadingProdutos}
              style={{ minWidth: 200 }}
            />
            <Search className="w-5 h-5 text-cyan-400" />
          </div>
          {replaceError && <div className="text-red-400 text-sm mb-2">{replaceError}</div>}
          {replaceSuccess && <div className="text-green-400 text-base mb-2 animate-pulse">{replaceSuccess}</div>}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
            {loadingProdutos ? (
              <div className="text-slate-400 text-base p-4">{t("quoteRequests.loadingProducts")}</div>
            ) : produtosFiltrados.length === 0 ? (
              <div className="text-slate-400 text-base p-4">{t("quoteRequests.noProductsFound")}</div>
            ) : produtosFiltrados.map(prod => (
              <button
                key={prod.id}
                className="w-full text-left px-4 py-2 hover:bg-cyan-800/30 rounded text-cyan-200 text-base flex items-center gap-2"
                onClick={() => handleReplace(prod.id)}
                disabled={replaceLoading}
              >
                <Search className="w-4 h-4 text-cyan-400" /> {prod.nome}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Modal melhorado com aparência de fatura */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto bg-white border-0 p-0 rounded-2xl shadow-2xl">
          {/* Cabeçalho da Fatura */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-3 md:p-4 rounded-t-2xl relative">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Receipt className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                <div>
                  <DialogTitle className="text-xl md:text-2xl font-bold text-white">
                    {t("quoteRequests.itemDetailsTitle")}
                  </DialogTitle>
                  <DialogDescription className="text-slate-300 mt-1 text-sm">
                    Detalhes completos do item da cotação
                  </DialogDescription>
                </div>
              </div>
              <div className="text-center md:text-right text-slate-300">
                <div className="text-sm">Data de criação</div>
                <div className="text-lg font-semibold">{new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>
          </div>

          {/* Conteúdo da Fatura */}
          <div className="p-3 md:p-4 bg-white text-gray-800">
            {/* Informações do Item */}
            <div className="mb-4 md:mb-5">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg md:text-xl font-bold text-slate-800">Informações do Produto</h3>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Hash className="w-4 h-4 text-slate-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-600 font-medium">Nome do Produto</div>
                        <div className="text-base md:text-lg font-semibold text-slate-800 mt-1 break-words">{item.item_nome}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Building className="w-4 h-4 text-slate-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-600 font-medium">Fornecedor</div>
                        <div className="text-base text-slate-800 mt-1 break-words">{item.provider || item.fornecedor || 'Não informado'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-slate-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-600 font-medium">Origem</div>
                        <div className="text-base text-slate-800 mt-1 break-words">{item.origem || 'Não informado'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-slate-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-600 font-medium">Descrição</div>
                        <div className="text-base text-slate-800 mt-1 leading-relaxed break-words">
                          {item.item_descricao || 'Sem descrição disponível'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes Financeiros */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-slate-600" />
                <h3 className="text-xl font-bold text-slate-800">Detalhes Financeiros</h3>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 md:p-4 border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Hash className="w-4 h-4 text-blue-600" />
                      <div className="text-sm text-blue-700 font-medium">Quantidade</div>
                    </div>
                    <div className="text-base md:text-lg font-bold text-blue-800">{item.quantidade}</div>
                    <div className="text-sm text-blue-600">unidades</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div className="text-sm text-green-700 font-medium">Preço Unitário</div>
                    </div>
                    <div className="text-base md:text-lg font-bold text-green-800 break-words">
                      {formatCurrency(item.item_preco)}
                    </div>
                    <div className="text-sm text-green-600">{item.item_moeda}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calculator className="w-4 h-4 text-purple-600" />
                      <div className="text-sm text-purple-700 font-medium">Subtotal</div>
                    </div>
                    <div className="text-base md:text-lg font-bold text-purple-800 break-words">
                      {formatCurrency(item.quantidade * item.item_preco)}
                    </div>
                    <div className="text-sm text-purple-600">valor total</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo Final */}
            <div className="border-t-2 border-slate-200 pt-4">
              <div className="bg-slate-800 text-white rounded-xl p-3 md:p-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="text-center md:text-left">
                    <div className="text-slate-300 text-sm">Total do Item</div>
                    <div className="text-2xl md:text-3xl font-bold text-white break-words">
                      {formatCurrency(item.quantidade * item.item_preco)}
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-slate-300 text-sm">Moeda</div>
                    <div className="text-lg md:text-xl font-semibold text-cyan-400">{item.item_moeda}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé com Ações */}
          <div className="bg-slate-50 p-3 md:p-4 rounded-b-2xl border-t border-slate-200">
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-800 transition-all duration-200 px-6 py-2 rounded-lg font-medium shadow-sm"
              >
                <X className="w-4 h-4 mr-2" />
                Fechar Detalhes
              </Button>
            </div>
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
  Receipt,
  Package,
  MapPin,
  Hash,
  DollarSign,
  Calculator,
  X,
} from "lucide-react";
import { cotacaoService } from "../../api/services";
import api from '../../api/client';

interface QuoteRequestsPageProps {
  onNavigateToNewQuote?: () => void;
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

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return <Badge className="bg-red-500 text-white text-xs">Alta</Badge>;
    case "medium":
      return <Badge className="bg-yellow-500 text-white text-xs">Média</Badge>;
    case "low":
      return <Badge className="bg-green-500 text-white text-xs">Baixa</Badge>;
    default:
      return <Badge className="text-xs">{priority}</Badge>;
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

// Sistema de Validação por Valor
const getValidationLevel = (valor: string | number) => {
  let numericValue = 0;
  if (typeof valor === 'number') {
    numericValue = valor;
  } else if (typeof valor === 'string') {
    // Remove caracteres não numéricos e converte para número
    const cleaned = valor.replace(/[^\d,\.]/g, '').replace(/\./g, '').replace(/,/g, '.');
    numericValue = parseFloat(cleaned) || 0;
  } else {
    numericValue = 0;
  }

  if (numericValue >= 2000000) {
    return {
      level: "executive",
      approver: "Direção Executiva",
      description: "Aprovação da Direção Executiva",
      color: "red",
      icon: "🔴",
      requiresMultipleApprovals: true,
      approvers: ["CEO", "CFO", "Gestor Comercial"],
    };
  } else if (numericValue >= 500000) {
    return {
      level: "director",
      approver: "Gestor Comercial",
      description: "Aprovação do Gestor Comercial",
      color: "orange",
      icon: "🟠",
      requiresMultipleApprovals: false,
      approvers: ["Gestor Comercial"],
    };
  } else if (numericValue >= 100000) {
    return {
      level: "manager",
      approver: "Gestor Regional",
      description: "Aprovação do Gestor",
      color: "yellow",
      icon: "🟡",
      requiresMultipleApprovals: false,
      approvers: ["Gestor Regional"],
    };
  } else if (numericValue >= 10000) {
    return {
      level: "supervisor",
      approver: "Supervisor",
      description: "Aprovação do Supervisor",
      color: "blue",
      icon: "🔵",
      requiresMultipleApprovals: false,
      approvers: ["Supervisor"],
    };
  } else {
    return {
      level: "standard",
      approver: "Aprovação Automática",
      description: "Aprovação Padrão",
      color: "green",
      icon: "🟢",
      requiresMultipleApprovals: false,
      approvers: ["Sistema"],
    };
  }
};

// Função para verificar se uma cotação precisa de aprovação especial
const needsSpecialApproval = (valor: string) => {
  const validation = getValidationLevel(valor);
  return validation.level === "executive" || validation.level === "director";
};

// Função para obter status da validação
const getValidationStatus = (cotacao: any) => {
  const validation = getValidationLevel(cotacao.valor);

  if (validation.requiresMultipleApprovals) {
    // Para valores altos, verificar se todas as aprovações necessárias estão completas
    const approvedBy = cotacao.approvedBy || [];
    const pendingApprovals = validation.approvers.filter(
      (approver) => !approvedBy.includes(approver)
    );

    return {
      ...validation,
      isFullyApproved: pendingApprovals.length === 0,
      pendingApprovals,
      approvedBy,
    };
  }

  return {
    ...validation,
    isFullyApproved: cotacao.aprovacao === true,
    pendingApprovals: cotacao.aprovacao === true ? [] : validation.approvers,
    approvedBy: cotacao.aprovacao === true ? validation.approvers : [],
  };
};

export function QuoteRequestsPage({
  onNavigateToNewQuote,
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
  const itemsPerPage = 10;
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
  // Estado para formato de exportação
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  // Função para exportar cotação no formato escolhido
  const handleExportCotacao = () => {
    if (!selectedCotacao) return;
    if (!cotacaoItens || cotacaoItens.length === 0) {
      setPdfErrorModal({open: true, message: "Não há itens para exportar nesta cotação."});
      return;
    }
    exportCotacao({ cotacao: selectedCotacao, itens: cotacaoItens, format: exportFormat });
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
  const [approvalModal, setApprovalModal] = useState<{open:boolean; action:'approve'|'set_pending'; cotacaoId:string|null}>({open:false, action:'approve', cotacaoId:null});
  const [motivoInput, setMotivoInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Feedback visual de envio
  const openApproval = (id:string, action:'approve'|'set_pending') => {
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
  }: {
    cotacao: any;
    onViewDetails: (id: string) => void;
  }) => (
  <div className="glass-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-3 sm:p-4 border border-white/10 backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300 group relative w-full max-w-screen overflow-x-auto">
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
                <h3 className="font-mono text-base font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">
                  {cotacao.id}
                </h3>
                {cotacao.prompt && cotacao.prompt.texto_original && (
                  <span className="block text-lg font-semibold text-cyan-300 mt-1 truncate" title={cotacao.prompt.texto_original}>
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
                <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-medium text-white text-sm">
                  {cotacao.aprovado_por}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">
                  {cotacao.motivo}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">
                  {t("approvals.responsible")}:{" "}
                  <span className="text-white font-medium">
                    {cotacao.aprovado_por}
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 text-xs">
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
                <span className="text-slate-400 text-xs block mb-1">
                  Fornecedor:
                </span>
                <span className="text-white font-medium">
                  {cotacao.fornecedor && cotacao.fornecedor !== '' ? cotacao.fornecedor : '-'}
                </span>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
                <span className="text-slate-400 text-xs block mb-1">
                  {t("quoteRequests.received")}:
                </span>
                <span className="text-white font-medium">
                  {new Date(cotacao.dataRecebido).toLocaleDateString("pt-PT")}
                </span>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50 col-span-2 lg:col-span-1">
                <span className="text-slate-400 text-xs block mb-1">
                  {t("approvals.deadline")}:
                </span>
                <span className="text-white font-medium">
                  {new Date(cotacao.prazoResposta).toLocaleDateString("pt-PT")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Valor e Actions */}
  <div className="flex flex-col space-y-2 sm:space-y-3 min-w-0 lg:min-w-[140px]">
          <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <span className="text-sm text-green-400 font-medium">{currency.symbol}</span>
              <span className="text-xs text-green-400 font-medium">
                {t("approvals.value")}
              </span>
            </div>
            <div className="text-lg font-bold text-green-400">
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
                  className="bg-green-600/20 hover:bg-green-600/40 hover:border-green-400/60 border border-green-500/30 text-green-400 hover:text-green-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <Check className="w-3 h-3" />
                  <span>Aprovar</span>
                </button>
                <button
                  onClick={() => onViewDetails(cotacao.id)}
                  aria-label="Ver detalhes da cotação"
                  className="bg-blue-600/20 hover:bg-blue-600/40 hover:border-blue-400/60 border border-blue-500/30 text-blue-400 hover:text-blue-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  className="bg-blue-600/20 hover:bg-blue-600/40 hover:border-blue-400/60 border border-blue-500/30 text-blue-400 hover:text-blue-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <Eye className="w-3 h-3" />
                  <span>Visualizar</span>
                </button>
                <button className="bg-slate-700/50 hover:bg-slate-600/70 hover:border-purple-500/30 border border-slate-600/50 text-slate-300 hover:text-purple-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400" aria-label="Baixar PDF">
                  <Download className="w-3 h-3" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => openApproval(String(cotacao.id),'set_pending')}
                  aria-label="Colocar como pendente"
                  className="bg-orange-600/20 hover:bg-orange-600/40 hover:border-orange-400/60 border border-orange-500/30 text-orange-400 hover:text-orange-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400"
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
    if (tab === 'pending') return (c: any) => c.aprovacao !== true; // false, null ou undefined
    if (tab === 'approved') return (c: any) => c.aprovacao === true;
    return () => true;
  };

  // Função para obter o total de páginas da aba ativa
  const getTotalPages = () => {
    const filtered = cotacoesList.filter(getTabFilter(activeTab));
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
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-1 md:py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-1 md:space-y-4 lg:space-y-0">
          <div className="hidden md:block">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              {t("quoteRequests.title")}
              {activeFiltersCount > 0 && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                  {activeFiltersCount} {activeFiltersCount > 1 ? t("quoteRequests.filtersActive") : t("quoteRequests.filterActive")}{" "}
                  {activeFiltersCount > 1 ? t("quoteRequests.filterActivePlural") : t("quoteRequests.filterActiveSingular")}
                </span>
              )}
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
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
            <h1 className="text-lg font-bold text-dark-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              {t("quoteRequests.title")}
            </h1>
            <span className="text-blue-300 font-bold text-sm">
              {filteredCotacoes.length}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-1 md:space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="hidden md:flex items-center gap-3 w-full justify-center">
              <div className="glass-card bg-white/5 border-blue-500/30 px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 text-blue-300 text-sm min-w-[160px] h-[44px]">
                <span className="font-bold text-lg">{filteredCotacoes.length}</span>
                <span className="ml-2 text-blue-200">{t("quoteRequests.quotations")}</span>
                {filteredCotacoes.length !== cotacoesList.length && (
                  <span className="text-slate-400 text-xs block ml-2">
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

      <main className="flex-1 dashboard-main p-3 md:p-4 lg:p-8 bg-dark-bg overflow-hidden">
  <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 md:mb-6 space-y-3 md:space-y-4 lg:space-y-0 flex-shrink-0">
            {/* Tabs - ocultas no mobile */}
            <TabsList className="hidden md:flex bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-xl p-1 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 text-xs sm:text-sm hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200 whitespace-nowrap px-2 py-2 sm:px-4 min-w-max"
              >
                {t("quoteRequests.allTab")} ({cotacoesList.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300 text-xs sm:text-sm hover:bg-orange-500/20 hover:text-orange-300 transition-all duration-200 whitespace-nowrap px-2 py-2 sm:px-4 min-w-max"
              >
                {t("quoteRequests.pendingTab")} ({cotacoesList.filter((c) => c.status === 'incompleta' && (!c.motivo || c.motivo.trim() === '')).length})
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-slate-300 text-xs sm:text-sm hover:bg-green-500/20 hover:text-green-300 transition-all duration-200 whitespace-nowrap px-2 py-2 sm:px-4 min-w-max"
              >
                {t("quoteRequests.approvedTab")} ({cotacoesList.filter((c) => c.status === 'approved' || c.status === 'processed' || c.status === 'completa').length})
              </TabsTrigger>
              {/* Removido tab Processando conforme solicitação */}
              <TabsTrigger
                value="rejected"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-300 text-xs sm:text-sm hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 whitespace-nowrap px-2 py-2 sm:px-4 min-w-max"
              >
                {t("quoteRequests.rejectedTab")} (
                {cotacoesList.filter((c) => c.status === 'incompleta' && c.motivo && c.motivo.trim() !== '').length})
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
                    const filtered = cotacoesList.filter(getTabFilter(tab));
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
                            />
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="rejected" className="h-full mt-0">
                        <div className="grid gap-4">
                          {getPaginated('rejected').map((cotacao) => (
                            <QuoteCard
                              key={cotacao.id}
                              cotacao={cotacao}
                              onViewDetails={handleViewDetails}
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
  <DialogContent className="w-full max-w-4xl bg-slate-900/95 border border-cyan-500/30 p-8 rounded-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white font-semibold flex items-center gap-2">
              {approvalModal.action === 'approve' && <Check className="w-4 h-4 text-green-400"/>}
              {approvalModal.action === 'set_pending' && <Clock className="w-4 h-4 text-orange-400"/>}
              {approvalModal.action === 'approve' && 'Aprovar Cotação'}
              {approvalModal.action === 'set_pending' && 'Marcar como Pendente'}
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-sm">
              Informe o motivo. Esse registro ficará salvo no histórico.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <textarea
              value={motivoInput}
              onChange={(e)=>setMotivoInput(e.target.value)}
              placeholder={t("quoteRequests.reasonPlaceholder")}
              aria-label="Motivo da aprovação/rejeição"
              className={`w-full h-28 rounded-md bg-slate-800/70 border ${!motivoInput.trim() && isSubmitting ? 'border-red-500' : 'border-slate-600/50'} focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white p-3 resize-none outline-none`}
            />
            {!motivoInput.trim() && isSubmitting && (
              <div className="text-red-400 text-xs">{t("quoteRequests.reasonRequired")}</div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-2 w-full mt-2">
              <button onClick={closeApproval} aria-label="Cancelar" className="w-full sm:w-auto px-4 py-2 text-sm rounded-md bg-slate-700/60 hover:bg-slate-600/70 text-slate-200 border border-slate-600/60 focus:outline-none focus:ring-2 focus:ring-slate-400">{t("quoteRequests.cancel")}</button>
              <button
                onClick={submitApproval}
                aria-label="Confirmar aprovação/pendente"
                disabled={isSubmitting || !motivoInput.trim()}
                className={`w-full sm:w-auto px-4 py-2 text-sm rounded-md font-semibold flex items-center gap-1 border transition-colors ${approvalModal.action==='set_pending' ? 'bg-orange-600/30 hover:bg-orange-600/50 text-orange-300 border-orange-500/40' : 'bg-green-600/30 hover:bg-green-600/50 text-green-300 border-green-500/40'} focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-60`}
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
  <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-cyan-400/30 backdrop-blur-xl p-8 rounded-2xl">
          <DialogHeader className="border-b border-slate-700/50 pb-2">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
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
                  <ItemDetalheCard key={item.id} item={item} onItemReplaced={fetchCotacaoItens} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 text-slate-400 text-sm">{t("quoteRequests.noItemsFound")}</div>
          )}
          <div className="glass-card bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl p-2 sm:p-4 border border-white/10 mt-6">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full">
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <select
                  className="bg-slate-800 border border-slate-600 text-slate-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={exportFormat}
                  onChange={e => setExportFormat(e.target.value as ExportFormat)}
                  aria-label="Selecionar formato de exportação"
                >
                  <option value="pdf">PDF</option>
                  <option value="xlsx">Excel</option>
                  <option value="csv">CSV</option>
                </select>
                <button
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-400 border border-blue-500/50 hover:border-blue-400/70 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all hover:scale-105 text-sm"
                  onClick={handleExportCotacao}
                  aria-label="Baixar cotação"
                >
                  <Download className="h-4 w-4" />
                  {exportFormat === 'pdf' ? t("quoteRequests.downloadPdf") : exportFormat === 'xlsx' ? t("quoteRequests.downloadExcel") : t("quoteRequests.downloadCsv")}
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
    </div>
  );
}
