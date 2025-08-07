import { useState, useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { UserDashboard } from "./components/UserDashboard";
import { AdminDashboard } from "./components/AdminDashboard";

interface User {
  email: string;
  name: string;
  role: "user" | "manager" | "admin";
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário já está logado (localStorage)
    const savedAuth = localStorage.getItem("smartquote_auth");
    const savedToken = localStorage.getItem("auth_token");
    
    if (savedAuth || savedToken) {
      try {
        if (savedAuth) {
          // Dados salvos do sistema anterior
          const authData = JSON.parse(savedAuth);
          setIsAuthenticated(true);
          setUser(authData.user);
        } else if (savedToken) {
          // Só tem token da API, criar dados de usuário básicos
          setIsAuthenticated(true);
          setUser({
            email: 'usuario@api.com',
            name: 'Usuário API',
            role: 'user'
          });
        }
      } catch (error) {
        localStorage.removeItem("smartquote_auth");
        localStorage.removeItem("auth_token");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (credentials: { email: string; password: string; role?: 'user' | 'admin' }) => {
    console.log('🎯 App.tsx - handleLogin chamado com:', credentials);
    
    // Como o LoginPage já validou com a API, vamos aceitar o login
    // e criar dados de usuário baseados no role selecionado ou email
    const userData = {
      email: credentials.email,
      name: credentials.email.split('@')[0] || 'Usuário', // Nome baseado no email
      role: credentials.role || (credentials.email.includes('admin') ? 'admin' as const : 'user' as const)
    };

    console.log('👤 Dados do usuário criados:', userData);

    setUser(userData);
    setIsAuthenticated(true);
    
    // Salvar no localStorage
    localStorage.setItem("smartquote_auth", JSON.stringify({
      user: userData,
      timestamp: Date.now()
    }));
    
    console.log('✅ Login aceito no App.tsx, estado atualizado');
  };

  const handleLogout = () => {
    // Limpar roles salvos para o usuário atual
    if (user?.email) {
      localStorage.removeItem('user_role_' + user.email);
    }
    
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("smartquote_auth");
    localStorage.removeItem("auth_token"); // Limpar também o token da API
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

  return (
    <div className="min-h-screen bg-dark-bg">
      {renderDashboard()}
    </div>
  );
}