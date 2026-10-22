import { Link } from 'react-router';
import { caminhoDaSala, useIdioma, useTraducao } from '../i18n/idioma';
import { MetaDoPost, TagsDoPost, type ResumoDoPost } from './SalaPosts';

export interface PostCompleto extends ResumoDoPost {
  /** Corpo já convertido e escapado por scripts/markdown.mjs (ADR 0009). */
  html: string;
}

/**
 * Página de leitura de um post (issue 5.3): título, data, tags e o corpo,
 * numa placa escura sobre a biblioteca, com a volta para a lista.
 */
export function PaginaDoPost({ post }: { post: PostCompleto }) {
  const t = useTraducao();
  const lista = caminhoDaSala('posts', useIdioma());
  return (
    <article className="sala pagina-do-post" aria-labelledby="titulo-do-post">
      <p className="voltar">
        <Link to={lista}>← {t('post.voltar')}</Link>
      </p>
      <header className="cabecalho-do-post">
        <h1 id="titulo-do-post">{post.titulo}</h1>
        <MetaDoPost data={post.data} minutos={post.minutos} />
        <TagsDoPost tags={post.tags} />
      </header>
      {/* O HTML vem do conversor do build, que escapa tudo o que o arquivo traz. */}
      <div
        className="corpo-do-post"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
      <footer className="rodape-do-post">
        <Link to={lista}>← {t('post.voltar')}</Link>
      </footer>
    </article>
  );
}
