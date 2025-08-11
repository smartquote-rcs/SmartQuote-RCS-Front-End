import { useTranslation } from 'react-i18next';

export function TestI18n() {
  const { t, i18n } = useTranslation();
  
  return (
    <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg m-4">
      <h2 className="text-white font-bold mb-4">Teste de Internacionalização</h2>
      <div className="space-y-2 text-sm">
        <p className="text-white">Idioma atual: <span className="font-mono bg-black/20 px-2 py-1 rounded">{i18n.language}</span></p>
        <p className="text-white">Teste básico: <span className="font-bold">{t('test')}</span></p>
        <p className="text-white">Dashboard: <span className="font-bold">{t('dashboard.title')}</span></p>
        <p className="text-white">Navegação: <span className="font-bold">{t('navigation.dashboard')}</span></p>
        
        <div className="flex space-x-2 mt-4">
          <button 
            onClick={() => i18n.changeLanguage('pt')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
          >
            Português
          </button>
          <button 
            onClick={() => i18n.changeLanguage('en')}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
          >
            English
          </button>
        </div>
      </div>
    </div>
  );
}
