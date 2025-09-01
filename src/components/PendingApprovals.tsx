import { AlertTriangle, CheckCircle, X, Clock, User } from "lucide-react";

const pendingApprovals = [
  {
    id: "RCS-2024-0892",
    client: "Energia Verde Lda",
    amount: "€2.450.000",
    reason: "Excede limite de €2M",
    assignedTo: "João Silva",
    priority: "high",
    submittedAt: "há 2 horas",
    urgency: 95,
    category: "Energia"
  },
  {
    id: "RCS-2024-0889", 
    client: "Industrial Power Corp",
    amount: "€1.200.000",
    reason: "Requisitos complexos de fornecedor",
    assignedTo: "Maria Santos",
    priority: "medium", 
    submittedAt: "há 5 horas",
    urgency: 67,
    category: "Industrial"
  },
  {
    id: "RCS-2024-0887",
    client: "Energy Solutions Ltd",
    amount: "€3.100.000",
    reason: "Excede limite de €2M",
    assignedTo: "Carlos Mendes",
    priority: "high",
    submittedAt: "há 1 dia",
    urgency: 88,
    category: "Energia"
  }
];

const getPriorityIndicator = (priority: string) => {
  switch (priority) {
    case "high":
      return {
        color: "bg-red-500",
        textColor: "text-red-400",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500/40",
        label: "Alta Prioridade"
      };
    case "medium":
      return {
        color: "bg-yellow-500",
        textColor: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-500/40",
        label: "Prioridade Média"
      };
    case "low":
      return {
        color: "bg-green-500",
        textColor: "text-green-400",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/40",
        label: "Baixa Prioridade"
      };
    default:
      return {
        color: "bg-gray-500",
        textColor: "text-gray-400",
        bgColor: "bg-gray-500/20",
        borderColor: "border-gray-500/40",
        label: priority
      };
  }
};

const getUrgencyColor = (urgency: number) => {
  if (urgency >= 80) return "from-red-500 to-orange-500";
  if (urgency >= 50) return "from-yellow-500 to-orange-500";
  return "from-green-500 to-cyan-500";
};

export function PendingApprovals() {
  return (
    <div className="glass-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 lg:p-6 border border-white/10 backdrop-blur-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 lg:pb-6 space-y-3 lg:space-y-0">
        <div>
          <h3 className="text-lg lg:text-xl font-bold text-white mb-1 flex items-center gap-2">
            <div className="relative">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            Aprovações Pendentes
          </h3>
          <p className="text-sm text-slate-300">
            Cotações aguardando revisão manual
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">{pendingApprovals.length}</div>
            <div className="text-xs text-slate-400">Pendentes</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
        </div>
      </div>
      
      <div className="space-y-4">
        {pendingApprovals.map((approval) => {
          const priority = getPriorityIndicator(approval.priority);
          return (
            <div key={approval.id} className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-700/30 to-slate-800/30 border border-amber-500/20 hover:border-amber-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
              {/* Priority Indicator */}
              <div className={`absolute left-0 top-0 w-1 h-full ${priority.color}`}></div>
              
              <div className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4 space-y-3 lg:space-y-0">
                  <div className="flex-1 min-w-0 pl-3">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="font-mono text-sm font-bold text-white bg-slate-700/50 px-2 py-1 rounded-md">
                        {approval.id}
                      </span>
                      <div className={`${priority.bgColor} ${priority.textColor} px-2 py-1 rounded-full border ${priority.borderColor}`}>
                        <span className="text-xs font-medium">{priority.label}</span>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-700/30 px-2 py-1 rounded-md">
                        {approval.category}
                      </span>
                    </div>
                    
                    <div className="text-white font-medium mb-3">{approval.client}</div>
                    
                    {/* Urgency Meter */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-400">Urgência</span>
                        <span className="text-xs font-bold text-white">{approval.urgency}%</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getUrgencyColor(approval.urgency)} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${approval.urgency}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{approval.amount}</div>
                      <div className="text-xs text-slate-400">Valor Total</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 transition-all duration-200 hover:scale-110 border border-green-500/30">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-110 border border-red-500/30">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pl-3">
                  <div className="flex items-center space-x-2 bg-slate-700/30 rounded-lg p-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs text-slate-400">Motivo</div>
                      <div className="text-xs text-white font-medium">{approval.reason}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-slate-700/30 rounded-lg p-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-xs text-slate-400">Responsável</div>
                      <div className="text-xs text-white font-medium">{approval.assignedTo}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-slate-700/30 rounded-lg p-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-xs text-slate-400">Submetido</div>
                      <div className="text-xs text-white font-medium">{approval.submittedAt}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Action Button */}
      <div className="mt-6 text-center">
        <button className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-400 px-6 py-2 rounded-lg border border-amber-500/30 hover:border-amber-400/50 transition-all duration-300 text-sm font-medium">
          Revisar Todas as Aprovações
        </button>
      </div>
    </div>
  );
}