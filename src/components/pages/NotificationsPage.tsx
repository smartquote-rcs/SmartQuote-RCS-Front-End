import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  Trash2,
  Check,
  Search,
  Filter,
  Calendar,
  Tag
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
  category: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nova Cotação Pendente',
    message: 'Cotação #2024-001 aguarda aprovação para Painel Solar 400W',
    type: 'info',
    timestamp: '2024-08-08T10:30:00Z',
    read: false,
    category: 'Cotações'
  },
  {
    id: '2',
    title: 'Sistema Atualizado',
    message: 'SmartQuote foi atualizado para versão 2.1.5 com melhorias de segurança',
    type: 'success',
    timestamp: '2024-08-08T09:15:00Z',
    read: false,
    category: 'Sistema'
  },
  {
    id: '3',
    title: 'Backup Falhou',
    message: 'Backup automático das 08:00 falhou. Verificar configurações.',
    type: 'error',
    timestamp: '2024-08-08T08:05:00Z',
    read: true,
    category: 'Sistema'
  },
  {
    id: '4',
    title: 'Novo Fornecedor Registrado',
    message: 'GreenTech Solutions foi adicionado como novo fornecedor',
    type: 'success',
    timestamp: '2024-08-07T16:45:00Z',
    read: true,
    category: 'Fornecedores'
  },
  {
    id: '5',
    title: 'Limite de API Atingido',
    message: 'Aplicação atingiu 80% do limite de chamadas da API externa',
    type: 'warning',
    timestamp: '2024-08-07T14:30:00Z',
    read: false,
    category: 'Sistema'
  },
  {
    id: '6',
    title: 'Relatório Mensal Disponível',
    message: 'Relatório de performance de julho está pronto para visualização',
    type: 'info',
    timestamp: '2024-08-01T09:00:00Z',
    read: true,
    category: 'Relatórios'
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    case 'error':
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    default:
      return <Info className="w-5 h-5 text-blue-400" />;
  }
};

const getNotificationBadge = (type: string) => {
  switch (type) {
    case 'success':
      return <Badge className="bg-green-600 text-white">Sucesso</Badge>;
    case 'warning':
      return <Badge className="bg-yellow-600 text-white">Aviso</Badge>;
    case 'error':
      return <Badge className="bg-red-600 text-white">Erro</Badge>;
    default:
      return <Badge className="bg-blue-600 text-white">Info</Badge>;
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins}m atrás`;
  } else if (diffHours < 24) {
    return `${diffHours}h atrás`;
  } else if (diffDays < 7) {
    return `${diffDays}d atrás`;
  } else {
    return date.toLocaleDateString('pt-PT');
  }
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const unreadCount = notifications.filter(n => !n.read).length;
  const categories = Array.from(new Set(notifications.map(n => n.category)));

  const filteredNotifications = notifications.filter(notification => {
    const typeMatch = filterType === 'all' || notification.type === filterType;
    const readMatch = filterRead === 'all' || 
      (filterRead === 'unread' && !notification.read) ||
      (filterRead === 'read' && notification.read);
    const categoryMatch = filterCategory === 'all' || notification.category === filterCategory;
    
    // Filtro por período
    let periodMatch = true;
    if (filterPeriod !== 'all') {
      const notificationDate = new Date(notification.timestamp);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (filterPeriod) {
        case 'today':
          periodMatch = diffDays === 0;
          break;
        case 'week':
          periodMatch = diffDays <= 7;
          break;
        case 'month':
          periodMatch = diffDays <= 30;
          break;
      }
    }
    
    // Filtro por pesquisa
    const searchMatch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return typeMatch && readMatch && categoryMatch && periodMatch && searchMatch;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllRead = () => {
    setNotifications(prev => prev.filter(n => !n.read));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <Bell className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              Notificações
              {unreadCount > 0 && (
                <Badge className="bg-red-600 text-white ml-2">{unreadCount}</Badge>
              )}
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
              Gerencie e acompanhe todas as notificações do sistema
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Button 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 sm:px-4 sm:py-2"
            >
              <Check className="w-4 h-4 mr-2" />
              Marcar Todas como Lidas
            </Button>
            <Button 
              onClick={clearAllRead}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-2 py-1 sm:px-4 sm:py-2"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Lidas
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
        {/* Quick Actions Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="glass-card bg-white/5 border border-white/20 rounded-xl p-1">
            <TabsTrigger 
              value="all" 
              onClick={() => {setFilterRead('all'); setFilterType('all');}}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-dark-secondary text-sm rounded-lg px-4 py-2 transition-all duration-300"
            >
              Todas ({notifications.length})
            </TabsTrigger>
            <TabsTrigger 
              value="unread"
              onClick={() => setFilterRead('unread')}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-dark-secondary text-sm rounded-lg px-4 py-2 transition-all duration-300"
            >
              Não Lidas ({unreadCount})
            </TabsTrigger>
            <TabsTrigger 
              value="important"
              onClick={() => setFilterType('error')}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white text-dark-secondary text-sm rounded-lg px-4 py-2 transition-all duration-300"
            >
              Importantes ({notifications.filter(n => n.type === 'error' || n.type === 'warning').length})
            </TabsTrigger>
            <TabsTrigger 
              value="today"
              onClick={() => setFilterPeriod('today')}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-dark-secondary text-sm rounded-lg px-4 py-2 transition-all duration-300"
            >
              Hoje ({notifications.filter(n => {
                const today = new Date();
                const notifDate = new Date(n.timestamp);
                return notifDate.toDateString() === today.toDateString();
              }).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Advanced Filters */}
        <div className="bg-white/5 border border-white/20 rounded-xl p-6 mb-6 glass-card">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Filtros Avançados</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search Bar - sempre visível */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-secondary" />
              <Input
                placeholder="Pesquisar notificações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card border-white/20 text-white placeholder:text-dark-secondary"
              />
            </div>

            {/* Type Filter - oculto no mobile */}
            <div className="hidden sm:block">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="glass-card border-white/20 text-white">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="glass-card bg-slate-900/95 border-slate-700/50">
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="info">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-400" />
                      Informação
                    </div>
                  </SelectItem>
                  <SelectItem value="success">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Sucesso
                    </div>
                  </SelectItem>
                  <SelectItem value="warning">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      Aviso
                    </div>
                  </SelectItem>
                  <SelectItem value="error">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      Erro
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter - oculto no mobile */}
            <div className="hidden sm:block">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="glass-card border-white/20 text-white">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="glass-card bg-slate-900/95 border-slate-700/50">
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-cyan-400" />
                        {category}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period Filter - oculto no mobile */}
            <div className="hidden sm:block">
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="glass-card border-white/20 text-white">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="glass-card bg-slate-900/95 border-slate-700/50">
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="today">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-400" />
                      Hoje
                    </div>
                  </SelectItem>
                  <SelectItem value="week">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      Última semana
                    </div>
                  </SelectItem>
                  <SelectItem value="month">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      Último mês
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2">
            {filterType !== 'all' && (
              <Badge 
                className="bg-blue-600/20 text-blue-300 border border-blue-500/50 cursor-pointer hover:bg-blue-600/30"
                onClick={() => setFilterType('all')}
              >
                Tipo: {filterType} ✕
              </Badge>
            )}
            {filterCategory !== 'all' && (
              <Badge 
                className="bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 cursor-pointer hover:bg-cyan-600/30"
                onClick={() => setFilterCategory('all')}
              >
                Categoria: {filterCategory} ✕
              </Badge>
            )}
            {filterPeriod !== 'all' && (
              <Badge 
                className="bg-purple-600/20 text-purple-300 border border-purple-500/50 cursor-pointer hover:bg-purple-600/30"
                onClick={() => setFilterPeriod('all')}
              >
                Período: {filterPeriod} ✕
              </Badge>
            )}
            {filterRead !== 'all' && (
              <Badge 
                className="bg-orange-600/20 text-orange-300 border border-orange-500/50 cursor-pointer hover:bg-orange-600/30"
                onClick={() => setFilterRead('all')}
              >
                Status: {filterRead === 'unread' ? 'Não lidas' : 'Lidas'} ✕
              </Badge>
            )}
            {searchTerm && (
              <Badge 
                className="bg-green-600/20 text-green-300 border border-green-500/50 cursor-pointer hover:bg-green-600/30"
                onClick={() => setSearchTerm('')}
              >
                Busca: "{searchTerm}" ✕
              </Badge>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <div className="glass-card px-4 py-2 bg-blue-500/20 border-blue-500/30">
              <span className="text-blue-300 font-bold text-lg">{filteredNotifications.length}</span>
              <span className="text-blue-200 ml-2">notificações filtradas</span>
            </div>
            {(filterType !== 'all' || filterCategory !== 'all' || filterPeriod !== 'all' || filterRead !== 'all' || searchTerm) && (
              <Button
                onClick={() => {
                  setFilterType('all');
                  setFilterCategory('all');
                  setFilterPeriod('all');
                  setFilterRead('all');
                  setSearchTerm('');
                }}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="glass-card bg-white/5 border-white/20 text-center py-12">
              <CardContent>
                <Bell className="w-12 h-12 text-dark-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-dark-primary mb-2">
                  Nenhuma notificação encontrada
                </h3>
                <p className="text-dark-secondary">
                  {filterType !== 'all' || filterRead !== 'all' 
                    ? 'Tente ajustar os filtros para ver mais notificações'
                    : 'Você está em dia com todas as notificações!'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`glass-card border-white/20 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/25 ${
                  notification.read ? 'bg-white/5' : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className={`font-semibold text-base ${
                          notification.read ? 'text-dark-primary' : 'text-white'
                        } line-clamp-1`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-2">
                          {getNotificationBadge(notification.type)}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-dark-secondary mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 space-y-2 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 text-xs text-dark-secondary">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(notification.timestamp)}</span>
                          </div>
                          <Badge variant="outline" className="border-white/20 text-white text-xs w-fit">
                            {notification.category}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <Button
                              onClick={() => markAsRead(notification.id)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 sm:px-3 sm:py-1.5"
                            >
                              <Check className="w-3 h-3 sm:mr-1" />
                              <span className="hidden sm:inline">Marcar como lida</span>
                            </Button>
                          )}
                          <Button
                            onClick={() => deleteNotification(notification.id)}
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/50 text-xs px-2 py-1 sm:px-3 sm:py-1.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
