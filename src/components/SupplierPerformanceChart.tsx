import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

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

// Dados para o gráfico radar (performance por categoria)
const radarData = [
  { metric: 'Tempo de Entrega', value: 95, fullMark: 100 },
  { metric: 'Qualidade', value: 88, fullMark: 100 },
  { metric: 'Custo-Benefício', value: 92, fullMark: 100 },
  { metric: 'Comunicação', value: 87, fullMark: 100 },
  { metric: 'Flexibilidade', value: 93, fullMark: 100 },
  { metric: 'Inovação', value: 85, fullMark: 100 }
];

// Dados de performance por setor
const sectorData = [
  { sector: 'Tecnologia', performance: 96.2, suppliers: 12, color: '#3B82F6' },
  { sector: 'Logística', performance: 91.7, suppliers: 8, color: '#10B981' },
  { sector: 'Manufatura', performance: 87.3, suppliers: 15, color: '#F59E0B' },
  { sector: 'Serviços', performance: 93.8, suppliers: 6, color: '#8B5CF6' }
];

const topSuppliers = [
  { name: "TechCorp", score: 98.1, change: 2.3 },
  { name: "InnovaSupply", score: 96.5, change: 1.8 },
  { name: "QualityParts", score: 94.2, change: -0.5 },
  { name: "GlobalTech", score: 92.8, change: 0.9 },
];

// Ícones estilo Databox - minimalistas
const TrendUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22,12 18,8 13,13 9,9 2,16" />
    <polyline points="16,8 22,8 22,14" />
  </svg>
);

const TrendDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22,12 18,16 13,11 9,15 2,8" />
    <polyline points="16,16 22,16 22,10" />
  </svg>
);

export function SupplierPerformanceChart() {
  const currentPerformance = 98.1;
  const previousPerformance = 95.6;
  const performanceChange = currentPerformance - previousPerformance;
  const isPositive = performanceChange > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Performance dos Fornecedores</h1>
        <p className="text-slate-400">Monitoramento em tempo real das métricas de fornecedores</p>
      </div>

        {/* KPI Cards - Estilo Databox */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Performance Principal */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                Performance Geral
              </div>
              <div className={`flex items-center text-sm font-semibold ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {isPositive ? <TrendUpIcon className="w-4 h-4 mr-1" /> : <TrendDownIcon className="w-4 h-4 mr-1" />}
                {isPositive ? '+' : ''}{performanceChange.toFixed(1)}%
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{currentPerformance}%</div>
            <div className="text-sm text-slate-400">vs. mês anterior</div>
          </div>

          {/* Custo-Benefício */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                Custo-Benefício
              </div>
              <div className="flex items-center text-sm font-semibold text-green-400">
                <TrendUpIcon className="w-4 h-4 mr-1" />
                +5.2%
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">83.9%</div>
            <div className="text-sm text-slate-400">Redução de custos</div>
          </div>

          {/* Qualidade */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                Qualidade
              </div>
              <div className="flex items-center text-sm font-semibold text-green-400">
                <TrendUpIcon className="w-4 h-4 mr-1" />
                +1.5%
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">97.8%</div>
            <div className="text-sm text-slate-400">Índice de qualidade</div>
          </div>

          {/* Eficiência */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                Eficiência
              </div>
              <div className="flex items-center text-sm font-semibold text-green-400">
                <TrendUpIcon className="w-4 h-4 mr-1" />
                +1.9%
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">97.1%</div>
            <div className="text-sm text-slate-400">Eficiência operacional</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Performance Trend - Gráfico Principal */}
          <div className="xl:col-span-2 bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-1">Tendência de Performance</h3>
              <p className="text-sm text-slate-400">Últimos 6 meses</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94A3B8" 
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[85, 100]} 
                    stroke="#94A3B8" 
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      fontSize: "14px",
                      color: "#FFFFFF"
                    }}
                    formatter={(value, name) => [`${value}%`, name === 'performance' ? 'Performance' : 'Meta']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fill="url(#performanceGradient)"
                    dot={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="trend" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    fill="none"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Suppliers */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 shadow-sm backdrop-blur-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-1">Top Fornecedores</h3>
              <p className="text-sm text-slate-400">Ranking por performance</p>
            </div>
            <div className="space-y-4">
              {topSuppliers.map((supplier, index) => (
                <div key={supplier.name} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{supplier.name}</p>
                      <p className="text-sm text-slate-400">{supplier.score}%</p>
                    </div>
                  </div>
                  <div className={`flex items-center text-sm font-semibold ${
                    supplier.change > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {supplier.change > 0 ? 
                      <TrendUpIcon className="w-4 h-4 mr-1" /> : 
                      <TrendDownIcon className="w-4 h-4 mr-1" />
                    }
                    {supplier.change > 0 ? '+' : ''}{supplier.change}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Analysis - Design Revolucionário */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 shadow-sm backdrop-blur-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-1">Análise Multidimensional de Performance</h3>
            <p className="text-sm text-slate-400">Visualização avançada com radar chart e indicadores circulares</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <div className="relative">
              <div className="text-center mb-4">
                <h4 className="text-md font-semibold text-white mb-2">Radar de Competências</h4>
                <p className="text-xs text-slate-400">Análise por dimensões de performance</p>
              </div>
              <div className="h-[40rem]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 120, right: 80, bottom: 60, left: 80 }}>
                    <PolarGrid stroke="#334155" opacity={0.3} />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      className="text-xs"
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      tickCount={5}
                    />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                    <Radar
                      name="Meta"
                      dataKey="fullMark"
                      stroke="#10B981"
                      fill="none"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#FFFFFF"
                      }}
                      formatter={(value, name) => [`${value}%`, name === 'value' ? 'Atual' : 'Meta']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Indicadores Circulares por Setor */}
            <div>
              <div className="text-center mb-6">
                <h4 className="text-md font-semibold text-white mb-2">Performance por Setor</h4>
                <p className="text-xs text-slate-400">Indicadores circulares com métricas detalhadas</p>
              </div>
              
              <div className="space-y-6">
                {sectorData.map((sector) => (
                  <div key={sector.sector} className="flex items-center space-x-4">
                    {/* Indicador Circular */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                        {/* Círculo de fundo */}
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#334155"
                          strokeWidth="4"
                          fill="none"
                          opacity="0.3"
                        />
                        {/* Círculo de progresso */}
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={sector.color}
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${(sector.performance / 100) * 175.929} 175.929`}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      {/* Porcentagem no centro */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {sector.performance}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Informações do Setor */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-semibold text-white">{sector.sector}</h5>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-400">{sector.suppliers} fornecedores</span>
                          <div className={`flex items-center text-xs font-semibold ${
                            sector.performance > 90 ? 'text-green-400' : 
                            sector.performance > 85 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {sector.performance > 90 ? 
                              <TrendUpIcon className="w-3 h-3 mr-1" /> : 
                              sector.performance > 85 ?
                              <span className="w-3 h-0.5 bg-yellow-400 mr-1"></span> :
                              <TrendDownIcon className="w-3 h-3 mr-1" />
                            }
                            {sector.performance > 90 ? 'Excelente' : 
                             sector.performance > 85 ? 'Bom' : 'Melhorar'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Barra de progresso */}
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${sector.performance}%`,
                            backgroundColor: sector.color
                          }}
                        ></div>
                      </div>
                      
                      {/* Estatísticas detalhadas */}
                      <div className="mt-2 flex justify-between text-xs text-slate-400">
                        <span>Meta: 90%</span>
                        <span>Trend: {sector.performance > 90 ? '+2.1%' : sector.performance > 85 ? '+0.8%' : '-1.2%'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Resumo Geral */}
              <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-white">Resumo Geral</h5>
                  <div className="flex items-center text-green-400 text-sm font-semibold">
                    <TrendUpIcon className="w-4 h-4 mr-1" />
                    Performance Global: 92.3%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Melhor Setor:</span>
                    <span className="text-blue-400 ml-2 font-semibold">Tecnologia</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Oportunidade:</span>
                    <span className="text-amber-400 ml-2 font-semibold">Manufatura</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}