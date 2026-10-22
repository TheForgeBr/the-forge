import type { Config } from '@react-router/dev/config';
import { caminhosDosPosts, incluirRascunhos } from './scripts/posts.mjs';
import { PAGINAS_404, ROTAS } from './scripts/rotas.mjs';

// Site estático: nada roda no servidor. Cada rota listada em `prerender`
// vira um HTML pronto em build/client, para recrutadores e buscadores
// lerem o conteúdo sem depender de JavaScript.
export default {
  ssr: false,
  // Os posts entram pelo carregador (ADR 0009): um post inválido derruba o build.
  prerender: [
    ...ROTAS,
    PAGINAS_404.pt,
    PAGINAS_404.en,
    ...caminhosDosPosts({ rascunhos: incluirRascunhos() }),
  ],
} satisfies Config;
