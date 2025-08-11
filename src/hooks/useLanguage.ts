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

  return {
    currentLanguage,
    changeLanguage,
    isPortuguese: currentLanguage === 'pt',
    isEnglish: currentLanguage === 'en'
  };
}
