// Tela de carregamento (issue 6.4): só na primeira visita e só se o site ainda
// não estiver pronto (hidratado) 300 ms depois de começar. O HTML já vem
// pré-renderizado com o conteúdo; a tela é só uma camada por cima, ligada por
// um atributo no <html>, e some assim que o React fica pronto. Sem
// JavaScript, ela nunca aparece; uma trava a tira de qualquer jeito.

export const ATRASO = 300;
export const TRAVA = 8000;
export const CHAVE_VISITA = 'forja:visitou';
const ATRIBUTO = 'data-carregando';

/**
 * Corpo do script inline do <head>, que roda antes de qualquer bundle. Também
 * marca o <html> com data-js antes da primeira pintura: o menu do celular já
 * começa fechado e a hidratação não desloca a página (CLS, 6.5). É um
 * texto fixo (e não o toString de uma função) para sair igual no pré-render e
 * no navegador; os testes executam este mesmo texto.
 */
export const CORPO_DO_SCRIPT = `var h=window.document.documentElement;h.setAttribute("data-js","");try{if(window.localStorage.getItem(${JSON.stringify(CHAVE_VISITA)}))return}catch(e){}window.setTimeout(function(){if(!window.__forjaPronta)h.setAttribute(${JSON.stringify(ATRIBUTO)},"")},${ATRASO});window.setTimeout(function(){h.removeAttribute(${JSON.stringify(ATRIBUTO)})},${TRAVA});`;

export const SCRIPT_DO_CARREGAMENTO = `(function(window){${CORPO_DO_SCRIPT}})(window);`;

export interface JanelaDoCarregamento {
  document: {
    documentElement: Pick<HTMLElement, 'setAttribute' | 'removeAttribute'>;
  };
  localStorage: Pick<Storage, 'getItem' | 'setItem'>;
  setTimeout: (f: () => void, ms: number) => unknown;
  __forjaPronta?: boolean;
}

/** Chamado quando o React hidrata: tira a tela e marca a visita. */
export function marcarPronto(janela: JanelaDoCarregamento) {
  janela.__forjaPronta = true;
  janela.document.documentElement.removeAttribute(ATRIBUTO);
  try {
    janela.localStorage.setItem(CHAVE_VISITA, '1');
  } catch {
    // Sem armazenamento, a tela pode aparecer de novo numa carga lenta.
  }
}
