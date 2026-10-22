---
titulo: 'Exemplo longo: como uma forja vira um site, do primeiro esboço ao deploy, contado com calma e com todos os detalhes que um título comprido de verdade costuma carregar'
data: 2026-10-22
resumo: Post de teste do tamanho de um artigo do Medium, com seis imagens, títulos de seção, listas, citação, código e um endereço comprido, para ver se a página de leitura aguenta texto longo sem quebrar.
idioma: pt
rascunho: true
tags: [Teste, Layout, React Router, TypeScript, Acessibilidade, Desempenho]
---

Este é o post de teste mais longo, com o tamanho de um artigo comum do Medium: perto de mil e duzentas palavras, seis imagens e quase todos os recursos que um post deste site pode usar. O texto conta, de forma resumida, como o The Forge BR saiu de uma ideia e virou um site no ar. O conteúdo é real o bastante para a leitura fazer sentido, mas o objetivo aqui é outro: ver se a página aguenta um texto comprido sem que nada escape para os lados, sem que as imagens estourem a largura do celular e sem que os títulos, as listas e o código fiquem apertados.

Repare também no título deste post. Ele é longo de propósito, bem mais do que um título razoável deveria ser, para testar a quebra de linha no cabeçalho, no cartão da lista e na aba do navegador.

## A ideia: cada página é uma sala

A proposta do site sempre foi tratar cada página como uma sala de uma forja mágica. Quem visita não troca de página do jeito comum: a câmera anda dentro de uma cena que nunca recarrega. A Home é a bigorna, Projetos é o arsenal, Experiências é o corredor das crônicas, Sobre é a oficina, Posts é a biblioteca e Contato é o portão.

![O corredor das crônicas, com tochas e placas gravadas nas paredes de pedra](corredor.webp 'O corredor das crônicas, a sala Experiências')

Essa ideia tem um custo. Uma cena que nunca recarrega precisa ficar montada no layout raiz, e as rotas precisam ser links reais, para quem chega pelo buscador ou abre o site sem JavaScript ler o conteúdo do mesmo jeito. Por isso a decisão foi usar o React Router em modo framework, com pré-renderização de todas as rotas: cada sala vira um HTML pronto, e a animação entra por cima.

> Uma forja não precisa de pressa. Precisa de calor constante, de uma bigorna firme e de quem saiba a hora de tirar a peça do fogo.

## O orçamento manda

Desde o começo havia um limite claro: menos de 150 KB de JavaScript comprimido na primeira carga, LCP abaixo de 2,5 segundos em 4G e Lighthouse acima de 90 no celular. Esse limite virou um teste. O comando que soma o peso da Home falha o build quando passa do valor, e por isso nenhuma biblioteca entra sem antes ser medida.

Algumas escolhas saíram diretamente desse orçamento:

- O dicionário de idiomas é próprio, em TypeScript, em vez de uma biblioteca de internacionalização que custaria de 15 a 20 KB.
- A câmera usa a versão mínima do Motion, que se apoia na Web Animations API do navegador e custou 3,3 KB.
- As faíscas são um canvas 2D desenhado à mão, carregado só depois que a página já apareceu.
- O Markdown destes posts é convertido no build, por um conversor pequeno, e não chega ao navegador do visitante.

![O portão da forja em formato de celular, com linhas azuis formando árvores e uma estrela](portao-celular.webp 'O portão, sala Contato, em formato de celular')

### Movimento reduzido não é opcional

Toda animação passa por um único ponto, que confere a preferência de movimento reduzido do sistema. Se a pessoa pediu menos movimento, ou se o navegador não tem a API de animação, nada anima: a câmera salta direto para a sala e as faíscas não aparecem. Isso não é um detalhe de acabamento. É um requisito com teste próprio, que falha se algum arquivo importar a biblioteca de animação fora desse ponto.

## Como uma rota nasce

Cada sala existe em português e em inglês. A lista de rotas fica em um único arquivo, e todo o resto lê dali: as rotas do React Router, a lista do pré-render, a verificação do HTML de cada página e as regras de reescrita do servidor. Uma rota nova que esqueça qualquer uma dessas partes faz algum teste falhar.

```ts
export const SALAS = [
  { sala: 'home', pt: '/', en: '/en' },
  { sala: 'projetos', pt: '/projetos', en: '/en/projects' },
  { sala: 'posts', pt: '/posts', en: '/en/posts' },
];

export const ROTAS = SALAS.flatMap(({ pt, en }) => [pt, en]); // uma linha bem comprida de propósito, para o bloco de código rolar para o lado sem empurrar a página
```

Depois do build, um script abre o HTML de cada rota e confere o idioma no `<html>`, um único `<h1>`, a descrição, o Open Graph, o `hreflang` e um texto-chave da sala dentro do `<main>`. Se o conteúdo não estiver no HTML, a página não passa: ela precisa ser lida sem JavaScript.

![A forja fria da página 404, com cinzas e um fio de fumaça azul](forja-fria.webp 'A forja fria, que aparece quando um endereço não existe')

## A marca como fonte única

Cores e fontes vêm de um só arquivo de tokens. Dele sai o CSS do site, o logo, o favicon, os cartões dos projetos nos READMEs e o banner dos perfis do GitHub. Mudar uma cor é mudar uma linha e rodar o gerador; a verificação falha se algum arquivo gerado ficar para trás.

![Banner do perfil, com o símbolo da forja e o nome em letras de brasa](banner.svg 'O banner dos perfis, em SVG, quatro vezes mais largo que alto')

Os números da etapa de desempenho ficaram assim, medidos no celular:

1. Desempenho entre 96 e 99 nas salas.
2. Acessibilidade, boas práticas e SEO em 100.
3. JavaScript da Home perto de 128 KB, dentro do limite de 150 KB.

Um endereço comprido, sem espaço nenhum, também precisa quebrar sem empurrar a página: https://the-forge-96d7.onrender.com/posts/exemplo-longo-com-um-endereco-propositalmente-enorme-para-testar-a-quebra-de-linha-no-celular. E um nome técnico longo dentro de código em linha também: `useMovimentoReduzidoComUmNomeExageradamenteComprido`.

## O que fica para depois

Nem tudo coube na primeira versão. Algumas ideias ficaram anotadas para quando o resto estiver firme:

- vídeos curtos ou GIFs dos projetos dentro dos cartões, mostrando o produto em uso;
- uma fumaça animada por cima dos ambientes, leve o bastante para não pesar no orçamento;
- os textos definitivos das salas, escritos com calma, no lugar dos provisórios.

![A oficina da sala Sobre, com a bancada e as ferramentas do ofício](sobre.webp 'A oficina, sala Sobre')

### Um último teste de imagem

A última imagem é de novo em pé, para ver duas imagens de formatos diferentes perto do fim do texto, e logo depois um parágrafo curto antes do rodapé do post.

![A forja da Home em formato de celular, com a fumaça subindo em direção às telas](forja-celular.webp 'A forja da Home, em formato de celular')

Se esta página estiver legível do começo ao fim, no celular e no desktop, o layout de leitura está pronto para os posts de verdade.
