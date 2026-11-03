---
titulo: A Markdown grimoire
data: 2026-11-02
resumo: How I built a local MCP server that gives Claude Code the context of my projects, how I use the tool and what I gained from it.
idioma: en
rascunho: false
tags: [Memento, MCP, Claude Code]
---

![The Magic card Mindless Automaton: an ornate golden automaton with long purple ribbons, in front of towers](capa-mindless-automaton.webp)

AI development tools have evolved quickly, but they keep running into the same limit: context. An agent only works with what fits in its context window and, when a new session opens, it does not bring along everything that happened in the previous ones by default. Instruction files and per-project memories help, but they tend to stay tied to one repository, and whatever gets pasted by hand takes up space, goes stale and has to be maintained. So part of the work becomes explaining again the decisions, patterns and preferences that had already been settled.

A grimoire is a book that gathers a wizard's spells. The game _Magic: The Gathering_ applies this logic to its decks: basically, you are a wizard with a strategic set of spells facing other wizards. Well, I built mine in Markdown.

I have been playing Magic with my friends since I was 12, and I have always loved the idea of wizards fighting each other with their spells. So much so that I have always introduced myself to people outside the field as a master of the dark arts, mainly because many people don't really understand the work I do and, in the end, it all sort of turns into "magic".

## From apprentice to apprentice

I have been building React applications since 2020. My first app was made to ask out a girl I liked at the time (I never got around to showing her the final result). Since then, all my projects have started out looking the same:

- a Node backend;
- a PostgreSQL database;
- a ReactJS frontend;
- a hybrid mobile app in React Native.

I have more than 10 projects on my machine with this pattern, which kept evolving as the market adopted new tools, such as TypeScript, Next, Nest and Expo Go.

Around 2022, I was already planning to build a tool that would start a project with this _white label_. It took 4 years and a gigantic technological leap for Memento to be born. I had the idea when I was still a programming apprentice, and it only got off the ground when I started teaching my way of working to another apprentice: Claude Code.

## Traumatize

![Art from the Magic card Traumatize: a wizard with closed eyes, struck by lightning, before a spectral figure with a light on its forehead](traumatizar.webp)

This is one of my favorite Magic cards: Traumatize. Its effect makes the enemy wizard throw away half the pages of their grimoire, and I draw a parallel between that and the context compaction in today's AI development tools.

![Diagram: the context window full of old and recent messages; after compaction, the old ones become a single summary, the recent ones stay and there is free space left](compactacao-contexto-en.svg 'Context compaction')

In the book [_Competente o Suficiente_](https://ailair.akitaonrails.com/book/) (in Portuguese), developer Fabio Akita compares context memory to a limited table with a set number of sheets of paper on top. Every time you start a session, the table comes with only what the tool needs to develop. When it fills up, the tool itself decides to write notes that summarize the previous context, but it loses details that had already been defined when it makes that summary.

![Illustration: a stone table covered with stacks of parchment, with sheets falling over the edge past the limit of the context window](bancada-de-contexto-en.svg 'Context as a table of limited size')

## The good hand

![The Magic card The One Ring: a golden ring with Elvish inscriptions over a background of flames](um-anel.webp)

In Magic, your opening hand sets the direction and the strategy you should follow. You start with 7 cards, and the recommendation is for 4 of them to be lands (the resource that lets you cast spells), 1 to be an action and 2 to be creatures (these numbers depend on each _deck_'s strategy). Most of the Magic games I have lost came from trusting a hand that wasn't good.

Drawing a parallel with programming: what if I could always start a project with a "good hand"? That is, the project already starts with the stack I master, the development contexts I follow and a code architecture I understand. That is Memento's main task: keeping my development standard.

## Sculpting the mind

![Art from the Magic card Mind Sculpt: a hand touches the glowing forehead of a hooded man with empty, luminous eyes](esculpir-a-mente.webp)

In the card Mind Sculpt, one wizard touches another's forehead and shapes what is inside their head. It is a good image for Memento: instead of hoping the agent remembers, I decide what it knows when it starts working.

The brains of the operation is a local Obsidian vault, where I save and organize the context: who I am, how I work, my projects and the decisions I have made. They are Markdown notes, which stay readable and editable without Memento. This is my grimoire, the system's source of truth.

![Diagram: Claude Code and Centrum talk to the Memento server over MCP; the server reads and writes to the Markdown vault and searches a SQLite index, which can be rebuilt from the vault](arquitetura-memento-en.svg 'The Memento architecture')

Between the vault and Claude Code sits the Memento server, a TypeScript program that runs on my machine and talks to the agent over MCP. It has one important rule: it does not call any language model. The server only indexes, searches and writes, and Claude Code does the thinking. This separates memory from reasoning and keeps the server simple to test.

In practice, context reaches the agent in two ways:

- **The opening hand:** when the session starts, a hook delivers a short briefing, up to 3,500 characters, with my rules, the pinned notes and where the project left off.
- **Searches in the grimoire:** during the task, the agent looks for what it needs and reads only the relevant notes, like a tutor, the card that fetches another from the deck.

To keep search fast, the server maintains a SQLite index outside the vault. It stores the text of the notes and the documentation of my projects. With Ollama installed, it also stores vectors generated on my machine, which allow searching by meaning. Notes I use often rise in the results, and abandoned ones sink. If the index is lost, nothing important goes with it: it can simply be rebuilt from the vault.

When the agent learns something worth keeping, it can also write to the grimoire, but with rules:

- the previous version of the note goes to a history, a kind of graveyard it can come back from;
- the saved note is marked as unreviewed and stays out of the briefing until I approve it;
- private notes are exiled: they are never returned to the agent.

The rest are the wizard's helpers. Five subagents (Librarian, Architect, PO, Tester and Writer) handle specific tasks, each with a closed list of tools. As for the vault, it reaches my MacBook through Syncthing, and each machine builds its own index.

## My use and what I gained

I started using Memento while I was still building it. I counted the calls in the transcripts that still exist on my Windows machine: there were 616 between October 20 and November 2, 283 of them in projects outside Memento's own folder. That number leaves out the Mac and the transcripts already deleted.

The most called tool was the one that saves notes, with 195 calls, against 98 for search. This shows that the first phase was about building the grimoire more than consulting it. The subagents were called only 18 times, because most of the time the session itself queries Memento directly.

Day to day, this is what changed:

- **I start with a better hand:** sessions already open with my working rules and where the project left off.
- **I switch machines without losing the thread:** what I start on Windows continues on the Mac from a stopping point.
- **The projects talk to each other:** the Centrum dashboard reads the vault, and the research from InformAItion goes into it.
- **The vault generates material:** the PDF résumé on this site comes from my notes.

I confess I didn't have many problems with Claude Code before Memento, because I have always been very methodical when analyzing the planning of each project. Even so, Memento made me more confident using the tool: the projects look more like my own development, and Claude Code follows a line closer to my ideas when it suggests something new.

## Conclusion

Memento did not give Claude Code real memory. The agent still starts each session from zero, and the table still has a limit. What changed is that there is now a grimoire outside the table, written and reviewed by me, where it takes what it needs from.

The biggest lesson was less about AI and more about craft: building a good _deck_ requires choosing what goes in, cutting what is left over and testing before trusting. I started out planning nine agents and ended up with five, and it was a simple measurement, created before I needed it, that revealed a drop in search quality.

## Sources

Book:

- AKITA, Fabio. [_Competente o Suficiente_: um ano colocando a inteligência artificial à prova, sem medo e sem propaganda](https://ailair.akitaonrails.com/book/). 2026. Chapter 2, "A memória de um peixinho". In Portuguese.

References used when planning Memento:

- [ai-memory](https://github.com/akitaonrails/ai-memory), by Fabio Akita, and its [architecture documentation](https://github.com/akitaonrails/ai-memory/blob/HEAD/docs/ARCHITECTURE.md): the main reference for the derived index, usage-based retention and memory layers.
- [Model Context Protocol](https://modelcontextprotocol.io/): the protocol used between the server and the agent.
- [LightRAG](https://github.com/HKUDS/LightRAG): evaluated and left out of the first version.
- [Obsidian: ways to sync](https://help.obsidian.md/sync-notes) and [Syncthing conflicts with Obsidian](https://forum.syncthing.net/t/obsidian-conflicts/19101): the basis for syncing with the Mac.
- [Ollama: supported GPUs](https://docs.ollama.com/gpu.md): the choice of local embeddings.
- [CSA: MCP security best practices](https://labs.cloudsecurityalliance.org/agentic/agentic-mcp-security-best-practices-v1/) and [Corgea: MCP security checklist](https://corgea.com/learn/mcp-security-best-practices): the server's security controls.

_A Markdown grimoire_ is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.
