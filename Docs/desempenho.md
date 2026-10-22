# Desempenho

Medições do orçamento do ADR 0003 (issue 6.5): menos de 150 KB de JavaScript gzip na primeira carga, LCP abaixo de 2,5 s em 4G e Lighthouse acima de 90 no celular.

## 2026-10-22, commit 77b5516

Lighthouse 13.5.0 (rodado pelo `npx`, sem entrar no `package.json`), perfil de celular com 4G simulado (RTT de 150 ms, 1,6 Mbps, CPU 4x mais lenta), no site publicado em https://the-forge-96d7.onrender.com.

| Sala          | Desempenho | Acessibilidade | Boas práticas | SEO | FCP (s) | LCP (s) | TBT (ms) | CLS   | Total (KB) | JS (KB) | Imagens (KB) | Fontes (KB) |
| ------------- | ---------- | -------------- | ------------- | --- | ------- | ------- | -------- | ----- | ---------- | ------- | ------------ | ----------- |
| Home          | 97         | 100            | 100           | 100 | 1,83    | 2,28    | 0        | 0,000 | 285        | 133,6   | 58,8         | 82,2        |
| Projetos      | 97         | 100            | 100           | 100 | 1,83    | 1,98    | 0        | 0,064 | 304        | 128,2   | 81,6         | 82,2        |
| Experiências  | 98         | 100            | 100           | 100 | 1,82    | 1,97    | 0        | 0,021 | 291        | 127,7   | 68,7         | 82,2        |
| Sobre         | 96         | 100            | 100           | 100 | 1,88    | 2,33    | 0        | 0,034 | 283        | 126,7   | 62,6         | 82,2        |
| Posts         | 99         | 100            | 100           | 100 | 1,67    | 1,82    | 0        | 0,000 | 274        | 124,0   | 78,8         | 61,2        |
| Contato       | 98         | 100            | 100           | 100 | 1,82    | 1,97    | 0        | 0,013 | 311        | 124,6   | 93,8         | 82,2        |
| Home em `/en` | 97         | 100            | 100           | 100 | 1,82    | 2,27    | 0        | 0,002 | 285        | 133,6   | 58,8         | 82,2        |

- A Home foi medida quatro vezes. A primeira deu LCP de 2,54 s (provavelmente o cache do Render ainda frio); as três seguintes deram 2,27 s, 2,28 s e 2,27 s. A tabela traz a mediana.
- O JS da tabela é o que o Lighthouse transfere (com cabeçalhos e a compressão do Render). O `npm run orcamento` mede o gzip da primeira carga da Home no build: 127,8 KB de 150 KB.
- Cada imagem de ambiente tem no máximo 150 KB (teste em `app/cena/ambientes.test.tsx`); só a da sala de entrada é baixada na carga.

## O que a medição mudou

A primeira rodada deu desempenho 82 na Home, por um CLS de 0,34: o menu do celular saía aberto no pré-render (para quem lê sem JavaScript) e fechava na hidratação, e a página subia. O script do `<head>` passou a marcar o `<html>` com `data-js` antes da primeira pintura, e com essa marca o menu já começa fechado. O aviso de idioma, que também só aparece depois da hidratação, virou uma barra fixa no pé da tela. No build local, o CLS foi de 0,338 para 0,002 (commit 77b5516).

## Ainda manual

- Uso de CPU em repouso e a fluidez num celular real: estão no Guia de Testes (itens das faíscas, do fogo da Home e da tela de carregamento), porque a aba automatizada roda em segundo plano e o Chrome a limita.
