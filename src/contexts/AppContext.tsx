import { createContext, useContext, useState, ReactNode } from 'react';

// Tipos
interface Product {
  id: string;
  nome: string;
  categoria: string;
  fornecedor: string;
  preco: string;
  precoOriginal?: string;
  avaliacao: number;
  avaliacoes: number;
  descricao: string;
  especificacoes: string[];
  disponibilidade: string;
  prazoEntrega: string;
  imagem: string;
  desconto: number;
  popular: boolean;
}

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
  
  // Cotações
  quotes: Quote[];
  addQuote: (quote: Omit<Quote, 'id'>) => void;
  
  // Configurações
  userSettings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Dados mockados
const mockProducts: Product[] = [
  {
    id: "PROD-001",
    nome: "Painel Solar 400W Monocristalino",
    categoria: "Energia Solar",
    fornecedor: "EnerTech Solutions",
    preco: "€285.00",
    precoOriginal: "€320.00",
    avaliacao: 4.8,
    avaliacoes: 156,
    descricao: "Painel solar de alta eficiência com tecnologia monocristalina, ideal para instalações residenciais e comerciais.",
    especificacoes: ["Potência: 400W", "Eficiência: 20.9%", "Garantia: 25 anos", "Dimensões: 2008×1002×35mm"],
    disponibilidade: "Em stock",
    prazoEntrega: "3-5 dias úteis",
    imagem: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
    desconto: 11,
    popular: true
  },
  {
    id: "PROD-002", 
    nome: "Servidor Dell PowerEdge R450",
    categoria: "Infraestrutura TI",
    fornecedor: "TechFlow Innovations",
    preco: "€2,450.00",
    avaliacao: 4.6,
    avaliacoes: 89,
    descricao: "Servidor rack 1U para aplicações empresariais críticas com processadores Intel Xeon de última geração.",
    especificacoes: ["CPU: Intel Xeon Silver 4314", "RAM: 32GB DDR4", "Storage: 2x 480GB SSD", "Garantia: 3 anos"],
    disponibilidade: "Sob consulta",
    prazoEntrega: "7-10 dias úteis",
    imagem: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
    desconto: 0,
    popular: false
  },
  {
    id: "PROD-003",
    nome: "Impressora Industrial HP PageWide",
    categoria: "Equipamento de Impressão",
    fornecedor: "PrintMax Industrial",
    preco: "€1,850.00",
    precoOriginal: "€2,100.00",
    avaliacao: 4.2,
    avaliacoes: 234,
    descricao: "Impressora industrial de alto volume com tecnologia PageWide para impressão rápida e eficiente.",
    especificacoes: ["Velocidade: 75 ppm", "Resolução: 1200 dpi", "Capacidade: 4,600 folhas", "Conectividade: Wi-Fi, Ethernet"],
    disponibilidade: "Em stock",
    prazoEntrega: "2-4 dias úteis",
    imagem: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=300&fit=crop",
    desconto: 12,
    popular: true
  }
];

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
    return mockProducts.filter(product => favorites.includes(product.id));
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

  const addQuote = (quote: Omit<Quote, 'id'>) => {
    const newQuote: Quote = {
      ...quote,
      id: `COT-2024-${String(quotes.length + 46).padStart(4, '0')}`
    };
    setQuotes(prev => [newQuote, ...prev]);
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
    quotes,
    addQuote,
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
