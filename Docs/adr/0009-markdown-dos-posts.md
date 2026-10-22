# ADR 0009: Markdown dos posts com conversor próprio, no build

- **Status:** aceito
- **Data:** 2026-10-22

## Contexto

Os posts ficam em `conteudo/posts/<slug>.<idioma>.md` (ADR 0004 e ADR 0008). O site é pré-renderizado (ADR 0001) e o orçamento é de 150 KB de JavaScript gzip na primeira carga (ADR 0003). A issue 5.1 pede frontmatter validado, HTML seguro (sem HTML bruto vindo do arquivo) e erro legível com o arquivo e o campo. As regras do projeto pedem não criar dependência sem pedido.

## Alternativas consideradas

| Opção                                                   | Pontos a favor                                                                                  | Pontos contra                                                                         |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Conversor próprio em `scripts/markdown.mjs`**         | 0 dependência; escapa tudo por construção; mensagens em português com a linha; roda só no build | Cobre só o subconjunto usado nos posts; tabela e lista aninhada ficam de fora por ora |
| `marked` com sanitização (DOMPurify ou `sanitize-html`) | Markdown completo (GFM)                                                                         | Duas dependências; HTML bruto passa por padrão e a segurança depende da sanitização   |
| `remark` e `rehype` (unified)                           | Extensível, AST, plugins de destaque de código                                                  | Dezenas de pacotes transitivos para o que um post deste site usa                      |

## Decisão

- `scripts/markdown.mjs` converte títulos `##` a `####`, parágrafos, negrito, itálico, código em linha e cercado, links, listas simples (com e sem número), citações, imagens com legenda e linha horizontal. Todo texto é escapado antes da formatação: um `<script>` escrito no post aparece como texto.
- `#` no corpo é erro: o `<h1>` da página vem do `titulo` do frontmatter (a verificação das rotas exige um só `<h1>`).
- Links só com `https://`, `http://`, `mailto:`, `/` ou `#`. Os externos ganham `rel="noopener noreferrer"`.
- Imagens: só o nome do arquivo, guardado em `public/posts/<slug>/` e servido em `/posts/<slug>/`, com texto alternativo obrigatório, até 150 KB, em WebP, PNG ou SVG. A largura e a altura são lidas do arquivo e vão no `<img>`, para a página não pular (CLS).
- `scripts/posts.mjs` lê os arquivos, valida o frontmatter (`titulo`, `data` AAAA-MM-DD, `resumo` e `idioma` obrigatórios; `rascunho` e `tags` opcionais; campo desconhecido é erro), ordena do mais novo ao mais antigo e liga cada post à tradução de mesmo slug.
- Rascunhos aparecem só no `npm run dev` ou com `RASCUNHOS=1`; o build de produção os deixa de fora.
- A conversão roda no `loader` das rotas de posts, executado no pré-render: o HTML sai pronto em `build/client` e o conversor não entra no JavaScript do visitante.

## Consequências

- Um post inválido derruba o `npm run build`, com o arquivo, a linha ou o campo na primeira linha do erro.
- Se um post precisar de tabela, lista aninhada ou destaque de sintaxe, o conversor ganha o recurso com teste, ou um ADR novo troca por uma biblioteca.
- 5.2 a 5.5 (lista, página do post, RSS e sitemap) leem os posts pelo `carregarPosts`.
