import { useState, useEffect } from "react";
import { fornecedorService } from '../../api/services';
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, Building, Phone, Mail, MapPin, Download } from "lucide-react";

// Estado inicial vazio, será preenchido pelo backend

const categorias = ["Todas", "Energia Solar", "Infraestrutura TI", "Equipamento de Impressão", "Energia", "Segurança de Dados"];


export function SuppliersPage() {
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [editFornecedor, setEditFornecedor] = useState<any | null>(null);
  const [form, setForm] = useState<any>({
    nome: '',
    contato_email: '',
    contato_telefone: '',
    site: '',
    observacoes: '',
    ativo: true,
    cadastrado_em: '',
    cadastrado_por: '',
    atualizado_por: '',
    atualizado_em: ''
  });

  useEffect(() => {
    fetchFornecedores();
  }, []);

  async function fetchFornecedores() {
    try {
      const data = await fornecedorService.getAll();
      setFornecedores(data || []);
    } catch (e) {
    } finally {
    }
  }

  function openAddForm() {
    setForm({
      nome: '',
      contato_email: '',
      contato_telefone: '',
      site: '',
      observacoes: '',
      ativo: true,
      cadastrado_em: '',
      cadastrado_por: '',
      atualizado_por: '',
      atualizado_em: ''
    });
    setEditFornecedor(null);
    setShowForm(true);
  }
  function openEditForm(fornecedor: any) {
    setEditFornecedor(fornecedor);
    setForm({
      nome: fornecedor.nome ?? '',
      contato_email: fornecedor.contato_email ?? '',
      contato_telefone: fornecedor.contato_telefone ?? '',
      site: fornecedor.site ?? '',
      observacoes: fornecedor.observacoes ?? '',
      ativo: fornecedor.ativo ?? true,
      cadastrado_em: fornecedor.cadastrado_em ?? '',
      cadastrado_por: fornecedor.cadastrado_por ?? '',
      atualizado_por: fornecedor.atualizado_por ?? '',
      atualizado_em: fornecedor.atualizado_em ?? ''
    });
    setShowForm(true);
  }
  async function handleDelete(id: any) {
    if (window.confirm('Tem certeza que deseja remover este fornecedor?')) {
      try {
        await fornecedorService.delete(Number(id));
        fetchFornecedores();
      } catch (e: any) {
        alert('Erro ao remover fornecedor: ' + (e?.response?.data?.error || e?.message || 'Erro desconhecido'));
      }
    }
  }
  async function handleSubmit(e: any) {
    e.preventDefault();
    if (editFornecedor) {
      await fornecedorService.update(editFornecedor.id, form);
    } else {
      await fornecedorService.create(form);
    }
    setShowForm(false);
    fetchFornecedores();
  }

  const filteredFornecedores = fornecedores.filter((fornecedor) => {
    const matchesSearch = fornecedor.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.contato_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.contato_telefone?.toLowerCase().includes(searchTerm.toLowerCase());
    // Filtros de categoria e status removidos pois não existem no modelo real
    return matchesSearch;
  });

  const FornecedorCard = ({ fornecedor }: { fornecedor: any }) => (
    <div className="glass-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-3 border border-white/10 backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300 group">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-3 lg:space-y-0 lg:space-x-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110">
            <Building className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <h3 className="font-bold text-white text-base group-hover:text-cyan-400 transition-colors duration-300">{fornecedor.nome}</h3>
              <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                <Badge className={fornecedor.ativo ? 'bg-green-600 text-white text-xs' : 'bg-gray-600 text-white text-xs'}>{fornecedor.ativo ? 'Ativo' : 'Inativo'}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center space-x-1 col-span-2">
                  <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{fornecedor.contato_email}</span>
                </div>
                <div className="flex items-center space-x-1 col-span-2">
                  <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{fornecedor.contato_telefone}</span>
                </div>
                <div className="flex items-center space-x-1 col-span-2">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{fornecedor.site}</span>
                </div>
              </div>
              {fornecedor.observacoes && (
                <div className="mt-2 text-xs text-slate-400">Obs: {fornecedor.observacoes}</div>
              )}
            </div>
          </div>
        </div>
        {/* Botões de ação */}
        <div className="flex flex-row gap-2 mt-2">
          <button onClick={() => openEditForm(fornecedor)} className="p-2 rounded-full bg-yellow-400/20 hover:bg-yellow-400/40 flex items-center justify-center" title="Editar">
            ✏️
          </button>
          <button onClick={() => handleDelete(fornecedor.id)} className="p-2 rounded-full bg-red-400/20 hover:bg-red-400/40 flex items-center justify-center" title="Excluir">
            🗑️
          </button>
        </div>

        <div className="flex flex-row lg:flex-col space-x-3 lg:space-x-0 lg:space-y-2 min-w-0 lg:min-w-[160px] bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 flex-1">
            <div className="text-center lg:text-left">
              <p className="text-xs text-slate-400 mb-0.5">Cotações</p>
              <p className="text-base font-bold text-white">{fornecedor.totalCotacoes}</p>
            </div>
            <div className="text-center lg:text-left">
              <p className="text-xs text-slate-400 mb-0.5">Aprovação</p>
              <p className="text-base font-bold text-green-400">
                {Math.round((fornecedor.cotacoesAprovadas / fornecedor.totalCotacoes) * 100)}%
              </p>
            </div>
            <div className="text-center lg:text-left">
              <p className="text-xs text-slate-400 mb-0.5">Tempo Médio</p>
              <p className="text-xs font-bold text-cyan-400">{fornecedor.tempoMedioResposta}</p>
            </div>
            <div className="text-center lg:text-left">
              <p className="text-xs text-slate-400 mb-0.5">Atividade</p>
              <p className="text-xs text-slate-300">
                {new Date(fornecedor.ultimaAtividade).toLocaleDateString('pt-PT')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <Building className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              Fornecedores
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
              Gerencie e monitore a performance dos seus fornecedores
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="glass-card px-4 py-2 text-center sm:text-left bg-blue-500/20 border-blue-500/30">
              <span className="text-blue-300 font-bold text-lg">{filteredFornecedores.length}</span>
              <span className="text-blue-200 ml-2">fornecedores</span>
            </div>
            <button onClick={openAddForm} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
              <span>Adicionar Fornecedor</span>
            </button>
      {/* Modal de formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="w-full max-w-lg mx-auto bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-700 p-0 flex flex-col">
            <div className="flex items-center justify-between px-8 pt-6 pb-2 border-b border-neutral-800">
              <h2 className="text-xl md:text-2xl font-bold text-white">{editFornecedor ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-red-400 text-2xl font-bold focus:outline-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh] px-8 py-6 flex flex-col gap-6">
              <input name="nome" value={form.nome} onChange={e => setForm((f: any) => ({ ...f, nome: e.target.value }))} placeholder="Nome" required className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" />
              <input name="contato_email" value={form.contato_email} onChange={e => setForm((f: any) => ({ ...f, contato_email: e.target.value }))} placeholder="Email de Contato" required className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" />
              <input name="contato_telefone" value={form.contato_telefone} onChange={e => setForm((f: any) => ({ ...f, contato_telefone: e.target.value }))} placeholder="Telefone de Contato" className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" />
              <input name="site" value={form.site} onChange={e => setForm((f: any) => ({ ...f, site: e.target.value }))} placeholder="Site" className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" />
              <input name="observacoes" value={form.observacoes} onChange={e => setForm((f: any) => ({ ...f, observacoes: e.target.value }))} placeholder="Observações" className="input bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-cyan-400" />
              <div className="flex items-center gap-2">
                <label className="text-white text-sm">Ativo:</label>
                <input type="checkbox" checked={form.ativo} onChange={e => setForm((f: any) => ({ ...f, ativo: e.target.checked }))} />
              </div>
              <div className="flex gap-4 mt-6 justify-end">
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105">Salvar</button>
                <button type="button" className="bg-neutral-700 hover:bg-neutral-800 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
        <Tabs defaultValue="all" className="w-full h-full flex flex-col">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0 flex-shrink-0">
            <TabsList className="bg-dark-tag border border-dark-color">
              <TabsTrigger value="all" className="data-[state=active]:bg-dark-cta data-[state=active]:text-white text-dark-secondary text-sm">
                Todos ({fornecedores.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-dark-cta data-[state=active]:text-white text-dark-secondary text-sm">
                Ativos ({fornecedores.filter(f => f.status === 'active').length})
              </TabsTrigger>
              <TabsTrigger value="top" className="data-[state=active]:bg-dark-cta data-[state=active]:text-white text-dark-secondary text-sm">
                Top Rated ({fornecedores.filter(f => f.rating >= 4.5).length})
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-secondary" />
                <Input
                  placeholder="Pesquisar fornecedores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full lg:w-64"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-40 glass-card border-white/20 text-dark-primary text-sm">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-sm">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32 glass-card border-white/20 text-dark-primary text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex-1 scrollable-content">
            <TabsContent value="all" className="h-full mt-0">
              <div className="grid gap-3 lg:gap-4">
                {filteredFornecedores.map((fornecedor) => (
                  <FornecedorCard key={fornecedor.id} fornecedor={fornecedor} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="active" className="h-full mt-0">
              <div className="grid gap-3 lg:gap-4">
                {fornecedores.filter(f => f.status === 'active').map((fornecedor) => (
                  <FornecedorCard key={fornecedor.id} fornecedor={fornecedor} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="top" className="h-full mt-0">
              <div className="grid gap-3 lg:gap-4">
                {fornecedores.filter(f => f.rating >= 4.5).map((fornecedor) => (
                  <FornecedorCard key={fornecedor.id} fornecedor={fornecedor} />
                ))}
              </div>
            </TabsContent>
          </div>

          {filteredFornecedores.length === 0 && (
            <div className="text-center py-8 lg:py-12">
              <Building className="w-10 h-10 sm:w-12 sm:h-12 text-dark-secondary mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">Nenhum fornecedor encontrado</h3>
              <p className="text-sm sm:text-base text-dark-secondary px-4">Tente ajustar os filtros de pesquisa</p>
            </div>
          )}
        </Tabs>
      </main>
    </div>
  );
}