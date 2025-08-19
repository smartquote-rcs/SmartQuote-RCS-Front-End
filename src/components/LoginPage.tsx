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
import { Eye, EyeOff, Lock, Mail, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { authService } from "../api/services.ts";

interface LoginPageProps {
  onLogin: (credentials: {
    email: string;
    password: string;
    role?: 'user' | 'admin' | 'manager';
    position?: string;
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
          vx: (Math.random() - 0.5) * 1.4, // Faster movement
          vy: (Math.random() - 0.5) * 1.4,
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
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 1); // Larger points
        ctx.fillStyle = "rgba(59, 130, 246, 0.1)"; // More opaque
        ctx.fill();

        // Add glow effect
        ctx.shadowColor = "rgba(59, 130, 246, 0.5)";
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
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.2})`;
          ctx.lineWidth = 4; // Much thicker lines
          ctx.shadowColor = "rgba(59, 130, 246, 0)";
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
          ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
          ctx.lineWidth = 4;
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
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.2})`;
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

const AnimatedTitle = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const initAnimation = () => {
      if (!titleRef.current) return;

      // Dividir o texto em caracteres individuais
      const text = "SmartQuote RCS";
      const titleElement = titleRef.current;
      
      // Limpar o conteúdo existente
      titleElement.innerHTML = "";
      
      // Criar spans para cada caractere
      const chars = text.split("").map((char, index) => {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00A0" : char; // Usar espaço não-quebrável
        span.style.display = "inline-block";
        span.style.opacity = "0";
        span.style.transform = "translateY(-44px) rotate(-360deg)";
        span.style.transition = `all 1.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
        span.style.transitionDelay = `${index * 50}ms`;
        // Aplicar o mesmo gradiente de cores
        span.style.background = "linear-gradient(to right, rgb(255, 255, 255), rgb(207, 250, 254), rgb(186, 230, 253))";
        span.style.backgroundClip = "text";
        span.style.webkitBackgroundClip = "text";
        span.style.color = "transparent";
        span.className = "char";
        titleElement.appendChild(span);
        return span;
      });

      // Animar os caracteres
      const animateChars = () => {
        chars.forEach((char, index) => {
          setTimeout(() => {
            // Primeira fase: subir e girar
            char.style.transform = "translateY(-44px) rotate(0deg)";
            char.style.opacity = "1";
            
            // Segunda fase: descer com bounce
            setTimeout(() => {
              char.style.transform = "translateY(0px) rotate(360deg)";
              char.style.transition = `all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
            }, 600);
          }, index * 50);
        });
      };
      setTimeout(animateChars, 100);
    };

    initAnimation();

    // Cleanup function
    return () => {
      if (titleRef.current) {
        titleRef.current.innerHTML = "SmartQuote RCS"; // Restaurar o texto original
      }
    };
  }, []);

  return (
    <motion.h1
      ref={titleRef}
      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent mb-1 sm:mb-2 text-center leading-tight"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      whileHover={{
        scale: 1.02,
        textShadow: "0 0 20px rgba(255, 255, 255, 0.4)",
      }}
      style={{
        letterSpacing: '0.06em'
      }}
    >
      SmartQuote RCS
    </motion.h1>
  );
};

export function LoginPage({ onLogin }: LoginPageProps) {
  // Atualizar senha quando a senha mudar
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
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
        // Buscar o papel real do usuário na API
        try {
          const { getUserRoleByEmail } = await import('../api/services');
          const roleRes = await getUserRoleByEmail(email);
          console.log('🔎 Resposta do getUserRoleByEmail:', roleRes);
          // role pode ser 'admin', 'manager' ou 'user' (direto do backend)
          const userRole = roleRes.role?.toLowerCase() || 'user';
          let roleLabel = 'Usuário';
          if (userRole === 'admin') roleLabel = 'Administrador';
          else if (userRole === 'manager') roleLabel = 'Gestor';
          setFeedback({ 
            type: 'success', 
            message: `Login realizado com sucesso! Entrando como ${roleLabel}...` 
          });
          setIsLoginSuccess(true);
          setTimeout(() => {
            console.log('🚀 Chamando onLogin com role e position:', userRole);
            // Garante que role e position sejam passados do backend
            let roleTyped: 'user' | 'admin' | 'manager' = 'user';
            if (userRole === 'admin') roleTyped = 'admin';
            else if (userRole === 'manager') roleTyped = 'manager';
            onLogin({ email, password, role: roleTyped, position: userRole });
          }, 2000);
        } catch (roleErr) {
          setFeedback({ type: 'error', message: 'Erro ao buscar permissões do usuário.' });
        }
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
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    // Validação do email
    if (!email) {
      setFeedback({ 
        type: 'error', 
        message: 'Por favor, insira seu email para recuperar a senha.' 
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

    setIsLoading(true);
    setFeedback({ type: null, message: '' });
    
    try {
      // Simular envio de email de recuperação
      // Aqui você poderia integrar com uma API real de recuperação de senha
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFeedback({ 
        type: 'success', 
        message: 'Email de recuperação enviado! Verifique sua caixa de entrada e siga as instruções.' 
      });
      
      // Limpar o formulário e voltar para o login após 3 segundos
      setTimeout(() => {
        setEmail('');
        setShowForgotPassword(false);
        setFeedback({ type: null, message: '' });
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error);
      
      setFeedback({ 
        type: 'error', 
        message: 'Erro ao enviar email de recuperação. Tente novamente mais tarde.' 
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 relative overflow-hidden">
      {/* Success Message - Centered */}
      {isLoginSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed inset-0 flex items-center justify-center z-[100] p-3 sm:p-4"
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
            className="bg-white/20 backdrop-blur-lg border border-green-400/40 rounded-lg sm:rounded-2xl p-3 sm:p-6 text-center shadow-2xl w-full max-w-xs sm:max-w-sm"
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
        className="relative min-h-screen flex flex-col items-center justify-center lg:justify-start px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6 md:py-8 lg:pt-16 xl:pt-20"
        style={{ zIndex: 4 }}
      >
        {/* Centered Title - 100% Responsive */}
        <motion.div
          className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-6 xl:mb-8"
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
            className="flex items-center justify-center space-x-2 sm:space-x-3 md:space-x-4 mb-2 sm:mb-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 2xl:w-32 2xl:h-32 bg-gradient-to-br from-cyan-400 via-blue-300 to-indigo-400 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden p-1"
              whileHover={{
                rotate: [0, 5, -5, 0],
                scale: 1.1,
                boxShadow: "0 0 40px rgba(59, 130, 246, 0.8)",
              }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 40px rgba(59, 130, 246, 0.3)",
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                ],
                rotate: [0, 1, -1, 0],
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
                className="w-full h-full object-contain relative z-10 rounded-lg p-2"
                animate={{
                  scale: [1, 1.02, 1],
                  filter: [
                    "drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))",
                    "drop-shadow(0 0 16px rgba(255, 255, 255, 0.6))",
                    "drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))",
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

          <AnimatedTitle />

          <motion.div
            className="mt-1 sm:mt-2 text-blue-200 text-xs sm:text-sm md:text-base px-2 sm:px-4 md:px-6 text-center font-medium leading-relaxed"
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
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mt-2 sm:mt-3 md:mt-4 px-3 sm:px-4 md:px-6"
        >
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
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl rounded-lg sm:rounded-xl lg:rounded-2xl"
            >
              <CardHeader className="space-y-1 pb-2 sm:pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-5"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                >
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-center text-white font-semibold"
                  >
                    {showForgotPassword ? 'Recuperar Senha' : 'Acesso ao Sistema'}
                  </CardTitle>
                  <CardDescription className="text-center text-blue-100 text-sm sm:text-base leading-relaxed mt-1"
                  >
                    {showForgotPassword 
                      ? 'Digite seu email para receber as instruções de recuperação'
                      : 'Entre com suas credenciais para acessar a plataforma'
                    }
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 pt-1 sm:pt-2 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-5"
              >
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-2 sm:space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                >
                  {/* Campo de nome removido - não necessário para recuperação de senha */}
                  <div className="space-y-1 sm:space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-white text-xs sm:text-sm md:text-base font-medium"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-400 z-10" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-8 sm:pl-10 md:pl-12 pr-3 sm:pr-4 h-8 sm:h-10 md:h-11 bg-slate-800/50 border border-slate-600/50 rounded-md sm:rounded-lg text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:bg-white/5 transition-all duration-200 text-xs sm:text-sm md:text-base"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  {!showForgotPassword && (
                    <div className="space-y-1 sm:space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-white text-xs sm:text-sm md:text-base font-medium"
                      >
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-400 z-10" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={handlePasswordChange}
                          className="pl-8 sm:pl-10 md:pl-12 pr-10 sm:pr-12 h-8 sm:h-10 md:h-11 bg-slate-800/50 border border-slate-600/50 rounded-md sm:rounded-lg text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:bg-white/5 transition-all duration-200 text-xs sm:text-sm md:text-base"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-slate-700/50 hover:bg-slate-600/70 text-blue-400 hover:text-white transition-colors duration-200 z-10 border border-slate-600/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          {showPassword ? (
                            <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Indicador de força da senha removido - não necessário para recuperação */}

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm md:text-base rounded-md sm:rounded-lg h-8 sm:h-10 md:h-11"
                      disabled={isLoading}
                      onClick={showForgotPassword ? (e) => { e.preventDefault(); handleForgotPassword(); } : undefined}
                    >
                      {isLoading ? (
                        <motion.div
                          className="flex items-center space-x-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          <span>{showForgotPassword ? 'Enviando...' : 'Entrando...'}</span>
                        </motion.div>
                      ) : (
                        showForgotPassword ? "Enviar Email de Recuperação" : "Entrar no Sistema"
                      )}
                    </Button>
                  </motion.div>

                  {/* Feedback Message */}
                  {feedback.type && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.8 }}
                      className={`flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-md sm:rounded-lg backdrop-blur-sm border text-xs sm:text-sm ${
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
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                        )}
                      </motion.div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">{feedback.message}</span>
                    </motion.div>
                  )}

                  {/* Botão para alternar entre login e recuperação de senha */}
                  <motion.div
                    className="text-center pt-1"
                    whileHover={{ scale: 1.02 }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(!showForgotPassword);
                        setFeedback({ type: null, message: '' });
                        setPassword('');
                      }}
                      className="text-slate-400 text-xs sm:text-sm leading-relaxed hover:text-blue-300 transition-colors duration-200"
                    >
                      {showForgotPassword ? (
                        <>
                          <span className="text-blue-300 font-medium">Lembrou da senha?</span> Voltar ao login
                        </>
                      ) : (
                        <>
                          <span className="text-blue-300 font-medium">Esqueceu a senha?</span> Clique aqui para recuperar
                        </>
                      )}
                    </button>
                  </motion.div>
                </motion.form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Footer limpo e elegante - Responsivo */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-10 sm:h-12 bg-gradient-to-t from-slate-900/90 to-transparent backdrop-blur-sm border-t border-slate-700/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <div className="h-full flex items-center justify-center px-3 sm:px-4 md:px-6">
            <motion.div
              className="flex items-center gap-2 sm:gap-3 md:gap-4 text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.6 }}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                <span className="text-xs sm:text-sm font-medium">SmartQuote</span>
              </div>
              
              <div className="w-px h-3 sm:h-4 bg-slate-600"></div>
              
              <motion.div
                className="flex items-center gap-1"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400"></div>
                <span className="text-xs hidden sm:inline">Sistema Online</span>
                <span className="text-xs sm:hidden">Online</span>
              </motion.div>
              
              <div className="w-px h-3 sm:h-4 bg-slate-600 hidden md:block"></div>
              
              <span className="text-xs hidden md:inline">© 2025 - Plataforma de Cotações Inteligentes</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}