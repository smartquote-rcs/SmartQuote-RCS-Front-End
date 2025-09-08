# 🚀 SmartQuote RCS - Frontend

<div align="center">
  <img src="./public/RCS.png" alt="RCS Logo" width="100" height="100" />
  
  **Sistema Inteligente de Gestão de Cotações**
  
  [![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.0.5-purple.svg)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC.svg)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## 📋 Sobre o Projeto

O **SmartQuote RCS** é uma aplicação web moderna e responsiva para gestão inteligente de cotações, desenvolvida com tecnologias de ponta. O sistema oferece automação completa do processo de cotações, desde a criação até a aprovação, com integração de IA para busca de produtos e comparação de preços.

### ✨ Principais Características

- 🤖 **IA Integrada** - Busca automática de produtos e sugestões inteligentes
- 📊 **Dashboard Analytics** - Métricas em tempo real e relatórios detalhados
- 🔒 **Sistema de Permissões** - Controle de acesso baseado em funções (Admin, Gestor, Usuário)
- 🌐 **Multilíngue** - Suporte para Português e Inglês
- 📱 **Responsivo** - Interface adaptável para desktop, tablet e mobile
- 🔄 **Tempo Real** - Notificações e atualizações instantâneas
- 📄 **Exportação** - Relatórios em PDF, Excel e CSV
- 🎨 **UI/UX Moderna** - Design limpo com animações fluidas

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3.1** - Biblioteca para interfaces de usuário
- **TypeScript 5.8.3** - Superset tipado do JavaScript
- **Vite 6.0.5** - Build tool e dev server ultrarrápido
- **Tailwind CSS 3.4.17** - Framework CSS utilitário

### UI Components
- **Radix UI** - Componentes primitivos acessíveis
- **Lucide React** - Ícones SVG customizáveis
- **Framer Motion** - Animações e transições suaves

### Gráficos e Visualização
- **Chart.js 4.5.0** - Gráficos interativos
- **ApexCharts 5.3.4** - Gráficos avançados
- **React ChartJS-2** - Wrapper React para Chart.js
- **Recharts 2.15.0** - Gráficos composáveis

### Utilitários
- **Axios 1.11.0** - Cliente HTTP para APIs
- **i18next 25.3.2** - Internacionalização
- **Day.js 1.11.15** - Manipulação de datas
- **jsPDF 3.0.2** - Geração de PDFs
- **XLSX 0.18.5** - Manipulação de planilhas

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js** 18.0.0 ou superior
- **npm** 9.0.0 ou superior

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/SmartQuote-RCS-Front-End.git
   cd SmartQuote-RCS-Front-End
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. **Execute o projeto em desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   ```
   http://localhost:5173
   ```

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento

# Build
npm run build        # Gera build de produção
npm run preview      # Preview do build de produção

# Qualidade de Código
npm run lint         # Executa ESLint para verificar código
```

## 🏗️ Estrutura do Projeto

```
src/
├── api/                    # Configuração e serviços da API
│   ├── client.ts          # Cliente HTTP (Axios)
│   └── services.ts        # Serviços da API
├── components/            # Componentes React
│   ├── pages/            # Páginas da aplicação
│   ├── ui/               # Componentes de UI reutilizáveis
│   ├── AdminDashboard.tsx # Dashboard administrativo
│   ├── UserDashboard.tsx  # Dashboard do usuário
│   └── LoginPage.tsx      # Página de login
├── contexts/             # Contextos React
│   └── AppContext.tsx    # Contexto global da aplicação
├── hooks/                # Custom hooks
│   ├── useCurrency.ts    # Hook para formatação de moeda
│   └── useLanguage.ts    # Hook para controle de idioma
├── i18n/                 # Internacionalização
│   └── index.ts          # Configuração do i18next
├── services/             # Serviços de negócio
│   ├── authService.ts    # Autenticação
│   ├── emailService.ts   # Gestão de emails
│   └── logService.ts     # Sistema de logs
├── styles/               # Estilos globais
├── types/                # Definições de tipos TypeScript
├── utils/                # Utilitários e helpers
└── App.tsx               # Componente principal
```

## 🎯 Funcionalidades

### 🔐 Sistema de Autenticação
- Login seguro com validação
- Controle de sessão
- Diferentes níveis de permissão
- Logs de acesso

### 📋 Gestão de Cotações
- Criação de cotações com IA
- Busca automática de produtos
- Comparação de preços
- Aprovação/rejeição workflow
- Histórico completo

### 👥 Gestão de Fornecedores
- Cadastro completo de fornecedores
- Métricas de performance
- Avaliação de qualidade
- Relatórios de desempenho

### 📊 Dashboard e Relatórios
- Métricas em tempo real
- Gráficos interativos
- Exportação em múltiplos formatos
- Análise de tendências

### 🔔 Sistema de Notificações
- Notificações em tempo real
- Configuração personalizada
- Histórico de notificações
- Integração com email

### ⚙️ Configurações Avançadas
- Personalização de interface
- Configuração de moeda
- Seleção de idioma
- Templates de email

## 🌐 Suporte a Idiomas

- 🇵🇹 **Português** (Padrão)
- 🇺🇸 **Inglês**

## 📱 Responsividade

O sistema foi desenvolvido com abordagem **mobile-first**, garantindo experiência otimizada em:

- 📱 **Mobile** (320px+)
- 📟 **Tablet** (640px+)
- 💻 **Desktop** (1024px+)
- 🖥️ **Large Desktop** (1280px+)

## 🎨 Design System

### Paleta de Cores
- **Primary**: Azul (#3B82F6)
- **Secondary**: Ciano (#06B6D4)
- **Success**: Verde (#10B981)
- **Warning**: Amarelo (#F59E0B)
- **Error**: Vermelho (#EF4444)
- **Dark**: Cinza escuro (#1F2937)

### Tipografia
- **Font Family**: Inter, system-ui, sans-serif
- **Escalas**: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl

## 🔧 Configuração de Desenvolvimento

### ESLint
```bash
# Verificar código
npm run lint

# Corrigir automaticamente
npm run lint -- --fix
```

### TypeScript
O projeto usa TypeScript com configuração estrita para garantir type safety.

### Tailwind CSS
Classes utilitárias para estilização rápida e consistente.

## 📝 Contribuição

1. **Fork** o projeto
2. **Create** uma feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Open** um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🏢 Sobre a RCS

A **RCS** é uma empresa líder em soluções tecnológicas em Angola, oferecendo:

- 💼 **Consultoria em TI**
- 🖥️ **Soluções de Hardware**
- ☁️ **Serviços em Nuvem**
- 🔧 **Suporte Técnico 24/7**

### 📞 Contato

- **Website**: [https://www.rcsangola.co.ao/](https://www.rcsangola.co.ao/)
- **Call Center**: 932 896 190
- **Horário**: Segunda-feira – Sexta-feira, 7h30 – 17h00
- **Helpdesk**: 24/7

### 📍 Localização

- **Sede**: Rua Comandante Arguelles, nº103 – Prenda
- **Filial**: Rua de Liberdade, nº94 – Vila Alice

---

<div align="center">
  <strong>Desenvolvido por Devs da 42 Luanda</strong>
  <br />
  <small>© 2025 RCS Angola. Todos os direitos reservados.</small>
</div>
