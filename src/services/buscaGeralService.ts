import { API_BASE_URL } from '../api/client';
// Serviço para busca geral usando IA
export interface BuscaGeralRequest {
  solicitacao: string;
}

export interface BuscaGeralResponse {
  success: boolean;
  data?: {
    produto?: string;
    fornecedor?: string;
    valor?: string;
    quantidade?: string;
    prioridade?: 'low' | 'medium' | 'high';
    descricao?: string;
    observacoes?: string;
    prazoEntrega?: string;
    categoria?: string;
    especificacoes?: string;
  };
  error?: string;
  message?: string;
}

class BuscaGeralService {
  private readonly baseUrl = API_BASE_URL;

  async buscarGeral(solicitacao: string): Promise<BuscaGeralResponse> {
    try {
      console.log('🔍 Fazendo busca geral para:', solicitacao);
      
      const response = await fetch(`${this.baseUrl}/busca/geral`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solicitacao: solicitacao.trim()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro na API de busca: ${response.status} - ${errorText}`);
        throw new Error(`Erro na API: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Resposta da API de busca geral:', result);

      return {
        success: true,
        data: result
      };

    } catch (error: any) {
      console.error('❌ Erro ao fazer busca geral:', error);
      
      return {
        success: false,
        error: error.message || 'Erro ao processar solicitação',
        message: 'Falha na comunicação com o serviço de busca'
      };
    }
  }

  // Método para testar a conectividade
  async testarConectividade(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Erro ao testar conectividade:', error);
      return false;
    }
  }

  // Método para validar entrada antes da busca
  validarSolicitacao(solicitacao: string): { valid: boolean; message?: string } {
    if (!solicitacao || solicitacao.trim().length === 0) {
      return { valid: false, message: 'Solicitação não pode estar vazia' };
    }

    if (solicitacao.trim().length < 10) {
      return { valid: false, message: 'Solicitação muito curta. Descreva melhor o que precisa.' };
    }

    if (solicitacao.trim().length > 500) {
      return { valid: false, message: 'Solicitação muito longa. Máximo 500 caracteres.' };
    }

    return { valid: true };
  }
}

// Exportar instância única (singleton)
export const buscaGeralService = new BuscaGeralService();
export default buscaGeralService;
