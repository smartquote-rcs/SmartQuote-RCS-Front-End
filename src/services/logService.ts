// Serviço para registrar logs de eventos do sistema
import axios from 'axios';

export interface LogEntry {
  type: string; // e.g., 'login', 'logout', 'error', etc.
  userEmail?: string;
  userName?: string;
  timestamp?: string;
  details?: any;
}

// Envia o log para o backend (ou salva localmente se offline)
export async function saveLog(entry: LogEntry) {
  const logData = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  };
  try {
    // Substitua a URL abaixo pela rota real do backend para logs, se existir
    await axios.post('/api/logs', logData);
  } catch (err) {
    // Se falhar, salva no localStorage para tentar novamente depois
    const offlineLogs = JSON.parse(localStorage.getItem('offline_logs') || '[]');
    offlineLogs.push(logData);
    localStorage.setItem('offline_logs', JSON.stringify(offlineLogs));
  }
}
