// Serviço para registrar logs de eventos do sistema usando Audit Logs do backend
import { auditLogService } from '../api/services';

export interface LogEntry {
  type: string; // e.g., 'login', 'logout', 'error', etc.
  userId: string; // UUID do usuário (obrigatório para audit logs)
  userEmail?: string;
  userName?: string;
  timestamp?: string;
  details?: any;
  tabela_afetada?: string; // Tabela afetada pela ação (opcional)
  registo_id?: number; // ID do registro afetado (opcional)
}

/**
 * Envia o log para o backend usando o sistema de Audit Logs
 * @param entry Dados do log a ser salvo
 */
export async function saveLog(entry: LogEntry) {
  try {
    // Mapeia o tipo de log para ação do audit log
    const action = mapLogTypeToAction(entry.type);
    
    // Prepara os dados para o audit log
    const auditLogData = {
      user_id: entry.userId,
      action,
      tabela_afetada: entry.tabela_afetada,
      registo_id: entry.registo_id,
      detalhes_alteracao: {
        userEmail: entry.userEmail,
        userName: entry.userName,
        timestamp: entry.timestamp || new Date().toISOString(),
        details: entry.details,
        type: entry.type
      }
    };
    
    // Envia para o backend
    const result = await auditLogService.create(auditLogData);
    
    if (!result.success) {
      console.error('❌ Erro ao salvar log:', result.error);
      // Se falhar, salva no localStorage para tentar novamente depois
      saveOfflineLog(entry);
    } else {
        syncOfflineLogs();
    }
    
    return result;
  } catch (err) {
    console.error('❌ Erro ao processar log:', err);
    // Se falhar, salva no localStorage para tentar novamente depois
    saveOfflineLog(entry);
    return { success: false, error: 'Erro ao salvar log' };
  }
}

/**
 * Mapeia o tipo de log para uma ação do audit log
 */
function mapLogTypeToAction(type: string): string {
  const actionMap: Record<string, string> = {
    'login': 'USER_LOGIN',
    'logout': 'USER_LOGOUT',
    'error': 'ERROR',
    'create': 'CREATE',
    'update': 'UPDATE',
    'delete': 'DELETE',
    'read': 'READ',
    'search': 'SEARCH',
    'export': 'EXPORT',
    'import': 'IMPORT',
    'config': 'CONFIG'
  };
  
  return actionMap[type.toLowerCase()] || type.toUpperCase();
}

/**
 * Salva o log localmente quando offline ou em caso de erro
 */
function saveOfflineLog(entry: LogEntry) {
  try {
    const offlineLogs = JSON.parse(localStorage.getItem('offline_logs') || '[]');
    offlineLogs.push({
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('offline_logs', JSON.stringify(offlineLogs));
  } catch (err) {
    console.error('❌ Erro ao salvar log offline:', err);
  }
}

/**
 * Sincroniza logs offline com o backend
 */
async function syncOfflineLogs() {
  try {
    const offlineLogs = JSON.parse(localStorage.getItem('offline_logs') || '[]');
    
    if (offlineLogs.length === 0) {
      return;
    }
    let successCount = 0;
    const failedLogs = [];
    
    for (const log of offlineLogs) {
      const result = await saveLog(log);
      if (result.success) {
        successCount++;
      } else {
        failedLogs.push(log);
      }
    }
    
    // Atualiza o localStorage apenas com logs que falharam
    localStorage.setItem('offline_logs', JSON.stringify(failedLogs));
    
    if (successCount > 0) {
    }
    
    if (failedLogs.length > 0) {
    }
  } catch (err) {
    console.error('❌ Erro ao sincronizar logs offline:', err);
  }
} 

/**
 * Obtém logs offline pendentes
 */
export function getOfflineLogs(): LogEntry[] {
  try {
    return JSON.parse(localStorage.getItem('offline_logs') || '[]');
  } catch {
    return [];
  }
}

/**
 * Limpa logs offline
 */
export function clearOfflineLogs() {
  localStorage.removeItem('offline_logs');
}
