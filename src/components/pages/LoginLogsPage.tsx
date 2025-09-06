import { useEffect, useState } from 'react';
import { LogIn, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

function getRelativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hora${Math.floor(diff / 3600) > 1 ? 's' : ''} atrás`;
  return date.toLocaleString();
}


export function LoginLogsPage({ isLight = false }: { isLight?: boolean } = {}) {
  const [loginLogs, setLoginLogs] = useState<Array<any>>([]);
  const [deleting, setDeleting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const loadLogs = () => {
    let logs: any[] = [];
    try {
      const offlineLogs = JSON.parse(localStorage.getItem('offline_logs') || '[]');
      logs = offlineLogs.concat();
    } catch {}
    const loginLogs = logs.filter(l => l.type === 'login');
    loginLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setLoginLogs(loginLogs);
  };
  useEffect(() => {
    loadLogs();
  }, []);

  const handleDeleteLogs = () => {
    setDeleting(true);
    try {
      let logs = [];
      try {
        logs = JSON.parse(localStorage.getItem('offline_logs') || '[]');
      } catch {}
      const filtered = logs.filter((l: any) => l.type !== 'login');
      localStorage.setItem('offline_logs', JSON.stringify(filtered));
      setLoginLogs([]);
    } finally {
      setDeleting(false);
      setOpenDialog(false);
    }
  };

  return (
    <div className={`flex flex-col h-full w-full p-0 sm:p-0 lg:p-0 overflow-y-auto ${isLight ? 'bg-gray-50' : 'bg-dark-bg'}`}>
      <div className={`glass-card rounded-none h-full w-full p-2 sm:p-4 border backdrop-blur-sm ${
        isLight 
          ? 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200' 
          : 'bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-white/10'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div className="min-w-0 flex-1">
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-1 flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              <LogIn className="w-6 h-6 text-blue-400" /> Logs de Login
            </h1>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>Visualize todos os acessos recentes ao sistema nesta instância.</p>
          </div>
          <div className="flex-shrink-0 flex items-center mt-2 sm:mt-0">
            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
              <AlertDialogTrigger asChild>
                <button
                  disabled={deleting || loginLogs.length === 0}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Eliminar todos os logs de login"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Eliminando...' : 'Eliminar logs'}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className={`glass-card backdrop-blur-sm ${
                isLight ? 'bg-white border-gray-300' : 'bg-slate-800/95 border-white/20'
              }`}>
                <AlertDialogHeader>
                  <AlertDialogTitle className={`flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    <Trash2 className="w-5 h-5 text-red-400" />
                    Confirmar Eliminação
                  </AlertDialogTitle>
                  <AlertDialogDescription className={isLight ? 'text-gray-600' : 'text-slate-300'}>
                    Tem certeza que deseja eliminar <b>todos os logs de login</b>? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel className={`px-6 py-2 rounded-xl ${
                    isLight 
                      ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200' 
                      : 'bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50'
                  }`}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteLogs}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-xl font-semibold"
                  >
                    Eliminar logs
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {loginLogs.length === 0 ? (
          <div className={`text-center py-12 ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>Nenhum log de login encontrado.</div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className={`min-w-full w-full text-sm rounded-none border shadow-lg table-fixed ${
              isLight 
                ? 'bg-white border-gray-200' 
                : 'bg-slate-800/80 border-slate-700'
            }`}>
              <thead>
                <tr className={isLight ? 'bg-gray-50' : 'bg-slate-900/60'}>
                  <th className={`px-4 py-3 text-left font-semibold ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Usuário</th>
                  <th className={`px-4 py-3 text-left font-semibold ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Email</th>
                  <th className={`px-4 py-3 text-left font-semibold ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Cargo</th>
                  <th className={`px-4 py-3 text-left font-semibold ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Data/Hora</th>
                  <th className={`px-4 py-3 text-left font-semibold ${isLight ? 'text-gray-700' : 'text-slate-300'}`}>Tempo</th>
                </tr>
              </thead>
              <tbody>
                {loginLogs.map((log, idx) => (
                  <tr key={idx} className={`border-t transition-colors ${
                    isLight 
                      ? 'border-gray-200 hover:bg-blue-50' 
                      : 'border-slate-700 hover:bg-blue-900/20'
                  }`}>
                    <td className={`px-4 py-2 font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{log.userName || '-'}</td>
                    <td className={`px-4 py-2 ${isLight ? 'text-gray-700' : 'text-slate-200'}`}>{log.userEmail || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        log.details?.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                        log.details?.role === 'manager' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {log.details?.role || '-'}
                      </span>
                    </td>
                    <td className={`px-4 py-2 ${isLight ? 'text-gray-600' : 'text-slate-300'}`}>{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                    <td className={`px-4 py-2 ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>{log.timestamp ? getRelativeTime(log.timestamp) : '-'}</td>
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
