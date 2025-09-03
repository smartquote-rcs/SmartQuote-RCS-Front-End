// Main types for the application

export interface Supplier {
  id: number;
  nome: string;
  contato_email?: string;
  contato_telefone?: string;
  site?: string;
  ativo: boolean;
  observacoes?: string;
  cadastrado_por?: number;
  atualizado_por?: number;
  cadastrado_em?: string;
  atualizado_em?: string;
  rate?: number;
}

export interface Product {
  id: number;
  nome: string;
  descricao?: string;
  categoria?: string;
  preco?: number;
  ativo: boolean;
  cadastrado_em?: string;
  atualizado_em?: string;
}

export interface User {
  id: number;
  email: string;
  nome?: string;
  role?: string;
  ativo: boolean;
  ultimo_acesso?: string;
  cadastrado_em?: string;
}

export interface Cotacao {
  id: number;
  numero?: string;
  cliente?: string;
  valor?: number;
  status?: string;
  aprovacao?: boolean;
  data_aprovacao?: string;
  aprovado_por?: string;
  motivo?: string;
  cadastrado_em?: string;
  atualizado_em?: string;
}
