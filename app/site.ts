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

/** Imagem de reserva para compartilhar qualquer sala (gerada por npm run logo). */
export const IMAGEM_OG = {
  caminho: '/og/padrao.png',
  largura: 1200,
  altura: 630,
};

const LOCALE_OG: Record<Idioma, string> = { pt: 'pt_BR', en: 'en_US' };

/** Feed RSS dos posts do idioma (issue 5.4), anunciado em toda página. */
export const FEED: Record<Idioma, string> = {
  pt: '/rss.xml',
  en: '/en/rss.xml',
};

export function linkDoFeed(idioma: Idioma) {
  return {
    tagName: 'link',
    rel: 'alternate',
    type: 'application/rss+xml',
    title: `${traduzir(idioma, 'sala.posts.titulo')} | ${traduzir(idioma, 'site.nome')}`,
    href: urlAbsoluta(FEED[idioma]),
  };
}

/**
 * Metadados de uma sala no idioma da rota: título, descrição, canônica,
 * hreflang, Open Graph e Twitter (issues 3.1 e 3.8).
 */
export function metaDaSala(sala: NomeDaSala, caminho: string) {
  const idioma = idiomaDoCaminho(caminho);
  const nome = traduzir(idioma, 'site.nome');
  const titulo =
    sala === 'home'
      ? nome
      : `${traduzir(idioma, `sala.${sala}.titulo`)} | ${nome}`;
  const descricao = traduzir(idioma, `sala.${sala}.descricao`);
  const canonica = urlAbsoluta(caminhoDaSala(sala, idioma));
  const imagem = urlAbsoluta(IMAGEM_OG.caminho);
  const alternativo = (lang: Idioma | 'x-default') => ({
    tagName: 'link',
    rel: 'alternate',
    hrefLang: lang === 'x-default' ? lang : LANG[lang],
    href: urlAbsoluta(caminhoDaSala(sala, lang === 'x-default' ? 'pt' : lang)),
  });
  const og = (property: string, content: string) => ({ property, content });
  return [
    { title: titulo },
    { name: 'description', content: descricao },
    { tagName: 'link', rel: 'canonical', href: canonica },
    alternativo('pt'),
    alternativo('en'),
    alternativo('x-default'),
    linkDoFeed(idioma),
    og('og:type', 'website'),
    og('og:site_name', nome),
    og('og:title', titulo),
    og('og:description', descricao),
    og('og:url', canonica),
    og('og:locale', LOCALE_OG[idioma]),
    og('og:locale:alternate', LOCALE_OG[idioma === 'pt' ? 'en' : 'pt']),
    og('og:image', imagem),
    og('og:image:width', String(IMAGEM_OG.largura)),
    og('og:image:height', String(IMAGEM_OG.altura)),
    og('og:image:alt', nome),
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: titulo },
    { name: 'twitter:description', content: descricao },
    { name: 'twitter:image', content: imagem },
  ];
}

interface PostParaMeta {
  titulo: string;
  resumo: string;
  data: string;
  tags: readonly string[];
  caminho: string;
}

/**
 * Metadados de um post (issue 5.3): como os da sala, com `og:type=article`
 * e a data de publicação. O hreflang só aparece quando há tradução (ADR 0008).
 */
export function metaDoPost(post: PostParaMeta, traducao?: string) {
  const idioma = idiomaDoCaminho(post.caminho);
  const nome = traduzir(idioma, 'site.nome');
  const titulo = `${post.titulo} | ${nome}`;
  const canonica = urlAbsoluta(post.caminho);
  const imagem = urlAbsoluta(IMAGEM_OG.caminho);
  const og = (property: string, content: string) => ({ property, content });
  const caminhos: Partial<Record<Idioma, string>> = { [idioma]: post.caminho };
  if (traducao) caminhos[idioma === 'pt' ? 'en' : 'pt'] = traducao;
  const alternativos = traducao
    ? (['pt', 'en', 'x-default'] as const).map((lang) => ({
        tagName: 'link',
        rel: 'alternate',
        hrefLang: lang === 'x-default' ? lang : LANG[lang],
        href: urlAbsoluta(caminhos[lang === 'x-default' ? 'pt' : lang] ?? ''),
      }))
    : [];
  return [
    { title: titulo },
    { name: 'description', content: post.resumo },
    { tagName: 'link', rel: 'canonical', href: canonica },
    ...alternativos,
    linkDoFeed(idioma),
    og('og:type', 'article'),
    og('og:site_name', nome),
    og('og:title', titulo),
    og('og:description', post.resumo),
    og('og:url', canonica),
    og('og:locale', LOCALE_OG[idioma]),
    og('og:image', imagem),
    og('og:image:width', String(IMAGEM_OG.largura)),
    og('og:image:height', String(IMAGEM_OG.altura)),
    og('og:image:alt', nome),
    og('article:published_time', post.data),
    ...post.tags.map((tag) => og('article:tag', tag)),
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: titulo },
    { name: 'twitter:description', content: post.resumo },
    { name: 'twitter:image', content: imagem },
  ];
}
