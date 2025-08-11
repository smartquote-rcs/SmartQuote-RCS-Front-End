import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, Building, Phone, Mail, MapPin, Download } from "lucide-react";

const fornecedores = [
  {
    id: "FORN-001",
    nome: "EnerTech Solutions",
    categoria: "Energia Solar",
    status: "active",
    rating: 4.8,
    avaliacoes: 156,
    localizacao: "Porto, Portugal",
    telefone: "+351 220 123 456",
    email: "contact@enertech.pt",
    website: "www.enertech.pt",
    especialidades: ["Painéis Solares", "Inversores", "Baterias"],
    totalCotacoes: 45,
    cotacoesAprovadas: 42,
    tempoMedioResposta: "2.1 dias",
    ultimaAtividade: "2024-01-24"
  },
  {
    id: "FORN-002",
    nome: "TechFlow Innovations",
    categoria: "Infraestrutura TI",
    status: "active",
    rating: 4.6,
    avaliacoes: 89,
    localizacao: "Lisboa, Portugal",
    telefone: "+351 210 987 654",
    email: "sales@techflow.pt",
    website: "www.techflow.pt",
    especialidades: ["Servidores", "Storage", "Networking"],
    totalCotacoes: 38,
    cotacoesAprovadas: 35,
    tempoMedioResposta: "1.8 dias",
    ultimaAtividade: "2024-01-24"
  },
  {
    id: "FORN-003",
    nome: "PrintMax Industrial",
    categoria: "Equipamento de Impressão",
    status: "active",
    rating: 4.2,
    avaliacoes: 234,
    localizacao: "Braga, Portugal",
    telefone: "+351 253 456 789",
    email: "info@printmax.pt",
    website: "www.printmax.pt",
    especialidades: ["Impressoras", "Multifuncionais", "Consumíveis"],
    totalCotacoes: 67,
    cotacoesAprovadas: 58,
    tempoMedioResposta: "3.2 dias",
    ultimaAtividade: "2024-01-23"
  },
  {
    id: "FORN-004",
    nome: "PowerGen Systems",
    categoria: "Energia",
    status: "active",
    rating: 4.9,
    avaliacoes: 67,
    localizacao: "Aveiro, Portugal",
    telefone: "+351 234 567 890",
    email: "comercial@powergen.pt",
    website: "www.powergen.pt",
    especialidades: ["Geradores", "UPS", "Energia de Backup"],
    totalCotacoes: 28,
    cotacoesAprovadas: 27,
    tempoMedioResposta: "1.5 dias",
    ultimaAtividade: "2024-01-24"
  },
  {
    id: "FORN-005",
    nome: "DataSecure Technologies",
    categoria: "Segurança de Dados",
    status: "inactive",
    rating: 3.8,
    avaliacoes: 12,
    localizacao: "Coimbra, Portugal",
    telefone: "+351 239 345 678",
    email: "support@datasecure.pt",
    website: "www.datasecure.pt",
    especialidades: ["Backup", "Segurança", "Cloud"],
    totalCotacoes: 15,
    cotacoesAprovadas: 12,
    tempoMedioResposta: "4.1 dias",
    ultimaAtividade: "2024-01-20"
  }
];

const categorias = ["Todas", "Energia Solar", "Infraestrutura TI", "Equipamento de Impressão", "Energia", "Segurança de Dados"];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-600 text-white text-xs">Ativo</Badge>;
    case "inactive":
      return <Badge className="bg-gray-600 text-white text-xs">Inativo</Badge>;
    default:
      return <Badge className="text-xs">{status}</Badge>;
  }
};

export function SuppliersPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const filteredFornecedores = fornecedores.filter((fornecedor) => {
    const matchesSearch = fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.localizacao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "Todas" || fornecedor.categoria === categoryFilter;
    const matchesStatus = statusFilter === "Todos" || fornecedor.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
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
                {getStatusBadge(fornecedor.status)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300 font-medium">{fornecedor.categoria}</p>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                  <span className="text-xs text-slate-300">{fornecedor.rating}</span>
                  <span className="text-xs text-slate-400">({fornecedor.avaliacoes})</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{fornecedor.localizacao}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{fornecedor.telefone}</span>
                </div>
                <div className="flex items-center space-x-1 col-span-2">
                  <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{fornecedor.email}</span>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {fornecedor.especialidades.slice(0, 3).map((esp: string, index: number) => (
                    <span key={index} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                      {esp}
                    </span>
                  ))}
                  {fornecedor.especialidades.length > 3 && (
                    <span className="px-2 py-0.5 bg-slate-500/20 text-slate-300 text-xs rounded-full border border-slate-500/30">
                      +{fornecedor.especialidades.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
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
              {t('suppliers.title')}
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
              {t('suppliers.subtitle')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="glass-card px-4 py-2 text-center sm:text-left bg-blue-500/20 border-blue-500/30">
              <span className="text-blue-300 font-bold text-lg">{filteredFornecedores.length}</span>
              <span className="text-blue-200 ml-2">fornecedores</span>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
              <Download className="w-5 h-5" />
              <span>Exportar Relatório</span>
            </button>
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