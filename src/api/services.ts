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

  // Rotas para notificações não lidas
  async getUnread() {
    try {
      const response = await api.get('/notifications/unread/list');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao buscar notificações não lidas:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar notificações não lidas'
      };
    }
  },

  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread/count');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao buscar contagem de notificações não lidas:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar contagem de notificações não lidas'
      };
    }
  },

  // Rotas para marcar como lida
  async markAsRead(id: string) {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao marcar notificação como lida:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao marcar notificação como lida'
      };
    }
  },

  async markMultipleAsRead(ids: string[]) {
    try {
      const response = await api.patch('/notifications/read/multiple', { ids });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao marcar múltiplas notificações como lidas:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao marcar múltiplas notificações como lidas'
      };
    }
  },

  async markAllAsRead() {
    try {
      const response = await api.patch('/notifications/read/all');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao marcar todas as notificações como lidas:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao marcar todas as notificações como lidas'
      };
    }
  },

  // Rotas específicas para monitoramento de estoque
  async verificarEstoqueBaixo() {
    try {
      const response = await api.post('/notifications/verificar-estoque');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao verificar estoque baixo:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao verificar estoque baixo'
      };
    }
  },

  async verificacaoAutomatica() {
    try {
      const response = await api.post('/notifications/verificacao-automatica');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro na verificação automática:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro na verificação automática'
      };
    }
  },

  async limparNotificacoesObsoletas() {
    try {
      const response = await api.delete('/notifications/limpar-obsoletas');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao limpar notificações obsoletas:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao limpar notificações obsoletas'
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
        name: userData.nome?.trim(),
        email: userData.email?.trim().toLowerCase(),
        department: userData.departamento?.trim(),
        position: userData.função?.trim(), // API espera 'position' não 'role'
      };
      
      // Validar campos obrigatórios antes de enviar
      if (!requestData.name || requestData.name.length === 0) {
        throw new Error('Nome é obrigatório');
      }
      if (!requestData.email || requestData.email.length === 0) {
        throw new Error('Email é obrigatório');
      }
      if (!requestData.department || requestData.department.length === 0) {
        throw new Error('Departamento é obrigatório');
      }
      if (!requestData.position || requestData.position.length === 0) {
        throw new Error('Função/Cargo é obrigatório');
      }
      
      // Só incluir senha se foi fornecida
      if (userData.password && userData.password.trim().length > 0) {
        requestData.password = userData.password.trim();
      }
      
      // Só incluir contato se foi fornecido
      if (userData.contacto && userData.contacto.trim().length > 0) {
        requestData.contact = userData.contacto.trim(); // API espera 'contact' não 'phone'
      }
      
      console.log('🔍 Dados finais enviados para API:', requestData);
      console.log('📋 Estrutura dos dados:', {
        name: typeof requestData.name,
        email: typeof requestData.email,
        department: typeof requestData.department,
        position: typeof requestData.position,
        password: requestData.password ? 'definida' : 'não definida',
        contact: requestData.contact ? 'definido' : 'não definido'
      });
      console.log('📐 Validação dos campos:', {
        name: requestData.name ? `✅ "${requestData.name}"` : '❌ vazio',
        email: requestData.email ? `✅ "${requestData.email}"` : '❌ vazio',
        department: requestData.department ? `✅ "${requestData.department}"` : '❌ vazio',
        position: requestData.position ? `✅ "${requestData.position}"` : '❌ vazio'
      });

      let response;
      try {
        // Primeira tentativa com a estrutura atual
        response = await api.post('/users/create', requestData);
      } catch (firstError: any) {
        console.log('❌ Primeira tentativa falhou, tentando estrutura alternativa...');
        console.log('📄 Erro da primeira tentativa:', firstError.response?.data);
        
        // Segunda tentativa com estrutura alternativa
        const alternativeData: any = {
          username: requestData.name,      // Talvez API espere 'username'
          email: requestData.email,
          department: requestData.department,     
          role: requestData.position,       // Mudando para 'role'
        };
        
        if (requestData.password) {
          alternativeData.password = requestData.password;
        }
        if (requestData.contact) {
          alternativeData.contact = requestData.contact;
        }
        
        console.log('🔄 Tentativa alternativa com:', alternativeData);
        try {
          response = await api.post('/users/create', alternativeData);
        } catch (secondError: any) {
          console.log('❌ Segunda tentativa também falhou, tentando terceira estrutura...');
          console.log('� Erro da segunda tentativa:', secondError.response?.data);
          
          // Terceira tentativa com estrutura baseada em employees
          const thirdData: any = {
            name: requestData.name,
            email: requestData.email,
            dept: requestData.department,     // Talvez API espere 'dept'
            position: requestData.position,   // Mantendo position
          };
          
          if (requestData.password) {
            thirdData.password = requestData.password;
          }
          if (requestData.contact) {
            thirdData.phone = requestData.contact;
          }
          
          console.log('🔄 Terceira tentativa com:', thirdData);
          response = await api.post('/users/create', thirdData);
        }
      }
      
      if (response.status === 204 || response.status === 201 || response.status === 200) {
        return { success: true, data: response.data || { message: 'Usuário criado com sucesso' } };
      }
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('💥 Erro ao criar usuário:', error);
      console.error('📊 Status:', error.response?.status);
      console.error('📄 Dados do erro completo:', error.response?.data);
      console.error('📋 Headers da resposta:', error.response?.headers);
      
      // Melhor tratamento de erros da API
      let errorMessage = 'Erro ao criar usuário';
      
      if (error.response) {
        // Erro da API
        console.log('🔍 Verificando estrutura de erro:', error.response.data);
        
        // Verificar se há erros específicos de validação
        if (error.response.data?.errors) {
          const errors = error.response.data.errors;
          const errorMessages = [];
          
          // Extrair mensagens específicas de erro
          for (const field in errors) {
            if (Array.isArray(errors[field])) {
              errorMessages.push(`${field}: ${errors[field].join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${errors[field]}`);
            }
          }
          
          if (errorMessages.length > 0) {
            errorMessage = `Erros de validação:\n${errorMessages.join('\n')}`;
          }
        } else if (error.response.data?.error) {
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
  },

  // Recuperar senha
  async recoverPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('🔌 Fazendo requisição para:', '/auth/forget/');
      console.log('📧 Email enviado:', email);
      
      const response = await api.post('/auth/forget/', {
        email: email
      });
      
      console.log('📨 Resposta recebida:', response.data);
      return { 
        success: true, 
        message: response.data.message || 'Email de recuperação enviado com sucesso!'
      };
    } catch (error: any) {
      console.error('💥 Erro na requisição de recuperação:', error);
      console.error('📊 Status do erro:', error.response?.status);
      console.error('📄 Dados do erro:', error.response?.data);
      
      let errorMessage = 'Erro ao enviar email de recuperação';
      
      // Tratamento específico por código de status HTTP
      switch (error.response?.status) {
        case 400:
          errorMessage = 'Email inválido. Verifique o formato do email.';
          break;
        case 404:
          errorMessage = 'Email não encontrado no sistema.';
          break;
        case 429:
          errorMessage = 'Muitas tentativas de recuperação. Aguarde alguns minutos.';
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
            errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro desconhecido ao recuperar senha.';
          }
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  },

  // Renovar senha com token
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('🔌 Fazendo requisição para:', '/auth/reset-password');
      console.log('🔑 Token enviado:', token.substring(0, 10) + '...');
      
      const response = await api.post('/auth/reset-password', {
        token: token,
        newPassword: newPassword
      });
      
      console.log('📨 Resposta recebida:', response.data);
      return { 
        success: true, 
        message: response.data.message || 'Senha alterada com sucesso!'
      };
    } catch (error: any) {
      console.error('💥 Erro na renovação de senha:', error);
      console.error('📊 Status do erro:', error.response?.status);
      console.error('📄 Dados do erro:', error.response?.data);
      
      let errorMessage = 'Erro ao alterar senha';
      
      // Tratamento específico por código de status HTTP
      switch (error.response?.status) {
        case 400:
          errorMessage = 'Dados inválidos. Verifique o token e a nova senha.';
          break;
        case 401:
          errorMessage = 'Token inválido ou expirado. Solicite uma nova recuperação de senha.';
          break;
        case 404:
          errorMessage = 'Token não encontrado. Verifique se o código está correto.';
          break;
        case 422:
          errorMessage = 'Nova senha não atende aos critérios de segurança.';
          break;
        case 429:
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos.';
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
            errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro desconhecido ao alterar senha.';
          }
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  },

  // Alterar senha do usuário atual
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('🔌 Fazendo requisição para alterar senha:', '/auth/change-password');
      
      const response = await api.post('/auth/change-password', {
        currentPassword: currentPassword,
        newPassword: newPassword
      });
      
      console.log('📨 Resposta recebida:', response.data);
      return { 
        success: true, 
        message: response.data.message || 'Senha alterada com sucesso!'
      };
    } catch (error: any) {
      console.error('💥 Erro ao alterar senha:', error);
      console.error('📊 Status do erro:', error.response?.status);
      console.error('📄 Dados do erro:', error.response?.data);
      
      let errorMessage = 'Erro ao alterar senha';
      
      // Tratamento específico por código de status HTTP
      switch (error.response?.status) {
        case 400:
          errorMessage = 'Dados inválidos. Verifique as senhas informadas.';
          break;
        case 401:
          errorMessage = 'Senha atual incorreta. Verifique e tente novamente.';
          break;
        case 422:
          errorMessage = 'Nova senha não atende aos critérios de segurança (mínimo 8 caracteres).';
          break;
        case 429:
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos.';
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
            errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro desconhecido ao alterar senha.';
          }
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
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

  async replaceProduct(payload: { cotacaoItemId: number; newProductId?: number; url?: string; nomeProduto?: string }): Promise<AuthResponse> {
    try {
      // Encaminha diretamente para a rota do backend que aceita substituição por ID ou URL
      let response;
      if (payload.url) {
        //timeout 2min
        response = await api.put('/cotacoes-itens/replace-product', payload, { timeout: 120000 });  
      }
      else {
        response = await api.put('/cotacoes-itens/replace-product', payload);
      }
      
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
  async getAllJobs() {
    try {
      const response = await api.get('/busca-automatica/jobs');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Erro ao buscar jobs:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar jobs'
      };
    }
  },

  async getActiveJobs() {
    try {
      const response = await api.get('/busca-automatica/jobs/active');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Erro ao buscar jobs ativos:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar jobs ativos'
      };
    }
  },

  async getJobById(jobId: string) {
    try {
      const response = await api.get(`/busca-automatica/job/${jobId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Erro ao buscar detalhes do job:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar detalhes do job'
      };
    }
  },

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

// Serviço de Relatórios
export const relatorioService = {
  async gerarPDF(id: string | number) {
    try {
      const response = await api.post(`/relatorios/gerar/${id}`, {}, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotacao_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao gerar relatório PDF:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao gerar relatório PDF'
      };
    }
  },

  async gerarExcel(id: string | number) {
    try {
      const response = await api.post(`/relatorios/gerar-xlsx/${id}`, {}, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotacao_${id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao gerar relatório Excel:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao gerar relatório Excel'
      };
    }
  },

  async gerarCSV(id: string | number) {
    try {
      const response = await api.post(`/relatorios/gerar-csv/${id}`, {}, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotacao_${id}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao gerar relatório CSV:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao gerar relatório CSV'
      };
    }
  },

  async getPropostaEmail(cotacaoId: number | string): Promise<AuthResponse> {
    try {
      const response = await api.get(`/relatorios/proposta-email/${cotacaoId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Erro ao obter proposta de e-mail:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao obter proposta de e-mail'
      };
    }
  },

  async updatePropostaEmail(cotacaoId: number | string, propostaEmail: string): Promise<AuthResponse> {
    try {
      const response = await api.put(`/relatorios/proposta-email/${cotacaoId}`, { propostaEmail });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Erro ao atualizar proposta de e-mail:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao atualizar proposta de e-mail'
      };
    }
  },

  async gerarPropostaEmailIA(cotacaoId: number | string, emailOriginal: string, promptModificacao: string): Promise<AuthResponse> {
    try {
      const response = await api.post(`/relatorios/proposta-email-ia/${cotacaoId}`, {
        emailOriginal,
        promptModificacao,
      }, { timeout: 60000 });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Erro ao gerar proposta de e-mail via IA:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao gerar proposta de e-mail via IA'
      };
    }
  },

  downloadTextAsFile(filename: string, text: string) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
