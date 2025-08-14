import { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { emailService } from '../services/emailService';

interface EmailStatusProps {
  onOpenSettings?: () => void;
}

export function EmailStatus({ onOpenSettings }: EmailStatusProps) {
  const [status, setStatus] = useState<{
    running: boolean;
    config: any;
    lastCheck?: Date;
  } | null>(null);

  useEffect(() => {
    // Atualizar status a cada 30 segundos
    const updateStatus = () => {
      setStatus(emailService.getStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const getStatusIcon = () => {
    if (!status.config?.enabled) {
      return <Mail className="w-4 h-4 text-gray-400" />;
    }
    if (status.running) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    return <AlertCircle className="w-4 h-4 text-red-400" />;
  };

  const getStatusText = () => {
    if (!status.config?.enabled) {
      return 'Desativado';
    }
    if (status.running) {
      return 'Monitorando';
    }
    return 'Parado';
  };

  const getStatusColor = () => {
    if (!status.config?.enabled) {
      return 'text-gray-400';
    }
    if (status.running) {
      return 'text-green-400';
    }
    return 'text-red-400';
  };

  return (
    <div className="glass-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-white font-bold text-sm">Recepção de Email</h3>
            <p className={`text-xs ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
        </div>
        
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            title="Configurar"
          >
            <Settings className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        )}
      </div>

      <div className="space-y-2 text-xs">
        {status.config?.enabled ? (
          <>
            <div className="flex justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="text-white font-mono">{status.config.username || 'Não configurado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Intervalo:</span>
              <span className="text-white">{status.config.checkInterval || 5} min</span>
            </div>
            {status.lastCheck && (
              <div className="flex justify-between">
                <span className="text-slate-400">Última verificação:</span>
                <span className="text-white">{status.lastCheck.toLocaleTimeString('pt-PT')}</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-slate-400">Configure para receber cotações automaticamente via email</p>
          </div>
        )}
      </div>

      {status.running && (
        <div className="mt-3 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs">Ativo</span>
        </div>
      )}
    </div>
  );
}
