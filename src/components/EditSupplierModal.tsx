import { useState, useEffect } from "react";
import { X, Save, RefreshCw } from "lucide-react";
import { Supplier } from "../types/index";

interface EditSupplierModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSupplier: Supplier, isNew: boolean) => Promise<void>;
  onDelete?: (id: number) => Promise<void>; // nova callback para exclusão
  userId?: number | string; // passar id já resolvido do usuário logado
  isLight?: boolean;
}

export function EditSupplierModal({ supplier, isOpen, onClose, onSave, onDelete, userId, isLight = false }: EditSupplierModalProps) {
  let currentUserId: number = 0;
  if (typeof userId === 'number') currentUserId = userId;
  else if (typeof userId === 'string' && userId.trim() !== '' && !isNaN(Number(userId))) currentUserId = Number(userId);
  else {
    // fallback como último recurso: tentar localStorage (mantido mas não preferido)
    try {
      const storedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
      if (storedUserRaw) {
        const parsed = JSON.parse(storedUserRaw);
        const rawId = parsed?.id;
        if (typeof rawId === 'number') currentUserId = rawId;
        else if (typeof rawId === 'string' && rawId.trim() !== '' && !isNaN(Number(rawId))) currentUserId = Number(rawId);
      }
    } catch {}
  }
  const [formData, setFormData] = useState<Supplier>({
    id: supplier?.id || 0,
    nome: supplier?.nome || '',
    contato_email: supplier?.contato_email || '',
    contato_telefone: supplier?.contato_telefone || '',
    site: supplier?.site || '',
    observacoes: supplier?.observacoes || '',
    ativo: supplier?.ativo ?? true,
    cadastrado_em: supplier?.cadastrado_em || '',
    // Para novo registro usar sempre o usuário logado (currentUserId) se disponível
    cadastrado_por: supplier ? (supplier.cadastrado_por || 0) : (currentUserId || 0),
    atualizado_em: supplier?.atualizado_em || '',
	atualizado_por: supplier?.atualizado_por || currentUserId,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Atualizar dados do formulário quando supplier mudar
  useEffect(() => {
    if (supplier) {
      setFormData(prev => ({
        ...prev,
        id: supplier.id || 0,
        nome: supplier.nome || '',
        contato_email: supplier.contato_email || '',
        contato_telefone: supplier.contato_telefone || '',
        site: supplier.site || '',
        observacoes: supplier.observacoes || '',
        ativo: supplier.ativo ?? true,
        cadastrado_em: supplier.cadastrado_em || prev.cadastrado_em || '',
        // Mantém cadastrado_por original do registro (não mudar em edição)
        cadastrado_por: supplier.cadastrado_por || prev.cadastrado_por || 0,
        atualizado_em: supplier.atualizado_em || '',
        atualizado_por: supplier.atualizado_por || currentUserId || 0,
      }));
    } else {
      // Novo registro: garantir cadastrado_por = usuário logado
      setFormData(prev => ({
        ...prev,
        cadastrado_por: currentUserId || 0,
        atualizado_por: currentUserId || 0,
      }));
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validações básicas
    if (!formData.nome.trim()) {
      alert('Nome do fornecedor é obrigatório');
      return;
    }
    if (!formData.contato_email?.trim()) {
      alert('Email de contato é obrigatório');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contato_email)) {
      alert('Email de contato é inválido');
      return;
    }

    setIsSaving(true);
    try {
      console.log('📝 EditSupplierModal: Iniciando salvamento...', formData.nome);
      // Atualizar campos de auditoria
  const isNew = !supplier;
  const updatedSupplier: Supplier = {
    ...formData,
    // Garante cadastrado_por correto em criação
    cadastrado_por: isNew ? (currentUserId || formData.cadastrado_por || 0) : formData.cadastrado_por,
    atualizado_em: new Date().toISOString(),
	atualizado_por: currentUserId || formData.atualizado_por || 0 // fallback 0 se não resolvido
  };
      console.log('📤 EditSupplierModal: Chamando onSave...', updatedSupplier, isNew);
      await onSave(updatedSupplier, isNew);
      console.log('✅ EditSupplierModal: onSave executado com sucesso');
      if (isNew) {
        // Limpar campos após criação
        setFormData({
          id: 0,
            nome: '',
            contato_email: '',
            contato_telefone: '',
            site: '',
            observacoes: '',
            ativo: true,
            cadastrado_em: '',
            cadastrado_por: currentUserId || 0,
            atualizado_em: '',
            atualizado_por: currentUserId || 0,
        });
      }
      onClose();
    } catch (error) {
      console.error('💥 EditSupplierModal: Erro ao salvar fornecedor:', error);
      alert('Erro ao salvar fornecedor. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!supplier || !supplier.id) return;
    if (!onDelete) return;
    const confirmed = window.confirm('Tem certeza que deseja eliminar este fornecedor? Esta ação não pode ser desfeita.');
    if (!confirmed) return;
    try {
      setIsDeleting(true);
      await onDelete(supplier.id);
      onClose();
    } catch (err) {
      console.error('Erro ao deletar fornecedor no modal:', err);
      alert('Erro ao eliminar fornecedor. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: keyof Supplier, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Não é mais necessário

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-700'} rounded-2xl border w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
        {/* Header */}
        <div className={`sticky top-0 ${isLight ? 'bg-white/95 border-b border-gray-200' : 'bg-slate-900/95 border-b border-slate-700'} backdrop-blur-sm px-6 py-4 flex items-center justify-between rounded-t-2xl`}>
          <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Editar Fornecedor</h2>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'} flex items-center justify-center transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${isLight ? 'text-gray-900 border-b border-gray-200' : 'text-white border-b border-slate-700'} pb-2`}>
              Informações do Fornecedor
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-2`}>
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500' : 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-colors`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-2`}>
                  Site
                </label>
                <input
                  type="text"
                  value={formData.site}
                  onChange={(e) => handleInputChange('site', e.target.value)}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500' : 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-colors`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-2`}>
                  Email de Contato *
                </label>
                <input
                  type="email"
                  value={formData.contato_email}
                  onChange={(e) => handleInputChange('contato_email', e.target.value)}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500' : 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-colors`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-2`}>
                  Telefone de Contato
                </label>
                <input
                  type="tel"
                  value={formData.contato_telefone}
                  onChange={(e) => handleInputChange('contato_telefone', e.target.value)}
                  className={`w-full px-3 py-2 ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500' : 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-colors`}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => handleInputChange('ativo', e.target.checked)}
                  className={`w-4 h-4 text-blue-600 ${isLight ? 'bg-gray-50 border-gray-300' : 'bg-slate-800 border-slate-600'} rounded focus:ring-blue-500`}
                />
                <label htmlFor="ativo" className={`text-sm ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>
                  Fornecedor ativo
                </label>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-2`}>
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500' : 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-colors`}
              />
            </div>
          </div>

          {/* Campos de auditoria (apenas leitura) */}
          <div className={`space-y-2 text-xs ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
            <div>Cadastrado em: {formData.cadastrado_em ? new Date(formData.cadastrado_em).toLocaleString() : '-'}</div>
            <div>Cadastrado por: {formData.cadastrado_por}</div>
            <div>Atualizado em: {formData.atualizado_em ? new Date(formData.atualizado_em).toLocaleString() : '-'}</div>
            <div>Atualizado por: {formData.atualizado_por}</div>
          </div>

          {/* Botões */}
          <div className={`flex justify-between space-x-3 pt-4 ${isLight ? 'border-t border-gray-200' : 'border-t border-slate-700'}`}>
            <div>
              {supplier?.id ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={isSaving || isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'} rounded-lg transition-colors`}
              disabled={isSaving || isDeleting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || isDeleting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
