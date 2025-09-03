// Script de Debug para rastrear criação de fornecedores
console.log('🔍 Debug de Fornecedores Iniciado');

// Interceptar todas as chamadas à API
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options] = args;
  
  // Log de todas as requisições para suppliers
  if (url.includes('/suppliers') || url.includes('/fornecedores')) {
    console.log('🌐 Requisição para Suppliers:', {
      url,
      method: options?.method || 'GET',
      body: options?.body,
      timestamp: new Date().toISOString()
    });
    
    // Se for POST, log do body
    if (options?.method === 'POST' && options?.body) {
      try {
        const body = JSON.parse(options.body);
        if (body.nome && body.nome.includes('RCS')) {
          console.error('🚨 DETECTADO: Criação automática de fornecedor RCS!', {
            body,
            stack: new Error().stack
          });
        }
      } catch (e) {}
    }
  }
  
  return originalFetch.apply(this, args);
};

// Interceptar localStorage para detectar salvamento local
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  if (key.includes('supplier') || key.includes('fornecedor')) {
    console.log('💾 localStorage setItem para suppliers:', {
      key,
      value,
      timestamp: new Date().toISOString()
    });
    
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        const rcsSuppliers = parsed.filter(s => s.nome && s.nome.includes('RCS'));
        if (rcsSuppliers.length > 0) {
          console.warn('🚨 Fornecedor RCS detectado no localStorage:', rcsSuppliers);
        }
      }
    } catch (e) {}
  }
  
  return originalSetItem.apply(this, arguments);
};

// Monitorar intervalos regulares
setInterval(() => {
  const suppliersInStorage = localStorage.getItem('suppliers_backup');
  if (suppliersInStorage) {
    try {
      const suppliers = JSON.parse(suppliersInStorage);
      const rcsCount = suppliers.filter(s => s.nome && s.nome.includes('RCS')).length;
      if (rcsCount > 0) {
        console.log(`📊 Fornecedores RCS no localStorage: ${rcsCount}`);
      }
    } catch (e) {}
  }
}, 5000);

console.log('🔍 Debug configurado. Monitorando criação de fornecedores...');
