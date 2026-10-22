import cinzel700 from '@fontsource/cinzel/files/cinzel-latin-700-normal.woff2?url';
import sourceSans400 from '@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff2?url';

// Pré-carregadas: o texto principal e o título da Home, que entram no LCP.
// As outras fontes carregam quando o CSS pede, com font-display: swap.
export const FONTES_PRE_CARREGADAS = [sourceSans400, cinzel700];

export function linksDasFontes() {
  return FONTES_PRE_CARREGADAS.map((href) => ({
    rel: 'preload',
    href,
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous' as const,
  }));
}
