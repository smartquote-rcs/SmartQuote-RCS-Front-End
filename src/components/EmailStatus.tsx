import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function EmailStatus() {
  const [status, setStatus] = useState<{
    status: 'ativo' | 'parado' | 'unknown';
    message: string;
    lastCheck?: Date;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Busca o status do monitoramento automático
  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:2000/api/email/auto-monitor/status');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const api = await response.json();
      console.log('Status recebido da API:', api);
      let normalizedStatus: 'ativo' | 'parado' | 'unknown' = 'unknown';
      let message = '';
      let lastCheck: Date | undefined = undefined;
      if (api.data) {
        if (typeof api.data.isRunning === 'boolean') {
          normalizedStatus = api.data.isRunning ? 'ativo' : 'parado';
        } else if (typeof api.data.globalStatus === 'string') {
          const statusLower = api.data.globalStatus.toLowerCase();
          if (statusLower === 'ativo' || statusLower === 'active' || statusLower === 'running') {
            normalizedStatus = 'ativo';
          } else if (statusLower === 'parado' || statusLower === 'stopped' || statusLower === 'inactive') {
            normalizedStatus = 'parado';
          }
        }
        message = api.data.recentMessages && api.data.recentMessages.length > 0 ? api.data.recentMessages[0] : '';
        if (api.data.lastCheck) {
          lastCheck = new Date(api.data.lastCheck);
        } else if (api.data.startTime) {
          lastCheck = new Date(api.data.startTime);
        } else if (api.timestamp) {
          lastCheck = new Date(api.timestamp);
        }
      }
      console.log('Status normalizado:', normalizedStatus);
      // Filtrar mensagens técnicas do backend
      const technicalErrorPatterns = [
        'GaxiosError', 'invalid_client', 'OAuth', 'googleapis', 'google-auth-library', 'apirequest', 'gmail', 'refreshToken', 'Unauthorized', '401'
      ];
      let userMessage = message;
      if (technicalErrorPatterns.some(pat => message && message.toLowerCase().includes(pat.toLowerCase()))) {
        userMessage = 'Erro ao buscar dados com o serviço de email';
      }
      setStatus({
        status: normalizedStatus,
        message: userMessage,
        lastCheck: lastCheck
      });
    } catch (error) {
      console.error('Erro ao buscar status do email:', error);
      setStatus({
        status: 'unknown',
        message: 'Erro ao conectar com o serviço',
        lastCheck: new Date()
      });
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleMonitoring = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading || !status) return;
    const wantsActive = e.target.checked;
    const isActive = status.status === 'ativo';
    if (wantsActive === isActive) return; // Não faz nada se já está no estado desejado
    setIsLoading(true);
    try {
      const endpoint = wantsActive
        ? 'http://localhost:2000/api/email/auto-monitor/start'
        : 'http://localhost:2000/api/email/auto-monitor/stop';
      console.log(`Tentando endpoint: ${endpoint}, Valor desejado: ${wantsActive}`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      console.log(`Resposta HTTP: ${response.status} ${response.statusText}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Resposta da API:', data);
        setTimeout(async () => {
          await fetchStatus();
        }, 500);
      } else {
        try {
          const errorData = await response.json();
          if (errorData.message && errorData.message.includes('não está rodando')) {
            console.log('Info: Monitoramento já estava parado, sincronizando status...');
            setTimeout(async () => {
              await fetchStatus();
            }, 500);
          } else {
            console.error(`Erro da API (${response.status}):`, errorData);
            throw new Error(`${errorData.message || 'Erro desconhecido'}`);
          }
        } catch (parseError) {
          const errorText = await response.text();
          console.error(`Erro da API (${response.status}):`, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }
    } catch (error) {
      console.error('Erro ao alterar monitoramento:', error);
      setTimeout(async () => {
        await fetchStatus();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!status) {
    // Estado inicial: mostrar toggle ativado e status monitorando
    return (
      <div className="glass-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-4 h-4 text-green-400 animate-pulse" />
            <div>
              <h3 className="text-white font-bold text-sm">Recepção de Email</h3>
              <p className="text-xs text-green-400">Monitorando</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={true}
                readOnly
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="font-semibold text-green-400">Monitorando</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Serviço:</span>
            <span className="text-white">Gmail Monitor</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Última verificação:</span>
            <span className="text-white">-</span>
          </div>
          <div className="mt-2 p-2 bg-slate-700/50 rounded text-slate-300 text-xs">
            Carregando status do monitoramento...
          </div>
        </div>
        <div className="mt-3 flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-lg p-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs font-medium">Monitoramento Ativo</span>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (status.status === 'ativo') {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    } else if (status.status === 'parado') {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (status.status === 'ativo') {
      return 'Monitorando';
    } else if (status.status === 'parado') {
      return 'Parado';
    }
    return 'Desconhecido';
  };

  const getStatusColor = () => {
    if (status.status === 'ativo') {
      return 'text-green-400';
    } else if (status.status === 'parado') {
      return 'text-red-400';
    }
    return 'text-gray-400';
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
        
        <div className="flex items-center space-x-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={status.status === 'ativo'}
              onChange={toggleMonitoring}
              disabled={isLoading}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Status:</span>
          <span className={`font-semibold ${getStatusColor()}`}>{getStatusText()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Serviço:</span>
          <span className="text-white">Gmail Monitor</span>
        </div>
        {status.lastCheck && (
          <div className="flex justify-between">
            <span className="text-slate-400">Última verificação:</span>
            <span className="text-white">{status.lastCheck.toLocaleDateString('pt-BR')} {status.lastCheck.toLocaleTimeString('pt-BR')}</span>
          </div>
        )}
        {status.message && (
          <div className="mt-2 p-2 bg-slate-700/50 rounded text-slate-300 text-xs">
            {status.message}
          </div>
        )}
      </div>

      {status.status === 'ativo' && (
        <div className="mt-3 flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-lg p-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs font-medium">Monitoramento Ativo</span>
        </div>
      )}

      {status.status === 'parado' && (
        <div className="mt-3 flex items-center space-x-2 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          <span className="text-red-400 text-xs font-medium">Monitoramento Desativado</span>
        </div>
      )}

      {status.status === 'unknown' && (
        <div className="mt-3 flex items-center space-x-2 bg-gray-500/10 border border-gray-500/20 rounded-lg p-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-gray-400 text-xs font-medium">Status Desconhecido</span>
        </div>
      )}
    </div>
  );
}
