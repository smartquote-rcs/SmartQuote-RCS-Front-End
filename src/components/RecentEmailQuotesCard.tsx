import { useEffect, useState } from "react";
import { Mail, Clock, CheckCircle } from "lucide-react";

interface EmailNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function RecentEmailQuotesCard() {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);

  useEffect(() => {
    const loadNotifications = () => {
      try {
        const saved = localStorage.getItem("smartquote-notifications");
        if (saved) {
          const allNotifications = JSON.parse(saved);
          const emailNotifications = allNotifications.filter((n: EmailNotification) => n.type === "quote_email");
          setNotifications(emailNotifications.slice(0, 3)); // Show only 3 most recent
        }
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
      }
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h atrás`;
    return `${Math.floor(diffInMinutes / 1440)} dias atrás`;
  };

  return (
    <div className="glass-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
      <div className="flex items-center mb-2">
        <Mail className="w-4 h-4 text-cyan-400 mr-2" />
        <h3 className="text-white font-bold text-sm">Últimas Cotações por Email</h3>
      </div>
      {notifications.length === 0 ? (
        <div className="text-slate-400 text-xs">Nenhuma cotação via email recebida.</div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className="flex items-start gap-2">
              {n.read ? (
                <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
              ) : (
                <Clock className="w-3 h-3 text-cyan-400 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white font-medium truncate">{n.title}</div>
                <div className="text-xs text-slate-300 truncate max-w-xs">{n.message}</div>
                <div className="text-xs text-slate-500">{getTimeAgo(n.timestamp)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
