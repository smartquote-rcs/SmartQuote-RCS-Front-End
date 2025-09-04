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
  codigo?: string;
  modelo?: string;
  origem?: string;
  unidade?: string;
  estoque?: number;
  preco?: number;
  image_url?: string;
  produto_url?: string;
  fornecedorId?: number;
  ativo: boolean;
  cadastrado_em?: string;
  atualizado_em?: string;
  cadastrado_por?: string;
  atualizado_por?: string;
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
