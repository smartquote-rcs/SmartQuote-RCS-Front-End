import { useState, useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { UserDashboard } from "./components/UserDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { AppProvider, useApp } from "./contexts/AppContext";

interface User {
  email: string;
  name: string;
  role: "user" | "manager" | "admin";
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, login, logout } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já está logado (localStorage)
    const savedAuth = localStorage.getItem("smartquote_auth");
    const savedToken = localStorage.getItem("auth_token");
    const validRoles = ["user", "admin", "manager", "gestor"];
    if (savedAuth || savedToken) {
      try {
        if (savedAuth) {
          const authData = JSON.parse(savedAuth);
          let role: RoleType = "user";
          if (authData.user && validRoles.includes(authData.user.role)) {
            role = authData.user.role;
          }
          login({ ...authData.user, role });
          setIsAuthenticated(true);
        } else if (savedToken) {
          login({
            email: 'usuario@api.com',
            name: 'Usuário API',
            role: 'user'
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        localStorage.removeItem("smartquote_auth");
        localStorage.removeItem("auth_token");
      }
    }
    setIsLoading(false);
    // eslint-disable-next-line
  }, []);

  type RoleType = 'user' | 'admin' | 'gestor' | 'manager';
  const handleLogin = (credentials: { email: string; password: string; role?: RoleType }) => {
    const userData = {
      email: credentials.email,
      name: credentials.email.split('@')[0] || 'Usuário',
      role: credentials.role || (credentials.email.includes('admin') ? 'admin' as RoleType : 'user' as RoleType)
    };
    login(userData);
    setIsAuthenticated(true);
    localStorage.setItem("smartquote_auth", JSON.stringify({
      user: userData,
      timestamp: Date.now()
    }));
  };

  const handleLogout = () => {
    if (user?.email) {
      localStorage.removeItem('user_role_' + user.email);
    }
    setIsAuthenticated(false);
    logout();
    localStorage.removeItem("smartquote_auth");
    localStorage.removeItem("auth_token");
  };

  const renderDashboard = () => {
    if (!user) return null;
    const validRoles: RoleType[] = ["user", "admin", "manager", "gestor"];
    const safeUser = {
      ...user,
      role: validRoles.includes(user.role as RoleType) ? (user.role as RoleType) : "user"
    };
    switch (safeUser.role) {
      case "user":
        return <UserDashboard user={safeUser} onLogout={handleLogout} />;
      case "manager":
        return <AdminDashboard user={safeUser} onLogout={handleLogout} />;
      case "admin":
        return <AdminDashboard user={safeUser} onLogout={handleLogout} />;
      case "gestor":
        return <AdminDashboard user={safeUser} onLogout={handleLogout} />;
      default:
        return <UserDashboard user={safeUser} onLogout={handleLogout} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dark-cta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-secondary">Carregando SmartQuote RCS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen max-w-full bg-dark-bg overflow-hidden">
      {renderDashboard()}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}