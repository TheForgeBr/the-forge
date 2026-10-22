import { type RouteConfig, index, route } from '@react-router/dev/routes';
import { SALAS } from '../scripts/rotas.mjs';

// Cada sala tem um arquivo e duas rotas, uma por idioma (ADR 0008).
export default SALAS.flatMap(({ sala, pt, en }) => {
  const arquivo = `routes/${sala}.tsx`;
  return [
    pt === '/'
      ? index(arquivo, { id: `${sala}-pt` })
      : route(pt.slice(1), arquivo, { id: `${sala}-pt` }),
    route(en.slice(1), arquivo, { id: `${sala}-en` }),
  ];
}).concat([
  // Qualquer outro endereço: a 404 (issue 4.6), com /en/* antes do geral.
  route('en/*', 'routes/nao-encontrada.tsx', { id: '404-en' }),
  route('*', 'routes/nao-encontrada.tsx', { id: '404-pt' }),
]) satisfies RouteConfig;
