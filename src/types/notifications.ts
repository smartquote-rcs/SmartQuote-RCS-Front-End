// Types for Notification System

export interface NotificationData {
  id?: string;
  titulo?: string;
  title?: string;
  mensagem?: string;
  message?: string;
  tipo?: string;
  type?: string;
  categoria?: string;
  category?: string;
  usuario_id?: number;
  user_id?: number;
  lida?: boolean;
  read?: boolean;
  timestamp?: string;
  data?: string;
  createdAt?: string;
  subject?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
  category: string;
  subject?: string;
  rawType?: string;
}

export interface StockNotificationData {
  produto_id?: number;
  limite_minimo?: number;
  fornecedor_id?: number;
}

export interface NotificationServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UnreadCount {
  count: number;
  total: number;
}

export interface StockCheckResult {
  produtos_verificados: number;
  alertas_criados: number;
  produtos_com_estoque_baixo: Array<{
    id: number;
    nome: string;
    estoque_atual: number;
    limite_minimo: number;
    fornecedor?: string;
  }>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: {
    info: number;
    warning: number;
    success: number;
    error: number;
  };
  by_category: Record<string, number>;
}
