import { Badge } from "./ui/badge";
import { AlertTriangle, CheckCircle, X, Clock } from "lucide-react";

const pendingApprovals = [
  {
    id: "RCS-2024-0892",
    client: "Energia Verde Lda",
    amount: "€2.450.000",
    reason: "Excede limite de €2M",
    assignedTo: "João Silva",
    priority: "high",
    submittedAt: "há 2 horas"
  },
  {
    id: "RCS-2024-0889", 
    client: "Industrial Power Corp",
    amount: "€1.200.000",
    reason: "Requisitos complexos de fornecedor",
    assignedTo: "Maria Santos",
    priority: "medium", 
    submittedAt: "há 5 horas"
  },
  {
    id: "RCS-2024-0887",
    client: "Energy Solutions Ltd",
    amount: "€3.100.000",
    reason: "Excede limite de €2M",
    assignedTo: "Carlos Mendes",
    priority: "high",
    submittedAt: "há 1 dia"
  }
];

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return <Badge className="bg-red-500 text-white text-xs">Alta</Badge>;
    case "medium":
      return <Badge className="bg-yellow-500 text-white text-xs">Média</Badge>;
    case "low":
      return <Badge className="bg-green-500 text-white text-xs">Baixa</Badge>;
    default:
      return <Badge className="text-xs">{priority}</Badge>;
  }
};

export function PendingApprovals() {
  return (
    <div className="dark-card">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-lg lg:text-xl font-bold text-dark-primary mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Aprovações Pendentes
          </h3>
          <p className="text-sm lg:text-base text-dark-secondary font-medium">
            Cotações que requerem revisão manual e aprovação
          </p>
        </div>
        <button className="dark-button-secondary text-sm self-start lg:self-auto">Ver Todas</button>
      </div>
      <div className="space-y-4">
        {pendingApprovals.map((approval) => (
          <div key={approval.id} className="p-4 rounded-xl bg-dark-bg border border-orange-500/20 hover:border-orange-500/40 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-3 space-y-3 lg:space-y-0">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2">
                  <span className="font-mono text-sm font-medium text-dark-primary">{approval.id}</span>
                  {getPriorityBadge(approval.priority)}
                </div>
                <div className="text-sm text-dark-secondary mb-1">{approval.client}</div>
                <div className="font-bold text-dark-primary text-lg">{approval.amount}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors">
                  <CheckCircle className="w-4 h-4 text-white" />
                </button>
                <button className="p-2 rounded-lg bg-red-600 hover:bg-red-500 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-1 lg:space-y-0">
                <span className="text-dark-secondary">Motivo:</span>
                <span className="text-dark-primary">{approval.reason}</span>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-1 lg:space-y-0">
                <span className="text-dark-secondary">Responsável:</span>
                <span className="text-dark-primary">{approval.assignedTo}</span>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-1 lg:space-y-0">
                <span className="text-dark-secondary">Submetido:</span>
                <span className="text-dark-primary">{approval.submittedAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}