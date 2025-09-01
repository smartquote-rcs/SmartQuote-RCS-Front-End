import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Save, 
  Eye, 
  EyeOff,
  Globe,
  Clock,
  DollarSign,
  HardDrive,
  Wrench,
  Mail,
  FileText,
  Users,
  Lock,
  Activity
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

//

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
      // Se não há configurações completas mas há idioma salvo, aplicar apenas o idioma
      setGeneralSettings(prev => ({ ...prev, language: savedLanguage }));
    }
  }, []);

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleSaveProfile = () => {
    // Aqui você salvaria os dados do perfil
    console.log('Salvando perfil do admin:', adminProfile);
    setSaveSuccess(t('settings.profileUpdated'));
  };

  const handleSaveGeneral = async () => {
    // Mapear códigos de idioma para o formato esperado pelo i18next
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
      console.log('Mudando idioma para:', newLang);
      console.log('Configurações gerais sendo salvas:', generalSettings);
      
      // Salvar configurações no localStorage
      localStorage.setItem('smartquote-language', generalSettings.language);
      localStorage.setItem('smartquote-general-settings', JSON.stringify(generalSettings));
      
      // Usar o hook para alterar idioma (aplica imediatamente em toda a aplicação)
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
    // Aqui você salvaria as configurações de notificações
    console.log('Salvando configurações de notificações:', notificationSettings);
    setSaveSuccess(t('settings.notificationsSaved'));
  };

  const handleSaveSecurity = () => {
    // Aqui você salvaria as configurações de segurança
    console.log('Salvando configurações de segurança:', securitySettings);
    setSaveSuccess(t('settings.securitySaved'));
  };

  // ...

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert(t('settings.passwordsDoNotMatch'));
      return;
    }
    
    if (passwordData.new.length < 8) {
      alert(t('settings.passwordTooShort'));
      return;
    }

    // Aqui você processaria a mudança de senha
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/80 to-purple-950/70 relative overflow-auto">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-cyan-600/10 backdrop-blur-3xl"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.15),transparent_50%)]"></div>
      </div>

      {/* Hero Header */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-8">
              {/* Profile Avatar */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl">
                  <User className="w-10 h-10 text-white" />
                  <div className="absolute inset-0 bg-white/20 rounded-3xl backdrop-blur-sm"></div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-2xl flex items-center justify-center border-4 border-slate-950 shadow-xl">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* Hero Text */}
              <div>
                <h1 className="text-4xl font-black text-white mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  {t('settings.systemSettings')}
                </h1>
                <p className="text-lg text-blue-200 mb-4">
                  {t('settings.subtitle')}
                </p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center text-cyan-300">
                    <Clock className="w-4 h-4 mr-2" />
                    Última atualização: {new Date().toLocaleDateString('pt-PT')}
                  </div>
                  <div className="flex items-center text-green-300">
                    <Shield className="w-4 h-4 mr-2" />
                    Sistema Seguro
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Notification */}
            {saveSuccess && (
              <div className="px-8 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl bg-green-500/10 border-green-500/20 text-green-300">
                <div className="flex items-center space-x-3">
                  <Save className="w-6 h-6" />
                  <span className="font-semibold text-lg">{saveSuccess}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Flow */}
      <div className="max-w-7xl mx-auto px-6 pb-20 -mt-8">
        {/* Profile Section - Fluid Design */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/1 backdrop-blur-3xl rounded-[2rem]"></div>
          <div className="relative bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
            
            <div className="relative p-10">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-6">
                  <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm">
                    <User className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{t('settings.adminProfile')}</h2>
                    <p className="text-lg text-blue-200">{t('settings.personalInfo')}</p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSaveProfile}
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white shadow-xl"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Salvar Perfil
                </Button>
              </div>

              {/* Profile Form - Flowing Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white mb-3 block text-sm font-medium">{t('settings.firstName')}</Label>
                      <Input
                        value={adminProfile.firstName}
                        onChange={(e) => setAdminProfile({...adminProfile, firstName: e.target.value})}
                        className="h-12 bg-white/10 border-white/20 text-white placeholder-slate-400 backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-white mb-3 block text-sm font-medium">{t('settings.lastName')}</Label>
                      <Input
                        value={adminProfile.lastName}
                        onChange={(e) => setAdminProfile({...adminProfile, lastName: e.target.value})}
                        className="h-12 bg-white/10 border-white/20 text-white placeholder-slate-400 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white mb-3 block text-sm font-medium">{t('settings.email')}</Label>
                    <Input
                      type="email"
                      value={adminProfile.email}
                      onChange={(e) => setAdminProfile({...adminProfile, email: e.target.value})}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder-slate-400 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <Label className="text-white mb-3 block text-sm font-medium">{t('settings.company')}</Label>
                    <Input
                      value={adminProfile.company}
                      onChange={(e) => setAdminProfile({...adminProfile, company: e.target.value})}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder-slate-400 backdrop-blur-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white mb-3 block text-sm font-medium">{t('settings.phone')}</Label>
                    <Input
                      value={adminProfile.phone}
                      onChange={(e) => setAdminProfile({...adminProfile, phone: e.target.value})}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder-slate-400 backdrop-blur-sm"
                    />
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/20">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        {adminProfile.role}
                      </Badge>
                    </div>
                    <p className="text-yellow-200 text-sm">Nível de acesso administrativo completo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password & General Settings Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Perfil do Administrador */}
          <Card className="glass-card bg-white/5 rounded-xl border border-white/20 transition-all duration-300 hover:border-cyan-400/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-dark-primary">
                <User className="w-6 h-6 text-blue-400" />
                {t('settings.adminProfile')}
              </CardTitle>
              <CardDescription className="text-dark-secondary">
                {t('settings.personalInfo')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-dark-primary">{t('settings.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={adminProfile.firstName}
                    onChange={(e) => setAdminProfile({...adminProfile, firstName: e.target.value})}
                    className="bg-dark-bg border-dark-color text-dark-primary placeholder-dark-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-dark-primary">{t('settings.lastName')}</Label>
                  <Input
                    id="lastName"
                    value={adminProfile.lastName}
                    onChange={(e) => setAdminProfile({...adminProfile, lastName: e.target.value})}
                    className="bg-dark-bg border-dark-color text-dark-primary placeholder-dark-secondary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-dark-primary">{t('settings.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={adminProfile.email}
                  onChange={(e) => setAdminProfile({...adminProfile, email: e.target.value})}
                  className="bg-dark-bg border-dark-color text-dark-primary placeholder-dark-secondary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-dark-primary">{t('settings.phone')}</Label>
                  <Input
                    id="phone"
                    value={adminProfile.phone}
                    onChange={(e) => setAdminProfile({...adminProfile, phone: e.target.value})}
                    className="bg-dark-bg border-dark-color text-dark-primary placeholder-dark-secondary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-dark-primary">{t('settings.role')}</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                    {adminProfile.role}
                  </Badge>
                </div>
              </div>

              <Button 
                onClick={handleSaveProfile}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {t('settings.saveProfile')}
              </Button>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Lock className="w-6 h-6 text-red-400" />
                {t('settings.changePassword')}
              </CardTitle>
              <CardDescription className="text-slate-300">
                {t('settings.updatePassword')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white">{t('settings.currentPassword')}</Label>
                <div className="relative">
                  <Input
                    type={passwordData.showCurrent ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder-slate-400 pr-10"
                    placeholder={t('settings.currentPasswordPlaceholder')}
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

              <div className="space-y-2">
                <Label className="text-white">{t('settings.newPassword')}</Label>
                <div className="relative">
                  <Input
                    type={passwordData.showNew ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder-slate-400 pr-10"
                    placeholder={t('settings.newPasswordPlaceholder')}
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

              <div className="space-y-2">
                <Label className="text-white">{t('settings.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    type={passwordData.showConfirm ? "text" : "password"}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder-slate-400 pr-10"
                    placeholder={t('settings.confirmPasswordPlaceholder')}
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

              <Button
                onClick={handleChangePassword}
                disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {t('settings.changePassword')}
              </Button>
            </CardContent>
          </Card>

          {/* Configurações Gerais */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Settings className="w-6 h-6 text-green-400" />
                {t('settings.generalSettings')}
              </CardTitle>            <CardDescription className="text-slate-300">
              {t('settings.generalSettingsDesc')}
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="systemName" className="text-white">{t('settings.systemName')}</Label>
                <Input
                  id="systemName"
                  value={generalSettings.systemName}
                  onChange={(e) => setGeneralSettings({...generalSettings, systemName: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t('settings.language')}
                  </Label>
                  <Select 
                    value={generalSettings.language} 
                    onValueChange={async (value) => {
                      setGeneralSettings({...generalSettings, language: value});
                      
                      // Aplicar mudança de idioma imediatamente
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
                      
                      const newLang = languageMap[value] || 'pt';
                      await changeLanguage(newLang);
                      
                      // Salvar a preferência imediatamente
                      localStorage.setItem('smartquote-language', value);
                    }}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 border-slate-700/50">
                      <SelectItem value="pt-PT" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">🇵🇹 Português (Portugal)</SelectItem>
                      <SelectItem value="pt-BR" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">🇧🇷 Português (Brasil)</SelectItem>
                      <SelectItem value="en-US" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">🇺🇸 English (US)</SelectItem>
                      <SelectItem value="en-GB" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">🇬🇧 English (UK)</SelectItem>
                      <SelectItem value="es-ES" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">🇪🇸 Español (España)</SelectItem>
                      <SelectItem value="fr-FR" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">🇫🇷 Français</SelectItem>
                      <SelectItem value="de-DE" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">🇩🇪 Deutsch</SelectItem>
                      <SelectItem value="it-IT" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">🇮🇹 Italiano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {t('settings.timezone')}
                  </Label>
                  <Select 
                    value={generalSettings.timezone} 
                    onValueChange={(value) => setGeneralSettings({...generalSettings, timezone: value})}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 border-slate-700/50">
                      <SelectItem value="Europe/Lisbon" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">Europe/Lisbon</SelectItem>
                      <SelectItem value="Europe/London" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">Europe/London</SelectItem>
                      <SelectItem value="America/New_York" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {t('settings.currency')}
                </Label>
                <Select 
                  value={generalSettings.currency} 
                  onValueChange={(value) => setGeneralSettings({...generalSettings, currency: value})}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 border-slate-700/50">
                    <SelectItem value="EUR" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">Euro (€)</SelectItem>
                    <SelectItem value="USD" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">Dollar ($)</SelectItem>
                    <SelectItem value="GBP" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-slate-300" />
                    <div>
                      <Label className="text-white">{t('settings.autoBackup')}</Label>
                      <p className="text-sm text-slate-400">{t('settings.backupDaily')}</p>
                    </div>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&_span]:data-[state=checked]:bg-white"
                    checked={generalSettings.autoBackup}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, autoBackup: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-slate-300" />
                    <div>
                      <Label className="text-white">{t('settings.maintenanceMode')}</Label>
                      <p className="text-sm text-slate-400">{t('settings.maintenanceDesc')}</p>
                    </div>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&_span]:data-[state=checked]:bg-white"
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, maintenanceMode: checked})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveGeneral}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {t('settings.saveGeneral')}
              </Button>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Bell className="w-6 h-6 text-orange-400" />
                {t('settings.notifications')}
              </CardTitle>
              <CardDescription className="text-slate-300">
                {t('settings.notificationsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-300" />
                    <div>
                      <Label className="text-white">{t('settings.emailNotifications')}</Label>
                      <p className="text-sm text-slate-400">{t('settings.emailDesc')}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&_span]:data-[state=checked]:bg-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-300" />
                    <div>
                      <Label className="text-white">{t('settings.quotesApproval')}</Label>
                      <p className="text-sm text-slate-400">{t('settings.quotesDesc')}</p>
                    </div>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&_span]:data-[state=checked]:bg-white"
                    checked={notificationSettings.quotesApproval}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, quotesApproval: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-300" />
                    <div>
                      <Label className="text-white">{t('settings.systemAlerts')}</Label>
                      <p className="text-sm text-slate-400">{t('settings.alertsDesc')}</p>
                    </div>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&_span]:data-[state=checked]:bg-white"
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemAlerts: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-300" />
                    <div>
                      <Label className="text-white">{t('settings.weeklyReports')}</Label>
                      <p className="text-sm text-slate-400">{t('settings.reportsDesc')}</p>
                    </div>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&_span]:data-[state=checked]:bg-white"
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-300" />
                    <div>
                      <Label className="text-white">{t('settings.supplierUpdates')}</Label>
                      <p className="text-sm text-slate-400">{t('settings.supplierDesc')}</p>
                    </div>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&_span]:data-[state=checked]:bg-white"
                    checked={notificationSettings.supplierUpdates}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, supplierUpdates: checked})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveNotifications}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {t('settings.saveNotifications')}
              </Button>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Shield className="w-6 h-6 text-red-400" />
                {t('settings.security')}
              </CardTitle>
              <CardDescription className="text-slate-300">
                {t('settings.securityDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">{t('settings.twoFactorAuth')}</Label>
                  <p className="text-sm text-slate-400">{t('settings.twoFactorDesc')}</p>
                </div>
                <Switch
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&_span]:data-[state=checked]:bg-white"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">{t('settings.sessionTimeout')}</Label>
                <Select 
                  value={securitySettings.sessionTimeout} 
                  onValueChange={(value) => setSecuritySettings({...securitySettings, sessionTimeout: value})}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 border-slate-700/50">
                    <SelectItem value="1" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">1 hora</SelectItem>
                    <SelectItem value="2" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">2 horas</SelectItem>
                    <SelectItem value="4" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">4 horas</SelectItem>
                    <SelectItem value="8" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">8 horas</SelectItem>
                    <SelectItem value="24" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">{t('settings.passwordPolicy')}</Label>
                <Select 
                  value={securitySettings.passwordPolicy} 
                  onValueChange={(value) => setSecuritySettings({...securitySettings, passwordPolicy: value})}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 border-slate-700/50">
                    <SelectItem value="basic" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">Básica</SelectItem>
                    <SelectItem value="medium" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">Média</SelectItem>
                    <SelectItem value="strong" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">Forte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">{t('settings.auditLogging')}</Label>
                  <p className="text-sm text-slate-400">{t('settings.auditDesc')}</p>
                </div>
                <Switch
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&_span]:data-[state=checked]:bg-white"
                  checked={securitySettings.auditLogging}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, auditLogging: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipWhitelist" className="text-white">{t('settings.ipWhitelist')}</Label>
                <Input
                  id="ipWhitelist"
                  value={securitySettings.ipWhitelist}
                  onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})}
                  placeholder="192.168.1.0/24, 10.0.0.0/8"
                  className="bg-white/10 border-white/20 text-white placeholder-slate-400"
                />
                <p className="text-xs text-slate-400">{t('settings.ipDesc')}</p>
              </div>

              <Button 
                onClick={handleSaveSecurity}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {t('settings.saveSecurity')}
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>
      </main>
    </div>
  );
}