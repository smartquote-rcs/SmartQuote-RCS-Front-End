import axios from 'axios';

// Detectar ambiente e configurar URL da API
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE_URL = isDevelopment 
  ? 'https://testsmart-24vt.onrender.com/api'  // Desenvolvimento
  : 'https://testsmart-24vt.onrender.com/api'; // TODO: Atualizar para URL do backend em produção

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Aumentado de 10s para 30s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token nos headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    // Status 204 (No Content) é sucesso mas sem dados
    if (response.status === 204) {
      response.data = { message: 'Operação realizada com sucesso' };
    }
    
    return response;
  },
  (error) => {
    // Melhor tratamento de timeouts
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error(`⏰ Timeout na API [${error.config?.method?.toUpperCase()} ${error.config?.url}]:`, {
        timeout: error.config?.timeout,
        message: error.message,
        url: error.config?.url
      });
    } else {
      console.error(`💥 Erro na API [${error.config?.method?.toUpperCase()} ${error.config?.url}]:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    
    if (error.response?.status === 401) {
      // Token expirado ou inválido - fazer logout completo
      
      // Limpar todos os dados de autenticação
      localStorage.removeItem('auth_token');
      localStorage.removeItem('smartquote_auth');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      
      // Limpar sessionStorage também
      sessionStorage.clear();
      
      // Evitar redirecionamento infinito durante login
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        
        // Emitir evento personalizado para notificar componentes sobre logout
        window.dispatchEvent(new CustomEvent('tokenExpired', { 
          detail: { message: 'Sua sessão expirou. Por favor, faça login novamente.' }
        }));
        
        // Redirecionar para login após pequeno delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      }
    }
    return Promise.reject(error);
  }
);

// Função para cadastrar novo usuário
export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) => {
    try {
    
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao cadastrar usuário:', error.response?.data || error.message);
    throw error;
  }
};

// Função para fazer login
export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    
    const response = await api.post('/auth/login', credentials);
    
    // Salvar token se retornado
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao fazer login:', error.response?.data || error.message);
    throw error;
  }
};
//https://testsmart-24vt.onrender.com/api/
// Função para testar um cadastro rápido (dados de exemplo)
export const createTestUser = async () => {
  const testUser = {
    name: "João Silva",
    email: "joao.silva@teste.com",
    password: "123456",
    role: "user"
  };
  
  return await registerUser(testUser);
};

export default api;
