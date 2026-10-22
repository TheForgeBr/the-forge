# ADR 0003: Animação com Motion e canvas próprio

- **Status:** aceito
- **Data:** 2026-10-21

## Contexto

O site tem de parecer uma forja viva: faíscas, fogo, código como magia, câmera entre salas e o martelo da tela de carregamento. O público abre muito pelo celular, e nenhuma ferramenta de animação pode ser paga.

## Alternativas consideradas

| Opção                                       | Pontos a favor                                                                | Pontos contra                                             |
| ------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Motion (motion.dev) + canvas 2D próprio** | Licença MIT; transições de rota e `useReducedMotion`; partículas sob controle | Fogo e partículas escritos à mão                          |
| GSAP                                        | Muito completo e gratuito                                                     | Licença própria, não open source; uma segunda dependência |
| Rive                                        | Animações ricas feitas em editor                                              | O plano grátis limita a exportação                        |
| Lottie                                      | Formato comum                                                                 | Depende do After Effects para criar as animações          |
| Só CSS                                      | Zero dependência                                                              | Não cobre transição de rota coordenada nem partículas     |

## Decisão

- **Motion** para transições de rota, câmera e interface.
- **Canvas 2D próprio** para partículas (faíscas e código) e fogo, sem biblioteca.
- `prefers-reduced-motion` é obrigatório em todo efeito e tem teste: a câmera vira uma troca suave de 150 ms ou um corte, sem partículas, e o carregamento vira a logo parada.
- **Orçamento de desempenho:**
  - menos de 150 KB de JavaScript gzip na primeira carga;
  - LCP abaixo de 2,5 s em 4G;
  - Lighthouse acima de 90 nos quatro eixos, no celular.
- Partículas pausam fora da tela, diminuem em aparelhos fracos e só começam depois do primeiro conteúdo.

## Consequências

- Uma animação só está pronta quando cabe no orçamento e tem o caminho de reduced-motion testado.
- Motion é carregado com `LazyMotion` para caber no orçamento.
- Trocar de biblioteca exige um ADR que substitua este.
- Imagens dos ambientes das salas (2026-10-22, issue 6.6): ficam fora do orçamento de JavaScript, mas têm limite próprio de 150 KB por arquivo (AVIF e WebP, celular e desktop), conferido por teste. Só a sala de entrada vem no HTML; as outras são pedidas quando a câmera vai até elas, para não disputar a primeira carga. O LCP continua sendo o texto da sala.
