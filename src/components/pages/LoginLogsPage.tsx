import { useEffect, useState } from 'react';
import { LogIn, RefreshCw, AlertCircle } from 'lucide-react';
import { auditLogService } from '../../api/services';
import api from '../../api/client';

interface AuditLog {
  id: number;
  user_id: string;
  action: string;
  tabela_afetada?: string;
  registo_id?: number;
  detalhes_alteracao?: any;
  created_at: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  position: string;
}

function getRelativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hora${Math.floor(diff / 3600) > 1 ? 's' : ''} atrás`;
  return date.toLocaleString();
}

function parseUserAgent(ua: string): string {
  if (!ua || ua === '-') return '-';
  
  // Detectar dispositivo móvel
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  
  // Detectar navegador
  let browser = 'Navegador';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  
  // Detectar sistema operacional
  let os = '';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'Mac';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  const device = isMobile ? '📱' : '💻';
  return `${device} ${browser}${os ? ' • ' + os : ''}`;
}

export function LoginLogsPage({ isLight = false }: { isLight?: boolean } = {}) {
  const [loginLogs, setLoginLogs] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usersCache, setUsersCache] = useState<Map<string, UserData>>(new Map());

  // Função para buscar dados do usuário por auth_id (UUID)
  const fetchUserData = async (userId: string): Promise<UserData | null> => {
    // Verificar cache primeiro
    if (usersCache.has(userId)) {
      return usersCache.get(userId)!;
    }

    try {
      const response = await api.get(`/users/by-auth-id/${userId}`);
      const userData: UserData = {
        id: response.data.id,
        name: response.data.name || 'Usuário',
        email: response.data.email || '-',
        position: response.data.position || 'user'
      };
      
      // Atualizar cache
      setUsersCache(prev => new Map(prev).set(userId, userData));
      
      return userData;
    } catch (err) {
      console.error(`Erro ao buscar usuário ${userId}:`, err);
      return null;
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await auditLogService.getAll({
        limit: 100,
        offset: 0
      });

      if (result.success && result.data?.data) {
        const auditLogs: AuditLog[] = Array.isArray(result.data.data) 
          ? result.data.data 
          : [];

        // Filtrar apenas logs de LOGIN/LOGOUT
        const sessionLogs = auditLogs.filter(log => 
          log.action === 'USER_LOGIN' || log.action === 'USER_LOGOUT'
        );

        // Buscar dados dos usuários para cada log
        const formattedLogsPromises = sessionLogs.map(async (log) => {
          const detalhes = log.detalhes_alteracao || {};
          
          // Buscar dados do usuário através do user_id
          const userData = await fetchUserData(log.user_id);

          return {
            id: log.id,
            userId: log.user_id,
            type: log.action.toLowerCase().replace('user_', ''),
            userName: userData?.name || 'Usuário',
            userEmail: userData?.email || '-',
            ip: detalhes.ip || '-',
            userAgent: detalhes.user_agent || '-',
            timestamp: log.created_at,
            details: {
              role: userData?.position || 'user',
              position: userData?.position || 'user'
            }
          };
        });

        const formattedLogs = await Promise.all(formattedLogsPromises);

        formattedLogs.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setLoginLogs(formattedLogs);
      } else {
        console.error('Erro ao buscar logs:', result.error);
        setError(result.error || 'Erro ao carregar logs');
        setLoginLogs([]);
      }
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
      setError('Erro ao conectar com o servidor');
      setLoginLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className={`flex flex-col h-full w-full p-0 overflow-y-auto ${isLight ? 'bg-gray-50' : 'bg-dark-bg'}`}>
      <div className={`glass-card rounded-none h-full w-full p-2 sm:p-3 border backdrop-blur-sm ${
        isLight 
          ? 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200' 
          : 'bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-white/10'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <div className="min-w-0 flex-1">
            <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              <LogIn className="w-5 h-5 text-blue-400" /> Logs de Sessão
            </h1>
            <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>
              Visualize todos os acessos (login/logout) registrados no sistema.
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2 mt-2 sm:mt-0">
            <button
              onClick={loadLogs}
              disabled={loading}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Atualizar logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Carregando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {error && (
          <div className={`mb-3 p-2.5 rounded-lg flex items-center gap-2 ${
            isLight 
              ? 'bg-red-50 border border-red-200 text-red-800' 
              : 'bg-red-900/20 border border-red-500/50 text-red-300'
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className={`w-7 h-7 mx-auto mb-2 animate-spin ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
            <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>Carregando logs...</p>
          </div>
        ) : loginLogs.length === 0 ? (
          <div className={`text-center py-8 ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
            <LogIn className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum log de sessão encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[65vh]">
            <table className={`min-w-full w-full text-xs rounded-none border shadow-lg ${
              isLight 
                ? 'bg-white border-gray-200' 
                : 'bg-slate-800/80 border-slate-700'
            }`}>
              <thead>
                <tr className={isLight ? 'bg-gray-50' : 'bg-slate-900/60'}>
                  <th className={`px-2 sm:px-3 py-2 text-left font-semibold ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Ação</th>
                  <th className={`px-2 sm:px-3 py-2 text-left font-semibold ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Usuário</th>
                  <th className={`hidden md:table-cell px-2 sm:px-3 py-2 text-left font-semibold ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Email</th>
                  <th className={`hidden lg:table-cell px-2 sm:px-3 py-2 text-left font-semibold ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Cargo</th>
                  <th className={`hidden xl:table-cell px-2 sm:px-3 py-2 text-left font-semibold ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Navegador/Dispositivo</th>
                  <th className={`px-2 sm:px-3 py-2 text-left font-semibold ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Data/Hora</th>
                  <th className={`hidden sm:table-cell px-2 sm:px-3 py-2 text-left font-semibold ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Tempo</th>
                </tr>
              </thead>
              <tbody>
                {loginLogs.map((log, idx) => (
                  <tr key={log.id || idx} className={`border-t transition-colors ${
                    isLight 
                      ? 'border-gray-200 hover:bg-blue-50' 
                      : 'border-slate-700 hover:bg-blue-900/20'
                  }`}>
                    <td className="px-2 sm:px-3 py-1.5">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${
                        log.type === 'login' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {log.type === 'login' ? 'LOGIN' : 'LOGOUT'}
                      </span>
                    </td>
                    <td className={`px-2 sm:px-3 py-1.5 font-medium text-[11px] sm:text-xs ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      <div className="truncate max-w-[120px] sm:max-w-none" title={log.userName || '-'}>
                        {log.userName || '-'}
                      </div>
                      {/* Mostrar email em telas pequenas abaixo do nome */}
                      <div className={`md:hidden text-[10px] truncate max-w-[120px] ${isLight ? 'text-gray-600' : 'text-slate-400'}`} title={log.userEmail || '-'}>
                        {log.userEmail || '-'}
                      </div>
                    </td>
                    <td className={`hidden md:table-cell px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs ${isLight ? 'text-gray-700' : 'text-slate-200'}`}>
                      <div className="truncate max-w-[150px] lg:max-w-none" title={log.userEmail || '-'}>
                        {log.userEmail || '-'}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-2 sm:px-3 py-1.5">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${
                        log.details?.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                        log.details?.role === 'manager' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {log.details?.role || '-'}
                      </span>
                    </td>
                    <td 
                      className={`hidden xl:table-cell px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs ${isLight ? 'text-gray-600' : 'text-slate-400'}`} 
                      title={`${log.ip ? 'IP: ' + log.ip + '\n' : ''}User Agent: ${log.userAgent || 'N/A'}`}
                    >
                      {parseUserAgent(log.userAgent)}
                    </td>
                    <td className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>
                      <div className="whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </div>
                    </td>
                    <td className={`hidden sm:table-cell px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs whitespace-nowrap ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                      {log.timestamp ? getRelativeTime(log.timestamp) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginLogsPage;
