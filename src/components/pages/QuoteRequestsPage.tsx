// Componente para exibir detalhes do item e submodal
import React from 'react';

type ItemDetalheCardProps = { item: any };
const ItemDetalheCard = ({ item }: ItemDetalheCardProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-800/60 border border-cyan-900/30 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <div className="text-white font-semibold text-base">{item.item_nome}</div>
          <div className="text-slate-400 text-xs">Fornecedor: <span className="text-cyan-300">{item.provider || item.fornecedor || '-'}</span></div>
          <div className="text-slate-400 text-xs">Origem: <span className="text-cyan-300">{item.origem || '-'}</span></div>
        </div>
        <div className="text-right">
          <div className="text-slate-300 text-sm">Qtd: <b>{item.quantidade}</b></div>
          <div className="text-slate-300 text-sm">Preço: <b>{item.item_preco} {item.item_moeda}</b></div>
          <div className="text-slate-300 text-sm">Subtotal: <b>{(item.quantidade * item.item_preco).toLocaleString('pt-BR', { style: 'currency', currency: item.item_moeda || 'EUR' })}</b></div>
        </div>
        <div>
          <button onClick={() => setOpen(true)} className="ml-auto bg-cyan-900/30 hover:bg-cyan-700/40 text-cyan-300 border border-cyan-700/40 px-3 py-1 rounded text-xs font-semibold transition-all">Ver detalhes</button>
        </div>
      </div>
      <div className="text-slate-300 text-xs mt-2">{item.item_descricao}</div>
      {/* Submodal para detalhes completos */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-slate-900/95 border border-cyan-400/30">
          <DialogHeader>
            <DialogTitle className="text-cyan-300 text-base">Detalhes do Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div><b>Nome:</b> {item.item_nome}</div>
            <div><b>Fornecedor:</b> {item.provider || item.fornecedor || '-'}</div>
            <div><b>Origem:</b> {item.origem || '-'}</div>
            <div><b>Descrição:</b> {item.item_descricao}</div>
            <div><b>Preço:</b> {item.item_preco} {item.item_moeda}</div>
            <div><b>Quantidade:</b> {item.quantidade}</div>
            <div><b>Subtotal:</b> {(item.quantidade * item.item_preco).toLocaleString('pt-BR', { style: 'currency', currency: item.item_moeda || 'EUR' })}</div>
            <div><b>Moeda:</b> {item.item_moeda}</div>
            <div><b>Condições:</b> <pre className="bg-slate-800 rounded p-2 text-xs whitespace-pre-wrap">{item.condicoes ? JSON.stringify(item.condicoes, null, 2) : '-'}</pre></div>
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
  Euro,
  Check,
  X,
  Info,
  Filter,
  SortAsc,
  SortDesc,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cotacaoService } from "../../api/services";
import api from '../../api/client';

interface QuoteRequestsPageProps {
  onNavigateToNewQuote?: () => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "processing":
      return (
        <Badge className="bg-blue-600 text-white text-xs">Processando</Badge>
      );
    case "processed":
    case "approved":
      return (
        <Badge className="bg-green-600 text-white text-xs">Aprovada</Badge>
      );
    case "pending_approval":
      return (
        <Badge className="bg-orange-600 text-white text-xs">Pendente</Badge>
      );
    case "sent":
      return (
        <Badge className="bg-purple-600 text-white text-xs">Enviada</Badge>
      );
    case "rejected":
      return <Badge className="bg-red-600 text-white text-xs">Rejeitada</Badge>;
    default:
      return <Badge className="text-xs">{status}</Badge>;
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "processing":
      return <Clock className="w-4 h-4 text-blue-400" />;
    case "processed":
    case "approved":
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case "pending_approval":
      return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    case "sent":
      return <Mail className="w-4 h-4 text-purple-400" />;
    case "rejected":
      return <X className="w-4 h-4 text-red-400" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
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
    isFullyApproved: cotacao.status === "approved",
    pendingApprovals: cotacao.status === "approved" ? [] : validation.approvers,
    approvedBy: cotacao.status === "approved" ? validation.approvers : [],
  };
};

export function QuoteRequestsPage({
  onNavigateToNewQuote,
}: QuoteRequestsPageProps = {}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [fornecedorFilter, setFornecedorFilter] = useState("Todos");
  const [dateFilter, setDateFilter] = useState("Todas");
  const [valueFilter, setValueFilter] = useState("Todos");
  const [sortBy, setSortBy] = useState("data");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [cotacoesList, setCotacoesList] = useState<any[]>([]);

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
          valor: c.valor || c.orcamento_geral || '',
          quantidade: c.quantidade || '',
          aprovado_por: c.aprovado_por || c.aprovador || '',
          motivo: c.motivo || '',
          condicoes: c.condicoes || '',
          dataRecebido: c.dataRecebido || c.cadastrado_em || c.data_solicitacao || '',
          prazoResposta: c.prazoResposta || c.prazo_validade || '',
          orcamento_geral: c.orcamento_geral || c.valor || '',
        }));
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

  // Buscar itens ao abrir detalhes
  useEffect(() => {
    if (selectedCotacao) {
      api.get(`/cotacoes-itens?cotacao_id=${selectedCotacao.id}`)
        .then(res => setCotacaoItens(res.data))
        .catch(() => setCotacaoItens([]));
    }
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


  // Função para aprovar cotação com validação por nível
  const handleApprove = (cotacaoId: string, approver?: string) => {
    setCotacoesList((prev) =>
      prev.map((cotacao) => {
        if (cotacao.id === cotacaoId) {
          const validation = getValidationLevel(cotacao.valor);
          
          if (validation.requiresMultipleApprovals) {
            // Para cotações que precisam de múltiplas aprovações
            const currentApprovers = cotacao.approvedBy || [];
            const newApprovers = approver && !currentApprovers.includes(approver) 
              ? [...currentApprovers, approver] 
              : currentApprovers;
            
            const allApproved = validation.approvers.every(req => newApprovers.includes(req));
            
            return {
              ...cotacao,
              approvedBy: newApprovers,
              status: allApproved ? "approved" : "pending_approval",
              lastApprover: approver || "Sistema",
              approvalLevel: validation.level
            };
          } else {
            // Aprovação simples
            return {
              ...cotacao,
              status: "approved",
              approvedBy: [approver || validation.approver],
              lastApprover: approver || validation.approver,
              approvalLevel: validation.level
            };
          }
        }
        return cotacao;
      })
    );
    
    // Notificação baseada no nível de validação
    const cotacao = cotacoesList.find(c => c.id === cotacaoId);
    if (cotacao) {
      const validation = getValidationLevel(cotacao.valor);
      const status = getValidationStatus({...cotacao, approvedBy: cotacao.approvedBy || []});
      
      if (validation.requiresMultipleApprovals && !status.isFullyApproved) {
        console.log(`Cotação ${cotacaoId} aprovada por ${approver || 'Sistema'}. Pendentes: ${status.pendingApprovals.join(', ')}`);
      } else {
        console.log(`Cotação ${cotacaoId} totalmente aprovada! Nível: ${validation.description}`);
      }
    }
  };

  // Função para rejeitar cotação
  const handleReject = (cotacaoId: string) => {
    setCotacoesList((prev) =>
      prev.map((cotacao) =>
        cotacao.id === cotacaoId ? { ...cotacao, status: "rejected" } : cotacao
      )
    );
    console.log(`Cotação ${cotacaoId} rejeitada`);
  };

  // Função para aumentar quantidade
  const handleIncreaseQuantity = (cotacaoId: string) => {
    setCotacoesList((prev) =>
      prev.map((cotacao) => {
        if (cotacao.id === cotacaoId) {
          // Extrair o número da quantidade atual
          const currentQuantity = cotacao.quantidade;
          const numberMatch = currentQuantity.match(/(\d+)/);
          
          if (numberMatch) {
            const currentNumber = parseInt(numberMatch[1]);
            const newNumber = currentNumber + 1;
            const newQuantity = currentQuantity.replace(/\d+/, newNumber.toString());
            
            console.log(`Quantidade da cotação ${cotacaoId} aumentada de ${currentQuantity} para ${newQuantity}`);
            
            return { ...cotacao, quantidade: newQuantity };
          }
        }
        return cotacao;
      })
    );
  };

  // Função para visualizar detalhes
  const handleViewDetails = (cotacaoId: string) => {
    const cotacao = cotacoesList.find(c => c.id === cotacaoId);
    if (cotacao) {
      setSelectedCotacao(cotacao);
      setIsDetailModalOpen(true);
    }
  };

  const QuoteCard = ({
    cotacao,
    onApprove,
    onReject,
    onViewDetails,
  }: {
    cotacao: any;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onViewDetails: (id: string) => void;
  }) => (
    <div className="glass-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300 group relative">
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

      <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-3 lg:space-y-0 lg:space-x-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            {getStatusIcon(cotacao.status)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
              <h3 className="font-mono text-base font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">
                {cotacao.id}
              </h3>
              <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                {getStatusBadge(cotacao.status)}
                {getPriorityBadge(cotacao.prioridade)}
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

            <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
                <span className="text-slate-400 text-xs block mb-1">
                  {t("dashboard.supplier")}:
                </span>
                <span className="text-white font-medium">
                  {cotacao.condicoes ? JSON.stringify(cotacao.condicoes) : '-'}
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
        <div className="flex flex-col space-y-3 min-w-0 lg:min-w-[140px]">
          <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Euro className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-medium">
                {t("approvals.value")}
              </span>
            </div>
            <div className="text-lg font-bold text-green-400">
              {cotacao.orcamento_geral}
            </div>
          </div>

          {/* Aviso de Aprovação Especial */}
          {needsSpecialApproval(cotacao.valor) && (
            <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-xs text-amber-400 font-medium">
                  Aprovação Especial Requerida
                </span>
              </div>
              <div className="text-xs text-amber-300 mb-2">
                Valor acima de €2M requer múltiplas aprovações
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-medium">
                  Aprovadores Pendentes:
                </div>
                {getValidationStatus(cotacao).pendingApprovals.map((approver: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0"></div>
                    <span className="text-xs text-amber-300 font-medium">
                      {approver}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
            {/* Botões de ação baseados no status */}
            {cotacao.status === "pending_approval" ? (
              <>
                <button
                  onClick={() => onApprove(cotacao.id)}
                  className="bg-green-600/20 hover:bg-green-600/40 hover:border-green-400/60 border border-green-500/30 text-green-400 hover:text-green-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <Check className="w-3 h-3" />
                  <span>{t("approvals.approve")}</span>
                </button>
                <button
                  onClick={() => onReject(cotacao.id)}
                  className="bg-red-600/20 hover:bg-red-600/40 hover:border-red-400/60 border border-red-500/30 text-red-400 hover:text-red-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <X className="w-3 h-3" />
                  <span>{t("approvals.reject")}</span>
                </button>
                <button
                  onClick={() => onViewDetails(cotacao.id)}
                  className="bg-blue-600/20 hover:bg-blue-600/40 hover:border-blue-400/60 border border-blue-500/30 text-blue-400 hover:text-blue-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <Info className="w-3 h-3" />
                  <span>{t("approvals.viewDetails")}</span>
                </button>
              </>
            ) : cotacao.status === "approved" ||
              cotacao.status === "processed" ? (
              <>
                <button
                  onClick={() => onViewDetails(cotacao.id)}
                  className="bg-blue-600/20 hover:bg-blue-600/40 hover:border-blue-400/60 border border-blue-500/30 text-blue-400 hover:text-blue-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <Eye className="w-3 h-3" />
                  <span>Visualizar</span>
                </button>
                <button className="bg-slate-700/50 hover:bg-slate-600/70 hover:border-purple-500/30 border border-slate-600/50 text-slate-300 hover:text-purple-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105">
                  <Download className="w-3 h-3" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => onReject(cotacao.id)}
                  className="bg-orange-600/20 hover:bg-orange-600/40 hover:border-orange-400/60 border border-orange-500/30 text-orange-400 hover:text-orange-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <X className="w-3 h-3" />
                  <span>Cancelar</span>
                </button>
              </>
            ) : cotacao.status === "rejected" ? (
              <>
                <button
                  onClick={() => onViewDetails(cotacao.id)}
                  className="bg-blue-600/20 hover:bg-blue-600/40 hover:border-blue-400/60 border border-blue-500/30 text-blue-400 hover:text-blue-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <Info className="w-3 h-3" />
                  <span>Detalhes</span>
                </button>
                <button
                  onClick={() => onApprove(cotacao.id)}
                  className="bg-green-600/20 hover:bg-green-600/40 hover:border-green-400/60 border border-green-500/30 text-green-400 hover:text-green-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <Check className="w-3 h-3" />
                  <span>Reativar</span>
                </button>
                <button className="bg-slate-700/50 hover:bg-slate-600/70 hover:border-purple-500/30 border border-slate-600/50 text-slate-300 hover:text-purple-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none opacity-50 cursor-not-allowed">
                  <Download className="w-3 h-3" />
                  <span>PDF</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onViewDetails(cotacao.id)}
                  className="bg-blue-600/20 hover:bg-blue-600/40 hover:border-blue-400/60 border border-blue-500/30 text-blue-400 hover:text-blue-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <Eye className="w-3 h-3" />
                  <span>Ver</span>
                </button>
                <button className="bg-slate-700/50 hover:bg-slate-600/70 hover:border-purple-500/30 border border-slate-600/50 text-slate-300 hover:text-purple-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105">
                  <Download className="w-3 h-3" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => onApprove(cotacao.id)}
                  className="bg-green-600/20 hover:bg-green-600/40 hover:border-green-400/60 border border-green-500/30 text-green-400 hover:text-green-300 px-3 py-2 text-xs rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 font-medium flex-1 lg:flex-none hover:scale-105"
                >
                  <Check className="w-3 h-3" />
                  <span>Aprovar</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Lógica de filtragem
  const filteredCotacoes = cotacoesList.filter((cotacao) => {
    const matchesSearch = searchTerm === "" || 
      cotacao.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotacao.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotacao.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotacao.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "Todos" || cotacao.status === statusFilter;
    const matchesPriority = priorityFilter === "Todas" || cotacao.prioridade === priorityFilter;
    const matchesFornecedor = fornecedorFilter === "Todos" || cotacao.fornecedor === fornecedorFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesFornecedor;
  });

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
    <div className="flex flex-col h-full">
      {/* Header - Compacto no mobile */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-1 md:py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-1 md:space-y-4 lg:space-y-0">
          <div className="hidden md:block">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              {t("quoteRequests.title")}
              {activeFiltersCount > 0 && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                  {activeFiltersCount} filtro{activeFiltersCount > 1 ? "s" : ""}{" "}
                  ativo{activeFiltersCount > 1 ? "s" : ""}
                </span>
              )}
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
              {t("quoteRequests.subtitle")}
              {activeFiltersCount > 0 && (
                <span className="text-blue-400 ml-2">
                  • {filteredCotacoes.length} de {cotacoesList.length}{" "}
                  resultados
                </span>
              )}
            </p>
          </div>
          
          {/* Header mobile compacto */}
          <div className="md:hidden flex items-center justify-between">
            <h1 className="text-lg font-bold text-dark-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Cotações
            </h1>
            <span className="text-blue-300 font-bold text-sm">
              {filteredCotacoes.length}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-1 md:space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="hidden md:flex items-center gap-3 w-full justify-center">
              <div className="glass-card bg-white/5 border-blue-500/30 px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 text-blue-300 text-sm min-w-[160px] h-[44px]">
                <span className="font-bold text-lg">{filteredCotacoes.length}</span>
                <span className="ml-2 text-blue-200">cotações</span>
                {filteredCotacoes.length !== cotacoesList.length && (
                  <span className="text-slate-400 text-xs block ml-2">
                    de {cotacoesList.length} total
                  </span>
                )}
              </div>
              {onNavigateToNewQuote ? (
                <Button
                  onClick={onNavigateToNewQuote}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 text-sm md:text-base min-w-[160px] h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Cotação</span>
                </Button>
              ) : (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 text-sm md:text-base min-w-[160px] h-[44px]">
                      <Plus className="w-4 h-4" />
                      <span>Nova Cotação</span>
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

      <main className="flex-1 dashboard-main p-3 md:p-4 lg:p-8 bg-dark-bg">
        <Tabs defaultValue="all" className="w-full h-full flex flex-col">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 md:mb-6 space-y-3 md:space-y-4 lg:space-y-0 flex-shrink-0">
            {/* Tabs - ocultas no mobile */}
            <TabsList className="hidden md:flex bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-xl p-1 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 text-xs sm:text-sm hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200 whitespace-nowrap px-2 py-2 sm:px-4 min-w-max"
              >
                Todas ({cotacoesList.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300 text-xs sm:text-sm hover:bg-orange-500/20 hover:text-orange-300 transition-all duration-200 whitespace-nowrap px-2 py-2 sm:px-4 min-w-max"
              >
                Pendentes (
                {
                  cotacoesList.filter((c) => c.status === "pending_approval")
                    .length
                }
                )
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-slate-300 text-xs sm:text-sm hover:bg-green-500/20 hover:text-green-300 transition-all duration-200 whitespace-nowrap px-2 py-2 sm:px-4 min-w-max"
              >
                Aprovadas (
                {
                  cotacoesList.filter(
                    (c) => c.status === "approved" || c.status === "processed"
                  ).length
                }
                )
              </TabsTrigger>
              <TabsTrigger
                value="processing"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 text-xs sm:text-sm hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200 whitespace-nowrap px-2 py-2 sm:px-4 min-w-max"
              >
                Processando (
                {cotacoesList.filter((c) => c.status === "processing").length})
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-300 text-xs sm:text-sm hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 whitespace-nowrap px-2 py-2 sm:px-4 min-w-max"
              >
                Rejeitadas (
                {cotacoesList.filter((c) => c.status === "rejected").length})
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
                    placeholder="Pesquisar por cliente, produto, ID ou fornecedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 w-full bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-10 md:h-auto"
                  />
                </div>

                {/* Filtros Básicos - ocultos no mobile */}
                <div className="hidden md:flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40 bg-dark-card border-dark-color text-dark-primary text-sm hover:bg-slate-700/70 hover:border-blue-500/50 transition-all duration-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-card border-dark-color">
                      <SelectItem
                        value="Todos"
                        className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-blue-500/20 hover:text-blue-300 transition-colors duration-200"
                      >
                        Todos Status
                      </SelectItem>
                      <SelectItem
                        value="pending_approval"
                        className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-orange-500/20 hover:text-orange-300 transition-colors duration-200"
                      >
                        Pendente Aprovação
                      </SelectItem>
                      <SelectItem
                        value="approved"
                        className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-green-500/20 hover:text-green-300 transition-colors duration-200"
                      >
                        Aprovada
                      </SelectItem>
                      <SelectItem
                        value="processing"
                        className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-blue-500/20 hover:text-blue-300 transition-colors duration-200"
                      >
                        Processando
                      </SelectItem>
                      <SelectItem
                        value="processed"
                        className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-green-500/20 hover:text-green-300 transition-colors duration-200"
                      >
                        Processada
                      </SelectItem>
                      <SelectItem
                        value="rejected"
                        className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200"
                      >
                        Rejeitada
                      </SelectItem>
                      <SelectItem
                        value="sent"
                        className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-purple-500/20 hover:text-purple-300 transition-colors duration-200"
                      >
                        Enviada
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-32 bg-dark-card border-dark-color text-dark-primary text-sm hover:bg-slate-700/70 hover:border-blue-500/50 transition-all duration-200">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-card border-dark-color">
                      <SelectItem
                        value="Todas"
                        className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-blue-500/20 hover:text-blue-300 transition-colors duration-200"
                      >
                        Todas
                      </SelectItem>
                      <SelectItem
                        value="high"
                        className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200"
                      >
                        🔴 Alta
                      </SelectItem>
                      <SelectItem
                        value="medium"
                        className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-yellow-500/20 hover:text-yellow-300 transition-colors duration-200"
                      >
                        🟡 Média
                      </SelectItem>
                      <SelectItem
                        value="low"
                        className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-green-500/20 hover:text-green-300 transition-colors duration-200"
                      >
                        🟢 Baixa
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Botão de Filtros Avançados - oculto no mobile */}
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`flex px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 items-center space-x-1 font-medium ${
                      showAdvancedFilters 
                        ? 'bg-blue-600/30 border border-blue-500/50 text-blue-400 hover:bg-blue-600/40 hover:border-blue-400/70' 
                        : 'bg-slate-700/50 hover:bg-slate-600/70 hover:border-blue-500/30 border border-slate-600/50 text-slate-300 hover:text-blue-300'
                    }`}
                  >
                    <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{showAdvancedFilters ? 'Menos' : 'Mais'} Filtros</span>
                    <span className="sm:hidden">Filtros</span>
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
                        Fornecedor
                      </label>
                      <Select
                        value={fornecedorFilter}
                        onValueChange={setFornecedorFilter}
                      >
                        <SelectTrigger className="bg-dark-card border-dark-color text-dark-primary text-sm hover:bg-slate-700/70 hover:border-blue-500/50 transition-all duration-200">
                          <SelectValue placeholder="Fornecedor" />
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
                            💰 Até €1.000
                          </SelectItem>
                          <SelectItem
                            value="medio"
                            className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-yellow-500/20 hover:text-yellow-300 transition-colors duration-200"
                          >
                            💰 €1.000 - €10.000
                          </SelectItem>
                          <SelectItem
                            value="alto"
                            className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200"
                          >
                            💰 Acima de €10.000
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

          <div className="flex-1 scrollable-content">
            <TabsContent value="all" className="h-full mt-0">
              <div className="grid gap-4">
                {filteredCotacoes.map((cotacao) => (
                  <QuoteCard
                    key={cotacao.id}
                    cotacao={cotacao}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="h-full mt-0">
              <div className="grid gap-4">
                {cotacoesList
                  .filter((c) => c.status === "pending_approval")
                  .map((cotacao) => (
                    <QuoteCard
                      key={cotacao.id}
                      cotacao={cotacao}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="approved" className="h-full mt-0">
              <div className="grid gap-4">
                {cotacoesList
                  .filter(
                    (c) => c.status === "approved" || c.status === "processed"
                  )
                  .map((cotacao) => (
                    <QuoteCard
                      key={cotacao.id}
                      cotacao={cotacao}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="processing" className="h-full mt-0">
              <div className="grid gap-4">
                {cotacoesList
                  .filter((c) => c.status === "processing")
                  .map((cotacao) => (
                    <QuoteCard
                      key={cotacao.id}
                      cotacao={cotacao}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="rejected" className="h-full mt-0">
              <div className="grid gap-4">
                {cotacoesList
                  .filter((c) => c.status === "rejected")
                  .map((cotacao) => (
                    <QuoteCard
                      key={cotacao.id}
                      cotacao={cotacao}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
              </div>
            </TabsContent>

            {filteredCotacoes.length === 0 && cotacoesList.length > 0 && (
            <div className="text-center py-8 lg:py-12">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                Nenhuma cotação encontrada
              </h3>
              <p className="text-sm sm:text-base text-slate-300 px-4">
                Tente ajustar os filtros de pesquisa. ({cotacoesList.length}{" "}
                cotações disponíveis)
              </p>
            </div>            )}

            {cotacoesList.length === 0 && (
            <div className="text-center py-8 lg:py-12">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                Carregando cotações...
              </h3>
              <p className="text-sm sm:text-base text-slate-300 px-4">
                Aguarde enquanto as cotações são carregadas
              </p>
            </div>            )}
          </div>
        </Tabs>
      </main>

      {/* Modal de Detalhes da Cotação com Sistema de Validação */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-cyan-400/30 backdrop-blur-xl">
          <DialogHeader className="border-b border-slate-700/50 pb-2">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-400" />
              Detalhes da Cotação {selectedCotacao?.id}
            </DialogTitle>
          </DialogHeader>

          {/* Exibir itens da cotação com todos os campos fundamentais */}
          {cotacaoItens.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-cyan-400" />
                Itens da Cotação
              </h3>
              <div className="space-y-4">
                {cotacaoItens.map(item => (
                  <ItemDetalheCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 text-slate-400 text-sm">Nenhum item encontrado para esta cotação.</div>
          )}

// ...existing code...
          <div className="glass-card bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl p-4 border border-white/10 mt-6">
            <div className="flex flex-wrap gap-3">
              <button className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-400 border border-blue-500/50 hover:border-blue-400/70 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all hover:scale-105 text-sm">
                <Download className="h-4 w-4" />
                Baixar PDF
              </button>
              <button className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 text-purple-400 border border-purple-500/50 hover:border-purple-400/70 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all hover:scale-105 text-sm">
                <Mail className="h-4 w-4" />
                Enviar Email
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
