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
import { Badge } from "./ui/badge";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";

interface LoginPageProps {
  onLogin: (credentials: {
    email: string;
    password: string;
  }) => void;
}

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const demoCredentials = [
  
];

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
          ctx.strokeStyle = `rgba(59, 130, 246, 0.1)`;
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
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.6})`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular delay de autenticação
    setTimeout(() => {
      onLogin({ email, password });
      setIsLoading(false);
    }, 1500);
  };

  const handleDemoLogin = (credentials: {
    email: string;
    password: string;
  }) => {
    setEmail(credentials.email);
    setPassword(credentials.password);
    setTimeout(() => {
      onLogin(credentials);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-900 via-black-900 to-blck-900 relative overflow-hidden">
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
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-darkpurple-900/70 to-transparent"
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

          <motion.p
            className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-blue-100 font-medium px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
          >
            Plataforma SaaS de Automação de Procurement
          </motion.p>

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
                    Acesso ao Sistema
                  </CardTitle>
                  <CardDescription className="text-center text-blue-100 text-sm sm:text-base">
                    Entre com suas credenciais para acessar a
                    plataforma
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
                        className="pl-10 sm:pl-12 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-cyan-400 transition-all duration-300 backdrop-blur-sm text-sm sm:text-base h-10 sm:h-12"
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
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        className="pl-10 sm:pl-12 pr-12 sm:pr-14 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-cyan-400 transition-all duration-300 backdrop-blur-sm text-sm sm:text-base h-10 sm:h-12"
                        placeholder="••••••••"
                        required
                      />
                      <motion.button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkblue-300 hover:text-white transition-colors"
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

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                      disabled={isLoading}
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
                          <span>Entrando...</span>
                        </motion.div>
                      ) : (
                        "Entrar no Sistema"
                      )}
                    </Button>
                  </motion.div>
                </motion.form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Demo Credentials - Responsive */}
          <motion.div
            className="mt-6 sm:mt-8 space-y-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-white text-center">
              Credenciais de Demonstração
            </h3>
            <div className="space-y-3">
              {demoCredentials.map((cred, index) => (
                <motion.div
                  key={cred.role}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-3 sm:p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                  onClick={() =>
                    handleDemoLogin({
                      email: cred.email,
                      password: cred.password,
                    })
                  }
                  whileHover={{
                    scale: 1.03,
                    x: 10,
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 2 + index * 0.2,
                    duration: 0.6,
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${cred.color} flex items-center justify-center group-hover:scale-125 transition-transform shadow-lg`}
                      whileHover={{
                        rotate: [0, 15, -15, 0],
                        boxShadow:
                          "0 0 20px rgba(59, 130, 246, 0.8)",
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                        <p className="font-semibold text-white text-sm sm:text-base">
                          {cred.role}
                        </p>
                        <Badge className="bg-white/20 text-blue-100 text-xs border-white/20 mt-1 sm:mt-0 self-start">
                          {cred.email}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-blue-200">
                        {cred.description}
                      </p>
                    </div>
                    <motion.div
                      className="text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity text-lg sm:text-xl"
                      animate={{ x: [0, 8, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      →
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}