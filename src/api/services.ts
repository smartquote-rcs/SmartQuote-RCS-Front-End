// Busca o papel/função do usuário por email
export async function getUserRoleByEmail(email: string): Promise<{ role: string, origem: 'employees' | 'users' | null }> {
  try {
    // 1. Tenta encontrar na tabela employees
    const empRes = await api.get(`/employee/by-email/${encodeURIComponent(email)}`);
    if (empRes.data && empRes.data.position) {
      return { role: 'admin', origem: 'employees' };
    }
  } catch (e) { /* ignora erro, tenta users */ }
  try {
    // 2. Tenta encontrar na tabela users
    const userRes = await api.get(`/users/by-email/${encodeURIComponent(email)}`);
    if (userRes.data && userRes.data.função) {
      return { role: userRes.data.função, origem: 'users' };
    }
  } catch (e) { /* ignora erro */ }
  return { role: 'user', origem: null };
}
// ...existing code...
// Serviço de Usuários (atualizado para usar a API correta)
export const userService = {
  async create(userData: {
    nome: string;
    email: string;
    password?: string;
    departamento: string;
    função: string;
    contacto?: string;
  }): Promise<AuthResponse> {
    try {
      console.log('📤 Enviando dados para criar usuário (POST /users/create):', {
        ...userData,
        password: userData.password ? '[SENHA DEFINIDA]' : '[SEM SENHA]'
      });
      
      const requestData: any = {
        name: userData.nome,
        email: userData.email,
        department: userData.departamento,
        position: userData.função, // API espera 'position' não 'role'
      };
      
      // Só incluir senha se foi fornecida
      if (userData.password && userData.password.length > 0) {
        requestData.password = userData.password;
      }
      
      // Só incluir contato se foi fornecido
      if (userData.contacto && userData.contacto.length > 0) {
        requestData.contact = userData.contacto; // API espera 'contact' não 'phone'
      }
      
      const response = await api.post('/users/create', requestData);
      
      if (response.status === 204 || response.status === 201 || response.status === 200) {
        return { success: true, data: response.data || { message: 'Usuário criado com sucesso' } };
      }
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao criar usuário:', error);
      
      // Melhor tratamento de erros da API
      let errorMessage = 'Erro ao criar usuário';
      
      if (error.response) {
        // Erro da API
        if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = 'Dados inválidos. Verifique todos os campos.';
        } else if (error.response.status === 409) {
          errorMessage = 'Email já está em uso.';
        } else if (error.response.status === 422) {
          errorMessage = 'Dados não atendem aos critérios de validação.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
        }
      } else if (error.request) {
        // Erro de rede
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  async getAll(): Promise<AuthResponse> {
    try {
      console.log('📤 Fazendo requisição para buscar usuários (GET /users)...');
      const response = await api.get('/users');
      console.log('📨 Resposta da API (users):', response);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao buscar usuários:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar usuários'
      };
    }
  },

  async getById(id: string): Promise<AuthResponse> {
    try {
      console.log(`📤 Fazendo requisição para buscar usuário por ID (GET /users/${id})...`);
      const response = await api.get(`/users/${id}`);
      console.log('📨 Resposta da API (user by ID):', response);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao buscar usuário por ID:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar usuário'
      };
    }
  },

  async deleteUser(id: string): Promise<AuthResponse> {
    try {
      console.log(`📤 Fazendo requisição para deletar usuário (DELETE /users/${id})...`);
      const response = await api.delete(`/users/${id}`);
      if (response.status === 204 || response.status === 200) {
        return { success: true, data: { message: 'Usuário removido com sucesso' } };
      }
      return { success: false, error: 'Erro ao remover usuário.' };
    } catch (error: any) {
      console.error('💥 Erro ao deletar usuário:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao remover usuário.' 
      };
    }
  },

  async updateUser(id: string, userData: {
    name?: string;
    email?: string;
    department?: string;
    role?: string;
    phone?: string;
    password?: string;
  }): Promise<AuthResponse> {
    try {
      console.log(`📤 Fazendo requisição para atualizar usuário (PATCH /users/${id}):`, userData);
      
      // Mapear os campos para a estrutura correta da API
      const updateData: any = {};
      
      if (userData.name) updateData.name = userData.name;
      if (userData.email) updateData.email = userData.email;
      if (userData.department) updateData.department = userData.department;
      if (userData.role) updateData.position = userData.role; // API espera 'position' não 'role'
      if (userData.phone) updateData.contact = userData.phone; // API espera 'contact' não 'phone'
      if (userData.password) updateData.password = userData.password;
      
      console.log(`📤 Dados mapeados para API:`, updateData);
      
      const response = await api.patch(`/users/${id}`, updateData);
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Erro ao atualizar usuário.' };
    } catch (error: any) {
      console.error('💥 Erro ao atualizar usuário:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao atualizar usuário.' 
      };
    }
  }
};
import api from './client';

// Tipos
interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface SigninData {
  email: string;
  password: string;
}

interface EmployeeData {
  name: string;
  email: string;
  role?: string;
  department?: string;
  phone?: string;
  password?: string;
}

// Serviço de Autenticação
export const authService = {
  // Testar se o token está válido
  async validateToken(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        return { success: false, error: 'Token não encontrado no localStorage' };
      }
      
      console.log('🔑 Testando token:', token.substring(0, 20) + '...');
      
      // Fazer uma requisição simples para testar se o token é válido
      const response = await api.get('/auth/me'); // Endpoint para verificar token
      
      console.log('✅ Token válido, dados do usuário:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('❌ Token inválido:', error.response?.data || error.message);
      
      // Se o token é inválido, remover do localStorage
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        return { success: false, error: 'Token inválido ou expirado' };
      }
      
      return { success: false, error: error.response?.data?.message || 'Erro ao validar token' };
    }
  },

  // Registrar novo usuário
  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      console.log('🔌 Fazendo requisição para:', '/auth/signup');
      console.log('📝 Dados enviados:', { email: userData.email, name: userData.name });
      
      const response = await api.post('/auth/signup', {
        email: userData.email,
        password: userData.password,
        username: userData.name
      });
      
      console.log('📨 Resposta recebida:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro na requisição de registro:', error);
      console.error('📊 Status do erro:', error.response?.status);
      console.error('📄 Dados do erro:', error.response?.data);
      
      let errorMessage = 'Erro ao criar conta';
      
      // Tratamento específico por código de status HTTP
      switch (error.response?.status) {
        case 400:
          const serverMessage = error.response?.data?.error || error.response?.data?.message || '';
          if (serverMessage.toLowerCase().includes('email')) {
            errorMessage = 'Formato de email inválido.';
          } else if (serverMessage.toLowerCase().includes('password')) {
            errorMessage = 'Senha deve ter pelo menos 8 caracteres.';
          } else {
            errorMessage = 'Dados inválidos. Verifique as informações.';
          }
          break;
        case 409:
          errorMessage = 'Este email já está registrado. Tente fazer login ou use outro email.';
          break;
        case 422:
          errorMessage = 'Dados inválidos. Verifique o formato dos campos.';
          break;
        case 429:
          errorMessage = 'Muitas tentativas de registro. Aguarde alguns minutos.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = 'Erro no servidor. Tente novamente em alguns minutos.';
          break;
        default:
          if (!error.response) {
            errorMessage = 'Erro de conexão. Verifique sua internet.';
          } else {
            // Usar mensagem do servidor se disponível
            errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro desconhecido ao criar conta.';
          }
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  // Fazer login
  async signin(credentials: SigninData): Promise<AuthResponse> {
    try {
      console.log('Fazendo requisição para:', '/auth/signin');
      console.log('Dados enviados:', { email: credentials.email });
      
      const response = await api.post('/auth/signin', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('Resposta recebida:', response.data);
      
      // Salvar token no localStorage
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        console.log('Token salvo no localStorage');
      }
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Erro na requisição:', error);
      console.error('Status do erro:', error.response?.status);
      console.error('Dados do erro:', error.response?.data);
      
      let errorMessage = 'Erro ao fazer login';
      
      // Tratamento específico por código de status HTTP
      switch (error.response?.status) {
        case 400:
          errorMessage = 'Dados de login inválidos. Verifique email e senha.';
          break;
        case 401:
          // Analisar a mensagem específica do servidor
          const serverMessage = error.response?.data?.error || error.response?.data?.message || '';
          if (serverMessage.toLowerCase().includes('password')) {
            errorMessage = 'Senha incorreta. Verifique sua senha.';
          } else if (serverMessage.toLowerCase().includes('email') || serverMessage.toLowerCase().includes('user')) {
            errorMessage = 'Email não encontrado. Verifique seu email ou crie uma conta.';
          } else {
            errorMessage = 'Email ou senha incorretos.';
          }
          break;
        case 403:
          errorMessage = 'Acesso negado. Sua conta pode estar bloqueada ou inativa.';
          break;
        case 404:
          errorMessage = 'Serviço de autenticação não encontrado. Tente novamente mais tarde.';
          break;
        case 422:
          errorMessage = 'Dados inválidos. Verifique o formato do email e senha.';
          break;
        case 429:
          errorMessage = 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = 'Erro no servidor. Tente novamente em alguns minutos.';
          break;
        default:
          if (!error.response) {
            errorMessage = 'Erro de conexão. Verifique sua internet.';
          } else {
            // Usar mensagem do servidor se disponível
            errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro desconhecido no login.';
          }
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  },

  // Logout
  logout(): void {
    localStorage.removeItem('auth_token');
  },

  // Verificar se está logado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }
};

// Serviço de Funcionários
export const employeeService = {
  // Listar todos os funcionários
  async getAll(): Promise<AuthResponse> {
    try {
      console.log('📤 Fazendo requisição para buscar usuários...');
      const response = await api.get('/users/');
      
      console.log('📨 Resposta bruta da API:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao buscar funcionários:', error);
      console.error('📊 Status do erro:', error.response?.status);
      console.error('📄 Dados do erro:', error.response?.data);
      
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar funcionários' 
      };
    }
  },

  // Criar novo funcionário
  async create(usersData: EmployeeData): Promise<AuthResponse> {
    try {
      console.log('📤 Enviando dados para criar usuário:', usersData);
      
      const response = await api.post('/users/create', {
        name: usersData.name,
        email: usersData.email,
        role: usersData.role,
        department: usersData.department,
        phone: usersData.phone,
        password: usersData.password
      });
      
      console.log('📨 Resposta da API ao criar usuário:', response);
      console.log('📊 Status da resposta:', response.status);
      console.log('📄 Dados da resposta:', response.data);
      
      // Status 204 (No Content) é um sucesso, mas sem dados de retorno
      if (response.status === 204 || response.status === 201 || response.status === 200) {
        return { 
          success: true, 
          data: response.data || { message: 'Usuário criado com sucesso' }
        };
      }
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao criar usuário:', error);
      console.error('📊 Status do erro:', error.response?.status);
      console.error('📄 Dados do erro:', error.response?.data);
      
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao criar funcionário' 
      };
    }
  }
};

// Serviço de Cotações
export const cotacaoService = {
  async getAll(): Promise<AuthResponse> {
    try {
      console.log('📤 Fazendo requisição para buscar cotações (GET /cotacoes)...');
      const response = await api.get('/cotacoes');
      console.log('📨 Resposta da API (cotações):', response);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao buscar cotações:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar cotações'
      };
    }
  },

  async create(cotacaoData: any): Promise<AuthResponse> {
    try {
      console.log('📤 Criando nova cotação (POST /cotacoes):', cotacaoData);
      const response = await api.post('/cotacoes', cotacaoData);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao criar cotação:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao criar cotação'
      };
    }
  },

  async getById(id: string): Promise<AuthResponse> {
    try {
      console.log(`📤 Buscando cotação por ID (GET /cotacoes/${id})...`);
      const response = await api.get(`/cotacoes/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao buscar cotação:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar cotação'
      };
    }
  },

  async update(id: string, cotacaoData: any): Promise<AuthResponse> {
    try {
      console.log(`📤 Atualizando cotação (PATCH /cotacoes/${id}):`, cotacaoData);
      const response = await api.patch(`/cotacoes/${id}`, cotacaoData);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao atualizar cotação:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao atualizar cotação'
      };
    }
  },

  async delete(id: string): Promise<AuthResponse> {
    try {
      console.log(`📤 Deletando cotação (DELETE /cotacoes/${id})...`);
      await api.delete(`/cotacoes/${id}`);
      return { success: true, data: { message: 'Cotação removida com sucesso' } };
    } catch (error: any) {
      console.error('💥 Erro ao deletar cotação:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao remover cotação'
      };
    }
  }
};

// Serviço de Produtos
export const produtoService = {
  async getAll(): Promise<AuthResponse> {
    try {
      console.log('📤 Fazendo requisição para buscar produtos (GET /products)...');
      const response = await api.get('/products');
      console.log('📥 Resposta da API para produtos:', response.data);
      
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Erro ao buscar produtos.' };
    } catch (error: any) {
      console.error('💥 Erro ao buscar produtos:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar produtos.' 
      };
    }
  },

  async create(productData: {
    nome: string;
    descricao: string;
    preco: number;
    quantidade: number;
    categoriaId: number;
    cadastradoPor: number;
    atualizadoPor: number;
    ativo?: boolean;
  }): Promise<AuthResponse> {
    try {
      console.log('📤 Enviando dados para criar produto (POST /products):', productData);
      
      const createData = {
        nome: productData.nome,
        descricao: productData.descricao,
        preco: productData.preco,
        quantidade: productData.quantidade,
        categoriaId: productData.categoriaId,
        cadastradoPor: productData.cadastradoPor,
        atualizadoPor: productData.atualizadoPor,
        ativo: productData.ativo !== undefined ? productData.ativo : true
      };
      
      const response = await api.post('/products', createData);
      if (response.status === 201 || response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Erro ao criar produto.' };
    } catch (error: any) {
      console.error('💥 Erro ao criar produto:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao criar produto' 
      };
    }
  },

  async update(id: string, productData: {
    nome?: string;
    descricao?: string;
    preco?: number;
    quantidade?: number;
    categoriaId?: number;
    atualizadoPor?: number;
    ativo?: boolean;
  }): Promise<AuthResponse> {
    try {
      console.log(`📤 Fazendo requisição para atualizar produto (PATCH /products/${id})...`);
      console.log(`📊 Dados recebidos para atualização:`, productData);
      
      const updateData: any = {};
      if (productData.nome) updateData.nome = productData.nome;
      if (productData.descricao) updateData.descricao = productData.descricao;
      if (productData.preco !== undefined) updateData.preco = productData.preco;
      if (productData.quantidade !== undefined) updateData.quantidade = productData.quantidade;
      if (productData.categoriaId) updateData.categoriaId = productData.categoriaId;
      if (productData.atualizadoPor) updateData.atualizadoPor = productData.atualizadoPor;
      if (productData.ativo !== undefined) updateData.ativo = productData.ativo;
      
      console.log(`📤 Dados mapeados para API:`, updateData);
      
      const response = await api.patch(`/products/${id}`, updateData);
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Erro ao atualizar produto.' };
    } catch (error: any) {
      console.error('💥 Erro ao atualizar produto:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao atualizar produto.' 
      };
    }
  },

  async delete(id: string): Promise<AuthResponse> {
    try {
      console.log(`📤 Fazendo requisição para deletar produto (DELETE /products/${id})...`);
      const response = await api.delete(`/products/${id}`);
      if (response.status === 204 || response.status === 200) {
        return { success: true, data: { message: 'Produto removido com sucesso' } };
      }
      return { success: false, error: 'Erro ao remover produto.' };
    } catch (error: any) {
      console.error('💥 Erro ao deletar produto:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao remover produto.' 
      };
    }
  }
};

// Serviço de Fornecedores
export const supplierService = {
  async create(supplierData: {
    nomeEmpresa: string;
    observacoes: string;
    ativo?: boolean;
    cadastradoPor: number;
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
    localizacao: string;
    rating?: number;
  }): Promise<AuthResponse> {
    try {
      console.log('📤 Enviando dados para criar fornecedor (POST /suppliers):', supplierData);
      
      const requestData = {
        nomeEmpresa: supplierData.nomeEmpresa,
        observacoes: supplierData.observacoes,
        ativo: supplierData.ativo ?? true,
        cadastradoPor: supplierData.cadastradoPor,
        categoriaMercado: supplierData.categoriaMercado,
        contactos: supplierData.contactos,
        localizacao: supplierData.localizacao,
        rating: supplierData.rating || 0
      };
      
      const response = await api.post('/suppliers', requestData);
      
      if (response.status === 204 || response.status === 201 || response.status === 200) {
        return { success: true, data: response.data || { message: 'Fornecedor criado com sucesso' } };
      }
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao criar fornecedor:', error);
      
      let errorMessage = 'Erro ao criar fornecedor';
      
      if (error.response) {
        if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = 'Dados inválidos. Verifique todos os campos.';
        } else if (error.response.status === 409) {
          errorMessage = 'Fornecedor já existe.';
        } else if (error.response.status === 422) {
          errorMessage = 'Dados não atendem aos critérios de validação.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
        }
      } else if (error.request) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  async getAll(): Promise<AuthResponse> {
    try {
      console.log('📤 Fazendo requisição para buscar fornecedores (GET /suppliers)...');
      const response = await api.get('/suppliers');
      console.log('📨 Resposta da API (suppliers):', response);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao buscar fornecedores:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar fornecedores'
      };
    }
  },

  async getById(id: string): Promise<AuthResponse> {
    try {
      console.log(`📤 Fazendo requisição para buscar fornecedor por ID (GET /suppliers/${id})...`);
      const response = await api.get(`/suppliers/${id}`);
      console.log('📨 Resposta da API (supplier by ID):', response);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao buscar fornecedor por ID:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar fornecedor'
      };
    }
  },

  async update(id: string, supplierData: {
    nomeEmpresa?: string;
    observacoes?: string;
    ativo?: boolean;
    atualizadoPor?: number;
    categoriaMercado?: string;
    contactos?: {
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
    localizacao?: string;
    rating?: number;
  }): Promise<AuthResponse> {
    try {
      console.log(`📤 Fazendo requisição para atualizar fornecedor (PATCH /suppliers/${id}):`, supplierData);
      
      const updateData: any = {};
      
      if (supplierData.nomeEmpresa) updateData.nomeEmpresa = supplierData.nomeEmpresa;
      if (supplierData.observacoes) updateData.observacoes = supplierData.observacoes;
      if (supplierData.ativo !== undefined) updateData.ativo = supplierData.ativo;
      if (supplierData.atualizadoPor) updateData.atualizadoPor = supplierData.atualizadoPor;
      if (supplierData.categoriaMercado) updateData.categoriaMercado = supplierData.categoriaMercado;
      if (supplierData.contactos) updateData.contactos = supplierData.contactos;
      if (supplierData.localizacao) updateData.localizacao = supplierData.localizacao;
      if (supplierData.rating !== undefined) updateData.rating = supplierData.rating;
      
      console.log(`📤 Dados mapeados para API:`, updateData);
      
      const response = await api.patch(`/suppliers/${id}`, updateData);
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Erro ao atualizar fornecedor.' };
    } catch (error: any) {
      console.error('💥 Erro ao atualizar fornecedor:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao atualizar fornecedor.' 
      };
    }
  },

  async delete(id: string): Promise<AuthResponse> {
    try {
      console.log(`📤 Fazendo requisição para deletar fornecedor (DELETE /suppliers/${id})...`);
      const response = await api.delete(`/suppliers/${id}`);
      if (response.status === 204 || response.status === 200) {
        return { success: true, data: { message: 'Fornecedor removido com sucesso' } };
      }
      return { success: false, error: 'Erro ao remover fornecedor.' };
    } catch (error: any) {
      console.error('💥 Erro ao deletar fornecedor:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao remover fornecedor.' 
      };
    }
  }
};
