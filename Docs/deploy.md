# Deploy

O site é publicado como Static Site no Render, no plano grátis (ADR 0007). A configuração está em `render.yaml`, na raiz.

## Criar o serviço (uma vez)

1. Entre no [painel do Render](https://dashboard.render.com) com a conta do GitHub.
2. **New › Blueprint** e escolha o repositório `TheForgeBr/the-forge`. Se ele não aparecer, autorize o Render na organização TheForgeBr.
3. Confira os valores que o Render leu do `render.yaml` e confirme.

## Valores

| Campo           | Valor                                   |
| --------------- | --------------------------------------- |
| Tipo            | Static Site                             |
| Branch          | `main`, deploy automático a cada commit |
| Build           | `npm ci && npm run build`               |
| Pasta publicada | `build/client`                          |
| Node            | 22.19.0 (`NODE_VERSION`)                |
| Rewrite         | `/*` para `/__spa-fallback.html`        |
| URL             | _a preencher depois do primeiro deploy_ |

## Rotas inexistentes

Arquivos pré-renderizados têm prioridade. Uma rota sem arquivo cai no `__spa-fallback.html`, e o React Router mostra a página de erro do site. O Render responde com status 200 nesse caso, não 404 (limitação registrada no ADR 0007).
