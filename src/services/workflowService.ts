export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  condition: {
    field: 'valor' | 'cliente' | 'produto' | 'fornecedor';
    operator: 'greater_than' | 'less_than' | 'equals' | 'contains';
    value: string | number;
  };
  action: {
    type: 'require_approval' | 'auto_approve' | 'auto_reject' | 'assign_to_user';
    approvers?: string[];
    assignee?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowValidationResult {
  isValid: boolean;
  matchedRules: WorkflowRule[];
  requiredApprovers: string[];
  suggestedPriority?: 'low' | 'medium' | 'high' | 'urgent';
  suggestedStatus?: string;
  validationMessage: string;
}

class WorkflowService {
  private storageKey = 'smartquote_workflow_rules';

  // Regras padrão do sistema
  private defaultRules: WorkflowRule[] = [
    {
      id: 'high-value-approval',
      name: 'Aprovação para Valores Altos',
      description: 'Cotações acima de €2.000.000 requerem aprovação especial',
      condition: {
        field: 'valor',
        operator: 'greater_than',
        value: 2000000
      },
      action: {
        type: 'require_approval',
        approvers: ['diretor@empresa.com', 'cfo@empresa.com'],
        priority: 'urgent'
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'medium-value-approval',
      name: 'Aprovação para Valores Médios',
      description: 'Cotações entre €500.000 e €2.000.000 requerem aprovação de gerente',
      condition: {
        field: 'valor',
        operator: 'greater_than',
        value: 500000
      },
      action: {
        type: 'require_approval',
        approvers: ['gerente@empresa.com'],
        priority: 'high'
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'low-value-auto-approve',
      name: 'Aprovação Automática para Valores Baixos',
      description: 'Cotações abaixo de €50.000 são aprovadas automaticamente',
      condition: {
        field: 'valor',
        operator: 'less_than',
        value: 50000
      },
      action: {
        type: 'auto_approve',
        priority: 'low'
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'important-client-priority',
      name: 'Prioridade para Clientes Importantes',
      description: 'Cotações de clientes VIP recebem prioridade alta',
      condition: {
        field: 'cliente',
        operator: 'contains',
        value: 'VIP'
      },
      action: {
        type: 'require_approval',
        approvers: ['account-manager@empresa.com'],
        priority: 'high'
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Carregar regras do localStorage
  loadRules(): WorkflowRule[] {
    try {
      const storedRules = localStorage.getItem(this.storageKey);
      if (storedRules) {
        return JSON.parse(storedRules);
      }
      
      // Se não há regras salvas, usar as padrão
      this.saveRules(this.defaultRules);
      return this.defaultRules;
    } catch (error) {
      console.error('Erro ao carregar regras de workflow:', error);
      return this.defaultRules;
    }
  }

  // Salvar regras no localStorage
  saveRules(rules: WorkflowRule[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(rules));
    } catch (error) {
      console.error('Erro ao salvar regras de workflow:', error);
    }
  }

  // Adicionar nova regra
  addRule(rule: Omit<WorkflowRule, 'id' | 'createdAt' | 'updatedAt'>): WorkflowRule {
    const newRule: WorkflowRule = {
      ...rule,
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const rules = this.loadRules();
    rules.push(newRule);
    this.saveRules(rules);

    return newRule;
  }

  // Atualizar regra existente
  updateRule(id: string, updates: Partial<WorkflowRule>): WorkflowRule | null {
    const rules = this.loadRules();
    const ruleIndex = rules.findIndex(rule => rule.id === id);

    if (ruleIndex === -1) {
      return null;
    }

    const updatedRule = {
      ...rules[ruleIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    rules[ruleIndex] = updatedRule;
    this.saveRules(rules);

    return updatedRule;
  }

  // Remover regra
  removeRule(id: string): boolean {
    const rules = this.loadRules();
    const filteredRules = rules.filter(rule => rule.id !== id);

    if (filteredRules.length === rules.length) {
      return false; // Regra não encontrada
    }

    this.saveRules(filteredRules);
    return true;
  }

  // Validar cotação contra todas as regras ativas
  validateCotacao(cotacao: any): WorkflowValidationResult {
    const rules = this.loadRules().filter(rule => rule.isActive);
    const matchedRules: WorkflowRule[] = [];

    // Testar cada regra
    for (const rule of rules) {
      if (this.testRule(cotacao, rule)) {
        matchedRules.push(rule);
      }
    }

    // Processar resultados
    const requiredApprovers: string[] = [];
    let suggestedPriority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    let suggestedStatus = 'pending_approval';

    for (const rule of matchedRules) {
      // Coletar aprovadores necessários
      if (rule.action.approvers) {
        requiredApprovers.push(...rule.action.approvers);
      }

      // Determinar maior prioridade
      if (rule.action.priority) {
        const priorities = ['low', 'medium', 'high', 'urgent'];
        const currentPriorityIndex = priorities.indexOf(suggestedPriority);
        const rulePriorityIndex = priorities.indexOf(rule.action.priority);
        
        if (rulePriorityIndex > currentPriorityIndex) {
          suggestedPriority = rule.action.priority;
        }
      }

      // Determinar status baseado na ação
      if (rule.action.type === 'auto_approve') {
        suggestedStatus = 'approved';
      } else if (rule.action.type === 'auto_reject') {
        suggestedStatus = 'rejected';
      }
    }

    // Remover aprovadores duplicados
    const uniqueApprovers = [...new Set(requiredApprovers)];

    // Gerar mensagem de validação
    let validationMessage = 'Cotação validada com sucesso.';
    
    if (matchedRules.length === 0) {
      validationMessage = 'Nenhuma regra especial aplicada. Segue fluxo padrão.';
    } else {
      const ruleNames = matchedRules.map(rule => rule.name).join(', ');
      validationMessage = `Regras aplicadas: ${ruleNames}`;
      
      if (uniqueApprovers.length > 0) {
        validationMessage += ` - Aprovação necessária de: ${uniqueApprovers.join(', ')}`;
      }
    }

    return {
      isValid: true,
      matchedRules,
      requiredApprovers: uniqueApprovers,
      suggestedPriority,
      suggestedStatus,
      validationMessage
    };
  }

  // Testar se uma cotação atende a uma regra específica
  private testRule(cotacao: any, rule: WorkflowRule): boolean {
    const { field, operator, value } = rule.condition;
    let cotacaoValue = cotacao[field];

    // Conversão para comparação de valores
    if (field === 'valor') {
      // Remover símbolos de moeda e converter para número
      cotacaoValue = parseFloat(cotacaoValue.toString().replace(/[€$,\s]/g, '')) || 0;
    }

    switch (operator) {
      case 'greater_than':
        return typeof cotacaoValue === 'number' && cotacaoValue > Number(value);
      
      case 'less_than':
        return typeof cotacaoValue === 'number' && cotacaoValue < Number(value);
      
      case 'equals':
        return cotacaoValue === value;
      
      case 'contains':
        return typeof cotacaoValue === 'string' && 
               cotacaoValue.toLowerCase().includes(value.toString().toLowerCase());
      
      default:
        return false;
    }
  }

  // Resetar para regras padrão
  resetToDefaults(): void {
    this.saveRules(this.defaultRules);
  }

  // Exportar regras para backup
  exportRules(): string {
    const rules = this.loadRules();
    return JSON.stringify(rules, null, 2);
  }

  // Importar regras de backup
  importRules(jsonData: string): boolean {
    try {
      const rules = JSON.parse(jsonData) as WorkflowRule[];
      
      // Validar estrutura básica
      if (!Array.isArray(rules)) {
        throw new Error('Dados devem ser um array de regras');
      }

      for (const rule of rules) {
        if (!rule.id || !rule.name || !rule.condition || !rule.action) {
          throw new Error('Estrutura de regra inválida');
        }
      }

      this.saveRules(rules);
      return true;
    } catch (error) {
      console.error('Erro ao importar regras:', error);
      return false;
    }
  }
}

export const workflowService = new WorkflowService();
