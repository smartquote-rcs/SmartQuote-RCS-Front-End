// Teste da API em produção
// Cole este código no console do navegador (F12) para testar

console.log('🚀 Testando API em produção...');

const API_URL = 'https://testsmart-24vt.onrender.com/api';

// Função para testar se a API está online
async function testAPI() {
  try {
    console.log('📡 Testando conexão com a API...');
    
    // Teste 1: Tentar criar um usuário
    console.log('👤 Testando criação de usuário...');
    const signupResponse = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Teste User',
        email: 'teste@exemplo.com',
        password: '123456'
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('✅ Resposta do signup:', signupData);
    
    // Teste 2: Tentar fazer login
    console.log('🔑 Testando login...');
    const loginResponse = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teste@exemplo.com',
        password: '123456'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Resposta do login:', loginData);
    
    // Se login deu certo, testar endpoint protegido
    if (loginData.token) {
      console.log('🔒 Testando endpoint protegido (funcionários)...');
      const employeesResponse = await fetch(`${API_URL}/employee/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      const employeesData = await employeesResponse.json();
      console.log('✅ Resposta dos funcionários:', employeesData);
    }
    
    console.log('🎉 Teste concluído! A API está funcionando.');
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
    
    // Verificar se é erro de CORS
    if (error.message.includes('CORS')) {
      console.log('⚠️  Erro de CORS detectado. A API precisa permitir requisições do seu domínio.');
    }
  }
}

// Executar teste
testAPI();

// Também disponibilizar as funções individualmente para teste manual
window.testSignup = async (username, email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await response.json();
    console.log('Signup result:', data);
    return data;
  } catch (error) {
    console.error('Signup error:', error);
    return { error: error.message };
  }
};

window.testLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    console.log('Login result:', data);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { error: error.message };
  }
};
