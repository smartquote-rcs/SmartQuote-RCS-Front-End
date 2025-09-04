

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Trash2,
  Check,
  Search,
  RefreshCw,
  // ...
} from 'lucide-react';

// ...existing code...

interface Notification {
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

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    case 'error':
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    default:
      return <Info className="w-5 h-5 text-blue-400" />;
  }
};

const getNotificationBadge = (type: string) => {
  switch (type) {
    case 'success':
      return <Badge className="bg-green-600 text-white">Sucesso</Badge>;
    case 'warning':
      return <Badge className="bg-yellow-600 text-white">Aviso</Badge>;
    case 'error':
      return <Badge className="bg-red-600 text-white">Erro</Badge>;
    default:
      return <Badge className="bg-blue-600 text-white">Info</Badge>;
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins}m atrás`;
  } else if (diffHours < 24) {
    return `${diffHours}h atrás`;
  } else if (diffDays < 7) {
    return `${diffDays}d atrás`;
  } else {
    return date.toLocaleDateString('pt-PT');
  }
};

export function NotificationsPage() {
  // Toast notification type
  interface ToastNotification {
    id: string;
    type: "success" | "error" | "info";
    title: string;
    message: string;
    duration?: number;
  }
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const showToast = (
    type: "success" | "error" | "info",
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString();
    const newToast: ToastNotification = { id, type, title, message, duration };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  };
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isMarkAllReadDialogOpen, setIsMarkAllReadDialogOpen] = useState(false);
  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);
  const [isStockCheckDialogOpen, setIsStockCheckDialogOpen] = useState(false);
  const [isClearObsoleteDialogOpen, setIsClearObsoleteDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCountFromAPI, setUnreadCountFromAPI] = useState<number | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // IDs das notificações lidas salvos no localStorage
  const LOCAL_KEY = 'readNotifications';
  const getReadIds = () => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    } catch {
      return [];
    }
  };
  const setReadIds = (ids: string[]) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
  };

  useEffect(() => {
    fetchNotifications();
    
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  // Filtros removidos, só pesquisa
  const [searchTerm, setSearchTerm] = useState<string>('');

  const unreadCount = unreadCountFromAPI ?? notifications.filter((n: Notification) => !n.read).length;
  const filteredNotifications = notifications.filter((notification: Notification) => {
    const searchMatch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.category && notification.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return searchMatch;
  });

  const markAsRead = async (id: string) => {
    try {
      const { notificationService } = await import('../../api/services');
      const response = await notificationService.markAsRead(id);
      
      if (response.success) {
        setNotifications((prev: Notification[]) => {
          const updated = prev.map((n: Notification) => n.id === id ? { ...n, read: true } : n);
          // Atualiza localStorage
          const readIds = Array.from(new Set([...(getReadIds()), id]));
          setReadIds(readIds);
          return updated;
        });
        showToast('success', 'Notificação marcada', 'A notificação foi marcada como lida com sucesso.');
      } else {
        showToast('error', 'Erro', response.error || 'Erro ao marcar como lida.');
      }
    } catch (error) {
      // Fallback para localStorage se a API falhar
      setNotifications((prev: Notification[]) => {
        const updated = prev.map((n: Notification) => n.id === id ? { ...n, read: true } : n);
        const readIds = Array.from(new Set([...(getReadIds()), id]));
        setReadIds(readIds);
        return updated;
      });
      showToast('info', 'Marcada localmente', 'Notificação marcada como lida localmente.');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { notificationService } = await import('../../api/services');
      const response = await notificationService.markAllAsRead();
      
      if (response.success) {
        setNotifications((prev: Notification[]) => {
          const allIds = prev.map((n: Notification) => n.id);
          setReadIds(Array.from(new Set([...(getReadIds()), ...allIds])));
          return prev.map((n: Notification) => ({ ...n, read: true }));
        });
        showToast('success', 'Concluído com sucesso', 'Todas as notificações foram marcadas como lidas.');
      } else {
        showToast('error', 'Erro na operação', response.error || 'Não foi possível marcar todas as notificações como lidas.');
      }
    } catch (error) {
      // Fallback para localStorage se a API falhar
      setNotifications((prev: Notification[]) => {
        const allIds = prev.map((n: Notification) => n.id);
        setReadIds(Array.from(new Set([...(getReadIds()), ...allIds])));
        return prev.map((n: Notification) => ({ ...n, read: true }));
      });
      showToast('info', 'Operação local', 'Todas as notificações foram marcadas como lidas localmente.');
    }
  };

  // Funções para abrir diálogos de confirmação
  const handleMarkAllReadClick = () => {
    if (unreadCount === 0) {
      showToast('info', 'Nenhuma ação necessária', 'Todas as notificações já estão marcadas como lidas.');
      return;
    }
    setIsMarkAllReadDialogOpen(true);
  };

  const handleClearAllClick = () => {
    if (notifications.length === 0) {
      showToast('info', 'Nenhuma ação necessária', 'Não há notificações para eliminar.');
      return;
    }
    setIsClearAllDialogOpen(true);
  };

  const handleStockCheckClick = () => {
    setIsStockCheckDialogOpen(true);
  };

  const handleClearObsoleteClick = () => {
    setIsClearObsoleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedNotifications.length === 0) {
      showToast('info', 'Seleção necessária', 'Selecione pelo menos uma notificação para eliminar.');
      return;
    }
    setIsBulkDeleteDialogOpen(true);
  };

  // Funções para executar as ações após confirmação
  const confirmMarkAllAsRead = async () => {
    setIsMarkAllReadDialogOpen(false);
    await markAllAsRead();
  };

  const handleDeleteClick = (notification: Notification) => {
    setNotificationToDelete(notification);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return;
    try {
      const { notificationService } = await import('../../api/services');
      await notificationService.delete(notificationToDelete.id);
      setNotifications((prev: Notification[]) => prev.filter((n: Notification) => n.id !== notificationToDelete.id));
      // Remove do localStorage se estava marcada como lida
      const readIds = getReadIds().filter((id: string) => id !== notificationToDelete.id);
      setReadIds(readIds);
      showToast('success', 'Notificação eliminada', 'A notificação foi eliminada com sucesso.');
    } catch (e) {
      showToast('error', 'Erro ao eliminar', 'Não foi possível eliminar a notificação. Tente novamente.');
    } finally {
      setIsDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  };

  const clearAllRead = async () => {
    try {
      const { notificationService } = await import('../../api/services');
      await notificationService.deleteAll();
      setNotifications([]);
      setReadIds([]);
      showToast('success', 'Operação concluída', 'Todas as notificações foram eliminadas com sucesso.');
    } catch (e) {
      showToast('error', 'Erro na operação', 'Não foi possível eliminar as notificações. Tente novamente.');
    }
  };

  const confirmClearAll = async () => {
    setIsClearAllDialogOpen(false);
    await clearAllRead();
  };

  const verificarEstoque = async () => {
    try {
      const { notificationService } = await import('../../api/services');
      const response = await notificationService.verificarEstoqueBaixo();
      
      if (response.success) {
        showToast('success', 'Verificação concluída', 'A verificação de estoque baixo foi executada. Novas notificações podem ter sido geradas.');
        // Recarregar notificações para mostrar as novas
        fetchNotifications();
      } else {
        showToast('error', 'Erro na verificação', response.error || 'Não foi possível executar a verificação de estoque.');
      }
    } catch (error) {
      showToast('error', 'Erro na verificação', 'Ocorreu um erro ao verificar o estoque. Verifique a conexão e tente novamente.');
    }
  };

  const confirmStockCheck = async () => {
    setIsStockCheckDialogOpen(false);
    await verificarEstoque();
  };

  const limparObsoletas = async () => {
    try {
      const { notificationService } = await import('../../api/services');
      const response = await notificationService.limparNotificacoesObsoletas();
      
      if (response.success) {
        showToast('success', 'Limpeza concluída', 'As notificações obsoletas foram removidas com sucesso.');
        // Recarregar notificações
        fetchNotifications();
      } else {
        showToast('error', 'Erro na limpeza', response.error || 'Não foi possível remover as notificações obsoletas.');
      }
    } catch (error) {
      showToast('error', 'Erro na limpeza', 'Ocorreu um erro ao limpar as notificações. Tente novamente.');
    }
  };

  const confirmClearObsolete = async () => {
    setIsClearObsoleteDialogOpen(false);
    await limparObsoletas();
  };

  // Funções para seleção múltipla
  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const markSelectedAsRead = async () => {
    if (selectedNotifications.length === 0) {
      showToast('info', 'Seleção necessária', 'Selecione pelo menos uma notificação para marcar como lida.');
      return;
    }

    try {
      const { notificationService } = await import('../../api/services');
      const response = await notificationService.markMultipleAsRead(selectedNotifications);
      
      if (response.success) {
        setNotifications((prev: Notification[]) => {
          const updated = prev.map((n: Notification) => 
            selectedNotifications.includes(n.id) ? { ...n, read: true } : n
          );
          // Atualiza localStorage
          const readIds = Array.from(new Set([...(getReadIds()), ...selectedNotifications]));
          setReadIds(readIds);
          return updated;
        });
        setSelectedNotifications([]);
        showToast('success', 'Operação concluída', `${selectedNotifications.length} notificação(ões) marcada(s) como lida(s).`);
      } else {
        showToast('error', 'Erro na operação', response.error || 'Não foi possível marcar as notificações como lidas.');
      }
    } catch (error) {
      showToast('error', 'Erro na operação', 'Ocorreu um erro ao marcar as notificações. Tente novamente.');
    }
  };

  const deleteSelectedNotifications = async () => {
    if (selectedNotifications.length === 0) {
      showToast('info', 'Seleção necessária', 'Selecione pelo menos uma notificação para eliminar.');
      return;
    }

    try {
      const { notificationService } = await import('../../api/services');
      
      // Eliminar cada notificação selecionada
      const deletePromises = selectedNotifications.map(id => notificationService.delete(id));
      const results = await Promise.all(deletePromises);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
      
      // Remove do localStorage
      const readIds = getReadIds().filter((id: string) => !selectedNotifications.includes(id));
      setReadIds(readIds);
      
      setSelectedNotifications([]);
      
      if (failCount === 0) {
        showToast('success', 'Operação concluída', `${successCount} notificação(ões) eliminada(s) com sucesso.`);
      } else {
        showToast('info', 'Operação parcial', `${successCount} eliminada(s), ${failCount} falharam.`);
      }
    } catch (error) {
      showToast('error', 'Erro na operação', 'Ocorreu um erro ao eliminar as notificações. Tente novamente.');
    }
  };

  const confirmBulkDelete = async () => {
    setIsBulkDeleteDialogOpen(false);
    await deleteSelectedNotifications();
  };

  // Função auxiliar para recarregar notificações
  const fetchNotifications = async () => {
    setIsRefreshing(true);
    try {
      const { notificationService } = await import('../../api/services');
      
      // Buscar notificações e contagem não lidas em paralelo
      const [notificationsResponse, unreadCountResponse] = await Promise.all([
        notificationService.getAll(),
        notificationService.getUnreadCount()
      ]);
      
      if (!notificationsResponse.success || !notificationsResponse.data) throw new Error('Erro ao buscar notificações');
      
      // Atualizar contagem não lidas da API
      if (unreadCountResponse.success && unreadCountResponse.data && typeof unreadCountResponse.data.count === 'number') {
        setUnreadCountFromAPI(unreadCountResponse.data.count);
      }
      
      const arr = Array.isArray(notificationsResponse.data) ? notificationsResponse.data : (Array.isArray(notificationsResponse.data.data) ? notificationsResponse.data.data : (notificationsResponse.data.notifications || []));
      const readIds = getReadIds();
      const mapped = arr.map((n: any) => {
        let visualType: 'info' | 'warning' | 'success' | 'error' = 'info';
        const rawType = n.type ?? n.tipo ?? '';
        if (['success', 'sucesso'].includes(rawType)) visualType = 'success';
        else if (['warning', 'aviso', 'warn'].includes(rawType)) visualType = 'warning';
        else if (['error', 'erro', 'danger'].includes(rawType)) visualType = 'error';
        const customType = rawType || n.category || n.categoria || 'geral';
        const id = n.id?.toString() ?? n._id?.toString() ?? Math.random().toString(36).slice(2);
        return {
          id,
          title: n.title ?? n.titulo ?? n.titulo_notificacao ?? 'Notificação',
          message: n.message ?? n.mensagem ?? n.text ?? n.subject ?? '',
          type: visualType,
          timestamp: n.timestamp ?? n.data ?? n.createdAt ?? new Date().toISOString(),
          read: readIds.includes(id) ? true : (n.read ?? n.lida ?? false),
          category: customType,
          subject: n.subject ?? '',
          rawType: rawType,
        };
      });
      setNotifications(mapped);
    } catch (e) {
      setNotifications([]);
      setUnreadCountFromAPI(null);
    } finally {
      setIsRefreshing(false);
    }
  };

  const manualRefresh = async () => {
    await fetchNotifications();
    showToast('success', 'Atualização concluída', 'As notificações foram atualizadas com sucesso.');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded shadow-lg text-white font-semibold transition-all duration-300
              ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
          >
            <div className="text-base">{toast.title}</div>
            <div className="text-sm font-normal">{toast.message}</div>
          </div>
        ))}
      </div>
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <Bell className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              Notificações
              {unreadCount > 0 && (
                <Badge className="bg-red-600 text-white ml-2">{unreadCount}</Badge>
              )}
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
              Gerencie e acompanhe todas as notificações do sistema
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Button 
              onClick={handleMarkAllReadClick}
              disabled={unreadCount === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 sm:px-4 sm:py-2"
            >
              <Check className="w-4 h-4 mr-2" />
              Marcar Todas como Lidas
            </Button>
            <Button 
              onClick={handleStockCheckClick}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 sm:px-4 sm:py-2"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Verificar Estoque
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
        {/* Barra de pesquisa única */}
        <div className="mb-3 flex items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-secondary" />
            <Input
              placeholder="Pesquisar notificações..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-white/20 text-white placeholder:text-dark-secondary w-full h-10 text-sm"
            />
          </div>
          <Button
            onClick={manualRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 px-3 py-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Badge className="ml-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold px-3 py-2 text-sm whitespace-nowrap">
            Total: {notifications.length}
          </Badge>
        </div>

        {/* Controles de seleção em massa */}
        {filteredNotifications.length > 0 && (
          <div className="mb-4 flex items-center justify-between p-3 glass-card bg-white/5 border-white/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-blue-600 bg-transparent border-white/20 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-dark-primary">
                {selectedNotifications.length > 0 
                  ? `${selectedNotifications.length} selecionada(s)`
                  : 'Selecionar todas'
                }
              </span>
            </div>
            
            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={markSelectedAsRead}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Marcar como Lidas
                </Button>
                <Button
                  onClick={handleBulkDeleteClick}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="glass-card bg-white/5 border-white/20 text-center py-12">
              <CardContent>
                <Bell className="w-12 h-12 text-dark-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-dark-primary mb-2">
                  Nenhuma notificação encontrada
                </h3>
                <p className="text-dark-secondary">
                  {searchTerm
                    ? 'Nenhuma notificação encontrada para sua busca.'
                    : 'Você está em dia com todas as notificações!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification: Notification) => (
              <Card 
                key={notification.id} 
                className={`glass-card border-white/20 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/25 ${
                  notification.read ? 'bg-white/5' : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelectNotification(notification.id)}
                      className="w-4 h-4 text-blue-600 bg-transparent border-white/20 rounded focus:ring-blue-500 mt-1"
                    />
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className={`font-semibold text-base ${
                          notification.read ? 'text-dark-primary' : 'text-white'
                        } line-clamp-1`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-2">
                          {getNotificationBadge(notification.type)}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-dark-secondary mt-1 line-clamp-2">
                        {notification.message}
                        {notification.subject && notification.message !== notification.subject && (
                          <span className="block text-xs text-blue-300 mt-1">{notification.subject}</span>
                        )}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 space-y-2 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 text-xs text-dark-secondary">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(notification.timestamp)}</span>
                          </div>
                          <Badge variant="outline" className="border-white/20 text-white text-xs w-fit">
                            {notification.category}
                            {notification.rawType && notification.rawType !== notification.category && (
                              <span className="ml-1 text-blue-400">({notification.rawType})</span>
                            )}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <Button
                              onClick={() => markAsRead(notification.id)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 sm:px-3 sm:py-1.5"
                            >
                              <Check className="w-3 h-3 sm:mr-1" />
                              <span className="hidden sm:inline">Marcar como lida</span>
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDeleteClick(notification)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 sm:px-3 sm:py-1.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
        {/* Modal de confirmação de exclusão individual */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="glass-card border-white/20 bg-slate-800/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                Confirmar Remoção
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                Tem certeza que deseja remover esta notificação?
                <br />
                <strong className="text-white">{notificationToDelete?.title}</strong>
                <br />Esta ação não poderá ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)} className="bg-slate-700 text-white border-none">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteNotification} className="bg-red-600 hover:bg-red-700 text-white">Remover</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de confirmação para marcar todas como lidas */}
        <AlertDialog open={isMarkAllReadDialogOpen} onOpenChange={setIsMarkAllReadDialogOpen}>
          <AlertDialogContent className="glass-card border-white/20 bg-slate-800/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-500" />
                Marcar Todas como Lidas
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                Tem certeza que deseja marcar todas as <strong className="text-white">{unreadCount} notificação(ões) não lida(s)</strong> como lidas?
                <br />Esta ação irá atualizar o estado de todas as notificações pendentes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel onClick={() => setIsMarkAllReadDialogOpen(false)} className="bg-slate-700 text-white border-none">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmMarkAllAsRead} className="bg-blue-600 hover:bg-blue-700 text-white">Marcar Todas</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de confirmação para eliminar todas as notificações */}
        <AlertDialog open={isClearAllDialogOpen} onOpenChange={setIsClearAllDialogOpen}>
          <AlertDialogContent className="glass-card border-white/20 bg-slate-800/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                Eliminar Todas as Notificações
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                <strong className="text-red-400">⚠️ ATENÇÃO:</strong> Tem certeza que deseja eliminar <strong className="text-white">todas as {notifications.length} notificação(ões)</strong>?
                <br />Esta ação é irreversível e todas as notificações serão permanentemente removidas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel onClick={() => setIsClearAllDialogOpen(false)} className="bg-slate-700 text-white border-none">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmClearAll} className="bg-red-600 hover:bg-red-700 text-white">Eliminar Todas</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de confirmação para verificação de estoque */}
        <AlertDialog open={isStockCheckDialogOpen} onOpenChange={setIsStockCheckDialogOpen}>
          <AlertDialogContent className="glass-card border-white/20 bg-slate-800/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Verificar Estoque Baixo
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                Tem certeza que deseja executar a verificação de estoque baixo?
                <br />Esta operação irá analisar todos os produtos e pode gerar novas notificações se encontrar itens com estoque baixo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel onClick={() => setIsStockCheckDialogOpen(false)} className="bg-slate-700 text-white border-none">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmStockCheck} className="bg-yellow-600 hover:bg-yellow-700 text-white">Verificar Estoque</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de confirmação para limpar notificações obsoletas */}
        <AlertDialog open={isClearObsoleteDialogOpen} onOpenChange={setIsClearObsoleteDialogOpen}>
          <AlertDialogContent className="glass-card border-white/20 bg-slate-800/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                Limpar Notificações Obsoletas
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                Tem certeza que deseja remover as notificações obsoletas?
                <br />Esta operação irá eliminar automaticamente notificações antigas ou que já não são relevantes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel onClick={() => setIsClearObsoleteDialogOpen(false)} className="bg-slate-700 text-white border-none">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmClearObsolete} className="bg-purple-600 hover:bg-purple-700 text-white">Limpar Obsoletas</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de confirmação para eliminação em massa */}
        <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
          <AlertDialogContent className="glass-card border-white/20 bg-slate-800/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                Eliminar Notificações Selecionadas
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                Tem certeza que deseja eliminar as <strong className="text-white">{selectedNotifications.length} notificação(ões) selecionada(s)</strong>?
                <br />Esta ação não poderá ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel onClick={() => setIsBulkDeleteDialogOpen(false)} className="bg-slate-700 text-white border-none">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmBulkDelete} className="bg-red-600 hover:bg-red-700 text-white">Eliminar Selecionadas</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}