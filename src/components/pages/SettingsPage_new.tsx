import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
  Clock,
  Lock,
  Mail,
  Search,
  CheckCircle,
  Check
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
          {/* Password Management */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 backdrop-blur-2xl rounded-3xl"></div>
            <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl">
                  <Lock className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Alterar Senha</h3>
                  <p className="text-red-200">Mantenha sua conta segura</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <Label className="text-white mb-2 block">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      type={passwordData.showCurrent ? "text" : "password"}
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                      className="h-12 bg-white/10 border-white/20 text-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordData({...passwordData, showCurrent: !passwordData.showCurrent})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {passwordData.showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Label className="text-white mb-2 block">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      type={passwordData.showNew ? "text" : "password"}
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                      className="h-12 bg-white/10 border-white/20 text-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordData({...passwordData, showNew: !passwordData.showNew})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {passwordData.showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Label className="text-white mb-2 block">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      type={passwordData.showConfirm ? "text" : "password"}
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                      className="h-12 bg-white/10 border-white/20 text-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordData({...passwordData, showConfirm: !passwordData.showConfirm})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {passwordData.showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  onClick={handleChangePassword}
                  className="w-full h-12 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Alterar Senha
                </Button>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 backdrop-blur-2xl rounded-3xl"></div>
            <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                    <Settings className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{t('settings.generalSettings')}</h3>
                    <p className="text-green-200">Configurações globais do sistema</p>
                  </div>
                </div>
                <Button 
                  onClick={handleSaveGeneral}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-white mb-2 block">{t('settings.systemName')}</Label>
                  <Input
                    value={generalSettings.systemName}
                    onChange={(e) => setGeneralSettings({...generalSettings, systemName: e.target.value})}
                    className="h-12 bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">{t('settings.language')}</Label>
                  <Select 
                    value={generalSettings.language} 
                    onValueChange={(value) => setGeneralSettings({...generalSettings, language: value})}
                  >
                    <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 border-slate-700/50">
                      <SelectItem value="pt-PT" className="text-white hover:bg-blue-900/80">Português (Portugal)</SelectItem>
                      <SelectItem value="pt-BR" className="text-white hover:bg-blue-900/80">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US" className="text-white hover:bg-blue-900/80">English (US)</SelectItem>
                      <SelectItem value="en-GB" className="text-white hover:bg-blue-900/80">English (UK)</SelectItem>
                      <SelectItem value="es-ES" className="text-white hover:bg-blue-900/80">Español</SelectItem>
                      <SelectItem value="fr-FR" className="text-white hover:bg-blue-900/80">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white mb-2 block">{t('settings.timezone')}</Label>
                    <Select 
                      value={generalSettings.timezone} 
                      onValueChange={(value) => setGeneralSettings({...generalSettings, timezone: value})}
                    >
                      <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 border-slate-700/50">
                        <SelectItem value="Europe/Lisbon" className="text-white hover:bg-blue-900/80">Lisboa</SelectItem>
                        <SelectItem value="Europe/Madrid" className="text-white hover:bg-blue-900/80">Madrid</SelectItem>
                        <SelectItem value="Europe/London" className="text-white hover:bg-blue-900/80">Londres</SelectItem>
                        <SelectItem value="Europe/Paris" className="text-white hover:bg-blue-900/80">Paris</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">{t('settings.currency')}</Label>
                    <Select 
                      value={generalSettings.currency} 
                      onValueChange={(value) => setGeneralSettings({...generalSettings, currency: value})}
                    >
                      <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 border-slate-700/50">
                        <SelectItem value="EUR" className="text-white hover:bg-blue-900/80">Euro (€)</SelectItem>
                        <SelectItem value="USD" className="text-white hover:bg-blue-900/80">Dólar ($)</SelectItem>
                        <SelectItem value="GBP" className="text-white hover:bg-blue-900/80">Libra (£)</SelectItem>
                        <SelectItem value="BRL" className="text-white hover:bg-blue-900/80">Real (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">{t('settings.autoBackup')}</Label>
                    <p className="text-sm text-slate-400">Backup automático diário</p>
                  </div>
                  <Switch
                    checked={generalSettings.autoBackup}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, autoBackup: checked})}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">{t('settings.maintenanceMode')}</Label>
                    <p className="text-sm text-slate-400">Modo de manutenção</p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, maintenanceMode: checked})}
                    className="data-[state=checked]:bg-orange-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Security Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Notifications */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 backdrop-blur-2xl rounded-3xl"></div>
            <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
                    <Bell className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{t('settings.notifications')}</h3>
                    <p className="text-yellow-200">Controle suas notificações</p>
                  </div>
                </div>
                <Button 
                  onClick={handleSaveNotifications}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">{t('settings.emailNotifications')}</Label>
                    <p className="text-sm text-slate-400">Receber notificações por email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                    className="data-[state=checked]:bg-yellow-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">{t('settings.quotesApproval')}</Label>
                    <p className="text-sm text-slate-400">Aprovações de cotações</p>
                  </div>
                  <Switch
                    checked={notificationSettings.quotesApproval}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, quotesApproval: checked})}
                    className="data-[state=checked]:bg-yellow-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">{t('settings.systemAlerts')}</Label>
                    <p className="text-sm text-slate-400">Alertas do sistema</p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemAlerts: checked})}
                    className="data-[state=checked]:bg-yellow-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">{t('settings.weeklyReports')}</Label>
                    <p className="text-sm text-slate-400">Relatórios semanais</p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
                    className="data-[state=checked]:bg-yellow-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">{t('settings.supplierUpdates')}</Label>
                    <p className="text-sm text-slate-400">Atualizações de fornecedores</p>
                  </div>
                  <Switch
                    checked={notificationSettings.supplierUpdates}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, supplierUpdates: checked})}
                    className="data-[state=checked]:bg-yellow-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-2xl rounded-3xl"></div>
            <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{t('settings.security')}</h3>
                    <p className="text-purple-200">Configurações de segurança</p>
                  </div>
                </div>
                <Button 
                  onClick={handleSaveSecurity}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">{t('settings.twoFactorAuth')}</Label>
                    <p className="text-sm text-slate-400">Autenticação de dois fatores</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">{t('settings.sessionTimeout')}</Label>
                  <Select 
                    value={securitySettings.sessionTimeout} 
                    onValueChange={(value) => setSecuritySettings({...securitySettings, sessionTimeout: value})}
                  >
                    <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 border-slate-700/50">
                      <SelectItem value="1" className="text-white hover:bg-purple-900/80">1 hora</SelectItem>
                      <SelectItem value="2" className="text-white hover:bg-purple-900/80">2 horas</SelectItem>
                      <SelectItem value="4" className="text-white hover:bg-purple-900/80">4 horas</SelectItem>
                      <SelectItem value="8" className="text-white hover:bg-purple-900/80">8 horas</SelectItem>
                      <SelectItem value="24" className="text-white hover:bg-purple-900/80">24 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block">{t('settings.passwordPolicy')}</Label>
                  <Select 
                    value={securitySettings.passwordPolicy} 
                    onValueChange={(value) => setSecuritySettings({...securitySettings, passwordPolicy: value})}
                  >
                    <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 border-slate-700/50">
                      <SelectItem value="basic" className="text-white hover:bg-purple-900/80">Básica</SelectItem>
                      <SelectItem value="medium" className="text-white hover:bg-purple-900/80">Média</SelectItem>
                      <SelectItem value="strong" className="text-white hover:bg-purple-900/80">Forte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">{t('settings.auditLogging')}</Label>
                    <p className="text-sm text-slate-400">Log de auditoria</p>
                  </div>
                  <Switch
                    checked={securitySettings.auditLogging}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, auditLogging: checked})}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">{t('settings.ipWhitelist')}</Label>
                  <Input
                    value={securitySettings.ipWhitelist}
                    onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})}
                    placeholder="192.168.1.0/24, 10.0.0.0/8"
                    className="h-12 bg-white/10 border-white/20 text-white placeholder-slate-400"
                  />
                  <p className="text-xs text-slate-400 mt-2">Lista de IPs permitidos (separados por vírgula)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Quotes History Section */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 backdrop-blur-2xl rounded-3xl"></div>
          <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Histórico de Cotações via Email</h3>
                  <p className="text-cyan-200">Cotações criadas automaticamente do sistema de email</p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  // Navegar para lista de cotações com filtro de email
                  console.log('Navegar para cotações via email');
                }}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6"
              >
                <Search className="w-4 h-4 mr-2" />
                Ver Todas
              </Button>
            </div>

            <div className="space-y-4">
              {/* Email Quote Item */}
              <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl p-4 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-cyan-400 text-sm font-medium">RCS-2024-1234</span>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                      Via Email
                    </Badge>
                  </div>
                  <span className="text-slate-400 text-xs">Hoje, 14:30</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400 block mb-1">Cliente:</span>
                    <span className="text-white">Empresa Solar Lda</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Produto:</span>
                    <span className="text-white">Painéis Solares 400W</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Email Origem:</span>
                    <span className="text-cyan-300 font-mono text-xs">joao@empresa.com</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm">Processado com sucesso</span>
                    </div>
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                      Ver Cotação →
                    </button>
                  </div>
                </div>
              </div>

              {/* Another Email Quote */}
              <div className="bg-gradient-to-r from-slate-800/20 to-slate-700/20 rounded-xl p-4 border border-slate-500/20 opacity-75">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span className="text-slate-400 text-sm font-medium">RCS-2024-1233</span>
                    <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 text-xs">
                      Via Email
                    </Badge>
                  </div>
                  <span className="text-slate-500 text-xs">Ontem, 09:15</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block mb-1">Cliente:</span>
                    <span className="text-slate-300">TechCorp International</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Produto:</span>
                    <span className="text-slate-300">Servidores Dell</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Email Origem:</span>
                    <span className="text-slate-400 font-mono text-xs">maria@techcorp.pt</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400 text-sm">Processado</span>
                    </div>
                    <button className="text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors">
                      Ver Cotação →
                    </button>
                  </div>
                </div>
              </div>

              {/* Empty State */}
              {false && (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-slate-300 font-medium mb-2">Nenhuma cotação via email ainda</h4>
                  <p className="text-slate-400 text-sm">
                    Configure o sistema de email para começar a receber cotações automaticamente
                  </p>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">12</div>
                <div className="text-xs text-slate-400">Total Processados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">10</div>
                <div className="text-xs text-slate-400">Bem-sucedidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">2</div>
                <div className="text-xs text-slate-400">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">0</div>
                <div className="text-xs text-slate-400">Com Erro</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
