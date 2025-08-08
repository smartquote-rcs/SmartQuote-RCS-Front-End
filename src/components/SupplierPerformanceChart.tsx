import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const performanceData = [
  { month: "Jan", performance: 94.2, trend: 92.1 },
  { month: "Fev", performance: 95.8, trend: 93.4 },
  { month: "Mar", performance: 93.1, trend: 94.2 },
  { month: "Abr", performance: 97.3, trend: 95.1 },
  { month: "Mai", performance: 95.6, trend: 95.8 },
  { month: "Jun", performance: 98.1, trend: 96.5 },
];

const supplierEfficiencyData = [
  { month: "Jan", efficiency: 87.2, cost: 89.1, quality: 92.4 },
  { month: "Fev", efficiency: 89.1, cost: 87.8, quality: 94.2 },
  { month: "Mar", efficiency: 91.3, cost: 86.5, quality: 93.8 },
  { month: "Abr", efficiency: 93.8, cost: 85.2, quality: 95.1 },
  { month: "Mai", efficiency: 95.2, cost: 84.7, quality: 96.3 },
  { month: "Jun", efficiency: 97.1, cost: 83.9, quality: 97.8 },
];

export function SupplierPerformanceChart() {
  return (
    <div className="space-y-6">
      {/* Gráficos principais - Layout Databox */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Performance Trend - Area Chart */}
        <div className="glass-card bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
          <div className="pb-6">
            <h3 className="text-xl font-bold text-white mb-2">Performance dos Fornecedores</h3>
            <p className="text-sm text-slate-300">Tendência de performance nos últimos 6 meses</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis domain={[85, 100]} stroke="#94A3B8" fontSize={12} />
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
                  formatter={(value, name) => [`${value}%`, name === 'performance' ? 'Performance' : 'Meta']}
                />
                <Area 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fill="url(#performanceGradient)"
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: "#3B82F6", strokeWidth: 3, fill: "#FFFFFF" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="trend" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fill="url(#trendGradient)"
                  strokeDasharray="5 5"
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Efficiency Metrics - Multi-line Chart */}
        <div className="glass-card bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
          <div className="pb-6">
            <h3 className="text-xl font-bold text-white mb-2">Métricas de Eficiência</h3>
            <p className="text-sm text-slate-300">Comparativo de eficiência, custo e qualidade</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={supplierEfficiencyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis domain={[80, 100]} stroke="#94A3B8" fontSize={12} />
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
                    `${value}%`, 
                    name === 'efficiency' ? 'Eficiência' : 
                    name === 'cost' ? 'Custo-Benefício' : 'Qualidade'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2, fill: "#FFFFFF" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#F59E0B", strokeWidth: 2, fill: "#FFFFFF" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="quality" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2, fill: "#FFFFFF" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legenda moderna */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-700/50">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-slate-300 font-medium">Eficiência</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-slate-300 font-medium">Custo-Benefício</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-slate-300 font-medium">Qualidade</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}