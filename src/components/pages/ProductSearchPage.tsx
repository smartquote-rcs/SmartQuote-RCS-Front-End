import { useState } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, ShoppingCart, Eye, Heart, Grid, List } from "lucide-react";
import { useApp } from "../../contexts/AppContext";

const produtos = [
  {
    id: "PROD-001",
    nome: "Painel Solar 400W Monocristalino",
    categoria: "Energia Solar",
    fornecedor: "EnerTech Solutions",
    preco: "€285.00",
    precoOriginal: "€320.00",
    avaliacao: 4.8,
    avaliacoes: 156,
    descricao: "Painel solar de alta eficiência com tecnologia monocristalina, ideal para instalações residenciais e comerciais.",
    especificacoes: ["Potência: 400W", "Eficiência: 20.9%", "Garantia: 25 anos", "Dimensões: 2008×1002×35mm"],
    disponibilidade: "Em stock",
    prazoEntrega: "3-5 dias úteis",
    imagem: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
    desconto: 11,
    popular: true
  },
  {
    id: "PROD-002", 
    nome: "Servidor Dell PowerEdge R450",
    categoria: "Infraestrutura TI",
    fornecedor: "TechFlow Innovations",
    preco: "€2,450.00",
    precoOriginal: null,
    avaliacao: 4.6,
    avaliacoes: 89,
    descricao: "Servidor rack 1U para aplicações empresariais críticas com processadores Intel Xeon de última geração.",
    especificacoes: ["CPU: Intel Xeon Silver 4314", "RAM: 32GB DDR4", "Storage: 2x 480GB SSD", "Garantia: 3 anos"],
    disponibilidade: "Sob consulta",
    prazoEntrega: "7-10 dias úteis",
    imagem: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
    desconto: 0,
    popular: false
  },
  {
    id: "PROD-003",
    nome: "Impressora Industrial HP PageWide",
    categoria: "Equipamento de Impressão",
    fornecedor: "PrintMax Industrial",
    preco: "€1,850.00",
    precoOriginal: "€2,100.00",
    avaliacao: 4.2,
    avaliacoes: 234,
    descricao: "Impressora industrial de alto volume com tecnologia PageWide para impressão rápida e eficiente.",
    especificacoes: ["Velocidade: 75 ppm", "Resolução: 1200 dpi", "Capacidade: 4,600 folhas", "Conectividade: Wi-Fi, Ethernet"],
    disponibilidade: "Em stock",
    prazoEntrega: "2-4 dias úteis",
    imagem: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=300&fit=crop",
    desconto: 12,
    popular: true
  },
  {
    id: "PROD-004",
    nome: "Gerador a Diesel 100kVA",
    categoria: "Energia",
    fornecedor: "PowerGen Systems",
    preco: "€15,500.00",
    precoOriginal: "€17,200.00",
    avaliacao: 4.9,
    avaliacoes: 67,
    descricao: "Gerador de emergência industrial com alta confiabilidade e baixo consumo de combustível.",
    especificacoes: ["Potência: 100kVA/80kW", "Motor: Diesel 4 cilindros", "Autonomia: 12h", "Nível ruído: 65dB"],
    disponibilidade: "Em stock",
    prazoEntrega: "15-20 dias úteis",
    imagem: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop",
    desconto: 10,
    popular: false
  },
  {
    id: "PROD-005",
    nome: "Sistema de Backup Enterprise",
    categoria: "Segurança de Dados",
    fornecedor: "DataSecure Technologies",
    preco: "€890.00",
    precoOriginal: null,
    avaliacao: 3.8,
    avaliacoes: 12,
    descricao: "Solução completa de backup e recuperação para ambientes empresariais críticos.",
    especificacoes: ["Capacidade: 10TB", "Compressão: até 80%", "Criptografia: AES-256", "Suporte: 24/7"],
    disponibilidade: "Limitado",
    prazoEntrega: "5-7 dias úteis",
    imagem: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
    desconto: 0,
    popular: false
  }
];

const categorias = ["Todas", "Energia Solar", "Infraestrutura TI", "Equipamento de Impressão", "Energia", "Segurança de Dados"];
const fornecedores = ["Todos", "EnerTech Solutions", "TechFlow Innovations", "PrintMax Industrial", "PowerGen Systems", "DataSecure Technologies"];

const getDisponibilidadeBadge = (disponibilidade: string) => {
  switch (disponibilidade) {
    case "Em stock":
      return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">Em Stock</Badge>;
    case "Sob consulta":
      return <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">Sob Consulta</Badge>;
    case "Limitado":
      return <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">Limitado</Badge>;
    default:
      return <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">{disponibilidade}</Badge>;
  }
};

export function ProductSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [fornecedorFilter, setFornecedorFilter] = useState("Todos");
  const [priceRange, setPriceRange] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Usar contexto global para favoritos
  const { favorites, toggleFavorite } = useApp();

  const filteredProducts = produtos.filter((produto) => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "Todas" || produto.categoria === categoryFilter;
    const matchesFornecedor = fornecedorFilter === "Todos" || produto.fornecedor === fornecedorFilter;
    
    let matchesPrice = true;
    if (priceRange !== "all") {
      const price = parseFloat(produto.preco.replace(/[€,]/g, ''));
      switch (priceRange) {
        case "0-500":
          matchesPrice = price <= 500;
          break;
        case "500-2000":
          matchesPrice = price > 500 && price <= 2000;
          break;
        case "2000-10000":
          matchesPrice = price > 2000 && price <= 10000;
          break;
        case "10000+":
          matchesPrice = price > 10000;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesFornecedor && matchesPrice;
  });

  const ProductCard = ({ produto }: { produto: any }) => (
    <div className={`glass-card bg-white/5 rounded-xl border border-white/20 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] w-full max-w-full overflow-hidden ${
      viewMode === "list" ? "flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6 p-4 lg:p-6" : "p-4 lg:p-6 flex flex-col h-full"
    }`}>
      {/* Image */}
      <div className={`relative ${viewMode === "list" ? "w-full lg:w-32 h-48 lg:h-24" : "w-full h-48"} bg-gray-800 rounded-xl overflow-hidden mb-4 ${viewMode === "list" ? "lg:mb-0" : ""} group`}>
        <img 
          src={produto.imagem} 
          alt={produto.nome}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
        />
        {produto.desconto > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            -{produto.desconto}%
          </div>
        )}
        {produto.popular && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Popular
          </div>
        )}
        <button
          onClick={() => toggleFavorite(produto.id)}
          className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        >
          <Heart className={`w-4 h-4 transition-colors ${favorites.includes(produto.id) ? "text-red-400 fill-current" : "text-white hover:text-red-300"}`} />
        </button>
      </div>

      {/* Content */}
      <div className={`${viewMode === "list" ? "flex-1" : "flex-1 flex flex-col"}`}>
        <div className="mb-4 flex-grow">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-3 space-y-2 lg:space-y-0">
            <h3 className={`font-bold text-dark-primary hover:text-cyan-400 transition-colors duration-300 ${viewMode === "list" ? "text-lg" : "text-base"} leading-tight line-clamp-2`}>
              {produto.nome}
            </h3>
            {getDisponibilidadeBadge(produto.disponibilidade)}
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-300 font-medium truncate mr-2">{produto.categoria}</p>
            <span className="text-xs text-dark-secondary bg-dark-tag px-2 py-1 rounded-full truncate max-w-[120px]">{produto.fornecedor}</span>
          </div>
        </div>

        {viewMode === "list" && (
          <p className="text-sm text-dark-secondary mb-3 line-clamp-2">
            {produto.descricao}
          </p>
        )}

        <div className="mt-auto">
          <div className="flex flex-col space-y-3 mb-3">
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-xl font-bold text-green-400">{produto.preco}</span>
                {produto.precoOriginal && (
                  <span className="text-sm text-red-400 line-through bg-red-500/20 px-2 py-1 rounded">{produto.precoOriginal}</span>
                )}
              </div>
              <p className="text-xs text-dark-secondary mt-1 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 flex-shrink-0"></span>
                <span className="truncate">{produto.prazoEntrega}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 w-full">
            <button className="glass-card p-2 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-110 group flex-shrink-0">
              <Eye className="w-4 h-4 text-dark-secondary group-hover:text-cyan-400 transition-colors" />
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm flex items-center justify-center space-x-2 rounded-lg transition-all duration-300 flex-1 min-h-[40px]">
              <ShoppingCart className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Solicitar Cotação</span>
            </button>
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
              <Search className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              Pesquisa de Produtos
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">Explore e solicite cotações dos nossos fornecedores parceiros</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="glass-card px-4 py-2 text-center sm:text-left bg-blue-500/20 border-blue-500/30">
              <span className="text-blue-300 font-bold text-lg">{filteredProducts.length}</span>
              <span className="text-blue-200 ml-2">produtos</span>
            </div>
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="glass-card bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-400/50 text-white px-4 py-2 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 text-sm shadow-lg"
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              <span>{viewMode === "grid" ? "Lista" : "Grade"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
        <Tabs defaultValue="all" className="w-full h-full flex flex-col">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0 flex-shrink-0">
            <TabsList className="glass-card bg-white/5 border border-white/20 rounded-xl p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-dark-secondary text-sm rounded-lg px-4 py-2 transition-all duration-300">
                Todos os Produtos ({produtos.length})
              </TabsTrigger>
              <TabsTrigger value="popular" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-dark-secondary text-sm rounded-lg px-4 py-2 transition-all duration-300">
                Populares ({produtos.filter(p => p.popular).length})
              </TabsTrigger>
              <TabsTrigger value="ofertas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-dark-secondary text-sm rounded-lg px-4 py-2 transition-all duration-300">
                Ofertas ({produtos.filter(p => p.desconto > 0).length})
              </TabsTrigger>
            </TabsList>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-secondary" />
                <Input
                  placeholder="Pesquisar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full lg:w-64"
                />
              </div>
              
              <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full lg:w-40 glass-card border-white/20 text-dark-primary text-sm">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-sm">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={fornecedorFilter} onValueChange={setFornecedorFilter}>
                  <SelectTrigger className="w-full lg:w-40 glass-card border-white/20 text-dark-primary text-sm">
                    <SelectValue placeholder="Fornecedor" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    {fornecedores.map(forn => (
                      <SelectItem key={forn} value={forn} className="text-sm">{forn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-full lg:w-32 glass-card border-white/20 text-dark-primary text-sm">
                    <SelectValue placeholder="Preço" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="0-500">€0 - €500</SelectItem>
                    <SelectItem value="500-2000">€500 - €2K</SelectItem>
                    <SelectItem value="2000-10000">€2K - €10K</SelectItem>
                    <SelectItem value="10000+">€10K+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex-1 scrollable-content overflow-hidden">
            <TabsContent value="all" className="h-full mt-0">
              <div className={`grid gap-4 lg:gap-6 w-full ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                {filteredProducts.map((produto) => (
                  <ProductCard key={produto.id} produto={produto} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="popular" className="h-full mt-0">
              <div className={`grid gap-4 lg:gap-6 w-full ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                {produtos.filter(p => p.popular).map((produto) => (
                  <ProductCard key={produto.id} produto={produto} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ofertas" className="h-full mt-0">
              <div className={`grid gap-4 lg:gap-6 w-full ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                {produtos.filter(p => p.desconto > 0).map((produto) => (
                  <ProductCard key={produto.id} produto={produto} />
                ))}
              </div>
            </TabsContent>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-dark-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-dark-primary mb-2">Nenhum produto encontrado</h3>
                <p className="text-dark-secondary">Tente ajustar os filtros de pesquisa</p>
              </div>
            )}
          </div>
        </Tabs>
      </main>
    </div>
  );
}