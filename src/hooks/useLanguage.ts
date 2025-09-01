import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useLanguage() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      console.log('Hook useLanguage detectou mudança para:', lng);
      setCurrentLanguage(lng);
    };

    const handleCustomLanguageChange = (event: any) => {
      console.log('Hook useLanguage detectou evento customizado:', event);
      const newLang = event.detail?.language || i18n.language;
      setCurrentLanguage(newLang);
    };

    // Ouvir mudanças do i18n
    i18n.on('languageChanged', handleLanguageChange);
    
    // Ouvir eventos customizados
    window.addEventListener('languageChanged', handleCustomLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      window.removeEventListener('languageChanged', handleCustomLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = async (newLang: string) => {
    const supportedLanguages = ['pt', 'en', 'es', 'fr', 'de', 'it'];
    
    if (!supportedLanguages.includes(newLang)) {
      console.warn('Idioma não suportado:', newLang);
      return false;
    }
    
    try {
      console.log('useLanguage.changeLanguage chamado com:', newLang);
      await i18n.changeLanguage(newLang);
      localStorage.setItem('i18nextLng', newLang);
      setCurrentLanguage(newLang);
      
      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: newLang } 
      }));
      
      return true;
    } catch (error) {
      console.error('Erro ao mudar idioma:', error);
      return false;
    }
  };

  const getLanguageInfo = () => {
    const languageMap: { [key: string]: { name: string, flag: string } } = {
      'pt': { name: 'Português', flag: '🇵🇹' },
      'en': { name: 'English', flag: '🇬🇧' },
      'es': { name: 'Español', flag: '🇪🇸' },
      'fr': { name: 'Français', flag: '🇫🇷' },
      'de': { name: 'Deutsch', flag: '🇩🇪' },
      'it': { name: 'Italiano', flag: '🇮🇹' }
    };
    
    return languageMap[currentLanguage] || { name: 'Português', flag: '🇵🇹' };
  };

  return {
    currentLanguage,
    changeLanguage,
    getLanguageInfo,
    isPortuguese: currentLanguage === 'pt',
    isEnglish: currentLanguage === 'en',
    isSpanish: currentLanguage === 'es',
    isFrench: currentLanguage === 'fr',
    isGerman: currentLanguage === 'de',
    isItalian: currentLanguage === 'it'
  };
}
