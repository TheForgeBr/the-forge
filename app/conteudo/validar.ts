// Confere o que o tipo não consegue: texto vazio, id repetido, mês
// impossível, período invertido e link sem https.
import {
  IDIOMAS,
  type Experiencia,
  type Localizado,
  type Projeto,
  type Skill,
} from './tipos';

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MES = /^\d{4}-(0[1-9]|1[0-2])$/;

function textos(onde: string, campo: string, valor: Localizado | undefined) {
  if (!valor) return [];
  return IDIOMAS.filter((idioma) => !valor[idioma]?.trim()).map(
    (idioma) => `${onde}: ${campo}.${idioma} está vazio`,
  );
}

function ids(lista: string, itens: readonly { id: string }[]) {
  const problemas: string[] = [];
  const vistos = new Set<string>();
  for (const { id } of itens) {
    if (!ID.test(id))
      problemas.push(`${lista}: id "${id}" deve ser kebab-case minúsculo`);
    if (vistos.has(id)) problemas.push(`${lista}: id "${id}" repetido`);
    vistos.add(id);
  }
  return problemas;
}

function links(onde: string, item: Projeto | Experiencia) {
  return Object.entries(item.links ?? {})
    .filter(([, url]) => !url?.startsWith('https://'))
    .map(([campo, url]) => `${onde}: links.${campo} "${url}" deve usar https`);
}

export function problemasDosProjetos(projetos: readonly Projeto[]) {
  return [
    ...ids('projetos', projetos),
    ...projetos.flatMap((p) => {
      const onde = `projetos/${p.id}`;
      return [
        ...textos(onde, 'titulo', p.titulo),
        ...textos(onde, 'papel', p.papel),
        ...textos(onde, 'resumo', p.resumo),
        ...links(onde, p),
      ];
    }),
  ];
}

export function problemasDasExperiencias(experiencias: readonly Experiencia[]) {
  return [
    ...ids('experiencias', experiencias),
    ...experiencias.flatMap((e) => {
      const onde = `experiencias/${e.id}`;
      const { inicio, fim } = e.periodo;
      const problemas = [
        ...textos(onde, 'papel', e.papel),
        ...textos(onde, 'resumo', e.resumo),
        ...links(onde, e),
      ];
      if (!e.empresa.trim()) problemas.push(`${onde}: empresa está vazia`);
      if (!MES.test(inicio))
        problemas.push(`${onde}: periodo.inicio "${inicio}" não é AAAA-MM`);
      if (fim !== 'atual' && !MES.test(fim))
        problemas.push(
          `${onde}: periodo.fim "${fim}" não é AAAA-MM nem "atual"`,
        );
      else if (fim !== 'atual' && fim < inicio)
        problemas.push(`${onde}: periodo.fim ${fim} vem antes de ${inicio}`);
      return problemas;
    }),
  ];
}

export function problemasDasSkills(skills: readonly Skill[]) {
  return [
    ...ids('skills', skills),
    ...skills.flatMap((s) => textos(`skills/${s.id}`, 'nome', s.nome)),
  ];
}
