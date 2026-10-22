# ADR 0006: Marca como fonte única

- **Status:** aceito
- **Data:** 2026-10-21

## Contexto

A identidade do The Forge aparece no site e também nos READMEs do GitHub (perfil RhuanMr e organização TheForgeBr). O GitHub só aceita Markdown e imagens: sem CSS próprio nem fontes. Cores e logos copiados à mão em vários lugares acabam divergindo.

## Alternativas consideradas

| Opção                                           | Pontos a favor                              | Pontos contra                 |
| ----------------------------------------------- | ------------------------------------------- | ----------------------------- |
| **`marca/tokens.json` gera CSS, badges e SVGs** | Uma mudança de cor chega a todos os lugares | Precisa de scripts de geração |
| Cores e SVGs mantidos à mão                     | Nada a programar                            | Divergem com o tempo          |

## Decisão

- `marca/tokens.json` é a fonte única da paleta e da tipografia.
- Um script gera as variáveis CSS a partir dele; ninguém escreve cor ou fonte à mão no código.
- Logo, runas, banner (claro e escuro) e cartões de projeto ficam em SVG em `marca/`, com texto convertido em desenho, porque o GitHub não carrega fontes.
- Os badges dos READMEs usam as cores dos tokens (ex.: `?color=E8661E&labelColor=1C1613`).

## Consequências

- Os READMEs usam só arquivos gerados a partir de `marca/`.
- Uma cor nova entra primeiro no `tokens.json`.
