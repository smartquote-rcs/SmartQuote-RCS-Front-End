import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Supplier } from "../types";

interface CreateSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSupplier: Omit<Supplier, "id">) => Promise<void>;
  userId?: number | string;
  isLight?: boolean;
}

export function CreateSupplierModal({ isOpen, onClose, onSave, userId, isLight = false }: CreateSupplierModalProps) {
  let currentUserId: number | null = null;
  if (typeof userId === 'number' && userId > 0) currentUserId = userId;
  else if (typeof userId === 'string' && userId.trim() !== '' && !isNaN(Number(userId)) && Number(userId) > 0) currentUserId = Number(userId);
  else {
    try {
      const storedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
      if (storedUserRaw) {
        const parsed = JSON.parse(storedUserRaw);
        const rawId = parsed?.id;
        if (typeof rawId === 'number' && rawId > 0) currentUserId = rawId;
        else if (typeof rawId === 'string' && rawId.trim() !== '' && !isNaN(Number(rawId)) && Number(rawId) > 0) currentUserId = Number(rawId);
      }
    } catch {}
  }
  // Se não encontrar usuário válido, exibe erro e desabilita o formulário
  const isUserValid = typeof currentUserId === 'number' && currentUserId > 0;
  const [formData, setFormData] = useState<Omit<Supplier, "id">>({
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
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUserValid) {
      alert('Usuário não identificado. Faça login novamente para cadastrar fornecedor.');
      return;
    }
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
      const now = new Date().toISOString();
      await onSave({
        ...formData,
        cadastrado_em: now,
        atualizado_em: now,
        cadastrado_por: currentUserId || 0,
        atualizado_por: currentUserId || 0,
      });
      setFormData({
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
      onClose();
    } catch (error) {
      alert('Erro ao criar fornecedor. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${isLight ? 'bg-white' : 'bg-slate-900'} rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 ${isLight ? 'border-b border-gray-200' : 'border-b border-slate-700'}`}>
          <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Novo Fornecedor</h2>
          <button
            onClick={onClose}
            className={`${isLight ? 'text-gray-400 hover:text-gray-600' : 'text-slate-400 hover:text-white'} transition-colors p-1`}
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {!isUserValid && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-4 mb-4 text-center">
              <p>Usuário não identificado. Faça login novamente para cadastrar fornecedor.</p>
            </div>
          )}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-2`}>Nome *</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} className={`w-full ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500' : 'bg-slate-800 border-slate-600 text-white focus:border-blue-400'} border rounded-lg p-3 focus:ring-2 focus:ring-blue-400/20 transition-colors`} placeholder="Nome do fornecedor" required disabled={isSaving} />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-2`}>Email de Contato *</label>
                <input type="email" name="contato_email" value={formData.contato_email} onChange={handleChange} className={`w-full ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500' : 'bg-slate-800 border-slate-600 text-white focus:border-blue-400'} border rounded-lg p-3 focus:ring-2 focus:ring-blue-400/20 transition-colors`} placeholder="Email" required disabled={isSaving} />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-2`}>Telefone</label>
                <input type="text" name="contato_telefone" value={formData.contato_telefone} onChange={handleChange} className={`w-full ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500' : 'bg-slate-800 border-slate-600 text-white focus:border-blue-400'} border rounded-lg p-3 focus:ring-2 focus:ring-blue-400/20 transition-colors`} placeholder="Telefone" disabled={isSaving} />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-2`}>Site</label>
                <input type="text" name="site" value={formData.site} onChange={handleChange} className={`w-full ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500' : 'bg-slate-800 border-slate-600 text-white focus:border-blue-400'} border rounded-lg p-3 focus:ring-2 focus:ring-blue-400/20 transition-colors`} placeholder="Site" disabled={isSaving} />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-300'} mb-2`}>Observações</label>
                <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} className={`w-full ${isLight ? 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500' : 'bg-slate-800 border-slate-600 text-white focus:border-blue-400'} border rounded-lg p-3 focus:ring-2 focus:ring-blue-400/20 transition-colors`} placeholder="Observações" rows={2} disabled={isSaving} />
              </div>
              <div className="flex items-center space-x-2 md:col-span-2">
                <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange} disabled={isSaving} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                <label className={`text-sm ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Ativo</label>
              </div>
            </div>
          </div>
          <div className={`flex space-x-3 pt-6 mt-6 ${isLight ? 'border-t border-gray-200' : 'border-t border-slate-700'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-slate-700 hover:bg-slate-600 text-white'} px-4 py-2 rounded-lg transition-colors disabled:opacity-50`}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 ${isLight ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2`}
              disabled={isSaving || !isUserValid}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Criar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
