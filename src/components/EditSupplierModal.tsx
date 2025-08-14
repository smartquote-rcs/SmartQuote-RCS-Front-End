import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Supplier } from "../types";

interface EditSupplierModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSupplier: Supplier, isNew: boolean) => Promise<void>;
}

export function EditSupplierModal({ supplier, isOpen, onClose, onSave }: EditSupplierModalProps) {
  const getInitialFormData = () => {
    if (supplier) {
      return {
        id: supplier.id,
        nome: supplier.nome || '',
        contato_email: supplier.contato_email || '',
        contato_telefone: supplier.contato_telefone || '',
        site: supplier.site || '',
        observacoes: supplier.observacoes || '',
        ativo: supplier.ativo ?? true,
        cadastrado_em: supplier.cadastrado_em || '',
        cadastrado_por: supplier.cadastrado_por || 1,
        atualizado_em: supplier.atualizado_em || '',
        atualizado_por: supplier.atualizado_por || 1,
      };
    } else {
      return {
        nome: '',
        contato_email: '',
        contato_telefone: '',
        site: '',
        observacoes: '',
        ativo: true,
        cadastrado_em: '',
        cadastrado_por: 1,
        atualizado_em: '',
        atualizado_por: 1,
      };
    }
  };
  const [formData, setFormData] = useState<any>(getInitialFormData());
  const [isSaving, setIsSaving] = useState(false);

  // Atualizar dados do formulário quando supplier mudar
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validações básicas
    if (!formData.nome.trim()) {
      alert('Nome do fornecedor é obrigatório');
      return;
    }
    if (!formData.contato_email.trim()) {
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
      const updatedSupplier: Supplier = {
        ...formData,
        atualizado_em: new Date().toISOString(),
        atualizado_por: 1 // TODO: Pegar do usuário logado
      };
      const isNew = !supplier;
      console.log('📤 EditSupplierModal: Chamando onSave...', updatedSupplier, isNew);
      await onSave(updatedSupplier, isNew);
      console.log('✅ EditSupplierModal: onSave executado com sucesso');
      onClose();
    } catch (error) {
      console.error('💥 EditSupplierModal: Erro ao salvar fornecedor:', error);
      alert('Erro ao salvar fornecedor. Tente novamente.');
    } finally {
      setIsSaving(false);
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
      <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">Editar Fornecedor</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Informações do Fornecedor
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Site
                </label>
                <input
                  type="text"
                  value={formData.site}
                  onChange={(e) => handleInputChange('site', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email de Contato *
                </label>
                <input
                  type="email"
                  value={formData.contato_email}
                  onChange={(e) => handleInputChange('contato_email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Telefone de Contato
                </label>
                <input
                  type="tel"
                  value={formData.contato_telefone}
                  onChange={(e) => handleInputChange('contato_telefone', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => handleInputChange('ativo', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="ativo" className="text-sm text-slate-300">
                  Fornecedor ativo
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Campos de auditoria (apenas leitura) */}
          <div className="space-y-2 text-xs text-slate-400">
            <div>Cadastrado em: {formData.cadastrado_em ? new Date(formData.cadastrado_em).toLocaleString() : '-'}</div>
            <div>Cadastrado por: {formData.cadastrado_por}</div>
            <div>Atualizado em: {formData.atualizado_em ? new Date(formData.atualizado_em).toLocaleString() : '-'}</div>
            <div>Atualizado por: {formData.atualizado_por}</div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
