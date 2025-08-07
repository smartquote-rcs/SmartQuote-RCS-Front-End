import { useState } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, Filter, Star, ShoppingCart, Eye, Heart, Grid, List } from "lucide-react";

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
      return <Badge className="bg-green-600 text-white text-xs">Em Stock</Badge>;
    case "Sob consulta":
      return <Badge className="bg-orange-600 text-white text-xs">Sob Consulta</Badge>;
    case "Limitado":
      return <Badge className="bg-red-600 text-white text-xs">Limitado</Badge>;
    default:
      return <Badge className="text-xs">{disponibilidade}</Badge>;
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

export function ProductSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [fornecedorFilter, setFornecedorFilter] = useState("Todos");
  const [priceRange, setPriceRange] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<string[]>([]);

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

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const ProductCard = ({ produto }: { produto: any }) => (
    <div className={`glass-card hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg ${
      viewMode === "list" ? "flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6 p-4" : "p-4"
    }`}>
      {/* Image */}
      <div className={`relative ${viewMode === "list" ? "w-full lg:w-32 h-48 lg:h-24" : "w-full h-48"} bg-gray-800 rounded-lg overflow-hidden mb-4 ${viewMode === "list" ? "lg:mb-0" : ""}`}>
        <img 
          src={produto.imagem} 
          alt={produto.nome}
          className="w-full h-full object-cover"
        />
        {produto.desconto > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{produto.desconto}%
          </div>
        )}
        {produto.popular && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
            Popular
          </div>
        )}
        <button
          onClick={() => toggleFavorite(produto.id)}
          className="absolute bottom-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <Heart className={`w-4 h-4 ${favorites.includes(produto.id) ? "text-red-400 fill-current" : "text-white"}`} />
        </button>
      </div>

      {/* Content */}
      <div className={`${viewMode === "list" ? "flex-1" : ""}`}>
        <div className="mb-3">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-2 space-y-2 lg:space-y-0">
            <h3 className={`font-bold text-dark-primary ${viewMode === "list" ? "text-lg" : "text-base"} leading-tight`}>
              {produto.nome}
            </h3>
            {getDisponibilidadeBadge(produto.disponibilidade)}
          </div>
          <p className="text-sm text-dark-secondary mb-2">{produto.categoria}</p>
          <p className="text-xs text-dark-secondary">{produto.fornecedor}</p>
        </div>

        <div className="mb-3">
          {getRatingStars(produto.avaliacao)}
          <p className="text-xs text-dark-secondary mt-1">{produto.avaliacoes} avaliações</p>
        </div>

        {viewMode === "list" && (
          <p className="text-sm text-dark-secondary mb-3 line-clamp-2">
            {produto.descricao}
          </p>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-dark-primary">{produto.preco}</span>
              {produto.precoOriginal && (
                <span className="text-sm text-dark-secondary line-through">{produto.precoOriginal}</span>
              )}
            </div>
            <p className="text-xs text-dark-secondary">{produto.prazoEntrega}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg bg-dark-tag hover:bg-dark-hover transition-colors">
              <Eye className="w-4 h-4 text-dark-secondary" />
            </button>
            <button className="dark-button-primary px-4 py-2 text-sm flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Solicitar Cotação</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold text-dark-primary">Pesquisa de Produtos</h1>
            <p className="text-sm text-dark-secondary mt-1">Explore e solicite cotações dos nossos fornecedores parceiros</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="dark-button-secondary gap-2 flex items-center text-sm px-3 py-2"
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              {viewMode === "grid" ? "Lista" : "Grade"}
            </button>
            <div className="dark-tag">
              {filteredProducts.length} produtos
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 lg:p-8 bg-dark-bg">
        <Tabs defaultValue="all" className="w-full h-full flex flex-col">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0 flex-shrink-0">
            <TabsList className="bg-dark-tag border border-dark-color">
              <TabsTrigger value="all" className="data-[state=active]:bg-dark-cta data-[state=active]:text-white text-dark-secondary text-sm">
                Todos os Produtos ({produtos.length})
              </TabsTrigger>
              <TabsTrigger value="popular" className="data-[state=active]:bg-dark-cta data-[state=active]:text-white text-dark-secondary text-sm">
                Populares ({produtos.filter(p => p.popular).length})
              </TabsTrigger>
              <TabsTrigger value="ofertas" className="data-[state=active]:bg-dark-cta data-[state=active]:text-white text-dark-secondary text-sm">
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
                  className="pl-10 w-full lg:w-64 glass-card border-white/20 text-dark-primary placeholder:text-dark-secondary"
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

          <div className="flex-1 overflow-auto">
            <TabsContent value="all" className="h-full mt-0">
              <div className={`grid gap-6 ${
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
              <div className={`grid gap-6 ${
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
              <div className={`grid gap-6 ${
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