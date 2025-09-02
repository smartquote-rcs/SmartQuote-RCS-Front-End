/**
 * Processa URLs de imagem para usar proxy quando necessário
 * @param imageUrl - URL original da imagem
 * @param width - Largura desejada (opcional)
 * @param height - Altura desejada (opcional)
 * @param fit - Modo de ajuste: 'cover', 'contain', 'fill' (opcional)
 * @returns URL processada com proxy se necessário, ou imagem padrão
 */
export const processImageUrl = (
  imageUrl?: string | null, 
  width?: number, 
  height?: number, 
  fit: 'cover' | 'contain' | 'fill' = 'cover'
): string => {
  // Se não há URL, usar imagem padrão
  if (!imageUrl || imageUrl.trim() === '') {
    return '/default-product.jpg';
  }

  // Se é uma URL local (começa com / ou não tem protocolo), usar diretamente
  if (imageUrl.startsWith('/') || (!imageUrl.startsWith('http'))) {
    return imageUrl;
  }

  // Se é uma URL externa, usar proxy weserv.nl
  try {
    // Remove o protocolo da URL para o proxy
    const cleanUrl = imageUrl.replace(/^https?:\/\//, '');
    
    // Constrói a URL do proxy
    let proxyUrl = `https://images.weserv.nl/?url=${cleanUrl}`;
    
    // Adiciona parâmetros de redimensionamento se fornecidos
    if (width) proxyUrl += `&w=${width}`;
    if (height) proxyUrl += `&h=${height}`;
    if (fit) proxyUrl += `&fit=${fit}`;
    
    return proxyUrl;
  } catch (error) {
    // Se a URL é inválida, usar imagem padrão
    console.warn('URL de imagem inválida:', imageUrl);
    return '/default-product.jpg';
  }
};

/**
 * Handler para erro de carregamento de imagem
 * Define a imagem padrão quando há falha no carregamento
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget;
  if (img.src !== '/default-product.jpg') {
    img.src = '/default-product.jpg';
  }
};

/**
 * Verifica se uma URL é externa (precisa de proxy)
 */
export const isExternalUrl = (url?: string | null): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};
