import { useState, useEffect } from "react";
import { UserDashboard } from "../BG/components/UserDashboard";
import { ManagerDashboard } from "../BG/components/ManagerDashboard";
import { AdminDashboard } from "../BG/components/AdminDashboard";
import { LoginPage } from "../BG/components/LoginPage";

interface User {
  email: string;
  name: string;
  role: "user" | "manager" | "admin";
}

const userCredentials = [
  {
    email: "usuario@rcs.pt",
    password: "demo123",
    userData: {
      email: "usuario@rcs.pt",
      name: "João Silva",
      role: "user" as const
    }
  },
  {
    email: "gestor@rcs.pt", 
    password: "demo123",
    userData: {
      email: "gestor@rcs.pt",
      name: "Maria Santos",
      role: "manager" as const
    }
  },
  {
    email: "admin@rcs.pt",
    password: "demo123", 
    userData: {
      email: "admin@rcs.pt",
      name: "Carlos Mendes",
      role: "admin" as const
    }
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário já está logado (localStorage)
    const savedAuth = localStorage.getItem("smartquote_auth");
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setIsAuthenticated(true);
        setUser(authData.user);
      } catch (error) {
        localStorage.removeItem("smartquote_auth");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (credentials: { email: string; password: string }) => {
    const validUser = userCredentials.find(
      cred => cred.email === credentials.email && cred.password === credentials.password
    );

    if (validUser) {
      setUser(validUser.userData);
      setIsAuthenticated(true);
      
      // Salvar no localStorage
      localStorage.setItem("smartquote_auth", JSON.stringify({
        user: validUser.userData,
        timestamp: Date.now()
      }));
    } else {
      alert("Credenciais inválidas. Verifique as credenciais de demonstração.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("smartquote_auth");
  };

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case "user":
        return <UserDashboard user={user} onLogout={handleLogout} />;
      case "admin":
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      default:
        return <UserDashboard user={user} onLogout={handleLogout} />;
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

  return renderDashboard();
}
