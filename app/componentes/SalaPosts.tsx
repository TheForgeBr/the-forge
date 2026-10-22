import { useState, type MouseEvent } from 'react';
import { Link } from 'react-router';
import { formatarData } from '../i18n/datas';
import { caminhoDaSala, useIdioma, useTraducao } from '../i18n/idioma';
import { FEED, urlAbsoluta } from '../site';
import { Runa } from './Runa';

/** O que a lista precisa de cada post; o corpo fica só na página do post. */
export interface ResumoDoPost {
  slug: string;
  titulo: string;
  data: string;
  resumo: string;
  tags: readonly string[];
  minutos: number;
  caminho: string;
}

/**
 * Sala Posts, a biblioteca (issue 5.2, tela aprovada no Stitch): os posts do
 * idioma, do mais novo ao mais antigo, ou o estado vazio com o RSS.
 */
export function SalaPosts({ posts }: { posts: readonly ResumoDoPost[] }) {
  const t = useTraducao();
  return (
    <div className="sala sala-posts">
      <header className="sala-cabecalho">
        <h1>
          <Runa nome="posts" /> {t('sala.posts.titulo')}
        </h1>
        <p>{t('posts.subtitulo')}</p>
      </header>

      {posts.length ? (
        <ol className="lista-de-posts" aria-label={t('posts.lista')}>
          {posts.map((post) => (
            <li key={post.slug}>
              <CartaoDoPost post={post} />
            </li>
          ))}
        </ol>
      ) : (
        <EstadoVazio />
      )}
    </div>
  );
}

/** Data e tempo de leitura, iguais na lista e na página do post. */
export function MetaDoPost({
  data,
  minutos,
}: {
  data: string;
  minutos: number;
}) {
  const t = useTraducao();
  const idioma = useIdioma();
  return (
    <p className="meta-do-post">
      <time dateTime={data}>{formatarData(data, idioma)}</time>
      <span aria-hidden="true"> · </span>
      <span>
        {minutos} {t('posts.leitura')}
      </span>
    </p>
  );
}

export function TagsDoPost({ tags }: { tags: readonly string[] }) {
  const t = useTraducao();
  if (!tags.length) return null;
  return (
    <ul className="stack" aria-label={t('posts.tags')}>
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}

function CartaoDoPost({ post }: { post: ResumoDoPost }) {
  return (
    <article className="cartao-post" aria-labelledby={`post-${post.slug}`}>
      <MetaDoPost data={post.data} minutos={post.minutos} />
      <h2 id={`post-${post.slug}`}>
        <Link to={post.caminho}>{post.titulo}</Link>
      </h2>
      <p className="resumo">{post.resumo}</p>
      <TagsDoPost tags={post.tags} />
    </article>
  );
}

/**
 * O feed é XML para leitores de RSS; aberto no navegador, parece quebrado.
 * O clique copia o endereço e avisa; sem área de transferência (ou sem
 * JavaScript), o link abre o feed como um link comum.
 */
function BotaoDoFeed({ aoCopiar }: { aoCopiar: () => void }) {
  const t = useTraducao();
  const idioma = useIdioma();
  const endereco = urlAbsoluta(FEED[idioma]);
  const copiar = (evento: MouseEvent<HTMLAnchorElement>) => {
    const area = navigator.clipboard;
    if (!area?.writeText) return;
    evento.preventDefault();
    area.writeText(endereco).then(aoCopiar, () => {
      window.location.href = FEED[idioma];
    });
  };
  return (
    <a
      className="botao"
      href={FEED[idioma]}
      type="application/rss+xml"
      onClick={copiar}
    >
      {t('posts.rss')}
    </a>
  );
}

function EstadoVazio() {
  const t = useTraducao();
  const idioma = useIdioma();
  const [copiado, setCopiado] = useState(false);
  return (
    <section className="posts-vazio" aria-labelledby="posts-vazio">
      <svg
        className="pergaminho"
        viewBox="0 0 64 64"
        width="64"
        height="64"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <path
          d="M16 14a4 4 0 0 1 4-4h26a4 4 0 0 1 4 4v32a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4Z"
          stroke="var(--cor-ouro-forja)"
        />
        <path d="M12 18v30a4 4 0 0 0 4 4h28" stroke="var(--cor-cinza-brasa)" />
        <path d="M24 24h18M24 30h14M24 36h8" stroke="var(--cor-cinza-brasa)" />
        <path d="m38 34 6 6m0-6-6 6" stroke="var(--cor-magia)" />
      </svg>
      <h2 id="posts-vazio">{t('posts.vazio.titulo')}</h2>
      <p>{t('posts.vazio.texto')}</p>
      <div className="chamadas">
        <BotaoDoFeed aoCopiar={() => setCopiado(true)} />
        <Link
          className="botao botao-secundario"
          to={caminhoDaSala('home', idioma)}
        >
          {t('posts.voltarHome')}
        </Link>
      </div>
      <p className="aviso-do-feed" role="status">
        {copiado &&
          `${t('posts.rss.copiado')}: ${urlAbsoluta(FEED[idioma])}. ${t('posts.rss.cole')}`}
      </p>
    </section>
  );
}
