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
}) satisfies RouteConfig;
