import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Supplier } from "../types";

interface EditSupplierModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSupplier: Supplier) => Promise<void>;
}

export function EditSupplierModal({ supplier, isOpen, onClose, onSave }: EditSupplierModalProps) {
  const [formData, setFormData] = useState<Supplier>({
    id: 0,
    nomeEmpresa: '',
    observacoes: '',
    ativo: true,
    cadastradoEm: '',
    cadastradoPor: 1,
    atualizadoEm: '',
    atualizadoPor: 1,
    categoriaMercado: '',
    contactos: {
      principal: {
        nome: '',
        email: '',
        telefone: '',
        cargo: ''
      }
    },
    localizacao: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Atualizar dados do formulário quando supplier mudar
  useEffect(() => {
    if (supplier) {
      setFormData({
        ...supplier,
        contactos: {
          principal: supplier.contactos.principal || { nome: '', email: '', telefone: '', cargo: '' },
          secundario: supplier.contactos.secundario,
          financeiro: supplier.contactos.financeiro
        }
      });
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.nomeEmpresa.trim()) {
      alert('Nome da empresa é obrigatório');
      return;
    }
    
    if (!formData.contactos.principal?.email?.trim()) {
      alert('Email do contato principal é obrigatório');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactos.principal.email)) {
      alert('Email do contato principal é inválido');
      return;
    }

    setIsSaving(true);
    try {
      console.log('📝 EditSupplierModal: Iniciando salvamento...', formData.nomeEmpresa);
      
      // Atualizar campos de auditoria
      const updatedSupplier = {
        ...formData,
        atualizadoEm: new Date().toISOString(),
        atualizadoPor: 1 // TODO: Pegar do usuário logado
      };
      
      console.log('📤 EditSupplierModal: Chamando onSave...', updatedSupplier);
      await onSave(updatedSupplier);
      console.log('✅ EditSupplierModal: onSave executado com sucesso');
      onClose();
    } catch (error) {
      console.error('💥 EditSupplierModal: Erro ao salvar fornecedor:', error);
      alert('Erro ao salvar fornecedor. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (contactType: 'principal' | 'secundario' | 'financeiro', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactos: {
        ...prev.contactos,
        [contactType]: {
          ...prev.contactos[contactType],
          [field]: value
        }
      }
    }));
  };

  if (!isOpen || !supplier) return null;

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
              Informações da Empresa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={formData.nomeEmpresa}
                  onChange={(e) => handleInputChange('nomeEmpresa', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Categoria de Mercado
                </label>
                <input
                  type="text"
                  value={formData.categoriaMercado}
                  onChange={(e) => handleInputChange('categoriaMercado', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Localização
                </label>
                <input
                  type="text"
                  value={formData.localizacao}
                  onChange={(e) => handleInputChange('localizacao', e.target.value)}
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

          {/* Contato Principal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Contato Principal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.contactos.principal?.nome || ''}
                  onChange={(e) => handleContactChange('principal', 'nome', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.contactos.principal?.email || ''}
                  onChange={(e) => handleContactChange('principal', 'email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.contactos.principal?.telefone || ''}
                  onChange={(e) => handleContactChange('principal', 'telefone', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cargo
                </label>
                <input
                  type="text"
                  value={formData.contactos.principal?.cargo || ''}
                  onChange={(e) => handleContactChange('principal', 'cargo', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
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
