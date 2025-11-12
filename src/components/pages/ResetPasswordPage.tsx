import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../../api/services';

interface ResetPasswordPageProps {
  onPasswordReset?: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ 
  onPasswordReset 
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Estados do formulário
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  // Validações
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  useEffect(() => {
    // Obter token da URL - pode vir no hash (#access_token=) ou query (?token=)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    
    const finalToken = accessToken || tokenParam;
    
    if (!finalToken) {
      setError('Token de reset não encontrado. Link inválido ou expirado.');
      return;
    }
    
    setToken(finalToken);
  }, [searchParams]);

  useEffect(() => {
    // Validar senha em tempo real
    const validation = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    setPasswordValidation(validation);
  }, [password]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!token) {
      setError('Token de reset inválido');
      return;
    }

    if (!isPasswordValid) {
      setError('Por favor, atenda a todos os critérios de senha');
      return;
    }
    
    if (!passwordsMatch) {
      setError('As senhas não coincidem');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authService.resetPassword(token, password);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
          onPasswordReset?.();
        }, 2000);
      } else {
        setError(response.error || 'Erro ao redefinir senha');
      }
    } catch (err: any) {
      setError(err.message || 'Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationIcon = ({ isValid }: { isValid: boolean }) => (
    isValid ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-500" />
    )
  );

  if (success) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Senha Redefinida!
            </h2>
            <p className="text-dark-secondary mb-4">
              Sua senha foi alterada com sucesso. Você será redirecionado para a página de login.
            </p>
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-dark-cta rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-dark-text">
            Redefinir Senha
          </h1>
          <p className="text-dark-secondary">
            Digite sua nova senha abaixo
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-dark-text">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-dark-card border-dark-border text-dark-text pr-10"
                  placeholder="Digite sua nova senha"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-secondary hover:text-dark-text"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Validações da senha */}
            {password.length > 0 && (
              <div className="bg-dark-card border border-dark-border rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-dark-text mb-2">Critérios da senha:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <ValidationIcon isValid={passwordValidation.minLength} />
                    <span className={passwordValidation.minLength ? 'text-green-500' : 'text-red-400'}>
                      Mínimo 8 caracteres
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ValidationIcon isValid={passwordValidation.hasUppercase} />
                    <span className={passwordValidation.hasUppercase ? 'text-green-500' : 'text-red-400'}>
                      Pelo menos 1 letra maiúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ValidationIcon isValid={passwordValidation.hasLowercase} />
                    <span className={passwordValidation.hasLowercase ? 'text-green-500' : 'text-red-400'}>
                      Pelo menos 1 letra minúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ValidationIcon isValid={passwordValidation.hasNumber} />
                    <span className={passwordValidation.hasNumber ? 'text-green-500' : 'text-red-400'}>
                      Pelo menos 1 número
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ValidationIcon isValid={passwordValidation.hasSpecialChar} />
                    <span className={passwordValidation.hasSpecialChar ? 'text-green-500' : 'text-red-400'}>
                      Pelo menos 1 caractere especial
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-dark-text">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-dark-card border-dark-border text-dark-text pr-10"
                  placeholder="Confirme sua nova senha"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-secondary hover:text-dark-text"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Indicador de senhas coincidindo */}
            {confirmPassword.length > 0 && (
              <div className={`flex items-center gap-2 text-sm ${
                passwordsMatch ? 'text-green-500' : 'text-red-400'
              }`}>
                <ValidationIcon isValid={passwordsMatch} />
                <span>
                  {passwordsMatch ? 'As senhas coincidem' : 'As senhas não coincidem'}
                </span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-dark-cta hover:bg-dark-cta/80 text-white"
              disabled={isLoading || !isPasswordValid || !passwordsMatch || !token}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redefinindo senha...
                </div>
              ) : (
                'Redefinir Senha'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-dark-cta hover:text-dark-cta/80 text-sm"
              disabled={isLoading}
            >
              Voltar para o login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
