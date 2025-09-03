import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useApp } from "../../contexts/AppContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
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
  Save,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { userService } from "../../api/services";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "user" | "manager" | "admin";
  status?: "active" | "inactive" | "suspended";
  department?: string;
  phone?: string;
  lastLogin?: string;
  createdAt?: string;
}

interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  duration?: number;
}

const departments = [
  "Todos",
  "Procurement",
  "Gestão",
  "TI",
  "Compras",
  "Logística",
  "Financeiro",
];
const roles = ["Todos", "user", "manager", "admin"];
const statuses = ["Todos", "active", "inactive", "suspended"];

const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return (
        <Badge className="bg-red-600 text-white text-xs">Administrador</Badge>
      );
    case "manager":
      return <Badge className="bg-orange-600 text-white text-xs">Gestor</Badge>;
    case "user":
      return <Badge className="bg-blue-600 text-white text-xs">Usuário</Badge>;
    default:
      return <Badge className="text-xs">{role}</Badge>;
  }
};

const getStatusBadge = (status?: string) => {
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

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("Todos");
  const [selectedRole, setSelectedRole] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
    score: 0,
  });
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user",
    department: "",
    phone: "",
    password: "",
    status: "active",
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Função para limpar o formulário
  const clearForm = () => {
    setNewUser({
      name: "",
      email: "",
      role: "user",
      department: "",
      phone: "",
      password: "",
      status: "active",
    });
    setPasswordStrength({
      hasMinLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumbers: false,
      hasSpecialChar: false,
      score: 0,
    });
    setIsAddDialogOpen(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Verificar se existe token de autenticação
      const token = localStorage.getItem("auth_token");
      console.log(
        "🔑 Debug - Token no localStorage:",
        token ? "Presente" : "Ausente"
      );
      console.log("🔑 Debug - Token completo:", token);

      if (!token) {
        console.error("❌ Token de autenticação não encontrado!");
        showToast(
          "error",
          "Erro de Autenticação",
          "Token não encontrado. Faça login novamente."
        );
        setLoading(false);
        return;
      }

      const response = await userService.getAll();

      console.log("🔍 Debug - Resposta completa da API (users):", response);

      if (response.success && response.data) {
        console.log("🔍 Debug - response.data:", response.data);
        console.log("🔍 Debug - Tipo de response.data:", typeof response.data);
        console.log("🔍 Debug - É array?", Array.isArray(response.data));
        console.log(
          "🔍 Debug - Keys de response.data:",
          Object.keys(response.data)
        );

        // Verificar se response.data é um array ou se está aninhado
        let usersArray = null;

        // Tentar diferentes estruturas possíveis de dados
        if (Array.isArray(response.data)) {
          console.log("🔍 Debug - Dados diretos em response.data (array)");
          usersArray = response.data;
        } else if (response.data.users && Array.isArray(response.data.users)) {
          console.log("🔍 Debug - Dados encontrados em response.data.users");
          usersArray = response.data.users;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log("🔍 Debug - Dados encontrados em response.data.data");
          usersArray = response.data.data;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          console.log("🔍 Debug - Dados encontrados em response.data.items");
          usersArray = response.data.items;
        } else {
          // Tentar encontrar qualquer propriedade que seja um array
          const dataKeys = Object.keys(response.data);
          for (const key of dataKeys) {
            if (Array.isArray(response.data[key])) {
              console.log(
                `🔍 Debug - Array encontrado em response.data.${key}`
              );
              usersArray = response.data[key];
              break;
            }
          }
        }

        // Se ainda não encontrou um array, tentar outras estruturas
        if (!usersArray) {
          // Se response.data é um objeto que contém um único usuário, transformar em array
          if (response.data.id || response.data._id || response.data.email) {
            console.log(
              "🔍 Debug - Objeto único detectado, convertendo para array"
            );
            usersArray = [response.data];
          } else {
            console.warn(
              "⚠️ Estrutura de dados não reconhecida:",
              response.data
            );
            setUsers([]);
            showToast(
              "error",
              "Formato de Dados Inválido",
              "A API retornou dados em formato não reconhecido. Contacte o administrador.",
              6000
            );
            return;
          }
        }

        console.log("🔍 Debug - usersArray final:", usersArray);
        console.log("🔍 Debug - Quantidade de usuários:", usersArray.length);

        // Verificar se o array tem elementos válidos
        if (usersArray.length === 0) {
          console.log("📝 Array vazio - nenhum usuário encontrado");
          setUsers([]);
          showToast(
            "info",
            "Lista Vazia",
            "Nenhum usuário encontrado no sistema. Adicione o primeiro usuário!",
            4000
          );
          return;
        }

        // Mapear dados da API para o formato local
        try {
          const mappedUsers: UserData[] = usersArray.map(
            (user: any, index: number) => {
              console.log(`🔍 Debug - Mapeando usuário ${index}:`, user);
              return {
                id:
                  user.id?.toString() ||
                  user._id?.toString() ||
                  `USER-${Date.now()}-${index}`,
                name:
                  user.name ||
                  user.username ||
                  user.displayName ||
                  "Nome não informado",
                email: user.email || "Email não informado",
                role: user.role || user.position || user.função || user.cargo || "user",
                status: user.status || "active",
                department:
                  user.department || user.departamento || "Não informado",
                phone: user.phone || user.contacto || user.phoneNumber || "",
                lastLogin: user.lastLogin || user.last_login || "Nunca",
                createdAt:
                  user.createdAt ||
                  user.created_at ||
                  user.dateCreated ||
                  new Date().toLocaleDateString("pt-PT"),
              };
            }
          );

          console.log("🔍 Debug - Usuários mapeados:", mappedUsers);
          setUsers(mappedUsers);

          showToast(
            "success",
            "Dados Carregados",
            `${mappedUsers.length} usuários carregados da API com sucesso!`,
            3000
          );
        } catch (mappingError) {
          console.error(
            "💥 Erro durante o mapeamento dos usuários:",
            mappingError
          );
          console.error("💥 Dados que causaram o erro:", usersArray);
          setUsers([]);
          showToast(
            "error",
            "Erro no Processamento",
            "Falha ao processar dados da API. Formato de dados incompatível.",
            6000
          );
        }
      } else {
        console.error("❌ Erro ao carregar usuários:", response.error);
        setUsers([]);
        showToast(
          "error",
          "Erro na API",
          `Falha ao carregar usuários: ${
            response.error || "Erro desconhecido"
          }`,
          6000
        );
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setUsers([]);
      showToast(
        "error",
        "Conexão Falhada",
        "Não foi possível conectar à API. Verifique sua conexão.",
        6000
      );
    } finally {
      setLoading(false);
    }
  };

  // Funções para Toast Notifications
  const showToast = (
    type: "success" | "error" | "info",
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString();
    const newToast: ToastNotification = { id, type, title, message, duration };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast após duração especificada
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const [showPassword, setShowPassword] = useState(false);

  // Função para calcular força da senha
  const calculatePasswordStrength = (pwd: string) => {
    const hasMinLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    const score = [
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    ].filter(Boolean).length;

    setPasswordStrength({
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      score,
    });
  };

  // Função para validar dados do usuário
  const validateUserData = () => {
    // Limpar espaços em branco
    const cleanName = newUser.name.trim();
    const cleanEmail = newUser.email.trim();
    const cleanDepartment = newUser.department.trim();

    // Validações obrigatórias
    if (!cleanName || !cleanEmail || !cleanDepartment) {
      showToast(
        "error",
        "Campos Obrigatórios",
        "Por favor, preencha todos os campos obrigatórios: Nome, Email e Departamento."
      );
      return false;
    }

    // Validação de nome
    if (cleanName.length < 2) {
      showToast(
        "error",
        "Nome Inválido",
        "O nome deve ter pelo menos 2 caracteres."
      );
      return false;
    }

    // Validação de nome - não pode ter só números
    if (/^\d+$/.test(cleanName)) {
      showToast(
        "error",
        "Nome Inválido",
        "O nome não pode conter apenas números."
      );
      return false;
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      showToast(
        "error",
        "Email Inválido",
        "Por favor, insira um endereço de email válido (exemplo: usuario@empresa.com)."
      );
      return false;
    }

    // Verificar se email já existe
    const emailExists = users.some(
      (user) => user.email.toLowerCase() === cleanEmail.toLowerCase()
    );
    if (emailExists) {
      showToast(
        "error",
        "Email em Uso",
        "Este endereço de email já está registrado no sistema. Use um email diferente."
      );
      return false;
    }

    // Validação de departamento
    if (cleanDepartment.length < 2) {
      showToast(
        "error",
        "Departamento Inválido",
        "O departamento deve ter pelo menos 2 caracteres."
      );
      return false;
    }

    // Validação de função/role
    if (!["user", "manager", "admin"].includes(newUser.role)) {
      showToast(
        "error",
        "Função Inválida",
        "Por favor, selecione uma função válida."
      );
      return false;
    }

    // Validação de status
    if (!["active", "inactive"].includes(newUser.status)) {
      showToast(
        "error",
        "Status Inválido",
        "Por favor, selecione um status válido."
      );
      return false;
    }

    // Validação de telefone (se fornecido)
    if (newUser.phone && newUser.phone.trim()) {
      const cleanPhone = newUser.phone.trim();
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
      if (!phoneRegex.test(cleanPhone)) {
        showToast(
          "error",
          "Telefone Inválido",
          "Por favor, insira um número de telefone válido (8-15 dígitos)."
        );
        return false;
      }
    }

    // Validação de senha (se fornecida)
    if (newUser.password && newUser.password.length > 0) {
      if (newUser.password.length < 8) {
        showToast(
          "error",
          "Senha Fraca",
          "A senha deve ter pelo menos 8 caracteres para maior segurança."
        );
        return false;
      }

      const hasUpperCase = /[A-Z]/.test(newUser.password);
      const hasLowerCase = /[a-z]/.test(newUser.password);
      const hasNumbers = /\d/.test(newUser.password);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        showToast(
          "error",
          "Senha Insegura",
          "A senha deve conter pelo menos: uma letra maiúscula, uma minúscula e um número."
        );
        return false;
      }
    }

    return true;
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department &&
        user.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === "Todos" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "Todos" || user.status === selectedStatus;
    const matchesDepartment =
      selectedDepartment === "Todos" || user.department === selectedDepartment;

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  // Função de debug para verificar estado do formulário
  const debugFormState = () => {
    console.log("🔍 Estado atual do formulário:", {
      name: `"${newUser.name}" (length: ${newUser.name.length})`,
      email: `"${newUser.email}" (length: ${
        newUser.email.length
      }, valid: ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)})`,
      department: `"${newUser.department}" (length: ${newUser.department.length})`,
      role: newUser.role,
      status: newUser.status,
      phone: `"${newUser.phone}" (length: ${newUser.phone.length})`,
      password: newUser.password
        ? `"[DEFINIDA]" (length: ${newUser.password.length})`
        : "[VAZIA]",
      isFormValid: !(!newUser.name || !newUser.email || !newUser.department),
    });
  };

  const handleAddUser = async () => {
    console.log("🚀 Iniciando processo de criação de usuário...");
    debugFormState();

    // Usar a função de validação
    if (!validateUserData()) {
      console.log("❌ Validação falhou, cancelando criação");
      return;
    }

    console.log("✅ Validação passou, continuando...");
    setIsCreatingUser(true);

    try {

      // Formatar telefone para 9 dígitos numéricos
      let formattedPhone = newUser.phone.replace(/\D/g, "");
      if (formattedPhone.length > 9) {
        formattedPhone = formattedPhone.slice(0, 9);
      }

      const newUserData = {
        nome: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        função: newUser.role as "user" | "manager" | "admin",
        departamento: newUser.department.trim(),
        contacto: formattedPhone || undefined,
        ...(newUser.password &&
          newUser.password.length > 0 && { password: newUser.password }),
      };

      // Log dos dados que serão enviados (sem a senha por segurança)
      console.log("� Dados preparados para API:", {
        ...newUserData,
        password: newUserData.password ? "[SENHA DEFINIDA]" : "[SEM SENHA]",
      });

      const response = await userService.create(newUserData);
      console.log("📨 Resposta do serviço de criação:", response);

      if (response.success) {
        console.log("✅ Usuário criado com sucesso!");

        // Recarregar lista de usuários
        console.log("🔄 Recarregando lista de usuários...");
        await loadUsers();

        // Salvar o role do usuário no localStorage para futuro login
        localStorage.setItem("user_role_" + newUser.email, newUser.role);

        // Mensagem de sucesso com informação sobre o dashboard
        const dashboardInfo =
          newUser.role === "admin"
            ? "Administrador (acesso completo)"
            : newUser.role === "manager"
            ? "Gerente (acesso limitado)"
            : "Usuário (acesso básico)";

        showToast(
          "success",
          "Usuário Criado com Sucesso",
          `${newUser.name} foi adicionado como ${dashboardInfo}. ${
            newUser.password
              ? "Senha temporária definida."
              : "Usuário receberá email para definir senha."
          }`
        );

        console.log(`👤 Role salvo para ${newUser.email}: ${newUser.role}`);

        // Limpar formulário e fechar dialog
        clearForm();
      } else {
        console.log("❌ Falha ao criar usuário:", response.error);

        // Melhor tratamento de mensagens de erro
        let errorMessage = response.error || "Ocorreu um erro inesperado.";

        // Tratar erros específicos comuns
        if (errorMessage.toLowerCase().includes("email")) {
          errorMessage = "Este email já está em uso ou é inválido.";
        } else if (errorMessage.toLowerCase().includes("password")) {
          errorMessage = "A senha não atende aos critérios de segurança.";
        } else if (errorMessage.toLowerCase().includes("required")) {
          errorMessage = "Alguns campos obrigatórios estão faltando.";
        } else if (errorMessage.toLowerCase().includes("validation")) {
          errorMessage = "Dados inválidos. Verifique todos os campos.";
        }

        showToast("error", "Erro ao Criar Usuário", errorMessage);
      }
    } catch (error) {
      console.error("💥 Erro ao criar usuário:", error);
      showToast(
        "error",
        "Falha na Conexão",
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
      );
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      console.log("📝 Tentando atualizar usuário:", editingUser);

      const updateData = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        department: editingUser.department,
        phone: editingUser.phone,
        status: editingUser.status,
      };

      const response = await userService.updateUser(editingUser.id, updateData);

      if (response.success) {
        console.log("✅ Usuário atualizado com sucesso!");

        // Atualizar na lista local
        setUsers(
          users.map((user) => (user.id === editingUser.id ? editingUser : user))
        );

        // Atualizar o role do usuário no localStorage se foi alterado
        localStorage.setItem(
          "user_role_" + editingUser.email,
          editingUser.role
        );
        console.log(
          `👤 Role atualizado para ${editingUser.email}: ${editingUser.role}`
        );

        showToast(
          "success",
          "Usuário Atualizado",
          "Dados do usuário atualizados com sucesso.",
          3000
        );

        setEditingUser(null);
        setIsEditDialogOpen(false);
      } else {
        console.error("❌ Erro ao atualizar usuário:", response.error);
        showToast(
          "error",
          "Erro ao Atualizar",
          `Falha ao atualizar usuário: ${response.error}`,
          5000
        );
      }
    } catch (error) {
      console.error("💥 Erro inesperado ao atualizar usuário:", error);
      showToast(
        "error",
        "Erro Inesperado",
        "Erro inesperado ao atualizar usuário. Tente novamente.",
        5000
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log("🗑️ Tentando deletar usuário:", userId);
      const response = await userService.deleteUser(userId);

      if (response.success) {
        console.log("✅ Usuário deletado com sucesso!");
        // Remover da lista local
        setUsers(users.filter((user) => user.id !== userId));
        showToast(
          "success",
          "Usuário Removido",
          "Usuário removido com sucesso do sistema.",
          3000
        );
      } else {
        console.error("❌ Erro ao deletar usuário:", response.error);
        showToast(
          "error",
          "Erro ao Remover",
          `Falha ao remover usuário: ${response.error}`,
          5000
        );
      }
    } catch (error) {
      console.error("💥 Erro inesperado ao deletar usuário:", error);
      showToast(
        "error",
        "Erro Inesperado",
        "Erro inesperado ao remover usuário. Tente novamente.",
        5000
      );
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status:
                user.status === "active" ? "inactive" : ("active" as const),
            }
          : user
      )
    );
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
              <h3 className="font-bold text-dark-primary text-base sm:text-lg truncate">
                {user.name}
              </h3>
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
            {user.status === "active" ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
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
                  Tem certeza que deseja remover o usuário{" "}
                  <strong className="text-white">{user.name}</strong>? Esta ação
                  não pode ser desfeita.
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
              <span className="text-blue-300 font-bold text-lg">
                {filteredUsers.length}
              </span>
              <span className="text-blue-200 ml-2">usuários</span>
            </div>
            <Button
              onClick={loadUsers}
              disabled={loading}
              className="glass-card bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-400/50 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>{loading ? "Carregando..." : "Atualizar"}</span>
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                  <Plus className="w-5 h-5" />
                  <span>Adicionar Usuário</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/20 w-full max-w-lg mx-auto bg-slate-800/95 backdrop-blur-sm max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-2">
                  <DialogTitle className="text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-400" />
                    Adicionar Novo Usuário
                  </DialogTitle>
                  <DialogDescription className="text-slate-300 text-sm">
                    Campos marcados com <span className="text-red-400">*</span> são obrigatórios.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label htmlFor="name" className="text-white text-sm">
                        Nome Completo <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Ex: João Silva"
                        className="bg-slate-700/50 border-slate-600 text-white mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-white text-sm">
                        Email <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="usuario@rcs.pt"
                        className="bg-slate-700/50 border-slate-600 text-white mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="department" className="text-white text-sm">
                          Departamento <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="department"
                          value={newUser.department}
                          onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                          placeholder="Ex: TI, Compras"
                          className="bg-slate-700/50 border-slate-600 text-white mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="role" className="text-white text-sm">
                          Função <span className="text-red-400">*</span>
                        </Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}
                        >
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="user">Usuário</SelectItem>
                            <SelectItem value="manager">Gestor</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="phone" className="text-white text-sm">
                          Telefone
                        </Label>
                        <Input
                          id="phone"
                          value={newUser.phone}
                          onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                          placeholder="+351 912 345 678"
                          className="bg-slate-700/50 border-slate-600 text-white mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="status" className="text-white text-sm">
                          Status
                        </Label>
                        <Select
                          value={newUser.status}
                          onValueChange={(value: any) => setNewUser({ ...newUser, status: value })}
                        >
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white mt-1">
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
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-white text-sm">
                        Senha Temporária <span className="text-xs text-slate-400">(Opcional)</span>
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={newUser.password}
                          onChange={(e) => {
                            const newPassword = e.target.value;
                            setNewUser({ ...newUser, password: newPassword });
                            if (newPassword) {
                              calculatePasswordStrength(newPassword);
                            } else {
                              setPasswordStrength({
                                hasMinLength: false,
                                hasUpperCase: false,
                                hasLowerCase: false,
                                hasNumbers: false,
                                hasSpecialChar: false,
                                score: 0,
                              });
                            }
                          }}
                          className="pr-10 bg-slate-700/50 border-slate-600 text-white"
                          placeholder="Deixe vazio para definir depois"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {newUser.password && (
                        <div className="mt-2 p-2 rounded bg-slate-700/30 border border-slate-600/50">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  passwordStrength.score <= 2
                                    ? "bg-red-500"
                                    : passwordStrength.score <= 3
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400">
                              {passwordStrength.score <= 2 ? "Fraca" : passwordStrength.score <= 3 ? "Regular" : "Forte"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-700/50">
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearForm();
                      setIsAddDialogOpen(false);
                    }}
                    className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 px-4 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    disabled={!newUser.name || !newUser.email || !newUser.department || isCreatingUser}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 w-full sm:w-auto ${
                      !newUser.name || !newUser.email || !newUser.department || isCreatingUser
                        ? "bg-slate-600/50 text-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    }`}
                  >
                    {isCreatingUser ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Criar Usuário
                      </>
                    )}
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
            {/* Search Bar - sempre visível */}
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
              <Input
                placeholder="Pesquisar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-cyan-400/20 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/50"
              />
            </div>

            {/* Filter Controls - ocultos no mobile */}
            <div className="hidden sm:flex flex-col sm:flex-row gap-3">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:w-40 h-12 bg-slate-800/50 border-slate-600/50 text-white rounded-xl backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="truncate">
                      <SelectValue placeholder="Função" />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-slate-800/95 border-slate-600/50 backdrop-blur-sm rounded-xl">
                  {roles.map((role) => (
                    <SelectItem
                      key={role}
                      value={role}
                      className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50 rounded-lg m-1"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {role === "user" && (
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        {role === "manager" && (
                          <UserCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        )}
                        {role === "admin" && (
                          <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        )}
                        {role === "Todos" && (
                          <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <span className="truncate">
                          {role === "Todos"
                            ? "Todos"
                            : role === "user"
                            ? "Usuário"
                            : role === "manager"
                            ? "Gestor"
                            : "Administrador"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-36 h-12 bg-slate-800/50 border-slate-600/50 text-white rounded-xl backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <Activity className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="truncate">
                      <SelectValue placeholder="Status" />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-slate-800/95 border-slate-600/50 backdrop-blur-sm rounded-xl">
                  {statuses.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="text-white hover:bg-slate-700/50 focus:bg-slate-700/50 rounded-lg m-1"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {status === "active" && (
                          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                        )}
                        {status === "inactive" && (
                          <div className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0"></div>
                        )}
                        {status === "suspended" && (
                          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                        )}
                        {status === "Todos" && (
                          <div className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0"></div>
                        )}
                        <span className="truncate">
                          {status === "Todos"
                            ? "Todos"
                            : status === "active"
                            ? "Ativo"
                            : status === "inactive"
                            ? "Inativo"
                            : "Suspenso"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-full sm:w-48 h-12 bg-slate-800/50 border-slate-600/50 text-white rounded-xl backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <Building className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">
                      <SelectValue placeholder="Departamento" />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-slate-800/95 border-slate-600/50 backdrop-blur-sm rounded-xl">
                  {departments.map((dept) => (
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
          {(searchTerm ||
            selectedRole !== "Todos" ||
            selectedStatus !== "Todos" ||
            selectedDepartment !== "Todos") && (
            <div className="mt-4 p-4 bg-slate-800/30 border border-slate-600/30 rounded-xl backdrop-blur-sm">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                {/* Results Counter */}
                <div className="flex items-center gap-2 text-slate-300 min-w-fit">
                  <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm whitespace-nowrap">
                    Exibindo{" "}
                    <span className="font-bold text-white">
                      {filteredUsers.length}
                    </span>{" "}
                    de{" "}
                    <span className="font-bold text-white">{users.length}</span>{" "}
                    usuários
                  </span>
                </div>

                {/* Active Filters */}
                <div className="flex flex-wrap gap-2 flex-1">
                  {searchTerm && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-xs min-w-fit">
                      <Search className="w-3 h-3 flex-shrink-0" />
                      <span className="max-w-[120px] truncate">
                        "{searchTerm}"
                      </span>
                      <button
                        onClick={() => setSearchTerm("")}
                        className="ml-1 hover:text-cyan-100 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {selectedRole !== "Todos" && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-xs min-w-fit">
                      <Shield className="w-3 h-3 flex-shrink-0" />
                      <span className="whitespace-nowrap">
                        {selectedRole === "user"
                          ? "Usuário"
                          : selectedRole === "manager"
                          ? "Gestor"
                          : "Administrador"}
                      </span>
                      <button
                        onClick={() => setSelectedRole("Todos")}
                        className="ml-1 hover:text-purple-100 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {selectedStatus !== "Todos" && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-xs min-w-fit">
                      <Activity className="w-3 h-3 flex-shrink-0" />
                      <span className="whitespace-nowrap">
                        {selectedStatus === "active"
                          ? "Ativo"
                          : selectedStatus === "inactive"
                          ? "Inativo"
                          : "Suspenso"}
                      </span>
                      <button
                        onClick={() => setSelectedStatus("Todos")}
                        className="ml-1 hover:text-orange-100 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {selectedDepartment !== "Todos" && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-xs min-w-fit">
                      <Building className="w-3 h-3 flex-shrink-0" />
                      <span className="max-w-[100px] truncate">
                        {selectedDepartment}
                      </span>
                      <button
                        onClick={() => setSelectedDepartment("Todos")}
                        className="ml-1 hover:text-cyan-100 flex-shrink-0"
                      >
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
        <div className="flex-1 force-scroll scrollable-content min-h-0 overflow-y-scroll">
          <div className="grid gap-4 lg:gap-6 min-h-[800px]"> {/* Força altura para scroll */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                <p className="text-slate-300">Carregando usuários...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => <UserCard key={user.id} user={user} />)
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Users className="w-12 h-12 text-slate-500" />
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-medium text-slate-300 mb-2">
                    Nenhum usuário encontrado
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Tente ajustar os filtros ou adicione um novo usuário.
                  </p>
                </div>
              </div>
            )}
          </div>
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
                    <h3 className="text-white font-bold text-lg">
                      {editingUser.name}
                    </h3>
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
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, name: e.target.value })
                      }
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
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          email: e.target.value,
                        })
                      }
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="email@rcs.pt"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      Função
                    </Label>
                    <Select
                      value={editingUser.role}
                      onValueChange={(value: any) =>
                        setEditingUser({ ...editingUser, role: value })
                      }
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            Usuário
                          </div>
                        </SelectItem>Bartolomeu Cassoma
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
                    <Select
                      value={editingUser.status}
                      onValueChange={(value: any) =>
                        setEditingUser({ ...editingUser, status: value })
                      }
                    >
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
                        <SelectItem value="suspended">Bartolomeu Cassoma
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
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          department: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          phone: e.target.value,
                        })
                      }
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="+351 912 345 678"
                    />
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">
                      Criado em: {editingUser.createdAt}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-sm">
                      Último login: {editingUser.lastLogin}
                    </span>
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
      </main>

      {/* Toast Notifications Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`transform transition-all duration-500 ease-in-out animate-in slide-in-from-right glass-card backdrop-blur-xl border-2 rounded-2xl p-5 shadow-2xl hover:scale-105 pointer-events-auto ${
              toast.type === "success"
                ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-50 shadow-emerald-500/20"
                : toast.type === "error"
                ? "bg-red-500/15 border-red-400/40 text-red-50 shadow-red-500/20"
                : "bg-cyan-500/15 border-cyan-400/40 text-cyan-50 shadow-cyan-500/20"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    toast.type === "success"
                      ? "bg-emerald-500/80 ring-2 ring-emerald-400/30"
                      : toast.type === "error"
                      ? "bg-red-500/80 ring-2 ring-red-400/30"
                      : "bg-cyan-500/80 ring-2 ring-cyan-400/30"
                  }`}
                >
                  {toast.type === "success" && (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                  {toast.type === "error" && (
                    <X className="w-5 h-5 text-white" />
                  )}
                  {toast.type === "info" && (
                    <Activity className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm leading-tight mb-1">
                    {toast.title}
                  </h4>
                  <p className="text-xs opacity-90 leading-relaxed">
                    {toast.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 p-1.5 rounded-full hover:bg-white/15 transition-all duration-200 flex-shrink-0 hover:scale-110"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Progress bar para mostrar tempo restante */}
            <div
              className={`mt-4 h-1.5 rounded-full overflow-hidden ${
                toast.type === "success"
                  ? "bg-emerald-500/20"
                  : toast.type === "error"
                  ? "bg-red-500/20"
                  : "bg-cyan-500/20"
              }`}
            >
              <div
                className={`h-full rounded-full ${
                  toast.type === "success"
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                    : toast.type === "error"
                    ? "bg-gradient-to-r from-red-400 to-red-500"
                    : "bg-gradient-to-r from-cyan-400 to-cyan-500"
                }`}
                style={{
                  animation: `shrink ${
                    toast.duration || 5000
                  }ms linear forwards`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* CSS para animação da progress bar */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-in {
          animation: slideInFromRight 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        .toast-exit {
          animation: slideOutToRight 0.4s ease-in-out forwards;
        }
        @keyframes slideOutToRight {
          from {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateX(120%) scale(0.9);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
