// Interfaces para o SmartQuote-RCS

export interface Supplier {
  id?: number;
  nomeEmpresa: string;
  observacoes: string;
  ativo?: boolean;
  cadastradoEm: string;
  cadastradoPor: number;
  atualizadoEm: string;
  atualizadoPor: number;
  categoriaMercado: string;
  contactos: {
    principal?: {
      nome?: string;
      email?: string;
      telefone?: string;
      cargo?: string;
    };
    secundario?: {
      nome?: string;
      email?: string;
      telefone?: string;
      cargo?: string;
    };
    financeiro?: {
      nome?: string;
      email?: string;
      telefone?: string;
      departamento?: string;
    };
  };
  rating?: number;
  localizacao: string;
}

export interface QuoteRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed';
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  budget?: number;
  suppliers?: string[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'supplier';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  active: boolean;
}

export interface EmailConfiguration {
  host: string;
  port: number;
  username: string;
  password: string;
  useSSL: boolean;
  enabled: boolean;
  lastCheck?: string;
  status?: 'connected' | 'disconnected' | 'error';
}

export interface EmailQuote {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  parsed: boolean;
  quoteData?: {
    companyName?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    items?: Array<{
      description: string;
      quantity?: number;
      price?: number;
    }>;
    totalValue?: number;
    deadline?: string;
    observations?: string;
  };
}

export interface Product {
  id?: number;
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  categoriaId: number;
  categoria?: string; // Nome da categoria para exibição
  fornecedorId?: number;
  fornecedor?: string; // Nome do fornecedor para exibição
  codigo?: string; // Código/SKU do produto
  unidadeMedida: string; // kg, unidade, litro, etc.
  disponibilidade: 'em-stock' | 'fora-de-stock' | 'descontinuado' | 'pre-venda';
  prazoEntrega?: string; // Ex: "5-7 dias úteis"
  especificacoes?: string; // Especificações técnicas
  imagem?: string; // URL da imagem do produto
  peso?: number; // Peso em kg
  dimensoes?: {
    comprimento?: number;
    largura?: number;
    altura?: number;
  };
  tags?: string[]; // Tags para busca e categorização
  precoMinimo?: number; // Preço mínimo para negociação
  precoMaximo?: number; // Preço máximo
  moeda: string; // EUR, USD, etc.
  garantia?: string; // Período de garantia
  observacoes?: string; // Observações internas
  cadastradoEm: string;
  cadastradoPor: number;
  atualizadoEm: string;
  atualizadoPor: number;
  ativo?: boolean;
}
