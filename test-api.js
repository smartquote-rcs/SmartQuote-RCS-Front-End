// Script de teste da API
console.log('🔍 Testando conexão com a API...');

const testAPI = async () => {
  try {
    const response = await fetch('https://testsmart-24vt.onrender.com/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    });

    console.log('📡 Status:', response.status);
    console.log('📊 Headers:', response.headers);
    
    const data = await response.json();
    console.log('📄 Dados:', data);
    
  } catch (error) {
    console.error('💥 Erro:', error);
  }
};

testAPI();
