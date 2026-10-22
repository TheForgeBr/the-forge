import type { Config } from '@react-router/dev/config';

// Site estático: nada roda no servidor. Cada rota listada em `prerender`
// vira um HTML pronto em build/client, para recrutadores e buscadores
// lerem o conteúdo sem depender de JavaScript.
export default {
  ssr: false,
  prerender: ['/'],
} satisfies Config;
