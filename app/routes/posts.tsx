import { carregarPosts, incluirRascunhos } from '../../scripts/posts.mjs';
import { SalaPosts } from '../componentes/SalaPosts';
import { idiomaDoCaminho } from '../i18n/idioma';
import { metaDaSala } from '../site';
import type { Route } from './+types/posts';

export function meta({ location }: { location: { pathname: string } }) {
  return metaDaSala('posts', location.pathname);
}

// Roda no pré-render (ADR 0009): os posts saem prontos no HTML e no .data da
// rota, e o carregador não entra no JavaScript do visitante.
export function loader({ request }: Route.LoaderArgs) {
  const idioma = idiomaDoCaminho(new URL(request.url).pathname);
  const posts = carregarPosts({ rascunhos: incluirRascunhos() })
    .filter((post) => post.idioma === idioma)
    .map(({ slug, titulo, data, resumo, tags, minutos, caminho }) => ({
      slug,
      titulo,
      data,
      resumo,
      tags,
      minutos,
      caminho,
    }));
  return { posts };
}

export default function Posts({ loaderData }: Route.ComponentProps) {
  return <SalaPosts posts={loaderData.posts} />;
}
