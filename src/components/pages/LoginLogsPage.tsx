import { useEffect, useState } from 'react';
import { LogIn, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usersCache, setUsersCache] = useState<Map<string, UserData>>(new Map());
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [logsPerPage] = useState(25); // Reduzido de 100 para 25

  // Cache persistente com sessionStorage
  const getCachedUser = (userId: string): UserData | null => {
    // Verificar cache em memória primeiro
    if (usersCache.has(userId)) {
      return usersCache.get(userId)!;
    }
    
    // Verificar sessionStorage
    try {
      const cached = sessionStorage.getItem(`user_cache_${userId}`);
      if (cached) {
        const userData = JSON.parse(cached);
        // Verificar se cache não expirou (1 hora)
        if (Date.now() - userData.cached_at < 3600000) {
          setUsersCache(prev => new Map(prev).set(userId, userData));
          return userData;
        }
      }
    } catch (err) {
      console.error('Erro ao ler cache:', err);
    }
    
    return null;
  };
  
  const setCachedUser = (userId: string, userData: UserData) => {
    const cachedData = { ...userData, cached_at: Date.now() };
    
    // Atualizar cache em memória
    setUsersCache(prev => new Map(prev).set(userId, userData));
    
    // Salvar no sessionStorage
    try {
      sessionStorage.setItem(`user_cache_${userId}`, JSON.stringify(cachedData));
    } catch (err) {
      console.error('Erro ao salvar cache:', err);
    }
  };

  // Função otimizada para buscar usuários únicos em lote
  const fetchUsersInBatch = async (userIds: string[]): Promise<Map<string, UserData>> => {
    const userMap = new Map<string, UserData>();
    const uncachedUserIds: string[] = [];
    
    // Verificar cache primeiro
    userIds.forEach(userId => {
      const cached = getCachedUser(userId);
      if (cached) {
        userMap.set(userId, cached);
      } else {
        uncachedUserIds.push(userId);
      }
    });
    
    // Limitar a 5 usuários únicos por vez para evitar sobrecarga
    const limitedUserIds = uncachedUserIds.slice(0, 5);
    
    if (limitedUserIds.length > 0) {
      setLoadingUsers(true);
      
      try {
        // Buscar usuários em paralelo (máximo 5)
        const userPromises = limitedUserIds.map(async (userId) => {
          try {
            const response = await api.get(`/users/by-auth-id/${userId}`);
            const userData: UserData = {
              id: response.data.id,
              name: response.data.name || 'Usuário',
              email: response.data.email || '-',
              position: response.data.position || 'user'
            };
            
            setCachedUser(userId, userData);
            return { userId, userData };
          } catch (err) {
            console.error(`Erro ao buscar usuário ${userId}:`, err);
            return { userId, userData: null };
          }
        });
        
        const results = await Promise.allSettled(userPromises);
        
        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.userData) {
            userMap.set(result.value.userId, result.value.userData);
          }
        });
        
      } catch (err) {
        console.error('Erro ao buscar usuários em lote:', err);
      } finally {
        setLoadingUsers(false);
      }
    }
    
    return userMap;
  };

  const loadLogs = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const offset = (page - 1) * logsPerPage;
      const result = await auditLogService.getAll({
        limit: logsPerPage,
        offset: offset
      });

      if (result.success && result.data?.data) {
        const auditLogs: AuditLog[] = Array.isArray(result.data.data) 
          ? result.data.data 
          : [];
        
        // Atualizar total de logs se disponível
        if (result.data.total !== undefined) {
          setTotalLogs(result.data.total);
        }

        // Filtrar apenas logs de LOGIN/LOGOUT
        const sessionLogs = auditLogs.filter(log => 
          log.action === 'USER_LOGIN' || log.action === 'USER_LOGOUT'
        );

        // Obter usuários únicos
        const uniqueUserIds = [...new Set(sessionLogs.map(log => log.user_id))];
        
        // Buscar dados dos usuários em lote
        const userMap = await fetchUsersInBatch(uniqueUserIds);

        // Formatar logs com dados dos usuários
        const formattedLogs = sessionLogs.map(log => {
          const detalhes = log.detalhes_alteracao || {};
          const userData = userMap.get(log.user_id);

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

        // Ordenar por timestamp (mais recente primeiro)
        formattedLogs.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setLoginLogs(formattedLogs);
        setCurrentPage(page);
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
  
  // Função para navegar entre páginas
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalLogs / logsPerPage)) {
      loadLogs(newPage);
    }
  };

  useEffect(() => {
    loadLogs(1);
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
              <LogIn className="w-5 h-5 text-blue-400" /> Logs de Acesso
            </h1>
            <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>
              Visualize todos os acessos (login/logout) registrados no sistema.
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2 mt-2 sm:mt-0">
            {loadingUsers && (
              <div className="flex items-center gap-1 text-xs text-blue-400">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Carregando usuários...</span>
              </div>
            )}
            <button
              onClick={() => loadLogs(currentPage)}
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
          <>
            <div className="overflow-x-auto max-h-[55vh]">
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
            
            {/* Controles de Paginação */}
            {totalLogs > logsPerPage && (
              <div className={`flex items-center justify-between mt-4 px-2 py-3 border-t ${
                isLight ? 'border-gray-200 bg-gray-50' : 'border-slate-700 bg-slate-800/50'
              }`}>
                <div className={`text-xs ${
                  isLight ? 'text-gray-600' : 'text-slate-400'
                }`}>
                  Mostrando {((currentPage - 1) * logsPerPage) + 1} a {Math.min(currentPage * logsPerPage, totalLogs)} de {totalLogs} logs
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                      currentPage === 1 || loading
                        ? 'opacity-50 cursor-not-allowed'
                        : isLight
                          ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          : 'bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600'
                    }`}
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Anterior
                  </button>
                  
                  <span className={`px-3 py-1 rounded text-xs font-medium ${
                    isLight 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-blue-900/50 text-blue-300 border border-blue-500/50'
                  }`}>
                    {currentPage} de {Math.ceil(totalLogs / logsPerPage)}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(totalLogs / logsPerPage) || loading}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                      currentPage >= Math.ceil(totalLogs / logsPerPage) || loading
                        ? 'opacity-50 cursor-not-allowed'
                        : isLight
                          ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          : 'bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600'
                    }`}
                  >
                    Próxima
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LoginLogsPage;
