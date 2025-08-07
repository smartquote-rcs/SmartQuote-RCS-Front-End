// Exemplo de como usar a API na LoginPage
import { authService } from '../api/services.ts';

// Função para fazer login com a API real
const handleApiLogin = async (email, password) => {
  try {
    const result = await authService.signin({ email, password });
    
    if (result.success) {
      console.log('Login realizado com sucesso!', result.data);
      // Aqui você pode redirecionar ou atualizar o estado da aplicação
      return true;
    } else {
      console.error('Erro no login:', result.error);
      alert(result.error);
      return false;
    }
  } catch (error) {
    console.error('Erro inesperado:', error);
    alert('Erro inesperado ao fazer login');
    return false;
  }
};

// Função para registrar novo usuário
const handleApiSignup = async (name, email, password) => {
  try {
    const result = await authService.signup({ name, email, password });
    
    if (result.success) {
      console.log('Usuário criado com sucesso!', result.data);
      alert('Usuário criado com sucesso! Agora você pode fazer login.');
      return true;
    } else {
      console.error('Erro no registro:', result.error);
      alert(result.error);
      return false;
    }
  } catch (error) {
    console.error('Erro inesperado:', error);
    alert('Erro inesperado ao criar usuário');
    return false;
  }
};

// Exemplo de uso em React
export const LoginExample = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Fazer login
      const success = await handleApiLogin(formData.email, formData.password);
      if (success) {
        // Redirecionar para dashboard
        window.location.href = '/dashboard';
      }
    } else {
      // Registrar usuário
      const success = await handleApiSignup(formData.name, formData.email, formData.password);
      if (success) {
        setIsLogin(true); // Voltar para tela de login
      }
    }
  };

  return (
    <div>
      <h2>{isLogin ? 'Login' : 'Registro'}</h2>
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Nome completo"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        
        <input
          type="password"
          placeholder="Senha"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        
        <button type="submit">
          {isLogin ? 'Entrar' : 'Criar Conta'}
        </button>
      </form>
      
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Criar nova conta' : 'Já tenho conta'}
      </button>
    </div>
  );
};
