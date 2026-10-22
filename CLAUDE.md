# The Forge BR — instruções para agentes

Site pessoal de Rhuan Marques, para recrutadores e para quem quer conhecer o trabalho dele. O visitante caminha por uma forja mágica: cada página é uma sala, e a troca de página move a câmera dentro de uma cena que nunca recarrega. Site estático, em português e inglês, publicado no Render.

```text
scripts/rotas.mjs -> React Router v7 (ssr:false + prerender) -> build/client (HTML por rota) -> Render Static Site
```

O plano completo está em https://claude.ai/artifact/Bws6bWEvc1nJb1wEu9sg9n.

## Mapa do repositório

```text
app/root.tsx          layout raiz (a CenaForja vai morar aqui; ADR 0002)
app/routes.ts         rotas do React Router, montadas de SALAS (cada sala em pt e en)
app/routes/           um arquivo por sala: home, projetos, experiencias, sobre, posts, contato
app/i18n/             pt.ts e en.ts (textos de interface) e idioma.ts (traduzir, caminhos por idioma)
app/componentes/      SeletorDeIdioma, AvisoDeIdioma, Sala e Runa (SVGs de marca/runas, cor por currentColor)
app/site.ts           URL_BASE (VITE_URL_BASE no build) e metaDaSala (título, descrição, hreflang)
app/cena/             CenaForja, câmera e canvas de partículas
app/conteudo/         projetos.ts, experiencias.ts, skills.ts (dados tipados, pt e en); tipos.ts e validar.ts
app/estilos/          tokens.css (gerado de marca/tokens.json; não edite à mão)
conteudo/posts/       posts em Markdown, um arquivo por idioma
marca/                tokens.json (fonte única de cores e fontes), logo gerado por npm run logo, runas/ (24 x 24)
scripts/rotas.mjs     SALAS com o caminho em pt e en: rotas, pré-render e verificação leem daqui
scripts/              verificar-rotas.mjs, geradores (tokens, cartões, RSS), sincronização de issues
public/curriculo/     PDF do currículo, publicado pelo Memento (ADR 0005)
Docs/adr/             decisões de arquitetura; leia antes de mudar a estrutura
Docs/ISSUES.json      texto das issues, sincronizado com o GitHub
Docs/testes/          Guia de Testes manuais
```

## Comandos

Node 22.12 ou superior (a máquina principal usa o 22.19; ver `.nvmrc`).

```bash
npm run dev              # servidor de desenvolvimento
npm run build            # gera build/client com o HTML de cada rota
npm test                 # Vitest
npm run verificar:rotas  # confere lang, <title> e <h1> no HTML de cada rota (depois do build)
npm run tokens           # gera app/estilos/tokens.css a partir de marca/tokens.json
npm run verificar:tokens # falha se o tokens.css estiver desatualizado em relação ao JSON
npm run logo             # gera logo, símbolo e favicon em SVG (letreiro em curvas, cores dos tokens)
npm run verificar:logo   # falha se algum SVG do logo estiver desatualizado
npm run verificar:fontes # confere pesos e subconjunto das fontes no build e mostra o peso em KB
npm run orcamento        # soma o JS gzip da primeira carga da Home e falha acima de marca/orcamento.json
npm run check            # formato, lint, tipos, testes, tokens, build e verificação das rotas; rode antes de cada commit
npm run format           # aplica o Prettier
node scripts/sync-issues.mjs [--dry-run]  # cria ou atualiza as issues do GitHub a partir de Docs/ISSUES.json
```

O Guia de Testes manuais fica em `Docs/testes/funcionalidades.json`. Toda mudança que o usuário consegue ver ou testar acrescenta ou atualiza um item nele, com a issue, os passos, o esperado e o que anotar se falhar.

## Decisões que não devem ser revertidas sem pedido

- React Router v7 em modo framework, `ssr: false` e pré-render de todas as rotas (ADR 0001).
- A cena fica montada no layout raiz e nunca desmonta entre rotas; links são `<a>` reais (ADR 0002).
- Motion para transições e canvas 2D próprio para partículas e fogo; `prefers-reduced-motion` obrigatório (ADR 0003).
- Orçamento: menos de 150 KB de JavaScript gzip na primeira carga, LCP abaixo de 2,5 s em 4G, Lighthouse acima de 90 no celular (ADR 0003). O limite fica em `marca/orcamento.json` e o `npm run orcamento` confere. Em 2026-10-21 a Home carrega 110,1 KB em 7 arquivos (React e React Router são quase tudo).
- Sem backend na v1; conteúdo em TypeScript e Markdown no repositório (ADR 0004).
- Cores e fontes só a partir de `marca/tokens.json` (ADR 0006).
- Fontes pelo `@fontsource`, só subconjunto latino: Cinzel 600/700, Source Sans 3 400/600, JetBrains Mono 400. No build de 2026-10-21 os 5 woff2 somam 81,0 KB; só Source Sans 3 400 e Cinzel 700 são pré-carregadas (30,2 KB). Peso novo entra em `base.css` e em `scripts/verificar-fontes.mjs`.
- A lista de rotas fica só em `scripts/rotas.mjs`.

## Definição de pronto

- Há um teste que falha sem a mudança e passa com ela.
- `npm run check` passa.
- Mudança arquitetural tem ADR, e o CLAUDE.md é atualizado no mesmo commit.
- O Guia de Testes (`Docs/testes/`) foi atualizado para mudanças que o usuário consegue ver.
- O orçamento de desempenho continua respeitado.
- Toda animação tem o caminho de `prefers-reduced-motion` tratado e testado.
- A issue de uma sala só começa com a tela do Stitch aprovada pelo usuário.

## Regras de trabalho

- Um commit por assunto, em português, no formato `tipo(escopo): descrição`, citando a issue (`Closes #N`).
- Tarefas de cerca de 40 minutos; sessões de até 2h30.
- Não crie dependências sem pedido. Ao instalar, use versões publicadas há pelo menos duas semanas (`npm install --before=AAAA-MM-DD`).
- Nada de conteúdo privado do vault do Memento no repositório. Ficam fora: notas privadas, o trabalho de tester freelancer de 2025 e o projeto Automations. Na SETA-AI, só papel e stack.
- Imagens do Dribbble e do jogo Shadow of Mordor são só referência; não entram no site.
- Não marque como feito o que não foi verificado; todo resumo de conclusão cita o comando rodado e a saída.
