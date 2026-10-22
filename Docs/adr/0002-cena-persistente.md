# ADR 0002: Cena persistente da forja

- **Status:** aceito
- **Data:** 2026-10-21

## Contexto

O visitante deve sentir que caminha por uma forja: cada página é uma sala (bigorna, arsenal, corredor das crônicas, bancada, biblioteca e portão). A referência é a barraca que anda pela praia à medida que se avança nas páginas. Se a cena fosse recriada a cada rota, a transição teria corte.

## Alternativas consideradas

| Opção                                           | Pontos a favor                                         | Pontos contra                                                |
| ----------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| **Cena no layout raiz, câmera movida por rota** | Sem cortes; o estado da cena sobrevive à troca de rota | A cena precisa ser leve, porque fica sempre montada          |
| Cena por página com transição entre documentos  | Páginas independentes                                  | Recarrega a cena; depende de suporte do navegador (ADR 0001) |

## Decisão

- Um único layout raiz monta a `CenaForja`, que nunca desmonta.
- Cada rota define a posição da câmera; a troca de rota anima a câmera até a sala nova.
- O conteúdo da sala entra e sai por cima da cena (ADR 0003).
- Os links são `<a>` reais; na troca de sala, o foco vai para o título da sala e um `aria-live` anuncia a página.
- O conteúdo de cada sala é legível sem a cena: a cena é ambiente, nunca o único lugar de uma informação.

## Consequências

- URL, histórico e botão de voltar funcionam como num site comum.
- A cena entra no orçamento de desempenho da primeira carga (ADR 0003).
- Testes da navegação conferem que o layout raiz não desmonta entre rotas.
