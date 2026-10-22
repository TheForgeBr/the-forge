# ADR 0008: Português e inglês

- **Status:** aceito
- **Data:** 2026-10-21

## Contexto

O site sai em português do Brasil e em inglês já na v1: recrutadores brasileiros e de fora. Como o site é pré-renderizado (ADR 0001), cada idioma precisa de HTML próprio, lido sem JavaScript e indexado pelos buscadores. O orçamento de JavaScript é de 150 KB gzip (ADR 0003).

## Alternativas consideradas

**URLs**

| Opção                                                          | Pontos a favor                                                              | Pontos contra                                                        |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Português na raiz, inglês em `/en/` com caminhos em inglês** | URLs naturais nos dois idiomas; o português, público principal, sem prefixo | Precisa de um mapa de rotas por idioma                               |
| Prefixo nos dois (`/pt/...` e `/en/...`)                       | Simétrico                                                                   | A raiz `/` precisaria redirecionar, o que quebra o pré-render        |
| Rota única com troca de idioma no cliente                      | Mais simples                                                                | Um só HTML por rota: buscadores e quem abre sem JS veem um idioma só |

**Textos**

| Opção                                | Pontos a favor                                    | Pontos contra                                       |
| ------------------------------------ | ------------------------------------------------- | --------------------------------------------------- |
| **Dicionário próprio em TypeScript** | 0 KB de biblioteca; chaves verificadas pelo `tsc` | Sem plural e formatação prontos (pouco usados aqui) |
| i18next com react-i18next            | Completo                                          | Cerca de 15 a 20 KB gzip a mais no orçamento        |

## Decisão

- **URLs:** português na raiz (`/`, `/projetos`, `/experiencias`, `/sobre`, `/posts`, `/contato`) e inglês em `/en` (`/en`, `/en/projects`, `/en/experience`, `/en/about`, `/en/posts`, `/en/contact`). O par de cada rota fica em `scripts/rotas.mjs`, a mesma lista que o pré-render usa.
- **Idioma padrão:** português. A primeira visita não redireciona. Se o navegador estiver em inglês, aparece um aviso discreto "Read in English" com o link para a mesma sala em `/en`. A escolha fica guardada no navegador e o aviso não volta.
- **Seletor:** PT | EN na navegação, levando para a mesma sala no outro idioma.
- **`<html lang>`:** `pt-BR` ou `en`, conforme a rota, no HTML pré-renderizado.
- **`hreflang`:** cada página aponta para a versão no outro idioma, com `x-default` no português.
- **Textos de interface:** dicionário em `app/i18n/` (`pt.ts` e `en.ts`), com o mesmo tipo, para o `tsc` acusar chave faltando.
- **Conteúdo:** projetos, experiências e skills têm os campos de texto nos dois idiomas no mesmo objeto (`{ pt, en }`). Posts são arquivos separados por idioma (`slug.pt.md` e `slug.en.md`).
- **Post em um idioma só:** aparece apenas na lista do seu idioma. Não ganha `hreflang` nem link de troca de idioma; o seletor leva para a lista de posts do outro idioma.

## Consequências

- 2.1: os tipos do conteúdo têm os textos nos dois idiomas.
- 3.1: a infraestrutura de rotas por idioma, dicionário e seletor segue esta decisão.
- 3.8: metadados por idioma, com `hreflang`.
- 5.1 a 5.5: posts por idioma; RSS e sitemap separam os idiomas.
- 8.1: o Lighthouse é medido nas duas versões da Home.
