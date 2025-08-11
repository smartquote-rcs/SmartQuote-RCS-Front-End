import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from 'react-i18next';
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
  const { i18n } = useTranslation();
  
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

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleSaveProfile = () => {
    // Aqui você salvaria os dados do perfil
    console.log('Salvando perfil do admin:', adminProfile);
    setSaveSuccess('Perfil atualizado com sucesso!');
  };

  const handleSaveGeneral = async () => {
    // Mapear e alterar idioma
    const newLang = generalSettings.language === 'pt-PT' || generalSettings.language === 'pt-BR' ? 'pt' : 'en';
    
    try {
      // Salvar no localStorage
      localStorage.setItem('i18nextLng', newLang);
      
      // Alterar idioma
      await i18n.changeLanguage(newLang);
      
      // Sempre recarregar a página para garantir que todas as traduções sejam aplicadas
      window.location.reload();
      
    } catch (error) {
      console.error('Erro ao alterar idioma admin:', error);
      // Mesmo com erro, recarregar para aplicar as configurações salvas
      window.location.reload();
    }
  };

  const handleSaveNotifications = () => {
    // Aqui você salvaria as configurações de notificações
    console.log('Salvando configurações de notificações:', notificationSettings);
    setSaveSuccess('Configurações de notificações salvas com sucesso!');
  };

  const handleSaveSecurity = () => {
    // Aqui você salvaria as configurações de segurança
    console.log('Salvando configurações de segurança:', securitySettings);
    setSaveSuccess('Configurações de segurança salvas com sucesso!');
  };

  // ...

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('As senhas não coincidem!');
      return;
    }
    
    if (passwordData.new.length < 8) {
      alert('A nova senha deve ter pelo menos 8 caracteres!');
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
    setSaveSuccess('Senha alterada com sucesso!');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              Configurações do Sistema
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">Gerencie todas as configurações administrativas do SmartQuote RCS</p>
          </div>
          {saveSuccess && (
            <div className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
              {saveSuccess}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
        <div className="max-w-6xl mx-auto">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Perfil do Administrador */}
          <Card className="glass-card bg-white/5 rounded-xl border border-white/20 transition-all duration-300 hover:border-cyan-400/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-dark-primary">
                <User className="w-6 h-6 text-blue-400" />
                Perfil do Administrador
              </CardTitle>
              <CardDescription className="text-dark-secondary">
                Informações pessoais e profissionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-dark-primary">Nome</Label>
                  <Input
                    id="firstName"
                    value={adminProfile.firstName}
                    onChange={(e) => setAdminProfile({...adminProfile, firstName: e.target.value})}
                    className="bg-dark-bg border-dark-color text-dark-primary placeholder-dark-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-dark-primary">Sobrenome</Label>
                  <Input
                    id="lastName"
                    value={adminProfile.lastName}
                    onChange={(e) => setAdminProfile({...adminProfile, lastName: e.target.value})}
                    className="bg-dark-bg border-dark-color text-dark-primary placeholder-dark-secondary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-dark-primary">Email</Label>
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
                  <Label htmlFor="phone" className="text-dark-primary">Telefone</Label>
                  <Input
                    id="phone"
                    value={adminProfile.phone}
                    onChange={(e) => setAdminProfile({...adminProfile, phone: e.target.value})}
                    className="bg-dark-bg border-dark-color text-dark-primary placeholder-dark-secondary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-dark-primary">Papel</Label>
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
                Salvar Perfil
              </Button>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Lock className="w-6 h-6 text-red-400" />
                Alterar Senha
              </CardTitle>
              <CardDescription className="text-slate-300">
                Atualize sua senha de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white">Senha Atual</Label>
                <div className="relative">
                  <Input
                    type={passwordData.showCurrent ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder-slate-400 pr-10"
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

              <div className="space-y-2">
                <Label className="text-white">Nova Senha</Label>
                <div className="relative">
                  <Input
                    type={passwordData.showNew ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder-slate-400 pr-10"
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

              <div className="space-y-2">
                <Label className="text-white">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    type={passwordData.showConfirm ? "text" : "password"}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder-slate-400 pr-10"
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

              <Button
                onClick={handleChangePassword}
                disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
            </CardContent>
          </Card>

          {/* Configurações Gerais */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Settings className="w-6 h-6 text-green-400" />
                Configurações Gerais
              </CardTitle>
              <CardDescription className="text-slate-300">
                Configurações básicas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="systemName" className="text-white">Nome do Sistema</Label>
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
                    Idioma
                  </Label>
                  <Select 
                    value={generalSettings.language} 
                    onValueChange={(value) => setGeneralSettings({...generalSettings, language: value})}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 border-slate-700/50">
                      <SelectItem value="pt-PT" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">Português (Portugal)</SelectItem>
                      <SelectItem value="en-US" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">English (US)</SelectItem>
                      <SelectItem value="es-ES" className="text-white hover:bg-blue-900/80 focus:bg-blue-900/80 data-[highlighted]:bg-blue-900/80 cursor-pointer">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Fuso Horário
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
                  Moeda Padrão
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
                      <Label className="text-white">Backup Automático</Label>
                      <p className="text-sm text-slate-400">Realizar backup diário dos dados</p>
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
                      <Label className="text-white">Modo de Manutenção</Label>
                      <p className="text-sm text-slate-400">Desabilita temporariamente o sistema</p>
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
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Bell className="w-6 h-6 text-orange-400" />
                Notificações
              </CardTitle>
              <CardDescription className="text-slate-300">
                Configure as notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-300" />
                    <div>
                      <Label className="text-white">Notificações por Email</Label>
                      <p className="text-sm text-slate-400">Receber alertas por email</p>
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
                      <Label className="text-white">Aprovação de Cotações</Label>
                      <p className="text-sm text-slate-400">Notificar sobre cotações pendentes</p>
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
                      <Label className="text-white">Alertas do Sistema</Label>
                      <p className="text-sm text-slate-400">Notificar sobre erros e problemas</p>
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
                      <Label className="text-white">Relatórios Semanais</Label>
                      <p className="text-sm text-slate-400">Receber resumo semanal por email</p>
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
                      <Label className="text-white">Atualizações de Fornecedores</Label>
                      <p className="text-sm text-slate-400">Notificar sobre mudanças nos fornecedores</p>
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
                Salvar Notificações
              </Button>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Shield className="w-6 h-6 text-red-400" />
                Segurança
              </CardTitle>
              <CardDescription className="text-slate-300">
                Configurações de segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-slate-400">Aumenta a segurança das contas</p>
                </div>
                <Switch
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&_span]:data-[state=checked]:bg-white"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Timeout de Sessão</Label>
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
                <Label className="text-white">Política de Senhas</Label>
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
                  <Label className="text-white">Log de Auditoria</Label>
                  <p className="text-sm text-slate-400">Registrar todas as ações dos usuários</p>
                </div>
                <Switch
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 [&_span]:data-[state=checked]:bg-white"
                  checked={securitySettings.auditLogging}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, auditLogging: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipWhitelist" className="text-white">Lista Branca de IPs</Label>
                <Input
                  id="ipWhitelist"
                  value={securitySettings.ipWhitelist}
                  onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})}
                  placeholder="192.168.1.0/24, 10.0.0.0/8"
                  className="bg-white/10 border-white/20 text-white placeholder-slate-400"
                />
                <p className="text-xs text-slate-400">IPs permitidos separados por vírgula</p>
              </div>

              <Button 
                onClick={handleSaveSecurity}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Segurança
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>
      </main>
    </div>
  );
}