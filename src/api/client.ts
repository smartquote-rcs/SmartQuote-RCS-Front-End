import axios from 'axios';

// Configuração da API do seu colega (agora em produção)
export const API_BASE_URL = 'http://localhost:2000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
    console.log(`📨 Resposta da API [${response.config.method?.toUpperCase()} ${response.config.url}]:`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    
    // Status 204 (No Content) é sucesso mas sem dados
    if (response.status === 204) {
      response.data = { message: 'Operação realizada com sucesso' };
    }
    
    return response;
  },
  (error) => {
    console.error(`💥 Erro na API [${error.config?.method?.toUpperCase()} ${error.config?.url}]:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Não recarregar a página automaticamente durante login
      // window.location.reload();
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
    console.log('📤 Tentando cadastrar usuário:', { ...userData, password: '***' });
    
    const response = await api.post('/auth/register', userData);
    
    console.log('✅ Usuário cadastrado com sucesso:', response.data);
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
    console.log('📤 Tentando fazer login:', { ...credentials, password: '***' });
    
    const response = await api.post('/auth/login', credentials);
    
    // Salvar token se retornado
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      console.log('🔑 Token salvo no localStorage');
    }
    
    console.log('✅ Login realizado com sucesso:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao fazer login:', error.response?.data || error.message);
    throw error;
  }
};

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
