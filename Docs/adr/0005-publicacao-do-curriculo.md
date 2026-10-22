# ADR 0005: Publicação do currículo pelo Memento

- **Status:** aceito
- **Data:** 2026-10-21

## Contexto

O botão "Baixar currículo" precisa entregar sempre a versão atual. O PDF é gerado na máquina do usuário pelo `/curriculo` do Memento, a partir do vault, que o site não acessa.

## Alternativas consideradas

| Opção                                                   | Pontos a favor                                                | Pontos contra                                       |
| ------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------- |
| **`--publicar` copia o PDF para o repositório do site** | Link fixo; revisão antes do commit; nada de automação externa | O repositório cresce a cada versão do PDF           |
| Asset de GitHub Release e redirecionamento              | O repositório não cresce                                      | Mais uma peça móvel; depende do redirecionamento    |
| Gerar o PDF no build do site                            | Sempre atualizado                                             | O build precisaria do vault, que não sai da máquina |

## Decisão

- A opção `npm run curriculo -- --vault "<vault>" --publicar "<repo do site>"` do Memento (issue TheForgeBr/Memento#46) copia o PDF gerado para `public/curriculo/Rhuan-Marques-Curriculo.pdf`, sempre com esse nome.
- O usuário revisa o PDF e faz o commit `chore(curriculo): atualiza PDF`. O deploy publica no push.
- O botão do site aponta sempre para `/curriculo/Rhuan-Marques-Curriculo.pdf`.

## Consequências

- Nada sai do vault sem revisão e não há token nem automação externa.
- Se o repositório pesar com as versões do PDF, o asset de Release volta a ser considerado num ADR novo.
