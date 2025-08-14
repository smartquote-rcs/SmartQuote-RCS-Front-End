
import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Product } from "../types";

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => Promise<void>;
}

export function EditProductModal({ product, isOpen, onClose, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState<Product>(() => ({
    id: product?.id,
    fornecedorId: product?.fornecedorId,
    codigo: product?.codigo || '',
    nome: product?.nome || '',
    modelo: product?.modelo || '',
    descricao: product?.descricao || '',
    preco: product?.preco || 0,
    unidade: product?.unidade || '',
    estoque: product?.estoque || 0,
    origem: product?.origem || '',
    cadastrado_por: product?.cadastrado_por || 1,
    m: product?.m || '',
    cadastrado_em: product?.cadastrado_em || '',
    atualizado_por: product?.atualizado_por || 1,
    atualizado_em: product?.atualizado_em || '',
  }));
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      alert('Erro ao salvar produto. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Editar Produto</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Código</label>
                <input type="text" value={formData.codigo || ''} onChange={e => setFormData(prev => ({ ...prev, codigo: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" placeholder="Código/SKU" disabled={isSaving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome *</label>
                <input type="text" value={formData.nome} onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" placeholder="Nome do produto" required disabled={isSaving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Modelo</label>
                <input type="text" value={formData.modelo || ''} onChange={e => setFormData(prev => ({ ...prev, modelo: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" placeholder="Modelo" disabled={isSaving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Descrição *</label>
                <textarea rows={2} value={formData.descricao} onChange={e => setFormData(prev => ({ ...prev, descricao: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" placeholder="Descrição" required disabled={isSaving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Preço *</label>
                <input type="number" step="0.01" min="0" value={formData.preco} onChange={e => setFormData(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" placeholder="0.00" required disabled={isSaving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Unidade</label>
                <input type="text" value={formData.unidade || ''} onChange={e => setFormData(prev => ({ ...prev, unidade: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" placeholder="Unidade" disabled={isSaving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Estoque</label>
                <input type="number" min="0" value={formData.estoque || 0} onChange={e => setFormData(prev => ({ ...prev, estoque: parseInt(e.target.value) || 0 }))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" placeholder="Estoque" disabled={isSaving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Origem</label>
                <input type="text" value={formData.origem || ''} onChange={e => setFormData(prev => ({ ...prev, origem: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" placeholder="Origem" disabled={isSaving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cadastrado por</label>
                <input type="number" value={formData.cadastrado_por} onChange={e => setFormData(prev => ({ ...prev, cadastrado_por: parseInt(e.target.value) || 1 }))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" placeholder="ID usuário" disabled={isSaving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cadastrado em</label>
                <input type="datetime-local" value={formData.cadastrado_em ? formData.cadastrado_em.substring(0, 16) : ''} onChange={e => setFormData(prev => ({ ...prev, cadastrado_em: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" disabled={isSaving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Atualizado por</label>
                <input type="number" value={formData.atualizado_por} onChange={e => setFormData(prev => ({ ...prev, atualizado_por: parseInt(e.target.value) || 1 }))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" placeholder="ID usuário" disabled={isSaving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Atualizado em</label>
                <input type="datetime-local" value={formData.atualizado_em ? formData.atualizado_em.substring(0, 16) : ''} onChange={e => setFormData(prev => ({ ...prev, atualizado_em: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" disabled={isSaving} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">M</label>
                <input type="text" value={formData.m || ''} onChange={e => setFormData(prev => ({ ...prev, m: e.target.value }))} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white" placeholder="M" disabled={isSaving} />
              </div>
            </div>

            {/* Nenhum campo opcional extra */}
          </div>

          {/* Botões */}
          <div className="flex space-x-3 pt-6 mt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
