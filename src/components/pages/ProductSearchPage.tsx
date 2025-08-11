import React, { useState, useEffect } from 'react';
import { productService, fornecedorService } from '../../api/services';

export function ProductSearchPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showForm, setShowForm] = useState(false);
  const [editProduto, setEditProduto] = useState<any | null>(null);
  const [form, setForm] = useState<any>({
    fornecedor_id: '',
    codigo: '',
    nome: '',
    modelo: '',
    descricao: '',
    preco: '',
    unidade: '',
    estoque: '',
    origem: '',
    cadastrado_por: '',
    cadastrado_em: '',
    atualizado_por: '',
    atualizado_em: ''
  });
  const [fornecedores, setFornecedores] = useState<any[]>([]);

  useEffect(() => {
    fetchProdutos();
    fetchFornecedores();
  }, []);

  async function fetchProdutos() {
    try {
      const data = await productService.getAll();
      setProdutos(data || []);
    } catch {
      setProdutos([]);
    }
  }

  async function fetchFornecedores() {
    try {
      const data = await fornecedorService.getAll();
      setFornecedores(data || []);
    } catch {
      setFornecedores([]);
    }
  }
  function handleInputChange(e: any) {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value ?? '')
    }));
  }
  function openAddForm() {
    setForm({
      fornecedor_id: '',
      codigo: '',
      nome: '',
      modelo: '',
      descricao: '',
      preco: '',
      unidade: '',
      estoque: '',
      origem: '',
      cadastrado_por: '',
      cadastrado_em: '',
      atualizado_por: '',
      atualizado_em: ''
    });
    setEditProduto(null);
    setShowForm(true);
  }
  function openEditForm(produto: any) {
    setEditProduto(produto);
    setForm({
      fornecedor_id: produto.fornecedor_id ?? '',
      codigo: produto.codigo ?? '',
      nome: produto.nome ?? '',
      modelo: produto.modelo ?? '',
      descricao: produto.descricao ?? '',
      preco: produto.preco ?? '',
      unidade: produto.unidade ?? '',
      estoque: produto.estoque ?? '',
      origem: produto.origem ?? '',
      cadastrado_por: produto.cadastrado_por ?? '',
      cadastrado_em: produto.cadastrado_em ?? '',
      atualizado_por: produto.atualizado_por ?? '',
      atualizado_em: produto.atualizado_em ?? ''
    });
    setShowForm(true);
  }
  // Filtro dos produtos
  const filteredProducts = produtos.filter((produto) => {
    const matchesSearch = produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.categoria_geral?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.fornecedor_id?.toString().includes(searchTerm);
    return matchesSearch;
  });

  // Card de produto estilizado
  const [selectedProduto, setSelectedProduto] = useState<any | null>(null);
  const ProductCard = ({ produto }: { produto: any }) => (
    <div
      className={`glass-card bg-gradient-to-br from-white/10 to-blue-100/10 rounded-2xl border border-white/20 shadow-lg hover:border-cyan-400/60 hover:shadow-cyan-500/25 hover:scale-[1.02] transition-all duration-300 w-full max-w-full overflow-hidden ${
        viewMode === "list"
          ? "flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6 p-4 lg:p-6"
          : "p-4 lg:p-6 flex flex-col h-full"
      }`}
      onClick={() => setSelectedProduto(produto)}
      style={{ cursor: 'pointer' }}
    >
      {/* Nome do produto */}
      <h3 className="font-bold text-lg text-dark-primary leading-tight line-clamp-2 mb-1">
        {produto.nome}
      </h3>
      {/* Nome do fornecedor (usando join do backend) */}
      {produto.fornecedor && produto.fornecedor.nome && (
        <span className="text-xs text-blue-700 font-medium mb-1">
          {produto.fornecedor.nome}
        </span>
      )}
      {/* Preço */}
      <span className="text-xl font-bold text-blue-700 mb-1">R$ {Number(produto.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      {/* Data para entrega */}
      {produto.dias_de_entrega && (
        <span className="text-xs text-dark-secondary mb-2">Entrega em: <span className="font-semibold text-dark-primary">{produto.dias_de_entrega} dia{produto.dias_de_entrega > 1 ? 's' : ''}</span></span>
      )}
      {/* Ações */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={e => { e.stopPropagation(); openEditForm(produto); }}
          className="p-2 rounded-full bg-yellow-400/20 hover:bg-yellow-400/40 flex items-center justify-center"
          title="Editar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3zm0 0v3h3" /></svg>
        </button>
        <button
          onClick={e => { e.stopPropagation(); handleDelete(produto.codigo); }}
          className="p-2 rounded-full bg-red-400/20 hover:bg-red-400/40 flex items-center justify-center"
          title="Excluir"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a1 1 0 011 1v2H9V4a1 1 0 011-1z" /></svg>
        </button>
      </div>
    </div>
  );

  // Modal de detalhes do produto
  const ProductDetailModal = () => (
    selectedProduto && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="glass-card bg-gradient-to-br from-white/10 to-blue-100/10 rounded-2xl border border-white/20 shadow-lg p-8 w-full max-w-lg flex flex-col gap-4 relative text-white">
          <button onClick={() => setSelectedProduto(null)} className="absolute top-2 right-2 text-gray-300 hover:text-red-400 text-2xl font-bold">&times;</button>
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">Detalhes do Produto</h2>
          <div className="grid grid-cols-1 gap-3">
            {/* Nome do produto */}
            {selectedProduto.nome && (
              <div><span className="font-semibold text-cyan-200">Nome:</span> {selectedProduto.nome}</div>
            )}
            {/* Nome do fornecedor */}
            {selectedProduto.fornecedor && selectedProduto.fornecedor.nome && (
              <div><span className="font-semibold text-cyan-200">Fornecedor:</span> {selectedProduto.fornecedor.nome}</div>
            )}
            {/* Preço */}
            {selectedProduto.preco !== undefined && (
              <div><span className="font-semibold text-cyan-200">Preço:</span> R$ {Number(selectedProduto.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            )}
            {/* Estoque */}
            {selectedProduto.estoque !== undefined && (
              <div><span className="font-semibold text-cyan-200">Estoque:</span> {selectedProduto.estoque}</div>
            )}
            {/* Categoria */}
            {selectedProduto.categoria_geral && (
              <div><span className="font-semibold text-cyan-200">Categoria:</span> {selectedProduto.categoria_geral}</div>
            )}
            {/* Descrição */}
            {selectedProduto.descricao_geral && (
              <div><span className="font-semibold text-cyan-200">Descrição:</span> {selectedProduto.descricao_geral}</div>
            )}
            {/* Dias de entrega */}
            {selectedProduto.dias_de_entrega !== undefined && (
              <div><span className="font-semibold text-cyan-200">Dias de Entrega:</span> {selectedProduto.dias_de_entrega} dia{selectedProduto.dias_de_entrega > 1 ? 's' : ''}</div>
            )}
            {/* Disponibilidade */}
            {selectedProduto.disponibilidade && (
              <div><span className="font-semibold text-cyan-200">Disponibilidade:</span> {selectedProduto.disponibilidade}</div>
            )}
            {/* Especificações técnicas */}
            {selectedProduto.especificacoes_tecnicas && (
              <div><span className="font-semibold text-cyan-200">Especificações Técnicas:</span> {selectedProduto.especificacoes_tecnicas}</div>
            )}
            {/* Código SKU */}
            {selectedProduto.codigi_sku && (
              <div><span className="font-semibold text-cyan-200">Código SKU:</span> {selectedProduto.codigi_sku}</div>
            )}
            {/* Tags */}
            {selectedProduto.tags && (
              <div><span className="font-semibold text-cyan-200">Tags:</span> {selectedProduto.tags}</div>
            )}
            {/* Data de cadastro */}
            {selectedProduto.data_cadastro && (
              <div><span className="font-semibold text-cyan-200">Data de Cadastro:</span> {selectedProduto.data_cadastro}</div>
            )}
            {/* Atualizado em */}
            {selectedProduto.atualizado_em && (
              <div><span className="font-semibold text-cyan-200">Atualizado em:</span> {selectedProduto.atualizado_em}</div>
            )}
            {/* Status */}
            {selectedProduto.status !== undefined && (
              <div><span className="font-semibold text-cyan-200">Status:</span> {selectedProduto.status ? 'Ativo' : 'Inativo'}</div>
            )}
          </div>
        </div>
      </div>
    )
  );

  // Modal de formulário
  const FormModal = () => (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${showForm ? 'opacity-100 pointer-events-auto bg-black/80' : 'opacity-0 pointer-events-none'}`}
      style={{ visibility: showForm ? 'visible' : 'hidden' }}
    >
      <div className="w-full max-w-2xl mx-auto bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-700 p-0 flex flex-col">
        <div className="flex items-center justify-between px-8 pt-6 pb-2 border-b border-neutral-800">
          <h2 className="text-xl md:text-2xl font-bold text-white">{editProduto ? 'Editar Produto' : 'Adicionar Produto'}</h2>
          <button type="button" onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-red-400 text-2xl font-bold focus:outline-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh] px-8 py-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nenhum key nos inputs! */}
            <input name="codigo" value={form.codigo} onChange={handleInputChange} placeholder="Código do Produto" required className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" autoComplete="off" />
            <input name="nome" value={form.nome} onChange={handleInputChange} placeholder="Nome" required className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" autoComplete="off" />
            <input name="modelo" value={form.modelo} onChange={handleInputChange} placeholder="Modelo" className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" autoComplete="off" />
            <input name="descricao" value={form.descricao} onChange={handleInputChange} placeholder="Descrição" className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" autoComplete="off" />
            <input name="preco" value={form.preco} onChange={handleInputChange} placeholder="Preço" type="number" required className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" autoComplete="off" />
            <input name="unidade" value={form.unidade} onChange={handleInputChange} placeholder="Unidade (ex: un, kg, cx)" className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" autoComplete="off" />
            <input name="estoque" value={form.estoque} onChange={handleInputChange} placeholder="Estoque" type="number" required className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" autoComplete="off" />
            <input name="origem" value={form.origem} onChange={handleInputChange} placeholder="Origem" className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" autoComplete="off" />
            <input name="fornecedor_id" value={form.fornecedor_id} onChange={handleInputChange} placeholder="ID do Fornecedor" type="number" required className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" autoComplete="off" />
            <input name="cadastrado_por" value={form.cadastrado_por} onChange={handleInputChange} placeholder="Cadastrado por (ID)" className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" autoComplete="off" />
            <input name="cadastrado_em" value={form.cadastrado_em} onChange={handleInputChange} placeholder="Data de Cadastro" type="date" className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" autoComplete="off" />
            <input name="atualizado_por" value={form.atualizado_por} onChange={handleInputChange} placeholder="Atualizado por (ID)" className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" autoComplete="off" />
            <input name="atualizado_em" value={form.atualizado_em} onChange={handleInputChange} placeholder="Atualizado em" type="date" className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" autoComplete="off" />
          </div>
          <div className="flex gap-4 mt-6 justify-end">
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105">Salvar</button>
            <button type="button" className="bg-neutral-700 hover:bg-neutral-800 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );

  // Funções CRUD
  async function handleSubmit(e: any) {
    e.preventDefault();
    try {
      if (editProduto) {
        await productService.update(form.codigo, form);
      } else {
        await productService.create(form);
      }
      setShowForm(false);
      fetchProdutos();
    } catch {
      alert('Erro ao salvar produto');
    }
  }
  async function handleDelete(codigo: string) {
    if (window.confirm('Tem certeza que deseja remover este produto?')) {
      await productService.remove(codigo);
      fetchProdutos();
    }
  }

  // Renderização principal
  return (
    <div className="flex flex-col h-full">
  <FormModal />
  <ProductDetailModal />
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              Pesquisa de Produtos
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">Explore e gerencie os produtos cadastrados</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="glass-card px-4 py-2 text-center sm:text-left bg-blue-500/20 border-blue-500/30">
              <span className="text-blue-300 font-bold text-lg">{filteredProducts.length}</span>
              <span className="text-blue-200 ml-2">produtos</span>
            </div>
            <button
              onClick={openAddForm}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <span>Novo Produto</span>
            </button>
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="glass-card bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-400/50 text-white px-4 py-2 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 text-sm shadow-lg"
            >
              <span>{viewMode === "grid" ? "Lista" : "Grade"}</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0 lg:space-x-4 flex-shrink-0">
          <div className="relative w-full max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
            </span>
            <input
              placeholder="Pesquisar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-xl border border-blue-200 bg-gray-50 text-gray-800 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all duration-200"
              style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}
            />
          </div>
        </div>
        <div className={`grid gap-4 lg:gap-6 w-full ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        }`}>
          {filteredProducts.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-dark-primary mb-2">Nenhum produto encontrado</h3>
            <p className="text-dark-secondary">Tente ajustar os filtros de pesquisa</p>
          </div>
        )}
      </main>
    </div>
  );
}