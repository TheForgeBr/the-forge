import { type RouteConfig, index, route } from '@react-router/dev/routes';
import { carregarPosts, incluirRascunhos } from '../scripts/posts.mjs';
import { SALAS } from '../scripts/rotas.mjs';

// Cada sala tem um arquivo e duas rotas, uma por idioma (ADR 0008).
const salas = SALAS.flatMap(({ sala, pt, en }) => {
  const arquivo = `routes/${sala}.tsx`;
  return [
    pt === '/'
      ? index(arquivo, { id: `${sala}-pt` })
      : route(pt.slice(1), arquivo, { id: `${sala}-pt` }),
    route(en.slice(1), arquivo, { id: `${sala}-en` }),
  ];
});

// Uma rota por post (issue 5.3), em vez de posts/:slug: um slug que não
// existe cai na 404 abaixo, também no navegador, sem buscar dados que não
// existem. Post novo no `npm run dev` pede reiniciar o servidor.
const posts = carregarPosts({ rascunhos: incluirRascunhos() }).map((post) =>
  route(post.caminho.slice(1), 'routes/post.tsx', {
    id: `post-${post.idioma}-${post.slug}`,
  }),
);

export default [
  ...salas,
  ...posts,
  // Qualquer outro endereço: a 404 (issue 4.6), com /en/* antes do geral.
  route('en/*', 'routes/nao-encontrada.tsx', { id: '404-en' }),
  route('*', 'routes/nao-encontrada.tsx', { id: '404-pt' }),
] satisfies RouteConfig;
