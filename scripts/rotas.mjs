// Lista única das salas do site, com o caminho em cada idioma (ADR 0008):
// o routes.ts monta as rotas daqui, o react-router.config.ts pré-renderiza
// ROTAS e o verificar-rotas.mjs confere o HTML de cada uma.
export const SALAS = [
  { sala: 'home', pt: '/', en: '/en' },
  { sala: 'projetos', pt: '/projetos', en: '/en/projects' },
  { sala: 'experiencias', pt: '/experiencias', en: '/en/experience' },
  { sala: 'sobre', pt: '/sobre', en: '/en/about' },
  { sala: 'posts', pt: '/posts', en: '/en/posts' },
  { sala: 'contato', pt: '/contato', en: '/en/contact' },
];

export const ROTAS = SALAS.flatMap(({ pt, en }) => [pt, en]);
