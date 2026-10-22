import { data, useLoaderData } from 'react-router';
import { carregarPosts, incluirRascunhos } from '../../scripts/posts.mjs';
import { PaginaDoPost } from '../componentes/PaginaDoPost';
import { metaDoPost } from '../site';

// Sem os tipos de ./+types/post: sem post publicado, nenhuma rota usa este
// arquivo e o typegen não os gera.
type DadosDoPost = ReturnType<typeof loader>;

export function meta({ loaderData }: { loaderData?: DadosDoPost }) {
  return loaderData ? metaDoPost(loaderData.post, loaderData.traducao) : [];
}

// Roda no pré-render, uma vez por post (ADR 0009); routes.ts cria uma rota
// por post, então o endereço acha o post. `traducao` no topo serve ao
// seletor de idioma (useCaminhoEquivalente).
export function loader({ request }: { request: Request }) {
  const endereco = new URL(request.url).pathname.replace(/\/+$/, '');
  const post = carregarPosts({ rascunhos: incluirRascunhos() }).find(
    (p) => p.caminho === endereco,
  );
  if (!post) throw data(null, { status: 404 });
  const {
    slug,
    titulo,
    data: dia,
    resumo,
    tags,
    minutos,
    caminho,
    html,
  } = post;
  return {
    post: { slug, titulo, data: dia, resumo, tags, minutos, caminho, html },
    traducao: post.traducao,
  };
}

export default function Post() {
  const { post } = useLoaderData<DadosDoPost>();
  return <PaginaDoPost post={post} />;
}
