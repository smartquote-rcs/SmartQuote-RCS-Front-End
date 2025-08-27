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


export function LoginLogsPage() {
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
    <div className="flex flex-col h-full w-full p-0 sm:p-0 lg:p-0 bg-dark-bg overflow-y-auto">
      <div className="glass-card bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-none h-full w-full p-2 sm:p-4 border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 flex items-center gap-2">
              <LogIn className="w-6 h-6 text-blue-400" /> Logs de Login
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">Visualize todos os acessos recentes ao sistema nesta instância.</p>
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
              <AlertDialogContent className="glass-card border-white/20 bg-slate-800/95 backdrop-blur-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-red-400" />
                    Confirmar Eliminação
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-300">
                    Tem certeza que deseja eliminar <b>todos os logs de login</b>? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 px-6 py-2 rounded-xl">
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
          <div className="text-slate-400 text-center py-12">Nenhum log de login encontrado.</div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="min-w-full w-full text-sm bg-slate-800/80	rounded-none border border-slate-700 shadow-lg table-fixed">
              <thead>
                <tr className="bg-slate-900/60">
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Usuário</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Cargo</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Data/Hora</th>
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Tempo</th>
                </tr>
              </thead>
              <tbody>
                {loginLogs.map((log, idx) => (
                  <tr key={idx} className="border-t border-slate-700 hover:bg-blue-900/20 transition-colors">
                    <td className="px-4 py-2 text-white font-medium">{log.userName || '-'}</td>
                    <td className="px-4 py-2 text-slate-200">{log.userEmail || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        log.details?.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                        log.details?.role === 'manager' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {log.details?.role || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-300">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                    <td className="px-4 py-2 text-slate-400">{log.timestamp ? getRelativeTime(log.timestamp) : '-'}</td>
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
