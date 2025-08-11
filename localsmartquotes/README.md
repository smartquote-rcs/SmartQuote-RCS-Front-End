# SmartQuote RCS Front-End

Sistema de cotação inteligente (Request for Quotation System) construído com React, TypeScript e Vite.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Ferramenta de build e servidor de desenvolvimento
- **Tailwind CSS** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e não estilizados
- **Lucide React** - Ícones
- **Recharts** - Biblioteca para gráficos
- **Framer Motion** - Animações

## 📁 Estrutura do Projeto

```
├── src/                    # Código fonte principal
│   ├── lib/               # Utilitários e helpers
│   └── ...
├── BG/                    # Componentes importados do Figma
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes de interface reutilizáveis
│   │   ├── pages/        # Páginas da aplicação
│   │   └── figma/        # Componentes específicos do Figma
│   ├── styles/           # Estilos globais
│   └── guidelines/       # Diretrizes de design
└── public/               # Arquivos estáticos
```

## 🎯 Funcionalidades

- **Sistema de Autenticação Multi-Perfil**
  - Usuário: `usuario@rcs.pt` / `demo123`
  - Gestor: `gestor@rcs.pt` / `demo123`  
  - Admin: `admin@rcs.pt` / `demo123`

- **Dashboards Personalizados**
  - Dashboard do usuário com métricas pessoais
  - Dashboard do gestor com visão de equipe
  - Dashboard do admin com controle total

- **Interface Dark Theme**
- **Componentes Responsivos**
- **Gráficos e Visualizações**

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

1. Clone o repositório
```bash
git clone <repository-url>
cd localsmartquotes
```

2. Instale as dependências
```bash
npm install
```

3. Execute o servidor de desenvolvimento
```bash
npm run dev
```

4. Abra http://localhost:5173 no navegador

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera o build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linting do código

## 🎨 Design System

O projeto utiliza um sistema de design dark com as seguintes cores principais:

- **Background**: #0F172A (dark-bg)
- **Cards**: #1E293B (dark-card)  
- **Primary Text**: #FFFFFF
- **Secondary Text**: #94A3B8
- **CTA/Actions**: #3B82F6 (blue)
- **Positive**: #22C55E (green)
- **Negative**: #EF4444 (red)

## 📦 Componentes Disponíveis

O projeto inclui uma biblioteca completa de componentes UI baseados no Radix UI:

- Buttons, Cards, Forms
- Navigation, Menus, Dropdowns
- Charts, Tables, Metrics
- Dialogs, Tooltips, Popovers
- E muito mais...

## 🚀 Deploy

Para fazer o deploy da aplicação:

1. Gere o build de produção:
```bash
npm run build
```

2. Os arquivos estarão na pasta `dist/`

## 📄 Licença

Este projeto está sob licença MIT.
