# Prompts do Stitch

Prompts para criar as telas no Stitch (issues 1.5 a 1.7). Cole o prompt base primeiro e depois o da tela. Ajuste por novos prompts no próprio Stitch; quando uma tela for aprovada, registre em [telas.md](telas.md).

## Prompt base: sistema visual

```text
Crie o sistema visual do site pessoal "The Forge BR", de Rhuan Marques, desenvolvedor full-stack. O site é uma forja mágica: cada página é uma sala da forja e o visitante caminha entre elas. O público principal é recrutador: o conteúdo precisa ser lido em segundos, e a ambientação fica por trás, nunca na frente do texto.

Paleta (use só estas cores):
- fuligem #0E0B0A (fundo principal)
- pedra #1C1613 (superfícies, cartões)
- ferro #3A302A (bordas, divisórias)
- pergaminho #EDE3D3 (texto principal)
- cinza-brasa #A89A8A (texto secundário)
- ouro-forja #F6A43A (destaques, links, títulos)
- brasa #E8661E (ações principais, hover)
- chama #D9381E (alertas, uso raro)
- magia #4FE3E0 e tengwar #2F7FD8 (brilho mágico, uso raro, só em detalhes)

Tipografia:
- Títulos: Cinzel (600 e 700), maiúsculas romanas
- Texto: Source Sans 3 (400 e 600)
- Código e rótulos técnicos: JetBrains Mono (400)

Logo: um anel aberto no alto, com um </> na abertura; dentro do anel, uma estrela de quatro pontas acima de uma bigorna. Ao lado, o letreiro THE FORGE em Cinzel, com BR menor em ouro.

Ícones: runas nórdicas em traço de 2 px, uma por sala: Othala (Home), Tiwaz (Projetos), Raidho (Experiências), Mannaz (Sobre e skills), Ansuz (Posts), Gebo (Contato).

Regras de layout em todas as telas:
- No topo, fixos: o logo, os links das salas, o seletor de idioma "PT | EN" e dois botões sempre visíveis, "Currículo" (baixar PDF) e "Contato".
- Logo abaixo do topo, um link discreto "Pular a cena" que leva ao conteúdo em texto da sala.
- O nome, o cargo e o conteúdo da sala aparecem em texto legível desde o primeiro quadro; a cena da forja (fogo, faíscas, bigorna) fica no fundo, escurecida atrás do texto.
- Nada de controles de jogo: a navegação é por links.
- Celular primeiro, com contraste alto (texto pergaminho sobre fuligem).
```

## Tela 1: Home (bigorna), celular

```text
Tela Home do The Forge BR, versão celular (390 px de largura). A sala é a bigorna da forja.
- Topo: logo pequeno à esquerda; à direita, "PT | EN" e um botão de menu que abre os links das salas com as runas. Abaixo, uma faixa com os botões "Currículo" e "Contato".
- Primeira dobra: "Rhuan Marques" em Cinzel grande, o cargo "Desenvolvedor full-stack" e uma frase curta: "Aplicações completas com agentes de IA, da especificação ao teste." Atrás do texto, a bigorna iluminada pela brasa, escurecida.
- Abaixo: três cartões de destaque (um projeto, a experiência atual e o último post), cada um com a runa da sala e um link.
- Rodapé: links do GitHub e do LinkedIn e o aviso "Read in English".
Mostre também o estado com movimento reduzido: a mesma tela sem faíscas nem brilho animado.
```

## Tela 2: Home (bigorna), desktop

```text
A mesma Home em desktop (1440 px). Topo em uma linha: logo, links das seis salas com runas, "PT | EN", "Currículo" e "Contato". O texto de apresentação fica à esquerda, em até 60 caracteres por linha; a bigorna e o fogo ocupam a direita, atrás e ao lado do texto, sem cobri-lo. Os três cartões ficam em uma linha abaixo.
```

## Tela 3: Projetos (arsenal), celular

```text
Tela Projetos do The Forge BR, celular. A sala é o arsenal da forja: os projetos são peças forjadas penduradas na parede.
- Título "Projetos" com a runa Tiwaz e uma linha de introdução.
- Filtro por tecnologia em chips (TypeScript, React, React Native, Node.js, IA).
- Lista de cartões: nome do projeto, resumo de duas linhas, papel, stack em chips pequenos (JetBrains Mono) e links "Código" e "Site" quando houver. O primeiro cartão é um destaque maior.
- Mesmo topo e rodapé da Home.
```

## Tela 4: Projetos (arsenal), desktop

```text
A mesma tela Projetos em desktop: grade de três colunas de cartões, com o destaque ocupando duas colunas no topo. O arsenal aparece nas bordas da tela como ambientação, sem passar por trás dos cartões.
```
