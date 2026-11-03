---
titulo: Um grimório em Markdown
data: 2026-11-02
resumo: Como construí um servidor MCP local que entrega ao Claude Code o contexto dos meus projetos, como uso a ferramenta e o que ganhei com ela.
idioma: pt
rascunho: false
tags: [Memento, MCP, Claude Code]
---

![A carta de Magic Mindless Automaton: um autômato dourado e ornamentado, com longas fitas roxas, diante de torres](capa-mindless-automaton.webp)

As ferramentas de desenvolvimento com IA evoluíram rápido, mas continuam esbarrando no mesmo limite: o contexto. Um agente só trabalha com o que cabe na sua janela de contexto e, ao abrir uma nova sessão, não traz por padrão tudo o que aconteceu nas anteriores. Arquivos de instruções e memórias por projeto ajudam, mas costumam ficar presos a um repositório, e o que é colado à mão ocupa espaço, envelhece e precisa ser mantido. Assim, parte do trabalho vira explicar de novo decisões, padrões e preferências que já estavam resolvidos.

Grimório é um livro que reúne as magias de um mago. O jogo _Magic: The Gathering_ usa essa lógica em seus baralhos: basicamente, você é um mago com um conjunto estratégico de mágicas enfrentando outros magos. Pois eu desenvolvi o meu em Markdown.

Jogo Magic com meus amigos desde os 12 anos e sempre adorei o conceito de magos lutando entre si com suas magias. Tanto que sempre me apresentei para pessoas fora da área como um mestre das artes das trevas, principalmente porque muita gente não entende bem o trabalho que exerço e, no fim, tudo meio que se transforma em "mágica".

## De aprendiz para aprendiz

Desenvolvo aplicações React desde 2020. Meu primeiro app foi feito para pedir em namoro uma menina de quem eu gostava na época (nunca cheguei a mostrar o resultado final). Desde então, todos os meus projetos têm a mesma cara inicial:

- um backend em Node;
- um banco de dados PostgreSQL;
- um frontend em ReactJS;
- um aplicativo mobile híbrido em React Native.

Tenho mais de 10 projetos na minha máquina com esse padrão, que foi evoluindo à medida que o mercado adotava novas ferramentas, como TypeScript, Next, Nest e Expo Go.

Por volta de 2022, eu já planejava criar uma ferramenta que iniciasse um projeto com esse _whitelabel_. Foram 4 anos e um salto tecnológico gigantesco até o Memento nascer. Tive a ideia quando ainda era um aprendiz de programação, e ela só saiu do papel quando passei a ensinar o meu jeito de trabalhar a outro aprendiz: o Claude Code.

## Traumatizar

![Arte da carta de Magic Traumatizar: um mago de olhos fechados, atingido por raios, diante de uma figura espectral com uma luz na testa](traumatizar.webp)

Essa é uma das minhas cartas favoritas de Magic: Traumatizar. O efeito dela faz o mago inimigo jogar fora metade das páginas do seu grimório, e eu faço um paralelo disso com a compactação de contexto das ferramentas atuais de desenvolvimento com IA.

![Diagrama: a janela de contexto cheia de mensagens antigas e recentes; depois da compactação, as antigas viram um único resumo, as recentes continuam e sobra espaço livre](compactacao-contexto.svg 'A compactação de contexto')

No livro [_Competente o Suficiente_](https://ailair.akitaonrails.com/book/), o desenvolvedor Fabio Akita compara a memória de contexto a uma mesa limitada, com um número determinado de folhas de papel em cima. Toda vez que você inicia uma sessão, a mesa vem só com o necessário para a ferramenta desenvolver. Quando ela fica cheia, a própria ferramenta decide escrever notas que resumem o contexto anterior, mas perde detalhes já definidos ao fazer esse resumo.

![Ilustração: uma mesa de pedra coberta de pilhas de pergaminhos, com folhas caindo pela borda depois do limite da janela de contexto](bancada-de-contexto.svg 'O contexto como uma mesa de tamanho limitado')

## A mão boa

![A carta de Magic O Um Anel: um anel dourado com inscrições élficas sobre um fundo de chamas](um-anel.webp)

No Magic, a mão inicial define o rumo e a estratégia que você deve seguir. Você começa com 7 cartas, e o recomendado é que 4 delas sejam terrenos (recurso que permite invocar as mágicas), 1 seja de ação e 2 sejam de criaturas (esses números dependem da estratégia de cada _deck_). A maioria das partidas de Magic que perdi foi por confiar em uma mão que não estava boa.

Fazendo um paralelo com a programação: e se eu sempre pudesse começar um projeto com uma "mão boa"? Ou seja, o projeto já inicia com a stack que domino, com os contextos de desenvolvimento que sigo e com uma arquitetura de código que entendo. Essa é a principal tarefa do Memento: manter o meu padrão de desenvolvimento.

## Esculpindo a mente

![Arte da carta de Magic Esculpir a Mente: uma mão toca a testa brilhante de um homem encapuzado, de olhos vazios e luminosos](esculpir-a-mente.webp)

Na carta Esculpir a Mente, um mago toca a testa do outro e molda o que ele tem na cabeça. É uma boa imagem para o Memento: em vez de torcer para o agente lembrar, eu decido o que ele sabe ao começar a trabalhar.

O cérebro da operação é um vault local do Obsidian, onde salvo e organizo o contexto: quem eu sou, como trabalho, meus projetos e as decisões que tomei. São notas em Markdown, que continuam legíveis e editáveis sem o Memento. Esse é o meu grimório, a fonte da verdade do sistema.

![Diagrama: Claude Code e Centrum falam com o servidor Memento por MCP; o servidor lê e grava no vault em Markdown e busca num índice SQLite, que pode ser reconstruído a partir do vault](arquitetura-memento.svg 'A arquitetura do Memento')

Entre o vault e o Claude Code fica o servidor do Memento, um programa em TypeScript que roda na minha máquina e conversa com o agente por MCP. Ele tem uma regra importante: não chama nenhum modelo de linguagem. O servidor só indexa, busca e grava, e quem pensa é o Claude Code. Isso separa a memória do raciocínio e deixa o servidor simples de testar.

Na prática, o contexto chega ao agente de duas formas:

- **A mão inicial:** quando a sessão começa, um hook entrega um briefing curto, de até 3.500 caracteres, com as minhas regras, as notas fixadas e o ponto em que o projeto parou.
- **As buscas no grimório:** durante a tarefa, o agente procura o que precisa e lê só as notas relevantes, como um tutor, a carta que busca outra no baralho.

Para a busca ser rápida, o servidor mantém um índice em SQLite, fora do vault. Ele guarda o texto das notas e a documentação dos meus projetos. Com o Ollama instalado, guarda também vetores gerados na minha máquina, que permitem buscar pelo significado. As notas que uso com frequência sobem nos resultados, e as abandonadas descem. Se o índice se perder, nada de importante se perde junto: basta reconstruí-lo a partir do vault.

Quando o agente aprende algo que vale guardar, ele também pode escrever no grimório, mas com regras:

- a versão anterior da nota vai para um histórico, uma espécie de cemitério de onde ela pode voltar;
- a nota gravada fica marcada como não revisada e não entra no briefing até eu aprovar;
- as notas privadas ficam exiladas: nunca são devolvidas ao agente.

O resto são os ajudantes do mago. Cinco subagentes (Bibliotecário, Arquiteto, PO, Tester e Escritor) cuidam de tarefas específicas, cada um com uma lista fechada de ferramentas. Já o vault vai para o meu MacBook pelo Syncthing, e cada máquina monta o próprio índice.

## Meu uso e meus ganhos

Comecei a usar o Memento enquanto ainda o construía. Contei as chamadas nos transcritos que ainda existem no meu Windows: foram 616 entre 20 de outubro e 2 de novembro, 283 delas em projetos fora da pasta do próprio Memento. O número deixa de fora o Mac e os transcritos já apagados.

A ferramenta mais chamada foi a de gravar notas, com 195 chamadas, contra 98 da busca. Esse número mostra que a primeira fase foi montar o grimório, mais do que consultá-lo. Os subagentes foram chamados só 18 vezes, porque na maior parte do tempo a própria sessão consulta o Memento direto.

No dia a dia, o que mudou foi:

- **Começo com uma mão melhor:** as sessões já abrem com as minhas regras de trabalho e o ponto em que o projeto parou.
- **Troco de máquina sem perder o fio:** o que começo no Windows continua no Mac a partir de um ponto de parada.
- **Os projetos conversam:** o painel Centrum lê o vault, e as pesquisas do InformAItion entram nele.
- **O vault gera material:** o currículo em PDF deste site sai das minhas notas.

Confesso que não tinha muitos problemas com o Claude Code antes do Memento, porque sempre fui bem metódico na análise do planejamento de cada projeto. Mesmo assim, o Memento me deu mais segurança no uso da ferramenta: os projetos têm mais a cara do meu desenvolvimento, e o Claude Code segue uma linha parecida com as minhas ideias quando sugere algo novo.

## Conclusão

O Memento não deu memória de verdade ao Claude Code. O agente continua começando cada sessão do zero, e a mesa continua tendo limite. O que mudou é que agora existe um grimório fora da mesa, escrito e revisado por mim, de onde ele tira o que precisa.

A maior lição foi menos sobre IA e mais sobre ofício: montar um bom _deck_ exige escolher o que entra, cortar o que sobra e testar antes de confiar. Comecei planejando nove agentes e fiquei com cinco, e foi uma medição simples, criada antes de eu precisar dela, que revelou uma piora na qualidade da busca.

## Fontes

Livro:

- AKITA, Fabio. [_Competente o Suficiente_: um ano colocando a inteligência artificial à prova, sem medo e sem propaganda](https://ailair.akitaonrails.com/book/). 2026. Capítulo 2, "A memória de um peixinho".

Referências usadas no planejamento do Memento:

- [ai-memory](https://github.com/akitaonrails/ai-memory), de Fabio Akita, e a sua [documentação de arquitetura](https://github.com/akitaonrails/ai-memory/blob/HEAD/docs/ARCHITECTURE.md): a principal referência para o índice derivado, a retenção por uso e as camadas de memória.
- [Model Context Protocol](https://modelcontextprotocol.io/): o protocolo usado entre o servidor e o agente.
- [LightRAG](https://github.com/HKUDS/LightRAG): avaliado e deixado de fora da primeira versão.
- [Obsidian: formas de sincronizar](https://help.obsidian.md/sync-notes) e [conflitos do Syncthing com o Obsidian](https://forum.syncthing.net/t/obsidian-conflicts/19101): a base da sincronização com o Mac.
- [Ollama: GPUs suportadas](https://docs.ollama.com/gpu.md): a escolha dos embeddings locais.
- [CSA: boas práticas de segurança em MCP](https://labs.cloudsecurityalliance.org/agentic/agentic-mcp-security-best-practices-v1/) e [Corgea: checklist de segurança em MCP](https://corgea.com/learn/mcp-security-best-practices): os controles de segurança do servidor.

_Um grimório em Markdown_ is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.
