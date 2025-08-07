import api from './client.js';

// Serviço de Autenticação
export const authService = {
  // Registrar novo usuário
  async signup(userData) {
    try {
      const response = await api.post('/auth/signup', {
        email: userData.email,
        password: userData.password,
        username: userData.name || userData.username
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao criar conta' 
      };
    }
  },

  // Fazer login
  async signin(credentials) {
    try {
      const response = await api.post('/auth/signin', {
        email: credentials.email,
        password: credentials.password
      });
      
      // Salvar token no localStorage
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao fazer login' 
      };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('auth_token');
  },

  // Verificar se está logado
  isLoggedIn() {
    return !!localStorage.getItem('auth_token');
  }
};

// Serviço de Funcionários
export const employeeService = {
  // Listar todos os funcionários
  async getAll() {
    try {
      const response = await api.get('/employee/');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao buscar funcionários' 
      };
    }
  },

  // Criar novo funcionário
  async create(employeeData) {
    try {
      const response = await api.post('/employee/create', {
        name: employeeData.name,
        email: employeeData.email,
        role: employeeData.role
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao criar funcionário' 
      };
    }
  }
};
