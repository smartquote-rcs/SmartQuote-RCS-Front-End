import { useState, useEffect } from 'react';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
}

const CURRENCY_CONFIGS: { [key: string]: CurrencyConfig } = {
  'EUR': {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    position: 'before'
  },
  'USD': {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    position: 'before'
  },
  'GBP': {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    position: 'before'
  },
  'BRL': {
    code: 'BRL',
    symbol: 'R$',
    name: 'Real Brasileiro',
    position: 'before'
  },
  'JPY': {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    position: 'before'
  },
  'CHF': {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    position: 'after'
  },
  'CAD': {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    position: 'before'
  },
  'AOA': {
    code: 'AOA',
    symbol: 'Kz',
    name: 'Kwanza Angolano',
    position: 'before'
  }
};

export const useCurrency = () => {
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyConfig>(CURRENCY_CONFIGS['EUR']);

  // Função para buscar a configuração de moeda das configurações do sistema
  const fetchCurrencyFromSettings = async () => {
    try {
      // Primeiro tenta buscar do localStorage (cache)
      const cachedSettings = localStorage.getItem('smartquote-general-settings');
      if (cachedSettings) {
        const settings = JSON.parse(cachedSettings);
        if (settings.currency && CURRENCY_CONFIGS[settings.currency]) {
          setCurrentCurrency(CURRENCY_CONFIGS[settings.currency]);
          return;
        }
      }

      // Se não houver cache, busca da API
      const { sistemaService } = await import('../api/services');
      const result = await sistemaService.getConfig();
      const config = result.data?.data;
      
      if (config?.moeda && CURRENCY_CONFIGS[config.moeda]) {
        setCurrentCurrency(CURRENCY_CONFIGS[config.moeda]);
        // Atualiza o cache
        const currentSettings = JSON.parse(localStorage.getItem('smartquote-general-settings') || '{}');
        localStorage.setItem('smartquote-general-settings', JSON.stringify({
          ...currentSettings,
          currency: config.moeda
        }));
      }
    } catch (error) {
      console.warn('Erro ao buscar configuração de moeda, usando EUR como padrão:', error);
    }
  };

  // Carrega a configuração de moeda na inicialização
  useEffect(() => {
    fetchCurrencyFromSettings();
  }, []);

  // Escuta mudanças nas configurações
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'smartquote-general-settings' && e.newValue) {
        try {
          const settings = JSON.parse(e.newValue);
          if (settings.currency && CURRENCY_CONFIGS[settings.currency]) {
            setCurrentCurrency(CURRENCY_CONFIGS[settings.currency]);
          }
        } catch (error) {
          console.warn('Erro ao processar mudança de configuração de moeda:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Função para formatar valores monetários
  const formatCurrency = (value: number, showSymbol: boolean = true): string => {
    if (isNaN(value)) return showSymbol ? `${currentCurrency.symbol}0.00` : '0.00';
    
    // Formatação com separadores de milhares
    const formattedValue = value.toLocaleString('pt-PT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    if (!showSymbol) return formattedValue;
    
    return currentCurrency.position === 'before' 
      ? `${currentCurrency.symbol}${formattedValue}`
      : `${formattedValue} ${currentCurrency.symbol}`;
  };

  // Função para atualizar a moeda (útil para mudanças manuais)
  const updateCurrency = (currencyCode: string) => {
    if (CURRENCY_CONFIGS[currencyCode]) {
      setCurrentCurrency(CURRENCY_CONFIGS[currencyCode]);
    }
  };

  return {
    currency: currentCurrency,
    formatCurrency,
    updateCurrency,
    availableCurrencies: CURRENCY_CONFIGS,
    refreshCurrency: fetchCurrencyFromSettings
  };
};
