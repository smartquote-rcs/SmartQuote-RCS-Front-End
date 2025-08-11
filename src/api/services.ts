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
// Serviço de Usuários (novo padrão)
export const userService = {
  async create(userData: {
    nome: string;
    email: string;
    password: string;
    departamento: string;
    função: string;
    contacto: string;
  }): Promise<AuthResponse> {
    try {
      console.log('📤 Enviando dados para criar usuário (tabela users):', userData);
      // Cria sempre na tabela users, independente do papel
      const response = await api.post('/users/create', userData);
      if (response.status === 204 || response.status === 201 || response.status === 200) {
        return { success: true, data: response.data || { message: 'Usuário criado com sucesso' } };
      }
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao criar usuário:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao criar usuário'
      };
    }
  },
  async getAll(): Promise<AuthResponse> {
    try {
      console.log('📤 Fazendo requisição para buscar usuários (tabela users)...');
      const response = await api.get('/users/');
      console.log('📨 Resposta bruta da API (users):', response);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao buscar usuários:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar usuários'
      };
    }
  },
  async deleteUser(id: string): Promise<AuthResponse> {
    try {
      const response = await api.delete(`/users/${id}`);
      if (response.status === 204) {
        return { success: true };
      }
      return { success: false, error: 'Erro ao remover usuário.' };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Erro ao remover usuário.' };
    }
  },
  async updateUser(id: string, userData: any): Promise<AuthResponse> {
    try {
      const response = await api.put(`/users/${id}`, userData);
      if (response.status === 200) {
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Erro ao atualizar usuário.' };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Erro ao atualizar usuário.' };
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
      const response = await api.get('/employee/');
      
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
  async create(employeeData: EmployeeData): Promise<AuthResponse> {
    try {
      console.log('📤 Enviando dados para criar usuário:', employeeData);
      
      const response = await api.post('/employee/create', {
        name: employeeData.name,
        email: employeeData.email,
        role: employeeData.role,
        department: employeeData.department,
        phone: employeeData.phone,
        password: employeeData.password
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

