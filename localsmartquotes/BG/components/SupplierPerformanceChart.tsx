import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const supplierData = [
  { name: "Energia", value: 42, color: "#3B82F6" },
  { name: "TI", value: 28, color: "#22C55E" },
  { name: "Impressão", value: 18, color: "#F59E0B" },
  { name: "Outros", value: 12, color: "#8B5CF6" },
];

export function SupplierPerformanceChart() {
  return (
    <div className="dark-card">
      <div className="pb-6">
        <h3 className="text-lg lg:text-xl font-bold text-dark-primary mb-2">Distribuição de Fornecedores</h3>
        <p className="text-sm lg:text-base text-dark-secondary font-medium">
          Fornecedores ativos por categoria e métricas de desempenho
        </p>
      </div>
      <div className="h-64 lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={supplierData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              stroke="#1E293B"
              strokeWidth={2}
            >
              {supplierData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: "#1E293B",
                border: "1px solid #374151",
                borderRadius: "12px",
                boxShadow: "rgba(0, 0, 0, 0.4) 0px 8px 24px",
                color: "#FFFFFF"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
