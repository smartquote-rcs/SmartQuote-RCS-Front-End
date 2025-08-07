# 🚀 Guia de Conexão com a API do seu Colega

## 📋 Estrutura Criada

### Arquivos Criados:
- `src/api/client.js` - Cliente HTTP configurado
- `src/api/services.ts` - Serviços para autenticação e funcionários (versão TypeScript)
- `src/examples/LoginExample.js` - Exemplo de login/registro
- `src/examples/EmployeePage.js` - Exemplo de página de funcionários

## 🔧 Como Usar

### 1. **A API está rodando em produção:**
```
URL da API: https://testsmart-24vt.onrender.com/api
Documentação: https://testsmart-24vt.onrender.com/doc/#/
```
Não precisa rodar localmente! A API já está online.

### 2. **Testar os endpoints manualmente:**

#### Criar um usuário:
```bash
curl -X POST https://testsmart-24vt.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "João Silva",
    "email": "joao@teste.com",
    "password": "123456"
  }'
```

#### Fazer login:
```bash
curl -X POST https://testsmart-24vt.onrender.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@teste.com",
    "password": "123456"
  }'
```

### 3. **Integrar no seu projeto React:**

#### No seu componente LoginPage:
```javascript
import { authService } from '../api/services.ts';

const handleLogin = async (email, password) => {
  const result = await authService.signin({ email, password });
  
  if (result.success) {
    // Login bem-sucedido
    console.log('Token:', result.data.token);
    // Redirecionar para dashboard
  } else {
    // Mostrar erro
    alert(result.error);
  }
};
```

#### Para listar funcionários:
```javascript
import { employeeService } from '../api/services.ts';

const loadEmployees = async () => {
  const result = await employeeService.getAll();
  
  if (result.success) {
    setEmployees(result.data.data);
  } else {
    console.error(result.error);
  }
};
```

## 🔐 Autenticação

O sistema usa **JWT tokens**:
- Quando você faz login, recebe um token
- Esse token é automaticamente incluído nas próximas requisições
- Se o token expirar, você é redirecionado para o login

## 📡 Endpoints Disponíveis

### Autenticação:
- `POST /api/auth/signup` - Registrar usuário
- `POST /api/auth/signin` - Fazer login

### Funcionários (requer token):
- `GET /api/employee/` - Listar funcionários  
- `POST /api/employee/create` - Criar funcionário

## 🚨 Problemas Comuns

### 1. **Erro de CORS:**
```
Access to fetch at 'http://localhost:2001' from origin 'http://localhost:5173' has been blocked by CORS
```
**Solução:** Seu colega precisa configurar CORS no backend.

### 2. **Erro 401 - Não autorizado:**
```
Token inválido ou ausente
```
**Solução:** Faça login primeiro para obter um token válido.

### 3. **Erro de conexão:**
```
Network Error
```
**Solução:** Verifique se a API está online em https://testsmart-24vt.onrender.com/doc

## 🔄 Próximos Passos

1. **Substituir dados mockados** pelos serviços da API
2. **Adicionar mais endpoints** conforme seu colega desenvolver
3. **Implementar tratamento de erros** mais robusto
4. **Adicionar loading states** para melhor UX

## 🧪 Testando Agora

### Para testar rapidamente:
1. Abra o console do navegador (F12)
2. Cole este código para testar:

```javascript
// Testar criação de usuário
fetch('https://testsmart-24vt.onrender.com/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'Teste User',
    email: 'teste@exemplo.com',
    password: '123456'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

// Testar login
fetch('https://testsmart-24vt.onrender.com/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'teste@exemplo.com',
    password: '123456'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## 📝 Checklist de Integração

- [ ] API online em https://testsmart-24vt.onrender.com
- [ ] CORS configurado no backend (verifique com seu colega)
- [ ] Usuário criado via signup
- [ ] Login funcionando e retornando token
- [ ] Endpoints de funcionários acessíveis com token
- [ ] Frontend integrando com os serviços criados

**Agora você está pronto para conectar seu frontend com a API do seu colega!** 🎉
