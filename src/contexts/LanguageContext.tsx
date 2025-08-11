import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from './AppContext';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'pt',
  changeLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { userSettings } = useApp();

  useEffect(() => {
    // Sincronizar idioma com as configurações do usuário
    if (userSettings.language) {
      const lang = userSettings.language === 'pt-PT' || userSettings.language === 'pt-BR' ? 'pt' : 'en';
      i18n.changeLanguage(lang);
    }
  }, [userSettings.language, i18n]);

  const changeLanguage = (language: string) => {
    const lang = language === 'pt-PT' || language === 'pt-BR' ? 'pt' : 'en';
    i18n.changeLanguage(lang);
  };

  const contextValue: LanguageContextType = {
    currentLanguage: i18n.language,
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};
