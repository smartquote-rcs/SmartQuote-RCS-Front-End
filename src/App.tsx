import { useState, useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { AppProvider } from "./contexts/AppContext";
import { userService } from './api/services';
import { emailService } from "./services/emailService";
import { saveLog } from "./services/logService";

interface User {
  id: number; // id numérico usado em FK/auditoria
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

  // Gera id determinístico simples baseado no email (fallback se backend não retornar id)
  const deriveUserId = (email: string): number => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = ((hash << 5) - hash) + email.charCodeAt(i);
      hash |= 0;
    }
    // garante positivo e limita tamanho
    return Math.abs(hash) % 1000000 + 1;
  };

  useEffect(() => {
    // Verificar se o usuário já está logado (localStorage)
    const savedAuth = localStorage.getItem("smartquote_auth");
    const savedToken = localStorage.getItem("auth_token");
    
    if (savedAuth || savedToken) {
      try {
        if (savedAuth) {
          // Dados salvos do sistema anterior
          const authData = JSON.parse(savedAuth);
          const storedUser = authData.user || {};
          const ensuredUser: User = {
            id: typeof storedUser.id === 'number' ? storedUser.id : deriveUserId(storedUser.email || 'anon@local'),
            email: storedUser.email || 'anon@local',
            name: storedUser.name || (storedUser.email ? storedUser.email.split('@')[0] : 'Usuário'),
            role: storedUser.role || 'user',
            position: storedUser.position || storedUser.role || 'user'
          };
          setIsAuthenticated(true);
          setUser(ensuredUser);
          // Persistir novamente com id caso não existisse
          localStorage.setItem('smartquote_auth', JSON.stringify({ user: ensuredUser, timestamp: authData.timestamp || Date.now() }));
          // Se id era sintético (derivado), tentar upsert para obter id real
          if (!storedUser.id && ensuredUser.email && ensuredUser.email !== 'anon@local') {
            userService.upsert(ensuredUser.email, ensuredUser.name, ensuredUser.role, ensuredUser.position)
              .then(res => {
                if (res.success && res.data?.data?.id) {
                  const realId = Number(res.data.data.id);
                  const withReal: User = { ...ensuredUser, id: realId };
                  setUser(withReal);
                  localStorage.setItem('smartquote_auth', JSON.stringify({ user: withReal, timestamp: Date.now() }));
                }
              })
              .catch(()=>{});
          }
        } else if (savedToken) {
          // Só tem token da API, criar dados de usuário básicos
          setIsAuthenticated(true);
          const basicUser: User = {
            id: deriveUserId('usuario@api.com'),
            email: 'usuario@api.com',
            name: 'Usuário API',
            role: 'user',
            position: 'user'
          };
          setUser(basicUser);
          localStorage.setItem('smartquote_auth', JSON.stringify({ user: basicUser, timestamp: Date.now() }));
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
    const provisional: User = {
      id: deriveUserId(credentials.email),
      email: credentials.email,
      name: credentials.email.split('@')[0] || 'Usuário',
      role,
      position: credentials.position || role
    };
    setUser(provisional);
    setIsAuthenticated(true);
    localStorage.setItem('smartquote_auth', JSON.stringify({ user: provisional, timestamp: Date.now() }));
    // Upsert assíncrono para obter id real
    userService.upsert(provisional.email, provisional.name, provisional.role, provisional.position)
      .then(res => {
        if (res.success && res.data?.data?.id) {
          const realId = Number(res.data.data.id);
          if (realId && realId !== provisional.id) {
            const realUser: User = { ...provisional, id: realId };
            setUser(realUser);
            localStorage.setItem('smartquote_auth', JSON.stringify({ user: realUser, timestamp: Date.now() }));
          }
        }
      })
      .catch(()=>{});
    console.log('👤 Dados do usuário (provisional):', provisional);
    // Salva log de entrada do usuário
    saveLog({
      type: 'login',
      userEmail: provisional.email,
      userName: provisional.name,
      details: { role: provisional.role, position: provisional.position }
    });
    console.log('✅ Login aceito no App.tsx (provisional), aguardando upsert para id real');
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
    if (isAuthenticated && !document.getElementById("x0wZThx4dEWO_GESv9oAA")) {
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
          script.id = "x0wZThx4dEWO_GESv9oAA";
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
      const script = document.getElementById("x0wZThx4dEWO_GESv9oAA");
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