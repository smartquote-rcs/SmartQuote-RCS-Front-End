import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Mail, User, Building, Package, Hash, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import api from '../../api/client';

export function PublicQuoteForm() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    empresa: '',
    produto: '',
    quantidade: '',
    descricao: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validações
    if (!formData.nome || !formData.email || !formData.produto) {
      setError('Por favor, preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido');
      setLoading(false);
      return;
    }

    try {
      // Enviar para API
      await api.post('/cotacoes', {
        solicitante: formData.nome,
        email: formData.email,
        empresa: formData.empresa || 'Não informado',
        produto: formData.produto,
        quantidade: parseInt(formData.quantidade) || 1,
        descricao: formData.descricao || '',
        origem: 'formulario_publico',
        status: 'pendente'
      });

      setSuccess(true);
      setFormData({
        nome: '',
        email: '',
        empresa: '',
        produto: '',
        quantidade: '',
        descricao: ''
      });
    } catch (err: any) {
      console.error('Erro ao enviar cotação:', err);
      setError(err.response?.data?.error || 'Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-2xl w-full bg-slate-800 border-2 border-cyan-500/30 rounded-2xl md:rounded-3xl shadow-xl p-6 sm:p-8 md:p-12 text-center relative z-10 transform animate-in">
          {/* Ícone de sucesso animado */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle className="w-16 h-16 text-cyan-400" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-cyan-400/20 rounded-full mx-auto animate-ping"></div>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Solicitação Enviada com Sucesso!
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-300 mb-6 max-w-lg mx-auto px-4">
            Recebemos sua solicitação de cotação. Nossa equipe entrará em contato em breve através do email fornecido.
          </p>

          {/* Informações adicionais */}
          <div className="bg-slate-700/50 border border-cyan-500/20 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-cyan-400 mb-4">O que acontece agora?</h3>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-cyan-500 text-slate-900 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                <p className="text-sm text-slate-300">Nossa equipe analisa sua solicitação</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                <p className="text-sm text-slate-300">Preparamos uma proposta personalizada</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-cyan-400 text-slate-900 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                <p className="text-sm text-slate-300">Você recebe a cotação por email em até 24h úteis</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setSuccess(false)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-6 text-lg shadow-md hover:shadow-lg transition-all"
            >
              <Send className="w-5 h-5 mr-2" />
              Fazer Nova Solicitação
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl w-full h-full max-h-screen overflow-y-auto relative z-10 py-4">
        {/* Header com logo e título */}
        <div className="text-center mb-3 md:mb-4 px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-cyan-500 rounded-xl shadow-lg shadow-cyan-500/30 mb-2 md:mb-3 transform hover:scale-110 transition-transform duration-300">
            <Send className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2 drop-shadow-lg">
            Solicite sua Cotação
          </h1>
          <p className="text-base sm:text-lg text-cyan-400 mb-1">
            SmartQuote RCS
          </p>
        </div>

        {/* Card do formulário */}
        <div className="bg-slate-800 border-2 border-cyan-500/30 rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl">
          {/* Barra de progresso decorativa */}
          <div className="h-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600"></div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 space-y-3 md:space-y-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800">Erro</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Nome */}
          <div>
            <Label className="text-slate-200 font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              Nome Completo *
            </Label>
            <Input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Seu nome completo"
              className="mt-2 bg-slate-700 border-2 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label className="text-slate-200 font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              Email *
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
              className="mt-2 bg-slate-700 border-2 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
              required
            />
          </div>

          {/* Empresa */}
          <div>
            <Label className="text-slate-200 font-semibold flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-400" />
              Empresa
            </Label>
            <Input
              type="text"
              value={formData.empresa}
              onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              placeholder="Nome da sua empresa"
              className="mt-2 bg-slate-700 border-2 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>

          {/* Produto */}
          <div>
            <Label className="text-slate-200 font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              Produto/Serviço *
            </Label>
            <Input
              type="text"
              value={formData.produto}
              onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
              placeholder="Descreva o produto ou serviço desejado"
              className="mt-2 bg-slate-700 border-2 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
              required
            />
          </div>

          {/* Quantidade */}
          <div>
            <Label className="text-slate-200 font-semibold flex items-center gap-2">
              <Hash className="w-4 h-4 text-cyan-400" />
              Quantidade
            </Label>
            <Input
              type="number"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
              placeholder="Quantidade desejada"
              min="1"
              className="mt-2 bg-slate-700 border-2 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>

          {/* Descrição */}
          <div>
            <Label className="text-slate-200 font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Descrição Adicional
            </Label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Informações adicionais sobre sua necessidade..."
              rows={3}
              className="mt-2 w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 text-white placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none text-sm"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Enviar Solicitação
              </>
            )}
          </Button>

          <p className="text-center text-sm text-slate-400 mt-4">
            * Campos obrigatórios
          </p>
        </form>

          {/* Footer */}
          <div className="bg-slate-700/50 border-t border-cyan-500/20 px-3 sm:px-4 md:px-6 py-3 md:py-4">
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 text-slate-300">
                <CheckCircle className="w-3 h-3 text-cyan-400" />
                <span>24h úteis</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <Mail className="w-3 h-3 text-blue-400" />
                <span>Sem compromisso</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <User className="w-3 h-3 text-cyan-400" />
                <span>Atendimento personalizado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
