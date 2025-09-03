import { useState, useEffect, useContext } from "react";
import { Settings, User, Bell, Globe, Save, Eye, EyeOff, Lock } from "lucide-react";
import { Badge } from "../ui/badge";
import { useApp } from "../../contexts/AppContext";
import { useTranslation } from 'react-i18next';
import { AppContext } from '../../contexts/AppContext';
import { userService } from '../../api/services';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  phone: string;
}

export function UserSettingsPage() {
  const { t, i18n } = useTranslation();
  const { userSettings, updateSettings } = useApp();
  const appCtx = useContext(AppContext);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState(userSettings);
  const [loading, setLoading] = useState(true);

  // Sincronizar localSettings quando userSettings muda
  useEffect(() => {
    setLocalSettings(userSettings);
  }, [userSettings]);

  // Sincronizar i18n quando o componente é montado
  useEffect(() => {
    if (userSettings.language) {
      const lang = userSettings.language === 'pt-PT' || userSettings.language === 'pt-BR' ? 'pt' : 'en';
      i18n.changeLanguage(lang);
      console.log('Sincronizando idioma inicial:', lang);
    }
  }, []);
  
  const [profileData, setProfileData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    company: 'RCS Angola',
    role: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });

  // Função para buscar dados do usuário atual
  const fetchCurrentUser = async () => {
    try {
      console.log('🔍 UserSettings: Carregando dados do usuário...');
      setLoading(true);
      
      const result = await userService.getCurrentUser();
      
      if (result.success && result.data) {
        const userData = result.data;
        console.log('✅ UserSettings: Dados do usuário carregados:', userData);
        
        // Mapear os dados da API para o formato local
        setProfileData({
          firstName: userData.name || 'Usuário',
          lastName: userData.department || 'Sem Departamento',
          email: userData.email || 'sem@email.com',
          company: 'RCS Angola', // Sempre fixo
          role: userData.position || 'Usuário',
          phone: userData.contact || '+244 000 000 000'
        });
      } else {
        console.warn('⚠️ UserSettings: Erro ao carregar dados:', result.error);
        setShowSuccess('Erro ao carregar dados do usuário.');
      }
    } catch (error) {
      console.error('💥 UserSettings: Erro ao buscar dados:', error);
      setShowSuccess('Erro ao carregar dados do usuário.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados do usuário ao montar o componente
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleSaveSettings = async () => {
    // Atualizar o contexto
    updateSettings(localSettings);
    
    // Mapear e alterar idioma
    const newLang = localSettings.language === 'pt-PT' || localSettings.language === 'pt-BR' ? 'pt' : 'en';
    
    try {
      // Salvar no localStorage
      localStorage.setItem('i18nextLng', newLang);
      
      // Alterar idioma
      await i18n.changeLanguage(newLang);
      
      // Sempre recarregar a página para garantir que todas as traduções sejam aplicadas
      window.location.reload();
      
    } catch (error) {
      console.error('Erro ao alterar idioma:', error);
      // Mesmo com erro, recarregar para aplicar as configurações salvas
      window.location.reload();
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setShowSuccess('As senhas não coincidem!');
      setTimeout(() => setShowSuccess(null), 3000);
      return;
    }
    if (passwordData.new.length < 6) {
      setShowSuccess('A senha deve ter pelo menos 6 caracteres!');
      setTimeout(() => setShowSuccess(null), 3000);
      return;
    }

    try {
      // Obter ID do usuário atual do contexto
      const currentUserId = appCtx?.user?.id;
      
      if (!currentUserId) {
        setShowSuccess('Erro: Usuário não identificado');
        setTimeout(() => setShowSuccess(null), 3000);
        return;
      }

      // Atualizar senha via API
      const result = await userService.updateUser(String(currentUserId), {
        password: passwordData.new
      });

      if (result.success) {
        setPasswordData({
          current: "",
          new: "",
          confirm: "",
          showCurrent: false,
          showNew: false,
          showConfirm: false
        });
        setShowSuccess('Senha alterada com sucesso!');
        setTimeout(() => setShowSuccess(null), 3000);
      } else {
        setShowSuccess(`Erro ao alterar senha: ${result.error}`);
        setTimeout(() => setShowSuccess(null), 3000);
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setShowSuccess('Erro ao alterar senha.');
      setTimeout(() => setShowSuccess(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              {t('settings.title')}
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-1">Personalize sua conta e preferências</p>
          </div>
          {showSuccess && (
            <Badge className={`px-3 py-2 text-sm ${
              showSuccess.includes('Erro') || showSuccess.includes('erro') 
                ? 'bg-red-600 text-white' 
                : 'bg-green-600 text-white'
            }`}>
              {showSuccess}
            </Badge>
          )}
        </div>
      </header>
      
      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Perfil do Usuário */}
          <div className="glass-card p-4 sm:p-6 rounded-xl border border-white/20">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Informações do Perfil</h2>
                <p className="text-xs sm:text-sm text-blue-200">Visualização dos seus dados pessoais</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-sm font-medium text-dark-primary mb-2">Nome</label>
                <input
                  type="text"
                  value={loading ? 'Carregando...' : profileData.firstName}
                  readOnly
                  className="w-full bg-slate-800/30 border border-slate-600/30 rounded-lg p-3 text-slate-300 placeholder-slate-500 cursor-not-allowed text-sm sm:text-base"
                  title="Este campo não pode ser editado. Contacte o administrador para alterações."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-primary mb-2">Departamento</label>
                <input
                  type="text"
                  value={loading ? 'Carregando...' : profileData.lastName}
                  readOnly
                  className="w-full bg-slate-800/30 border border-slate-600/30 rounded-lg p-3 text-slate-300 placeholder-slate-500 cursor-not-allowed text-sm sm:text-base"
                  title="Este campo não pode ser editado. Contacte o administrador para alterações."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-primary mb-2">Email</label>
                <input
                  type="email"
                  value={loading ? 'Carregando...' : profileData.email}
                  readOnly
                  className="w-full bg-slate-800/30 border border-slate-600/30 rounded-lg p-3 text-slate-300 placeholder-slate-500 cursor-not-allowed text-sm sm:text-base"
                  title="Este campo não pode ser editado. Contacte o administrador para alterações."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-primary mb-2">Função</label>
                <input
                  type="text"
                  value={loading ? 'Carregando...' : profileData.role}
                  readOnly
                  className="w-full bg-slate-800/30 border border-slate-600/30 rounded-lg p-3 text-slate-300 placeholder-slate-500 cursor-not-allowed"
                  title="Este campo não pode ser editado. Contacte o administrador para alterações."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-primary mb-2">Telefone</label>
                <input
                  type="tel"
                  value={loading ? 'Carregando...' : profileData.phone}
                  readOnly
                  className="w-full bg-slate-800/30 border border-slate-600/30 rounded-lg p-3 text-slate-300 placeholder-slate-500 cursor-not-allowed"
                  title="Este campo não pode ser editado. Contacte o administrador para alterações."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-primary mb-2">Empresa</label>
                <input
                  type="text"
                  value={loading ? 'Carregando...' : profileData.company}
                  readOnly
                  className="w-full bg-slate-800/30 border border-slate-600/30 rounded-lg p-3 text-slate-300 placeholder-slate-500 cursor-not-allowed"
                  title="Este campo não pode ser editado. Contacte o administrador para alterações."
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 text-blue-300">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Informação</span>
              </div>
              <p className="text-sm text-blue-200 mt-1">
                Os dados do perfil são gerenciados pelo administrador do sistema. 
                Para alterações, contacte o suporte administrativo.
              </p>
            </div>
          </div>

          {/* Alterar Senha */}
          <div className="glass-card p-6 rounded-xl border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Alterar Senha</h2>
                <p className="text-sm text-purple-200">Mantenha sua conta segura</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-dark-primary mb-2">Senha Atual</label>
                <div className="relative">
                  <input
                    type={passwordData.showCurrent ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 pr-12 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                    placeholder="Digite sua senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordData({...passwordData, showCurrent: !passwordData.showCurrent})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {passwordData.showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-primary mb-2">Nova Senha</label>
                <div className="relative">
                  <input
                    type={passwordData.showNew ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 pr-12 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                    placeholder="Digite sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordData({...passwordData, showNew: !passwordData.showNew})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {passwordData.showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-primary mb-2">Confirmar Nova Senha</label>
                <div className="relative">
                  <input
                    type={passwordData.showConfirm ? "text" : "password"}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 pr-12 text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                    placeholder="Confirme sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordData({...passwordData, showConfirm: !passwordData.showConfirm})}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {passwordData.showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Alterar Senha</span>
            </button>
          </div>

          {/* Configurações de Notificações */}
          <div className="glass-card p-6 rounded-xl border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Bell className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Preferências de Notificação</h2>
                <p className="text-sm text-green-200">Configure como você deseja receber notificações</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Notificações por Email</h3>
                  <p className="text-sm text-dark-secondary">Receber notificações importantes por email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localSettings.notifications.email}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      notifications: {
                        ...localSettings.notifications,
                        email: e.target.checked
                      }
                    })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Notificações do Navegador</h3>
                  <p className="text-sm text-dark-secondary">Receber notificações push no navegador</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localSettings.notifications.browser}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      notifications: {
                        ...localSettings.notifications,
                        browser: e.target.checked
                      }
                    })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Atualizações de Cotações</h3>
                  <p className="text-sm text-dark-secondary">Notificar sobre mudanças nas suas cotações</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localSettings.notifications.quotes}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      notifications: {
                        ...localSettings.notifications,
                        quotes: e.target.checked
                      }
                    })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Atualizações de Fornecedores</h3>
                  <p className="text-sm text-dark-secondary">Receber novidades dos fornecedores</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localSettings.notifications.suppliers}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      notifications: {
                        ...localSettings.notifications,
                        suppliers: e.target.checked
                      }
                    })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Configurações Gerais */}
          <div className="glass-card p-6 rounded-xl border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Globe className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Configurações Gerais</h2>
                <p className="text-sm text-orange-200">Personalize sua experiência</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-dark-primary mb-2">{t('settings.language')}</label>
                <select
                  value={localSettings.language}
                  onChange={(e) => setLocalSettings({...localSettings, language: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                >
                  <option value="pt-PT">{t('settings.portuguese')}</option>
                  <option value="en-US">{t('settings.english')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-primary mb-2">Tema</label>
                <select
                  value={localSettings.theme}
                  onChange={(e) => setLocalSettings({...localSettings, theme: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg p-3 text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                >
                  <option value="dark">Escuro</option>
                  <option value="light">Claro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
            </div>

                        <button
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
