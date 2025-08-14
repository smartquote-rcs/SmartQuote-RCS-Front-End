// Interfaces para o SmartQuote-RCS

export interface Supplier {
  id: number;
  nome: string;
  contato_email: string;
  contato_telefone: string;
  site: string;
  observacoes: string;
  ativo: boolean;
  cadastrado_em: string;
  cadastrado_por: number;
  atualizado_em: string;
  atualizado_por: number;
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
  fornecedorId?: number;
  codigo?: string;
  nome: string;
  modelo?: string;
  descricao: string;
  preco: number;
  unidade?: string;
  estoque: number;
  origem?: string;
  cadastrado_por: number;
  m?: string;
  cadastrado_em: string;
  atualizado_por: number;
  atualizado_em: string;
}
