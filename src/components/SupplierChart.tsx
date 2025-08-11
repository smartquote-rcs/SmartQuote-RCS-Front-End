import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const supplierData = [
  { name: "GreenSolar", performance: 99, quotes: 45 },
  { name: "EnerTech", performance: 98, quotes: 52 },
  { name: "TechFlow", performance: 95, quotes: 38 },
  { name: "PrintMax", performance: 92, quotes: 29 },
  { name: "DataCore", performance: 91, quotes: 33 },
  { name: "MetalWorks", performance: 88, quotes: 21 },
  { name: "PlasticPro", performance: 85, quotes: 18 },
];

export function SupplierChart() {
  return (
    <div className="glass-card bg-white/5 rounded-xl p-3 lg:p-4 border border-white/20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 lg:pb-4 space-y-3 lg:space-y-0">
        <div>
          <h3 className="text-base lg:text-lg font-bold text-dark-primary mb-1">
            Performance por Fornecedor
          </h3>
          <p className="text-xs lg:text-sm text-dark-secondary font-medium">
            Classificação baseada na taxa de aprovação
          </p>
        </div>
        <button className="dark-button-secondary text-xs self-start lg:self-auto">Ver Todos</button>
      </div>
      <div className="h-64 lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={supplierData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" domain={[80, 100]} stroke="#9CA3AF" fontSize={12} />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#9CA3AF" 
              fontSize={12}
              width={80}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#F9FAFB"
              }}
              formatter={(value) => [`${value}%`, "Performance"]}
            />
            <Bar 
              dataKey="performance" 
              fill="#10B981" 
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
