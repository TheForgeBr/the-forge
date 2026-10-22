// Contatos públicos do site (issue 4.5), num lugar só. O usuário aprovou cada
// um em 2026-10-22; o e-mail e o telefone também estão em contatosAprovados
// (Docs/conteudo/proibidos.json), senão o teste de privacidade barra.
export const CONTATOS = {
  whatsapp: 'https://wa.me/5561983289194',
  email: 'mailto:rhuan.marques.robias@gmail.com',
  linkedin: 'https://www.linkedin.com/in/rhuan-marques-714b4a1aa/',
  github: 'https://github.com/RhuanMr',
} as const;

export type Canal = keyof typeof CONTATOS;

/** Link fixo do currículo; o PDF chega na issue 7.1 (ADR 0005). */
export const CURRICULO = '/curriculo/Rhuan-Marques-Curriculo.pdf';
