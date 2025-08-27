import { useState, useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { UserDashboard } from "./components/UserDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { AppProvider } from "./contexts/AppContext";
import { emailService } from "./services/emailService";
import { saveLog } from "./services/logService";

interface User {
  email: string;
  name: string;
  role: "user" | "manager" | "admin";
  position?: string;
}

declare global {
  interface Window {
    chatbase?: any;
  }
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

    // Inicializar serviço de email
    emailService.loadSavedConfig();

    setIsLoading(false);
  }, []);

  const handleLogin = (credentials: { email: string; password: string; role?: 'user' | 'admin' | 'manager'; position?: string }) => {
    console.log('🎯 App.tsx - handleLogin chamado com:', credentials);
    // Usa o valor de position vindo do backend, se existir
    const role: 'user' | 'admin' | 'manager' =
      credentials.role === 'admin' || credentials.role === 'manager'
        ? credentials.role
        : 'user';
    const userData: User = {
      email: credentials.email,
      name: credentials.email.split('@')[0] || 'Usuário',
      role,
      position: credentials.position || role
    };
    console.log('👤 Dados do usuário criados:', userData);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("smartquote_auth", JSON.stringify({
      user: userData,
      timestamp: Date.now()
    }));
    // Salva log de entrada do usuário
    saveLog({
      type: 'login',
      userEmail: userData.email,
      userName: userData.name,
      details: { role: userData.role, position: userData.position }
    });
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
    // Libera todas as abas para qualquer usuário
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  };

  useEffect(() => {
    // Adiciona o script do Chatbase quando autenticado
    if (isAuthenticated && !document.getElementById("1ifm9yY-KVOI8QcKpIm4x")) {
      (function(){
        if(!window.chatbase || window.chatbase("getState") !== "initialized"){
          window.chatbase = (...args: any[]) => {
            if(!window.chatbase.q) { window.chatbase.q = []; }
            window.chatbase.q.push(args);
          };
          window.chatbase = new Proxy(window.chatbase, {
            get(target: any, prop: any) {
              if(prop === "q") { return target.q; }
              return (...args: any[]) => target(prop, ...args);
            }
          });
        }
        const onLoad = function() {
          const script = document.createElement("script");
          script.src = "https://www.chatbase.co/embed.min.js";
          script.id = "1ifm9yY-KVOI8QcKpIm4x";
          script.setAttribute("domain", "www.chatbase.co");
          document.body.appendChild(script);
        };
        if(document.readyState === "complete") { 
          onLoad(); 
        } else { 
          window.addEventListener("load", onLoad); 
        }
      })();
    }
    
    // Remove o script ao deslogar
    if (!isAuthenticated) {
      const script = document.getElementById("1ifm9yY-KVOI8QcKpIm4x");
      if (script) script.remove();
      const iframe = document.querySelector('iframe[src*="chatbase.co"]');
      if (iframe) iframe.remove();
    }
  }, [isAuthenticated]);

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
    <AppProvider>
      <div className="min-h-screen max-w-full bg-dark-bg overflow-hidden">
        {renderDashboard()}
      </div>
    </AppProvider>
  );
}