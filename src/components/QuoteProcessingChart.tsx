import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Search } from "lucide-react";
import { useState } from "react";

const processingData = [
  { date: "18 Jan", received: 75, processed: 72, pending: 3, efficiency: 93.3 },
  { date: "19 Jan", received: 82, processed: 78, pending: 4, efficiency: 92.3 },
  { date: "20 Jan", received: 68, processed: 66, pending: 2, efficiency: 94.7 },
  { date: "21 Jan", received: 97, processed: 92, pending: 5, efficiency: 92.5 },
  { date: "22 Jan", received: 104, processed: 99, pending: 5, efficiency: 93.2 },
  { date: "23 Jan", received: 89, processed: 85, pending: 4, efficiency: 93.2 },
  { date: "24 Jan", received: 111, processed: 106, pending: 5, efficiency: 93.8 },
];

export function QuoteProcessingChart() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      {/* Gráfico Principal - Area Chart estilo Databox */}
      <div className="glass-card bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Processamento de Cotações</h3>
              <p className="text-sm text-slate-300">Volume e eficiência dos últimos 7 dias</p>
            </div>
            
            {/* Campo de Pesquisa */}
            <div className="relative max-w-md group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Pesquisar período..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 h-10 bg-slate-800/50 border border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none rounded-lg backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/50"
              />
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processingData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="processedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "12px",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  backdropFilter: "blur(16px)"
                }}
                formatter={(value, name) => [
                  `${value}${name === 'efficiency' ? '%' : ' cotações'}`,
                  name === 'received' ? 'Recebidas' : 
                  name === 'processed' ? 'Processadas' : 
                  name === 'pending' ? 'Pendentes' : 'Eficiência'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="received" 
                stroke="#10B981" 
                strokeWidth={3}
                fill="url(#receivedGradient)"
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2, fill: "#FFFFFF" }}
              />
              <Area 
                type="monotone" 
                dataKey="processed" 
                stroke="#3B82F6" 
                strokeWidth={3}
                fill="url(#processedGradient)"
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2, fill: "#FFFFFF" }}
              />
              <Area 
                type="monotone" 
                dataKey="pending" 
                stroke="#F59E0B" 
                strokeWidth={2}
                fill="url(#pendingGradient)"
                dot={{ fill: "#F59E0B", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "#F59E0B", strokeWidth: 2, fill: "#FFFFFF" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda moderna */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-slate-300 font-medium">Recebidas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-slate-300 font-medium">Processadas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-slate-300 font-medium">Pendentes</span>
          </div>
        </div>
      </div>
    </div>
  );
}