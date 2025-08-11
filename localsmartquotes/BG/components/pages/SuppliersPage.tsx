import { useState } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, Star, Building, Phone, Mail, Globe, MapPin, TrendingUp } from "lucide-react";

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
const statusOptions = ["Todos", "active", "inactive"];

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

const getRatingStars = (rating: number) => {
  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-400"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-dark-secondary ml-1">({rating})</span>
    </div>
  );
};

export function SuppliersPage() {
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
    <div className="dark-card p-4 hover:border-dark-cta transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0 lg:space-x-6">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0">
            <Building className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
              <h3 className="font-bold text-dark-primary text-sm sm:text-base truncate">{fornecedor.nome}</h3>
              <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                {getStatusBadge(fornecedor.status)}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-dark-secondary">{fornecedor.categoria}</p>
              {getRatingStars(fornecedor.rating)}
              <p className="text-xs text-dark-secondary">{fornecedor.avaliacoes} avaliações</p>
              
              <div className="space-y-1 text-xs sm:text-sm text-dark-secondary">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{fornecedor.localizacao}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{fornecedor.telefone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{fornecedor.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{fornecedor.website}</span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium text-dark-primary mb-1">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {fornecedor.especialidades.map((esp: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-dark-tag text-xs rounded-full text-white">
                      {esp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3 lg:text-right min-w-0 lg:min-w-[200px]">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <div>
              <p className="text-xs text-dark-secondary">Cotações Totais</p>
              <p className="text-lg font-bold text-dark-primary">{fornecedor.totalCotacoes}</p>
            </div>
            <div>
              <p className="text-xs text-dark-secondary">Taxa de Aprovação</p>
              <p className="text-lg font-bold text-green-400">
                {Math.round((fornecedor.cotacoesAprovadas / fornecedor.totalCotacoes) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-dark-secondary">Tempo Médio</p>
              <p className="text-sm font-bold text-dark-primary">{fornecedor.tempoMedioResposta}</p>
            </div>
            <div>
              <p className="text-xs text-dark-secondary">Última Atividade</p>
              <p className="text-sm text-dark-secondary">
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
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">Fornecedores</h1>
            <p className="text-xs sm:text-sm text-dark-secondary mt-1">
              Gerencie e monitore a performance dos seus fornecedores
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="dark-tag text-center sm:text-left">
              {filteredFornecedores.length} fornecedores
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 lg:p-8 bg-dark-bg">
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
                  className="pl-10 w-full lg:w-64 bg-dark-card border-dark-color text-dark-primary"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-dark-card border-dark-color text-dark-primary text-sm">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-dark-color">
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-sm">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32 bg-dark-card border-dark-color text-dark-primary text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-dark-color">
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
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
