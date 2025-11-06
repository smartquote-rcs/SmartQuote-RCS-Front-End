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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Solicitação Enviada!
          </h2>
          <p className="text-gray-600 mb-6">
            Recebemos sua solicitação de cotação. Nossa equipe entrará em contato em breve através do email fornecido.
          </p>
          <Button
            onClick={() => setSuccess(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Fazer Nova Solicitação
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Solicitar Cotação</h1>
              <p className="text-blue-100 text-sm">SmartQuote RCS</p>
            </div>
          </div>
          <p className="text-blue-50">
            Preencha o formulário abaixo e receba uma cotação personalizada em até 24 horas.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
            <Label className="text-gray-700 font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome Completo *
            </Label>
            <Input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Seu nome completo"
              className="mt-2 border-2 focus:border-blue-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label className="text-gray-700 font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email *
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
              className="mt-2 border-2 focus:border-blue-500"
              required
            />
          </div>

          {/* Empresa */}
          <div>
            <Label className="text-gray-700 font-semibold flex items-center gap-2">
              <Building className="w-4 h-4" />
              Empresa
            </Label>
            <Input
              type="text"
              value={formData.empresa}
              onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              placeholder="Nome da sua empresa"
              className="mt-2 border-2 focus:border-blue-500"
            />
          </div>

          {/* Produto */}
          <div>
            <Label className="text-gray-700 font-semibold flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produto/Serviço *
            </Label>
            <Input
              type="text"
              value={formData.produto}
              onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
              placeholder="Descreva o produto ou serviço desejado"
              className="mt-2 border-2 focus:border-blue-500"
              required
            />
          </div>

          {/* Quantidade */}
          <div>
            <Label className="text-gray-700 font-semibold flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Quantidade
            </Label>
            <Input
              type="number"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
              placeholder="Quantidade desejada"
              min="1"
              className="mt-2 border-2 focus:border-blue-500"
            />
          </div>

          {/* Descrição */}
          <div>
            <Label className="text-gray-700 font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Descrição Adicional
            </Label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Informações adicionais sobre sua necessidade..."
              rows={4}
              className="mt-2 w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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

          <p className="text-center text-sm text-gray-500 mt-4">
            * Campos obrigatórios
          </p>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t">
          <p className="text-center text-sm text-gray-600">
            Ao enviar este formulário, você concorda com nossa política de privacidade.
          </p>
        </div>
      </div>
    </div>
  );
}
