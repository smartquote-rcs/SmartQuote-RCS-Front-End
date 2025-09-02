
import { useState, useEffect } from 'react';
import { Mail, X, CheckCircle, Clock, FileText, Check, Eye } from 'lucide-react';
import { Button } from './ui/button';

interface EmailAPIMessage {
  id: string;
  subject: string;
  date: string;
  from: string;
  clienteNome: string;
  clienteEmail: string;
  status?: string;
  isRead?: boolean;
}

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
  onNavigateToEmails?: () => void;
}

export function EmailNotifications({ onClose, onNavigateToQuotes, onNavigateToEmails }: EmailNotificationsProps) {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Função para marcar como lida
  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    
    // Salvar no localStorage
    const readIds = JSON.parse(localStorage.getItem("readEmailNotifications") || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem("readEmailNotifications", JSON.stringify(readIds));
    }
  };

  // Função para abrir email específico
  const openEmail = (notification: EmailNotification) => {
    markAsRead(notification.id);
    if (onNavigateToEmails) {
      // Salvar o ID do email selecionado para abrir na página de emails
      localStorage.setItem("selectedEmailId", notification.id.toString());
      onNavigateToEmails();
    }
  };

  useEffect(() => {
    const fetchRecentEmailQuotes = async () => {
      try {
        const response = await fetch('http://localhost:2000/api/prompts/with-dados-bruto');
        if (!response.ok) throw new Error('Erro ao buscar emails');
        const data = await response.json();

        let emailsRaw = [];
        if (Array.isArray(data)) {
          emailsRaw = data;
        } else if (Array.isArray(data.emails)) {
          emailsRaw = data.emails;
        } else if (Array.isArray(data.data)) {
          emailsRaw = data.data;
        } else {
          const firstArray = Object.values(data).find(v => Array.isArray(v));
          if (firstArray) emailsRaw = firstArray;
        }

        const emails: EmailAPIMessage[] = (emailsRaw || []).map((item: any) => {
          const dadosBruto = item && item.dados_bruto ? item.dados_bruto : {};
          const cliente = item && item.cliente ? item.cliente : {};
          return {
            id: item && item.id !== undefined ? String(item.id) : 'Não informado',
            subject: dadosBruto.subject || 'Não informado',
            date: dadosBruto.date || new Date().toISOString(),
            from: dadosBruto.from || 'Não informado',
            clienteNome: cliente.nome || 'Não informado',
            clienteEmail: cliente.email || 'Não informado',
            status: item && item.status ? item.status : 'Não informado',
            isRead: !!(item && item.isRead),
          };
        });

        // Ordenar por data (mais recente primeiro)
        emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTotalCount(emails.length);
        
        // Carregar IDs lidos do localStorage
        const readIds = JSON.parse(localStorage.getItem("readEmailNotifications") || "[]");
        
        // Mapear para o formato esperado pelo componente
        const mapped: EmailNotification[] = emails.slice(0, 3).map((email) => ({
          id: Number(email.id),
          type: 'quote_email',
          title: email.subject,
          message: `De: ${email.clienteNome} <${email.clienteEmail}>`,
          timestamp: email.date,
          read: !!email.isRead || readIds.includes(Number(email.id)),
        }));
        setNotifications(mapped);
      } catch (error) {
        console.error('Erro ao buscar cotações via email:', error);
        setNotifications([]);
      }
    };
    fetchRecentEmailQuotes();
    const interval = setInterval(fetchRecentEmailQuotes, 30000);
    return () => clearInterval(interval);
  }, []);

  // markAsRead e removeNotification não são mais usados pois agora vem da API

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
          <h3 className="text-white font-bold text-sm">
            Cotações via Email
            <span className="ml-2 bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full text-xs font-medium align-middle">
              {totalCount}
            </span>
          </h3>
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
            className={`relative p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
              notification.read
                ? 'bg-slate-800/30 border-slate-700/50 opacity-75'
                : 'bg-cyan-900/20 border-cyan-500/30 hover:bg-cyan-900/30'
            }`}
            onClick={() => openEmail(notification)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
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
              
              {/* Botões de ação */}
              <div className="flex flex-col gap-1">
                {!notification.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 p-1 rounded text-xs transition-colors duration-200 flex items-center gap-1"
                    title="Marcar como lida"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEmail(notification);
                  }}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 p-1 rounded text-xs transition-colors duration-200 flex items-center gap-1"
                  title="Ver detalhes"
                >
                  <Eye className="w-3 h-3" />
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

      {/* Sem botão de marcar todas como lidas, pois vem da API */}
    </div>
  );
}
