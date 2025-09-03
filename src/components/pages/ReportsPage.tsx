import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { BarChart3, Calendar, TrendingUp, Users, ShoppingCart, Target } from "lucide-react";
import { cotacaoService, produtoService, supplierService } from "../../api/services";
import { useCurrency } from "../../hooks/useCurrency";

interface ReportData {
  totalCotacoes: number;
  cotacoesAprovadas: number;
  cotacoesRejeitadas: number;
  cotacoesPendentes: number;
  totalProdutos: number;
  totalFornecedores: number;
  valorTotalCotacoes: number;
  mediaValorCotacao: number;
}

export function ReportsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    totalCotacoes: 0,
    cotacoesAprovadas: 0,
    cotacoesRejeitadas: 0,
    cotacoesPendentes: 0,
    totalProdutos: 0,
    totalFornecedores: 0,
    valorTotalCotacoes: 0,
    mediaValorCotacao: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  // Listener para mudanças na configuração de moeda
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'smartquote-general-settings' && e.newValue) {
        try {
          const settings = JSON.parse(e.newValue);
          const oldSettings = e.oldValue ? JSON.parse(e.oldValue) : {};
          
          // Verifica se a moeda mudou
          if (settings.currency !== oldSettings.currency) {
            console.log('ReportsPage: Moeda alterada, recarregando dados...', {
              de: oldSettings.currency,
              para: settings.currency
            });
            // Recarrega os dados com a nova moeda
            fetchReportData();
          }
        } catch (error) {
          console.warn('ReportsPage: Erro ao processar mudança de configuração:', error);
        }
      }
    };

    // Listener para eventos customizados de mudança de moeda
    const handleCurrencyChange = () => {
      console.log('ReportsPage: Evento de mudança de moeda detectado, recarregando dados...');
      fetchReportData();
    };

    // Escuta mudanças no localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Escuta eventos customizados de mudança de moeda
    window.addEventListener('currencyChanged', handleCurrencyChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('currencyChanged', handleCurrencyChange);
    };
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('ReportsPage: fetchReportData iniciado');
      
      // Buscar dados das cotações
      const cotacoesResult = await cotacaoService.getAll();
      let cotacoes: any[] = [];
      
      if (cotacoesResult.success && cotacoesResult.data) {
        cotacoes = Array.isArray(cotacoesResult.data?.data) ? cotacoesResult.data.data : [];
      }

      // Buscar dados dos produtos
      const produtosResult = await produtoService.getAll();
      let produtos: any[] = [];
      
      if (produtosResult.success && produtosResult.data) {
        produtos = Array.isArray(produtosResult.data?.data) ? produtosResult.data.data : [];
      }

      // Buscar dados dos fornecedores
      const fornecedoresResult = await supplierService.getAll();
      let fornecedores: any[] = [];
      
      if (fornecedoresResult.success && fornecedoresResult.data) {
        fornecedores = Array.isArray(fornecedoresResult.data?.data) ? fornecedoresResult.data.data : [];
      }

      // Calcular estatísticas
      const aprovadas = cotacoes.filter(c => c.aprovacao === true).length;
      const rejeitadas = cotacoes.filter(c => c.aprovacao === false).length;
      const pendentes = cotacoes.filter(c => c.aprovacao === null || c.aprovacao === undefined).length;
      
      const valores = cotacoes
        .map(c => parseFloat(c.valor || c.orcamento_geral || '0'))
        .filter(v => !isNaN(v) && v > 0);
      
      const valorTotal = valores.reduce((sum, val) => sum + val, 0);
      const mediaValor = valores.length > 0 ? valorTotal / valores.length : 0;

      setReportData({
        totalCotacoes: cotacoes.length,
        cotacoesAprovadas: aprovadas,
        cotacoesRejeitadas: rejeitadas,
        cotacoesPendentes: pendentes,
        totalProdutos: produtos.length,
        totalFornecedores: fornecedores.length,
        valorTotalCotacoes: valorTotal,
        mediaValorCotacao: mediaValor
      });

      console.log('ReportsPage: dados processados:', {
        cotacoes: cotacoes.length,
        produtos: produtos.length,
        fornecedores: fornecedores.length
      });

    } catch (error) {
      console.error('ReportsPage: erro ao buscar dados:', error);
      setError('Erro ao carregar dados dos relatórios');
    } finally {
      setLoading(false);
    }
  };

  // Funções para download de PDF
  const downloadCotacoesPDF = () => {
    try {
      const cotacoesData = {
        total: reportData.totalCotacoes,
        aprovadas: reportData.cotacoesAprovadas,
        rejeitadas: reportData.cotacoesRejeitadas,
        pendentes: reportData.cotacoesPendentes,
        valorTotal: formatCurrency(reportData.valorTotalCotacoes),
        valorMedio: formatCurrency(reportData.mediaValorCotacao),
        periodo: selectedPeriod
      };

      // Criar conteúdo do PDF
      const content = [
        '📊 RELATÓRIO DE COTAÇÕES',
        '═══════════════════════════════',
        '',
        `📅 Período: Últimos ${selectedPeriod} dias`,
        `📈 Total de Cotações: ${cotacoesData.total}`,
        `✅ Aprovadas: ${cotacoesData.aprovadas}`,
        `❌ Rejeitadas: ${cotacoesData.rejeitadas}`,
        `⏳ Pendentes: ${cotacoesData.pendentes}`,
        `💰 Valor Total: ${cotacoesData.valorTotal}`,
        `📊 Valor Médio: ${cotacoesData.valorMedio}`,
        '',
        `📅 Gerado em: ${new Date().toLocaleDateString('pt-PT')}`,
        '═══════════════════════════════'
      ].join('\n');

      // Simular download (em produção, usar uma biblioteca como jsPDF)
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cotacoes_relatorio_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('✅ Relatório de Cotações baixado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao gerar relatório de cotações:', error);
    }
  };

  const downloadProdutosPDF = () => {
    try {
      const content = [
        '📦 RELATÓRIO DE PRODUTOS',
        '═══════════════════════════════',
        '',
        `📅 Período: Últimos ${selectedPeriod} dias`,
        `📦 Total de Produtos: ${reportData.totalProdutos}`,
        `🏪 Total de Fornecedores: ${reportData.totalFornecedores}`,
        '',
        '📋 Status dos Produtos:',
        '• Ativos no sistema',
        '• Disponíveis para cotação',
        '• Vinculados aos fornecedores',
        '',
        `📅 Gerado em: ${new Date().toLocaleDateString('pt-PT')}`,
        '═══════════════════════════════'
      ].join('\n');

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `produtos_relatorio_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('✅ Relatório de Produtos baixado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao gerar relatório de produtos:', error);
    }
  };

  const downloadFornecedoresPDF = () => {
    try {
      const content = [
        '🏢 RELATÓRIO DE FORNECEDORES',
        '═══════════════════════════════',
        '',
        `📅 Período: Últimos ${selectedPeriod} dias`,
        `🏢 Total de Fornecedores: ${reportData.totalFornecedores}`,
        `📦 Total de Produtos: ${reportData.totalProdutos}`,
        `📊 Total de Cotações: ${reportData.totalCotacoes}`,
        '',
        '📋 Informações dos Fornecedores:',
        '• Fornecedores ativos',
        '• Produtos por fornecedor',
        '• Performance nas cotações',
        '',
        `📅 Gerado em: ${new Date().toLocaleDateString('pt-PT')}`,
        '═══════════════════════════════'
      ].join('\n');

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fornecedores_relatorio_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('✅ Relatório de Fornecedores baixado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao gerar relatório de fornecedores:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: "blue" | "green" | "orange" | "purple" | "red";
  }) => {
    const colorClasses = {
      blue: "from-blue-600/20 to-cyan-600/20 text-blue-400",
      green: "from-green-600/20 to-emerald-600/20 text-green-400",
      orange: "from-orange-600/20 to-amber-600/20 text-orange-400",
      purple: "from-purple-600/20 to-pink-600/20 text-purple-400",
      red: "from-red-600/20 to-rose-600/20 text-red-400"
    };

    return (
      <Card className="glass-card bg-dark-card border border-dark-color hover:border-cyan-400/40 transition-all duration-300">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-2 sm:pr-3">
              <p className="text-dark-secondary text-xs sm:text-sm font-medium truncate">{title}</p>
              <p className="text-dark-primary-text text-lg sm:text-xl lg:text-2xl font-bold mt-0.5 sm:mt-1 truncate">{value}</p>
              {subtitle && (
                <p className="text-dark-secondary text-xs sm:text-xs lg:text-sm mt-0.5 sm:mt-1 break-words line-clamp-2">{subtitle}</p>
              )}
            </div>
            <div className={`p-2 sm:p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex-shrink-0`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 flex-shrink-0">
        {/* Uma única linha - Título, subtítulo e filtros */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 xl:gap-4">
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl flex-shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-dark-primary-text truncate">
                {t('reports.title')}
              </h1>
              <p className="text-dark-secondary text-xs sm:text-sm md:text-sm lg:text-base mt-0.5 sm:mt-1 truncate">
                {t('reports.subtitle')}
              </p>
            </div>
          </div>

          {/* Filtros - lado direito */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full xl:w-auto xl:flex-shrink-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-dark-secondary flex-shrink-0" />
              <span className="text-dark-secondary text-xs sm:text-sm whitespace-nowrap">Período:</span>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-40 md:w-48 bg-dark-card border-dark-color text-dark-primary-text text-xs sm:text-sm">
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 3 meses</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollable-content dashboard-main p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 bg-dark-bg max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-140px)] lg:max-h-[calc(100vh-160px)] xl:max-h-[calc(100vh-180px)]">
        {/* Error display */}
        {error && (
          <div className="glass-card bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-red-300 font-semibold text-sm sm:text-base">Erro detectado</h3>
                <p className="text-red-200 text-xs sm:text-sm break-words">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 md:py-12">
            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mb-3 sm:mb-4"></div>
            <p className="text-dark-secondary text-xs sm:text-sm md:text-base">Carregando dados dos relatórios...</p>
          </div>
        )}

        {/* Report Cards */}
        {!loading && (
          <div className="space-y-4 sm:space-y-6">
            {/* Estatísticas principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <StatCard
                icon={ShoppingCart}
                title="Total de Cotações"
                value={reportData.totalCotacoes}
                color="blue"
              />
              <StatCard
                icon={Target}
                title="Cotações Aprovadas"
                value={reportData.cotacoesAprovadas}
                subtitle={`${reportData.totalCotacoes > 0 ? ((reportData.cotacoesAprovadas / reportData.totalCotacoes) * 100).toFixed(1) : 0}% do total`}
                color="green"
              />
              <StatCard
                icon={Users}
                title="Total de Fornecedores"
                value={reportData.totalFornecedores}
                color="purple"
              />
              <StatCard
                icon={TrendingUp}
                title="Valor Total"
                value={formatCurrency(reportData.valorTotalCotacoes)}
                subtitle={`Média: ${formatCurrency(reportData.mediaValorCotacao)}`}
                color="orange"
              />
            </div>

            {/* Estatísticas detalhadas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <StatCard
                icon={Target}
                title="Cotações Pendentes"
                value={reportData.cotacoesPendentes}
                subtitle="Aguardando aprovação"
                color="orange"
              />
              <StatCard
                icon={Target}
                title="Cotações Rejeitadas"
                value={reportData.cotacoesRejeitadas}
                subtitle="Não aprovadas"
                color="red"
              />
              <StatCard
                icon={ShoppingCart}
                title="Total de Produtos"
                value={reportData.totalProdutos}
                subtitle="Cadastrados no sistema"
                color="blue"
              />
            </div>

            {/* Cards de Download PDF */}
            <div className="space-y-4 sm:space-y-6">
              {/* Total de Cotações do Mês */}
              <div className="glass-card bg-dark-card border border-dark-color rounded-xl p-3 sm:p-4 lg:p-6 hover:border-cyan-400/40 transition-all duration-300 w-full">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl flex-shrink-0">
                      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-dark-primary-text truncate">Total de Cotações do Mês</h3>
                      <p className="text-dark-secondary text-xs sm:text-sm lg:text-base mt-1">{reportData.totalCotacoes} cotações registradas</p>
                      <p className="text-dark-secondary text-xs sm:text-xs lg:text-sm mt-1 break-words">Aprovadas: {reportData.cotacoesAprovadas} | Rejeitadas: {reportData.cotacoesRejeitadas} | Pendentes: {reportData.cotacoesPendentes}</p>
                    </div>
                  </div>
                  <button 
                    onClick={downloadCotacoesPDF}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-2 px-4 sm:py-3 sm:px-6 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 flex items-center justify-center space-x-2 w-full md:w-auto md:flex-shrink-0"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* Total de Produtos */}
              <div className="glass-card bg-dark-card border border-dark-color rounded-xl p-3 sm:p-4 lg:p-6 hover:border-cyan-400/40 transition-all duration-300 w-full">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl flex-shrink-0">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-dark-primary-text truncate">Total de Produtos</h3>
                      <p className="text-dark-secondary text-xs sm:text-sm lg:text-base mt-1">{reportData.totalProdutos} produtos cadastrados</p>
                      <p className="text-dark-secondary text-xs sm:text-xs lg:text-sm mt-1">Disponíveis para cotação no sistema</p>
                    </div>
                  </div>
                  <button 
                    onClick={downloadProdutosPDF}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-2 px-4 sm:py-3 sm:px-6 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 flex items-center justify-center space-x-2 w-full md:w-auto md:flex-shrink-0"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* Total de Fornecedores */}
              <div className="glass-card bg-dark-card border border-dark-color rounded-xl p-3 sm:p-4 lg:p-6 hover:border-cyan-400/40 transition-all duration-300 w-full">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl flex-shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-dark-primary-text truncate">Total de Fornecedores</h3>
                      <p className="text-dark-secondary text-xs sm:text-sm lg:text-base mt-1">{reportData.totalFornecedores} fornecedores ativos</p>
                      <p className="text-dark-secondary text-xs sm:text-xs lg:text-sm mt-1">Parceiros cadastrados no sistema</p>
                    </div>
                  </div>
                  <button 
                    onClick={downloadFornecedoresPDF}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2 px-4 sm:py-3 sm:px-6 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 flex items-center justify-center space-x-2 w-full md:w-auto md:flex-shrink-0"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
