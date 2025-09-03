// Script para gerenciar o fornecedor RCS
console.log('🔧 Gerenciador de Fornecedor RCS');

// Função para listar todos os fornecedores
async function listarFornecedores() {
  try {
    const { supplierService } = await import('./src/api/services');
    const response = await supplierService.getAll();
    
    if (response.success) {
      const fornecedores = Array.isArray(response.data) ? response.data : response.data?.data || [];
      console.log('📋 Fornecedores encontrados:', fornecedores);
      
      // Filtrar fornecedores com "RCS" no nome
      const rcsSuppliers = fornecedores.filter(f => 
        f.nome && f.nome.toLowerCase().includes('rcs')
      );
      
      console.log('🎯 Fornecedores RCS encontrados:', rcsSuppliers);
      return rcsSuppliers;
    } else {
      console.error('❌ Erro ao buscar fornecedores:', response.error);
      return [];
    }
  } catch (error) {
    console.error('💥 Erro na busca:', error);
    return [];
  }
}

// Função para remover fornecedor RCS
async function removerFornecedorRCS(id) {
  try {
    const { supplierService } = await import('./src/api/services');
    const response = await supplierService.delete(id);
    
    if (response.success) {
      console.log('✅ Fornecedor RCS removido com sucesso!');
      return true;
    } else {
      console.error('❌ Erro ao remover fornecedor:', response.error);
      return false;
    }
  } catch (error) {
    console.error('💥 Erro na remoção:', error);
    return false;
  }
}

// Função para limpar localStorage
function limparLocalStorage() {
  localStorage.removeItem('suppliers_backup');
  localStorage.removeItem('smartquote_suppliers');
  console.log('🗑️ localStorage limpo!');
}

// Adicionar funções ao window para uso no console
window.gerenciarRCS = {
  listar: listarFornecedores,
  remover: removerFornecedorRCS,
  limparLocal: limparLocalStorage,
  
  // Função combinada para remover todos os RCS
  removerTodosRCS: async function() {
    console.log('🚀 Iniciando remoção de todos os fornecedores RCS...');
    const rcsSuppliers = await listarFornecedores();
    
    if (rcsSuppliers.length === 0) {
      console.log('✅ Nenhum fornecedor RCS encontrado!');
      return;
    }
    
    for (const supplier of rcsSuppliers) {
      console.log(`🗑️ Removendo fornecedor: ${supplier.nome} (ID: ${supplier.id})`);
      await removerFornecedorRCS(supplier.id);
    }
    
    // Limpar também o localStorage
    limparLocalStorage();
    
    console.log('✅ Processo concluído! Recarregue a página.');
  }
};

console.log('🔧 Gerenciador carregado! Use:');
console.log('- gerenciarRCS.listar() - para ver todos os fornecedores RCS');
console.log('- gerenciarRCS.remover(id) - para remover um fornecedor específico');
console.log('- gerenciarRCS.removerTodosRCS() - para remover todos os RCS');
console.log('- gerenciarRCS.limparLocal() - para limpar localStorage');
