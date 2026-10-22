import type { NomeDaSala } from '../scripts/rotas.mjs';
import type { Idioma } from './conteudo/tipos';
import { caminhoDaSala, idiomaDoCaminho, LANG, traduzir } from './i18n/idioma';

/** Endereço público do site; no build, vem de VITE_URL_BASE. */
export const URL_BASE = (
  import.meta.env.VITE_URL_BASE ?? 'https://the-forge-96d7.onrender.com'
).replace(/\/+$/, '');

export function urlAbsoluta(caminho: string) {
  return `${URL_BASE}${caminho === '/' ? '/' : caminho}`;
}

/** Título, descrição e os links hreflang de uma sala no idioma da rota. */
export function metaDaSala(sala: NomeDaSala, caminho: string) {
  const idioma = idiomaDoCaminho(caminho);
  const nome = traduzir(idioma, 'site.nome');
  const titulo =
    sala === 'home'
      ? nome
      : `${traduzir(idioma, `sala.${sala}.titulo`)} | ${nome}`;
  const alternativo = (lang: Idioma | 'x-default') => ({
    tagName: 'link',
    rel: 'alternate',
    hrefLang: lang === 'x-default' ? lang : LANG[lang],
    href: urlAbsoluta(caminhoDaSala(sala, lang === 'x-default' ? 'pt' : lang)),
  });
  return [
    { title: titulo },
    {
      name: 'description',
      content: traduzir(idioma, `sala.${sala}.descricao`),
    },
    alternativo('pt'),
    alternativo('en'),
    alternativo('x-default'),
  ];
}
