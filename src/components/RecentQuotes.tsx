import { Badge } from "./ui/badge";
import { Eye, Download, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

const recentQuotes = [
  {
    id: "RCS-2024-0892",
    client: "Energia Verde Lda", 
    amount: "€2.450.000",
    status: "pending_approval",
    time: "há 2 horas",
    category: "Energia",
    progress: 85,
    priority: "high"
  },
  {
    id: "RCS-2024-0891",
    client: "TechFlow Solutions",
    amount: "€450.000", 
    status: "processed",
    time: "há 4 horas",
    category: "TI",
    progress: 100,
    priority: "medium"
  },
  {
    id: "RCS-2024-0890",
    client: "Impressões Digitais",
    amount: "€85.000",
    status: "sent",
    time: "há 1 dia",
    category: "Impressão",
    progress: 100,
    priority: "low"
  },
  {
    id: "RCS-2024-0889", 
    client: "Industrial Power Corp",
    amount: "€1.200.000",
    status: "processing",
    time: "há 3 horas",
    category: "Industrial",
    progress: 45,
    priority: "high"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "processing":
      return (
        <div className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
          <Clock className="w-3 h-3" />
          <span className="text-xs font-medium">Processando</span>
        </div>
      );
    case "processed":
      return (
        <div className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
          <CheckCircle2 className="w-3 h-3" />
          <span className="text-xs font-medium">Processada</span>
        </div>
      );
    case "pending_approval":
      return (
        <div className="flex items-center space-x-1 bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full border border-amber-500/30">
          <Clock className="w-3 h-3" />
          <span className="text-xs font-medium">Pendente</span>
        </div>
      );
    case "sent":
      return (
        <div className="flex items-center space-x-1 bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full border border-purple-500/30">
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs font-medium">Enviada</span>
        </div>
      );
    default:
      return <Badge className="text-xs">{status}</Badge>;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-500";
    case "medium": return "bg-yellow-500";
    case "low": return "bg-green-500";
    default: return "bg-gray-500";
  }
};

export function RecentQuotes() {
  return (
    <div className="glass-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 lg:p-6 border border-white/10 backdrop-blur-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 lg:pb-6 space-y-3 lg:space-y-0">
        <div>
          <h3 className="text-lg lg:text-xl font-bold text-white mb-1">Cotações Recentes</h3>
          <p className="text-sm text-slate-300">
            Últimas atividades e processamentos IA
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {recentQuotes.map((quote) => (
          <div key={quote.id} className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-700/30 to-slate-800/30 border border-slate-600/30 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
            {/* Priority Indicator */}
            <div className={`absolute left-0 top-0 w-1 h-full ${getPriorityColor(quote.priority)}`}></div>
            
            <div className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                <div className="flex-1 min-w-0 pl-3">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="font-mono text-sm font-bold text-white bg-slate-700/50 px-2 py-1 rounded-md">
                      {quote.id}
                    </span>
                    {getStatusBadge(quote.status)}
                    <span className="text-xs text-slate-400 bg-slate-700/30 px-2 py-1 rounded-md">
                      {quote.category}
                    </span>
                  </div>
                  
                  <div className="text-white font-medium mb-2">{quote.client}</div>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-400">Progresso</span>
                      <span className="text-xs text-slate-400">{quote.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${quote.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-400">{quote.time}</div>
                </div>
                
                <div className="flex items-center justify-between lg:justify-end lg:text-right space-x-4">
                  <div className="text-right">
                    <div className="font-bold text-white text-xl lg:text-2xl">{quote.amount}</div>
                    <div className="text-xs text-slate-400">Valor Total</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg bg-slate-700/50 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-all duration-200 hover:scale-110">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-slate-700/50 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-all duration-200 hover:scale-110">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* View All Button */}
      <div className="mt-6 text-center">
        <button className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-400 px-6 py-2 rounded-lg border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 text-sm font-medium">
          Ver Todas as Cotações
        </button>
      </div>
    </div>
  );
}