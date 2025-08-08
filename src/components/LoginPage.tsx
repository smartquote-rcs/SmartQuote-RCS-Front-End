import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Eye, EyeOff, Lock, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { authService } from "../api/services.ts";

interface LoginPageProps {
  onLogin: (credentials: {
    email: string;
    password: string;
    role?: 'user' | 'admin';
  }) => void;
}

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}



const SpiderWebBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Initialize more points for denser network
      pointsRef.current = [];
      const numPoints = Math.floor(
        (canvas.width * canvas.height) / 8000,
      ); // More dense

      for (let i = 0; i < numPoints; i++) {
        pointsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.2, // Faster movement
          vy: (Math.random() - 0.5) * 1.2,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update points with more dynamic movement
      pointsRef.current.forEach((point) => {
        point.x += point.vx;
        point.y += point.vy;

        if (point.x < 0 || point.x > canvas.width)
          point.vx *= -1;
        if (point.y < 0 || point.y > canvas.height)
          point.vy *= -1;
      });

      // Draw points - larger and more visible
      pointsRef.current.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2); // Larger points
        ctx.fillStyle = "rgba(59, 130, 246, 0.2)"; // More opaque
        ctx.fill();

        // Add glow effect
        ctx.shadowColor = "rgba(59, 130, 246, 0.8)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw connections - more visible
      const maxDistance = 120; // Increased connection distance
      const mouseDistance = 300; // Increased mouse interaction distance

      pointsRef.current.forEach((point, i) => {
        // Connect to mouse - much more dramatic
        const distToMouse = Math.sqrt(
          Math.pow(point.x - mouseRef.current.x, 2) +
            Math.pow(point.y - mouseRef.current.y, 2),
        );

        if (distToMouse < mouseDistance) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          const opacity = 1 - distToMouse / mouseDistance;
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.6})`;
          ctx.lineWidth = 4; // Much thicker lines
          ctx.shadowColor = "rgba(59, 130, 246, 0.2)";
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Draw pulsing circle at mouse
          ctx.beginPath();
          ctx.arc(
            mouseRef.current.x,
            mouseRef.current.y,
            0,
            0,
            Math.PI * 2,
          );
          ctx.strokeStyle = `rgba(F, F, F, F)`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Connect to nearby points - more visible
        pointsRef.current.slice(i + 1).forEach((otherPoint) => {
          const distance = Math.sqrt(
            Math.pow(point.x - otherPoint.x, 2) +
              Math.pow(point.y - otherPoint.y, 2),
          );

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(otherPoint.x, otherPoint.y);
            const opacity = 1 - distance / maxDistance;
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.8})`;
            ctx.lineWidth = 1; // Thicker base lines
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    score: 0
  });

  // Função para calcular força da senha
  const calculatePasswordStrength = (pwd: string) => {
    const hasMinLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    
    const score = [hasMinLength, hasUpperCase, hasLowerCase, hasNumbers].filter(Boolean).length;
    
    setPasswordStrength({
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      score
    });
  };

  // Atualizar força da senha quando a senha mudar
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (showRegister) {
      calculatePasswordStrength(newPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback({ type: null, message: '' });

    console.log('🔍 Tentando fazer login com:', { email });

    // Validações locais primeiro
    if (!email || !password) {
      setFeedback({ 
        type: 'error', 
        message: 'Por favor, preencha todos os campos obrigatórios.' 
      });
      setIsLoading(false);
      return;
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFeedback({ 
        type: 'error', 
        message: 'Por favor, insira um endereço de email válido.' 
      });
      setIsLoading(false);
      return;
    }

    // Validação de senha
    if (password.length < 6) {
      setFeedback({ 
        type: 'error', 
        message: 'A senha deve ter pelo menos 6 caracteres.' 
      });
      setIsLoading(false);
      return;
    }

    try {
      // Usar a API real para fazer login
      const result = await authService.signin({ email, password });
      
      console.log('📡 Resposta da API:', result);
      
      if (result.success) {
        console.log('✅ Login bem-sucedido!', result.data);
        
        // Determinar o role automaticamente baseado no email ou role salvo anteriormente
        const savedRole = localStorage.getItem('user_role_' + email);
        const userRole: 'admin' | 'user' = (savedRole as 'admin' | 'user') || (email.toLowerCase().includes('admin') || email.toLowerCase().includes('manager') ? 'admin' : 'user');
        
        setFeedback({ 
          type: 'success', 
          message: `Login realizado com sucesso! Entrando como ${userRole === 'admin' ? 'Administrador' : 'Usuário'}...` 
        });
        setIsLoginSuccess(true);
        
        // Delay para mostrar a mensagem de sucesso antes de redirecionar
        setTimeout(() => {
          console.log('🚀 Chamando onLogin...');
          onLogin({ email, password, role: userRole });
        }, 2000);
      } else {
        console.error('❌ Erro no login:', result.error);
        
        // Mensagens de erro específicas baseadas na resposta da API
        let errorMessage = 'Erro ao fazer login';
        
        if (result.error?.toLowerCase().includes('password') || result.error?.toLowerCase().includes('senha')) {
          errorMessage = 'Senha incorreta. Verifique sua senha e tente novamente.';
        } else if (result.error?.toLowerCase().includes('email') || result.error?.toLowerCase().includes('user') || result.error?.toLowerCase().includes('usuário')) {
          errorMessage = 'Email não encontrado. Verifique seu email ou crie uma nova conta.';
        } else if (result.error?.toLowerCase().includes('blocked') || result.error?.toLowerCase().includes('bloqueado')) {
          errorMessage = 'Sua conta foi bloqueada. Entre em contato com o administrador.';
        } else if (result.error?.toLowerCase().includes('inactive') || result.error?.toLowerCase().includes('inativo')) {
          errorMessage = 'Sua conta está inativa. Entre em contato com o administrador.';
        } else if (result.error?.toLowerCase().includes('expired') || result.error?.toLowerCase().includes('expirado')) {
          errorMessage = 'Sua sessão expirou. Faça login novamente.';
        } else {
          errorMessage = result.error || 'Credenciais inválidas. Verifique seu email e senha.';
        }
        
        setFeedback({ 
          type: 'error', 
          message: errorMessage 
        });
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      
      // Tratamento de erros de rede e outros erros inesperados
      let errorMessage = 'Erro de conexão';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Erro de rede. Verifique sua conexão com a internet e tente novamente.';
      } else if (error instanceof Error && error.message.includes('timeout')) {
        errorMessage = 'Tempo limite excedido. O servidor pode estar sobrecarregado. Tente novamente.';
      } else {
        errorMessage = 'Erro inesperado. Tente novamente em alguns minutos.';
      }
      
      setFeedback({ 
        type: 'error', 
        message: errorMessage 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    // Validações locais primeiro
    if (!username || !email || !password) {
      setFeedback({ 
        type: 'error', 
        message: 'Por favor, preencha todos os campos obrigatórios.' 
      });
      return;
    }

    // Validação de nome
    if (username.length < 2) {
      setFeedback({ 
        type: 'error', 
        message: 'O nome deve ter pelo menos 2 caracteres.' 
      });
      return;
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFeedback({ 
        type: 'error', 
        message: 'Por favor, insira um endereço de email válido.' 
      });
      return;
    }

    // Validação de senha forte
    if (password.length < 8) {
      setFeedback({ 
        type: 'error', 
        message: 'A senha deve ter pelo menos 8 caracteres.' 
      });
      return;
    }

    // Validação de complexidade da senha
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setFeedback({ 
        type: 'error', 
        message: 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número.' 
      });
      return;
    }

    setIsLoading(true);
    setFeedback({ type: null, message: '' });
    
    try {
      const result = await authService.signup({ 
        name: username, 
        email, 
        password 
      });
      
      if (result.success) {
        setFeedback({ 
          type: 'success', 
          message: 'Conta criada com sucesso! Fazendo login automático...' 
        });
        
        // Fazer login automático após criar a conta
        setTimeout(async () => {
          console.log('🔄 Fazendo login automático após registro...');
          
          try {
            const loginResult = await authService.signin({ email, password });
            
            if (loginResult.success) {
              console.log('✅ Login automático bem-sucedido!');
              
              // Determinar role como admin automaticamente para contas criadas
              const userRole = 'admin';
              
              // Salvar informação de que esta conta é admin
              localStorage.setItem('user_role_' + email, 'admin');
              
              setFeedback({ 
                type: 'success', 
                message: 'Conta criada e login realizado! Entrando como Administrador...' 
              });
              setIsLoginSuccess(true);
              
              // Redirecionar para o dashboard admin
              setTimeout(() => {
                console.log('🚀 Redirecionando para dashboard admin...');
                onLogin({ email, password, role: userRole });
              }, 1500);
            } else {
              setFeedback({ 
                type: 'success', 
                message: 'Conta criada com sucesso! Faça login para continuar.' 
              });
              setUsername('');
              setEmail('');
              setPassword('');
              setTimeout(() => {
                setShowRegister(false);
                setFeedback({ type: null, message: '' });
              }, 2000);
            }
          } catch (error) {
            console.error('❌ Erro no login automático:', error);
            setFeedback({ 
              type: 'success', 
              message: 'Conta criada com sucesso! Faça login para continuar.' 
            });
            setUsername('');
            setEmail('');
            setPassword('');
            setTimeout(() => {
              setShowRegister(false);
              setFeedback({ type: null, message: '' });
            }, 2000);
          }
        }, 1000);
      } else {
        console.error('❌ Erro no registro:', result.error);
        
        // Mensagens de erro específicas para registro
        let errorMessage = 'Erro ao criar conta';
        
        if (result.error?.toLowerCase().includes('email') && result.error?.toLowerCase().includes('exists')) {
          errorMessage = 'Este email já está registrado. Tente fazer login ou use outro email.';
        } else if (result.error?.toLowerCase().includes('password')) {
          errorMessage = 'Senha não atende aos critérios de segurança. Use uma senha mais forte.';
        } else if (result.error?.toLowerCase().includes('invalid')) {
          errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
        } else {
          errorMessage = result.error || 'Erro ao criar conta. Tente novamente.';
        }
        
        setFeedback({ 
          type: 'error', 
          message: errorMessage 
        });
      }
    } catch (error) {
      console.error('❌ Erro inesperado no registro:', error);
      
      let errorMessage = 'Erro de conexão ao criar conta';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Erro de rede. Verifique sua conexão e tente novamente.';
      } else if (error instanceof Error && error.message.includes('timeout')) {
        errorMessage = 'Tempo limite excedido. Tente novamente.';
      } else {
        errorMessage = 'Erro inesperado ao criar conta. Tente novamente.';
      }
      
      setFeedback({ 
        type: 'error', 
        message: errorMessage 
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen max-w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 relative overflow-hidden">
      {/* Success Message - Centered */}
      {isLoginSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 100 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              delay: 0.2 
            }}
            className="bg-white/20 backdrop-blur-lg border border-green-400/40 rounded-2xl p-6 text-center shadow-2xl min-w-[300px]"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360] 
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1 
              }}
            >
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg font-bold text-white mb-2"
            >
              Login Realizado!
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-green-100 text-sm"
            >
              Bem-vindo ao SmartQuote RCS
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1, duration: 1 }}
              className="h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mt-3"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Spider Web Background */}
      <SpiderWebBackground />

      {/* Animated background particles - more dramatic */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ zIndex: 2 }}
      >
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0.5, 2.5, 0.5],
              opacity: [0.3, 1, 0.3],
              rotate: [0, 360],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 9,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"
        style={{ zIndex: 3 }}
      />

      {/* Content */}
      <div
        className="relative min-h-screen flex flex-col items-center justify-center p-4"
        style={{ zIndex: 4 }}
      >
        {/* Centered Title - 100% Responsive */}
        <motion.div
          className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: -100, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            type: "spring",
            bounce: 0.6,
          }}
        >
          <motion.div
            className="flex items-center justify-center space-x-2 sm:space-x-3 md:space-x-4 mb-4 sm:mb-6"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 bg-gradient-to-br from-cyan-400 via-blue-300 to-indigo-400 rounded-2xl sm:rounded-3xl lg:rounded-4xl flex items-center justify-center shadow-2xl relative overflow-hidden p-2 sm:p-2 md:p-3"
              whileHover={{
                rotate: [0, 10, -10, 0],
                scale: 1.15,
                boxShadow: "0 0 60px rgba(59, 130, 246, 1)",
              }}
              animate={{
                boxShadow: [
                  "0 0 30px rgba(59, 130, 246, 0.3)",
                  "0 0 60px rgba(59, 130, 246, 0.3)",
                  "0 0 30px rgba(59, 130, 246, 0.3)",
                ],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                boxShadow: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: {
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              />
              <motion.img
                src="/RCS.png"
                alt="RCS Angola Logo"
                className="w-full h-full object-contain relative z-10 rounded-xl p-2"
                animate={{
                  scale: [1, 1.05, 1],
                  filter: [
                    "drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))",
                    "drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))",
                    "drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))",
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent mb-3 sm:mb-4 lg:mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            whileHover={{
              scale: 1.05,
              textShadow: "0 0 20px rgba(255, 255, 255, 0.5)",
            }}
          >
            SmartQuote RCS
          </motion.h1>

          <motion.div
            className="mt-4 sm:mt-6 text-blue-200 text-sm sm:text-base md:text-lg lg:text-xl px-4"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              delay: 1,
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Processamento inteligente com IA avançada
          </motion.div>
        </motion.div>

        {/* Login Form Container - Responsive */}
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 1.2,
              duration: 0.8,
              type: "spring",
              bounce: 0.4,
            }}
            whileHover={{
              y: -8,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
              <CardHeader className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                >
                  <CardTitle className="text-xl sm:text-2xl text-center text-white">
                    {showRegister ? 'Criar Conta' : 'Acesso ao Sistema'}
                  </CardTitle>
                  <CardDescription className="text-center text-blue-100 text-sm sm:text-base">
                    {showRegister 
                      ? 'Crie sua conta para acessar a plataforma'
                      : 'Entre com suas credenciais para acessar a plataforma'
                    }
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                >
                  {showRegister && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="username"
                        className="text-white text-sm sm:text-base"
                      >
                        Nome
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                        <Input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) =>
                            setUsername(e.target.value)
                          }
                          className="pl-12 h-12"
                          placeholder="Seu nome completo"
                          required
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-white text-sm sm:text-base"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        className="pl-12 h-12"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-white text-sm sm:text-base"
                    >
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                      <Input
                        id="password"
                        type={
                          showPassword ? "text" : "password"
                        }
                        value={password}
                        onChange={handlePasswordChange}
                        className="pl-12 pr-14 h-12"
                        placeholder="••••••••"
                        required
                      />
                      <motion.button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Indicador de Força da Senha - apenas para registro */}
                  {showRegister && password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-blue-200">Força da senha:</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`w-4 h-1 rounded-full transition-colors duration-300 ${
                                level <= passwordStrength.score
                                  ? level === 1
                                    ? 'bg-red-500'
                                    : level === 2
                                    ? 'bg-yellow-500'
                                    : level === 3
                                    ? 'bg-blue-500'
                                    : 'bg-green-500'
                                  : 'bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-blue-300">
                          {passwordStrength.score === 1 && 'Fraca'}
                          {passwordStrength.score === 2 && 'Regular'}
                          {passwordStrength.score === 3 && 'Boa'}
                          {passwordStrength.score === 4 && 'Forte'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {[
                          { key: 'hasMinLength', text: 'Pelo menos 8 caracteres' },
                          { key: 'hasUpperCase', text: 'Uma letra maiúscula' },
                          { key: 'hasLowerCase', text: 'Uma letra minúscula' },
                          { key: 'hasNumbers', text: 'Um número' }
                        ].map((requirement) => (
                          <div key={requirement.key} className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                              passwordStrength[requirement.key as keyof typeof passwordStrength] 
                                ? 'bg-green-400' 
                                : 'bg-gray-500'
                            }`} />
                            <span className={`text-xs transition-colors duration-300 ${
                              passwordStrength[requirement.key as keyof typeof passwordStrength] 
                                ? 'text-green-300' 
                                : 'text-gray-400'
                            }`}>
                              {requirement.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                      disabled={isLoading}
                      onClick={showRegister ? (e) => { e.preventDefault(); handleRegister(); } : undefined}
                    >
                      {isLoading ? (
                        <motion.div
                          className="flex items-center space-x-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          <span>{showRegister ? 'Criando...' : 'Entrando...'}</span>
                        </motion.div>
                      ) : (
                        showRegister ? "Criar Conta" : "Entrar no Sistema"
                      )}
                    </Button>
                  </motion.div>

                  {/* Feedback Message */}
                  {feedback.type && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.8 }}
                      className={`flex items-center space-x-3 p-4 rounded-lg backdrop-blur-sm border ${
                        feedback.type === 'success' 
                          ? 'bg-green-500/20 border-green-400/30 text-green-100' 
                          : 'bg-red-500/20 border-red-400/30 text-red-100'
                      }`}
                    >
                      <motion.div
                        animate={feedback.type === 'success' ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 360] 
                        } : { 
                          scale: [1, 1.1, 1],
                          rotate: [0, -10, 10, 0] 
                        }}
                        transition={{ 
                          duration: feedback.type === 'success' ? 1 : 0.5,
                          repeat: feedback.type === 'success' ? Infinity : 0,
                          repeatDelay: 2 
                        }}
                      >
                        {feedback.type === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                      </motion.div>
                      <span className="text-sm font-medium">{feedback.message}</span>
                    </motion.div>
                  )}

                  {/* Botão para alternar entre login e registro */}
                  <motion.div
                    className="text-center"
                    whileHover={{ scale: 1.02 }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowRegister(!showRegister);
                        setFeedback({ type: null, message: '' });
                        setPassword(''); // Limpar senha ao trocar de modo
                      }}
                      className="text-blue-300 hover:text-white transition-colors text-sm"
                      disabled={isLoading}
                    >
                      {showRegister 
                        ? '← Voltar ao Login' 
                        : 'Criar nova conta →'
                      }
                    </button>
                  </motion.div>
                </motion.form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}