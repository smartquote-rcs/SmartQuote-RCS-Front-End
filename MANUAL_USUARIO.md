# Manual do Usuário - SmartQuote RCS

## Índice
1. [Visão Geral](#visão-geral)
2. [Acesso ao Sistema](#acesso-ao-sistema)
3. [Painel do Usuário](#painel-do-usuário)
4. [Painel do Administrador](#painel-do-administrador)
5. [Funcionalidades Principais](#funcionalidades-principais)
6. [Configurações](#configurações)
7. [Suporte e Ajuda](#suporte-e-ajuda)

---

## Visão Geral

O **SmartQuote RCS** é um sistema de gestão de cotações que permite:
- Pesquisar e cotar produtos
- Gerir fornecedores
- Acompanhar processos de aprovação
- Gerar relatórios
- Configurar notificações por email
- Controlar usuários e permissões

### Tipos de Usuário
- **Usuário Comum**: Acesso a pesquisa de produtos, criação de cotações e histórico pessoal
- **Administrador**: Acesso completo ao sistema, incluindo gestão de usuários, fornecedores e configurações

---

## Acesso ao Sistema

### 1. Login Inicial
1. Acesse a página de login do sistema
2. Insira seu **email** e **senha**
3. Clique em **"Entrar"**

### 2. Primeiro Acesso
- Se for seu primeiro acesso, o administrador deve ter criado sua conta
- Você receberá as credenciais por email
- É recomendado alterar a senha no primeiro acesso

### 3. Recuperação de Senha
- Clique em **"Esqueceu a senha?"** na tela de login
- Digite seu email cadastrado
- Siga as instruções enviadas por email

---

## Painel do Usuário

### Interface Principal
Após o login como usuário, você verá:

#### Barra de Navegação Superior
- **Logo do sistema** à esquerda
- **Menu de navegação** no centro
- **Perfil do usuário** e logout à direita

#### Menu Principal (Lateral Esquerdo)
- **📊 Dashboard**: Visão geral das suas cotações
- **🔍 Pesquisa de Produtos**: Buscar produtos no catálogo
- **🛒 Minhas Cotações**: Histórico de cotações criadas
- **📦 Nova Cotação**: Criar nova solicitação de cotação

#### Área de Conteúdo
- Exibe o conteúdo da seção selecionada
- Dashboard com estatísticas pessoais
- Histórico de cotações recentes

### Funcionalidades do Usuário

#### 1. Dashboard Pessoal
- **Estatísticas**: Número de cotações criadas, aprovadas, pendentes
- **Cotações Recentes**: Lista das últimas cotações solicitadas
- **Status das Aprovações**: Acompanhamento em tempo real
- **Gráficos**: Visualização do desempenho mensal

#### 2. Pesquisa de Produtos
**Como usar:**
1. Acesse **"Pesquisa de Produtos"** no menu
2. Digite o nome ou código do produto
3. Use filtros para refinar a busca:
   - Categoria
   - Faixa de preço
   - Fornecedor
4. Visualize os resultados em lista ou grid
5. Clique em **"Ver Detalhes"** para mais informações
6. Adicione produtos ao carrinho de cotação

#### 3. Criar Nova Cotação
**Processo passo a passo:**
1. Acesse **"Nova Cotação"** no menu
2. **Opção 1 - Busca por IA**: 
   - Digite uma descrição do que precisa
   - O sistema sugere produtos automaticamente
3. **Opção 2 - Busca Manual**:
   - Use a pesquisa de produtos
   - Adicione itens manualmente
4. **Revisar Carrinho**:
   - Verifique quantidade de cada item
   - Ajuste especificações se necessário
5. **Finalizar Cotação**:
   - Preencha observações especiais
   - Defina prioridade (Normal/Urgente)
   - Clique em **"Solicitar Cotação"**

#### 4. Acompanhar Cotações
**Estados das Cotações:**
- **🟡 Pendente**: Aguardando aprovação
- **🟢 Aprovada**: Cotação aprovada e enviada aos fornecedores
- **🔴 Rejeitada**: Cotação negada (motivo será informado)
- **📊 Em Cotação**: Fornecedores enviando propostas
- **✅ Finalizada**: Processo concluído

**Ações Disponíveis:**
- **Visualizar Detalhes**: Ver informações completas
- **Exportar PDF**: Baixar relatório da cotação
- **Duplicar**: Criar nova cotação baseada numa existente
- **Comentários**: Adicionar observações

---

## Painel do Administrador

### Interface Administrativa
Administradores têm acesso a funcionalidades adicionais:

#### Menu Principal Expandido
- **📊 Dashboard**: Visão geral do sistema
- **📄 Cotações**: Gerenciar todas as cotações
- **➕ Nova Cotação**: Criar cotações para outros usuários
- **🔍 Pesquisa de Produtos**: Buscar no catálogo
- **🏢 Fornecedores**: Gestão de fornecedores

#### Menu de Sistema
- **📈 Relatórios**: Análises e estatísticas
- **🔔 Notificações**: Central de notificações
- **📧 Emails**: Histórico de emails enviados
- **⚙️ Processos**: Workflows automáticos

#### Menu Administrativo
- **👥 Gestão de Usuários**: Criar, editar, desativar usuários
- **⚙️ Configurações**: Configurações do sistema
- **🔐 Logs de Login**: Auditoria de acessos
- **💾 Backup**: Gestão de backups

### Funcionalidades Administrativas

#### 1. Dashboard Administrativo
- **Métricas Globais**: Total de cotações, usuários ativos, fornecedores
- **Gráficos de Performance**: Cotações por período, tempo médio de aprovação
- **Cotações Pendentes**: Lista de cotações aguardando aprovação
- **Alertas**: Notificações importantes do sistema

#### 2. Gestão de Cotações
**Aprovação de Cotações:**
1. Acesse **"Cotações"** no menu
2. Use as abas:
   - **Pendentes**: Cotações aguardando aprovação
   - **Aprovadas**: Cotações já aprovadas
   - **Todas**: Visão completa
3. Para cada cotação pendente:
   - Clique em **"Ver Detalhes"**
   - Analise os itens solicitados
   - Clique em **"Aprovar"** ou **"Marcar como Pendente"**
   - Adicione um motivo/comentário
   - Confirme a ação

**Funcionalidades Especiais:**
- **Exportar PDF**: Gerar relatórios detalhados
- **Histórico**: Ver todas as alterações feitas
- **Notificações**: Configurar alertas automáticos

#### 3. Gestão de Fornecedores
**Adicionar Novo Fornecedor:**
1. Acesse **"Fornecedores"** → **"Adicionar Fornecedor"**
2. Preencha as informações:
   - Nome da empresa
   - Email de contato
   - Telefone
   - Endereço
   - Especialidades/Categorias
3. Configure:
   - Status (Ativo/Inativo)
   - Prioridade
   - Observações
4. Salve as alterações

**Editar Fornecedor:**
- Clique no ícone de edição (✏️)
- Modifique as informações necessárias
- Salve as alterações

**Excluir Fornecedor:**
- Clique no ícone de exclusão (🗑️)
- Confirme a ação

#### 4. Gestão de Usuários
**Criar Novo Usuário:**
1. Acesse **"Gestão de Usuários"** → **"Adicionar Usuário"**
2. Preencha:
   - Nome completo
   - Email (será o login)
   - Cargo/Posição
   - Tipo de usuário (Usuário/Admin)
3. Defina senha inicial
4. Configure permissões especiais se necessário
5. Salve o usuário

**Gerenciar Usuários Existentes:**
- **Editar**: Modificar informações e permissões
- **Desativar**: Suspender acesso temporariamente
- **Redefinir Senha**: Gerar nova senha
- **Ver Atividade**: Histórico de ações do usuário

---

## Funcionalidades Principais

### 1. Sistema de Moedas
O sistema suporta múltiplas moedas:
- **Euro (EUR)**
- **Dólar Americano (USD)**
- **Libra Esterlina (GBP)**
- **Real Brasileiro (BRL)**
- **Iene Japonês (JPY)**
- **Franco Suíço (CHF)**
- **Dólar Canadense (CAD)**
- **Kwanza Angolano (AOA)**

**Como alterar a moeda:**
1. Acesse **"Configurações"**
2. Na seção **"Configurações do Sistema"**
3. Selecione a moeda desejada
4. Salve as alterações
5. Todos os valores serão exibidos na nova moeda

### 2. Sistema de Notificações por Email
**Configurar Notificações:**
1. Acesse **"Configurações"** → **"Notificações por Email"**
2. Configure:
   - **SMTP Server**: Servidor de email
   - **Porta**: Porta do servidor
   - **Usuário**: Email remetente
   - **Senha**: Senha do email
   - **Usar TLS**: Ativar criptografia
3. **Teste a Configuração**: Envie um email de teste
4. **Configure Gatilhos**:
   - Nova cotação criada
   - Cotação aprovada/rejeitada
   - Fornecedor respondeu
   - Processo finalizado

### 3. Sistema de Relatórios
**Tipos de Relatórios Disponíveis:**
- **Relatório de Cotações**: Por período, usuário, status
- **Performance de Fornecedores**: Tempo de resposta, qualidade
- **Análise de Custos**: Evolução de preços, comparativos
- **Relatório de Usuários**: Atividade, cotações criadas

**Como Gerar Relatórios:**
1. Acesse **"Relatórios"**
2. Escolha o tipo de relatório
3. Defina filtros:
   - Período (data inicial e final)
   - Usuários específicos
   - Fornecedores específicos
   - Status das cotações
4. Clique em **"Gerar Relatório"**
5. **Exportar**: PDF, Excel, CSV

### 4. Busca Inteligente por IA
**Funcionalidade Avançada:**
1. Na criação de nova cotação, use a busca por IA
2. Digite uma descrição natural: *"Preciso de 50 cadeiras de escritório ergonômicas"*
3. O sistema analisa e sugere produtos automaticamente
4. Revise e ajuste as sugestões
5. Adicione ao carrinho de cotação

### 5. Workflows Automáticos
**Processos Configuráveis:**
- **Auto-aprovação**: Cotações abaixo de determinado valor
- **Notificações Escalonadas**: Alertas por níveis hierárquicos
- **Aprovação em Cadeia**: Múltiplos aprovadores
- **Timeout de Cotações**: Expiração automática

---

## Configurações

### 1. Configurações do Sistema
**Acessível apenas para Administradores:**

#### Configurações Gerais
- **Nome do Sistema**: Personalizar o nome exibido
- **Logo**: Upload da logo da empresa
- **Moeda Padrão**: Definir moeda principal
- **Idioma**: Português, Inglês
- **Fuso Horário**: Configurar timezone

#### Configurações de Cotação
- **Valor Máximo para Auto-aprovação**: Limite para aprovação automática
- **Tempo de Expiração**: Dias para expirar cotações
- **Fornecedores Obrigatórios**: Mínimo de fornecedores por cotação
- **Campos Obrigatórios**: Definir quais campos são mandatórios

#### Configurações de Email
- **Servidor SMTP**: Configurações do servidor de email
- **Templates**: Personalizar templates de emails
- **Assinatura**: Configurar assinatura padrão
- **Frequência**: Definir frequência de notificações

### 2. Configurações Pessoais
**Acessível para todos os usuários:**

#### Perfil
- **Nome**: Alterar nome de exibição
- **Email**: Modificar email (com validação)
- **Senha**: Alterar senha atual
- **Foto de Perfil**: Upload de avatar

#### Preferências
- **Idioma**: Escolher idioma da interface
- **Notificações**: Ativar/desativar tipos de notificação
- **Dashboard**: Personalizar widgets exibidos
- **Tema**: Claro/Escuro (se disponível)

---

## Suporte e Ajuda

### 1. Central de Ajuda
**Recursos Disponíveis:**
- **Manual do Usuário**: Este documento
- **Tutoriais em Vídeo**: Guias passo a passo
- **FAQ**: Perguntas frequentes
- **Glossário**: Termos técnicos

### 2. Contato com Suporte
**Canais de Atendimento:**
- **Chat Online**: Disponível durante horário comercial
- **Email**: suporte@smartquote-rcs.com
- **Telefone**: Disponível nas configurações do sistema
- **Ticket**: Sistema interno de chamados

### 3. Solução de Problemas Comuns

#### Problema: Não consigo fazer login
**Soluções:**
1. Verifique se email e senha estão corretos
2. Certifique-se que não há espaços extras
3. Use "Esqueceu a senha?" se necessário
4. Contate o administrador se a conta estiver desativada

#### Problema: Cotação não está sendo aprovada
**Verificações:**
1. Confirme se todos os campos obrigatórios foram preenchidos
2. Verifique se o valor está dentro dos limites permitidos
3. Consulte o administrador sobre políticas de aprovação
4. Verifique se há notificações pendentes

#### Problema: Fornecedor não recebeu cotação
**Ações:**
1. Verifique se o email do fornecedor está correto
2. Consulte os logs de email enviados
3. Verifique se o fornecedor está ativo no sistema
4. Confirme as configurações de SMTP

#### Problema: Relatórios não são gerados
**Verificações:**
1. Confirme se há dados no período selecionado
2. Verifique as permissões de usuário
3. Tente com filtros diferentes
4. Consulte os logs do sistema

### 4. Melhores Práticas

#### Para Usuários
- **Seja Específico**: Descreva produtos com detalhes
- **Use Categorias**: Facilita a busca e organização
- **Acompanhe Status**: Verifique regularmente suas cotações
- **Mantenha Dados Atualizados**: Perfil e preferências sempre atuais

#### Para Administradores
- **Backup Regular**: Mantenha backups atualizados
- **Monitore Logs**: Acompanhe atividades suspeitas
- **Treine Usuários**: Realize treinamentos periódicos
- **Atualize Fornecedores**: Mantenha base de fornecedores atualizada
- **Configure Alertas**: Defina alertas para situações críticas

### 5. Atualizações do Sistema
**Processo de Atualização:**
1. **Notificação**: Administradores são notificados sobre atualizações
2. **Planejamento**: Definir janela de manutenção
3. **Backup**: Realizar backup completo antes da atualização
4. **Instalação**: Aplicar atualização durante horário de baixo uso
5. **Validação**: Testar funcionalidades principais
6. **Comunicação**: Informar usuários sobre novas funcionalidades

---

## Glossário

- **Cotação**: Solicitação de preços para produtos específicos
- **Fornecedor**: Empresa que fornece produtos ou serviços
- **Workflow**: Fluxo automatizado de processos
- **SMTP**: Protocolo para envio de emails
- **Dashboard**: Painel principal com resumo de informações
- **Template**: Modelo pré-definido para documentos/emails
- **API**: Interface de programação de aplicativos
- **Backup**: Cópia de segurança dos dados

---

**Versão do Manual:** 1.0  
**Última Atualização:** Setembro 2025  
**Sistema:** SmartQuote RCS v1.0

Para suporte adicional, entre em contato com a equipe técnica através dos canais oficiais.
