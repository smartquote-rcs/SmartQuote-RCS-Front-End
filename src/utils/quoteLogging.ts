// Utilitários para integração com logs de cotações
import { logQuoteApproval, QuoteApprovalLogData } from '../services/logService';

// Interface para dados de cotação
export interface CotacaoData {
  id: string;
  numero: string;
  cliente: string;
  valor: number;
  fornecedor?: string;
  descricao?: string;
}

// Interface para dados do aprovador
export interface ApproverData {
  name: string;
  email: string;
  role?: string;
}

// Função utilitária para registrar aprovação de cotação
export async function logCotacaoApproval(
  cotacao: CotacaoData,
  approver: ApproverData,
  motivo?: string
) {
  const logData: QuoteApprovalLogData = {
    cotacaoId: cotacao.id,
    cotacaoNumero: cotacao.numero,
    status: 'approved',
    approverName: approver.name,
    approverEmail: approver.email,
    valor: cotacao.valor,
    cliente: cotacao.cliente,
    motivo: motivo || 'Aprovação manual'
  };

  return await logQuoteApproval(logData);
}

// Função utilitária para registrar rejeição de cotação
export async function logCotacaoRejection(
  cotacao: CotacaoData,
  approver: ApproverData,
  motivo: string
) {
  const logData: QuoteApprovalLogData = {
    cotacaoId: cotacao.id,
    cotacaoNumero: cotacao.numero,
    status: 'rejected',
    approverName: approver.name,
    approverEmail: approver.email,
    valor: cotacao.valor,
    cliente: cotacao.cliente,
    motivo: motivo
  };

  return await logQuoteApproval(logData);
}

// Função para registrar log de processamento automático
export async function logProcessamentoAutomatico(
  cotacao: CotacaoData,
  resultado: 'aprovada' | 'rejeitada',
  motivo?: string
) {
  const logData: QuoteApprovalLogData = {
    cotacaoId: cotacao.id,
    cotacaoNumero: cotacao.numero,
    status: resultado === 'aprovada' ? 'approved' : 'rejected',
    approverName: 'Sistema IA',
    approverEmail: 'sistema@smartquote.com',
    valor: cotacao.valor,
    cliente: cotacao.cliente,
    motivo: motivo || `Processamento automático - ${resultado}`
  };

  return await logQuoteApproval(logData);
}

// Exemplos de uso:

/* 
// 1. Aprovação manual por usuário
const cotacao = {
  id: 'RCS-2024-0892',
  numero: 'RCS-2024-0892', 
  cliente: 'Energia Verde Lda',
  valor: 2450000
};

const approver = {
  name: 'João Silva',
  email: 'joao.silva@smartquote.com'
};

await logCotacaoApproval(cotacao, approver, 'Documentação completa e valores aprovados');

// 2. Rejeição manual por usuário
await logCotacaoRejection(cotacao, approver, 'Valor excede limite orçamental aprovado');

// 3. Processamento automático
await logProcessamentoAutomatico(cotacao, 'aprovada', 'Valor dentro dos limites e fornecedor validado');
*/
