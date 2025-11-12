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
  systemName: string;
  setSystemName: (name: string) => void;
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

  // Usuário logado (mínimo necessário para auditoria)
  user: { id: number; name?: string; email?: string } | null;
  setUser: (u: { id: number; name?: string; email?: string } | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

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
  // Usuário logado (placeholder - em integração real substituir pela autenticação)
  const [user, setUser] = useState<{ id: number; name?: string; email?: string } | null>({ id: 1, name: 'Usuário Demo' });
  // Nome do sistema global (sempre da API)
  const [systemName, setSystemName] = useState<string>('');

  // Buscar nome do sistema da API ao montar
  useEffect(() => {
    async function fetchSystemName() {
      try {
        const { sistemaService } = await import('../api/services');
        const result = await sistemaService.getConfig();
        const data = result.data;
        const config = data && data.data ? data.data : null;
        if (config && typeof config.nome_empresa === 'string') {
          setSystemName(config.nome_empresa.trim());
        }
      } catch (error) {
        setSystemName('');
      }
    }
    fetchSystemName();
  }, []);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // Callback para exibir toasts
  // (toastCallback removido - não utilizado)
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
  
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    // Recuperar tema do localStorage ou usar "dark" como padrão
    const savedTheme = localStorage.getItem('theme');
    return {
      notifications: {
        email: true,
        browser: true,
        quotes: true,
        suppliers: false
      },
      language: "pt-PT",
      theme: (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : "dark"
    };
  });

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getFavoriteProducts = () => {
    return products.filter(product => {
      // Garante que id seja string para comparação
      const idStr = typeof product.id === 'string' ? product.id : product.id?.toString();
      return idStr && favorites.includes(idStr);
    });
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
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data: new Date().toISOString(),
      lida: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    
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
      const response = await supplierService.getAll();
      // Garante que suppliers sempre será um array
      const apiSuppliers = response?.data?.data ?? [];
      if (response.success && Array.isArray(apiSuppliers)) {
        setSuppliers(apiSuppliers);
        // Salvar no localStorage como backup
        localStorage.setItem('suppliers_backup', JSON.stringify(apiSuppliers));
      } else {
        // Fallback para localStorage
        const localSuppliers = localStorage.getItem('suppliers_backup');
        if (localSuppliers) {
          const suppliersData = JSON.parse(localSuppliers);
          setSuppliers(suppliersData);
        } else {
          setSuppliers([]);
        }
      }
    } catch (error) {
      console.error('💥 Erro ao carregar fornecedores da API:', error);
      // Fallback para localStorage em caso de erro
      const localSuppliers = localStorage.getItem('suppliers_backup');
      if (localSuppliers) {
        const suppliersData = JSON.parse(localSuppliers);
        setSuppliers(suppliersData);
      } else {
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
      },
      showCurrent: () => {
        return suppliers;
      },
      testAPI: async () => {
        try {
          const response = await supplierService.getAll();
          return response;
        } catch (error) {
          return { success: false, error };
        }
      },
      // Novas funções para debug de notificações - toast removido para evitar toasts automáticos
      testNotification: () => {
        addNotification({
          tipo: 'supplier',
          titulo: 'Teste de Notificação',
          mensagem: 'Esta é uma notificação de teste para verificar o sistema.',
          urgente: false
        });
      },  
      listSuppliers: () => {
        return suppliers;
      },
      help: () => {
        return {
          showCurrent: 'Ver estado atual dos fornecedores',
          loadFromAPI: 'Recarregar da API',
          getLocal: 'Ver dados do localStorage',
          clearLocal: 'Limpar localStorage',
          testAPI: 'Testar conexão com API',
          testNotification: 'Testar sistema de notificações',
          listSuppliers: 'Listar todos os fornecedores'
        };
      }
    };
  }, []);

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    try {
      // Garantir datas válidas (backend não aceita string vazia)
  const now = new Date().toISOString();
      const normalizeDate = (d?: string) => {
        if (!d || d.trim() === '') return now;
        // Se já parecer ISO completo, manter
        if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z?$/.test(d)) return d.endsWith('Z') ? d : d + 'Z';
        // Caso seja uma data parcial, tentar construir ISO
        try { return new Date(d).toISOString(); } catch { return now; }
      };
      const cadastradoEm = supplier.cadastrado_em && supplier.cadastrado_em.trim() !== '' ? normalizeDate(supplier.cadastrado_em) : now;
      const atualizadoEm = supplier.atualizado_em && supplier.atualizado_em.trim() !== '' ? normalizeDate(supplier.atualizado_em) : now;
      // Mapear para os campos esperados pela API
      const payload = {
        nome: supplier.nome,
        contato_email: supplier.contato_email || '',
        contato_telefone: supplier.contato_telefone || '',
        site: supplier.site || '',
        observacoes: supplier.observacoes || '',
        ativo: supplier.ativo ?? true,
        cadastrado_em: cadastradoEm,
        cadastrado_por: supplier.cadastrado_por || 1,
        atualizado_em: atualizadoEm,
        atualizado_por: supplier.atualizado_por || 1
      };
      const response = await supplierService.create(payload);
      
      if (response.success) {
        // Recarregar a lista para pegar o ID correto da API
        await loadSuppliers();
      } else {
        // Se falhar na API, adiciona localmente
        const newSupplier: Supplier = {
          ...supplier,
          id: Date.now() // Usar timestamp como ID temporário
        };
        const updatedSuppliers = [...suppliers, newSupplier];
        setSuppliers(updatedSuppliers);
        // Salvar no localStorage
        localStorage.setItem('suppliers_backup', JSON.stringify(updatedSuppliers));
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
    }
  };

  const deleteSupplier = async (id: number) => {
    try {
      const response = await supplierService.delete(id.toString());
      
      if (response.success) {
        // Recarregar a lista para sincronizar
        await loadSuppliers();
      } else {
        // Se falhar na API, remove localmente
        const updatedSuppliers = suppliers.filter(s => s.id !== id);
        setSuppliers(updatedSuppliers);
        localStorage.setItem('suppliers_backup', JSON.stringify(updatedSuppliers));
      }
    } catch (error) {
      console.error('💥 Erro na API, removendo localmente:', error);
      // Em caso de erro, remove localmente
      const updatedSuppliers = suppliers.filter(s => s.id !== id);
      setSuppliers(updatedSuppliers);
      localStorage.setItem('suppliers_backup', JSON.stringify(updatedSuppliers));
    }
  };

  const updateSupplier = async (supplier: Supplier) => {
    try {
      const supplierId = supplier.id || 0;
      if (!supplierId || supplierId <= 0) {
        const { id, ...rest } = supplier as any;
        // Reusar caminho de criação
        await addSupplier(rest);
        return;
      }
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
        atualizado_por: supplier.atualizado_por,
        rate: supplier.rate
      });
      
      if (response.success) {
        // Recarregar a lista para sincronizar
        await loadSuppliers();
      } else {
        // Se falhar na API, atualiza localmente
        const updatedSuppliers = suppliers.map(s => s.id === supplier.id ? supplier : s);
        setSuppliers(updatedSuppliers);
        localStorage.setItem('suppliers_backup', JSON.stringify(updatedSuppliers));
      }
    } catch (error) {
      console.error('💥 Erro na API, atualizando localmente:', error);
      // Em caso de erro, atualiza localmente
      const updatedSuppliers = suppliers.map(s => s.id === supplier.id ? supplier : s);
      setSuppliers(updatedSuppliers);
      localStorage.setItem('suppliers_backup', JSON.stringify(updatedSuppliers));
    }
  };

  // ============== FUNÇÕES DE PRODUTOS ==============
  
  // Carregar produtos da API
  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await produtoService.getAll();
      if (response.success && response.data) {
        // Extrai sempre o array independentemente do wrapper
        const apiProducts = Array.isArray(response.data) ? response.data : response.data.data || [];
        setProducts(apiProducts);
        // Salvar somente o array no localStorage como backup (evita wrapper antigo reintroduzir registros)
        localStorage.setItem('products_backup', JSON.stringify(apiProducts));
      } else {
        // Fallback para localStorage
        const localProducts = localStorage.getItem('products_backup');
        if (localProducts) {
          const productsData = JSON.parse(localProducts);
          setProducts(productsData);
        } else {  
          setProducts([]);
        }
      }
    } catch (error) {
      console.error('💥 Erro ao carregar produtos da API:', error);
      // Fallback para localStorage em caso de erro
      const localProducts = localStorage.getItem('products_backup');
      if (localProducts) {
        const productsData = JSON.parse(localProducts);
        setProducts(productsData);
      } else {
        setProducts([]);
      }
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const response = await produtoService.create({
        nome: product.nome,
        descricao: product.descricao || '',
        preco: product.preco || 0,
        estoque: product.estoque || 0,
        unidade: product.unidade ?? '',
        cadastrado_por: typeof product.cadastrado_por === 'string' ? parseInt(product.cadastrado_por) : (product.cadastrado_por || 1),
        cadastrado_em: product.cadastrado_em || new Date().toISOString(),
        atualizado_por: typeof product.atualizado_por === 'string' ? parseInt(product.atualizado_por) : (product.atualizado_por || 1),
        atualizado_em: product.atualizado_em || new Date().toISOString(),
        fornecedor_id: typeof product.fornecedorId === 'number' ? product.fornecedorId : 0,
        codigo: product.codigo ?? '',
        modelo: product.modelo ?? '',
        origem: product.origem === 'externo' ? 'externo' : 'local',
      });
      
      if (response.success) {
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
        // Se falhar na API, adiciona localmente
        const newProduct: Product = {
          ...product,
          id: Date.now() // Usar timestamp como ID temporário
        };
        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        // Salvar no localStorage
        localStorage.setItem('products_backup', JSON.stringify(updatedProducts));
        
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
      
      // Adicionar notificação de sucesso local (fallback)
      addNotification({
        tipo: 'system',
        titulo: 'Produto Adicionado (Local)',
        mensagem: `O produto "${product.nome}" foi adicionado localmente. As alterações serão sincronizadas quando a API estiver disponível.`,
        urgente: false
      });
    }
  };

  const deleteProduct = async (id: number, options?: { force?: boolean }) => {
    const prevProducts = products;
    const updatedProductsOptimistic = products.filter(p => p.id !== id);
    setProducts(updatedProductsOptimistic);
    localStorage.setItem('products_backup', JSON.stringify(updatedProductsOptimistic));

    try {
      const response = options?.force
        ? await produtoService.forceDelete(id.toString())
        : await produtoService.delete(id.toString());
      if (response.success) {
        await loadProducts();
      } else {
        setProducts(prevProducts); // rollback
        localStorage.setItem('products_backup', JSON.stringify(prevProducts));
        if (response.error?.includes('vinculado') && !options?.force) {
          return await deleteProduct(id, { force: true });
        } else {
          addNotification({
            tipo: 'system',
            titulo: 'Não foi possível excluir',
            mensagem: response.error || 'Erro ao excluir produto.',
            urgente: false
          });
        }
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao deletar produto, revertendo:', error);
      setProducts(prevProducts); // rollback
      localStorage.setItem('products_backup', JSON.stringify(prevProducts));
      addNotification({
        tipo: 'system',
        titulo: 'Erro ao excluir produto',
        mensagem: 'Falha inesperada na comunicação com a API.',
        urgente: false
      });
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const productId = product.id || 0;
      const response = await produtoService.update(productId.toString(), {
        nome: product.nome,
        descricao: product.descricao || '',
        preco: product.preco || 0,
        estoque: product.estoque || 0,
        unidade: product.unidade ?? '',
        cadastrado_por: typeof product.cadastrado_por === 'string' ? parseInt(product.cadastrado_por) : (product.cadastrado_por || 1),
        cadastrado_em: product.cadastrado_em || new Date().toISOString(),
        atualizado_por: typeof product.atualizado_por === 'string' ? parseInt(product.atualizado_por) : (product.atualizado_por || 1),
        atualizado_em: product.atualizado_em || new Date().toISOString(),
        fornecedorId: product.fornecedorId,
        codigo: product.codigo ?? '',
        modelo: product.modelo ?? '',
        origem: product.origem === 'externo' ? 'externo' : 'local'
      });
      
      if (response.success) {
        await loadProducts();
        
        addNotification({
          tipo: 'system',
          titulo: 'Produto Atualizado',
          mensagem: `O produto "${product.nome}" foi atualizado com sucesso.`,
          urgente: false
        });
      } else {
        const updatedProducts = products.map(p => p.id === product.id ? product : p);
        setProducts(updatedProducts);
        localStorage.setItem('products_backup', JSON.stringify(updatedProducts));
        
        addNotification({
          tipo: 'system',
          titulo: 'Produto Atualizado (Local)',
          mensagem: `O produto "${product.nome}" foi atualizado localmente. As alterações serão sincronizadas quando a API estiver disponível.`,
          urgente: false
        });
      }
    } catch (error) {
      const updatedProducts = products.map(p => p.id === product.id ? product : p);
      setProducts(updatedProducts);
      localStorage.setItem('products_backup', JSON.stringify(updatedProducts));
      
      addNotification({
        tipo: 'system',
        titulo: 'Produto Atualizado (Local)',
        mensagem: `O produto "${product.nome}" foi atualizado localmente. As alterações serão sincronizadas quando a API estiver disponível.`,
        urgente: false
      });
    }
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setUserSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        notifications: {
          ...prev.notifications,
          ...(newSettings.notifications || {})
        }
      };
      
      if (newSettings.theme) {
        localStorage.setItem('theme', newSettings.theme);
      }
      
      return updated;
    });
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
    updateSettings,
    user,
    setUser,
    systemName,
    setSystemName
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
