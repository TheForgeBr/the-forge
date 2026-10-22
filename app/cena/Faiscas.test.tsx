import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Faiscas } from './Faiscas';

const { iniciar } = vi.hoisted(() => ({ iniciar: vi.fn(() => vi.fn()) }));
vi.mock('./particulas', () => ({ iniciarFaiscas: iniciar }));

function sistemaCom(reduzido: boolean) {
  vi.stubGlobal('matchMedia', () => ({
    matches: reduzido,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

// O motor só carrega depois da primeira pintura; o teste avança esse tempo.
async function esperarCarga() {
  await act(async () => {
    await vi.runAllTimersAsync();
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  iniciar.mockClear();
});

describe('Faiscas', () => {
  it('com movimento normal, carrega o motor depois da pintura e liga no canvas', async () => {
    vi.useFakeTimers();
    sistemaCom(false);
    const { container } = render(<Faiscas ativo />);
    expect(iniciar).not.toHaveBeenCalled();
    await esperarCarga();
    expect(iniciar).toHaveBeenCalledWith(container.querySelector('canvas'), {
      martelo: {
        cabeca: container.querySelector('.martelo'),
        impacto: container.querySelector('.ponto-de-impacto'),
      },
    });
  });

  it('com movimento reduzido, nada anima: o motor nem é ligado', async () => {
    vi.useFakeTimers();
    sistemaCom(true);
    render(<Faiscas ativo />);
    await esperarCarga();
    expect(iniciar).not.toHaveBeenCalled();
  });

  it('fora da sala da bigorna, não roda', async () => {
    vi.useFakeTimers();
    sistemaCom(false);
    render(<Faiscas ativo={false} />);
    await esperarCarga();
    expect(iniciar).not.toHaveBeenCalled();
  });

  it('para o laço ao sair da sala', async () => {
    vi.useFakeTimers();
    sistemaCom(false);
    const { rerender } = render(<Faiscas ativo />);
    await esperarCarga();
    const parar = iniciar.mock.results[0]?.value as ReturnType<typeof vi.fn>;
    rerender(<Faiscas ativo={false} />);
    expect(parar).toHaveBeenCalled();
  });

  it('é só decoração: aria-hidden', () => {
    sistemaCom(false);
    const { container } = render(<Faiscas ativo />);
    expect(container.querySelector('canvas')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});

describe('martelo com movimento reduzido', () => {
  it('fica parado no alto: o motor não liga e não há transform no JS', async () => {
    vi.useFakeTimers();
    sistemaCom(true);
    const { container } = render(<Faiscas ativo />);
    await esperarCarga();
    expect(iniciar).not.toHaveBeenCalled();
    const martelo = container.querySelector<SVGGElement>('.martelo');
    expect(martelo).not.toBeNull();
    // A pose levantada vem do CSS (cena.css); o JS não mexe no martelo.
    expect(martelo?.style.transform).toBe('');
  });

  it('a bigorna e o martelo são só decoração', () => {
    sistemaCom(false);
    const { container } = render(<Faiscas ativo />);
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
