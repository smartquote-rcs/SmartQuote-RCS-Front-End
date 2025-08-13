import { useState, useEffect } from "react";
import { X, Save, Loader2, Upload, Image } from "lucide-react";
import { Product } from "../types";

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => Promise<void>;
}

export function EditProductModal({ product, isOpen, onClose, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState<Product>({
    id: 0,
    nome: '',
    descricao: '',
    preco: 0,
    quantidade: 0,
    categoriaId: 1,
    unidadeMedida: 'unidade',
    disponibilidade: 'em-stock',
    moeda: 'EUR',
    cadastradoEm: '',
    cadastradoPor: 1,
    atualizadoEm: '',
    atualizadoPor: 1,
    ativo: true
  });
  const [isSaving, setIsSaving] = useState(false);

  // Atualizar dados do formulário quando product mudar
  useEffect(() => {
    if (product) {
      setFormData({
        ...product
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.descricao.trim() || formData.preco <= 0 || formData.quantidade < 0) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        atualizadoEm: new Date().toISOString(),
        atualizadoPor: 1 // ID do usuário atual
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
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
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Nome do produto"
                  required
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Preço (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco}
                  onChange={(e) => setFormData(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="0.00"
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Quantidade *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="0"
                  required
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Categoria ID *
                </label>
                <select
                  value={formData.categoriaId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoriaId: parseInt(e.target.value) }))}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                  disabled={isSaving}
                >
                  <option value={1}>Energia Solar (ID: 1)</option>
                  <option value={2}>Infraestrutura TI (ID: 2)</option>
                  <option value={3}>Equipamento de Impressão (ID: 3)</option>
                  <option value={4}>Iluminação (ID: 4)</option>
                  <option value={5}>Climatização (ID: 5)</option>
                  <option value={6}>Outros (ID: 6)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Unidade de Medida
                </label>
                <select
                  value={formData.unidadeMedida}
                  onChange={(e) => setFormData(prev => ({ ...prev, unidadeMedida: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  disabled={isSaving}
                >
                  <option value="unidade">Unidade</option>
                  <option value="kg">Quilograma (kg)</option>
                  <option value="litro">Litro</option>
                  <option value="metro">Metro</option>
                  <option value="m2">Metro Quadrado (m²)</option>
                  <option value="m3">Metro Cúbico (m³)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Disponibilidade
                </label>
                <select
                  value={formData.disponibilidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, disponibilidade: e.target.value as any }))}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  disabled={isSaving}
                >
                  <option value="em-stock">Em Stock</option>
                  <option value="fora-de-stock">Fora de Stock</option>
                  <option value="descontinuado">Descontinuado</option>
                  <option value="pre-venda">Pré-venda</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Descrição *
              </label>
              <textarea
                rows={4}
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Descrição detalhada do produto"
                required
                disabled={isSaving}
              />
            </div>

            {/* Imagem do Produto */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Imagem do Produto
              </label>
              <div className="space-y-3">
                {/* Preview da imagem */}
                {formData.imagem && (
                  <div className="relative w-24 h-24 mx-auto">
                    <img 
                      src={formData.imagem} 
                      alt="Preview do produto"
                      className="w-full h-full object-cover rounded-lg border border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imagem: '' }))}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition-colors"
                      disabled={isSaving}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                {/* Input para URL da imagem */}
                <input
                  type="url"
                  value={formData.imagem || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, imagem: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="https://exemplo.com/imagem-produto.jpg"
                  disabled={isSaving}
                />
                
                {/* Upload de arquivo */}
                <div className="border border-dashed border-slate-600 rounded-lg p-3 text-center">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setFormData(prev => ({ ...prev, imagem: event.target?.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="edit-image-upload"
                    disabled={isSaving}
                  />
                  <label
                    htmlFor="edit-image-upload"
                    className="inline-flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-sm"
                  >
                    <Image className="w-4 h-4" />
                    <span>Selecionar</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Campos Opcionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Código/SKU
                </label>
                <input
                  type="text"
                  value={formData.codigo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Ex: SKU-001"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Fornecedor
                </label>
                <input
                  type="text"
                  value={formData.fornecedor || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Nome do fornecedor"
                  disabled={isSaving}
                />
              </div>
            </div>
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
