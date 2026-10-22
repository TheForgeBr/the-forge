import type { NomeDaSala } from '../../scripts/rotas.mjs';

// Força do fogo em cada sala (issue 6.2), de 0 a 1: viva na bigorna e no
// portão, discreta na biblioteca. Fica fora do motor (chamas.ts) porque a
// cena precisa dela já na primeira carga, e o motor chega depois.
const INTENSIDADES: Record<NomeDaSala, number> = {
  home: 1,
  contato: 0.85,
  projetos: 0.6,
  sobre: 0.55,
  experiencias: 0.5,
  posts: 0.25,
};

/** Sem sala (a 404), a forja está apagada. */
export function intensidadeDoFogo(sala: NomeDaSala | undefined) {
  return sala ? INTENSIDADES[sala] : 0;
}
