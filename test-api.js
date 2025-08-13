// Função de teste da API - Execute no console do browser

window.testSupplierAPI = async function() {
  console.log('🧪 Testando API de Fornecedores...');
  
  try {
    // Teste 1: Verificar se API base responde
    console.log('1️⃣ Testando API base...');
    const baseResponse = await fetch('https://testsmart-24vt.onrender.com/api/');
    console.log('API Base Status:', baseResponse.status);
    
    // Teste 2: Verificar endpoint suppliers (GET)
    console.log('2️⃣ Testando GET /suppliers...');
    const getResponse = await fetch('https://testsmart-24vt.onrender.com/api/suppliers');
    console.log('GET Suppliers Status:', getResponse.status);
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ GET Suppliers funcionando! Dados:', data);
    } else {
      console.log('❌ GET Suppliers falhou:', await getResponse.text());
    }
    
    // Teste 3: Verificar endpoint suppliers (POST)
    console.log('3️⃣ Testando POST /suppliers...');
    const testSupplier = {
      nomeEmpresa: "Teste API " + Date.now(),
      observacoes: "Fornecedor de teste criado via console",
      ativo: true,
      categoriaMercado: "Tecnologia",
      localizacao: "Lisboa, Portugal",
      contactos: {
        principal: {
          nome: "João Teste",
          email: "teste@exemplo.pt",
          telefone: "+351 900 000 000",
          cargo: "Diretor"
        }
      },
      rating: 4.5,
      cadastradoPor: 1
    };
    
    const postResponse = await fetch('https://testsmart-24vt.onrender.com/api/suppliers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSupplier)
    });
    
    console.log('POST Suppliers Status:', postResponse.status);
    
    if (postResponse.ok) {
      const result = await postResponse.json();
      console.log('✅ POST Suppliers funcionando! Resultado:', result);
    } else {
      console.log('❌ POST Suppliers falhou:', await postResponse.text());
    }
    
  } catch (error) {
    console.error('💥 Erro geral no teste:', error);
  }
  
  console.log('🏁 Teste concluído. Verifique os logs acima.');
};

// Para executar o teste, digite no console:
// window.testSupplierAPI()

console.log('🔧 Função de teste carregada! Execute: window.testSupplierAPI()');
