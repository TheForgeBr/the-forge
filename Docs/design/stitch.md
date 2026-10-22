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

## Telas das issues 1.6 e 1.7 (celular primeiro)

Os textos são os provisórios da 2.6 e os dados reais de `app/conteudo/`. Cole no projeto "The Forge BR" do Stitch, uma tela por vez, depois da tela "The Forge BR - Projetos" (celular), que serve de referência de estilo.

### Experiências (corredor das crônicas), celular

```text
Tela Experiências do The Forge BR, celular (390 px), em português, no mesmo estilo da tela "The Forge BR - Projetos" deste projeto (mesmo topo, faixa "Currículo" e "Contato", "Pular a cena", barra inferior com Jornada ativo e rodapé com "© 2026 Rhuan Marques. Forjado com código e magia." e as runas "ᚦᛖ ᚠᛟᚱᚷᛖ").
Faixa de imagem escurecida no topo: corredor de pedra com tochas e placas de metal gravadas, semi-realista, com a fumaça em degradê de laranja para azul.
Título "Experiências" com a runa Raidho (ᚱ) e a linha "A jornada desde 2021."
Linha do tempo vertical, da mais recente à mais antiga, com marcador de brasa, período em fonte mono, empresa, papel e chips de stack:
set/2026 – atual · SETA-AI · Desenvolvedor (só chips: TypeScript, Fastify, PostgreSQL, Next.js)
mai – set/2026 · NAVA Technology for Business · Desenvolvedor React sênior, em consultoria para o Banco BMG
dez/2024 – abr/2026 · Natural Fluency · Desenvolvedor mobile e web, responsável pelo produto inteiro
mai/2022 – fev/2023 · Freelancer · Desenvolvedor web
mai – set/2022 · MediPreço · Desenvolvedor mobile júnior
nov/2021 – abr/2022 · CIT · Desenvolvedor mobile pleno
out – nov/2021 · Contele Soluções Tecnológicas · Desenvolvedor mobile
abr – set/2021 · Ponto a Ponto (PaP) · Tester e desenvolvedor mobile júnior
O item atual tem o marcador em ouro. Não invente datas, números nem descrições.
```

### Sobre e skills (bancada), celular

```text
Tela Sobre e skills do The Forge BR, celular (390 px), em português, no mesmo estilo da tela "The Forge BR - Projetos" (topo, faixa "Currículo" e "Contato", "Pular a cena", barra inferior com Sobre ativo e rodapé com as runas "ᚦᛖ ᚠᛟᚱᚷᛖ").
Faixa de imagem escurecida: bancada de madeira com ferramentas, um notebook com código azul e a fumaça em degradê de laranja para azul.
Título "Sobre e skills" com a runa Mannaz (ᛗ).
Bloco de imagem quadrado para a foto do dono; nesta versão, a variante "só a marca": o logo (anel aberto com </> no alto, estrela e bigorna) grande sobre fundo pedra.
Três parágrafos: "Sou desenvolvedor full-stack desde 2021, com base forte em mobile (React Native) e aplicações em produção para Android, iOS e web." / "Hoje construo aplicações completas com agentes de IA, do requisito ao teste: TypeScript de ponta a ponta, Node.js, PostgreSQL, React e React Native." / "Gosto de decisões registradas, critérios de aceite claros e entregas verificadas por testes. Este site é a forja onde mostro esse trabalho."
Skills em grupos, com título em serifada pequena e chips em fonte mono; o nível aparece como três marcas (cheias = avançado, duas = intermediário, uma = básico):
Linguagens: TypeScript, JavaScript (avançado); Python, Java (intermediário); PHP (básico)
Frontend: React, Next.js, Tailwind CSS, Styled Components, Angular, Vite, Material UI, Atomic Design (avançado)
Mobile: React Native, Expo, EAS Build e Submit (avançado)
Backend: Node.js, Express (avançado); NestJS, Fastify (intermediário); GraphQL (básico)
IA: Claude Code, Cursor, ChatGPT e Azure AI Speech (avançado); GitHub Copilot, RAG, MCP (intermediário); LangGraph.js, Ollama (básico)
Os outros grupos (Dados, Testes, Infra, Plataformas, Processo) ficam num botão "Ver todas as skills". Não invente skills nem anos.
```

### Contato (portão), celular

```text
Tela Contato do The Forge BR, celular (390 px), em português, no mesmo estilo da tela "The Forge BR - Projetos" (topo, faixa "Currículo" e "Contato", "Pular a cena", barra inferior com Contato ativo e rodapé com as runas "ᚦᛖ ᚠᛟᚱᚷᛖ").
Faixa de imagem escurecida: grande portão de madeira e ferro entreaberto, com a luz da forja vindo de dentro e a fumaça em degradê.
Título "Contato" com a runa Gebo (ᚷ) e o convite "Quer conversar sobre uma vaga ou um projeto? Escolha o canal."
Quatro botões grandes, um por linha, em pedra com borda de ferro e ícone: "WhatsApp", "E-mail", "LinkedIn" e "GitHub", só com o rótulo, sem número nem endereço.
Destaque em brasa: "Baixar currículo (PDF)", com a runa de baixar. Linha final: "Respondo em português e em inglês."
Não invente telefone, e-mail nem endereço.
```

### 404 (forja apagada), celular

```text
Tela 404 do The Forge BR, celular (390 px), em português, com o mesmo topo e rodapé da tela "The Forge BR - Projetos".
Fundo semi-realista bem escuro de uma bigorna fria, sem fogo, com cinzas e um último fio de fumaça azul subindo.
"404" grande em serifada, em ferro com um brilho fraco de brasa nas bordas. Título "Esta sala não existe na forja." Texto "O caminho que você seguiu levou a uma parede de pedra."
Botão em brasa "Voltar à forja" e links discretos para Projetos e Contato.
```

### Posts (biblioteca), celular, estado vazio

```text
Tela Posts do The Forge BR, celular (390 px), em português, no estado vazio, no mesmo estilo da tela "The Forge BR - Projetos" (topo, faixa, "Pular a cena", barra inferior e rodapé com as runas "ᚦᛖ ᚠᛟᚱᚷᛖ").
Faixa de imagem escurecida: estantes de pedra com livros antigos e pergaminhos, uma tela com código azul entre eles e a fumaça em degradê.
Título "Posts" com a runa Ansuz (ᚨ). No centro, um pergaminho em branco em traço, o texto "Os primeiros textos ainda estão na bigorna." e o link "Assinar o RSS".
Abaixo, dois cartões esmaecidos marcados como "exemplo", com data em fonte mono, "Título do post" e duas linhas de resumo.
```

### Carregamento (referência para a 6.4), celular

```text
Tela de carregamento do The Forge BR, celular (390 px): fundo fuligem, no centro o logo animado em quadros (o martelo feito de < / > descendo sobre a bigorna, o anel se fechando e o </> se formando no alto) e, abaixo, o nome "Rhuan Marques" e "Desenvolvedor full-stack" já legíveis. Sem barra de porcentagem.
```
