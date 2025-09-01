import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, Heart, Grid, List, Plus, Edit2, Trash2, RefreshCw, CheckCircle, X, Activity } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useTranslation } from 'react-i18next';
import { Product } from "../../types";
// Modal de edição antigo substituído por formulário inline
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger,
} from "../ui/alert-dialog";

interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  duration?: number;
}

interface ProductSearchPageProps {
  onNavigateToNewProduct?: () => void;
}

export function ProductSearchPage({ onNavigateToNewProduct }: ProductSearchPageProps = {}) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  // Estados para toast notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  
  // Usar contexto global para produtos e favoritos
  const { 
    products, 
    loadProducts, 
    isLoadingProducts, 
    updateProduct,
    deleteProduct,
    favorites, 
    toggleFavorite
  } = useApp();

  // Carregar produtos ao montar o componente
  useEffect(() => {
    loadProducts();
  }, []);

  // Funções para Toast Notifications
  const showToast = (
    type: "success" | "error" | "info",
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString();
    const newToast: ToastNotification = { id, type, title, message, duration };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast após duração especificada
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Converter Product para o formato esperado pelo componente de exibição


  // Usar os produtos reais do backend para os cards, não apenas o objeto de display
  const displayProducts = products;

  // All products are displayed with scroll instead of pagination
  const filteredProducts = products.filter((product) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      (product.nome || "").toLowerCase().includes(searchLower) ||
      (product.descricao || "").toLowerCase().includes(searchLower) ||
      (product.codigo || "").toLowerCase().includes(searchLower) ||
      (product.modelo || "").toLowerCase().includes(searchLower) ||
      (product.origem || "").toLowerCase().includes(searchLower)
    );
  });

  // Lógica de paginação
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  // Resetar página ao filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Sempre que currentPage for maior que totalPages, ajusta para o máximo disponível
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const ProductCard = ({ produto }: { produto: Product }) => (
    <div className={`glass-card bg-white/5 rounded-xl border border-white/20 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] w-full max-w-full overflow-hidden group relative ${
      viewMode === "list" ? "flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6 p-4 lg:p-6" : "p-4 lg:p-6 flex flex-col h-full"
    }`}>
      {/* Image */}
      <div className={`relative ${viewMode === "list" ? "w-full lg:w-32 h-48 lg:h-24" : "w-full h-48"} bg-gray-800 rounded-xl overflow-hidden mb-4 ${viewMode === "list" ? "lg:mb-0" : ""} group`}>
        <img 
          src={produto.image_url || "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop"}
          alt={produto.nome}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
        />
        <button
          onClick={() => produto.id && toggleFavorite(produto.id.toString())}
          className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        >
          <Heart className={`w-4 h-4 transition-colors ${produto.id && favorites.includes(produto.id.toString()) ? "text-red-400 fill-current" : "text-white hover:text-red-300"}`} />
        </button>
      </div>

      {/* Content */}
      <div className={`${viewMode === "list" ? "flex-1" : "flex-1 flex flex-col"}`}>
        <div className="mb-4 flex-grow">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-3 space-y-2 lg:space-y-0">
            <h3 className={`font-bold text-dark-primary hover:text-cyan-400 transition-colors duration-300 ${viewMode === "list" ? "text-lg" : "text-base"} leading-tight line-clamp-2`}>
              {produto.nome}
            </h3>
            {getDisponibilidadeBadge(produto.estoque)}
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-300 font-medium truncate mr-2">{produto.modelo || "Sem Categoria"}</p>
            <span className="text-xs text-dark-secondary bg-dark-tag px-2 py-1 rounded-full truncate max-w-[120px]">Fornecedor {produto.fornecedorId || "N/A"}</span>
          </div>
        </div>

        {viewMode === "list" && (
          <p className="text-sm text-dark-secondary mb-3 line-clamp-2">
            {produto.descricao}
          </p>
        )}

        <div className="mt-auto">
          <div className="flex flex-col space-y-3 mb-3">
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-xl font-bold text-green-400">€{produto.preco?.toFixed(2)}</span>
              </div>
              <p className="text-xs text-dark-secondary mt-1 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 flex-shrink-0"></span>
                <span className="truncate">3-5 dias úteis</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 w-full">
            <button 
              onClick={() => produto.id !== undefined && handleEditProduct(produto.id)}
              className="glass-card p-2 rounded-lg hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-300 hover:scale-110 group flex-shrink-0"
              title="Editar"
              disabled={produto.id === undefined}
            >
              <Edit2 className="w-4 h-4 text-dark-secondary group-hover:text-blue-400 transition-colors" />
            </button>
            <button 
              onClick={() => produto.id !== undefined && handleDeleteProduct(produto.id)}
              className="glass-card p-2 rounded-lg hover:bg-red-500/20 hover:border-red-400/50 transition-all duration-300 hover:scale-110 group flex-shrink-0"
              title="Remover"
              disabled={produto.id === undefined}
            >
              <Trash2 className="w-4 h-4 text-dark-secondary group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Função para editar produto
  const handleEditProduct = async (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      // Clona para estado editável
      setEditingProduct({ ...product });
      setIsEditingInline(true);
      // Scroll para topo para ver formulário
      setTimeout(() => {
        const el = document.getElementById('edit-product-form');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  // Função para apagar produto
  const handleDeleteProduct = async (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  // Função para atualizar produtos
  const handleRefreshProducts = async () => {
    try {
      await loadProducts();
    } catch (error) {
      console.error('Erro ao atualizar produtos:', error);
    }
  };

  const getDisponibilidadeBadge = (estoque: number) => {
    if (estoque > 10) {
      return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">Em Stock</Badge>;
    } else if (estoque > 0) {
      return <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">Limitado</Badge>;
    } else {
      return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">Indisponível</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Compacto no mobile */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-1 md:py-4 lg:py-6 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-2 md:space-y-4 lg:space-y-0 w-full">
          <div className="hidden md:block">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <Search className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              {t('productSearch.title')}
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">{t('productSearch.subtitle')}</p>
          </div>
          
          {/* Header mobile compacto */}
          <div className="md:hidden flex items-center justify-between">
            <h1 className="text-lg font-bold text-dark-primary flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-400" />
              Produtos
            </h1>
            <span className="text-blue-300 font-bold text-sm">
              {displayProducts.length}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 md:space-y-3 sm:space-y-0 sm:space-x-3 w-full">
            {/* Ações: alinhadas à direita em telas grandes, centralizadas no mobile */}
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 w-full md:w-auto md:justify-end md:ml-auto">
              <div className="glass-card bg-white/5 border-blue-500/30 px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 text-blue-300 text-sm min-w-[120px] md:min-w-[160px] h-[40px] md:h-[44px] w-full md:w-auto">
                <span className="font-bold text-base md:text-lg">{displayProducts.length}</span>
                <span className="ml-2 text-blue-200">produtos</span>
              </div>
              <button
                onClick={handleRefreshProducts}
                disabled={isLoadingProducts}
                className="glass-card bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-400/50 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg text-sm min-w-[120px] md:min-w-[160px] h-[40px] md:h-[44px] w-full md:w-auto"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingProducts ? 'animate-spin' : ''}`} />
                <span>{isLoadingProducts ? 'Carregando...' : 'Atualizar'}</span>
              </button>
              <button
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="glass-card bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-400/50 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 text-sm shadow-lg min-w-[120px] md:min-w-[160px] h-[40px] md:h-[44px] w-full md:w-auto"
              >
                {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                <span>{viewMode === "grid" ? "Lista" : "Grade"}</span>
              </button>
              <button
                onClick={() => onNavigateToNewProduct?.()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 text-sm md:text-base min-w-[120px] md:min-w-[160px] h-[40px] md:h-[44px] w-full md:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Produto</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-3 md:p-4 lg:p-8 bg-dark-bg">
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-slate-300">Carregando produtos...</p>
          </div>
        ) : (
        <Tabs defaultValue="all" className="w-full h-full flex flex-col">
          {isEditingInline && editingProduct && (
            <div id="edit-product-form" className="mb-6 glass-card bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl border border-blue-500/30 p-4 md:p-6 animate-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Edit2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Editar Produto</h2>
                    <p className="text-xs text-blue-200">Atualize as informações e salve para aplicar mudanças</p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsEditingInline(false); setEditingProduct(null); }}
                  className="text-slate-400 hover:text-white text-sm"
                >Cancelar</button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!editingProduct || editingProduct.id === undefined) return;
                  try {
                    const now = new Date().toISOString();
                    const updated: Product = {
                      ...editingProduct,
                      atualizado_em: now,
                      // mantém atualizado_por existente; se ausente reaproveita cadastrado_por
                      atualizado_por: editingProduct.atualizado_por || editingProduct.cadastrado_por,
                    };
                    await updateProduct(updated);
                    showToast('success', 'Produto Atualizado', `Produto "${updated.nome}" salvo com sucesso!`, 4000);
                    setIsEditingInline(false);
                    setEditingProduct(null);
                  } catch (err) {
                    console.error('Erro ao atualizar produto:', err);
                    showToast('error', 'Erro', 'Não foi possível salvar alterações.', 5000);
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Fornecedor</label>
                    <input
                      type="number"
                      value={editingProduct.fornecedorId || ''}
                      onChange={e => setEditingProduct(p => p ? { ...p, fornecedorId: parseInt(e.target.value) || undefined } : p)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white"
                      placeholder="ID fornecedor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Código</label>
                    <input
                      type="text"
                      value={editingProduct.codigo || ''}
                      onChange={e => setEditingProduct(p => p ? { ...p, codigo: e.target.value } : p)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white"
                      placeholder="Código/SKU"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nome *</label>
                    <input
                      required
                      type="text"
                      value={editingProduct.nome}
                      onChange={e => setEditingProduct(p => p ? { ...p, nome: e.target.value } : p)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white"
                      placeholder="Nome do produto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Modelo</label>
                    <input
                      type="text"
                      value={editingProduct.modelo || ''}
                      onChange={e => setEditingProduct(p => p ? { ...p, modelo: e.target.value } : p)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white"
                      placeholder="Modelo"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Descrição *</label>
                    <textarea
                      required
                      rows={2}
                      value={editingProduct.descricao}
                      onChange={e => setEditingProduct(p => p ? { ...p, descricao: e.target.value } : p)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white"
                      placeholder="Descrição"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Preço *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={editingProduct.preco}
                      onChange={e => setEditingProduct(p => p ? { ...p, preco: parseFloat(e.target.value) || 0 } : p)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Unidade</label>
                    <input
                      type="text"
                      value={editingProduct.unidade || ''}
                      onChange={e => setEditingProduct(p => p ? { ...p, unidade: e.target.value } : p)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white"
                      placeholder="Unidade"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Estoque</label>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct.estoque}
                      onChange={e => setEditingProduct(p => p ? { ...p, estoque: parseInt(e.target.value) || 0 } : p)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white"
                      placeholder="Estoque"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Origem</label>
                    <input
                      type="text"
                      value={editingProduct.origem || ''}
                      onChange={e => setEditingProduct(p => p ? { ...p, origem: e.target.value } : p)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white"
                      placeholder="Origem"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                  >Salvar Alterações</button>
                  <button
                    type="button"
                    onClick={() => { setIsEditingInline(false); setEditingProduct(null); }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                  >Cancelar</button>
                </div>
              </form>
            </div>
          )}
          {/* Esconde a barra de ações e paginação durante edição inline */}
          {!isEditingInline && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 md:mb-6 space-y-3 md:space-y-4 lg:space-y-0 flex-shrink-0">
              {/* Tabs - ocultas no mobile */}
              <TabsList className="hidden md:flex glass-card bg-white/5 border border-white/20 rounded-xl p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-dark-secondary text-sm rounded-lg px-4 py-2 transition-all duration-300">
                  Todos os Produtos ({filteredProducts.length})
                </TabsTrigger>
              </TabsList>

              {/* Paginação sempre visível, inclusive no mobile */}
              <div className="flex items-center gap-4 ml-auto justify-end mt-2 md:mt-0">
                {/* Pesquisa movida para cá */}
                <div className="relative group flex-1 min-w-0 max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70 group-hover:text-blue-400 transition-colors duration-200 z-10 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Pesquisar por nome, descrição, código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 w-full bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-10 md:h-auto rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  />
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 font-semibold text-sm disabled:opacity-50"
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                <span className="text-slate-300 font-medium text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 font-semibold text-sm disabled:opacity-50"
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </button>
              </div>
            </div>
          )}

          {/* Só mostra a lista de produtos se NÃO estiver editando inline */}
          {!isEditingInline && (
          <div className="flex-1 force-scroll scrollable-content min-h-0 overflow-y-scroll">
              <TabsContent value="all" className="h-full mt-0">
                <div className={`grid gap-3 md:gap-4 lg:gap-6 w-full min-h-[800px] ${
                  viewMode === "grid" 
                    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                    : "grid-cols-1"
                }`}>
                  {paginatedProducts.map((produto) => (
                    <ProductCard key={produto.id} produto={produto} />
                  ))}
                </div>
              </TabsContent>

              {/* TabsContent removidos: Populares e Ofertas */}

              {paginatedProducts.length === 0 && !isLoadingProducts && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-dark-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-dark-primary mb-2">
                    {searchTerm.trim() ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                  </h3>
                  <p className="text-dark-secondary">
                    {searchTerm.trim()
                      ? `Nenhum produto corresponde à pesquisa "${searchTerm}". Tente outros termos.`
                      : "Nenhum produto cadastrado. Adicione o primeiro produto ao sistema."
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </Tabs>
        )}
      </main>

  {/* Modal de Edição removido em favor de formulário inline */}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="glass-card border-white/20 bg-slate-800/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Confirmar Remoção
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Tem certeza que deseja remover o produto{" "}
              <strong className="text-white">{productToDelete?.nome}</strong>? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 px-6 py-2 rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (productToDelete) {
                  try {
                    if (typeof productToDelete.id === 'number') {
                      await deleteProduct(productToDelete.id);
                      // Toast de sucesso
                      showToast(
                        'success',
                        'Produto Apagado',
                        `Produto "${productToDelete.nome}" foi apagado com sucesso!`,
                        4000
                      );
                    } else {
                      alert('ID do produto inválido.');
                    }
                    setIsDeleteDialogOpen(false);
                    setProductToDelete(null);
                  } catch (error) {
                    console.error('Erro ao deletar produto:', error);
                    alert('Erro ao deletar produto. Tente novamente.');
                  }
                }
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-xl font-semibold"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast Notifications Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`transform transition-all duration-500 ease-in-out animate-in slide-in-from-right glass-card backdrop-blur-xl border-2 rounded-2xl p-5 shadow-2xl hover:scale-105 pointer-events-auto ${
              toast.type === "success"
                ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-50 shadow-emerald-500/20"
                : toast.type === "error"
                ? "bg-red-500/15 border-red-400/40 text-red-50 shadow-red-500/20"
                : "bg-cyan-500/15 border-cyan-400/40 text-cyan-50 shadow-cyan-500/20"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    toast.type === "success"
                      ? "bg-emerald-500/80 ring-2 ring-emerald-400/30"
                      : toast.type === "error"
                      ? "bg-red-500/80 ring-2 ring-red-400/30"
                      : "bg-cyan-500/80 ring-2 ring-cyan-400/30"
                  }`}
                >
                  {toast.type === "success" && (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                  {toast.type === "error" && (
                    <X className="w-5 h-5 text-white" />
                  )}
                  {toast.type === "info" && (
                    <Activity className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm leading-tight mb-1">
                    {toast.title}
                  </h4>
                  <p className="text-xs opacity-90 leading-relaxed">
                    {toast.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 p-1.5 rounded-full hover:bg-white/15 transition-all duration-200 flex-shrink-0 hover:scale-110"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Progress bar para mostrar tempo restante */}
            <div
              className={`mt-4 h-1.5 rounded-full overflow-hidden ${
                toast.type === "success"
                  ? "bg-emerald-500/20"
                  : toast.type === "error"
                  ? "bg-red-500/20"
                  : "bg-cyan-500/20"
              }`}
            >
              <div
                className={`h-full rounded-full ${
                  toast.type === "success"
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                    : toast.type === "error"
                    ? "bg-gradient-to-r from-red-400 to-red-500"
                    : "bg-gradient-to-r from-cyan-400 to-cyan-500"
                }`}
                style={{
                  animation: `shrink ${
                    toast.duration || 5000
                  }ms linear forwards`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* CSS para animação da progress bar */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-in {
          animation: slideInFromRight 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}