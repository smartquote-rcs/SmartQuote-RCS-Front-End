# Configuração da Imagem Padrão de Produtos

## Instruções para substituir a imagem padrão

1. **Salve sua imagem** na pasta `public/` com o nome `default-product.jpg`

2. **Características recomendadas da imagem:**
   - **Formato**: JPG ou PNG
   - **Tamanho**: 400x300 pixels (proporção 4:3)
   - **Peso**: Máximo 500KB para carregamento rápido
   - **Qualidade**: Imagem clara e profissional

3. **A imagem será usada automaticamente** quando:
   - Um produto não tiver imagem cadastrada
   - A imagem original falhar ao carregar
   - Houver erro no carregamento da imagem

## Locais onde a imagem padrão aparece:

- ✅ **Página de Pesquisa de Produtos** (`ProductSearchPage.tsx`)
- ✅ **Dashboard do Usuário** - Seção de favoritos (`UserDashboard.tsx`)  
- ✅ **Página de Detalhes do Processo** (`ProcessDetailsPage.tsx`)

## Alterações realizadas:

### 1. ProductSearchPage.tsx
```tsx
// ANTES
src={produto.image_url || "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop"}

// DEPOIS  
src={produto.image_url || "/default-product.jpg"}
```

### 2. UserDashboard.tsx
```tsx
// ANTES
src={produto.image_url || ''} 

// DEPOIS
src={produto.image_url || '/default-product.jpg'}
```

### 3. ProcessDetailsPage.tsx
```tsx
// ANTES
{produto.image_url && (
  <img src={produto.image_url} onError={(e) => e.currentTarget.style.display = 'none'} />
)}

// DEPOIS
<img 
  src={produto.image_url || '/default-product.jpg'} 
  onError={(e) => e.currentTarget.src = '/default-product.jpg'} 
/>
```

## Como testar:

1. Salve a imagem como `/public/default-product.jpg`
2. Reinicie o servidor de desenvolvimento
3. Vá para a página de produtos
4. Produtos sem imagem mostrarão sua nova imagem padrão

## Exemplo de imagem ideal:

A imagem fornecida (técnico trabalhando em equipamentos) é perfeita pois:
- ✅ Representa trabalho técnico/industrial
- ✅ É neutra e profissional  
- ✅ Funciona bem em diferentes tamanhos
- ✅ Não compromete a identidade visual
