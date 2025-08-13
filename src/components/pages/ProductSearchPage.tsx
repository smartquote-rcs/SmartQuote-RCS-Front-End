import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, ShoppingCart, Eye, Heart, Grid, List, Plus, Edit2, Trash2, RefreshCw, CheckCircle, X, Activity } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useTranslation } from 'react-i18next';
import { Product } from "../../types";
import { EditProductModal } from "../EditProductModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [fornecedorFilter, setFornecedorFilter] = useState("Todos");
  const [priceRange, setPriceRange] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
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
  const convertProductToDisplay = (product: Product) => ({
    id: product.id || 0, // Manter como number
    nome: product.nome,
    categoria: `Categoria ${product.categoriaId}`,
    fornecedor: "Fornecedor Genérico", // Pode ser expandido quando houver relação com fornecedores
    preco: `€${product.preco.toFixed(2)}`,
    precoOriginal: null, // Pode ser implementado depois
    avaliacao: 4.5, // Valor padrão, pode ser implementado depois
    avaliacoes: 0, // Valor padrão
    descricao: product.descricao,
    especificacoes: [], // Pode ser expandido depois
    disponibilidade: product.ativo ? "Em stock" : "Indisponível",
    prazoEntrega: "3-5 dias úteis", // Valor padrão
    imagem: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop", // Imagem padrão
    desconto: 0, // Valor padrão
    popular: false // Valor padrão
  });

  const displayProducts = products.map(convertProductToDisplay);

  // Extrair categorias únicas dos produtos reais
  const categorias = ["Todas", ...Array.from(new Set(products.map(p => `Categoria ${p.categoriaId}`)))];
  
  // Para fornecedores, vamos usar uma lista simples por enquanto (pode ser expandida depois)
  const fornecedores = ["Todos"];

  const getDisponibilidadeBadge = (disponibilidade: string) => {
    switch (disponibilidade) {
      case "Em stock":
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">Em Stock</Badge>;
      case "Sob consulta":
        return <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">Sob Consulta</Badge>;
      case "Limitado":
        return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">Limitado</Badge>;
      case "Indisponível":
        return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">Indisponível</Badge>;
      default:
        return <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">{disponibilidade}</Badge>;
    }
  };

  const filteredProducts = displayProducts.filter((produto) => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "Todas" || produto.categoria === categoryFilter;
    const matchesFornecedor = fornecedorFilter === "Todos" || produto.fornecedor === fornecedorFilter;
    
    let matchesPrice = true;
    if (priceRange !== "all") {
      const price = parseFloat(produto.preco.replace(/[€,]/g, ''));
      switch (priceRange) {
        case "0-500":
          matchesPrice = price <= 500;
          break;
        case "500-2000":
          matchesPrice = price > 500 && price <= 2000;
          break;
        case "2000-10000":
          matchesPrice = price > 2000 && price <= 10000;
          break;
        case "10000+":
          matchesPrice = price > 10000;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesFornecedor && matchesPrice;
  });

  const ProductCard = ({ produto }: { produto: any }) => (
    <div className={`glass-card bg-white/5 rounded-xl border border-white/20 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] w-full max-w-full overflow-hidden group relative ${
      viewMode === "list" ? "flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6 p-4 lg:p-6" : "p-4 lg:p-6 flex flex-col h-full"
    }`}>
      {/* Image */}
      <div className={`relative ${viewMode === "list" ? "w-full lg:w-32 h-48 lg:h-24" : "w-full h-48"} bg-gray-800 rounded-xl overflow-hidden mb-4 ${viewMode === "list" ? "lg:mb-0" : ""} group`}>
        <img 
          src={produto.imagem} 
          alt={produto.nome}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
        />
        {produto.desconto > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            -{produto.desconto}%
          </div>
        )}
        {produto.popular && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {t('productSearch.popular')}
          </div>
        )}
        <button
          onClick={() => toggleFavorite(produto.id)}
          className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        >
          <Heart className={`w-4 h-4 transition-colors ${favorites.includes(produto.id) ? "text-red-400 fill-current" : "text-white hover:text-red-300"}`} />
        </button>
      </div>

      {/* Content */}
      <div className={`${viewMode === "list" ? "flex-1" : "flex-1 flex flex-col"}`}>
        <div className="mb-4 flex-grow">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-3 space-y-2 lg:space-y-0">
            <h3 className={`font-bold text-dark-primary hover:text-cyan-400 transition-colors duration-300 ${viewMode === "list" ? "text-lg" : "text-base"} leading-tight line-clamp-2`}>
              {produto.nome}
            </h3>
            {getDisponibilidadeBadge(produto.disponibilidade)}
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-300 font-medium truncate mr-2">{produto.categoria}</p>
            <span className="text-xs text-dark-secondary bg-dark-tag px-2 py-1 rounded-full truncate max-w-[120px]">{produto.fornecedor}</span>
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
                <span className="text-xl font-bold text-green-400">{produto.preco}</span>
                {produto.precoOriginal && (
                  <span className="text-sm text-red-400 line-through bg-red-500/20 px-2 py-1 rounded">{produto.precoOriginal}</span>
                )}
              </div>
              <p className="text-xs text-dark-secondary mt-1 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 flex-shrink-0"></span>
                <span className="truncate">{produto.prazoEntrega}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 w-full">
            <button className="glass-card p-2 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-110 group flex-shrink-0">
              <Eye className="w-4 h-4 text-dark-secondary group-hover:text-cyan-400 transition-colors" />
            </button>
            <button 
              onClick={() => handleEditProduct(produto.id)}
              className="glass-card p-2 rounded-lg hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-300 hover:scale-110 group flex-shrink-0"
              title="Editar"
            >
              <Edit2 className="w-4 h-4 text-dark-secondary group-hover:text-blue-400 transition-colors" />
            </button>
            <button 
              onClick={() => handleDeleteProduct(produto.id)}
              className="glass-card p-2 rounded-lg hover:bg-red-500/20 hover:border-red-400/50 transition-all duration-300 hover:scale-110 group flex-shrink-0"
              title="Remover"
            >
              <Trash2 className="w-4 h-4 text-dark-secondary group-hover:text-red-400 transition-colors" />
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 sm:px-3 sm:py-2 text-sm flex items-center justify-center space-x-2 rounded-lg transition-all duration-300 flex-1 min-h-[40px]">
              <ShoppingCart className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{t('productSearch.requestQuote')}</span>
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
      setEditingProduct(product);
      setIsEditModalOpen(true);
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <Search className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              {t('productSearch.title')}
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">{t('productSearch.subtitle')}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => onNavigateToNewProduct?.()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 hover:scale-105 text-sm shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
            <button
              onClick={handleRefreshProducts}
              disabled={isLoadingProducts}
              className="glass-card bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-400/50 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingProducts ? 'animate-spin' : ''}`} />
              <span>{isLoadingProducts ? 'Carregando...' : 'Atualizar'}</span>
            </button>
            <div className="glass-card px-4 py-2 text-center sm:text-left bg-blue-500/20 border-blue-500/30">
              <span className="text-blue-300 font-bold text-lg">{displayProducts.length}</span>
              <span className="text-blue-200 ml-2">produtos</span>
            </div>
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="glass-card bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-400/50 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 text-sm shadow-lg"
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              <span>{viewMode === "grid" ? "Lista" : "Grade"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-slate-300">Carregando produtos...</p>
          </div>
        ) : (
        <Tabs defaultValue="all" className="w-full h-full flex flex-col">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0 flex-shrink-0">
            <TabsList className="glass-card bg-white/5 border border-white/20 rounded-xl p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-dark-secondary text-sm rounded-lg px-4 py-2 transition-all duration-300">
                Todos os Produtos ({displayProducts.length})
              </TabsTrigger>
              <TabsTrigger value="popular" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-dark-secondary text-sm rounded-lg px-4 py-2 transition-all duration-300">
                Populares ({displayProducts.filter(p => p.popular).length})
              </TabsTrigger>
              <TabsTrigger value="ofertas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-dark-secondary text-sm rounded-lg px-4 py-2 transition-all duration-300">
                Ofertas ({displayProducts.filter(p => p.desconto > 0).length})
              </TabsTrigger>
            </TabsList>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
              {/* Pesquisa - sempre visível */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70 group-hover:text-blue-400 transition-colors duration-200 z-10 pointer-events-none" />
                <Input
                  placeholder="Pesquisar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 w-full lg:w-64 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400"
                />
              </div>
              
              {/* Filtros - ocultos no mobile */}
              <div className="hidden sm:flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full lg:w-40 glass-card border-white/20 text-dark-primary text-sm">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-sm">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={fornecedorFilter} onValueChange={setFornecedorFilter}>
                  <SelectTrigger className="w-full lg:w-40 glass-card border-white/20 text-dark-primary text-sm">
                    <SelectValue placeholder="Fornecedor" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    {fornecedores.map(forn => (
                      <SelectItem key={forn} value={forn} className="text-sm">{forn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-full lg:w-32 glass-card border-white/20 text-dark-primary text-sm">
                    <SelectValue placeholder="Preço" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="0-500">€0 - €500</SelectItem>
                    <SelectItem value="500-2000">€500 - €2K</SelectItem>
                    <SelectItem value="2000-10000">€2K - €10K</SelectItem>
                    <SelectItem value="10000+">€10K+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex-1 scrollable-content overflow-hidden">
            <TabsContent value="all" className="h-full mt-0">
              <div className={`grid gap-4 lg:gap-6 w-full ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                {filteredProducts.map((produto) => (
                  <ProductCard key={produto.id} produto={produto} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="popular" className="h-full mt-0">
              <div className={`grid gap-4 lg:gap-6 w-full ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                {displayProducts.filter(p => p.popular).map((produto) => (
                  <ProductCard key={produto.id} produto={produto} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ofertas" className="h-full mt-0">
              <div className={`grid gap-4 lg:gap-6 w-full ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                {displayProducts.filter(p => p.desconto > 0).map((produto) => (
                  <ProductCard key={produto.id} produto={produto} />
                ))}
              </div>
            </TabsContent>

            {filteredProducts.length === 0 && !isLoadingProducts && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-dark-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-dark-primary mb-2">Nenhum produto encontrado</h3>
                <p className="text-dark-secondary">
                  {displayProducts.length === 0 
                    ? "Nenhum produto cadastrado. Adicione o primeiro produto ao sistema." 
                    : "Tente ajustar os filtros de pesquisa"
                  }
                </p>
              </div>
            )}
          </div>
        </Tabs>
        )}
      </main>

      {/* Modal de Edição */}
      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={async (updatedProduct) => {
          try {
            await updateProduct(updatedProduct);
            setIsEditModalOpen(false);
            setEditingProduct(null);
            
            // Toast de sucesso
            showToast(
              'success',
              'Produto Atualizado',
              `Produto "${updatedProduct.nome}" foi atualizado com sucesso!`,
              4000
            );
            
          } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            
            // Toast de erro
            showToast(
              'error',
              'Erro na Atualização',
              'Não foi possível atualizar o produto. Tente novamente.',
              5000
            );
          }
        }}
      />

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
                    await deleteProduct(productToDelete.id);
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