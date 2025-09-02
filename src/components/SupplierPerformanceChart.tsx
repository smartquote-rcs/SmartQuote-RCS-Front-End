import { useEffect, useState } from "react";
import { useApp } from "./../contexts/AppContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

// Gera dados dinâmicos de performance por mês, usando avaliações reais do campo 'rate'
function getDynamicPerformanceData(suppliers: any[]): { month: string, performance: number, trend: number }[] {
  // Agrupa avaliações por mês/ano (YYYY-MM) usando o campo 'rate' dos fornecedores
  const monthMap: { [key: string]: number[] } = {};
  suppliers.forEach((s: any) => {
    // Usar o campo 'rate' diretamente do backend
    const rating = typeof s.rate === 'number' ? s.rate : 0;
    if (rating === 0) return;
    
    let dateStr = s.atualizado_em || s.updated_at || s.created_at;
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return;
    // Chave: ano-mês (ex: 2025-08)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap[key]) monthMap[key] = [];
    monthMap[key].push(rating * 20); // nota 1-5 para 0-100
  });

  // Pega os últimos 6 meses a partir de hoje
  const now = new Date();
  const months: { key: string, label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('pt-BR', { month: 'short' });
    months.push({ key, label });
  }

  let lastPerf = 0;
  const result = months.map(({ key, label }) => {
    const vals = monthMap[key];
    let perf = 0;
    if (vals && vals.length > 0) {
      perf = Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
      lastPerf = perf;
    }
    return { month: label.charAt(0).toUpperCase() + label.slice(1), performance: perf, trend: lastPerf };
  });

  // Se não houver dados reais, retorna mock
  if (result.every(r => r.performance === 0)) {
    return [
      { month: "Jan", performance: 94.2, trend: 92.1 },
      { month: "Fev", performance: 95.8, trend: 93.4 },
      { month: "Mar", performance: 93.1, trend: 94.2 },
      { month: "Abr", performance: 97.3, trend: 95.1 },
      { month: "Mai", performance: 95.6, trend: 95.8 },
      { month: "Jun", performance: 98.1, trend: 96.5 },
    ];
  }
  return result;
}

// Radar dinâmico: usa dados de cotação (QuoteRequestsPage)
function getDynamicRadarDataFromQuotes(): { metric: string, value: number, fullMark: number }[] {
  // Tenta pegar do localStorage (igual QuoteRequestsPage)
  let cotacoes: any[] = [];
  try {
    const raw = localStorage.getItem('cotacoesList');
    if (raw) cotacoes = JSON.parse(raw);
  } catch {}
  // Se não houver, retorna mock
  if (!cotacoes || cotacoes.length === 0) {
    return [
      { metric: 'Tempo de Entrega', value: 95, fullMark: 100 },
      { metric: 'Qualidade', value: 88, fullMark: 100 },
      { metric: 'Custo-Benefício', value: 92, fullMark: 100 },
      { metric: 'Comunicação', value: 87, fullMark: 100 },
      { metric: 'Flexibilidade', value: 93, fullMark: 100 },
      { metric: 'Inovação', value: 85, fullMark: 100 }
    ];
  }
  // Métricas esperadas nos itens das cotações
  const metrics = [
    { label: 'Tempo de Entrega', key: 'tempo_entrega' },
    { label: 'Qualidade', key: 'qualidade' },
    { label: 'Custo-Benefício', key: 'custo_beneficio' },
    { label: 'Comunicação', key: 'comunicacao' },
    { label: 'Flexibilidade', key: 'flexibilidade' },
    { label: 'Inovação', key: 'inovacao' },
  ];
  // Junta todos os itens de todas as cotações
  let allItens: any[] = [];
  cotacoes.forEach(c => {
    if (Array.isArray(c.itens)) allItens = allItens.concat(c.itens);
  });
  // Para cada métrica, calcula média dos itens que possuem esse campo (0-100)
  const data = metrics.map(({ label, key }) => {
    const vals = allItens.map((item: any) => {
      let v = item[key];
      if (typeof v === 'number') {
        if (v <= 5) return v * 20;
        if (v <= 100) return v;
      }
      return null;
    }).filter((v: number|null) => v !== null);
    let avg = 0;
    if (vals.length > 0) {
      avg = Number((vals.reduce((a, b) => a! + b!, 0) / vals.length).toFixed(1));
    }
    return { metric: label, value: avg, fullMark: 100 };
  });
  // Se todos os valores são 0, retorna mock
  if (data.every(d => d.value === 0)) {
    return [
      { metric: 'Tempo de Entrega', value: 95, fullMark: 100 },
      { metric: 'Qualidade', value: 88, fullMark: 100 },
      { metric: 'Custo-Benefício', value: 92, fullMark: 100 },
      { metric: 'Comunicação', value: 87, fullMark: 100 },
      { metric: 'Flexibilidade', value: 93, fullMark: 100 },
      { metric: 'Inovação', value: 85, fullMark: 100 }
    ];
  }
  return data;
}

// Dados de performance por setor
const sectorData = [
  { sector: 'Tecnologia', performance: 96.2, suppliers: 12, color: '#3B82F6' },
  { sector: 'Logística', performance: 91.7, suppliers: 8, color: '#10B981' },
  { sector: 'Manufatura', performance: 87.3, suppliers: 15, color: '#F59E0B' },
  { sector: 'Serviços', performance: 93.8, suppliers: 6, color: '#8B5CF6' }
];

// topSuppliers will be loaded dynamically from localStorage and suppliers context

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
  const { suppliers } = useApp();
  const [topSuppliers, setTopSuppliers] = useState<{ 
    name: string; 
    score: number; 
    change: number; 
    empresa?: string; 
    telefone?: string; 
    email?: string; 
  }[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
  const [currentPerformance, setCurrentPerformance] = useState(0);
  const [previousPerformance, setPreviousPerformance] = useState(0);
  const isPositive = currentPerformance - previousPerformance > 0;

  // Buscar fornecedores da API
  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const { supplierService } = await import("../api/services");
        const response = await supplierService.getAll();
        
        if (response.success && response.data) {
          let suppliersData = [];
          
          // Verificar diferentes formatos de resposta da API
          if (Array.isArray(response.data)) {
            suppliersData = response.data;
          } else if (Array.isArray(response.data.data)) {
            suppliersData = response.data.data;
          } else if (Array.isArray(response.data.suppliers)) {
            suppliersData = response.data.suppliers;
          }
          
          setAllSuppliers(suppliersData);
        }
      } catch (error) {
        console.error('Erro ao buscar fornecedores:', error);
        // Fallback para dados do contexto se a API falhar
        setAllSuppliers(suppliers);
      }
    }
    
    fetchSuppliers();
  }, [suppliers]);

  // Dados dinâmicos para o gráfico de tendência
  const performanceData = getDynamicPerformanceData(allSuppliers);
  // Dados dinâmicos para o radar (agora usando cotações)
  const radarData = getDynamicRadarDataFromQuotes();

  useEffect(() => {
    if (allSuppliers.length === 0) return;

    // Compose supplier list com dados da API usando o campo 'rate'
    const supplierList = allSuppliers
      .map((s: any) => {
        const idNum = Number(s.id);
        // Usar diretamente o campo 'rate' que vem do backend
        const score = typeof s.rate === 'number' ? s.rate : 0;
        
        return {
          name: s.nome || s.name || `Fornecedor ${idNum}`,
          score: score,
          // Para mudança, usar campo da API ou calcular baseado em dados históricos
          change: s.mudanca_performance || Math.round((Math.random() * 4 - 2) * 10) / 10,
          empresa: s.empresa || '',
          telefone: s.telefone || '',
          email: s.email || ''
        };
      })
      .filter((s: any) => s.score > 0) // Só mostra fornecedores com classificação
      .sort((a: any, b: any) => b.score - a.score); // Ordenar do maior para o menor

    setTopSuppliers(supplierList);
    
    // Calculate current/previous performance for KPI
    if (supplierList.length > 0) {
      const avgScore = supplierList.reduce((acc: number, curr: any) => acc + curr.score, 0) / supplierList.length;
      setCurrentPerformance(Number((avgScore * 20).toFixed(1))); // Converter de 1-5 para 0-100
      setPreviousPerformance(Number((avgScore * 20 * 0.95).toFixed(1))); // Simular performance anterior
    } else {
      setCurrentPerformance(0);
      setPreviousPerformance(0);
    }
  }, [allSuppliers]);

  const performanceChange = currentPerformance - previousPerformance;

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Performance dos Fornecedores</h1>
        <p className="text-slate-400">Monitoramento em tempo real das métricas de fornecedores</p>
      </div>

        {/* KPI Cards - Estilo Databox */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 overflow-x-auto min-w-0">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 overflow-x-auto min-w-0">
          {/* Performance Trend - Gráfico Principal */}
          <div className="xl:col-span-2 bg-slate-800/50 rounded-lg border border-slate-700/50 p-4 md:p-6 shadow-sm backdrop-blur-sm min-w-0 max-w-full">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-1">Tendência de Performance</h3>
              <p className="text-sm text-slate-400">Últimos 6 meses</p>
            </div>
            <div className="h-64 md:h-80 min-w-0">
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

          {/* Top Suppliers - Dynamic from API */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4 md:p-6 shadow-sm backdrop-blur-sm min-w-0 max-w-full">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-1">Top Fornecedores</h3>
              <p className="text-sm text-slate-400">Ranking por classificação (estrelas)</p>
            </div>
            <div className="space-y-4">
              {topSuppliers.length === 0 && (
                <div className="text-slate-400 text-sm">Nenhum fornecedor classificado ainda.</div>
              )}
              {topSuppliers.slice(0, 8).map((supplier, index) => (
                <div key={supplier.name} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-slate-700/30 transition-colors border-b border-slate-700/50 last:border-b-0">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Posição */}
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 1 ? 'bg-slate-400/20 text-slate-300' :
                      index === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {index + 1}
                    </div>
                    
                    {/* Informações do fornecedor */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{supplier.name}</p>
                      {supplier.empresa && (
                        <p className="text-xs text-slate-400 truncate">{supplier.empresa}</p>
                      )}
                      
                      {/* Estrelas de classificação */}
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3 h-3 ${
                              star <= supplier.score ? 'text-yellow-400' : 'text-slate-600'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-slate-400 ml-2">
                          {supplier.score.toFixed(1)}/5.0
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mudança de performance */}
                  <div className={`flex items-center text-sm font-semibold ${
                    supplier.change > 0 ? 'text-green-400' : supplier.change < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {supplier.change > 0 ? 
                      <TrendUpIcon className="w-4 h-4 mr-1" /> : 
                      supplier.change < 0 ?
                      <TrendDownIcon className="w-4 h-4 mr-1" /> :
                      null
                    }
                    {supplier.change > 0 ? '+' : ''}{supplier.change}%
                  </div>
                </div>
              ))}
              
              {topSuppliers.length > 8 && (
                <div className="text-center pt-4">
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                    Ver todos os {topSuppliers.length} fornecedores
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Analysis - Design Revolucionário */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4 md:p-6 shadow-sm backdrop-blur-sm min-w-0 max-w-full">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-1">Análise Multidimensional de Performance</h3>
            <p className="text-sm text-slate-400">Visualização avançada com radar chart e indicadores circulares</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 overflow-x-auto min-w-0">
            {/* Radar Chart */}
            <div className="relative min-w-0 max-w-full">
              <div className="text-center mb-4">
                <h4 className="text-md font-semibold text-white mb-2">Radar de Competências</h4>
                <p className="text-xs text-slate-400">Análise por dimensões de performance</p>
              </div>
              <div className="h-80 md:h-[40rem] min-w-0 max-w-full">
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
            <div className="min-w-0 max-w-full">
              <div className="text-center mb-6">
                <h4 className="text-md font-semibold text-white mb-2">Performance por Setor</h4>
                <p className="text-xs text-slate-400">Indicadores circulares com métricas detalhadas</p>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                {sectorData.map((sector) => (
                  <div key={sector.sector} className="flex flex-wrap items-center space-x-4 min-w-0 max-w-full">
                    {/* Indicador Circular */}
                    <div className="relative w-16 h-16 flex-shrink-0 min-w-0">
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
                    <div className="flex-1 min-w-0 break-words">
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
                            backgroundColor: sector.color,
                            minWidth: 0,
                            maxWidth: '100%'
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
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-slate-700/30 rounded-lg">
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