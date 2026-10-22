# ADR 0001: React Router v7 como SPA pré-renderizada

- **Status:** aceito
- **Data:** 2026-10-21

## Contexto

O site é estático, em React, para recrutadores. A navegação entre as salas da forja precisa ser contínua, sem cortes: a cena não pode recarregar na troca de página. Cada página precisa de endereço próprio e de um HTML com conteúdo real, para quem abre o link e para os buscadores.

## Alternativas consideradas

| Opção                                       | Pontos a favor                                                    | Pontos contra                                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Vite + React Router v7, modo framework**  | A cena nunca desmonta em nenhum navegador; HTML por rota no build | Mais JavaScript que o Astro: React e o roteador hidratam                                      |
| Astro + View Transitions com ilhas de React | Menos JavaScript; HTML puro                                       | Cena e conteúdo ficam em mundos separados; a transição entre documentos não existe no Firefox |
| Next.js com `output: export`                | Ecossistema grande                                                | Sem animação de saída nativa no App Router; mais peso; limitações do export                   |
| React Router v8                             | Versão mais nova                                                  | Exige Node 22.22; a máquina de desenvolvimento usa o 22.19                                    |

## Decisão

- **Vite + React Router v7** em modo framework, com `ssr: false` e `prerender` de todas as rotas, inclusive cada post.
- A lista de rotas fica só em `scripts/rotas.mjs`; o `react-router.config.ts` pré-renderiza a partir dela e `scripts/verificar-rotas.mjs` confere o HTML de cada uma.
- Saída em `build/client`. Nada roda em servidor.
- A v8 entra quando o Node da máquina for atualizado para 22.22 ou mais, com um ADR que substitua este.

## Consequências

- Cada rota tem um `index.html` com título, descrição e conteúdo, lido sem JavaScript.
- A navegação depois da primeira carga é feita pelo roteador no cliente, o que permite a cena persistente (ADR 0002).
- O orçamento de JavaScript (ADR 0003) precisa contar React e o roteador.
