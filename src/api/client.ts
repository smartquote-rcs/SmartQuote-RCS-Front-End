import axios from 'axios';

// Configuração da API do seu colega (agora em produção)
const API_BASE_URL = 'http://localhost:2000/api';

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

export default api;
