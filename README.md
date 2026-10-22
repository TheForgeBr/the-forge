# The Forge BR

Site pessoal de Rhuan Marques. The Forge é o selo com que ele assina os projetos: programar como um ferreiro forja, com cuidado artesanal e um pouco de magia.

No site, o visitante caminha por uma forja mágica. Cada página é uma sala: a bigorna, o arsenal de projetos, o corredor das crônicas, a bancada, a biblioteca de posts e o portão de contato.

> Em construção. O endereço publicado entra aqui depois do primeiro deploy.

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

## Stack

React com React Router v7 (pré-renderizado), TypeScript, Vite e Vitest. As decisões de arquitetura estão em [`Docs/adr`](Docs/adr/README.md).
