import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const processingData = [
  { date: "18 Jan", received: 12, processed: 11, pending: 1 },
  { date: "19 Jan", received: 15, processed: 14, pending: 2 },
  { date: "20 Jan", received: 8, processed: 8, pending: 2 },
  { date: "21 Jan", received: 18, processed: 16, pending: 4 },
  { date: "22 Jan", received: 22, processed: 20, pending: 6 },
  { date: "23 Jan", received: 14, processed: 13, pending: 7 },
  { date: "24 Jan", received: 16, processed: 12, pending: 11 },
];

export function QuoteProcessingChart() {
  return (
    <div className="dark-card">
      <div className="pb-6">
        <h3 className="text-lg lg:text-xl font-bold text-dark-primary mb-2">Tendências de Processamento</h3>
        <p className="text-sm lg:text-base text-dark-secondary font-medium">
          Volume diário de processamento e desempenho da automação IA
        </p>
      </div>
      <div className="h-64 lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processingData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#94A3B8"
              fontSize={12}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#94A3B8"
              fontSize={12}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "#1E293B",
                border: "1px solid #374151",
                borderRadius: "12px",
                boxShadow: "rgba(0, 0, 0, 0.4) 0px 8px 24px",
                fontWeight: 500,
                color: "#FFFFFF"
              }}
              labelStyle={{ color: "#FFFFFF" }}
            />
            <Bar 
              dataKey="received" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
              name="Recebidas"
            />
            <Bar 
              dataKey="processed" 
              fill="#22C55E" 
              radius={[4, 4, 0, 0]}
              name="Processadas"
            />
            <Bar 
              dataKey="pending" 
              fill="#F59E0B" 
              radius={[4, 4, 0, 0]}
              name="Pendentes"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}