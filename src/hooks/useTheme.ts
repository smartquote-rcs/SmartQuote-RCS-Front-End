import { useApp } from '../contexts/AppContext';

export const useTheme = () => {
  const { userSettings, updateSettings } = useApp();
  
  const theme = userSettings.theme;
  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    updateSettings({ theme: newTheme });
  };

  // Classes CSS condicionais para o tema atual
  const themeClasses = {
    // Backgrounds
    bg: isLight ? 'bg-gray-50' : 'bg-dark-bg',
    cardBg: isLight ? 'bg-white' : 'bg-dark-card',
    glassBg: isLight ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-white/5 backdrop-blur-md',
    
    // Borders
    border: isLight ? 'border-gray-300' : 'border-dark-color',
    borderHover: isLight ? 'hover:border-blue-400' : 'hover:border-blue-400/30',
    
    // Text colors - mais profissionais para modo light
    textPrimary: isLight ? 'text-gray-800' : 'text-white',
    textSecondary: isLight ? 'text-gray-700' : 'text-gray-300',
    textMuted: isLight ? 'text-gray-600' : 'text-gray-400',
    
    // Hover states
    hover: isLight ? 'hover:bg-gray-100' : 'hover:bg-dark-hover',
    hoverStrong: isLight ? 'hover:bg-gray-200' : 'hover:bg-white/10',
    
    // Input styles
    input: isLight 
      ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500' 
      : 'bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-purple-500/50',
    
    // Button styles
    buttonPrimary: isLight 
      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white',
    
    buttonSecondary: isLight 
      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-400' 
      : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border-slate-600/50',
    
    // Sidebar styles
    sidebarBg: isLight ? 'bg-white' : 'bg-dark-bg',
    
    // Navigation styles
    navItem: isLight 
      ? 'text-gray-800 hover:text-blue-700 hover:bg-blue-50' 
      : 'text-dark-secondary hover:text-blue-300 hover:bg-white/5',
    
    navItemActive: isLight 
      ? 'bg-blue-100 text-blue-800 border-blue-400' 
      : 'bg-white/10 text-blue-400 border-blue-400',
    
    // Separator
    separator: isLight ? 'bg-gray-400' : 'bg-gray-600',
    
    // Glass card
    glassCard: isLight 
      ? 'bg-white border-gray-300 shadow-md' 
      : 'glass-card border-white/20 bg-white/5',
    
    // User section
    userCard: isLight 
      ? 'bg-white border-gray-300 hover:border-blue-400 shadow-sm' 
      : 'glass-card border-white/20 hover:border-red-500/50 bg-white/5',
    
    // Icons
    iconPrimary: isLight ? 'text-gray-800' : 'text-white',
    iconSecondary: isLight ? 'text-gray-600' : 'text-gray-300',
    iconAccent: isLight ? 'text-blue-700' : 'text-blue-400',
  };

  return {
    theme,
    isLight,
    isDark,
    toggleTheme,
    setTheme,
    themeClasses,
  };
};
