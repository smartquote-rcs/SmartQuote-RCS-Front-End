import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

interface CarouselSlide {
  id: number;
  imageUrl: string;
  alt: string;
  title: string;
  description: string;
  category: 'dashboard' | 'quotes' | 'management' | 'settings' | 'reports';
}

export const HelpPage: React.FC<{ onNavigateToDashboard?: () => void }> = ({ 
  onNavigateToDashboard 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slides com imagens fornecidas (screenshots) com descrições detalhadas
  const onboardingSlides: CarouselSlide[] = [
    {
      id: 1,
      imageUrl: '/images/1.png',
      alt: 'Pedidos de Cotação',
      title: 'Pedidos de Cotação',
      description: 'Visualize e gerencie todos os pedidos de cotação de forma centralizada. Acompanhe o status, prazos e prioridades de cada solicitação.',
      category: 'quotes'
    },
    {
      id: 2,
      imageUrl: '/images/2.png',
      alt: 'Gestão de Usuários',
      title: 'Gestão de Usuários',
      description: 'Administre usuários do sistema com diferentes níveis de acesso. Controle permissões e monitore atividades da equipe.',
      category: 'management'
    },
    {
      id: 3,
      imageUrl: '/images/3.png',
      alt: 'Configurações do Sistema',
      title: 'Configurações do Sistema',
      description: 'Personalize as configurações da plataforma. Ajuste preferências, idiomas, moedas e outras opções do sistema.',
      category: 'settings'
    },
    {
      id: 4,
      imageUrl: '/images/4.png',
      alt: 'Logs de Login',
      title: 'Logs de Login',
      description: 'Monitore o histórico de acessos ao sistema. Visualize tentativas de login, horários e informações de segurança.',
      category: 'reports'
    },
    {
      id: 5,
      imageUrl: '/images/5.png',
      alt: 'Chat RICAS',
      title: 'Chat RICAS (IA)',
      description: 'Interaja com nossa IA integrada para obter suporte, esclarecer dúvidas e otimizar processos de cotação.',
      category: 'dashboard'
    },
    {
      id: 6,
      imageUrl: '/images/6.png',
      alt: 'Tela de Login',
      title: 'Tela de Login',
      description: 'Interface segura de acesso ao sistema. Autenticação robusta com diferentes níveis de usuário.',
      category: 'settings'
    },
    {
      id: 7,
      imageUrl: '/images/7.png',
      alt: 'Dashboard Principal',
      title: 'Dashboard Principal',
      description: 'Visão geral completa do sistema com métricas importantes, gráficos e indicadores de performance em tempo real.',
      category: 'dashboard'
    },
    {
      id: 8,
      imageUrl: '/images/8.png',
      alt: 'Detalhes do Pedido de Cotação',
      title: 'Detalhes de Cotação',
      description: 'Visualização detalhada de cada cotação com informações completas, histórico e opções de aprovação.',
      category: 'quotes'
    },
    {
      id: 9,
      imageUrl: '/images/9.png',
      alt: 'Edição de Produto',
      title: 'Edição de Produto',
      description: 'Interface completa para cadastrar e editar produtos do catálogo. Gerencie especificações, preços e disponibilidade.',
      category: 'management'
    },
    {
      id: 10,
      imageUrl: '/images/10.png',
      alt: 'Edição de Fornecedor',
      title: 'Gestão de Fornecedores',
      description: 'Cadastre e mantenha informações de fornecedores. Controle dados de contato, especialidades e histórico de parcerias.',
      category: 'management'
    },
    {
      id: 11,
      imageUrl: '/images/11.png',
      alt: 'Edição de Usuário',
      title: 'Perfil de Usuário',
      description: 'Edite perfis de usuários com informações pessoais, permissões de acesso e configurações personalizadas.',
      category: 'management'
    },
    {
      id: 12,
      imageUrl: '/images/12.png',
      alt: 'Criação de Novo Pedido de Cotação',
      title: 'Nova Cotação',
      description: 'Crie novos pedidos de cotação de forma intuitiva. Utilize nossa IA para otimizar o processo e conectar com fornecedores.',
      category: 'quotes'
    },
    {
      id: 13,
      imageUrl: '/images/13.png',
      alt: 'Criação de Novo Produto',
      title: 'Novo Produto',
      description: 'Adicione novos produtos ao catálogo com informações detalhadas, categorização e controle de estoque.',
      category: 'management'
    },
    {
      id: 14,
      imageUrl: '/images/14.png',
      alt: 'Criação de Novo Fornecedor',
      title: 'Novo Fornecedor',
      description: 'Cadastre novos fornecedores na plataforma com dados completos de contato e especialidades.',
      category: 'management'
    },
  ];

  const currentSlideData = onboardingSlides[currentSlide];

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      if (prev >= onboardingSlides.length - 1) {
        // Se está no último slide e há uma função de navegação, redireciona para o dashboard
        if (onNavigateToDashboard) {
          onNavigateToDashboard();
          return prev;
        }
        // Se não há função de navegação, tenta recarregar a página para o dashboard
        window.location.href = '/dashboard';
        return prev;
      }
      return prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      if (prev <= 0) return prev; // Para no primeiro slide
      return prev - 1;
    });
  };



return (
  <div className="min-h-screen w-full bg-dark-bg flex flex-col">
    {/* Header compacto */}
    <div className="w-full py-3 px-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-b border-white/10 shadow-lg">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-full border border-blue-500/30">
              <HelpCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white">
                Guia do Sistema SmartQuote
              </h1>
              <p className="text-xs text-blue-200/80 hidden sm:block">
                Tutorial interativo
              </p>
            </div>
          </div>
          
          {/* Indicador de progresso compacto */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/20">
              <span className="text-white font-medium text-sm">
                {currentSlide + 1} / {onboardingSlides.length}
              </span>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-xs text-blue-200 font-medium truncate max-w-32">{currentSlideData.title}</p>
            </div>
          </div>
        </div>
        
        {/* Barra de progresso mais fina */}
        <div className="mt-2 w-full bg-white/10 rounded-full h-1 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-400 to-purple-400 h-full transition-all duration-500 ease-out"
            style={{ width: `${((currentSlide + 1) / onboardingSlides.length) * 100}%` }}
          />
        </div>
      </div>
    </div>

    {/* Área principal do carrossel - Apenas a imagem */}
    <div className="flex-1 flex items-center justify-center p-2">
      <div className="w-full max-w-[95vw] mx-auto h-full">
        
        {/* Imagem principal do carrossel - Maximizada */}
        <div className="relative">
          <div className="relative group bg-slate-800/20 rounded-xl overflow-hidden h-[84vh]">
            <img
              src={currentSlideData.imageUrl}
              alt={currentSlideData.alt}
              className="w-full h-full object-contain transition-all duration-500 ease-in-out"
              style={{ filter: 'brightness(0.98) contrast(1.02)' }}
            />
            
            {/* Botões de navegação com estados desabilitados */}
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 backdrop-blur-sm rounded-full text-white transition-all duration-300 shadow-2xl ${
                currentSlide === 0 
                  ? 'bg-gray-600/40 opacity-40 cursor-not-allowed' 
                  : 'bg-black/60 hover:bg-black/80 opacity-0 group-hover:opacity-100 hover:scale-110'
              }`}
              title={currentSlide === 0 ? "Primeiro slide" : "Slide anterior"}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={nextSlide}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 backdrop-blur-sm rounded-full text-white transition-all duration-300 shadow-2xl ${
                currentSlide === onboardingSlides.length - 1 
                  ? 'bg-green-600/60 hover:bg-green-700/80 opacity-0 group-hover:opacity-100 hover:scale-110' 
                  : 'bg-black/60 hover:bg-black/80 opacity-0 group-hover:opacity-100 hover:scale-110'
              }`}
              title={currentSlide === onboardingSlides.length - 1 ? "Ir para Dashboard" : "Próximo slide"}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
        
      </div>
    </div>
  </div>
);


};