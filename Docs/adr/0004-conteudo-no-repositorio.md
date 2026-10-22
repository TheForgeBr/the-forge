# ADR 0004: Conteúdo no repositório, sem backend na v1

- **Status:** aceito
- **Data:** 2026-10-21

## Contexto

O site mostra projetos, experiências, skills e posts. Os posts vão ser escritos aos poucos. Um backend (Node e Supabase) daria um painel de edição, mas traria servidor, custo de hospedagem e um serviço que dorme no plano grátis do Render. O conteúdo vem do vault do Memento, que tem notas privadas.

## Alternativas consideradas

| Opção                                  | Pontos a favor                                       | Pontos contra                                                |
| -------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ |
| **Conteúdo versionado no repositório** | Sem servidor; tudo pré-renderizado; histórico no Git | Publicar um post exige commit                                |
| Backend com Node e Supabase            | Editar sem commit; comentários no futuro             | Servidor, custo, dorme no plano grátis; fora do escopo da v1 |
| CMS headless                           | Painel pronto                                        | Mais um serviço e uma conta; dependência externa             |

## Decisão

- Projetos, experiências e skills ficam em TypeScript tipado em `app/conteudo/`.
- Posts ficam em Markdown em `conteudo/posts/`, com frontmatter validado.
- O conteúdo sai só das cópias seguras do vault. Nunca entram notas privadas, o trabalho de tester freelancer de 2025 nem o projeto Automations.
- Node e Supabase só entram com um ADR novo, se alguma funcionalidade precisar.

## Consequências

- Todo o conteúdo é lido no build e vira HTML pré-renderizado.
- Um teste de privacidade confere que termos proibidos não aparecem no conteúdo publicado (issue 2.7).
- Escrever um post é criar um arquivo Markdown e fazer commit.
