import { useState } from 'react';
import { Package, AlertTriangle, RefreshCw, Trash2, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface StockMonitoringProps {
  onNotificationUpdate?: () => void;
}

export function StockMonitoring({ onNotificationUpdate }: StockMonitoringProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAutoChecking, setIsAutoChecking] = useState(false);
  const [productId, setProductId] = useState('');
  const [minLimit, setMinLimit] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [checkResults, setCheckResults] = useState<any>(null);

  const handleStockCheck = async () => {
    setIsChecking(true);
    try {
      const { notificationService } = await import('../api/services');
      
      const stockData: any = {};
      if (productId) stockData.produto_id = parseInt(productId);
      if (minLimit) stockData.limite_minimo = parseInt(minLimit);
      if (supplierId) stockData.fornecedor_id = parseInt(supplierId);

      const response = await notificationService.verificarEstoqueBaixo(stockData);
      
      if (response.success) {
        setCheckResults(response.data);
        setLastCheck(new Date().toLocaleString('pt-PT'));
        showToast('success', 'Verificação concluída', 'Verificação de estoque baixo realizada com sucesso.');
        if (onNotificationUpdate) onNotificationUpdate();
      } else {
        showToast('error', 'Erro na verificação', response.error || 'Erro ao verificar estoque baixo.');
      }
    } catch (error) {
      console.error('Erro ao verificar estoque:', error);
      showToast('error', 'Erro na verificação', 'Erro ao conectar com o servidor.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleAutomaticCheck = async () => {
    setIsAutoChecking(true);
    try {
      const { notificationService } = await import('../api/services');
      const response = await notificationService.verificacaoAutomatica();
      
      if (response.success) {
        setCheckResults(response.data);
        setLastCheck(new Date().toLocaleString('pt-PT'));
        showToast('success', 'Verificação automática', 'Verificação automática de estoque realizada com sucesso.');
        if (onNotificationUpdate) onNotificationUpdate();
      } else {
        showToast('error', 'Erro na verificação automática', response.error || 'Erro na verificação automática.');
      }
    } catch (error) {
      console.error('Erro na verificação automática:', error);
      showToast('error', 'Erro na verificação automática', 'Erro ao conectar com o servidor.');
    } finally {
      setIsAutoChecking(false);
    }
  };

  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { type, title, message } 
    }));
  };

  return (
    <div className="space-y-6">
      {/* Card de Verificação Manual */}
      <Card className="glass-card bg-slate-800/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            Verificação Manual de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="productId" className="text-slate-300">ID do Produto (opcional)</Label>
              <Input
                id="productId"
                type="number"
                placeholder="Ex: 123"
                value={productId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductId(e.target.value)}
                className="glass-card border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="minLimit" className="text-slate-300">Limite Mínimo (opcional)</Label>
              <Input
                id="minLimit"
                type="number"
                placeholder="Ex: 10"
                value={minLimit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinLimit(e.target.value)}
                className="glass-card border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="supplierId" className="text-slate-300">ID do Fornecedor (opcional)</Label>
              <Input
                id="supplierId"
                type="number"
                placeholder="Ex: 456"
                value={supplierId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSupplierId(e.target.value)}
                className="glass-card border-white/20 text-white"
              />
            </div>
          </div>
          
          <Button
            onClick={handleStockCheck}
            disabled={isChecking}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Verificar Estoque Baixo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Card de Verificação Automática */}
      <Card className="glass-card bg-slate-800/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-green-400" />
            Verificação Automática
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-300 text-sm">
            Executa uma verificação automática de todos os produtos com estoque baixo baseado nos limites configurados.
          </p>
          
          <Button
            onClick={handleAutomaticCheck}
            disabled={isAutoChecking}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isAutoChecking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Executando Verificação...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Executar Verificação Automática
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados da Última Operação */}
      {(lastCheck || checkResults) && (
        <Card className="glass-card bg-slate-800/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              Resultados da Última Operação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lastCheck && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Última operação:</span>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                  {lastCheck}
                </Badge>
              </div>
            )}
            
            {checkResults && (
              <div className="space-y-3">
                {checkResults.action === 'cleanup' ? (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <h4 className="text-red-300 font-medium mb-2 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Limpeza de Notificações
                    </h4>
                    <div className="text-slate-300 text-sm space-y-1">
                      <p>
                        <span className="font-medium text-red-400">{checkResults.removedCount}</span> notificações obsoletas foram removidas
                      </p>
                      <p className="text-xs text-slate-400">
                        Operação realizada em {new Date(checkResults.timestamp).toLocaleString('pt-PT')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-medium mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Resultado da Verificação de Estoque
                    </h4>
                    <div className="space-y-3">
                      {/* Mensagem principal */}
                      {checkResults.message && (
                        <div className="text-green-300 font-medium text-sm bg-green-900/20 border border-green-500/30 rounded p-2">
                          {checkResults.message}
                        </div>
                      )}
                      
                      {/* Lista de resultados formatada */}
                      {checkResults.data && (
                        <div className="space-y-3">
                          {/* Resumo numérico */}
                          <div className="bg-slate-900/50 rounded-lg p-3 border border-white/10">
                            <ul className="text-slate-300 text-sm space-y-1.5">
                              {typeof checkResults.data.produtosComEstoqueBaixo !== 'undefined' && (
                                <li className="flex items-center justify-between">
                                  <span className="flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3 text-yellow-400" />
                                    Produtos com estoque baixo encontrados:
                                  </span>
                                  <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 font-semibold">
                                    {checkResults.data.produtosComEstoqueBaixo}
                                  </Badge>
                                </li>
                              )}
                              {typeof checkResults.data.limiteUtilizado !== 'undefined' && (
                                <li className="flex items-center justify-between">
                                  <span className="flex items-center gap-2">
                                    <Package className="w-3 h-3 text-cyan-400" />
                                    Total de produtos analisados:
                                  </span>
                                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                                    {checkResults.data.limiteUtilizado}
                                  </Badge>
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Lista detalhada dos produtos */}
                          {checkResults.data.produtos && checkResults.data.produtos.length > 0 && (
                            <div className="space-y-2">
                              <h6 className="text-orange-200 font-medium text-sm flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Lista de Produtos:
                              </h6>
                              <div className="bg-slate-900/30 rounded-lg border border-orange-500/20 max-h-60 overflow-y-auto">
                                {checkResults.data.produtos.map((produto: any, index: number) => (
                                  <div key={produto.id || index} className="flex items-center justify-between p-3 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-white text-sm truncate">
                                        {produto.nome || produto.name || produto.titulo || `Produto ${index + 1}`}
                                      </div>
                                      {produto.codigo && (
                                        <div className="text-xs text-slate-400">
                                          Código: {produto.codigo}
                                        </div>
                                      )}
                                      <div className="flex items-center gap-3 mt-1 text-xs">
                                        <span className="text-yellow-400">
                                          Estoque: {produto.estoque_atual || produto.estoque || produto.quantity || 0}
                                        </span>
                                        <span className="text-red-400">
                                          Mínimo: {produto.estoque_minimo || produto.min_stock || produto.minimum || 0}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-2">
                                      <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">
                                        Baixo
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
