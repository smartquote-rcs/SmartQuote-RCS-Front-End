import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import api from '../../api/client';
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  DollarSign,
  User,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ApprovalRule {
  id: number;
  nome: string;
  valor_minimo: number;
  valor_maximo: number | null;
  aprovador_id: number;
  aprovador_nome?: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export default function ApprovalRulesPage() {
  const { t } = useTranslation();
  const { isLight } = useTheme();

  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);

  // Função para adicionar toast
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, type, message };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    valor_minimo: '',
    valor_maximo: '',
    aprovador_id: '',
    ativo: true
  });

  // Buscar regras de aprovação
  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/approval-rules');
      setRules(response.data || []);
    } catch (error: any) {
      console.error('Erro ao buscar regras:', error);
      addToast('error', 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Buscar usuários aprovadores
  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      // Filtrar apenas managers e admins
      const approvers = response.data.filter((u: User) => 
        u.role === 'manager' || u.role === 'admin'
      );
      setUsers(approvers || []);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  useEffect(() => {
    fetchRules();
    fetchUsers();
  }, []);

  // Abrir modal para criar/editar
  const openModal = (rule?: ApprovalRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        nome: rule.nome,
        valor_minimo: rule.valor_minimo.toString(),
        valor_maximo: rule.valor_maximo?.toString() || '',
        aprovador_id: rule.aprovador_id.toString(),
        ativo: rule.ativo
      });
    } else {
      setEditingRule(null);
      setFormData({
        nome: '',
        valor_minimo: '',
        valor_maximo: '',
        aprovador_id: '',
        ativo: true
      });
    }
    setIsModalOpen(true);
  };

  // Fechar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
    setFormData({
      nome: '',
      valor_minimo: '',
      valor_maximo: '',
      aprovador_id: '',
      ativo: true
    });
  };

  // Salvar regra
  const handleSave = async () => {
    // Validações
    if (!formData.nome.trim()) {
      addToast('error', 'Nome obrigatório');
      return;
    }
    if (!formData.valor_minimo || parseFloat(formData.valor_minimo) < 0) {
      addToast('error', 'Valor mínimo inválido');
      return;
    }
    if (!formData.aprovador_id) {
      addToast('error', 'Selecione aprovador');
      return;
    }

    const payload = {
      nome: formData.nome,
      valor_minimo: parseFloat(formData.valor_minimo),
      valor_maximo: formData.valor_maximo ? parseFloat(formData.valor_maximo) : null,
      aprovador_id: parseInt(formData.aprovador_id),
      ativo: formData.ativo
    };

    try {
      if (editingRule) {
        // Atualizar
        await api.put(`/approval-rules/${editingRule.id}`, payload);
        addToast('success', 'Regra atualizada');
      } else {
        // Criar
        await api.post('/approval-rules', payload);
        addToast('success', 'Regra criada');
      }
      fetchRules();
      closeModal();
    } catch (error: any) {
      console.error('Erro ao salvar regra:', error);
      const errorMsg = error.response?.data?.error || 'Erro ao salvar';
      addToast('error', errorMsg);
    }
  };

  // Deletar regra
  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) {
      return;
    }

    try {
      await api.delete(`/approval-rules/${id}`);
      addToast('success', 'Regra excluída');
      fetchRules();
    } catch (error: any) {
      console.error('Erro ao excluir regra:', error);
      addToast('error', 'Erro ao excluir');
    }
  };

  // Ativar/Desativar regra
  const toggleRuleStatus = async (rule: ApprovalRule) => {
    try {
      await api.put(`/approval-rules/${rule.id}`, {
        ...rule,
        ativo: !rule.ativo
      });
      addToast('success', `Regra ${!rule.ativo ? 'ativada' : 'desativada'}`);
      fetchRules();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      addToast('error', 'Erro ao alterar status');
    }
  };

  // Formatar valor em moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className={`min-h-screen ${isLight ? 'bg-gray-50' : 'bg-dark-bg'} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'} flex items-center gap-3`}>
                <Settings className="w-8 h-8" />
                Regras de Aprovação
              </h1>
              <p className={`mt-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Gestão de limites e aprovadores
              </p>
            </div>
            <Button
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Regra
            </Button>
          </div>
        </div>

        {/* Lista de Regras */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : rules.length === 0 ? (
          <div className={`text-center py-16 rounded-lg border-2 border-dashed ${
            isLight ? 'border-gray-300 bg-white' : 'border-gray-700 bg-dark-card'
          }`}>
            <Settings className={`w-16 h-16 mx-auto mb-4 ${isLight ? 'text-gray-400' : 'text-gray-600'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Sem regras ativas
            </h3>
            <p className={`mb-4 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Configure limites de aprovação
            </p>
            <Button
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`rounded-lg border-2 p-6 transition-all ${
                  rule.ativo
                    ? isLight
                      ? 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md'
                      : 'bg-dark-card border-gray-700 hover:border-blue-500 hover:shadow-lg'
                    : isLight
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : 'bg-gray-900/50 border-gray-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        {rule.nome}
                      </h3>
                      {rule.ativo ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Ativa
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inativa
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Valor Mínimo */}
                      <div className={`flex items-center gap-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                        <DollarSign className="w-4 h-4" />
                        <div>
                          <p className="text-xs opacity-75">Valor Mínimo</p>
                          <p className="font-semibold">{formatCurrency(rule.valor_minimo)}</p>
                        </div>
                      </div>

                      {/* Valor Máximo */}
                      <div className={`flex items-center gap-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                        <DollarSign className="w-4 h-4" />
                        <div>
                          <p className="text-xs opacity-75">Valor Máximo</p>
                          <p className="font-semibold">
                            {rule.valor_maximo ? formatCurrency(rule.valor_maximo) : 'Ilimitado'}
                          </p>
                        </div>
                      </div>

                      {/* Aprovador */}
                      <div className={`flex items-center gap-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                        <User className="w-4 h-4" />
                        <div>
                          <p className="text-xs opacity-75">Aprovador</p>
                          <p className="font-semibold">{rule.aprovador_nome || `ID: ${rule.aprovador_id}`}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleRuleStatus(rule)}
                      className={`p-2 rounded-lg transition-colors ${
                        isLight
                          ? 'hover:bg-gray-100 text-gray-600'
                          : 'hover:bg-gray-700 text-gray-400'
                      }`}
                      title={rule.ativo ? 'Desativar' : 'Ativar'}
                    >
                      {rule.ativo ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => openModal(rule)}
                      className={`p-2 rounded-lg transition-colors ${
                        isLight
                          ? 'hover:bg-blue-100 text-blue-600'
                          : 'hover:bg-blue-900/50 text-blue-400'
                      }`}
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isLight
                          ? 'hover:bg-red-100 text-red-600'
                          : 'hover:bg-red-900/50 text-red-400'
                      }`}
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Criar/Editar */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className={`max-w-2xl ${isLight ? 'bg-white' : 'bg-dark-card'}`}>
            <DialogHeader>
              <DialogTitle className={isLight ? 'text-gray-900' : 'text-white'}>
                {editingRule ? 'Editar Regra' : 'Nova Regra'}
              </DialogTitle>
              <DialogDescription className={isLight ? 'text-gray-600' : 'text-gray-400'}>
                Defina limites e responsável
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Nome */}
              <div>
                <Label className={isLight ? 'text-gray-700' : 'text-gray-300'}>
                  Nome *
                </Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Descrição da regra"
                  className={`mt-1 ${
                    isLight
                      ? 'bg-white border-gray-300'
                      : 'bg-gray-800 border-gray-600 text-white'
                  }`}
                />
              </div>

              {/* Valores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className={isLight ? 'text-gray-700' : 'text-gray-300'}>
                    Valor Mínimo (R$) *
                  </Label>
                  <Input
                    type="number"
                    value={formData.valor_minimo}
                    onChange={(e) => setFormData({ ...formData, valor_minimo: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`mt-1 ${
                      isLight
                        ? 'bg-white border-gray-300'
                        : 'bg-gray-800 border-gray-600 text-white'
                    }`}
                  />
                </div>
                <div>
                  <Label className={isLight ? 'text-gray-700' : 'text-gray-300'}>
                    Valor Máximo (R$)
                  </Label>
                  <Input
                    type="number"
                    value={formData.valor_maximo}
                    onChange={(e) => setFormData({ ...formData, valor_maximo: e.target.value })}
                    placeholder="Ilimitado"
                    min="0"
                    step="0.01"
                    className={`mt-1 ${
                      isLight
                        ? 'bg-white border-gray-300'
                        : 'bg-gray-800 border-gray-600 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Aprovador */}
              <div>
                <Label className={isLight ? 'text-gray-700' : 'text-gray-300'}>
                  Aprovador *
                </Label>
                <Select
                  value={formData.aprovador_id}
                  onValueChange={(value) => setFormData({ ...formData, aprovador_id: value })}
                >
                  <SelectTrigger className={`mt-1 ${
                    isLight
                      ? 'bg-white border-gray-300'
                      : 'bg-gray-800 border-gray-600 text-white'
                  }`}>
                    <SelectValue placeholder="Selecionar usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.nome} - {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <Label htmlFor="ativo" className={isLight ? 'text-gray-700' : 'text-gray-300'}>
                  Ativa
                </Label>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button
                onClick={closeModal}
                variant="outline"
                className={`flex-1 ${
                  isLight
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Toast Notifications */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg border-2 animate-slide-in-right ${
                toast.type === 'success'
                  ? isLight
                    ? 'bg-green-50 border-green-500 text-green-800'
                    : 'bg-green-900/90 border-green-500 text-green-200'
                  : toast.type === 'error'
                  ? isLight
                    ? 'bg-red-50 border-red-500 text-red-800'
                    : 'bg-red-900/90 border-red-500 text-red-200'
                  : isLight
                  ? 'bg-blue-50 border-blue-500 text-blue-800'
                  : 'bg-blue-900/90 border-blue-500 text-blue-200'
              }`}
            >
              <p className="font-medium">{toast.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
