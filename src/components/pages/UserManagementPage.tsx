import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserCheck, 
  Shield, 
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  Activity,
  Building,
  Clock,
  X,
  Save
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "user" | "manager" | "admin";
  status: "active" | "inactive" | "suspended";
  department: string;
  phone?: string;
  lastLogin: string;
  createdAt: string;
}

const initialUsers: UserData[] = [
  {
    id: "USR-001",
    name: "João Silva",
    email: "usuario@rcs.pt",
    role: "user",
    status: "active",
    department: "Procurement",
    phone: "+351 912 345 678",
    lastLogin: "2024-01-24 14:30",
    createdAt: "2023-03-15"
  },
  {
    id: "USR-002",
    name: "Maria Santos",
    email: "gestor@rcs.pt", 
    role: "manager",
    status: "active",
    department: "Gestão",
    phone: "+351 913 456 789",
    lastLogin: "2024-01-24 13:45",
    createdAt: "2023-01-10"
  },
  {
    id: "USR-003",
    name: "Carlos Mendes",
    email: "admin@rcs.pt",
    role: "admin",
    status: "active",
    department: "TI",
    phone: "+351 914 567 890",
    lastLogin: "2024-01-24 15:00",
    createdAt: "2022-12-01"
  },
  {
    id: "USR-004",
    name: "Ana Costa",
    email: "ana.costa@rcs.pt",
    role: "user",
    status: "active",
    department: "Compras",
    phone: "+351 915 678 901",
    lastLogin: "2024-01-23 16:20",
    createdAt: "2023-06-20"
  },
  {
    id: "USR-005",
    name: "Pedro Oliveira",
    email: "pedro.oliveira@rcs.pt",
    role: "manager",
    status: "inactive",
    department: "Logística",
    phone: "+351 916 789 012",
    lastLogin: "2024-01-20 10:15",
    createdAt: "2023-08-05"
  }
];

const departments = ["Todos", "Procurement", "Gestão", "TI", "Compras", "Logística", "Financeiro"];
const roles = ["Todos", "user", "manager", "admin"];
const statuses = ["Todos", "active", "inactive", "suspended"];

const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return <Badge className="bg-red-600 text-white text-xs">Administrador</Badge>;
    case "manager":
      return <Badge className="bg-orange-600 text-white text-xs">Gestor</Badge>;
    case "user":
      return <Badge className="bg-blue-600 text-white text-xs">Usuário</Badge>;
    default:
      return <Badge className="text-xs">{role}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-600 text-white text-xs">Ativo</Badge>;
    case "inactive":
      return <Badge className="bg-gray-600 text-white text-xs">Inativo</Badge>;
    case "suspended":
      return <Badge className="bg-red-600 text-white text-xs">Suspenso</Badge>;
    default:
      return <Badge className="text-xs">{status}</Badge>;
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case "admin":
      return <Shield className="w-4 h-4 text-red-400" />;
    case "manager":
      return <UserCheck className="w-4 h-4 text-orange-400" />;
    case "user":
      return <User className="w-4 h-4 text-blue-400" />;
    default:
      return <User className="w-4 h-4 text-gray-400" />;
  }
};

export function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [departmentFilter, setDepartmentFilter] = useState("Todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user" as const,
    department: "",
    phone: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "Todos" || user.role === roleFilter;
    const matchesStatus = statusFilter === "Todos" || user.status === statusFilter;
    const matchesDepartment = departmentFilter === "Todos" || user.department === departmentFilter;
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.department) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const newUserId = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const userToAdd: UserData = {
      id: newUserId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "active",
      department: newUser.department,
      phone: newUser.phone,
      lastLogin: "Nunca",
      createdAt: new Date().toLocaleDateString('pt-PT')
    };

    setUsers([...users, userToAdd]);
    setNewUser({ name: "", email: "", role: "user", department: "", phone: "", password: "" });
    setIsAddDialogOpen(false);
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    setUsers(users.map(user => 
      user.id === editingUser.id ? editingUser : user
    ));
    setEditingUser(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === "active" ? "inactive" : "active" as const }
        : user
    ));
  };

  const UserCard = ({ user }: { user: UserData }) => (
    <div className="glass-card p-6 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 bg-white/5 rounded-2xl border border-white/20">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
            {getRoleIcon(user.role)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-3">
              <h3 className="font-bold text-dark-primary text-base sm:text-lg truncate">{user.name}</h3>
              <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-dark-secondary">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>{user.department}</span>
              </div>
              {user.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span>Login: {user.lastLogin}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => handleToggleUserStatus(user.id)}
            className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
              user.status === "active" 
                ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30" 
                : "bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 border border-gray-500/30"
            }`}
            title={user.status === "active" ? "Desativar" : "Ativar"}
          >
            {user.status === "active" ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => handleEditUser(user)}
            className="p-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition-all duration-300 hover:scale-110"
            title="Editar"
          >
            <Edit className="w-5 h-5" />
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all duration-300 hover:scale-110"
                title="Remover"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-card border-white/20 bg-slate-800/95 backdrop-blur-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  Confirmar Remoção
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-300">
                  Tem certeza que deseja remover o usuário <strong className="text-white">{user.name}</strong>? 
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 px-6 py-2 rounded-xl">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-xl font-semibold"
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-dark-bg border-b border-dark-color px-4 lg:px-8 py-4 lg:py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-primary flex items-center gap-3">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              Gestão de Usuários
            </h1>
            <p className="text-sm sm:text-base text-dark-secondary mt-2">
              Administre contas de usuário e permissões do sistema
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="glass-card px-4 py-2 text-center sm:text-left bg-blue-500/20 border-blue-500/30">
              <span className="text-blue-300 font-bold text-lg">{filteredUsers.length}</span>
              <span className="text-blue-200 ml-2">usuários</span>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                  <Plus className="w-5 h-5" />
                  <span>Adicionar Usuário</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/20 w-full max-w-md mx-auto bg-slate-800/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-400" />
                    Adicionar Novo Usuário
                  </DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Preencha os dados do novo usuário do sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      Nome Completo *
                    </Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Nome do usuário"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-green-400" />
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="email@rcs.pt"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      Senha Temporária
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="pr-12 bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Senha inicial"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-white font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-400" />
                        Função
                      </Label>
                      <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="manager">Gestor</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-white font-medium flex items-center gap-2">
                        <Building className="w-4 h-4 text-cyan-400" />
                        Departamento *
                      </Label>
                      <Input
                        id="department"
                        value={newUser.department}
                        onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                        placeholder="Departamento"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-yellow-400" />
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      placeholder="+351 912 345 678"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-slate-700/50">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 px-6 py-2 rounded-xl flex items-center gap-2 w-full sm:w-auto"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 w-full sm:w-auto transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Usuário
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1 dashboard-main p-4 lg:p-8 bg-dark-bg">
        {/* Filters */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
              <Input
                placeholder="Pesquisar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-cyan-400/20 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/50"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40 h-12 bg-slate-800/50 border-slate-600/50 text-white rounded-xl backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="truncate">
                      <SelectValue placeholder="Função" />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-slate-800/95 border-slate-600/50 backdrop-blur-sm rounded-xl">
                  {roles.map(role => (
                    <SelectItem 
                      key={role} 
                      value={role} 
                      className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50 rounded-lg m-1"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {role === "user" && <User className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                        {role === "manager" && <UserCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                        {role === "admin" && <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                        {role === "Todos" && <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                        <span className="truncate">
                          {role === "Todos" ? "Todos" : 
                           role === "user" ? "Usuário" :
                           role === "manager" ? "Gestor" : "Administrador"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36 h-12 bg-slate-800/50 border-slate-600/50 text-white rounded-xl backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <Activity className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="truncate">
                      <SelectValue placeholder="Status" />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-slate-800/95 border-slate-600/50 backdrop-blur-sm rounded-xl">
                  {statuses.map(status => (
                    <SelectItem 
                      key={status} 
                      value={status} 
                      className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50 rounded-lg m-1"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {status === "active" && <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>}
                        {status === "inactive" && <div className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0"></div>}
                        {status === "suspended" && <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>}
                        {status === "Todos" && <div className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0"></div>}
                        <span className="truncate">
                          {status === "Todos" ? "Todos" :
                           status === "active" ? "Ativo" :
                           status === "inactive" ? "Inativo" : "Suspenso"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-48 h-12 bg-slate-800/50 border-slate-600/50 text-white rounded-xl backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <Building className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">
                      <SelectValue placeholder="Departamento" />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-slate-800/95 border-slate-600/50 backdrop-blur-sm rounded-xl">
                  {departments.map(dept => (
                    <SelectItem 
                      key={dept} 
                      value={dept} 
                      className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50 rounded-lg m-1"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Building className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span className="truncate">{dept}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Results Summary */}
          {(searchTerm || roleFilter !== "Todos" || statusFilter !== "Todos" || departmentFilter !== "Todos") && (
            <div className="mt-4 p-4 bg-slate-800/30 border border-slate-600/30 rounded-xl backdrop-blur-sm">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                {/* Results Counter */}
                <div className="flex items-center gap-2 text-slate-300 min-w-fit">
                  <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm whitespace-nowrap">
                    Exibindo <span className="font-bold text-white">{filteredUsers.length}</span> de <span className="font-bold text-white">{users.length}</span> usuários
                  </span>
                </div>
                
                {/* Active Filters */}
                <div className="flex flex-wrap gap-2 flex-1">
                  {searchTerm && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-xs min-w-fit">
                      <Search className="w-3 h-3 flex-shrink-0" />
                      <span className="max-w-[120px] truncate">"{searchTerm}"</span>
                      <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-cyan-100 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {roleFilter !== "Todos" && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-xs min-w-fit">
                      <Shield className="w-3 h-3 flex-shrink-0" />
                      <span className="whitespace-nowrap">{roleFilter === "user" ? "Usuário" : roleFilter === "manager" ? "Gestor" : "Administrador"}</span>
                      <button onClick={() => setRoleFilter("Todos")} className="ml-1 hover:text-purple-100 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {statusFilter !== "Todos" && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-xs min-w-fit">
                      <Activity className="w-3 h-3 flex-shrink-0" />
                      <span className="whitespace-nowrap">{statusFilter === "active" ? "Ativo" : statusFilter === "inactive" ? "Inativo" : "Suspenso"}</span>
                      <button onClick={() => setStatusFilter("Todos")} className="ml-1 hover:text-orange-100 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {departmentFilter !== "Todos" && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-xs min-w-fit">
                      <Building className="w-3 h-3 flex-shrink-0" />
                      <span className="max-w-[100px] truncate">{departmentFilter}</span>
                      <button onClick={() => setDepartmentFilter("Todos")} className="ml-1 hover:text-cyan-100 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Users Grid */}
        <div className="grid gap-4 lg:gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="glass-card border-white/20 w-full max-w-2xl mx-auto bg-slate-800/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-3 text-xl">
                <Edit className="w-6 h-6 text-blue-400" />
                Editar Usuário
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Atualize os dados e permissões do usuário selecionado.
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-6 py-6">
                {/* Avatar e Info Básica */}
                <div className="flex items-center space-x-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                    {getRoleIcon(editingUser.role)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{editingUser.name}</h3>
                    <p className="text-slate-300">{editingUser.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getRoleBadge(editingUser.role)}
                      {getStatusBadge(editingUser.status)}
                    </div>
                  </div>
                </div>

                {/* Formulário em Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      Nome Completo
                    </Label>
                    <Input
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="Nome do usuário"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-green-400" />
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="email@rcs.pt"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      Função
                    </Label>
                    <Select value={editingUser.role} onValueChange={(value: any) => setEditingUser({ ...editingUser, role: value })}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            Usuário
                          </div>
                        </SelectItem>
                        <SelectItem value="manager">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-blue-400" />
                            Gestor
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-400" />
                            Administrador
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-medium flex items-center gap-2">
                      <Activity className="w-4 h-4 text-orange-400" />
                      Status
                    </Label>
                    <Select value={editingUser.status} onValueChange={(value: any) => setEditingUser({ ...editingUser, status: value })}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Ativo
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                            Inativo
                          </div>
                        </SelectItem>
                        <SelectItem value="suspended">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            Suspenso
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-medium flex items-center gap-2">
                      <Building className="w-4 h-4 text-cyan-400" />
                      Departamento
                    </Label>
                    <Input
                      value={editingUser.department}
                      onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="Nome do departamento"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-yellow-400" />
                      Telefone
                    </Label>
                    <Input
                      value={editingUser.phone || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="+351 912 345 678"
                    />
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Criado em: {editingUser.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Último login: {editingUser.lastLogin}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-slate-700/50">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 px-6 py-2 rounded-xl flex items-center gap-2 w-full sm:w-auto"
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateUser}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 w-full sm:w-auto transition-all duration-300 hover:scale-105"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 lg:py-12">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-dark-secondary mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-dark-primary mb-2">Nenhum usuário encontrado</h3>
            <p className="text-sm sm:text-base text-dark-secondary px-4">Tente ajustar os filtros de pesquisa</p>
          </div>
        )}
      </main>
    </div>
  );
}