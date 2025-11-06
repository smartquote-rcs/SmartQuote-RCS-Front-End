import React, { useState, useEffect } from "react";
import { ExportFormat } from "../../utils/exportCotacaoPdf";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../hooks/useCurrency";
import { useTheme } from "../../hooks/useTheme";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
  Sun,
  Moon,
  X,
  RefreshCw,
} from "lucide-react";
import { cotacaoService, relatorioService, jobService } from "../../api/services";
import api from '../../api/client';

import { produtoService } from '../../api/services';

// Função universal para substituir item por produto local (ID) ou web (URL)
async function handleReplaceUniversal(
  produto: any,
  item: any,
  setReplaceLoading: (v: boolean) => void,
  setReplaceError: (v: string) => void,
  setReplaceSuccess: (v: string) => void,
  onItemReplaced: any,
  t: any
) {
  setReplaceLoading(true);
  setReplaceError("");
  console.log('[ReplaceItem] Iniciando processo de substituição', { produto, itemId: item?.id });
  try {
    const hasLocalId = produto && (typeof produto.id === 'number' || (typeof produto.id === 'string' && produto.id.trim() !== ''));
    const hasUrl = produto && typeof produto.url === 'string' && produto.url.trim().length > 0;

    // Mensagem inicial para indicar que o processamento pode demorar um pouco (apenas para URLs)
    if (!hasLocalId && hasUrl) {
      setReplaceSuccess('Processando substituição... isso pode demorar um pouco.');
    }

    const payload: { cotacaoItemId: number; newProductId?: number; url?: string; nomeProduto?: string } = {
      cotacaoItemId: item.id,
    };

    if (hasLocalId) {
      payload.newProductId = Number(produto.id);
    } else if (hasUrl) {
      payload.url = produto.url.trim();
      if (typeof produto.nome === 'string' && produto.nome.trim().length > 0) {
        payload.nomeProduto = produto.nome.trim();
      }
    } else {
      setReplaceError('Produto inválido: informe um ID de produto ou uma URL.');
      setReplaceLoading(false);
      return;
    }

    // Chamada direta via import estático (evita falhas de carregamento dinâmico em produção)
    console.log('[ReplaceItem] Enviando payload para replaceProduct:', payload);
    const res = await produtoService.replaceProduct(payload);
    console.log('[ReplaceItem] Resposta replaceProduct:', res);
    if (res.success) {
      const used = payload.newProductId ? `ID: ${payload.newProductId}` : `URL: ${payload.url}`;
      setReplaceSuccess(`${t("quoteRequests.itemReplacedSuccess")} (${used})`);
      if (item.status === false) {
        item.status = true;
      }
      if (onItemReplaced) onItemReplaced();
    } else {
      const msg = res.error || t("quoteRequests.errorReplacingItem");
      console.warn('[ReplaceItem] Erro lógico na resposta:', msg);
      setReplaceError(msg);
    }
  } catch (e) {
    console.error('[ReplaceItem] Exceção durante substituição:', e);
    // Tentar extrair detalhes
    const detailed = (e as any)?.message || '';
    setReplaceError(`${t("quoteRequests.errorReplacingItem")}${detailed ? ' - ' + detailed : ''}`);
  }
  setReplaceLoading(false);
  console.log('[ReplaceItem] Processo finalizado');
}
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

  // Buscar Opções Locais e web ao abrir modal
  const fetchSugeridos = async () => {
    console.log('fetchSugeridos chamado para item.id:', item.id);
    setLoadingSugeridos(true);
    setReplaceError("");
    try {
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
  <div className={`border-2 rounded-2xl p-4 md:p-6 flex flex-col gap-4 shadow-md transition-all duration-300 hover:shadow-lg w-full overflow-hidden ${
    item.status === false 
      ? isLight 
        ? 'bg-red-50 border-red-300 text-red-900 hover:border-red-400' 
        : 'bg-red-900/60 border-red-500/60 text-red-200 hover:border-red-400/80'
      : isLight 
        ? 'bg-white border-gray-300 text-gray-900 hover:border-blue-400' 
        : 'bg-slate-800/60 border-cyan-900/30 text-white hover:border-cyan-400/60'
  }`}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-lg ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>
            {item.item_nome && item.item_nome.length > 50
              ? item.item_nome.slice(0, 50) + '...'
              : item.item_nome}
          </div>
          <div className={`text-sm mt-2 break-words ${
            isLight ? 'text-gray-600' : 'text-slate-400'
          }`}>
            {t("quoteRequests.supplierLabel")}: <span className={`font-medium ${
              isLight ? 'text-blue-600' : 'text-cyan-300'
            }`}>{item.provider || item.fornecedor || '-'}</span>
          </div>
          <div className={`text-sm break-words ${
            isLight ? 'text-gray-600' : 'text-slate-400'
          }`}>
            {t("quoteRequests.originLabel")}: <span className={`font-medium ${
              isLight ? 'text-blue-600' : 'text-cyan-300'
            }`}>{item.origem || '-'}</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Informações de preço responsivas */}
          <div className="flex flex-col sm:text-right order-2 sm:order-1">
            <div className={`text-sm ${
              isLight ? 'text-gray-700' : 'text-slate-300'
            }`}>
              {t("quoteRequests.quantityLabel")}: <b>{item.quantidade}</b>
            </div>
            <div className={`text-sm break-words ${
              isLight ? 'text-gray-700' : 'text-slate-300'
            }`}>
              {t("quoteRequests.priceLabel")}: <b>{item.item_preco} {item.item_moeda}</b>
            </div>
            <div className={`text-sm break-words ${
              isLight ? 'text-green-700' : 'text-green-400'
            } font-bold`}>
              {t("quoteRequests.subtotalLabel")}: <b>{formatCurrency(item.quantidade * item.item_preco)}</b>
            </div>
          </div>
          
          {/* Botões responsivos */}
          <div className="flex flex-row sm:flex-col gap-2 order-1 sm:order-2">
            <button 
              onClick={() => setOpen(true)} 
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-[1.01] border-2 ${
                isLight 
                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 hover:border-blue-400' 
                  : 'bg-cyan-900/30 hover:bg-cyan-700/40 text-cyan-300 border-cyan-700/40 hover:border-cyan-400/60'
              }`}
            >
              {t("quoteRequests.itemDetails")}
            </button>
            {item.status === true && (
              <button 
                onClick={() => { setShowReplace(v => { if (!v) fetchSugeridos(); return !v; }); }} 
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-[1.01] border-2 ${
                  isLight 
                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300 hover:border-purple-400' 
                    : 'bg-blue-900/30 hover:bg-blue-700/40 text-blue-300 border-blue-700/40 hover:border-blue-400/60'
                }`}
              >
                {t("quoteRequests.replaceItem")}
              </button>
            )}
            {item.status === false && (
              <button 
                onClick={() => { setShowReplace(v => { if (!v) fetchSugeridos(); return !v; }); }} 
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-[1.01] border-2 ${
                  isLight 
                    ? 'bg-green-50 hover:bg-green-100 text-green-700 border-green-300 hover:border-green-400' 
                    : 'bg-green-900/30 hover:bg-green-700/40 text-green-300 border-green-700/40 hover:border-green-400/60'
                }`}
              >
                Adicionar Item
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Descrição responsiva */}
      <div className={`text-sm ${
        isLight ? 'text-gray-600' : 'text-slate-300'
      }`}>
        {item.item_descricao && item.item_descricao.length > 50
          ? item.item_descricao.slice(0, 50) + '...'
          : item.item_descricao}
      </div>
      {showReplace && (
        <div className={`mt-4 p-6 rounded-2xl w-full overflow-hidden min-h-[400px] max-h-[80vh] border-2 ${
          isLight 
            ? 'bg-gray-50 border-gray-300' 
            : 'bg-slate-900/90 border-cyan-700/30'
        }`}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <input
              type="text"
              className={`flex-1 px-4 py-3 rounded-xl border-2 focus:outline-none text-base min-w-0 transition-all duration-300 ${
                isLight 
                  ? 'bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                  : 'bg-slate-800 text-white border-cyan-700/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
              }`}
              placeholder={t("quoteRequests.searchProduct")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={loadingSugeridos}
            />
            <Search className={`w-5 h-5 ${isLight ? 'text-blue-500' : 'text-cyan-400'}`} />
          </div>
          {replaceError && <div className="text-red-500 text-base mb-3 break-words p-3 bg-red-50 border border-red-200 rounded-lg">{replaceError}</div>}
          {replaceSuccess && <div className="text-green-500 text-base mb-3 animate-pulse break-words p-3 bg-green-50 border border-green-200 rounded-lg">{replaceSuccess}</div>}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-800 flex flex-col gap-6">
            {/* Opções Locais */}
            <div>
              <h3 className={`text-lg font-bold mb-4 ${
                isLight ? 'text-blue-600' : 'text-cyan-300'
              }`}>Opções Locais</h3>
              {loadingSugeridos ? (
                <div className={`text-base p-4 text-center ${
                  isLight ? 'text-gray-600' : 'text-slate-400'
                }`}>{t("quoteRequests.loadingProducts")}</div>
              ) : sugeridosLocalFiltrados.length === 0 ? (
                <div className={`text-base p-4 text-center ${
                  isLight ? 'text-gray-600' : 'text-slate-400'
                }`}>Nenhum produto local encontrado.</div>
              ) : sugeridosLocalFiltrados.map(prod => (
                <button
                  key={prod.id}
                  className={`w-full text-left px-4 py-3 rounded-lg text-base flex items-center gap-3 transition-all duration-300 hover:scale-[1.01] break-words min-h-[48px] border-2 ${
                    isLight 
                      ? 'hover:bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400' 
                      : 'hover:bg-cyan-800/30 text-cyan-200 border-cyan-700/30 hover:border-cyan-400/60'
                  }`}
                  onClick={() => handleReplaceUniversal(prod, item, setReplaceLoading, setReplaceError, setReplaceSuccess, onItemReplaced, t)}
                  disabled={replaceLoading}
                >
                  <Search className={`w-5 h-5 flex-shrink-0 ${
                    isLight ? 'text-blue-500' : 'text-cyan-400'
                  }`} />
                  <span className="break-words font-medium">{prod.nome}</span>
                </button>
              ))}
            </div>
            {/* Opções de fornecedores */}
            <div>
              <h3 className={`text-lg font-bold mb-4 ${
                isLight ? 'text-purple-600' : 'text-blue-300'
              }`}>Opções de fornecedores</h3>
              {loadingSugeridos ? (
                <div className={`text-base p-4 text-center ${
                  isLight ? 'text-gray-600' : 'text-slate-400'
                }`}>{t("quoteRequests.loadingProducts")}</div>
              ) : sugeridosWebFiltrados.length === 0 ? (
                <div className={`text-base p-4 text-center ${
                  isLight ? 'text-gray-600' : 'text-slate-400'
                }`}>Nenhum produto web encontrado.</div>
              ) : sugeridosWebFiltrados.map((prod, idx) => (
                <button
                  key={prod.url || prod.id || idx}
                  className={`w-full text-left px-4 py-3 rounded-lg text-base flex items-center gap-3 transition-all duration-300 hover:scale-[1.01] break-words min-h-[48px] border-2 ${
                    isLight 
                      ? 'hover:bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400' 
                      : 'hover:bg-blue-800/30 text-blue-200 border-blue-700/30 hover:border-blue-400/60'
                  }`}
                  onClick={() => handleReplaceUniversal(prod, item, setReplaceLoading, setReplaceError, setReplaceSuccess, onItemReplaced, t)}
                  disabled={replaceLoading}
                >
                  <Search className={`w-5 h-5 flex-shrink-0 ${
                    isLight ? 'text-purple-500' : 'text-blue-400'
                  }`} />
                  <span className="break-words font-medium">{prod.nome}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Submodal para detalhes completos - Layout de Fatura 100% Responsivo */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] overflow-y-auto p-4 md:p-6 rounded-2xl m-2 sm:m-4 ${
          isLight 
            ? 'bg-white border-gray-300' 
            : 'bg-slate-900/95 border-cyan-400/30'
        }`}>
          <DialogHeader className={`pb-4 ${
            isLight ? 'border-gray-200' : 'border-slate-700/50'
          } border-b`}>
            <DialogTitle className={`text-xl md:text-2xl flex items-center gap-2 flex-wrap font-bold ${
              isLight ? 'text-gray-900' : 'text-cyan-300'
            }`}>
              <FileText className="w-6 h-6 flex-shrink-0" />
              <span className="break-words">{t("quoteRequests.invoiceTitle", "Fatura do Item")}</span>
            </DialogTitle>
          </DialogHeader>
          
          {/* Layout de Fatura Responsivo */}
          <div className={`rounded-2xl p-4 md:p-6 mt-4 border-2 ${
            isLight 
              ? 'bg-gray-50 border-gray-200' 
              : 'bg-white/5 border-slate-600/30'
          }`}>
            {/* Cabeçalho da Fatura Responsivo */}
            <div className={`pb-4 mb-6 border-b ${
              isLight ? 'border-gray-200' : 'border-slate-600/30'
            }`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-xl md:text-2xl font-bold mb-2 break-words ${
                    isLight ? 'text-blue-600' : 'text-cyan-300'
                  }`}>FATURA DE ITEM</h3>
                  <p className={`text-sm ${
                    isLight ? 'text-gray-600' : 'text-slate-400'
                  }`}>Detalhes da cotação solicitada</p>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <p className={`text-sm ${
                    isLight ? 'text-gray-600' : 'text-slate-400'
                  }`}>Data: {new Date().toLocaleDateString('pt-PT')}</p>
                  <p className={`text-sm break-all ${
                    isLight ? 'text-gray-600' : 'text-slate-400'
                  }`}>ID: #{item.id || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Informações do Item - Grid Responsivo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Informações do Produto */}
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold pb-2 border-b ${
                  isLight 
                    ? 'text-blue-600 border-gray-200' 
                    : 'text-cyan-300 border-slate-600/30'
                }`}>Informações do Produto</h4>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <span className={`text-sm font-medium flex-shrink-0 ${
                      isLight ? 'text-gray-600' : 'text-slate-400'
                    }`}>Nome:</span> 
                    <span className={`font-medium text-sm ${
                      isLight ? 'text-gray-900' : 'text-white'
                    }`}>{item.item_nome}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <span className={`text-sm font-medium flex-shrink-0 ${
                      isLight ? 'text-gray-600' : 'text-slate-400'
                    }`}>Descrição:</span> 
                    <span className={`text-sm ${
                      isLight ? 'text-gray-900' : 'text-white'
                    }`}>{item.item_descricao || '-'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <span className={`text-sm font-medium flex-shrink-0 ${
                      isLight ? 'text-gray-600' : 'text-slate-400'
                    }`}>Fornecedor:</span> 
                    <span className={`font-medium text-sm break-words ${
                      isLight ? 'text-blue-600' : 'text-cyan-300'
                    }`}>{item.provider || item.fornecedor || '-'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <span className={`text-sm font-medium flex-shrink-0 ${
                      isLight ? 'text-gray-600' : 'text-slate-400'
                    }`}>Origem:</span> 
                    <span className={`text-sm break-words ${
                      isLight ? 'text-gray-900' : 'text-white'
                    }`}>{item.origem || '-'}</span>
                  </div>
                </div>
              </div>
              
              {/* Detalhes Financeiros */}
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold pb-2 border-b ${
                  isLight 
                    ? 'text-green-600 border-gray-200' 
                    : 'text-cyan-300 border-slate-600/30'
                }`}>Detalhes Financeiros</h4>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <span className={`text-sm font-medium flex-shrink-0 ${
                      isLight ? 'text-gray-600' : 'text-slate-400'
                    }`}>Preço Unitário:</span> 
                    <span className={`font-bold text-sm break-words ${
                      isLight ? 'text-green-600' : 'text-green-400'
                    }`}>{item.item_preco} {item.item_moeda}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <span className={`text-sm font-medium flex-shrink-0 ${
                      isLight ? 'text-gray-600' : 'text-slate-400'
                    }`}>Quantidade:</span> 
                    <span className={`font-medium text-sm ${
                      isLight ? 'text-gray-900' : 'text-white'
                    }`}>{item.quantidade}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <span className={`text-sm font-medium flex-shrink-0 ${
                      isLight ? 'text-gray-600' : 'text-slate-400'
                    }`}>Moeda:</span> 
                    <span className={`text-sm ${
                      isLight ? 'text-gray-900' : 'text-white'
                    }`}>{item.item_moeda}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total da Fatura - Responsivo */}
            <div className={`pt-4 border-t ${
              isLight ? 'border-gray-200' : 'border-slate-600/30'
            }`}>
              <div className="flex justify-center sm:justify-end">
                <div className={`rounded-2xl p-4 w-full sm:w-auto sm:min-w-64 max-w-sm border-2 ${
                  isLight 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-slate-800/50 border-green-500/30'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className={`text-lg font-semibold text-center sm:text-left ${
                      isLight ? 'text-green-700' : 'text-slate-300'
                    }`}>Total:</span>
                    <span className={`text-2xl font-bold text-center sm:text-right break-all ${
                      isLight ? 'text-green-700' : 'text-green-400'
                    }`}>{formatCurrency(item.quantidade * item.item_preco)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Botões Responsivos */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full">
            <button 
              onClick={() => setOpen(false)} 
              className={`w-full sm:w-auto px-6 py-3 text-lg rounded-lg font-semibold transition-all duration-300 hover:scale-[1.01] border-2 ${
                isLight 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400' 
                  : 'bg-cyan-700/60 hover:bg-cyan-600/70 text-cyan-100 border-cyan-600/60 hover:border-cyan-400/80'
              }`}
            >
              {t("quoteRequests.close")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface QuoteRequestsPageProps {
  onNavigateToNewQuote?: () => void;
  user?: {
    id?: number;
    role?: string;
    position?: string;
  };
}

const getStatusFromAprovacao = (cotacao: any) => {
  if (cotacao.aprovacao === true) return "approved";
  if (cotacao.aprovacao === false) return "pending_approval";
  return "pending_approval"; // null ou undefined também é pendente
};

const getStatusBadge = (cotacao: any, t: any) => {
  const status = getStatusFromAprovacao(cotacao);
  if (status === "approved") {
    return (
      <Badge className="bg-green-600 text-white text-xs">{t('quoteRequests.statusApproved')}</Badge>
    );
  } else {
    return (
      <Badge className="bg-orange-600 text-white text-xs">{t('quoteRequests.statusPending')}</Badge>
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
  user,
}: QuoteRequestsPageProps = {}) {
  const { t } = useTranslation();
  const { formatCurrency, currency } = useCurrency();
  const { isLight, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [fornecedorFilter, setFornecedorFilter] = useState("Todos");
  const [dateFilter, setDateFilter] = useState("Todas");
  const [valueFilter, setValueFilter] = useState("Todos");
  const [sortBy, setSortBy] = useState("id");
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
        // Buscar cotações e jobs em paralelo
        const [cotacoesResponse, jobsResponse] = await Promise.all([
          cotacaoService.getAll(),
          jobService.getAllJobs()
        ]);
        
        // Processar cotações
        const cotacoesArr = Array.isArray(cotacoesResponse.data?.data) ? cotacoesResponse.data.data : [];
        console.log('Cotações recebidas da API:', cotacoesArr);
        
        // Processar jobs ativos (executando ou pendente)
        const jobs = jobsResponse.success && jobsResponse.data ? 
          (jobsResponse.data.jobs || jobsResponse.data) : [];
        const activeJobIds = new Set(
          jobs
            .filter((job: any) => {
              const status = job.status?.toLowerCase();
              return status === 'executando' || status === 'pendente';
            })
            .map((job: any) => job.id)
        );
        
        console.log('Jobs ativos (executando/pendente):', Array.from(activeJobIds));
        
        // Mapeia os campos para garantir compatibilidade com o frontend
        const mappedCotacoes = cotacoesArr
          .map((c: any) => ({
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
          }))
          // Filtrar cotações que têm job ativo (não mostrar enquanto está executando)
          .filter((c: any) => {
            if (c.job_id && activeJobIds.has(c.job_id)) {
              console.log(`Cotação ${c.id} oculta - job ${c.job_id} está executando`);
              return false;
            }
            return true;
          });
        
        setCotacoesList(mappedCotacoes);
      } catch (error) {
        setCotacoesList([]);
        console.error('Erro ao buscar cotações:', error);
      }
    }
    fetchCotacoes();
    
    // Atualizar a cada 10 segundos para refletir mudanças nos jobs
    const interval = setInterval(fetchCotacoes, 10000);
    return () => clearInterval(interval);
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
  
  // Modal de Proposta de E-mail
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailText, setEmailText] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailEditable, setEmailEditable] = useState(false);
  const [emailPrompt, setEmailPrompt] = useState("");
  const [emailGenerating, setEmailGenerating] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailEditPulse, setEmailEditPulse] = useState(false);
  
  // Modal de notificação para cotações com valor 0
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyError, setNotifyError] = useState("");
  const [notifySuccess, setNotifySuccess] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [selectedCotacaoForNotify, setSelectedCotacaoForNotify] = useState<any>(null);
  
  // Sistema de Toast
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: number;
  }>>([]);

  // Função para adicionar toast
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = {
      id,
      type,
      message,
      timestamp: Date.now()
    };
    
    setToasts(prev => [...prev, toast]);
    
    // Remover toast após 5 segundos
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Remover toast manualmente
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Escutar eventos de toast personalizados
  useEffect(() => {
    const handleToast = (event: any) => {
      const { type, message } = event.detail;
      addToast(type, message);
    };

    window.addEventListener('toast', handleToast);
    return () => window.removeEventListener('toast', handleToast);
  }, []);
  
  // Estado para formato de exportação (removido pois não está sendo usado)
  // const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');

  // Função para exportar cotação no formato escolhido (removida pois não está sendo usada)
  // const handleExportCotacao = () => {

  // Função para exportar cotacao com formato específico (usada pelo modal de download)
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

  // ===============================
  // Proposta de E-mail: Handlers
  // ===============================
  const openEmailModal = async () => {
    if (!selectedCotacao) return;
    setIsEmailModalOpen(true);
    setEmailLoading(true);
    setEmailError("");
    setEmailEditable(false);
    setEmailSaved(false);
    setEmailPrompt("");
    try {
      const resp = await relatorioService.getPropostaEmail(selectedCotacao.id);
      setEmailLoading(false);
      if (resp.success) {
        const txt = resp.data?.data?.propostaEmail || resp.data?.propostaEmail || "";
        setEmailText(txt);
      } else {
        setEmailError(resp.error || 'Erro ao obter proposta de e-mail');
      }
    } catch (e:any) {
      setEmailLoading(false);
      setEmailError('Erro ao obter proposta de e-mail');
    }
  };

  const handleDownloadEmailTxt = () => {
    const id = selectedCotacao?.id ?? 'cotacao';
    relatorioService.downloadTextAsFile(`proposta_email_${id}.txt`, emailText || "");
  };

  const handleGenerateIA = async () => {
    if (!selectedCotacao || !emailPrompt.trim()) return;
    setEmailGenerating(true);
    setEmailError("");
    try {
      const iaRes = await relatorioService.gerarPropostaEmailIA(selectedCotacao.id, emailText || "", emailPrompt);
      setEmailGenerating(false);
      if (iaRes.success) {
        const newText = iaRes.data?.data?.reformulatedEmail || iaRes.data?.reformulatedEmail || "";
        if (newText) {
          // Substitui o conteúdo em edição pelo gerado pela IA
          setEmailText(newText);
          setEmailEditable(true);
          setEmailSaved(false);
        } else {
          setEmailError('Resposta da IA inválida.');
        }
      } else {
        setEmailError(iaRes.error || 'Erro ao gerar proposta via IA');
      }
    } catch (e:any) {
      setEmailGenerating(false);
      setEmailError('Erro ao gerar proposta via IA');
    }
  };

  const handleSaveEmail = async () => {
    if (!selectedCotacao) return;
    setEmailLoading(true);
    setEmailError("");
    try {
      const res = await relatorioService.updatePropostaEmail(selectedCotacao.id, emailText || "");
      setEmailLoading(false);
      if (res.success) {
        setEmailSaved(true);
        setEmailEditable(false);
      } else {
        setEmailError(res.error || 'Erro ao salvar proposta de e-mail');
      }
    } catch (e:any) {
      setEmailLoading(false);
      setEmailError('Erro ao salvar proposta de e-mail');
    }
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
  
  // Modal Dynamics 365 Integration
  const [showDynamicsModal, setShowDynamicsModal] = useState(false);
  const [dynamicsData, setDynamicsData] = useState({
    cotacaoId: '',
    customerCode: '',
    projectCode: '',
    notes: ''
  });
  const [isDynamicsLoading, setIsDynamicsLoading] = useState(false);
  
  // Função para verificar se o usuário pode aprovar baseado no valor
  const canApproveQuote = (valorString: string) => {
    const valor = parseFloat(valorString) || 0;
    const userRole = user?.position || user?.role || 'user';
    
    // Para usuários comuns: não pode aprovar acima de 2.000.000
    if (userRole === 'user' && valor > 2000000) {
      return {
        canApprove: false,
        message: t('approvals.limitExceededUser', { limit: '2.000.000', role: 'gestor ou CEO' })
      };
    }
    
    // Para gestores: não pode aprovar acima de 10.000.000
    if (userRole === 'manager' && valor > 10000000) {
      return {
        canApprove: false,
        message: t('approvals.limitExceededManager', { limit: '10.000.000', role: 'CEO' })
      };
    }
    
    // Admin é o CEO e pode aprovar qualquer valor sem limite
    return { canApprove: true, message: '' };
  };

  const openApproval = (id:string, action:'approve'|'set_pending'|'reject') => {
    console.log('openApproval chamado:', { id, action, user });
    
    // Se é uma aprovação ou mudança de status, verificar se o usuário tem permissão baseada no valor
    if (action === 'approve' || action === 'set_pending') {
      const cotacao = cotacoesList.find(c => String(c.id) === String(id));
      console.log('Cotacao encontrada:', cotacao);
      
      if (cotacao) {
        const valor = cotacao.orcamento_geral || '0';
        console.log('Valor da cotação:', valor);
        
        const approvalCheck = canApproveQuote(valor);
        console.log('Resultado da verificação:', approvalCheck);
        
        if (!approvalCheck.canApprove) {
          // Mostrar mensagem de erro e não abrir o modal
          const errorMessage = approvalCheck.message || 'Valor excede seu limite de aprovação. Entre em contato com seu gestor ou CEO.';
          // Usar a função addToast diretamente
          addToast('error', errorMessage);
          return;
        }
      }
    }
    
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

    // Se for aprovação, primeiro processar a aprovação, depois abrir modal Dynamics 365
    if (isApprove) {
      setIsSubmitting(true);
      try {
        const payload: any = { 
          aprovacao: true, 
          motivo: motivoInput,
          status: 'aprovada',
          data_aprovacao: new Date().toISOString()
        };
        if (currentUserId != null) {
          payload.aprovado_por = currentUserId;
        }
        
        const resp = await cotacaoService.update(String(id), payload);
        if (resp.success) {
          // Atualizar estado local
          setCotacoesList(prev => prev.map(c => {
            if (String(c.id) !== String(id)) return c;
            return {
              ...c,
              aprovacao: true,
              status: 'aprovada',
              motivo: motivoInput,
              data_aprovacao: payload.data_aprovacao,
              aprovado_por: currentUserId != null ? currentUserId : c.aprovado_por
            };
          }));
          
          // Toast de aprovação realizada com sucesso
          window.dispatchEvent(new CustomEvent('toast', { 
            detail: { 
              type: 'success', 
              message: 'Aprovação realizada com sucesso!' 
            } 
          }));
          
          // Fechar modal de aprovação
          setApprovalModal({open: false, action: 'approve', cotacaoId: null});
          setMotivoInput("");
          
          // Aguardar um pouco e abrir modal Dynamics 365
          setTimeout(() => {
            setDynamicsData({
              cotacaoId: id,
              customerCode: '',
              projectCode: '',
              notes: motivoInput
            });
            setShowDynamicsModal(true);
          }, 1000);
        } else {
          window.dispatchEvent(new CustomEvent('toast', { 
            detail: { 
              type: 'error', 
              message: resp.error || 'Erro ao aprovar cotação' 
            } 
          }));
        }
      } catch (e) {
        console.error('Erro ao aprovar cotação:', e);
        window.dispatchEvent(new CustomEvent('toast', { 
          detail: { 
            type: 'error', 
            message: 'Erro ao processar aprovação' 
          } 
        }));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Para rejeição ou set_pending, proceder normalmente
    setIsSubmitting(true);
    try {
      const payload:any = { aprovacao: isApprove, motivo: motivoInput };
      if (currentUserId != null) {
        payload.aprovado_por = currentUserId; // envia id do usuário logado
      }
      
      // Define status baseado na aprovação
      if (isPending) {
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
            status: isPending ? 'incompleta' : c.status,
            motivo: motivoInput,
            data_aprovacao: null,
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

  // Funções para Dynamics 365 Integration
  const handleDynamicsSubmit = async () => {
    setIsDynamicsLoading(true);
    
    // Toast de processamento
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { 
        type: 'info', 
        message: 'Processando integração com Dynamics 365...' 
      } 
    }));
    
    try {
      // Simular integração com Dynamics 365
      console.log('Criando oportunidade no Dynamics 365 para cotação:', dynamicsData.cotacaoId);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aprovar a cotação após integração
      const payload = {
        aprovacao: true,
        status: 'completa',
        data_aprovacao: new Date().toISOString(),
        motivo: dynamicsData.notes || 'Aprovado via Dynamics 365',
        aprovado_por: currentUserId,
        // Dados da oportunidade criada no Dynamics
        dynamics_opportunity_id: `OPP-${Date.now()}`, // ID simulado da oportunidade
        dynamics_created_at: new Date().toISOString()
      };
      
      const resp = await cotacaoService.update(dynamicsData.cotacaoId, payload);
      
      if (resp.success) {
        setCotacoesList(prev => prev.map(c => {
          if (String(c.id) !== dynamicsData.cotacaoId) return c;
          return {
            ...c,
            aprovacao: true,
            status: 'completa',
            motivo: payload.motivo,
            data_aprovacao: payload.data_aprovacao,
            aprovado_por: currentUserId,
            dynamics_opportunity_id: payload.dynamics_opportunity_id,
            dynamics_created_at: payload.dynamics_created_at
          };
        }));
        
        window.dispatchEvent(new CustomEvent('toast', { 
          detail: { 
            type: 'success', 
            message: 'Nova oportunidade criada no Dynamics 365 com sucesso!' 
          } 
        }));
        
        closeDynamicsModal();
      } else {
        window.dispatchEvent(new CustomEvent('toast', { 
          detail: { 
            type: 'error', 
            message: resp.error || 'Erro na integração com Dynamics 365' 
          } 
        }));
      }
    } catch (error) {
      console.error('Erro na integração com Dynamics 365:', error);
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { 
          type: 'error', 
          message: 'Erro na integração com Dynamics 365' 
        } 
      }));
    } finally {
      setIsDynamicsLoading(false);
    }
  };

  const closeDynamicsModal = () => {
    setShowDynamicsModal(false);
    setDynamicsData({
      cotacaoId: '',
      customerCode: '',
      projectCode: '',
      notes: ''
    });
    setIsDynamicsLoading(false);
  };

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

  // Função para abrir modal de notificação
  const handleNotifyClient = (cotacao: any) => {
    setSelectedCotacaoForNotify(cotacao);
    setNotifyMessage(`Olá, informamos que a cotação #${cotacao.id} não pôde ser processada pois o produto não foi encontrado. Por favor, entre em contato para mais informações.`);
    setNotifyError("");
    setNotifySuccess("");
    setIsNotifyModalOpen(true);
  };

  // Função para enviar notificação
  const handleSendNotification = async () => {
    if (!selectedCotacaoForNotify || !notifyMessage.trim()) {
      setNotifyError("Por favor, insira uma mensagem.");
      return;
    }

    setNotifyLoading(true);
    setNotifyError("");
    setNotifySuccess("");

    try {
      // Enviar notificação via API
      const response = await api.post('/notifications', {
        tipo: 'cotacao_produto_nao_encontrado',
        mensagem: notifyMessage,
        cotacao_id: selectedCotacaoForNotify.id,
        destinatario: selectedCotacaoForNotify.aprovado_por || selectedCotacaoForNotify.cliente
      });

      if (response.data) {
        setNotifySuccess("Notificação enviada com sucesso!");
        addToast('success', 'Cliente notificado sobre produto não encontrado');
        setTimeout(() => {
          setIsNotifyModalOpen(false);
          setNotifyMessage("");
          setSelectedCotacaoForNotify(null);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Erro ao enviar notificação:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Erro ao enviar notificação';
      setNotifyError(errorMsg);
      addToast('error', errorMsg);
    } finally {
      setNotifyLoading(false);
    }
  };

  // Memoização para performance
  const QuoteCard = React.memo(({
    cotacao,
    onViewDetails,
    onDownload,
    onNotifyClient,
    isLight,
  }: {
    cotacao: any;
    onViewDetails: (id: string) => void;
    onDownload: (cotacao: any) => void;
    onNotifyClient?: (cotacao: any) => void;
    isLight?: boolean;
  }) => {
  const cotacaoValor = parseFloat(String(cotacao.valor || cotacao.orcamento_geral || '0').replace(/[^\d.-]/g, ''));
  const isProdutoNaoEncontrado = cotacaoValor === 0;
  
  return (
  <div className={`glass-card border-2 ${isProdutoNaoEncontrado ? (isLight ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-300 hover:border-orange-500' : 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-orange-500/50 hover:border-orange-400') : ''} ${
    isLight 
      ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-xl' 
      : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/70 hover:border-cyan-400/60 hover:shadow-2xl hover:shadow-cyan-400/20'
  } rounded-xl p-3 sm:p-4 backdrop-blur-sm transition-all duration-300 group relative w-full max-w-screen overflow-x-auto`}>
      {/* Borda lateral de status mais visível */}
      <div
        className={`absolute left-0 top-0 w-2 h-full rounded-l-xl transition-all duration-300 group-hover:w-3 ${
          cotacao.status === "pending_approval"
            ? "bg-orange-500 group-hover:bg-orange-400"
            : cotacao.status === "processing"
            ? "bg-blue-500 group-hover:bg-blue-400"
            : cotacao.status === "processed" || cotacao.status === "approved"
            ? "bg-green-500 group-hover:bg-green-400"
            : cotacao.status === "rejected"
            ? "bg-red-500 group-hover:bg-red-400"
            : "bg-purple-500 group-hover:bg-purple-400"
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
                {getStatusBadge(cotacao, t)}
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

            <div className="mt-2 grid grid-cols-2 gap-1 sm:gap-2 text-xs">
              <div className={`${isLight ? 'bg-gray-100 border-gray-200' : 'bg-slate-800/30 border-slate-700/50'} rounded-lg p-2 border`}>
                <span className={`${isLight ? 'text-gray-500' : 'text-slate-400'} text-xs block mb-1`}>
                  {t("quoteRequests.received")}:
                </span>
                <span className={`${isLight ? 'text-gray-800' : 'text-white'} font-medium`}>
                  {new Date(cotacao.dataRecebido).toLocaleDateString("pt-PT")}
                </span>
              </div>
              <div className={`${isLight ? 'bg-gray-100 border-gray-200' : 'bg-slate-800/30 border-slate-700/50'} rounded-lg p-2 border`}>
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
            <div className={`text-lg font-bold ${isProdutoNaoEncontrado ? (isLight ? 'text-orange-700' : 'text-orange-400') : (isLight ? 'text-green-700' : 'text-green-400')}`}>
              {isProdutoNaoEncontrado ? 'N/A' : formatCurrency(parseFloat(cotacao.orcamento_geral) || 0, false)}
            </div>
          </div>

          {/* Alerta de produto não encontrado */}
          {isProdutoNaoEncontrado && (
            <div className={`${isLight ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-orange-900/30 border-orange-500/50 text-orange-300'} rounded-lg p-2 border text-center text-xs font-medium flex items-center justify-center gap-1`}>
              <AlertTriangle className="w-3 h-3" />
              <span>Produto não encontrado</span>
            </div>
          )}

          {/* Aviso de Aprovação Especial removido conforme solicitado */}

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full mt-2">
            {/* Botões de ação baseados no campo aprovacao */}
            {cotacao.aprovacao !== true ? (
              /* Pendente - mostra botão de aprovar (exceto se produto não encontrado) */
              <>
                {/* Botão de aprovar - apenas se produto foi encontrado */}
                {!isProdutoNaoEncontrado && (
                  <button
                    onClick={() => openApproval(String(cotacao.id),'approve')}
                    aria-label="Aprovar cotação"
                    className={`${isLight ? 'bg-green-100 hover:bg-green-200 border-green-300 text-green-700 hover:text-green-800 focus:ring-green-500 hover:border-green-400' : 'bg-green-600/20 hover:bg-green-600/40 border-green-500/30 hover:border-green-400' } border-2 px-3 py-2 text-xs rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-[1.01] hover:shadow-md focus:outline-none focus:ring-2 active:scale-[0.98]`}
                  >
                    <Check className="w-3 h-3" />
                    <span>{t('quoteRequests.buttonApprove')}</span>
                  </button>
                )}
                <button
                  onClick={() => onViewDetails(cotacao.id)}
                  aria-label="Ver detalhes da cotação"
                  className={`${isLight ? 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 hover:text-blue-800 focus:ring-blue-500 hover:border-blue-400' : 'bg-blue-600/20 hover:bg-blue-600/40 border-blue-500/30 hover:border-blue-400' } border-2 px-3 py-2 text-xs rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-[1.01] hover:shadow-md focus:outline-none focus:ring-2 active:scale-[0.98]`}
                >
                  <Info className="w-3 h-3" />
                  <span>{t('quoteRequests.buttonViewDetails')}</span>
                </button>
                {/* Botão de notificar cliente se produto não encontrado */}
                {isProdutoNaoEncontrado && onNotifyClient && (
                  <button
                    onClick={() => onNotifyClient(cotacao)}
                    aria-label="Notificar cliente"
                    className={`${isLight ? 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-700 hover:text-orange-800 focus:ring-orange-500 hover:border-orange-400' : 'bg-orange-600/20 hover:bg-orange-600/40 border-orange-500/30 hover:border-orange-400' } border-2 px-3 py-2 text-xs rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-[1.01] hover:shadow-md focus:outline-none focus:ring-2 active:scale-[0.98]`}
                  >
                    <Mail className="w-3 h-3" />
                    <span>Notificar Cliente</span>
                  </button>
                )}
              </>
            ) : (
              /* Aprovado - mostra botão para colocar como pendente */
              <>
                <button
                  onClick={() => onViewDetails(cotacao.id)}
                  aria-label="Visualizar cotação"
                  className={`${isLight ? 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 hover:text-blue-800 focus:ring-blue-500 hover:border-blue-400' : 'bg-blue-600/20 hover:bg-blue-600/40 border-blue-500/30 hover:border-blue-400' } border-2 px-3 py-2 text-xs rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-[1.01] hover:shadow-md focus:outline-none focus:ring-2 active:scale-[0.98]`}
                >
                  <Eye className="w-3 h-3" />
                  <span>{t('quoteRequests.buttonView')}</span>
                </button>
                {/* Botão de notificar cliente se produto não encontrado */}
                {isProdutoNaoEncontrado && onNotifyClient && (
                  <button
                    onClick={() => onNotifyClient(cotacao)}
                    aria-label="Notificar cliente"
                    className={`${isLight ? 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-700 hover:text-orange-800 focus:ring-orange-500 hover:border-orange-400' : 'bg-orange-600/20 hover:bg-orange-600/40 border-orange-500/30 hover:border-orange-400' } border-2 px-3 py-2 text-xs rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-[1.01] hover:shadow-md focus:outline-none focus:ring-2 active:scale-[0.98]`}
                  >
                    <Mail className="w-3 h-3" />
                    <span>Notificar Cliente</span>
                  </button>
                )}
                <button
                  onClick={() => openApproval(String(cotacao.id),'set_pending')}
                  aria-label="Marcar como pendente"
                  className={`${isLight ? 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-700 hover:text-orange-800 focus:ring-orange-500 hover:border-orange-400' : 'bg-orange-600/20 hover:bg-orange-600/40 border-orange-500/30 hover:border-orange-400' } border-2 px-3 py-2 text-xs rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-[1.01] hover:shadow-md focus:outline-none focus:ring-2 active:scale-[0.98]`}
                >
                  <Clock className="w-3 h-3" />
                  <span>{t('quoteRequests.buttonPending')}</span>
                </button>
                <button 
                  onClick={() => onDownload(cotacao)}
                  className={`${isLight ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 hover:text-purple-700 focus:ring-purple-500 hover:border-purple-400' : 'bg-slate-700/50 hover:bg-slate-600/70 border-slate-600/50 text-slate-300 hover:text-purple-300 focus:ring-purple-400 hover:border-purple-500' } border-2 px-3 py-2 text-xs rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-[1.01] hover:shadow-md focus:outline-none focus:ring-2 active:scale-[0.98]`} 
                  aria-label="Download"
                >
                  <Download className="w-3 h-3" />
                  <span>{t('quoteRequests.buttonDownload')}</span>
                </button>
                <button
                  onClick={() => openApproval(String(cotacao.id),'set_pending')}
                  aria-label="Colocar como pendente"
                  className={`${isLight ? 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-700 hover:text-orange-800 focus:ring-orange-500 hover:border-orange-400' : 'bg-orange-600/20 hover:bg-orange-600/40 border-orange-500/30 hover:border-orange-400' } border-2 px-3 py-2 text-xs rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 font-medium w-full sm:w-auto lg:w-full hover:scale-[1.01] hover:shadow-md focus:outline-none focus:ring-2 active:scale-[0.98]`}
                >
                  <Clock className="w-3 h-3" />
                  <span>{t('quoteRequests.buttonPending')}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  });

  // Lógica de filtragem e ordenação
  const filteredCotacoes = cotacoesList
    .filter((cotacao) => {
      const matchesSearch = searchTerm === "" || 
        (cotacao.cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cotacao.produto || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cotacao.id ? String(cotacao.id) : "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cotacao.fornecedor || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cotacao.descricao || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cotacao.prompt?.texto_original || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "Todos" || cotacao.status === statusFilter;
      const matchesPriority = priorityFilter === "Todas" || cotacao.prioridade === priorityFilter;
      const matchesFornecedor = fornecedorFilter === "Todos" || cotacao.fornecedor === fornecedorFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesFornecedor;
    })
    .sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case "id":
          // Ordenar por ID numérico
          const idA = typeof a.id === 'number' ? a.id : parseInt(String(a.id).replace(/\D/g, '')) || 0;
          const idB = typeof b.id === 'number' ? b.id : parseInt(String(b.id).replace(/\D/g, '')) || 0;
          compareValue = idA - idB;
          break;
        case "data":
          // Ordenar por data
          const dateA = new Date(a.dataRecebido || a.cadastrado_em || 0).getTime();
          const dateB = new Date(b.dataRecebido || b.cadastrado_em || 0).getTime();
          compareValue = dateA - dateB;
          break;
        case "valor":
          // Ordenar por valor
          const valorA = parseFloat(String(a.valor || a.orcamento_geral || '0').replace(/[^\d.-]/g, '')) || 0;
          const valorB = parseFloat(String(b.valor || b.orcamento_geral || '0').replace(/[^\d.-]/g, '')) || 0;
          compareValue = valorA - valorB;
          break;
        case "cliente":
          // Ordenar por cliente
          compareValue = (a.cliente || '').localeCompare(b.cliente || '');
          break;
        case "fornecedor":
          // Ordenar por fornecedor
          compareValue = (a.fornecedor || '').localeCompare(b.fornecedor || '');
          break;
        case "status":
          // Ordenar por status
          compareValue = (a.status || '').localeCompare(b.status || '');
          break;
        case "prioridade":
          // Ordenar por prioridade (high > medium > low)
          const prioOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
          const prioA = prioOrder[a.prioridade?.toLowerCase()] || 0;
          const prioB = prioOrder[b.prioridade?.toLowerCase()] || 0;
          compareValue = prioA - prioB;
          break;
        default:
          compareValue = 0;
      }
      
      return sortOrder === "asc" ? compareValue : -compareValue;
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

  // Verificar se deve mostrar controles para usuários comuns (botão de tema)
  // Admin e manager têm esses controles no dashboard, usuários comuns precisam aqui
  const shouldShowUserControls = () => {
    const userRole = user?.position || user?.role || 'user';
    return userRole === 'user'; // Apenas usuários comuns veem o botão de tema
  };

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
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-1 md:space-y-4 sm:space-y-0 sm:space-x-3">
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
                <div className="flex items-center gap-3">
                  {shouldShowUserControls() && (
                    <Button
                      onClick={toggleTheme}
                      className={`${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-slate-700 hover:bg-slate-600 text-white'} px-3 py-2 md:px-4 md:py-3 rounded-xl flex items-center justify-center transition-all duration-300 h-[44px] w-[44px]`}
                      title={isLight ? "Ativar modo escuro" : "Ativar modo claro"}
                    >
                      {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </Button>
                  )}
                  <Button
                    onClick={onNavigateToNewQuote}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 text-sm md:text-base min-w-[160px] h-[44px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t("quoteRequests.newQuote")}</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {shouldShowUserControls() && (
                    <Button
                      onClick={toggleTheme}
                      className={`${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-slate-700 hover:bg-slate-600 text-white'} px-3 py-2 md:px-4 md:py-3 rounded-xl flex items-center justify-center transition-all duration-300 h-[44px] w-[44px]`}
                      title={isLight ? "Ativar modo escuro" : "Ativar modo claro"}
                    >
                      {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </Button>
                  )}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={`flex-1 dashboard-main p-3 md:p-4 lg:p-8 ${isLight ? 'bg-gray-50' : 'bg-dark-bg'} overflow-hidden`}>
  <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 md:mb-6 space-y-3 md:space-y-4 lg:space-y-0 flex-shrink-0">
            {/* Tabs - ocultas no mobile */}
            <TabsList className={`hidden md:flex backdrop-blur-sm rounded-xl p-1 overflow-x-auto scrollbar-thin border-2 ${
              isLight 
                ? 'bg-gray-100 border-gray-300 scrollbar-thumb-gray-400 scrollbar-track-transparent' 
                : 'bg-slate-800/50 border-slate-700/50 scrollbar-thumb-slate-600 scrollbar-track-transparent'
            }`}>
              <TabsTrigger
                value="all"
                className={`transition-all duration-200 whitespace-nowrap px-3 py-2 sm:px-4 min-w-max text-xs sm:text-sm rounded-lg ${
                  isLight 
                    ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600 hover:bg-blue-100 hover:text-blue-700' 
                    : 'data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 hover:bg-blue-500/20 hover:text-blue-300'
                }`}
              >
                {t("quoteRequests.allTab")} ({filteredCotacoes.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className={`transition-all duration-200 whitespace-nowrap px-3 py-2 sm:px-4 min-w-max text-xs sm:text-sm rounded-lg ${
                  isLight 
                    ? 'data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-600 hover:bg-orange-100 hover:text-orange-700' 
                    : 'data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300 hover:bg-orange-500/20 hover:text-orange-300'
                }`}
              >
                {t("quoteRequests.pendingTab")} ({filteredCotacoes.filter(getTabFilter('pending')).length})
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className={`transition-all duration-200 whitespace-nowrap px-3 py-2 sm:px-4 min-w-max text-xs sm:text-sm rounded-lg ${
                  isLight 
                    ? 'data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-600 hover:bg-green-100 hover:text-green-700' 
                    : 'data-[state=active]:bg-green-600 data-[state=active]:text-white text-slate-300 hover:bg-green-500/20 hover:text-green-300'
                }`}
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
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isLight 
                      ? 'text-gray-400 group-hover:text-blue-500' 
                      : 'text-slate-400 group-hover:text-cyan-400'
                  } transition-colors duration-200 z-10 pointer-events-none`} />
                  <Input
                    placeholder={t("quoteRequests.searchByClient")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-11 w-full h-10 md:h-auto transition-all duration-200 ${
                      isLight 
                        ? 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                        : 'bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 hover:border-cyan-400/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
                    }`}
                  />
                </div>

                {/* Paginação sempre visível, inclusive no mobile */}
                <div className="flex items-center gap-2 ml-auto justify-end mt-2 md:mt-0">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 hover:scale-105 ${
                      isLight 
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 hover:border-gray-300' 
                        : 'bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 border border-slate-600/50 hover:border-slate-500/70'
                    }`}
                    disabled={currentPage === 1}
                  >
                    {t("quoteRequests.previous")}
                  </button>
                  <span className={`font-medium text-sm ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>
                    {t("quoteRequests.page")} {currentPage} {t("quoteRequests.of")} {getTotalPages()}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(getTotalPages(), p + 1))}
                    className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 hover:scale-105 ${
                      isLight 
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 hover:border-gray-300' 
                        : 'bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 border border-slate-600/50 hover:border-slate-500/70'
                    }`}
                    disabled={currentPage === getTotalPages()}
                  >
                    {t("quoteRequests.next")}
                  </button>
                </div>
              </div>

              {/* Filtros Avançados (Expansíveis) - ocultos no mobile */}
              {showAdvancedFilters && (
                <div className={`hidden md:block rounded-2xl p-4 border-2 space-y-4 ${
                  isLight 
                    ? 'bg-gray-50 border-gray-300' 
                    : 'bg-slate-800/30 border-slate-700/50'
                }`}>
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
                              value="id"
                              className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors duration-200"
                            >
                              🔢 ID
                            </SelectItem>
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
                              value="fornecedor"
                              className="data-[state=checked]:bg-white/5 data-[state=checked]:text-white hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors duration-200"
                            >
                              🏢 Fornecedor
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
                  <div className={`flex flex-col sm:flex-row justify-between items-center pt-3 space-y-2 sm:space-y-0 border-t ${
                    isLight ? 'border-gray-300' : 'border-slate-700/50'
                  }`}>
                    <div className={`text-xs ${
                      isLight ? 'text-gray-600' : 'text-slate-400'
                    }`}>
                      {filteredCotacoes.length} de {cotacoesList.length}{" "}
                      cotações encontradas
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={clearAllFilters}
                        className={`px-3 py-1 text-xs rounded-lg transition-all duration-200 border ${
                          isLight 
                            ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-300' 
                            : 'bg-slate-700/50 hover:bg-slate-600/70 hover:border-red-500/30 border-slate-600/50 text-slate-300 hover:text-red-300'
                        }`}
                      >
                        Limpar Filtros
                      </button>
                      <button
                        onClick={() => setShowAdvancedFilters(false)}
                        className={`px-3 py-1 text-xs rounded-lg transition-all duration-200 border ${
                          isLight 
                            ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-600 hover:text-blue-700' 
                            : 'bg-blue-600/20 hover:bg-blue-600/40 border-blue-500/30 hover:border-blue-400/50 text-blue-400 hover:text-blue-300'
                        }`}
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
                              onNotifyClient={handleNotifyClient}
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
                              onNotifyClient={handleNotifyClient}
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
              {approvalModal.action === 'approve' && t('quoteRequests.approveQuote')}
              {approvalModal.action === 'set_pending' && t('quoteRequests.markAsPending')}
            </DialogTitle>
            <DialogDescription className={`text-sm ${
              isLight ? 'text-gray-600' : 'text-slate-300'
            }`}>
              {t('quoteRequests.reasonDescription')}
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
          <DialogHeader className={`${isLight ? 'border-gray-200' : 'border-slate-700/50'} border-b pb-3`}>
            <DialogTitle className={`text-xl font-bold ${isLight ? 'text-gray-800' : 'text-white'} flex items-center gap-2`}>
              <FileText className={`h-5 w-5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
              {t("quoteRequests.quotationDetails")} {selectedCotacao?.id}
            </DialogTitle>
          </DialogHeader>

          {/* Exibir itens da cotação com todos os campos fundamentais */}
          {cotacaoItens.length > 0 ? (
            <div className="mt-6">
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                isLight ? 'text-gray-800' : 'text-white'
              }`}>
                <Info className={`h-5 w-5 ${isLight ? 'text-blue-500' : 'text-cyan-400'}`} />
                {t("quoteRequests.quotationItems")}
              </h3>
              <div className="space-y-4">
                {cotacaoItens.map(item => (
                  <ItemDetalheCard key={item.id} item={item} onItemReplaced={fetchCotacaoItens} isLight={isLight} />
                ))}
              </div>
            </div>
          ) : (
            <div className={`mt-6 text-sm p-4 rounded-lg border-2 border-dashed ${
              isLight 
                ? 'text-gray-600 border-gray-300 bg-gray-50' 
                : 'text-slate-400 border-slate-600 bg-slate-800/30'
            }`}>{t("quoteRequests.noItemsFound")}</div>
          )}
          <div className={`rounded-2xl p-4 border-2 mt-6 ${
            isLight 
              ? 'bg-gray-50 border-gray-300' 
              : 'bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-slate-600/30'
          }`}>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <button
                  className={`w-full sm:w-auto px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] text-sm border-2 ${
                    isLight 
                      ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 hover:border-blue-400 hover:shadow-lg' 
                      : 'bg-cyan-900/30 hover:bg-cyan-700/40 text-cyan-300 border-cyan-700/40 hover:border-cyan-400/60'
                  }`}
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
              <button onClick={openEmailModal} className={`w-full sm:w-auto px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] text-sm border-2 ${
                isLight 
                  ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300 hover:border-purple-400 hover:shadow-lg' 
                  : 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 text-purple-400 border-purple-500/50 hover:border-purple-400/70 hover:shadow-purple-400/20'
              }`}>
                <Mail className="h-4 w-4" />
                {t("quoteRequests.seeEmail")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Proposta de E-mail */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className={`w-full max-w-3xl ${
          isLight
            ? 'bg-white border border-slate-200'
            : 'bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/90 border border-cyan-500/30'
        } rounded-2xl overflow-hidden`}
        >
          <DialogHeader className={`${isLight ? 'border-gray-200' : 'border-cyan-500/20'} border-b pb-3`}>
            <DialogTitle className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-cyan-100'}`}>
              <Mail className={`h-5 w-5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
              {t('quoteRequests.emailProposalTitle')} {selectedCotacao?.id}
            </DialogTitle>
            <DialogDescription className={`${isLight ? 'text-slate-600' : 'text-slate-300'} text-sm`}>
              {t('quoteRequests.emailProposalDescription')}
            </DialogDescription>
          </DialogHeader>

          {emailError && (
            <div className={`mt-3 px-4 py-3 rounded-lg border ${isLight ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-900/30 border-red-700/40 text-red-200'}`}>
              {emailError}
            </div>
          )}

          <div className="mt-4 space-y-4">
            <div className={`rounded-xl border-2 ${
              isLight
                ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                : 'bg-gradient-to-br from-cyan-900/30 via-slate-800/30 to-blue-900/30 border-cyan-700/30'
            } p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-cyan-200'}`}>email_proposta</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEmailEditable(v => !v)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                      emailEditPulse 
                        ? 'animate-pulse bg-amber-100 text-amber-900 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.7)]' 
                        : ''
                    } ${
                      emailEditable
                        ? (isLight ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-yellow-600/30 text-yellow-200 border-yellow-400/40')
                        : (isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-700/60 text-slate-200 border-slate-600/50')
                    }`}
                  >
                    {emailEditable ? 'Bloquear edição' : 'Editar'}
                  </button>
                  <button
                    onClick={handleDownloadEmailTxt}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                      isLight ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-blue-600/30 text-blue-200 border-blue-400/40'
                    }`}
                  >
                    Baixar .txt
                  </button>
                </div>
              </div>

              <div className="relative">
                {emailLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="animate-pulse text-xs px-3 py-1.5 rounded-md bg-cyan-600/30 text-cyan-100 border border-cyan-400/30">Carregando...</div>
                  </div>
                )}
                <textarea
                  value={emailText}
                  onChange={(e)=> setEmailText(e.target.value)}
                  readOnly={!emailEditable}
                  className={`w-full min-h-[260px] rounded-lg p-4 text-sm outline-none resize-vertical border ${
                    isLight 
                      ? 'bg-white text-slate-900 border-blue-200 focus:border-blue-400'
                      : 'bg-slate-900/40 text-slate-100 border-cyan-700/30 focus:border-cyan-400/60'
                  }`}
                  placeholder="Sem conteúdo."
                />
                {emailGenerating && (
                  <>
                    <div className="absolute inset-0 rounded-lg backdrop-blur-[2px]" />
                    <div className="absolute inset-0 rounded-lg pointer-events-none">
                      <div className="h-2 w-1/3 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent rounded-full mt-2 ml-2 animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-pulse" />
                    </div>
                  </>
                )}
              </div>
            </div>

          {/* Área de prompt IA */}
<div className={`relative rounded-xl p-3 border ${
  isLight
    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
    : 'bg-gradient-to-r from-cyan-900/30 to-blue-900/20 border-cyan-700/30'
} ${emailEditable ? '' : 'opacity-60'}`}>

  {!emailEditable && (
    <div
      className="absolute inset-0 z-10 cursor-not-allowed"
      onClick={() => { setEmailEditPulse(true); setTimeout(()=>setEmailEditPulse(false), 1500); }}
      title="Clique em Editar para habilitar a edição e o uso de IA"
    />
  )}

  <div className="relative">
    {/* Título acima do input */}
    <div className={`text-xs font-semibold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
      Editar com IA
    </div>

    {/* Container do input + botão */}
    <div className="relative">
      <input
        type="text"
        value={emailPrompt}
        onChange={(e)=> setEmailPrompt(e.target.value)}
        placeholder="Descreva o que a IA deve alterar (ex.: 'tornar mais formal', 'resumir em 3 parágrafos', 'ajustar para tom técnico')"
        className={`w-full pr-28 pl-3 py-3 rounded-lg text-sm border outline-none ${
              isLight 
                ? 'bg-white text-slate-900 placeholder-slate-400 border-blue-200 focus:border-blue-400' 
                : 'bg-slate-900/40 border-cyan-700/40 focus:border-cyan-400/60 text-slate-100 placeholder-slate-400'
            }`}
          />

          {/* Botão alinhado ao centro do input */}
          <button
            onClick={handleGenerateIA}
            disabled={emailGenerating || !emailPrompt.trim()}
            className={`absolute right-1 top-1/2 -translate-y-1/2 px-4 py-2 rounded-md text-xs font-semibold border transition-colors ${
              emailGenerating
                ? (isLight ? 'bg-purple-200 text-purple-800 border-purple-300' : 'bg-purple-600/40 text-purple-100 border-purple-400/40')
                : (isLight ? 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200' : 'bg-purple-600/30 text-purple-100 border-purple-400/40 hover:bg-purple-600/40')
            }`}
            title="Gerar com IA"
          >
            {emailGenerating ? 'Processando...' : 'Gerar'}
          </button>
        </div>
      </div>

      {emailGenerating && (
        <div className="mt-2 text-xs animate-pulse text-purple-300">
          A IA está processando seu pedido...
        </div>
      )}
      </div>


          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-end">
            <button
              onClick={handleSaveEmail}
              disabled={emailLoading}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold border transition-all ${
                isLight
                  ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300'
                  : 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 text-emerald-200 border-emerald-400/40'
              }`}
            >
              {emailLoading ? 'Salvando...' : 'Concluído'}
            </button>
            <button
              onClick={handleDownloadEmailTxt}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold border transition-all ${
                isLight
                  ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300'
                  : 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/40 hover:to-indigo-600/40 text-blue-200 border-blue-400/40'
              }`}
            >
              Baixar .txt
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between min-w-[300px] max-w-[400px] p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 animate-in slide-in-from-right-5 ${
              toast.type === 'error'
                ? isLight
                  ? 'bg-red-50 border-red-500 text-red-800'
                  : 'bg-red-900/90 border-red-500 text-red-100'
                : toast.type === 'success'
                ? isLight
                  ? 'bg-green-50 border-green-500 text-green-800'
                  : 'bg-green-900/90 border-green-500 text-green-100'
                : isLight
                ? 'bg-blue-50 border-blue-500 text-blue-800'
                : 'bg-blue-900/90 border-blue-500 text-blue-100'
            } backdrop-blur-sm`}
          >
            <div className="flex items-center space-x-2">
              {toast.type === 'error' && (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              {toast.type === 'success' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {toast.type === 'info' && (
                <Info className="w-5 h-5 text-blue-500" />
              )}
              <span className="font-medium text-sm">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`ml-4 p-1 rounded-full hover:bg-black/10 transition-colors ${
                isLight ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Escolha de Formato de Download */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className={`w-full max-w-md p-6 rounded-2xl ${
          isLight 
            ? 'bg-white border border-slate-200' 
            : 'bg-slate-900/95 border border-cyan-400/30'
        }`}>
          <DialogHeader>
            <DialogTitle className={`text-lg font-bold flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <Download className={`h-5 w-5 ${
                isLight ? 'text-blue-600' : 'text-cyan-400'
              }`} />
              {t('quoteRequests.chooseDownloadFormat')}
            </DialogTitle>
            <DialogDescription className={`text-sm ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              {t('quoteRequests.selectFormatDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            <button
              onClick={() => handleDownloadWithFormat('pdf')}
              className={`w-full border-2 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium hover:scale-105 ${
                isLight
                  ? 'bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 text-red-700 hover:text-red-800'
                  : 'bg-red-600/20 hover:bg-red-600/40 border-red-500/30 hover:border-red-400/60 text-red-400 hover:text-red-300'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Baixar como PDF</span>
            </button>
            
            <button
              onClick={() => handleDownloadWithFormat('xlsx')}
              className={`w-full border-2 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium hover:scale-105 ${
                isLight
                  ? 'bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800'
                  : 'bg-green-600/20 hover:bg-green-600/40 border-green-500/30 hover:border-green-400/60 text-green-400 hover:text-green-300'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Baixar como Excel</span>
            </button>
            
            <button
              onClick={() => handleDownloadWithFormat('csv')}
              className={`w-full border-2 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium hover:scale-105 ${
                isLight
                  ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800'
                  : 'bg-blue-600/20 hover:bg-blue-600/40 border-blue-500/30 hover:border-blue-400/60 text-blue-400 hover:text-blue-300'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Baixar como CSV</span>
            </button>
            
            <button
              onClick={() => setIsDownloadModalOpen(false)}
              className={`w-full border-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:scale-[1.02] ${
                isLight
                  ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-800'
                  : 'bg-slate-700/60 hover:bg-slate-600/70 border-slate-600/60 hover:border-slate-500/70 text-slate-200 hover:text-slate-100'
              }`}
            >
              Cancelar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Dynamics 365 Integration - Confirmação */}
      <Dialog open={showDynamicsModal} onOpenChange={(o) => !o && closeDynamicsModal()}>
        <DialogContent className={`max-w-md mx-auto ${isLight ? 'bg-white border-gray-200' : 'bg-dark-card border-dark-color'}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-3 ${isLight ? 'text-gray-800' : 'text-dark-primary-text'}`}>
              <div className={`p-2 rounded-lg ${isLight ? 'bg-green-100' : 'bg-green-500/20'}`}>
                <CheckCircle className={`w-5 h-5 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
              </div>
              {isDynamicsLoading ? t('quoteRequests.creatingOpportunity') : t('quoteRequests.newOpportunityCreated')}
            </DialogTitle>
            <DialogDescription className={`${isLight ? 'text-gray-600' : 'text-dark-secondary'} mt-2`}>
              {isDynamicsLoading 
                ? t('quoteRequests.creatingOpportunityDescription')
                : t('quoteRequests.opportunityCreatedDescription')
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {isDynamicsLoading ? (
              // Loading state
              <div className={`p-4 rounded-lg border ${isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/10 border-blue-500/30'}`}>
                <div className="flex items-center gap-3">
                  <RefreshCw className={`w-5 h-5 animate-spin ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                  <div>
                    <p className={`font-medium ${isLight ? 'text-blue-800' : 'text-blue-200'}`}>
                      Processando integração...
                    </p>
                    <p className={`text-sm ${isLight ? 'text-blue-600' : 'text-blue-300'}`}>
                      Cotação ID: {dynamicsData.cotacaoId}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Success state
              <>
                <div className={`p-4 rounded-lg border ${isLight ? 'bg-green-50 border-green-200' : 'bg-green-500/10 border-green-500/30'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Building className={`w-4 h-4 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
                    <span className={`font-medium text-sm ${isLight ? 'text-green-800' : 'text-green-200'}`}>
                      Dynamics 365 CRM
                    </span>
                  </div>
                  <p className={`text-sm ${isLight ? 'text-green-700' : 'text-green-300'}`}>
                    ✓ Cotação aprovada com sucesso
                  </p>
                  <p className={`text-sm ${isLight ? 'text-green-700' : 'text-green-300'}`}>
                    ✓ Nova oportunidade criada automaticamente
                  </p>
                  <p className={`text-xs ${isLight ? 'text-green-600' : 'text-green-400'} mt-2`}>
                    ID da Cotação: {dynamicsData.cotacaoId}
                  </p>
                </div>

                <div className={`p-3 rounded-lg border ${isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/10 border-blue-500/30'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Info className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                    <span className={`font-medium text-sm ${isLight ? 'text-blue-800' : 'text-blue-200'}`}>
                      Próximos Passos
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
                    Acesse o Dynamics 365 para gerenciar a nova oportunidade, adicionar mais detalhes e acompanhar o progresso.
                  </p>
                </div>
              </>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              {!isDynamicsLoading && (
                <>
                  <Button
                    onClick={() => window.open('https://dynamics.microsoft.com', '_blank')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Abrir Dynamics 365
                  </Button>
                  
                  <Button
                    onClick={closeDynamicsModal}
                    variant="outline"
                    className={`flex-1 ${
                      isLight 
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                        : 'border-dark-color text-dark-secondary hover:bg-dark-hover'
                    }`}
                  >
                    Fechar
                  </Button>
                </>
              )}
              
              {isDynamicsLoading && (
                <Button
                  disabled
                  className="w-full bg-blue-600 text-white opacity-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Notificação para Produto Não Encontrado */}
      <Dialog open={isNotifyModalOpen} onOpenChange={setIsNotifyModalOpen}>
        <DialogContent className={`max-w-2xl mx-auto ${isLight ? 'bg-white border-gray-200' : 'bg-dark-card border-dark-color'}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-3 ${isLight ? 'text-gray-800' : 'text-dark-primary-text'}`}>
              <div className={`p-2 rounded-lg ${isLight ? 'bg-orange-100' : 'bg-orange-500/20'}`}>
                <Mail className={`w-5 h-5 ${isLight ? 'text-orange-600' : 'text-orange-400'}`} />
              </div>
              Notificar Cliente - Produto Não Encontrado
            </DialogTitle>
            <DialogDescription className={`${isLight ? 'text-gray-600' : 'text-dark-secondary'} mt-2`}>
              Envie uma notificação ao cliente informando que o produto da cotação não foi encontrado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Informações da Cotação */}
            {selectedCotacaoForNotify && (
              <div className={`p-4 rounded-lg border ${isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/10 border-blue-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                  <span className={`font-medium text-sm ${isLight ? 'text-blue-800' : 'text-blue-200'}`}>
                    Cotação #{selectedCotacaoForNotify.id}
                  </span>
                </div>
                <p className={`text-sm ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
                  Cliente: {selectedCotacaoForNotify.aprovado_por || selectedCotacaoForNotify.cliente || 'N/A'}
                </p>
                {selectedCotacaoForNotify.prompt?.texto_original && (
                  <p className={`text-xs ${isLight ? 'text-blue-600' : 'text-blue-400'} mt-1`}>
                    Solicitação: {selectedCotacaoForNotify.prompt.texto_original}
                  </p>
                )}
              </div>
            )}

            {/* Campo de Mensagem */}
            <div className="space-y-2">
              <Label className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-dark-primary-text'}`}>
                Mensagem de Notificação
              </Label>
              <textarea
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                rows={6}
                className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all ${
                  isLight 
                    ? 'bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-200' 
                    : 'bg-slate-800 text-white border-slate-600 focus:border-cyan-400 focus:ring-cyan-400/20'
                }`}
                placeholder="Digite a mensagem que será enviada ao cliente..."
                disabled={notifyLoading}
              />
              <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                Esta mensagem será enviada como notificação ao cliente responsável pela cotação.
              </p>
            </div>

            {/* Mensagens de Erro e Sucesso */}
            {notifyError && (
              <div className={`p-3 rounded-lg border ${isLight ? 'bg-red-50 border-red-200' : 'bg-red-900/20 border-red-500/30'}`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${isLight ? 'text-red-600' : 'text-red-400'}`} />
                  <p className={`text-sm ${isLight ? 'text-red-700' : 'text-red-300'}`}>
                    {notifyError}
                  </p>
                </div>
              </div>
            )}

            {notifySuccess && (
              <div className={`p-3 rounded-lg border ${isLight ? 'bg-green-50 border-green-200' : 'bg-green-900/20 border-green-500/30'}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${isLight ? 'text-green-600' : 'text-green-400'}`} />
                  <p className={`text-sm ${isLight ? 'text-green-700' : 'text-green-300'}`}>
                    {notifySuccess}
                  </p>
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSendNotification}
                disabled={notifyLoading || !notifyMessage.trim()}
                className={`flex-1 ${
                  notifyLoading || !notifyMessage.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700'
                } text-white`}
              >
                {notifyLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Notificação
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => {
                  setIsNotifyModalOpen(false);
                  setNotifyMessage("");
                  setNotifyError("");
                  setNotifySuccess("");
                  setSelectedCotacaoForNotify(null);
                }}
                disabled={notifyLoading}
                variant="outline"
                className={`flex-1 ${
                  isLight 
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                    : 'border-dark-color text-dark-secondary hover:bg-dark-hover'
                }`}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
