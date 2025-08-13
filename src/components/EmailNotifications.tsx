import { useState, useEffect } from 'react';
import { Mail, X, CheckCircle, Clock, FileText } from 'lucide-react';
import { Button } from './ui/button';

interface EmailNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface EmailNotificationsProps {
  onClose?: () => void;
  onNavigateToQuotes?: () => void;
}

export function EmailNotifications({ onClose, onNavigateToQuotes }: EmailNotificationsProps) {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);

  useEffect(() => {
    const loadNotifications = () => {
      try {
        const saved = localStorage.getItem('smartquote-notifications');
        if (saved) {
          const allNotifications = JSON.parse(saved);
          // Filtrar apenas notificações de email
          const emailNotifications = allNotifications.filter((n: EmailNotification) => 
            n.type === 'quote_email'
          );
          setNotifications(emailNotifications.slice(0, 5)); // Mostrar apenas as 5 mais recentes
        }
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }
    };

    loadNotifications();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: number) => {
    try {
      const saved = localStorage.getItem('smartquote-notifications');
      if (saved) {
        const allNotifications = JSON.parse(saved);
        const updated = allNotifications.map((n: EmailNotification) => 
          n.id === id ? { ...n, read: true } : n
        );
        localStorage.setItem('smartquote-notifications', JSON.stringify(updated));
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const removeNotification = (id: number) => {
    try {
      const saved = localStorage.getItem('smartquote-notifications');
      if (saved) {
        const allNotifications = JSON.parse(saved);
        const filtered = allNotifications.filter((n: EmailNotification) => n.id !== id);
        localStorage.setItem('smartquote-notifications', JSON.stringify(filtered));
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h atrás`;
    return `${Math.floor(diffInMinutes / 1440)} dias atrás`;
  };

  return (
    <div className="glass-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-cyan-400" />
          <h3 className="text-white font-bold text-sm">Cotações via Email</h3>
          {notifications.length > 0 && (
            <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full text-xs font-medium">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {onNavigateToQuotes && (
            <Button
              onClick={onNavigateToQuotes}
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30"
            >
              <FileText className="w-3 h-3 mr-1" />
              Ver Todas
            </Button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Mail className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-2">Nenhuma cotação via email recebida</p>
          <p className="text-slate-500 text-xs">
            Envie um email de teste para verificar o funcionamento
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto scrollable-content">
          {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`relative p-3 rounded-lg border transition-all duration-200 ${
              notification.read
                ? 'bg-slate-800/30 border-slate-700/50 opacity-75'
                : 'bg-cyan-900/20 border-cyan-500/30 hover:bg-cyan-900/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  {notification.read ? (
                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                  ) : (
                    <Clock className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  )}
                  <h4 className="text-white text-xs font-medium truncate">{notification.title}</h4>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{notification.message}</p>
                <p className="text-slate-500 text-xs mt-1">{getTimeAgo(notification.timestamp)}</p>
              </div>
              
              <div className="flex items-center space-x-1 ml-2">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Marcar como lida"
                  >
                    <CheckCircle className="w-3 h-3 text-cyan-400 hover:text-green-400" />
                  </button>
                )}
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Remover"
                >
                  <X className="w-3 h-3 text-slate-400 hover:text-red-400" />
                </button>
              </div>
            </div>
            
            {!notification.read && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full"></div>
            )}
          </div>
        ))}
        </div>
      )}

      {notifications.length > 0 && notifications.some(n => !n.read) && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <Button
            onClick={() => notifications.forEach(n => !n.read && markAsRead(n.id))}
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50"
          >
            Marcar todas como lidas
          </Button>
        </div>
      )}
    </div>
  );
}
