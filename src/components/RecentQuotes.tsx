import { Badge } from "./ui/badge";
import { Eye, Download, Clock } from "lucide-react";

const recentQuotes = [
  {
    id: "RCS-2024-0892",
    client: "Energia Verde Lda", 
    amount: "€2.450.000",
    status: "pending_approval",
    time: "há 2 horas"
  },
  {
    id: "RCS-2024-0891",
    client: "TechFlow Solutions",
    amount: "€450.000", 
    status: "processed",
    time: "há 4 horas"
  },
  {
    id: "RCS-2024-0890",
    client: "Impressões Digitais",
    amount: "€85.000",
    status: "sent",
    time: "há 1 dia"
  },
  {
    id: "RCS-2024-0889", 
    client: "Industrial Power Corp",
    amount: "€1.200.000",
    status: "processing",
    time: "há 3 horas"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "processing":
      return <Badge className="bg-blue-600 text-white text-xs">Processando</Badge>;
    case "processed":
      return <Badge className="bg-green-600 text-white text-xs">Processada</Badge>;
    case "pending_approval":
      return <Badge className="bg-orange-600 text-white text-xs">Pendente</Badge>;
    case "sent":
      return <Badge className="bg-purple-600 text-white text-xs">Enviada</Badge>;
    default:
      return <Badge className="text-xs">{status}</Badge>;
  }
};

export function RecentQuotes() {
  return (
    <div className="glass-card bg-white/5 rounded-xl p-3 lg:p-4 border border-white/20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 lg:pb-4 space-y-3 lg:space-y-0">
        <div>
          <h3 className="text-base lg:text-lg font-bold text-dark-primary mb-1">Cotações Recentes</h3>
          <p className="text-xs lg:text-sm text-dark-secondary font-medium">
            Atividade mais recente de processamento de cotações
          </p>
        </div>
        <button className="dark-button-secondary text-xs self-start lg:self-auto">Ver Todas</button>
      </div>
      <div className="space-y-3">
        {recentQuotes.map((quote) => (
          <div key={quote.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-3 lg:p-4 rounded-xl bg-dark-bg border border-dark-color hover:border-dark-cta transition-colors space-y-2 lg:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-3">
                <span className="font-mono text-sm font-medium text-dark-primary">{quote.id}</span>
                {getStatusBadge(quote.status)}
              </div>
              <div className="text-sm text-dark-secondary mb-2">{quote.client}</div>
              <div className="text-xs text-dark-secondary">{quote.time}</div>
            </div>
            <div className="flex items-center justify-between lg:justify-end lg:text-right space-x-4">
              <div className="font-bold text-dark-primary text-lg lg:text-xl">{quote.amount}</div>
              <div className="flex items-center space-x-2">
                <button className="p-1 rounded bg-dark-tag hover:bg-dark-hover transition-colors">
                  <Eye className="w-3 h-3 text-dark-secondary" />
                </button>
                <button className="p-1 rounded bg-dark-tag hover:bg-dark-hover transition-colors">
                  <Download className="w-3 h-3 text-dark-secondary" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}