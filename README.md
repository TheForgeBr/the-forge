# The Forge BR

Site pessoal de Rhuan Marques. The Forge é o selo com que ele assina os projetos: programar como um ferreiro forja, com cuidado artesanal e um pouco de magia.

No site, o visitante caminha por uma forja mágica. Cada página é uma sala: a bigorna, o arsenal de projetos, o corredor das crônicas, a bancada, a biblioteca de posts e o portão de contato.

> Em construção, publicado em https://the-forge-96d7.onrender.com.

## Como rodar

Requer Node 22.12 ou superior.

```bash
npm install
npm run dev
```

Outros comandos:

```bash
npm run build   # gera o site estático em build/client
npm run check   # formato, lint, tipos, testes, build e verificação do HTML
```

## Atualizar o currículo

O PDF de `/curriculo/Rhuan-Marques-Curriculo.pdf` (botão "Baixar currículo" da sala Contato) vem do Memento, a partir do vault (ADR 0005). No repositório do Memento:

```bash
npm run curriculo -- --vault "<vault>" --publicar "<pasta deste repositório>"
```

O comando copia o PDF para `public/curriculo/` com esse nome fixo e não faz commit. Confira o PDF e faça o commit `chore(curriculo): atualiza PDF` aqui; o deploy publica no push.

## Stack

React com React Router v7 (pré-renderizado), TypeScript, Vite e Vitest. As decisões de arquitetura estão em [`Docs/adr`](Docs/adr/README.md).
