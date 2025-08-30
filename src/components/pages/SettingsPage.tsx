import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { emailService, EmailConfig } from '../../services/emailService';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Save, 
  Eye, 
  EyeOff,
  Lock,
  Mail,
  TestTube,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  phone: string;
}

interface GeneralSettings {
  systemName: string;
  language: string;
  timezone: string;
  currency: string;
  autoBackup: boolean;
  maintenanceMode: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  quotesApproval: boolean;
  systemAlerts: boolean;
  weeklyReports: boolean;
  supplierUpdates: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: string;
  passwordPolicy: string;
  auditLogging: boolean;
  ipWhitelist: string;
}

interface EmailSettings {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  checkInterval: number;
  showPassword: boolean;
}

interface PasswordData {
  current: string;
  new: string;
  confirm: string;
  showCurrent: boolean;
  showNew: boolean;
  showConfirm: boolean;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { changeLanguage } = useLanguage();
  
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    firstName: 'Admin',
    lastName: 'Sistema',
    email: 'admin@smartquote.com',
    company: 'SmartQuote RCS',
    role: 'Administrador',
    phone: '+351 000 000 000'
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    systemName: 'SmartQuote RCS',
    language: 'pt-PT',
    timezone: 'Europe/Lisbon',
    currency: 'EUR',
    autoBackup: true,
    maintenanceMode: false
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    quotesApproval: true,
    systemAlerts: true,
    weeklyReports: true,
    supplierUpdates: true
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: true,
    sessionTimeout: '8',
    passwordPolicy: 'strong',
    auditLogging: true,
    ipWhitelist: ''
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    enabled: false,
    host: '',
    port: 993,
    username: '',
    password: '',
    secure: true,
    checkInterval: 5,
    showPassword: false
  });

  const [emailTestResult, setEmailTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const [passwordData, setPasswordData] = useState<PasswordData>({
    current: '',
    new: '',
    confirm: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });

  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('smartquote-general-settings');
    const savedLanguage = localStorage.getItem('smartquote-language');
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setGeneralSettings(parsed);
      } catch (error) {
        console.error('Erro ao carregar configurações salvas:', error);
      }
    } else if (savedLanguage) {
      setGeneralSettings(prev => ({ ...prev, language: savedLanguage }));
    }

    // Carregar configurações de email
    const savedEmailConfig = emailService.loadSavedConfig();
    if (savedEmailConfig) {
      setEmailSettings({
        enabled: savedEmailConfig.enabled,
        host: savedEmailConfig.host,
        port: savedEmailConfig.port,
        username: savedEmailConfig.username,
        password: savedEmailConfig.password,
        secure: savedEmailConfig.secure,
        checkInterval: savedEmailConfig.checkInterval,
        showPassword: false
      });
    }
  }, []);

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleSaveProfile = () => {
    console.log('Salvando perfil do admin:', adminProfile);
    setSaveSuccess(t('settings.profileUpdated'));
  };

  const handleSaveGeneral = async () => {
    const languageMap: { [key: string]: string } = {
      'pt-PT': 'pt',
      'pt-BR': 'pt', 
      'en-US': 'en',
      'en-GB': 'en',
      'es-ES': 'es',
      'fr-FR': 'fr',
      'de-DE': 'de',
      'it-IT': 'it'
    };
    
    const newLang = languageMap[generalSettings.language] || 'pt';
    
    try {
      localStorage.setItem('smartquote-language', generalSettings.language);
      localStorage.setItem('smartquote-general-settings', JSON.stringify(generalSettings));
      
      const success = await changeLanguage(newLang);
      
      if (success) {
        setSaveSuccess(t('settings.languageChanged'));
      } else {
        setSaveSuccess(t('settings.settingsSaved'));
      }
      
    } catch (error) {
      console.error('Erro ao alterar idioma:', error);
      setSaveSuccess('Configurações salvas com erro na mudança de idioma.');
    }
  };

  const handleSaveNotifications = () => {
    console.log('Salvando configurações de notificações:', notificationSettings);
    setSaveSuccess(t('settings.notificationsSaved'));
  };

  const handleSaveSecurity = () => {
    console.log('Salvando configurações de segurança:', securitySettings);
    setSaveSuccess(t('settings.securitySaved'));
  };

  const handleTestEmailConnection = async () => {
    setIsTestingEmail(true);
    setEmailTestResult(null);

    try {
      const config: EmailConfig = {
        host: emailSettings.host,
        port: emailSettings.port,
        username: emailSettings.username,
        password: emailSettings.password,
        secure: emailSettings.secure,
        checkInterval: emailSettings.checkInterval,
        enabled: emailSettings.enabled
      };

      const success = await emailService.configure(config);
      
      if (success) {
        setEmailTestResult({ success: true, message: 'Conexão testada com sucesso!' });
      } else {
        setEmailTestResult({ success: false, message: 'Falha na conexão. Verifique as configurações.' });
      }
    } catch (error) {
      setEmailTestResult({ success: false, message: 'Erro ao testar conexão.' });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleSaveEmail = async () => {
    try {
      const config: EmailConfig = {
        host: emailSettings.host,
        port: emailSettings.port,
        username: emailSettings.username,
        password: emailSettings.password,
        secure: emailSettings.secure,
        checkInterval: emailSettings.checkInterval,
        enabled: emailSettings.enabled
      };

      const success = await emailService.configure(config);
      
      if (success) {
        setSaveSuccess('Configurações de email salvas com sucesso!');
      } else {
        setSaveSuccess('Erro ao salvar configurações de email.');
      }
    } catch (error) {
      console.error('Erro ao salvar email:', error);
      setSaveSuccess('Erro ao salvar configurações de email.');
    }
  };

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert(t('settings.passwordsDoNotMatch'));
      return;
    }
    
    if (passwordData.new.length < 8) {
      alert(t('settings.passwordTooShort'));
      return;
    }

    console.log('Alterando senha do admin');
    setPasswordData({
      current: '',
      new: '',
      confirm: '',
      showCurrent: false,
      showNew: false,
      showConfirm: false
    });
    setSaveSuccess(t('settings.passwordChanged'));
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-5 xl:py-6 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-dark-primary-text">
                {t('settings.systemSettings')}
              </h1>
              <p className="text-dark-secondary text-xs sm:text-sm lg:text-base mt-1">
                {t('settings.subtitle')}
              </p>
            </div>
          </div>
          
          {/* Status Notification */}
          {saveSuccess && (
            <div className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 self-start sm:self-auto">
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">{saveSuccess}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollable-content dashboard-main p-3 sm:p-4 lg:p-6 xl:p-8 bg-dark-bg max-h-[calc(100vh-80px)] sm:max-h-[calc(100vh-90px)] md:max-h-[calc(100vh-100px)] lg:max-h-[calc(100vh-110px)] xl:max-h-[calc(100vh-120px)]">
        {/* Profile Section - Fluid Design */}
        <div className="relative mb-4 sm:mb-6 lg:mb-8">
          <div className="absolute inset-0 bg-dark-card backdrop-blur-3xl rounded-2xl sm:rounded-[2rem]"></div>
          <div className="relative glass-card bg-dark-card rounded-2xl sm:rounded-[2rem] border border-dark-color overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-cyan-600/5"></div>
            
            <div className="relative p-4 sm:p-6 lg:p-8">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-dark-primary-text mb-1">{t('settings.adminProfile')}</h2>
                    <p className="text-blue-200 text-sm">{t('settings.personalInfo')}</p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSaveProfile}
                  className="h-9 sm:h-10 px-4 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-xl text-sm sm:text-base w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Perfil
                </Button>
              </div>

              {/* Profile Form - Flowing Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label className="text-dark-primary-text mb-2 block text-sm font-medium">{t('settings.firstName')}</Label>
                      <Input
                        value={adminProfile.firstName}
                        onChange={(e) => setAdminProfile({...adminProfile, firstName: e.target.value})}
                        className="h-9 sm:h-10 bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary backdrop-blur-sm text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label className="text-dark-primary-text mb-2 block text-sm font-medium">{t('settings.lastName')}</Label>
                      <Input
                        value={adminProfile.lastName}
                        onChange={(e) => setAdminProfile({...adminProfile, lastName: e.target.value})}
                        className="h-9 sm:h-10 bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary backdrop-blur-sm text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-dark-primary-text mb-2 block text-sm font-medium">{t('settings.email')}</Label>
                    <Input
                      type="email"
                      value={adminProfile.email}
                      onChange={(e) => setAdminProfile({...adminProfile, email: e.target.value})}
                      className="h-9 sm:h-10 bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary backdrop-blur-sm text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                  <div>
                    <Label className="text-dark-primary-text mb-2 block text-sm font-medium">{t('settings.company')}</Label>
                    <Input
                      value={adminProfile.company}
                      onChange={(e) => setAdminProfile({...adminProfile, company: e.target.value})}
                      className="h-9 sm:h-10 bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary backdrop-blur-sm text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-dark-primary-text mb-2 block text-sm font-medium">{t('settings.phone')}</Label>
                    <Input
                      value={adminProfile.phone}
                      onChange={(e) => setAdminProfile({...adminProfile, phone: e.target.value})}
                      className="h-9 sm:h-10 bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary backdrop-blur-sm text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="glass-card bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/20">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30 text-xs sm:text-sm">
                        {adminProfile.role}
                      </Badge>
                    </div>
                    <p className="text-blue-200 text-xs sm:text-sm">Nível de acesso administrativo completo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password & General Settings Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
          {/* Password Management */}
          <div className="relative">
            <div className="absolute inset-0 bg-dark-card backdrop-blur-2xl rounded-2xl sm:rounded-3xl"></div>
            <div className="relative glass-card bg-dark-card rounded-2xl sm:rounded-3xl border border-dark-color overflow-hidden shadow-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                <div className="p-2 bg-gradient-to-br from-red-600/20 to-red-500/20 rounded-xl">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-dark-primary-text">Alterar Senha</h3>
                  <p className="text-red-200 text-xs sm:text-sm">Mantenha sua conta segura</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="relative">
                  <Label className="text-dark-primary-text mb-2 block text-sm">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      type={passwordData.showCurrent ? "text" : "password"}
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                      className="h-9 sm:h-10 bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary pr-12 text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordData({...passwordData, showCurrent: !passwordData.showCurrent})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-secondary hover:text-dark-primary-text"
                    >
                      {passwordData.showCurrent ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Label className="text-dark-primary-text mb-2 block text-sm">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      type={passwordData.showNew ? "text" : "password"}
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                      className="h-9 sm:h-10 bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary pr-12 text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordData({...passwordData, showNew: !passwordData.showNew})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-secondary hover:text-dark-primary-text"
                    >
                      {passwordData.showNew ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Label className="text-dark-primary-text mb-2 block text-sm">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      type={passwordData.showConfirm ? "text" : "password"}
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                      className="h-9 sm:h-10 bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary pr-12 text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordData({...passwordData, showConfirm: !passwordData.showConfirm})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-secondary hover:text-dark-primary-text"
                    >
                      {passwordData.showConfirm ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  onClick={handleChangePassword}
                  className="w-full h-9 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
                >
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Alterar Senha
                </Button>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="relative">
            <div className="absolute inset-0 bg-dark-card backdrop-blur-2xl rounded-2xl sm:rounded-3xl"></div>
            <div className="relative glass-card bg-dark-card rounded-2xl sm:rounded-3xl border border-dark-color overflow-hidden shadow-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-xl">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-dark-primary-text">{t('settings.generalSettings')}</h3>
                    <p className="text-green-200 text-xs sm:text-sm">Configurações globais do sistema</p>
                  </div>
                </div>
                <Button 
                  onClick={handleSaveGeneral}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 h-8 sm:h-9 text-sm sm:text-base w-full sm:w-auto"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Salvar
                </Button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-dark-primary-text mb-2 block text-sm">{t('settings.systemName')}</Label>
                  <Input
                    value={generalSettings.systemName}
                    onChange={(e) => setGeneralSettings({...generalSettings, systemName: e.target.value})}
                    className="h-9 sm:h-10 bg-dark-card border-dark-color text-dark-primary-text placeholder-dark-secondary text-sm sm:text-base"
                  />
                </div>

                <div>
                  <Label className="text-dark-primary-text mb-2 block text-sm">{t('settings.language')}</Label>
                  <Select 
                    value={generalSettings.language} 
                    onValueChange={(value) => setGeneralSettings({...generalSettings, language: value})}
                  >
                    <SelectTrigger className="h-9 sm:h-10 bg-dark-card border-dark-color text-dark-primary-text text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-card border-dark-color">
                      <SelectItem value="pt-PT" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Português (Portugal)</SelectItem>
                      <SelectItem value="pt-BR" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">English (US)</SelectItem>
                      <SelectItem value="en-GB" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">English (UK)</SelectItem>
                      <SelectItem value="es-ES" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Español</SelectItem>
                      <SelectItem value="fr-FR" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-dark-primary-text mb-2 block text-sm">{t('settings.timezone')}</Label>
                    <Select 
                      value={generalSettings.timezone} 
                      onValueChange={(value) => setGeneralSettings({...generalSettings, timezone: value})}
                    >
                      <SelectTrigger className="h-9 sm:h-10 bg-dark-card border-dark-color text-dark-primary-text text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-dark-color">
                        <SelectItem value="Europe/Lisbon" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Lisboa</SelectItem>
                        <SelectItem value="Europe/Madrid" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Madrid</SelectItem>
                        <SelectItem value="Europe/London" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Londres</SelectItem>
                        <SelectItem value="Europe/Paris" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Paris</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-dark-primary-text mb-2 block text-sm">{t('settings.currency')}</Label>
                      <Select 
                        value={generalSettings.currency} 
                        onValueChange={(value) => setGeneralSettings({...generalSettings, currency: value})}
                      >
                        <SelectTrigger className="h-9 sm:h-10 bg-dark-card border-dark-color text-dark-primary-text text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-color">
                          <SelectItem value="EUR" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Euro (€)</SelectItem>
                          <SelectItem value="USD" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Dólar ($)</SelectItem>
                          <SelectItem value="GBP" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Libra (£)</SelectItem>
                          <SelectItem value="BRL" className="text-dark-primary-text hover:bg-dark-hover text-sm sm:text-base">Real (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <Label className="text-dark-primary-text text-sm">{t('settings.autoBackup')}</Label>
                    <p className="text-xs sm:text-sm text-dark-secondary">Backup automático diário</p>
                  </div>
                  <Switch
                    checked={generalSettings.autoBackup}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, autoBackup: checked})}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <Label className="text-dark-primary-text text-sm">{t('settings.maintenanceMode')}</Label>
                    <p className="text-xs sm:text-sm text-dark-secondary">Modo de manutenção</p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, maintenanceMode: checked})}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
