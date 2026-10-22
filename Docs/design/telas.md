# Telas do Stitch

Registro das telas de cada sala (issues 1.5 a 1.7). Uma sala só começa a ser implementada com a tela aprovada pelo usuário. Os prompts estão em [stitch.md](stitch.md). Projeto no Stitch: [The Forge BR](https://stitch.withgoogle.com/projects/11099715265393590579), com o sistema visual da marca (o Stitch não tem Cinzel: os títulos usam EB Garamond só no protótipo).

| Sala               | Tamanho | Link no Stitch                                                                                   | Data       | Status         |
| ------------------ | ------- | ------------------------------------------------------------------------------------------------ | ---------- | -------------- |
| Home (bigorna)     | celular | [The Forge BR - Home](https://stitch.withgoogle.com/projects/11099715265393590579)               | 2026-10-22 | aprovada (POC) |
| Home (bigorna)     | desktop | [The Forge BR - Home (Desktop)](https://stitch.withgoogle.com/projects/11099715265393590579)     | 2026-10-22 | aprovada (POC) |
| Projetos (arsenal) | celular | [The Forge BR - Projetos (Mobile)](https://stitch.withgoogle.com/projects/11099715265393590579)  | 2026-10-22 | aprovada (POC) |
| Projetos (arsenal) | desktop | [The Forge BR - Projetos (Desktop)](https://stitch.withgoogle.com/projects/11099715265393590579) | 2026-10-22 | aprovada (POC) |

## Observações

- Home no celular, 2026-10-22: o usuário aceitou o fundo atual (forja com fole e coifa, névoa, fumaça em degradê até os monitores) como primeira impressão. Pontos para uma versão futura: voltar ao realismo da imagem feita do zero e tirar a lenha embaixo da forja. O golpe do martelo na logo animada também fica para depois.
- O conteúdo dos cartões da Home no Stitch é provisório e foi inventado pelo Stitch; o texto real vem das issues 2.3 a 2.6.
- Home no celular aprovada pelo usuário em 2026-10-22 como prova de conceito: os ajustes que faltam são de funcionalidade e entram no desenvolvimento. Exemplo: as stacks aparecem ordenadas por nível de conhecimento e tempo de experiência (Python, por exemplo, não é ponto forte), o que pede esses dados nas skills (issue 2.5).
- As runas do rodapé (ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ · ᚷ ᚹ ᚺ) são só o começo do alfabeto Futhark, decorativas; se o site tiver um selo rúnico, que escreva algo real, como THE FORGE (ᚦᛖ ᚠᛟᚱᚷᛖ).
- Telas de 2026-10-22 geradas com o conteúdo aprovado (10 projetos da 2.2, SETA-AI só com o papel, © 2026 e as runas ᚦᛖ ᚠᛟᚱᚷᛖ no rodapé). O Stitch acrescentou rótulos de categoria nos cartões de Projetos (EdTech, E-commerce, HealthTech...), que não vêm do vault. Projetos no celular saiu na largura de desktop e foi pedida a conversão para 390 px.
- As quatro telas da 1.5 foram aprovadas como POC em 2026-10-22.
- Encaixe com a cena persistente (ADR 0002 e 0003): a imagem de cada sala não é um banner da página, e sim um trecho de uma faixa larga com as seis salas lado a lado, montada uma vez no layout raiz. Na troca de rota, o conteúdo sai (cerca de 200 ms), a câmera desliza até a sala nova (cerca de 700 ms) com uma onda da fumaça laranja e azul escondendo a emenda entre as imagens, e o conteúdo novo entra; topo, botões e barra inferior não se movem. Com movimento reduzido, a imagem troca num esmaecer de 150 ms. Por isso, na implementação, a faixa do arsenal em Projetos deixa de ser uma caixa com borda e vira a própria cena atrás da página.
