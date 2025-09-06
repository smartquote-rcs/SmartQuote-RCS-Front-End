/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'vite' {
  export function defineConfig(config: any): any;
}

declare module '@vitejs/plugin-react' {
  function react(options?: any): any;
  export = react;
}

// Garantir que React está disponível globalmente
declare global {
  const React: typeof import('react');
}
