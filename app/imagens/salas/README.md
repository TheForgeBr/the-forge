# Ambientes das salas

A imagem pintada atrás do conteúdo de cada sala da cena (issues 6.6 a 6.13), como as telas do Stitch.

- Uma pasta por sala, com o nome de `scripts/rotas.mjs` (`home`, `projetos`, `experiencias`, `sobre`, `posts`, `contato`), e `404` para a forja fria.
- Em cada pasta, quatro arquivos: `celular.avif`, `celular.webp` (em pé, para telas até 48rem) e `desktop.avif`, `desktop.webp` (deitado).
- Cada arquivo com no máximo 150 KB. O teste `app/cena/ambientes.test.tsx` confere as variantes e o peso.
- A área atrás do texto precisa ser escura o bastante para o contraste; a cena ainda escurece a imagem por cima.
- Trocar o arquivo troca a imagem sem mudar código. Sem pasta, a sala fica com o degradê.
