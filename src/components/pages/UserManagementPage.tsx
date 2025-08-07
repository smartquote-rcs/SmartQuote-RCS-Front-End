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
  Filter, 
  Edit, 
  Trash2, 
  UserCheck, 
  Shield, 
  User,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Eye,
  EyeOff
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
    <div className="glass-card p-4 hover:border-cyan-400/50 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0">
            {getRoleIcon(user.role)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
              <h3 className="font-bold text-dark-primary text-sm sm:text-base truncate">{user.name}</h3>
              <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
              </div>
            </div>
            <div className="space-y-1 text-xs sm:text-sm text-dark-secondary">
              <div className="flex items-center space-x-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{user.department}</span>
              </div>
              {user.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Último login: {user.lastLogin}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => handleToggleUserStatus(user.id)}
            className={`p-2 rounded-lg transition-colors ${
              user.status === "active" 
                ? "bg-green-600 hover:bg-green-500 text-white" 
                : "bg-gray-600 hover:bg-gray-500 text-white"
            }`}
            title={user.status === "active" ? "Desativar" : "Ativar"}
          >
            {user.status === "active" ? <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> : <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
          </button>
          <button
            onClick={() => handleEditUser(user)}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            title="Editar"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
                title="Remover"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-card border-white/20">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-dark-primary">Confirmar Remoção</AlertDialogTitle>
                <AlertDialogDescription className="text-dark-secondary">
                  Tem certeza que deseja remover o usuário <strong>{user.name}</strong>? 
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="glass-card border-white/20 text-dark-primary hover:bg-white/10">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-600 hover:bg-red-500 text-white"
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
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-primary">Gestão de Usuários</h1>
            <p className="text-xs sm:text-sm text-dark-secondary mt-1">
              Administre contas de usuário e permissões do sistema
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="glass-card text-center sm:text-left">
              {filteredUsers.length} usuários
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="dark-button-primary flex items-center justify-center space-x-2 px-4 py-2 text-sm">
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Usuário</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/20 w-full max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-dark-primary">Adicionar Novo Usuário</DialogTitle>
                  <DialogDescription className="text-dark-secondary">
                    Preencha os dados do novo usuário do sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-dark-primary">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="glass-card border-white/20 text-dark-primary"
                      placeholder="Nome do usuário"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-dark-primary">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="glass-card border-white/20 text-dark-primary"
                      placeholder="email@rcs.pt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-dark-primary">Senha Temporária</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="glass-card border-white/20 text-dark-primary pr-12"
                        placeholder="Senha inicial"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-secondary hover:text-dark-primary"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-dark-primary">Função</Label>
                      <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                        <SelectTrigger className="glass-card border-white/20 text-dark-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/20">
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="manager">Gestor</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-dark-primary">Departamento *</Label>
                      <Input
                        id="department"
                        value={newUser.department}
                        onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                        className="glass-card border-white/20 text-dark-primary"
                        placeholder="Departamento"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-dark-primary">Telefone</Label>
                    <Input
                      id="phone"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="glass-card border-white/20 text-dark-primary"
                      placeholder="+351 912 345 678"
                    />
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="glass-card border-white/20 text-dark-primary hover:bg-white/10 w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    className="dark-button-primary w-full sm:w-auto"
                  >
                    Adicionar Usuário
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 lg:p-8 bg-dark-bg">
        {/* Filters */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-secondary" />
              <Input
                placeholder="Pesquisar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card border-white/20 text-dark-primary placeholder:text-dark-secondary"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-32 glass-card border-white/20 text-dark-primary text-sm">
                  <SelectValue placeholder="Função" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  {roles.map(role => (
                    <SelectItem key={role} value={role} className="text-sm">
                      {role === "Todos" ? "Todos" : 
                       role === "user" ? "Usuário" :
                       role === "manager" ? "Gestor" : "Administrador"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 glass-card border-white/20 text-dark-primary text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  {statuses.map(status => (
                    <SelectItem key={status} value={status} className="text-sm">
                      {status === "Todos" ? "Todos" :
                       status === "active" ? "Ativo" :
                       status === "inactive" ? "Inativo" : "Suspenso"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-40 glass-card border-white/20 text-dark-primary text-sm">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept} className="text-sm">{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid gap-4 lg:gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="glass-card border-white/20 w-full max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-dark-primary">Editar Usuário</DialogTitle>
              <DialogDescription className="text-dark-secondary">
                Atualize os dados do usuário selecionado.
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-dark-primary">Nome Completo</Label>
                  <Input
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="glass-card border-white/20 text-dark-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-dark-primary">Email</Label>
                  <Input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="glass-card border-white/20 text-dark-primary"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-dark-primary">Função</Label>
                    <Select value={editingUser.role} onValueChange={(value: any) => setEditingUser({ ...editingUser, role: value })}>
                      <SelectTrigger className="glass-card border-white/20 text-dark-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/20">
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="manager">Gestor</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-dark-primary">Status</Label>
                    <Select value={editingUser.status} onValueChange={(value: any) => setEditingUser({ ...editingUser, status: value })}>
                      <SelectTrigger className="glass-card border-white/20 text-dark-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/20">
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="suspended">Suspenso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-dark-primary">Departamento</Label>
                  <Input
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="glass-card border-white/20 text-dark-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-dark-primary">Telefone</Label>
                  <Input
                    value={editingUser.phone || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="glass-card border-white/20 text-dark-primary"
                  />
                </div>
              </div>
            )}
            <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="glass-card border-white/20 text-dark-primary hover:bg-white/10 w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateUser}
                className="dark-button-primary w-full sm:w-auto"
              >
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