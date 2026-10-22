import type { Config } from '@react-router/dev/config';
import { PAGINAS_404, ROTAS } from './scripts/rotas.mjs';

// Site estático: nada roda no servidor. Cada rota listada em `prerender`
// vira um HTML pronto em build/client, para recrutadores e buscadores
// lerem o conteúdo sem depender de JavaScript.
export default {
  ssr: false,
  prerender: [...ROTAS, PAGINAS_404.pt, PAGINAS_404.en],
} satisfies Config;
