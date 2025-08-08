import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Settings, Bell, Shield, Database, Save } from "lucide-react";

export function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    systemName: "SmartQuote RCS",
    language: "pt-PT",
    timezone: "Europe/Lisbon",
    currency: "EUR",
    autoBackup: true,
    maintenanceMode: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    quotesApproval: true,
    systemAlerts: true,
    weeklyReports: false,
    supplierUpdates: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "4",
    passwordPolicy: "strong",
    auditLogging: true,
    ipWhitelist: ""
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    apiEnabled: true,
    webhooks: false,
    externalSync: true,
    rateLimiting: "standard"
  });

  const handleSaveGeneral = () => {
    console.log("Salvando configurações gerais:", generalSettings);
    // Implementar lógica de salvamento
  };

  const handleSaveNotifications = () => {
    console.log("Salvando configurações de notificações:", notificationSettings);
    // Implementar lógica de salvamento
  };

  const handleSaveSecurity = () => {
    console.log("Salvando configurações de segurança:", securitySettings);
    // Implementar lógica de salvamento
  };

  const handleSaveIntegrations = () => {
    console.log("Salvando configurações de integrações:", integrationSettings);
    // Implementar lógica de salvamento
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
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
              Configure e personalize o comportamento do SmartQuote RCS
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
        <Tabs defaultValue="general" className="w-full h-full flex flex-col">
          <TabsList className="bg-dark-tag border border-dark-color mb-6 flex-shrink-0 grid grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="general" className="data-[state=active]:bg-dark-cta data-[state=active]:text-white text-dark-secondary text-sm flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Geral</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-dark-cta data-[state=active]:text-white text-dark-secondary text-sm flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-dark-cta data-[state=active]:text-white text-dark-secondary text-sm flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-dark-cta data-[state=active]:text-white text-dark-secondary text-sm flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Integrações</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 scrollable-content">
            <TabsContent value="general" className="h-full mt-0">
              <div className="glass-card p-8 lg:p-10 max-w-2xl bg-white/5 rounded-2xl border border-white/20">
                <div className="flex items-center space-x-3 mb-8">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-bold text-dark-primary">Configurações Gerais</h2>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="systemName" className="text-dark-primary">Nome do Sistema</Label>
                    <Input
                      id="systemName"
                      value={generalSettings.systemName}
                      onChange={(e) => setGeneralSettings({...generalSettings, systemName: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-dark-primary">Idioma</Label>
                      <Select value={generalSettings.language} onValueChange={(value) => setGeneralSettings({...generalSettings, language: value})}>
                        <SelectTrigger className="bg-dark-bg border-dark-color text-dark-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-color">
                          <SelectItem value="pt-PT">Português (Portugal)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-dark-primary">Fuso Horário</Label>
                      <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings({...generalSettings, timezone: value})}>
                        <SelectTrigger className="bg-dark-bg border-dark-color text-dark-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-color">
                          <SelectItem value="Europe/Lisbon">Europe/Lisbon</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-dark-primary">Moeda Padrão</Label>
                    <Select value={generalSettings.currency} onValueChange={(value) => setGeneralSettings({...generalSettings, currency: value})}>
                      <SelectTrigger className="bg-dark-bg border-dark-color text-dark-primary w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-dark-color">
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">Dollar ($)</SelectItem>
                        <SelectItem value="GBP">Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-dark-primary">Backup Automático</Label>
                        <p className="text-sm text-dark-secondary">Realizar backup diário dos dados</p>
                      </div>
                      <Switch
                        checked={generalSettings.autoBackup}
                        onCheckedChange={(checked) => setGeneralSettings({...generalSettings, autoBackup: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-dark-primary">Modo de Manutenção</Label>
                        <p className="text-sm text-dark-secondary">Desabilita temporariamente o sistema</p>
                      </div>
                      <Switch
                        checked={generalSettings.maintenanceMode}
                        onCheckedChange={(checked) => setGeneralSettings({...generalSettings, maintenanceMode: checked})}
                      />
                    </div>
                  </div>

                  <button onClick={handleSaveGeneral} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                    <Save className="w-5 h-5" />
                    <span>Salvar Configurações</span>
                  </button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="h-full mt-0">
              <div className="glass-card p-8 lg:p-10 max-w-2xl bg-white/5 rounded-2xl border border-white/20">
                <div className="flex items-center space-x-3 mb-8">
                  <Bell className="w-5 h-5 text-orange-400" />
                  <h2 className="text-lg font-bold text-dark-primary">Configurações de Notificações</h2>
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-dark-primary">Notificações por Email</Label>
                      <p className="text-sm text-dark-secondary">Receber alertas por email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-dark-primary">Aprovação de Cotações</Label>
                      <p className="text-sm text-dark-secondary">Notificar sobre cotações pendentes de aprovação</p>
                    </div>
                    <Switch
                      checked={notificationSettings.quotesApproval}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, quotesApproval: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-dark-primary">Alertas do Sistema</Label>
                      <p className="text-sm text-dark-secondary">Notificar sobre erros e problemas do sistema</p>
                    </div>
                    <Switch
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemAlerts: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-dark-primary">Relatórios Semanais</Label>
                      <p className="text-sm text-dark-secondary">Receber resumo semanal por email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-dark-primary">Atualizações de Fornecedores</Label>
                      <p className="text-sm text-dark-secondary">Notificar sobre mudanças nos fornecedores</p>
                    </div>
                    <Switch
                      checked={notificationSettings.supplierUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, supplierUpdates: checked})}
                    />
                  </div>

                  <button onClick={handleSaveNotifications} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                    <Save className="w-5 h-5" />
                    <span>Salvar Configurações</span>
                  </button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="h-full mt-0">
              <div className="glass-card p-8 lg:p-10 max-w-2xl bg-white/5 rounded-2xl border border-white/20">
                <div className="flex items-center space-x-3 mb-8">
                  <Shield className="w-5 h-5 text-red-400" />
                  <h2 className="text-lg font-bold text-dark-primary">Configurações de Segurança</h2>
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-dark-primary">Autenticação de Dois Fatores</Label>
                      <p className="text-sm text-dark-secondary">Aumenta a segurança das contas de usuário</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-dark-primary">Timeout de Sessão (horas)</Label>
                    <Select value={securitySettings.sessionTimeout} onValueChange={(value) => setSecuritySettings({...securitySettings, sessionTimeout: value})}>
                      <SelectTrigger className="bg-dark-bg border-dark-color text-dark-primary w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-dark-color">
                        <SelectItem value="1">1 hora</SelectItem>
                        <SelectItem value="2">2 horas</SelectItem>
                        <SelectItem value="4">4 horas</SelectItem>
                        <SelectItem value="8">8 horas</SelectItem>
                        <SelectItem value="24">24 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-dark-primary">Política de Senhas</Label>
                    <Select value={securitySettings.passwordPolicy} onValueChange={(value) => setSecuritySettings({...securitySettings, passwordPolicy: value})}>
                      <SelectTrigger className="bg-dark-bg border-dark-color text-dark-primary w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-dark-color">
                        <SelectItem value="basic">Básica</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="strong">Forte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-dark-primary">Log de Auditoria</Label>
                      <p className="text-sm text-dark-secondary">Registrar todas as ações dos usuários</p>
                    </div>
                    <Switch
                      checked={securitySettings.auditLogging}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, auditLogging: checked})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ipWhitelist" className="text-dark-primary">Lista Branca de IPs</Label>
                    <Input
                      id="ipWhitelist"
                      value={securitySettings.ipWhitelist}
                      onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})}
                      placeholder="192.168.1.0/24, 10.0.0.0/8"
                    />
                    <p className="text-xs text-dark-secondary">IPs permitidos separados por vírgula</p>
                  </div>

                  <button onClick={handleSaveSecurity} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                    <Save className="w-5 h-5" />
                    <span>Salvar Configurações</span>
                  </button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="h-full mt-0">
              <div className="glass-card p-8 lg:p-10 max-w-2xl bg-white/5 rounded-2xl border border-white/20">
                <div className="flex items-center space-x-3 mb-8">
                  <Database className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-bold text-dark-primary">Configurações de Integrações</h2>
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-dark-primary">API Habilitada</Label>
                      <p className="text-sm text-dark-secondary">Permitir acesso via API REST</p>
                    </div>
                    <Switch
                      checked={integrationSettings.apiEnabled}
                      onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, apiEnabled: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-dark-primary">Webhooks</Label>
                      <p className="text-sm text-dark-secondary">Notificações automáticas para sistemas externos</p>
                    </div>
                    <Switch
                      checked={integrationSettings.webhooks}
                      onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, webhooks: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-dark-primary">Sincronização Externa</Label>
                      <p className="text-sm text-dark-secondary">Sincronizar dados com sistemas ERP</p>
                    </div>
                    <Switch
                      checked={integrationSettings.externalSync}
                      onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, externalSync: checked})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-dark-primary">Limitação de Taxa</Label>
                    <Select value={integrationSettings.rateLimiting} onValueChange={(value) => setIntegrationSettings({...integrationSettings, rateLimiting: value})}>
                      <SelectTrigger className="bg-dark-bg border-dark-color text-dark-primary w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-dark-color">
                        <SelectItem value="low">Baixa (100/min)</SelectItem>
                        <SelectItem value="standard">Padrão (500/min)</SelectItem>
                        <SelectItem value="high">Alta (1000/min)</SelectItem>
                        <SelectItem value="unlimited">Ilimitada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <button onClick={handleSaveIntegrations} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                    <Save className="w-5 h-5" />
                    <span>Salvar Configurações</span>
                  </button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}