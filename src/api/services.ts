// Serviço de Notificações
export const notificationService = {
  async getAll() {
    try {
      const response = await api.get('/notifications');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao buscar notificações:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar notificações'
      };
    }
  },
  async delete(id: string) {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao deletar notificação:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao deletar notificação'
      };
    }
  },
  async deleteAll() {
    try {
      const response = await api.delete('/notifications');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao deletar todas as notificações:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao deletar todas as notificações'
      };
    }
  }
};
// Serviço de Configurações do Sistema
export const sistemaService = {
  async getConfig() {
    try {
      const response = await api.get('/sistema');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao buscar configurações do sistema:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar configurações do sistema'
      };
    }
  }
  ,
  async updateConfig(config: any) {
    try {
      const response = await api.patch('/sistema', config);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao atualizar configurações do sistema:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao atualizar configurações do sistema'
      };
    }
  }
};
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
    if (userRes.data && userRes.data.position) {
      return { role: userRes.data.position, origem: 'users' };
    }
  } catch (e) { /* ignora erro */ }
  return { role: 'user', origem: null };
}

// (Removido bloco dinâmico de adição do método deleteAll)
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

  async upsert(email: string, name?: string, role?: string, position?: string): Promise<AuthResponse> {
    try {
      const payload: any = { email };
      if (name) payload.name = name;
      if (position || role) payload.position = position || role;
      const response = await api.post('/users-public/upsert', payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro no upsert de usuário:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro no upsert de usuário'
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

// Função utilitária para upload de imagem
export async function uploadImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Supondo que seu backend tenha um endpoint /upload que retorna { url: 'https://...' }
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.status === 200 && response.data.url) {
      return { success: true, url: response.data.url };
    }
    return { success: false, error: 'Erro ao fazer upload da imagem.' };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || 'Erro ao fazer upload da imagem.' };
  }
}

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
  async delete(id: string): Promise<AuthResponse> {
    try {
      console.log(`📤 Fazendo requisição para deletar produto (DELETE /produtos/${id})...`);
      const response = await api.delete(`/produtos/${id}`);
      const status = response.status;
      console.log('📥 Resposta delete produto:', status, response.data);
      if (status === 200 || status === 204) {
        return { success: true, data: response.data || { message: 'Produto removido com sucesso' } };
      }
      return { success: false, error: `Resposta inesperada ao remover produto (status ${status}).` };
    } catch (error: any) {
      console.error('💥 Erro ao deletar produto:', error);
      // Tratar conflito de FK (status 409 do backend)
      if (error.response?.status === 409) {
        return {
          success: false,
            error: error.response.data?.error || 'Produto vinculado a cotações/itens e não pode ser removido.'
        };
      }
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao remover produto.' 
      };
    }
  },
  async forceDelete(id: string): Promise<AuthResponse> {
    try {
      console.log(`📤 Fazendo requisição para deletar FORÇADO produto (DELETE /produtos/${id}/force)...`);
      const response = await api.delete(`/produtos/${id}/force`);
      const status = response.status;
      if (status === 200 || status === 204) {
        return { success: true, data: response.data || { message: 'Produto removido (forçado).' } };
      }
      return { success: false, error: `Resposta inesperada ao remover produto (status ${status}).` };
    } catch (error: any) {
      console.error('💥 Erro ao deletar produto (force):', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao remover produto (force).' 
      };
    }
  },
  async getAll(): Promise<AuthResponse> {
    try {
      console.log('📤 Fazendo requisição para buscar produtos (GET /produtos)...');
      const response = await api.get('/produtos');
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
    fornecedor_id: number;
    codigo: string;
    nome: string;
    modelo: string;
    descricao: string;
    preco: number; // em centavos
    unidade: string;
    estoque: number;
    origem: 'local' | 'externo';
    image_url?: string;
    produto_url?: string;
    cadastrado_por: number;
    cadastrado_em: string;
    atualizado_por: number;
    atualizado_em: string;
  }): Promise<AuthResponse> {
    try {
      console.log('📤 Enviando dados para criar produto (POST /produtos):', productData);
      const response = await api.post('/produtos', productData);
      if (response.status === 201 || response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Erro ao criar produto.' };
    } catch (error: any) {
      // Log detalhado do erro do backend
      if (error.response) {
        console.error('💥 Erro ao criar produto:', error.response.data);
      } else {
        console.error('💥 Erro ao criar produto:', error);
      }
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao criar produto' 
      };
    }
  },

  async update(id: string, productData: Partial<{
    nome: string;
    descricao: string;
    preco: number;
    unidade?: string;
    estoque: number;
    fornecedorId?: number;
    codigo?: string;
    modelo?: string;
    origem?: string;
    cadastrado_por: number;
    cadastrado_em: string;
    atualizado_por: number;
    atualizado_em: string;
    m?: string;
  }>): Promise<AuthResponse> {
    try {
      console.log(`📤 Fazendo requisição para atualizar produto (PATCH /produtos/${id})...`);
      console.log(`📊 Dados recebidos para atualização:`, productData);
      const response = await api.patch(`/produtos/${id}`, productData);
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

  async replaceProduct(cotacaoItemId: number, newProductId: number): Promise<AuthResponse> {
    try {
      const response = await api.put('/cotacoes-itens/replace-product', {
        cotacaoItemId,
        newProductId,
      });
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.data?.error || 'Erro ao substituir item.' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao substituir item.'
      };
    }
  }
}

// Serviço de Dashboard - Estatísticas
export const dashboardService = {
  async getStats(): Promise<AuthResponse> {
    try {
      console.log('📤 Fazendo requisição para buscar estatísticas do dashboard (GET /dashboard/stats)...');
      const response = await api.get('/dashboard/stats');
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Erro ao buscar estatísticas.' };
    } catch (error: any) {
      console.error('💥 Erro ao buscar estatísticas:', error);
      let errorMessage = 'Erro ao buscar estatísticas.';
      if (error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  async getQuoteStats(): Promise<AuthResponse> {
    try {
      console.log('📤 Fazendo requisição para buscar estatísticas de cotações (GET /cotacoes/stats)...');
      const response = await api.get('/cotacoes/stats');
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Erro ao buscar estatísticas de cotações.' };
    } catch (error: any) {
      console.error('💥 Erro ao buscar estatísticas de cotações:', error);
      // Fallback: tentar buscar todas as cotações e calcular estatísticas localmente
      try {
        const cotacoesResponse = await cotacaoService.getAll();
        if (cotacoesResponse.success && cotacoesResponse.data) {
          const cotacoes = Array.isArray(cotacoesResponse.data) ? cotacoesResponse.data : cotacoesResponse.data.data || [];
          const stats = {
            total: cotacoes.length,
            approved: cotacoes.filter((c: any) => c.status === 'approved' || c.status === 'aprovada').length,
            pending: cotacoes.filter((c: any) => c.status === 'pending' || c.status === 'pendente').length,
            processing: cotacoes.filter((c: any) => c.status === 'processing' || c.status === 'processando').length,
            rejected: cotacoes.filter((c: any) => c.status === 'rejected' || c.status === 'rejeitada').length
          };
          return { success: true, data: stats };
        }
      } catch (fallbackError) {
        console.error('💥 Erro no fallback de estatísticas:', fallbackError);
      }
      
      let errorMessage = 'Erro ao buscar estatísticas de cotações.';
      if (error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  async getUserStats(): Promise<AuthResponse> {
    try {
      console.log('📤 Fazendo requisição para buscar estatísticas de usuários (GET /users/stats)...');
      const response = await api.get('/users/stats');
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Erro ao buscar estatísticas de usuários.' };
    } catch (error: any) {
      console.error('💥 Erro ao buscar estatísticas de usuários:', error);
      // Fallback: tentar buscar todos os usuários e calcular estatísticas localmente
      try {
        const usersResponse = await userService.getAll();
        if (usersResponse.success && usersResponse.data) {
          const users = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.data || [];
          const stats = {
            total: users.length,
            admin: users.filter((u: any) => u.role === 'admin' || u.position === 'admin').length,
            manager: users.filter((u: any) => u.role === 'manager' || u.position === 'manager').length,
            user: users.filter((u: any) => u.role === 'user' || u.position === 'user' || (!u.role && !u.position)).length
          };
          return { success: true, data: stats };
        }
      } catch (fallbackError) {
        console.error('💥 Erro no fallback de estatísticas de usuários:', fallbackError);
      }
      
      let errorMessage = 'Erro ao buscar estatísticas de usuários.';
      if (error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  }
};

// Serviço de Fornecedores
export const supplierService = {
  async create(supplierData: {
    nome: string;
    contato_email: string;
    contato_telefone?: string;
    site?: string;
    observacoes?: string;
    ativo?: boolean;
    cadastrado_em: string;
    cadastrado_por: number;
    atualizado_em: string;
    atualizado_por: number;
  }): Promise<AuthResponse> {
    try {
      console.log('📤 Fazendo requisição para criar fornecedor (POST /fornecedores):', supplierData);
      const response = await api.post('/fornecedores', supplierData);
      if (response.status === 201 || response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Erro ao criar fornecedor.' };
    } catch (error: any) {
      console.error('💥 Erro ao criar fornecedor:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao criar fornecedor.'
      };
    }
  },
  async getAll(): Promise<AuthResponse> {
    try {
      console.log('📤 Fazendo requisição para buscar fornecedores (GET /fornecedores)...');
      const response = await api.get('/fornecedores');
      console.log('📨 Resposta da API (fornecedores):', response);
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
      console.log(`📤 Fazendo requisição para buscar fornecedor por ID (GET /fornecedores/${id})...`);
      const response = await api.get(`/fornecedores/${id}`);
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
  async update(id: string, supplierData: Partial<{
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
    rate?: number;
  }>): Promise<AuthResponse> {
    try {
  console.log(`📤 Fazendo requisição para atualizar fornecedor (PATCH /fornecedores/${id}):`, supplierData);
  const response = await api.patch(`/fornecedores/${id}`, supplierData);
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
      console.log(`📤 Fazendo requisição para deletar fornecedor (DELETE /fornecedores/${id})...`);
      const response = await api.delete(`/fornecedores/${id}`);
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

// Serviço de Jobs de Cotação
export const jobService = {
  async deleteJobById(jobId: string) {
    try {
      const response = await api.delete(`/busca-automatica/job/${jobId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Erro ao deletar job:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao deletar job'
      };
    }
  }
};
