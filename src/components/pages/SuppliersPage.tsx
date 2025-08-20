import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
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
import { Search, Building, Phone, Mail, MapPin, Download, Plus, RefreshCw, Edit, Trash2, X, CheckCircle, AlertTriangle } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { EditSupplierModal } from "../EditSupplierModal";
import { Supplier } from "../../types";

// Interface para Toast Notifications
interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

type MinimalUser = { role?: string | null };
interface SuppliersPageProps {
  user?: MinimalUser | null;
}

export function SuppliersPage({ user }: SuppliersPageProps) {
  const { t } = useTranslation();
  const { suppliers, isLoadingSuppliers, loadSuppliers, deleteSupplier, updateSupplier, addSupplier } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");
  
  // Estados para o modal de edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupplierForEdit, setSelectedSupplierForEdit] = useState<Supplier | null>(null);

  // Estados para toast notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Converter fornecedores do contexto para o formato esperado pela página (usando apenas campos válidos do Supabase)
  const fornecedores = suppliers.map(supplier => ({
    id: supplier.id, // manter id numérico real
    nome: supplier.nome,
    status: supplier.ativo ? 'active' : 'inactive',
    telefone: supplier.contato_telefone || 'N/A',
    email: supplier.contato_email || 'N/A',
    website: supplier.site || 'N/A',
    ultimaAtividade: supplier.atualizado_em ? supplier.atualizado_em.substring(0, 10) : 'N/A',
    observacoes: supplier.observacoes || '',
    cadastrado_por: supplier.cadastrado_por,
    atualizado_por: supplier.atualizado_por
  }));

  // Não há mais categorias no schema atual
  
  const filteredFornecedores = fornecedores.filter((fornecedor) => {
    const matchesSearch = fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) || fornecedor.email.toLowerCase().includes(searchTerm.toLowerCase()) || fornecedor.telefone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || fornecedor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Funções para Toast Notifications
  const showToast = (
    type: 'success' | 'error' | 'warning',
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold px-3 py-1 border border-green-400/30 shadow-lg shadow-green-500/20">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              Ativo
            </Badge>
          </div>
        );
      case "inactive":
        return (
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-gray-600 to-slate-600 text-white text-xs font-semibold px-3 py-1 border border-gray-500/30 shadow-lg shadow-gray-500/20">
              <div className="w-2 h-2 bg-white/60 rounded-full mr-2"></div>
              Inativo
            </Badge>
          </div>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold px-3 py-1 border border-blue-400/30 shadow-lg shadow-blue-500/20">
            {status}
          </Badge>
        );
    }
  };

  // Função para recarregar a lista de fornecedores
  const handleRefreshSuppliers = async () => {
    await loadSuppliers();
  };

  // Função para editar fornecedor
  const handleEditSupplier = (fornecedor: any) => {
    console.log('Editando fornecedor:', fornecedor);
    
    // Extrair o ID numérico do formato "FORN-001"
    const supplierId = parseInt(fornecedor.id.replace('FORN-', ''));
    
    // Encontrar o fornecedor original no contexto
    const originalSupplier = suppliers.find(s => s.id === supplierId);
    
    if (originalSupplier) {
      setSelectedSupplierForEdit(originalSupplier);
      setIsEditModalOpen(true);
    } else {
      console.error('Fornecedor não encontrado:', supplierId);
      alert('Erro: Fornecedor não encontrado.');
    }
  };

  // Função para salvar as alterações do fornecedor
  const handleSaveSupplier = async (updatedSupplier: Supplier) => {
    try {
      await updateSupplier(updatedSupplier);
      
      // Toast de sucesso
      showToast(
        'success',
        'Fornecedor Atualizado',
        `O fornecedor "${updatedSupplier.nome}" foi atualizado com sucesso!`
      );
      
      // Fechar modal
      handleCloseEditModal();
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      
      // Toast de erro
      showToast(
        'error',
        'Erro ao Atualizar',
        'Ocorreu um erro ao atualizar o fornecedor. Tente novamente.'
      );
    }
  };

  // Função para fechar o modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedSupplierForEdit(null);
  };

  // Função para deletar fornecedor
  const handleDeleteSupplier = async (supplierId: number) => {
    try {
      await deleteSupplier(supplierId);
      showToast(
        'success',
        'Fornecedor Removido',
        `O fornecedor foi removido com sucesso!`
      );
      console.log('Fornecedor deletado com sucesso:', supplierId);
    } catch (error: any) {
      console.error('Erro ao deletar fornecedor:', error);
      showToast(
        'error',
        'Erro ao Remover',
        error?.message || error?.toString() || 'Ocorreu um erro ao remover o fornecedor. Tente novamente.'
      );
    }
  };

  const FornecedorCard = ({ fornecedor }: { fornecedor: any }) => (

    <div className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer transform hover:-translate-y-1">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center backdrop-blur-sm border border-blue-400/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/20">
              <Building className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400 group-hover:text-cyan-300 transition-colors duration-300" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white truncate">{fornecedor.nome}</span>
              {getStatusBadge(fornecedor.status)}
            </div>
            <div className="text-xs text-slate-400 truncate">ID: {fornecedor.id}</div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-300">
          <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
          <span className="truncate">{fornecedor.telefone}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-300">
          <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
          <span className="truncate">{fornecedor.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-300 sm:col-span-2">
          <span className="truncate">{fornecedor.website}</span>
        </div>
      </div>

      {/* Informações Básicas */}
      <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700/50">
        <h4 className="text-xs sm:text-sm font-semibold text-slate-300 mb-3">Informações</h4>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-xs sm:text-sm font-medium text-slate-300 mb-1">
              {new Date(fornecedor.ultimaAtividade).toLocaleDateString('pt-PT')}
            </div>
            <div className="text-xs text-slate-400">Última Atividade</div>
          </div>
        </div>
      </div>

      {/* Action Buttons - appears on hover */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex space-x-1.5 sm:space-x-2">
          <button 
            onClick={() => handleEditSupplier(fornecedor)}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500/80 hover:bg-blue-500 rounded-full flex items-center justify-center text-white transition-colors duration-200"
            title="Editar fornecedor"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button 
            onClick={() => window.open(`mailto:${fornecedor.email}`)}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500/80 hover:bg-green-500 rounded-full flex items-center justify-center text-white transition-colors duration-200"
            title="Enviar email"
          >
            <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button 
            onClick={() => window.open(`tel:${fornecedor.telefone}`)}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-cyan-500/80 hover:bg-cyan-500 rounded-full flex items-center justify-center text-white transition-colors duration-200"
            title="Ligar para fornecedor"
          >
            <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          
          {/* Botão de Deletar com AlertDialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                title="Remover fornecedor"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-card border-white/20 bg-slate-800/95 backdrop-blur-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  Confirmar Remoção
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-300">
                  Tem certeza que deseja remover o fornecedor{" "}
                  <strong className="text-white">{fornecedor.nome}</strong>? Esta ação
                  não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 px-6 py-2 rounded-xl">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteSupplier(fornecedor.id)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-xl font-semibold"
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header - Compacto no mobile */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-1 md:py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-1 md:space-y-4 lg:space-y-0">
          <div className="hidden md:block">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <Building className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              {t('suppliers.title')}
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
              {t('suppliers.subtitle')}
            </p>
          </div>
          
          {/* Header mobile compacto */}
          <div className="md:hidden flex items-center justify-between">
            <h1 className="text-lg font-bold text-dark-primary flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-400" />
              Fornecedores
            </h1>
            <span className="text-blue-300 font-bold text-sm">
              {filteredFornecedores.length}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-1 md:space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Linha centralizada com contador e botões do mesmo tamanho */}
            <div className="hidden md:flex items-center gap-3 w-full justify-center">
              <div className="glass-card bg-white/5 border-blue-500/30 px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 text-blue-300 text-sm min-w-[160px] h-[44px]">
                <span className="font-bold text-lg">{filteredFornecedores.length}</span>
                <span className="ml-2 text-blue-200">fornecedores</span>
              </div>
              <button 
                onClick={handleRefreshSuppliers}
                disabled={isLoadingSuppliers}
                className="glass-card bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-400/50 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg text-sm min-w-[160px] h-[44px]"
                title="Atualizar lista de fornecedores"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingSuppliers ? 'animate-spin' : ''}`} />
                <span>{isLoadingSuppliers ? 'Carregando...' : 'Atualizar'}</span>
              </button>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 text-sm md:text-base min-w-[160px] h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Fornecedor</span>
                </button>
              )}
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 md:px-6 md:py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 text-sm min-w-[160px] h-[44px]">
                <Download className="w-4 h-4" />
                <span>Exportar Relatório</span>
              </button>
            </div>
      {/* Modal de novo fornecedor para admin */}
      {isEditModalOpen && user?.role === 'admin' && (
        <EditSupplierModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          supplier={null}
          onSave={async (newSupplier, isNew) => {
            if (isNew) {
              const { id, ...supplierData } = newSupplier;
              await addSupplier(supplierData);
              showToast('success', 'Fornecedor cadastrado', 'Fornecedor adicionado com sucesso!');
            } else {
              await updateSupplier(newSupplier);
              showToast('success', 'Fornecedor atualizado', 'Fornecedor atualizado com sucesso!');
            }
            setIsEditModalOpen(false);
          }}
        />
      )}
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-3 md:p-4 lg:p-8 bg-dark-bg">
        <Tabs defaultValue="all" className="w-full h-full flex flex-col">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-4 md:mb-6 space-y-3 md:space-y-4 xl:space-y-0 flex-shrink-0">
            {/* Tabs - ocultas no mobile */}
            <TabsList className="hidden md:flex bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-xl p-1 overflow-x-auto">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 text-slate-300 text-xs sm:text-sm font-medium px-3 py-2 sm:px-4 rounded-lg transition-all duration-300 hover:text-white hover:bg-slate-700/50 whitespace-nowrap"
              >
                Todos ({fornecedores.length})
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/20 text-slate-300 text-xs sm:text-sm font-medium px-3 py-2 sm:px-4 rounded-lg transition-all duration-300 hover:text-white hover:bg-slate-700/50 whitespace-nowrap"
              >
                Ativos ({fornecedores.filter(f => f.status === 'active').length})
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-1 md:space-y-3 md:space-y-0 md:space-x-4">
              {/* Pesquisa - sempre visível */}
              <div className="relative group flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors duration-200" />
                <Input
                  placeholder="Pesquisar fornecedores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20 hover:border-slate-600/50 transition-all duration-200 text-sm h-10 md:h-auto"
                />
              </div>
              
              {/* Filtros - ocultos no mobile */}
              <div className="hidden md:flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-slate-800/50 border-slate-700/50 text-white focus:border-blue-400/50 focus:ring-blue-400/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-44 bg-slate-800/50 border-slate-700/50 text-white focus:border-blue-400/50 focus:ring-blue-400/20">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="eletrônicos">Eletrônicos</SelectItem>
                    <SelectItem value="materiais">Materiais</SelectItem>
                    <SelectItem value="equipamentos">Equipamentos</SelectItem>
                    <SelectItem value="serviços">Serviços</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 scrollable-content">
            {isLoadingSuppliers ? (
              <div className="text-center py-8 lg:py-12">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 animate-spin">
                  <RefreshCw className="w-full h-full text-blue-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-white mb-2">Carregando fornecedores...</h3>
                <p className="text-sm sm:text-base text-slate-400 px-4">Buscando dados da API</p>
              </div>
            ) : (
              <>
                <TabsContent value="all" className="h-full mt-0">
                  <div className="grid gap-4 lg:gap-6">
                    {filteredFornecedores.map((fornecedor) => (
                      <FornecedorCard key={fornecedor.id} fornecedor={fornecedor} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="active" className="h-full mt-0">
                  <div className="grid gap-4 lg:gap-6">
                    {fornecedores.filter(f => f.status === 'active').map((fornecedor) => (
                      <FornecedorCard key={fornecedor.id} fornecedor={fornecedor} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="top" className="h-full mt-0">
                  <div className="grid gap-4 lg:gap-6">
                    {/* Bloco de fornecedores Top Rated removido pois rating não existe mais */}
                  </div>
                </TabsContent>

                {!isLoadingSuppliers && filteredFornecedores.length === 0 && (
                  <div className="text-center py-8 lg:py-12">
                    <Building className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">Nenhum fornecedor encontrado</h3>
                    <p className="text-sm sm:text-base text-slate-400 px-4">Tente ajustar os filtros de pesquisa</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Tabs>
      </main>
      
      {/* Modal de Edição de Fornecedor */}
      <EditSupplierModal
        supplier={selectedSupplierForEdit}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveSupplier}
      />

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              min-w-80 max-w-md p-4 rounded-lg shadow-lg backdrop-blur-md border
              transform transition-all duration-300 ease-in-out
              ${toast.type === 'success' 
                ? 'bg-green-900/90 border-green-500/50 text-green-100' 
                : toast.type === 'error'
                ? 'bg-red-900/90 border-red-500/50 text-red-100'
                : 'bg-yellow-900/90 border-yellow-500/50 text-yellow-100'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {toast.type === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  {toast.type === 'error' && (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                  {toast.type === 'warning' && (
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  <p className="text-sm opacity-90 mt-1">{toast.message}</p>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 ml-4 p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 w-full bg-black/20 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  toast.type === 'success' 
                    ? 'bg-green-400' 
                    : toast.type === 'error'
                    ? 'bg-red-400'
                    : 'bg-yellow-400'
                }`}
                style={{
                  animation: `shrink ${toast.duration || 5000}ms linear forwards`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Keyframes CSS para a progress bar */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}