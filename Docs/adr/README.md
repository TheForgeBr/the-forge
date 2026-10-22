# Registros de decisão de arquitetura (ADRs)

Cada decisão técnica relevante do site é registrada aqui, com contexto, alternativas, decisão e consequências. Se um ADR e outro documento discordarem, vale o ADR.

## Estados

- **Proposto:** rascunho com uma recomendação, aguardando aprovação. A implementação que depende dele não deve começar.
- **Aceito:** decisão vigente.
- **Substituído:** trocado por um ADR mais novo, que o referencia.

## Índice

| ADR                                              | Decisão                                                                         | Estado     |
| ------------------------------------------------ | ------------------------------------------------------------------------------- | ---------- |
| [0001](0001-react-router-spa-pre-renderizada.md) | React Router v7 como SPA pré-renderizada, `ssr: false`                          | **Aceito** |
| [0002](0002-cena-persistente.md)                 | Cena da forja persistente no layout raiz; câmera movida por rota                | **Aceito** |
| [0003](0003-animacao-motion-e-canvas.md)         | Motion e canvas 2D próprio; reduced-motion obrigatório; orçamento de desempenho | **Aceito** |
| [0004](0004-conteudo-no-repositorio.md)          | Conteúdo em TypeScript e Markdown no repositório, sem backend na v1             | **Aceito** |
| [0005](0005-publicacao-do-curriculo.md)          | PDF do currículo publicado pelo `--publicar` do Memento, com link fixo          | **Aceito** |
| [0006](0006-marca-como-fonte-unica.md)           | `marca/tokens.json` gera CSS, badges e SVGs                                     | **Aceito** |
| [0007](0007-deploy-estatico-no-render.md)        | Static Site do Render no plano grátis, deploy no push                           | **Aceito** |
| [0008](0008-i18n-portugues-e-ingles.md)          | Português na raiz e inglês em `/en`; dicionário próprio                         | **Aceito** |
