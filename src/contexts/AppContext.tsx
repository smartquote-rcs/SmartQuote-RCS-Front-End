import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Supplier, Product } from '../types';
import { supplierService, produtoService } from '../api/services';

// Tipos
interface Notification {
  id: string;
  tipo: 'quote' | 'system' | 'supplier' | 'payment';
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  urgente?: boolean;
}

interface Quote {
  id: string;
  produto: string;
  fornecedor: string;
  valor: string;
  status: 'pending' | 'approved' | 'processing' | 'rejected';
  data: string;
  submittedAt?: string;
}

interface UserSettings {
  notifications: {
    email: boolean;
    browser: boolean;
    quotes: boolean;
    suppliers: boolean;
  };
  language: string;
  theme: string;
}

interface AppContextType {
  // Favoritos
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  getFavoriteProducts: () => Product[];
  
  // Notificações
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'data' | 'lida'>) => void;
  setToastCallback: (callback: (type: 'success' | 'error' | 'info', title: string, message: string) => void) => void;
  
  // Cotações
  quotes: Quote[];
  addQuote: (quote: Omit<Quote, 'id'>) => void;
  
  // Fornecedores
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  loadSuppliers: () => Promise<void>;
  deleteSupplier: (id: number) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  isLoadingSuppliers: boolean;
  
  // Produtos
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  loadProducts: () => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  isLoadingProducts: boolean;
  
  // Configurações
  userSettings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mockNotifications: Notification[] = [
  {
    id: "NOT-001",
    tipo: "quote",
    titulo: "Cotação Aprovada",
    mensagem: "Sua cotação COT-2024-0044 foi aprovada pelo fornecedor PrintMax Industrial",
    data: "2024-01-24 14:30",
    lida: false,
    urgente: true
  },
  {
    id: "NOT-002",
    tipo: "system",
    titulo: "Sistema Atualizado",
    mensagem: "O sistema foi atualizado com novas funcionalidades de IA",
    data: "2024-01-24 10:15",
    lida: false
  },
  {
    id: "NOT-003",
    tipo: "supplier",
    titulo: "Novo Fornecedor",
    mensagem: "EnerTech Solutions adicionou novos produtos ao catálogo",
    data: "2024-01-23 16:45",
    lida: true
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(["PROD-001", "PROD-003"]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // Callback para exibir toasts
  const [toastCallback, setToastCallback] = useState<((type: 'success' | 'error' | 'info', title: string, message: string) => void) | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: "COT-2024-0045",
      produto: "Painel Solar 400W",
      fornecedor: "EnerTech Solutions",
      valor: "€285.00",
      status: "pending",
      data: "24/01/2024",
      submittedAt: "2024-01-24 09:30"
    },
    {
      id: "COT-2024-0044", 
      produto: "Impressora HP PageWide",
      fornecedor: "PrintMax Industrial",
      valor: "€1,850.00",
      status: "approved",
      data: "23/01/2024",
      submittedAt: "2024-01-23 14:15"
    },
    {
      id: "COT-2024-0043",
      produto: "Servidor Dell PowerEdge",
      fornecedor: "TechFlow Innovations", 
      valor: "€2,450.00",
      status: "processing",
      data: "22/01/2024",
      submittedAt: "2024-01-22 11:20"
    }
  ]);
  
  const [userSettings, setUserSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      browser: true,
      quotes: true,
      suppliers: false
    },
    language: "pt-PT",
    theme: "dark"
  });

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getFavoriteProducts = () => {
    return products.filter(product => 
      product.id && favorites.includes(product.id.toString())
    );
  };

  const unreadCount = notifications.filter(n => !n.lida).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, lida: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, lida: true }))
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'data' | 'lida'>) => {
    console.log('🔔 addNotification chamada com:', notification);
    
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data: new Date().toISOString(),
      lida: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    console.log('📝 Notificação adicionada ao estado:', newNotification);
    
    // Toast automático removido - notificações devem aparecer apenas na área de notificações
    // Para mostrar toast manualmente use: window.debugSuppliers.testToast()
  };

  const addQuote = (quote: Omit<Quote, 'id'>) => {
    const newQuote: Quote = {
      ...quote,
      id: `COT-2024-${String(quotes.length + 46).padStart(4, '0')}`
    };
    setQuotes(prev => [newQuote, ...prev]);
  };

  // Carregar fornecedores da API
  const loadSuppliers = async () => {
    setIsLoadingSuppliers(true);
    try {
      console.log('🔄 Carregando fornecedores da API...');
      const response = await supplierService.getAll();
      // Garante que suppliers sempre será um array
      const apiSuppliers = response?.data?.data ?? [];
      if (response.success && Array.isArray(apiSuppliers)) {
        console.log('✅ Fornecedores carregados da API:', apiSuppliers);
        setSuppliers(apiSuppliers);
        // Salvar no localStorage como backup
        localStorage.setItem('suppliers_backup', JSON.stringify(apiSuppliers));
      } else {
        console.log('⚠️ API não retornou dados, tentando localStorage...');
        // Fallback para localStorage
        const localSuppliers = localStorage.getItem('suppliers_backup');
        if (localSuppliers) {
          const suppliersData = JSON.parse(localSuppliers);
          console.log('✅ Fornecedores carregados do localStorage:', suppliersData);
          setSuppliers(suppliersData);
        } else {
          console.log('📝 Nenhum dado encontrado, iniciando com lista vazia');
          setSuppliers([]);
        }
      }
    } catch (error) {
      console.error('💥 Erro ao carregar fornecedores da API:', error);
      // Fallback para localStorage em caso de erro
      const localSuppliers = localStorage.getItem('suppliers_backup');
      if (localSuppliers) {
        const suppliersData = JSON.parse(localSuppliers);
        console.log('✅ Fallback: Fornecedores carregados do localStorage:', suppliersData);
        setSuppliers(suppliersData);
      } else {
        console.log('📝 Nenhum backup encontrado, iniciando com lista vazia');
        setSuppliers([]);
      }
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  // Carregar fornecedores e produtos ao inicializar
  useEffect(() => {
    loadSuppliers();
    loadProducts();
    
    // Adicionar função de debug ao window para facilitar testes
    (window as any).debugSuppliers = {
      loadFromAPI: loadSuppliers,
      getLocal: () => {
        const local = localStorage.getItem('suppliers_backup');
        return local ? JSON.parse(local) : null;
      },
      clearLocal: () => {
        localStorage.removeItem('suppliers_backup');
        console.log('🗑️ localStorage limpo');
      },
      showCurrent: () => {
        console.log('📊 Estado atual dos fornecedores:', suppliers);
      },
      testAPI: async () => {
        try {
          const response = await supplierService.getAll();
          console.log('🧪 Teste API:', response);
          return response;
        } catch (error) {
          console.error('🧪 Erro no teste API:', error);
          return { success: false, error };
        }
      },
      // Novas funções para debug de notificações - toast removido para evitar toasts automáticos
      testNotification: () => {
        console.log('🧪 Testando notificação...');
        addNotification({
          tipo: 'supplier',
          titulo: 'Teste de Notificação',
          mensagem: 'Esta é uma notificação de teste para verificar o sistema.',
          urgente: false
        });
        console.log('✅ Notificação de teste adicionada');
      },
      /*
      testToast: () => {
        console.log('🧪 Testando toast...');
        console.log('📞 toastCallback disponível:', !!toastCallback);
        if (toastCallback) {
          toastCallback('success', 'Teste de Toast', 'Este é um toast de teste para verificar o sistema.');
          console.log('✅ Toast de teste disparado');
        } else {
          console.log('❌ Toast callback não está disponível');
        }
      },
      getToastCallback: () => {
        console.log('📞 Estado do toastCallback:', !!toastCallback);
        return !!toastCallback;
      },
      */
      listSuppliers: () => {
        console.log('📋 Lista de fornecedores:', suppliers);
        return suppliers;
      },
      help: () => {
        console.log('🔧 Ferramentas de Debug Disponíveis:');
        console.log('  📊 window.debugSuppliers.showCurrent() - Ver estado atual dos fornecedores');
        console.log('  🔄 window.debugSuppliers.loadFromAPI() - Recarregar da API');
        console.log('  💾 window.debugSuppliers.getLocal() - Ver dados do localStorage');
        console.log('  🗑️ window.debugSuppliers.clearLocal() - Limpar localStorage');
        console.log('  🧪 window.debugSuppliers.testAPI() - Testar conexão com API');
        console.log('  🔔 window.debugSuppliers.testNotification() - Testar sistema de notificações');
        console.log('  🍞 window.debugSuppliers.testToast() - Testar sistema de toast');
        console.log('  📞 window.debugSuppliers.getToastCallback() - Verificar se toast callback está registrado');
        console.log('  📋 window.debugSuppliers.listSuppliers() - Listar todos os fornecedores');
        console.log('  ❓ window.debugSuppliers.help() - Mostrar esta ajuda');
      }
    };
    
    console.log('🔧 Debug tools disponíveis em window.debugSuppliers:');
    console.log('  - window.debugSuppliers.help() // Mostrar todas as ferramentas disponíveis');
    // console.log('  - window.debugSuppliers.testToast() // Testar sistema de toast');
    // console.log('  - window.debugSuppliers.testNotification() // Testar notificações');
    // console.log('  - window.debugSuppliers.getToastCallback() // Verificar callback de toast');
  }, []);

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    try {
      console.log('📤 Tentando salvar fornecedor na API...', supplier);
      // Mapear para os campos esperados pela API
      const response = await supplierService.create({
        nome: supplier.nome,
        contato_email: supplier.contato_email,
        contato_telefone: supplier.contato_telefone,
        site: supplier.site,
        observacoes: supplier.observacoes,
        ativo: supplier.ativo,
        cadastrado_em: supplier.cadastrado_em,
        cadastrado_por: supplier.cadastrado_por,
        atualizado_em: supplier.atualizado_em,
        atualizado_por: supplier.atualizado_por
      });
      
      if (response.success) {
        console.log('✅ Fornecedor salvo na API, recarregando lista...');
        // Recarregar a lista para pegar o ID correto da API
        await loadSuppliers();
      } else {
        console.log('⚠️ API falhou, salvando localmente...', response.error);
        // Se falhar na API, adiciona localmente
        const newSupplier: Supplier = {
          ...supplier,
          id: Date.now() // Usar timestamp como ID temporário
        };
        const updatedSuppliers = [...suppliers, newSupplier];
        setSuppliers(updatedSuppliers);
        // Salvar no localStorage
        localStorage.setItem('suppliers_backup', JSON.stringify(updatedSuppliers));
        console.log('✅ Fornecedor salvo localmente:', newSupplier);
      }
    } catch (error) {
      console.error('💥 Erro na API, salvando localmente:', error);
      // Em caso de erro, adiciona localmente
      const newSupplier: Supplier = {
        ...supplier,
        id: Date.now()
      };
      const updatedSuppliers = [...suppliers, newSupplier];
      setSuppliers(updatedSuppliers);
      // Salvar no localStorage
      localStorage.setItem('suppliers_backup', JSON.stringify(updatedSuppliers));
      console.log('✅ Fornecedor salvo localmente (fallback):', newSupplier);
    }
  };

  const deleteSupplier = async (id: number) => {
    try {
      console.log('📤 Tentando deletar fornecedor da API...', id);
      const response = await supplierService.delete(id.toString());
      
      if (response.success) {
        console.log('✅ Fornecedor deletado da API, recarregando lista...');
        // Recarregar a lista para sincronizar
        await loadSuppliers();
      } else {
        console.log('⚠️ API falhou, removendo localmente...', response.error);
        // Se falhar na API, remove localmente
        const updatedSuppliers = suppliers.filter(s => s.id !== id);
        setSuppliers(updatedSuppliers);
        localStorage.setItem('suppliers_backup', JSON.stringify(updatedSuppliers));
        console.log('✅ Fornecedor removido localmente');
      }
    } catch (error) {
      console.error('💥 Erro na API, removendo localmente:', error);
      // Em caso de erro, remove localmente
      const updatedSuppliers = suppliers.filter(s => s.id !== id);
      setSuppliers(updatedSuppliers);
      localStorage.setItem('suppliers_backup', JSON.stringify(updatedSuppliers));
      console.log('✅ Fornecedor removido localmente (fallback)');
    }
  };

  const updateSupplier = async (supplier: Supplier) => {
    try {
      console.log('📤 Tentando atualizar fornecedor na API...', supplier);
      const supplierId = supplier.id || 0;
      const response = await supplierService.update(supplierId.toString(), {
        nome: supplier.nome,
        contato_email: supplier.contato_email,
        contato_telefone: supplier.contato_telefone,
        site: supplier.site,
        observacoes: supplier.observacoes,
        ativo: supplier.ativo,
        cadastrado_em: supplier.cadastrado_em,
        cadastrado_por: supplier.cadastrado_por,
        atualizado_em: supplier.atualizado_em,
        atualizado_por: supplier.atualizado_por
      });
      
      if (response.success) {
        console.log('✅ Fornecedor atualizado na API, recarregando lista...');
        // Recarregar a lista para sincronizar
        await loadSuppliers();
      } else {
        console.log('⚠️ API falhou, atualizando localmente...', response.error);
        // Se falhar na API, atualiza localmente
        const updatedSuppliers = suppliers.map(s => s.id === supplier.id ? supplier : s);
        setSuppliers(updatedSuppliers);
        localStorage.setItem('suppliers_backup', JSON.stringify(updatedSuppliers));
        console.log('✅ Fornecedor atualizado localmente');
      }
    } catch (error) {
      console.error('💥 Erro na API, atualizando localmente:', error);
      // Em caso de erro, atualiza localmente
      const updatedSuppliers = suppliers.map(s => s.id === supplier.id ? supplier : s);
      setSuppliers(updatedSuppliers);
      localStorage.setItem('suppliers_backup', JSON.stringify(updatedSuppliers));
      console.log('✅ Fornecedor atualizado localmente (fallback)');
    }
  };

  // ============== FUNÇÕES DE PRODUTOS ==============
  
  // Carregar produtos da API
  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      console.log('🔄 Carregando produtos da API...');
      const response = await produtoService.getAll();
      if (response.success && response.data) {
    console.log('✅ Produtos carregados da API:', response.data);
    // Garante que products sempre será um array
    setProducts(Array.isArray(response.data) ? response.data : response.data.data || []);
        // Salvar no localStorage como backup
        localStorage.setItem('products_backup', JSON.stringify(response.data));
      } else {
        console.log('⚠️ API não retornou dados, tentando localStorage...');
        // Fallback para localStorage
        const localProducts = localStorage.getItem('products_backup');
        if (localProducts) {
          const productsData = JSON.parse(localProducts);
          console.log('✅ Produtos carregados do localStorage:', productsData);
          setProducts(productsData);
        } else {
          console.log('📝 Nenhum dado encontrado, iniciando com lista vazia');
          setProducts([]);
        }
      }
    } catch (error) {
      console.error('💥 Erro ao carregar produtos da API:', error);
      // Fallback para localStorage em caso de erro
      const localProducts = localStorage.getItem('products_backup');
      if (localProducts) {
        const productsData = JSON.parse(localProducts);
        console.log('✅ Fallback: Produtos carregados do localStorage:', productsData);
        setProducts(productsData);
      } else {
        console.log('📝 Nenhum backup encontrado, iniciando com lista vazia');
        setProducts([]);
      }
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      console.log('📤 Tentando salvar produto na API...', product);
      // Mapear para os campos esperados pela API
      const response = await produtoService.create({
        nome: product.nome,
        descricao: product.descricao,
        preco: product.preco,
        estoque: product.estoque,
        unidade: product.unidade,
        cadastrado_por: product.cadastrado_por,
        cadastrado_em: product.cadastrado_em,
        atualizado_por: product.atualizado_por,
        atualizado_em: product.atualizado_em,
        fornecedorId: product.fornecedorId,
        codigo: product.codigo,
        modelo: product.modelo,
        origem: product.origem,
        m: product.m
      });
      
      if (response.success) {
        console.log('✅ Produto salvo na API, recarregando lista...');
        // Recarregar a lista para pegar o ID correto da API
        await loadProducts();
        
        // Adicionar notificação de sucesso
        addNotification({
          tipo: 'system',
          titulo: 'Produto Adicionado',
          mensagem: `O produto "${product.nome}" foi adicionado com sucesso.`,
          urgente: false
        });
      } else {
        console.log('⚠️ API falhou, salvando localmente...', response.error);
        // Se falhar na API, adiciona localmente
        const newProduct: Product = {
          ...product,
          id: Date.now() // Usar timestamp como ID temporário
        };
        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        // Salvar no localStorage
        localStorage.setItem('products_backup', JSON.stringify(updatedProducts));
        console.log('✅ Produto salvo localmente:', newProduct);
        
        // Adicionar notificação de sucesso local
        addNotification({
          tipo: 'system',
          titulo: 'Produto Adicionado (Local)',
          mensagem: `O produto "${product.nome}" foi adicionado localmente. As alterações serão sincronizadas quando a API estiver disponível.`,
          urgente: false
        });
      }
    } catch (error) {
      console.error('💥 Erro na API, salvando localmente:', error);
      // Em caso de erro, adiciona localmente
      const newProduct: Product = {
        ...product,
        id: Date.now()
      };
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      // Salvar no localStorage
      localStorage.setItem('products_backup', JSON.stringify(updatedProducts));
      console.log('✅ Produto salvo localmente (fallback):', newProduct);
      
      // Adicionar notificação de sucesso local (fallback)
      addNotification({
        tipo: 'system',
        titulo: 'Produto Adicionado (Local)',
        mensagem: `O produto "${product.nome}" foi adicionado localmente. As alterações serão sincronizadas quando a API estiver disponível.`,
        urgente: false
      });
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      console.log('📤 Tentando deletar produto da API...', id);
      const response = await produtoService.delete(id.toString());
      
      if (response.success) {
        console.log('✅ Produto deletado da API, recarregando lista...');
        // Recarregar a lista para sincronizar
        await loadProducts();
      } else {
        console.log('⚠️ API falhou, removendo localmente...', response.error);
        // Se falhar na API, remove localmente
        const updatedProducts = products.filter(p => p.id !== id);
        setProducts(updatedProducts);
        localStorage.setItem('products_backup', JSON.stringify(updatedProducts));
        console.log('✅ Produto removido localmente');
      }
    } catch (error) {
      console.error('💥 Erro na API, removendo localmente:', error);
      // Em caso de erro, remove localmente
      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem('products_backup', JSON.stringify(updatedProducts));
      console.log('✅ Produto removido localmente (fallback)');
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      console.log('📤 Tentando atualizar produto na API...', product);
      const productId = product.id || 0;
      const response = await produtoService.update(productId.toString(), {
        nome: product.nome,
        descricao: product.descricao,
        preco: product.preco,
        estoque: product.estoque,
        unidade: product.unidade,
        cadastrado_por: product.cadastrado_por,
        cadastrado_em: product.cadastrado_em,
        atualizado_por: product.atualizado_por,
        atualizado_em: product.atualizado_em,
        fornecedorId: product.fornecedorId,
        codigo: product.codigo,
        modelo: product.modelo,
        origem: product.origem,
        m: product.m
      });
      
      if (response.success) {
        console.log('✅ Produto atualizado na API, recarregando lista...');
        // Recarregar a lista para sincronizar
        await loadProducts();
        
        // Adicionar notificação de sucesso
        addNotification({
          tipo: 'system',
          titulo: 'Produto Atualizado',
          mensagem: `O produto "${product.nome}" foi atualizado com sucesso.`,
          urgente: false
        });
      } else {
        console.log('⚠️ API falhou, atualizando localmente...', response.error);
        // Se falhar na API, atualiza localmente
        const updatedProducts = products.map(p => p.id === product.id ? product : p);
        setProducts(updatedProducts);
        localStorage.setItem('products_backup', JSON.stringify(updatedProducts));
        console.log('✅ Produto atualizado localmente');
        
        // Adicionar notificação de sucesso local
        addNotification({
          tipo: 'system',
          titulo: 'Produto Atualizado (Local)',
          mensagem: `O produto "${product.nome}" foi atualizado localmente. As alterações serão sincronizadas quando a API estiver disponível.`,
          urgente: false
        });
      }
    } catch (error) {
      console.error('💥 Erro na API, atualizando localmente:', error);
      // Em caso de erro, atualiza localmente
      const updatedProducts = products.map(p => p.id === product.id ? product : p);
      setProducts(updatedProducts);
      localStorage.setItem('products_backup', JSON.stringify(updatedProducts));
      console.log('✅ Produto atualizado localmente (fallback)');
      
      // Adicionar notificação de sucesso local (fallback)
      addNotification({
        tipo: 'system',
        titulo: 'Produto Atualizado (Local)',
        mensagem: `O produto "${product.nome}" foi atualizado localmente. As alterações serão sincronizadas quando a API estiver disponível.`,
        urgente: false
      });
    }
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setUserSettings(prev => ({
      ...prev,
      ...newSettings,
      notifications: {
        ...prev.notifications,
        ...(newSettings.notifications || {})
      }
    }));
  };

  const value: AppContextType = {
    favorites,
    toggleFavorite,
    getFavoriteProducts,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    setToastCallback,
    quotes,
    addQuote,
    suppliers,
    addSupplier,
    loadSuppliers,
    deleteSupplier,
    updateSupplier,
    isLoadingSuppliers,
    products,
    addProduct,
    loadProducts,
    deleteProduct,
    updateProduct,
    isLoadingProducts,
    userSettings,
    updateSettings
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}
