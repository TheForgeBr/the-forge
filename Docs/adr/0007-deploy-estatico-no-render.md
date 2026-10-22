# ADR 0007: Deploy estático no Render

- **Status:** aceito
- **Data:** 2026-10-21

## Contexto

O site é só arquivos estáticos (ADR 0001). O deploy precisa ser grátis, automático e não pode "dormir": o serviço web grátis do Render desliga sem acesso e demora para acordar, e um recrutador esperaria quase um minuto.

## Alternativas consideradas

| Opção                     | Pontos a favor                                         | Pontos contra                                |
| ------------------------- | ------------------------------------------------------ | -------------------------------------------- |
| **Render Static Site**    | Grátis, não dorme, deploy no push; plano pede o Render | Domínio grátis em `*.onrender.com`           |
| Render Web Service (Node) | Permitiria servidor                                    | Dorme no plano grátis; sem necessidade na v1 |
| Netlify                   | Grátis e simples                                       | Onde está o site antigo, que sai do ar       |
| GitHub Pages              | Grátis, junto do repositório                           | Rewrite para 404 e SPA menos flexível        |

## Decisão

- **Static Site do Render**, no plano grátis, em `*.onrender.com` no começo; domínio próprio fica para depois.
- Build: `npm ci && npm run build`. Pasta publicada: `build/client`.
- Regra de rewrite de `/*` para `/__spa-fallback.html`: rotas sem arquivo mostram a página de erro do site. A configuração fica em `render.yaml` e em `Docs/deploy.md`.
- Deploy automático a cada push na `main`.

## Consequências

- Uma rota inexistente mostra a página de erro do site, mas o Render responde com status 200, não 404: o rewrite de Static Site não permite escolher o status. Buscadores podem indexar essas URLs; o sitemap (issue 5.5) lista só as rotas reais.
- Não há servidor para manter.
- Trocar para domínio próprio é configuração no Render e no registro do domínio, sem mudar o código.
